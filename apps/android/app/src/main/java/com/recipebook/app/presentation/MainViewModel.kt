package com.recipebook.app.presentation

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.recipebook.app.data.RecipeEntity
import com.recipebook.app.data.RecipeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = RecipeRepository(application)

    private val _recipes = MutableStateFlow<List<RecipeEntity>>(emptyList())
    val recipes: StateFlow<List<RecipeEntity>> = _recipes

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _syncLogs = MutableStateFlow("All database profiles synced.")
    val syncLogs: StateFlow<String> = _syncLogs

    init {
        loadRecipes()
    }

    fun loadRecipes() {
        viewModelScope.launch {
            _isLoading.value = true
            // Load and cache
            _recipes.value = repository.getRecipes()
            _isLoading.value = false
        }
    }

    /**
     * Simulate Google ML Kit OCR extraction on mobile camera capture.
     * Takes screenshot raw texts, cleans structures via client logic, and writes to SQLite Room offline DB.
     */
    fun performCameraOcrExtraction(rawText: String) {
        viewModelScope.launch {
            _isLoading.value = true
            
            // Heuristic parser simulator on Android app
            val title = "Scanned Carbonara"
            val desc = "Extracted OCR recipe detail."
            val ingredients = listOf("400g Spaghetti", "150g Pancetta", "3 Eggs", "50g Cheese")
            val steps = listOf("Boil spaghetti.", "Crisp pancetta in pan.", "Stir cheese with eggs.", "Toss pasta together off heat.")
            
            repository.addRecipe(
                title = title,
                description = desc,
                ingredients = ingredients,
                instructions = steps,
                servings = 4,
                prepTime = 10,
                cookTime = 15,
                difficulty = "MEDIUM",
                image = "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=80"
            )
            
            // Reload Room states
            _recipes.value = repository.getRecipes()
            _isLoading.value = false
            _syncLogs.value = "Unsynced offline changes detected. Sync pending!"
        }
    }

    /**
     * Trigger Background DB Synchronization Worker
     */
    fun triggerSyncQueue() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.syncOfflineRecipesWithCloud()
            _recipes.value = repository.getRecipes()
            _isLoading.value = false
            _syncLogs.value = "Offline Room database synchronized successfully!"
        }
    }
}
