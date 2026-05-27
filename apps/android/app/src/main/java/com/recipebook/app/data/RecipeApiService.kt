package com.recipebook.app.data

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor

/**
 * RecipeBook Backend API Service — connects to live Cloud Run deployment.
 */
interface RecipeApiService {

    // Auth
    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    // Recipe Upload (sends OCR text for AI parsing)
    @POST("recipes/upload")
    suspend fun uploadRecipe(
        @Header("Authorization") token: String,
        @Body body: UploadRecipeRequest
    ): Response<UploadRecipeResponse>

    // Community Feed
    @GET("recipes/feed")
    suspend fun getFeed(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String = "",
        @Query("sort") sort: String = "latest"
    ): Response<FeedResponse>

    // Recipe Detail
    @GET("recipes/{id}")
    suspend fun getRecipeDetail(@Path("id") id: String): Response<RecipeDetailResponse>

    // Like toggle
    @POST("recipes/{id}/like")
    suspend fun toggleLike(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<LikeResponse>

    // Push token registration
    @POST("auth/push-token")
    suspend fun registerPushToken(
        @Header("Authorization") token: String,
        @Body body: PushTokenRequest
    ): Response<Any>

    companion object {
        private const val BASE_URL = "https://recipebook-api-160271972570.us-central1.run.app/"

        fun create(): RecipeApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(RecipeApiService::class.java)
        }
    }
}

// Request/Response DTOs
data class RegisterRequest(val email: String, val password: String, val name: String)
data class LoginRequest(val email: String, val password: String)
data class AuthResponse(
    val user: AuthUser,
    val accessToken: String,
    val refreshToken: String
)
data class AuthUser(val id: String, val email: String, val name: String, val role: String)

data class UploadRecipeRequest(val rawText: String, val image: String? = null)
data class UploadRecipeResponse(
    val message: String,
    val recipeId: String,
    val autoApproved: Boolean,
    val aiMetrics: AiMetrics?
)
data class AiMetrics(
    val confidenceScore: Float,
    val isWorkable: Boolean,
    val safetyReport: SafetyReport?
)
data class SafetyReport(
    val unsafeCooking: Boolean,
    val incompleteSteps: Boolean,
    val rawMeatWarning: Boolean
)

data class FeedResponse(
    val recipes: List<FeedRecipe>,
    val pagination: Pagination
)
data class FeedRecipe(
    val id: String,
    val title: String,
    val description: String?,
    val ingredients: List<String>,
    val instructions: List<String>,
    val servings: Int,
    val prepTime: Int,
    val cookTime: Int,
    val difficulty: String,
    val image: String?,
    val authorName: String,
    val confidenceScore: Float,
    val tags: List<String>,
    val likesCount: Int,
    val commentsCount: Int
)
data class Pagination(val page: Int, val limit: Int, val totalCount: Int, val totalPages: Int)

data class RecipeDetailResponse(
    val id: String,
    val title: String,
    val description: String?,
    val ingredients: List<String>,
    val instructions: List<String>,
    val servings: Int,
    val prepTime: Int,
    val cookTime: Int,
    val difficulty: String,
    val image: String?,
    val authorName: String,
    val confidenceScore: Float,
    val tags: List<String>,
    val likesCount: Int,
    val commentsCount: Int
)

data class LikeResponse(val liked: Boolean)
data class PushTokenRequest(val token: String, val platform: String = "ANDROID")
