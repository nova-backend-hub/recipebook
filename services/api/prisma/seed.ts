import { PrismaClient, Difficulty, ModerationStatus, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Clean existing records (optional, but good for idempotent seed)
  await prisma.adminLog.deleteMany({});
  await prisma.featureFlag.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.aIReview.deleteMany({});
  await prisma.moderationQueue.deleteMany({});
  await prisma.savedRecipe.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.recipeComment.deleteMany({});
  await prisma.recipeImage.deleteMany({});
  await prisma.recipeTag.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.pushToken.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Database cleaned.");

  // 2. Create Admin Account
  const adminPasswordHash = await bcrypt.hash("Soliman@1234", 10);
  const admin = await prisma.user.create({
    data: {
      email: "soli@recipebook.com",
      name: "Soli",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`👤 Admin created: ${admin.email}`);

  // 3. Create Sample Users
  const userPasswordHash = await bcrypt.hash("User1234", 10);
  const user1 = await prisma.user.create({
    data: {
      email: "dawood@recipebook.com",
      name: "Dawood",
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: "chef.sarah@recipebook.com",
      name: "Sarah Chef",
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });
  console.log("👤 Default users created.");

  // 4. Create Tags
  const tagItalian = await prisma.recipeTag.create({ data: { name: "Italian" } });
  const tagDessert = await prisma.recipeTag.create({ data: { name: "Dessert" } });
  const tagHealthy = await prisma.recipeTag.create({ data: { name: "Healthy" } });
  const tagQuick = await prisma.recipeTag.create({ data: { name: "Quick & Easy" } });
  const tagAI = await prisma.recipeTag.create({ data: { name: "AI-Parsed" } });
  console.log("🏷️ Tags created.");

  // 5. Create Recipes with different Moderation statuses

  // Recipe A: High confidence, auto-approved
  const recipeA = await prisma.recipe.create({
    data: {
      title: "Classic Spaghetti Carbonara",
      description: "A rich, creamy, and traditional Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper.",
      ingredients: [
        "400g Spaghetti",
        "150g Guanciale or Pancetta, cubed",
        "4 Large Eggs",
        "75g Pecorino Romano or Parmesan, grated",
        "Freshly ground black pepper",
        "Salt for boiling water"
      ],
      instructions: [
        "Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.",
        "While cooking pasta, heat a skillet over medium heat. Add cubed guanciale and fry until crispy. Remove from heat, leaving guanciale and rendered fat in the skillet.",
        "In a bowl, whisk eggs together with grated cheese and plenty of cracked black pepper.",
        "Drain pasta, reserving 1 cup of pasta water. Add pasta directly into the skillet with warm guanciale fat, tossing for 1 minute to cool slightly.",
        "Pour egg-cheese mixture over the warm pasta, stirring rapidly. Add small splashes of reserved pasta water if needed to create a smooth, glossy sauce. Do not cook on heat, or eggs will scramble.",
        "Serve immediately topped with extra cheese and freshly cracked pepper."
      ],
      servings: 4,
      prepTime: 10,
      cookTime: 15,
      difficulty: Difficulty.MEDIUM,
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=80",
      authorId: user2.id,
      isPublic: true,
      isApproved: true,
      confidenceScore: 0.96,
      tags: { connect: [{ id: tagItalian.id }, { id: tagAI.id }] }
    }
  });

  await prisma.aIReview.create({
    data: {
      recipeId: recipeA.id,
      rawOcrText: "SPAGHETTI CARBONARA RECIPE... 400g spaghetti, guanciale, eggs... boil water, cook spaghetti... mix cheese...",
      confidenceScore: 0.96,
      isWorkable: true,
      safetyReport: { unsafeCooking: false, incompleteSteps: false, rawMeatWarning: false },
      suggestions: { formatAdjustments: "standardized measurements parsed successfully" }
    }
  });

  console.log(`🍝 Recipe A (Approved) created: ${recipeA.title}`);

  // Recipe B: Medium confidence, held in Moderation Queue
  const recipeB = await prisma.recipe.create({
    data: {
      title: "Quick AI Banana Oatmeal Muffins",
      description: "Easy and healthy breakfast muffins made in a single blender. No added sugar!",
      ingredients: [
        "3 ripe bananas",
        "2 cups rolled oats",
        "2 large eggs",
        "1/3 cup maple syrup or honey",
        "1 tsp baking soda",
        "1 tsp vanilla extract"
      ],
      instructions: [
        "Preheat oven to 350°F (175°C) and grease a muffin tin.",
        "Place all ingredients in a high-speed blender and blend until completely smooth.",
        "Pour batter into muffin cups, filling each about 3/4 full.",
        "Bake for 15-18 minutes until a toothpick inserted in the center comes out clean."
      ],
      servings: 12,
      prepTime: 5,
      cookTime: 18,
      difficulty: Difficulty.EASY,
      image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&auto=format&fit=crop&q=80",
      authorId: user1.id,
      isPublic: true,
      isApproved: false,
      confidenceScore: 0.72,
      tags: { connect: [{ id: tagHealthy.id }, { id: tagQuick.id }] }
    }
  });

  await prisma.moderationQueue.create({
    data: {
      recipeId: recipeB.id,
      status: ModerationStatus.PENDING,
      confidenceScore: 0.72,
      reason: "OCR detected potential missing salt/baking powder ratios; reviewer check suggested."
    }
  });

  await prisma.aIReview.create({
    data: {
      recipeId: recipeB.id,
      rawOcrText: "BLENDER MUFFINS BANANA OATS... bananas oats eggs maple syrup baking soda... blend and bake...",
      confidenceScore: 0.72,
      isWorkable: true,
      safetyReport: { unsafeCooking: false, incompleteSteps: true, rawMeatWarning: false },
      suggestions: { formatAdjustments: "Reviewer should check baking ratios" }
    }
  });

  console.log(`🧁 Recipe B (Pending Queue) created: ${recipeB.title}`);

  // Recipe C: Low confidence, Rejected/Flagged
  const recipeC = await prisma.recipe.create({
    data: {
      title: "Mysterious Quick Soup",
      description: "A suspicious screenshot upload containing very little text.",
      ingredients: [
        "Water",
        "Vegetables"
      ],
      instructions: [
        "Throw water and vegetables in a pan and cook at max temperature until dry."
      ],
      servings: 1,
      prepTime: 2,
      cookTime: 5,
      difficulty: Difficulty.EASY,
      image: null,
      authorId: user1.id,
      isPublic: true,
      isApproved: false,
      confidenceScore: 0.21,
      tags: { connect: [{ id: tagQuick.id }] }
    }
  });

  await prisma.moderationQueue.create({
    data: {
      recipeId: recipeC.id,
      status: ModerationStatus.REJECTED,
      confidenceScore: 0.21,
      reason: "Nonsense instructions: 'cook until dry' at 'max temperature' represents extreme fire hazard/non-workable recipe."
    }
  });

  await prisma.aIReview.create({
    data: {
      recipeId: recipeC.id,
      rawOcrText: "SOUP water veg cook max temp dry...",
      confidenceScore: 0.21,
      isWorkable: false,
      safetyReport: { unsafeCooking: true, incompleteSteps: true, rawMeatWarning: false },
      suggestions: { formatAdjustments: "Recommend rejection: highly unsafe cooking advice." }
    }
  });

  console.log(`⚠️ Recipe C (Rejected) created: ${recipeC.title}`);

  // 6. Comments, Likes, and Saves
  await prisma.recipeComment.create({
    data: {
      content: "This Carbonara is absolutely perfect! Followed the instructions exactly, and the gloss was stunning.",
      userId: user1.id,
      recipeId: recipeA.id
    }
  });

  await prisma.like.create({
    data: {
      userId: user1.id,
      recipeId: recipeA.id
    }
  });

  await prisma.savedRecipe.create({
    data: {
      userId: user1.id,
      recipeId: recipeA.id
    }
  });

  // 7. Seed Feature Flags
  await prisma.featureFlag.createMany({
    data: [
      { key: "enable-ai-moderation", value: true, description: "Auto review recipes using AI" },
      { key: "allow-public-registration", value: true, description: "Allow users to sign up" },
      { key: "push-notifications-active", value: true, description: "Send FCM push notifications" },
    ]
  });
  console.log("🚩 Feature flags seeded.");

  // 8. Admin Audit Log
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: "DATABASE_SEED",
      details: "Database completed initial seeding with 3 recipe profiles."
    }
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
