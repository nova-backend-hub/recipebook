import { z } from "zod";

// ==========================================
// AUTH SCHEMAS & TYPES
// ==========================================

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
  };
  accessToken: string;
  refreshToken: string;
}

// ==========================================
// RECIPE SCHEMAS & TYPES
// ==========================================

export const RecipeCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction is required"),
  servings: z.number().int().positive().default(2),
  prepTime: z.number().int().nonnegative().default(0),
  cookTime: z.number().int().nonnegative().default(0),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  image: z.string().optional(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

export type RecipeCreateInput = z.infer<typeof RecipeCreateSchema>;

export interface RecipeCommentData {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface RecipeData {
  id: string;
  title: string;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  image: string | null;
  authorId: string;
  authorName: string;
  isPublic: boolean;
  isApproved: boolean;
  confidenceScore: number;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  isSavedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
  comments?: RecipeCommentData[];
}

export const IngredientScalingSchema = z.object({
  recipeId: z.string(),
  targetServings: z.number().int().positive(),
});

export interface ScaledRecipe {
  originalServings: number;
  targetServings: number;
  scaleFactor: number;
  ingredients: string[];
}

export interface AdminStats {
  usersCount: number;
  recipesCount: number;
  moderationPendingCount: number;
  activeFeatures: number;
  serverStatus: {
    status: "UP" | "DOWN";
    uptime: number;
    memoryUsage: string;
    redisConnected: boolean;
    dbConnected: boolean;
  };
  monthlySignups: { month: string; count: number }[];
  recipeCategories: { tag: string; count: number }[];
}

export const BroadcastNotificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(5, "Body must be at least 5 characters"),
  topic: z.string().default("global"),
});

export type BroadcastNotificationInput = z.infer<typeof BroadcastNotificationSchema>;

export const ModerateRecipeSchema = z.object({
  isApproved: z.boolean(),
  notes: z.string().optional(),
});

export type ModerateRecipeInput = z.infer<typeof ModerateRecipeSchema>;

export const PushTokenRegisterSchema = z.object({
  token: z.string().min(10, "Invalid FCM token"),
  platform: z.enum(["ANDROID", "WEB"]),
});

export type PushTokenRegisterInput = z.infer<typeof PushTokenRegisterSchema>;
