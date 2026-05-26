package com.recipebook.app.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface RecipeDao {

    @Query("SELECT * FROM local_recipes ORDER BY id DESC")
    suspend fun getAllRecipes(): List<RecipeEntity>

    @Query("SELECT * FROM local_recipes WHERE id = :id")
    suspend fun getRecipeById(id: String): RecipeEntity?

    @Query("SELECT * FROM local_recipes WHERE isSyncedWithCloud = 0")
    suspend fun getUnsyncedRecipes(): List<RecipeEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecipe(recipe: RecipeEntity)

    @Query("UPDATE local_recipes SET isSyncedWithCloud = 1 WHERE id = :id")
    suspend fun markAsSynced(id: String)

    @Query("DELETE FROM local_recipes WHERE id = :id")
    suspend fun deleteRecipe(id: String)
}
