import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../db";
import { authenticate } from "../middleware/auth";
import { parseRecipeFromText } from "../services/ai";
import { sendPushNotification } from "../services/fcm";
import { RecipeCreateSchema } from "@recipebook/shared";

export async function recipeRoutes(fastify: FastifyInstance) {
  
  // POST /recipes/upload - AI recipe scanner parsing pipeline
  fastify.post("/upload", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { rawText, image } = request.body as { rawText?: string; image?: string };
      
      if (!rawText) {
        return reply.status(400).send({ error: "Missing parameter: rawText representing OCR scan output is required" });
      }

      const userId = request.user!.id;

      // 1. Run through AI Parsing & Validation Pipeline
      const aiResult = await parseRecipeFromText(rawText);

      // Auto-publish decision: Auto-publish if workable and confidence exceeds 0.80
      const autoApprove = aiResult.isWorkable && aiResult.confidenceScore >= 0.80;

      // 2. Save structured recipe profile in database
      const recipe = await prisma.recipe.create({
        data: {
          title: aiResult.title,
          description: aiResult.description,
          ingredients: aiResult.ingredients,
          instructions: aiResult.instructions,
          servings: aiResult.servings,
          prepTime: aiResult.prepTime,
          cookTime: aiResult.cookTime,
          difficulty: aiResult.difficulty,
          image: image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=80",
          authorId: userId,
          isPublic: true,
          isApproved: autoApprove,
          confidenceScore: aiResult.confidenceScore,
        },
      });

      // 3. Connect/create tags automatically
      if (aiResult.isWorkable && aiResult.confidenceScore > 0.4) {
        // Tag recipe automatically
        const tags = ["AI-Parsed", aiResult.difficulty.toLowerCase()];
        for (const tagName of tags) {
          const formattedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: {
              tags: {
                connectOrCreate: {
                  where: { name: formattedTagName },
                  create: { name: formattedTagName }
                }
              }
            }
          });
        }
      }

      // 4. Save review results inside AIReview audit log
      await prisma.aIReview.create({
        data: {
          recipeId: recipe.id,
          rawOcrText: rawText,
          confidenceScore: aiResult.confidenceScore,
          safetyReport: aiResult.safetyReport as any,
          isWorkable: aiResult.isWorkable,
          suggestions: aiResult.suggestions as any,
        }
      });

      // 5. Add to Moderation Queue if confidence score is low or flagged for review
      if (!autoApprove) {
        let reason = "AI confidence score below auto-publish threshold (80%).";
        if (aiResult.safetyReport.incompleteSteps) reason += " Potential incomplete steps identified.";
        if (aiResult.safetyReport.unsafeCooking) reason += " Unsafe cooking warning triggered.";
        
        await prisma.moderationQueue.create({
          data: {
            recipeId: recipe.id,
            status: "PENDING",
            confidenceScore: aiResult.confidenceScore,
            reason,
          }
        });

        // Trigger in-app notification to the user letting them know their recipe is in review queue
        await prisma.notification.create({
          data: {
            userId,
            title: "Recipe In Moderation",
            body: `Your scanned recipe "${recipe.title}" is being reviewed by our moderation squad before becoming community visible.`,
          }
        });
      } else {
        // Success auto-publish notifications
        await prisma.notification.create({
          data: {
            userId,
            title: "Recipe Auto-Published! 🎉",
            body: `Your scanned recipe "${recipe.title}" has been successfully parsed and published immediately with ${Math.round(recipe.confidenceScore * 100)}% accuracy.`,
          }
        });

        // Mock push notification trigger
        const userToken = await prisma.pushToken.findFirst({ where: { userId } });
        if (userToken) {
          await sendPushNotification(
            userToken.token,
            "Recipe Auto-Published! 🎉",
            `"${recipe.title}" is now visible on the public feed!`
          );
        }
      }

      return reply.status(201).send({
        message: autoApprove ? "Recipe auto-approved and published." : "Recipe flagged for moderator approval.",
        recipeId: recipe.id,
        autoApproved: autoApprove,
        aiMetrics: {
          confidenceScore: aiResult.confidenceScore,
          isWorkable: aiResult.isWorkable,
          safetyReport: aiResult.safetyReport
        }
      });

    } catch (error) {
      console.error("❌ Recipe upload error:", error);
      return reply.status(500).send({ error: "Failed to upload and process recipe." });
    }
  });

  // GET /recipes/feed - Paginated infinite-scroll community feed
  fastify.get("/feed", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page = "1", limit = "10", search = "", category = "", sort = "latest" } = request.query as {
        page?: string;
        limit?: string;
        search?: string;
        category?: string;
        sort?: "latest" | "trending";
      };

      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const skip = (parsedPage - 1) * parsedLimit;

      // Extract authorization header if present to check liked/saved items
      let userId: string | null = null;
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded = jwtVerifyHelper(token);
          if (decoded) userId = decoded.id;
        } catch {}
      }

      // Build filters
      const whereClause: any = {
        isApproved: true, // Only show fully approved recipes
        isPublic: true,
      };

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (category) {
        whereClause.tags = {
          some: {
            name: { equals: category, mode: "insensitive" }
          }
        };
      }

      // Query sorting
      const orderBy: any = {};
      if (sort === "trending") {
        orderBy.likes = { _count: "desc" };
      } else {
        orderBy.createdAt = "desc";
      }

      const [recipes, totalCount] = await Promise.all([
        prisma.recipe.findMany({
          where: whereClause,
          include: {
            author: { select: { name: true } },
            tags: { select: { name: true } },
            _count: {
              select: { likes: true, comments: true }
            },
            likes: userId ? { where: { userId } } : false,
            savedRecipes: userId ? { where: { userId } } : false,
          },
          orderBy,
          skip,
          take: parsedLimit,
        }),
        prisma.recipe.count({ where: whereClause })
      ]);

      const formattedRecipes = recipes.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        ingredients: r.ingredients,
        instructions: r.instructions,
        servings: r.servings,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        difficulty: r.difficulty,
        image: r.image,
        authorId: r.authorId,
        authorName: r.author.name,
        isPublic: r.isPublic,
        isApproved: r.isApproved,
        confidenceScore: r.confidenceScore,
        tags: r.tags.map(t => t.name),
        likesCount: r._count.likes,
        commentsCount: r._count.comments,
        isLikedByMe: userId ? r.likes.length > 0 : false,
        isSavedByMe: userId ? r.savedRecipes.length > 0 : false,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));

      return reply.send({
        recipes: formattedRecipes,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          totalCount,
          totalPages: Math.ceil(totalCount / parsedLimit),
        }
      });
    } catch (error) {
      console.error("❌ Feed query error:", error);
      return reply.status(500).send({ error: "Failed to load recipe community feed." });
    }
  });

  // GET /recipes/:id - Detailed view containing comments
  fastify.get("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      let userId: string | null = null;
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded = jwtVerifyHelper(token);
          if (decoded) userId = decoded.id;
        } catch {}
      }

      const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: {
          author: { select: { name: true } },
          tags: { select: { name: true } },
          comments: {
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: "desc" }
          },
          likes: userId ? { where: { userId } } : false,
          savedRecipes: userId ? { where: { userId } } : false,
          _count: { select: { likes: true, comments: true } }
        }
      });

      if (!recipe) {
        return reply.status(404).send({ error: "Recipe not found." });
      }

      return reply.send({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        image: recipe.image,
        authorId: recipe.authorId,
        authorName: recipe.author.name,
        isPublic: recipe.isPublic,
        isApproved: recipe.isApproved,
        confidenceScore: recipe.confidenceScore,
        tags: recipe.tags.map(t => t.name),
        likesCount: recipe._count.likes,
        commentsCount: recipe._count.comments,
        isLikedByMe: userId ? recipe.likes.length > 0 : false,
        isSavedByMe: userId ? recipe.savedRecipes.length > 0 : false,
        createdAt: recipe.createdAt.toISOString(),
        updatedAt: recipe.updatedAt.toISOString(),
        comments: recipe.comments.map(c => ({
          id: c.id,
          content: c.content,
          userId: c.userId,
          userName: c.user.name,
          createdAt: c.createdAt.toISOString(),
        }))
      });
    } catch (error) {
      console.error("❌ Detail query error:", error);
      return reply.status(500).send({ error: "Failed to load recipe details." });
    }
  });

  // POST /recipes/:id/like - Toggle standard likes
  fastify.post("/:id/like", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user!.id;

      const existingLike = await prisma.like.findUnique({
        where: { userId_recipeId: { userId, recipeId: id } }
      });

      if (existingLike) {
        await prisma.like.delete({
          where: { userId_recipeId: { userId, recipeId: id } }
        });
        return reply.send({ liked: false });
      } else {
        await prisma.like.create({
          data: { userId, recipeId: id }
        });
        return reply.send({ liked: true });
      }
    } catch (error) {
      console.error("❌ Toggle like error:", error);
      return reply.status(500).send({ error: "Failed to toggle recipe like state." });
    }
  });

  // POST /recipes/:id/save - Toggle recipe bookmarks
  fastify.post("/:id/save", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user!.id;

      const existingSave = await prisma.savedRecipe.findUnique({
        where: { userId_recipeId: { userId, recipeId: id } }
      });

      if (existingSave) {
        await prisma.savedRecipe.delete({
          where: { userId_recipeId: { userId, recipeId: id } }
        });
        return reply.send({ saved: false });
      } else {
        await prisma.savedRecipe.create({
          data: { userId, recipeId: id }
        });
        return reply.send({ saved: true });
      }
    } catch (error) {
      console.error("❌ Toggle bookmark error:", error);
      return reply.status(500).send({ error: "Failed to toggle recipe saved state." });
    }
  });

  // POST /recipes/:id/comment - Post review comment
  fastify.post("/:id/comment", { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { content } = request.body as { content?: string };
      const userId = request.user!.id;

      if (!content || content.trim().length < 2) {
        return reply.status(400).send({ error: "Comment text must be at least 2 characters." });
      }

      const comment = await prisma.recipeComment.create({
        data: {
          content: content.trim(),
          userId,
          recipeId: id
        },
        include: {
          user: { select: { name: true } }
        }
      });

      return reply.status(201).send({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        userName: comment.user.name,
        createdAt: comment.createdAt.toISOString(),
      });
    } catch (error) {
      console.error("❌ Post comment error:", error);
      return reply.status(500).send({ error: "Failed to publish review comment." });
    }
  });

  // POST /recipes/scale - Scaling ingredients algorithm
  fastify.post("/scale", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { recipeId, targetServings } = request.body as { recipeId: string; targetServings: number };

      if (!recipeId || !targetServings || targetServings < 1) {
        return reply.status(400).send({ error: "Must specify valid recipeId and targetServings >= 1." });
      }

      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId }
      });

      if (!recipe) {
        return reply.status(404).send({ error: "Recipe not found" });
      }

      const originalServings = recipe.servings;
      const scaleFactor = targetServings / originalServings;

      // Smart numerical fraction ingredient scaling engine
      const scaledIngredients = recipe.ingredients.map(ing => {
        // Regex searches for integers, decimals, fractions like 1/2 or 3/4
        const numberRegex = /(\d+(\.\d+)?)|(\d+\/\d+)|([¼½¾])/g;
        
        return ing.replace(numberRegex, (match) => {
          let value = 0;
          if (match === "¼") value = 0.25;
          else if (match === "½") value = 0.5;
          else if (match === "¾") value = 0.75;
          else if (match.includes("/")) {
            const [num, den] = match.split("/").map(Number);
            value = num / den;
          } else {
            value = parseFloat(match);
          }

          const multiplied = value * scaleFactor;
          // Format with max 2 decimal precision or convert back to tidy decimals
          return Number(multiplied.toFixed(2)).toString();
        });
      });

      return reply.send({
        originalServings,
        targetServings,
        scaleFactor,
        ingredients: scaledIngredients
      });
    } catch (error) {
      console.error("❌ Smart scale ingredients error:", error);
      return reply.status(500).send({ error: "Failed to scale recipe ingredients." });
    }
  });
}

// Simple internal helper to check tokens without throwing fastify lifecycle errors
function jwtVerifyHelper(token: string) {
  try {
    const decoded = require("jsonwebtoken").verify(token, require("../config").config.jwtSecret);
    return decoded;
  } catch {
    return null;
  }
}
