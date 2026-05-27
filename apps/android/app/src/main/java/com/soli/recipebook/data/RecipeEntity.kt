package com.soli.recipebook.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "local_recipes")
data class RecipeEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val ingredientsCsv: String, // Comma separated values for easy storage
    val instructionsCsv: String, // Comma separated steps for easy storage
    val servings: Int,
    val prepTime: Int,
    val cookTime: Int,
    val difficulty: String,
    val image: String?,
    val confidenceScore: Float,
    val isApproved: Boolean,
    val isSyncedWithCloud: Boolean = false // Track sync state for offline-to-online worker queue!
)
