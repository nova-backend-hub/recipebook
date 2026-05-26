package com.recipebook.app.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class RecipeRepository(context: Context) {

    private val recipeDao = RecipeDatabase.getDatabase(context).recipeDao()

    /**
     * Retrieve all recipes. Merges cached offline Room profiles and server items.
     */
    suspend fun getRecipes(): List<RecipeEntity> = withContext(Dispatchers.IO) {
        try {
            // First, trigger background queue synchronizations
            syncOfflineRecipesWithCloud()
            
            // In a live app, we would fetch from Retrofit feed (e.g. GET /recipes/feed)
            // and write new items to local Room database cache
        } catch (e: Exception) {
            Log.w("SYNC_CLIENT", "API Server offline. Relying strictly on local Room SQL storage.")
        }
        
        return@withContext recipeDao.getAllRecipes()
    }

    /**
     * Insert a recipe. If offline, it caches in Room with isSyncedWithCloud = false.
     * When internet is connected, background thread uploads it!
     */
    suspend fun addRecipe(
        title: String,
        description: String,
        ingredients: List<String>,
        instructions: List<String>,
        servings: Int,
        prepTime: Int,
        cookTime: Int,
        difficulty: String,
        image: String?
    ) = withContext(Dispatchers.IO) {
        
        val localId = UUID.randomUUID().toString()
        val localRecipe = RecipeEntity(
            id = localId,
            title = title,
            description = description,
            ingredientsCsv = ingredients.joinToString("|"),
            instructionsCsv = instructions.joinToString("|"),
            servings = servings,
            prepTime = prepTime,
            cookTime = cookTime,
            difficulty = difficulty,
            image = image,
            confidenceScore = 0.95f,
            isApproved = true,
            isSyncedWithCloud = false // Default offline hold state!
        )

        recipeDao.insertRecipe(localRecipe)
        
        // Attempt cloud push immediately
        try {
            uploadRecipeToServer(localRecipe)
            recipeDao.markAsSynced(localId)
            Log.d("SYNC_CLIENT", "Recipe synced immediately to Fastify cloud pipeline!")
        } catch (e: Exception) {
            Log.w("SYNC_CLIENT", "Offline mode: Sync queued. Cached locally inside Room SQLite.")
        }
    }

    /**
     * Synchronization Daemon: Loops all unsynced recipes, pushes to backend API, and updates sync states.
     */
    suspend fun syncOfflineRecipesWithCloud() = withContext(Dispatchers.IO) {
        val unsyncedList = recipeDao.getUnsyncedRecipes()
        if (unsyncedList.isEmpty()) return@withContext

        Log.i("SYNC_CLIENT", "Offline Queue Sync active: ${unsyncedList.size} items pending.")
        for (recipe in unsyncedList) {
            try {
                uploadRecipeToServer(recipe)
                recipeDao.markAsSynced(recipe.id)
                Log.d("SYNC_CLIENT", "Successfully synchronized offline recipe: ${recipe.title}")
            } catch (e: Exception) {
                Log.e("SYNC_CLIENT", "Sync failed for recipe '${recipe.title}': API Server offline.")
                break // Stop sync loop if connection fails
            }
        }
    }

    /**
     * Mock Retrofit POST request to backend API
     */
    private suspend fun uploadRecipeToServer(recipe: RecipeEntity) {
        // In real app: retrofitApi.uploadRecipe(recipe)
        // We simulate a network hop that takes 500ms
        withContext(Dispatchers.IO) {
            Thread.sleep(500)
        }
    }
}
