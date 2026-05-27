package com.recipebook.app.presentation

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.recipebook.app.data.RecipeEntity
import com.recipebook.app.data.RecipeRepository
import com.recipebook.app.data.UploadRecipeResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = RecipeRepository(application)

    private val _recipes = MutableStateFlow<List<RecipeEntity>>(emptyList())
    val recipes: StateFlow<List<RecipeEntity>> = _recipes

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _syncLogs = MutableStateFlow("Connecting to RecipeBook API...")
    val syncLogs: StateFlow<String> = _syncLogs

    private val _isLoggedIn = MutableStateFlow(repository.isLoggedIn())
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn

    private val _userName = MutableStateFlow(repository.getUserName() ?: "")
    val userName: StateFlow<String> = _userName

    private val _uploadResult = MutableStateFlow<UploadRecipeResponse?>(null)
    val uploadResult: StateFlow<UploadRecipeResponse?> = _uploadResult

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage

    init {
        loadRecipes()
    }

    fun loadRecipes() {
        viewModelScope.launch {
            _isLoading.value = true
            _recipes.value = repository.getRecipes()
            _isLoading.value = false
            _syncLogs.value = "Feed loaded: ${_recipes.value.size} recipes."
        }
    }

    /**
     * Register a new account
     */
    fun register(email: String, password: String, name: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            val result = repository.register(email, password, name)
            result.onSuccess {
                _isLoggedIn.value = true
                _userName.value = it.user.name
                _syncLogs.value = "Welcome, ${it.user.name}! Account created."
                loadRecipes()
            }.onFailure {
                _errorMessage.value = it.message ?: "Registration failed"
                _syncLogs.value = "Registration failed: ${it.message}"
            }
            _isLoading.value = false
        }
    }

    /**
     * Login with existing credentials
     */
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            val result = repository.login(email, password)
            result.onSuccess {
                _isLoggedIn.value = true
                _userName.value = it.user.name
                _syncLogs.value = "Logged in as ${it.user.name}."
                loadRecipes()
            }.onFailure {
                _errorMessage.value = it.message ?: "Login failed"
                _syncLogs.value = "Login failed: ${it.message}"
            }
            _isLoading.value = false
        }
    }

    /**
     * Send OCR-extracted text to the backend API for Gemini AI parsing.
     * The backend will:
     * 1. Parse the raw text using Gemini AI
     * 2. Extract structured recipe data
     * 3. Validate workability and safety
     * 4. Auto-publish or queue for moderation
     */
    fun uploadOcrText(rawOcrText: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            _uploadResult.value = null

            val result = repository.uploadOcrText(rawOcrText)
            result.onSuccess { response ->
                _uploadResult.value = response
                _syncLogs.value = if (response.autoApproved) {
                    "✅ Recipe auto-published! Confidence: ${response.aiMetrics?.confidenceScore?.times(100)?.toInt()}%"
                } else {
                    "⏳ Recipe sent to moderation queue for review."
                }
                // Reload feed
                loadRecipes()
            }.onFailure {
                _errorMessage.value = it.message ?: "Upload failed"
                _syncLogs.value = "Upload failed: ${it.message}. Cached offline."
            }
            _isLoading.value = false
        }
    }

    /**
     * Register FCM token with backend for push notifications
     */
    fun registerPushToken(fcmToken: String) {
        viewModelScope.launch {
            repository.registerPushToken(fcmToken)
        }
    }

    /**
     * Trigger background sync of offline-cached recipes
     */
    fun triggerSyncQueue() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.syncOfflineRecipesWithCloud()
            _recipes.value = repository.getRecipes()
            _isLoading.value = false
            _syncLogs.value = "Offline sync complete!"
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }
}
