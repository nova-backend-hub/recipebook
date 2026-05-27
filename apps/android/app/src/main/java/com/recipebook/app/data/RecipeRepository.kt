package com.recipebook.app.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class RecipeRepository(private val context: Context) {

    private val recipeDao = RecipeDatabase.getDatabase(context).recipeDao()
    private val api = RecipeApiService.create()

    private val prefs = context.getSharedPreferences("recipebook_prefs", Context.MODE_PRIVATE)

    fun getAuthToken(): String? = prefs.getString("auth_token", null)
    fun saveAuthToken(token: String) = prefs.edit().putString("auth_token", token).apply()
    fun saveUserId(id: String) = prefs.edit().putString("user_id", id).apply()
    fun getUserId(): String? = prefs.getString("user_id", null)
    fun getUserName(): String? = prefs.getString("user_name", null)
    fun saveUserName(name: String) = prefs.edit().putString("user_name", name).apply()
    fun isLoggedIn(): Boolean = getAuthToken() != null

    /**
     * Register a new user account
     */
    suspend fun register(email: String, password: String, name: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.register(RegisterRequest(email, password, name))
            if (response.isSuccessful && response.body() != null) {
                val auth = response.body()!!
                saveAuthToken(auth.accessToken)
                saveUserId(auth.user.id)
                saveUserName(auth.user.name)
                Result.success(auth)
            } else {
                Result.failure(Exception("Registration failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Log.e("API", "Register error", e)
            Result.failure(e)
        }
    }

    /**
     * Login with existing credentials
     */
    suspend fun login(email: String, password: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                val auth = response.body()!!
                saveAuthToken(auth.accessToken)
                saveUserId(auth.user.id)
                saveUserName(auth.user.name)
                Result.success(auth)
            } else {
                Result.failure(Exception("Login failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Log.e("API", "Login error", e)
            Result.failure(e)
        }
    }

    /**
     * Retrieve all recipes — merges local Room cache with live API feed.
     */
    suspend fun getRecipes(): List<RecipeEntity> = withContext(Dispatchers.IO) {
        try {
            // Sync offline recipes first
            syncOfflineRecipesWithCloud()

            // Fetch live feed from backend
            val response = api.getFeed()
            if (response.isSuccessful && response.body() != null) {
                val feed = response.body()!!
                // Cache API recipes into local Room DB
                for (recipe in feed.recipes) {
                    val entity = RecipeEntity(
                        id = recipe.id,
                        title = recipe.title,
                        description = recipe.description ?: "",
                        ingredientsCsv = recipe.ingredients.joinToString("|"),
                        instructionsCsv = recipe.instructions.joinToString("|"),
                        servings = recipe.servings,
                        prepTime = recipe.prepTime,
                        cookTime = recipe.cookTime,
                        difficulty = recipe.difficulty,
                        image = recipe.image,
                        confidenceScore = recipe.confidenceScore,
                        isApproved = true,
                        isSyncedWithCloud = true
                    )
                    recipeDao.insertRecipe(entity)
                }
                Log.d("SYNC_CLIENT", "Fetched ${feed.recipes.size} recipes from live API.")
            }
        } catch (e: Exception) {
            Log.w("SYNC_CLIENT", "API Server offline. Using local Room cache.", e)
        }

        return@withContext recipeDao.getAllRecipes()
    }

    /**
     * Upload OCR text to the backend for AI parsing.
     * Also caches locally with isSyncedWithCloud = false as fallback.
     */
    suspend fun uploadOcrText(rawOcrText: String): Result<UploadRecipeResponse> = withContext(Dispatchers.IO) {
        val token = getAuthToken()
        if (token == null) {
            return@withContext Result.failure(Exception("Not logged in"))
        }

        try {
            val response = api.uploadRecipe(
                "Bearer $token",
                UploadRecipeRequest(rawText = rawOcrText)
            )

            if (response.isSuccessful && response.body() != null) {
                val result = response.body()!!
                Log.d("SYNC_CLIENT", "Recipe uploaded to AI pipeline! ID: ${result.recipeId}, Auto-approved: ${result.autoApproved}")
                return@withContext Result.success(result)
            } else {
                Log.w("SYNC_CLIENT", "Upload failed: ${response.code()}")
                // Cache locally for offline sync
                cacheRecipeLocally(rawOcrText)
                return@withContext Result.failure(Exception("Upload failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Log.w("SYNC_CLIENT", "Offline mode: Recipe cached locally.", e)
            cacheRecipeLocally(rawOcrText)
            return@withContext Result.failure(e)
        }
    }

    private suspend fun cacheRecipeLocally(rawText: String) {
        val localRecipe = RecipeEntity(
            id = UUID.randomUUID().toString(),
            title = "Pending OCR Upload",
            description = rawText.take(200),
            ingredientsCsv = "",
            instructionsCsv = "",
            servings = 2,
            prepTime = 0,
            cookTime = 0,
            difficulty = "MEDIUM",
            image = null,
            confidenceScore = 0f,
            isApproved = false,
            isSyncedWithCloud = false
        )
        recipeDao.insertRecipe(localRecipe)
    }

    /**
     * Register FCM push token with the backend
     */
    suspend fun registerPushToken(fcmToken: String) = withContext(Dispatchers.IO) {
        val authToken = getAuthToken() ?: return@withContext
        try {
            api.registerPushToken("Bearer $authToken", PushTokenRequest(fcmToken))
            Log.d("FCM_PUSH", "Push token registered with backend successfully.")
        } catch (e: Exception) {
            Log.w("FCM_PUSH", "Failed to register push token.", e)
        }
    }

    /**
     * Synchronization: Loops all unsynced recipes and pushes OCR text to backend.
     */
    suspend fun syncOfflineRecipesWithCloud() = withContext(Dispatchers.IO) {
        val unsyncedList = recipeDao.getUnsyncedRecipes()
        if (unsyncedList.isEmpty()) return@withContext

        val token = getAuthToken() ?: return@withContext

        Log.i("SYNC_CLIENT", "Offline sync: ${unsyncedList.size} items pending.")
        for (recipe in unsyncedList) {
            try {
                val rawText = recipe.description.ifEmpty {
                    "${recipe.title}\n${recipe.ingredientsCsv.replace("|", "\n")}\n${recipe.instructionsCsv.replace("|", "\n")}"
                }
                val response = api.uploadRecipe("Bearer $token", UploadRecipeRequest(rawText = rawText))
                if (response.isSuccessful) {
                    recipeDao.markAsSynced(recipe.id)
                    Log.d("SYNC_CLIENT", "Synced offline recipe: ${recipe.title}")
                }
            } catch (e: Exception) {
                Log.e("SYNC_CLIENT", "Sync failed for '${recipe.title}': ${e.message}")
                break
            }
        }
    }
}
