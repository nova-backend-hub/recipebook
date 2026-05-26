package com.recipebook.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.recipebook.app.presentation.*
import com.recipebook.app.presentation.theme.RecipeBookTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RecipeBookTheme {
                val navController = rememberNavController()
                val mainViewModel: MainViewModel = viewModel()

                NavHost(
                    navController = navController,
                    startDestination = Screen.Splash.route
                ) {
                    // 1. Splash Route
                    composable(Screen.Splash.route) {
                        SplashScreen(
                            onNavigateToOnboarding = {
                                navController.navigate(Screen.Onboarding.route) {
                                    popUpTo(Screen.Splash.route) { inclusive = true }
                                }
                            }
                        )
                    }

                    // 2. Onboarding Route
                    composable(Screen.Onboarding.route) {
                        OnboardingScreen(
                            onNavigateToFeed = {
                                navController.navigate(Screen.Feed.route) {
                                    popUpTo(Screen.Onboarding.route) { inclusive = true }
                                }
                            }
                        )
                    }

                    // 3. Feed / Home Route
                    composable(Screen.Feed.route) {
                        FeedScreen(
                            viewModel = mainViewModel,
                            onNavigateToCameraOcr = {
                                navController.navigate(Screen.CameraOcr.route)
                            },
                            onNavigateToDetail = { recipeId ->
                                navController.navigate(Screen.Detail.createRoute(recipeId))
                            }
                        )
                    }

                    // 4. Camera OCR Scanner Route
                    composable(Screen.CameraOcr.route) {
                        CameraOcrScreen(
                            viewModel = mainViewModel,
                            onNavigateBack = {
                                navController.popBackStack()
                            }
                        )
                    }

                    // 5. Recipe Details with scaling multipliers Route
                    composable(
                        route = Screen.Detail.route,
                        arguments = listOf(navArgument("recipeId") { type = NavType.StringType })
                    ) { backStackEntry ->
                        val recipeId = backStackEntry.arguments?.getString("recipeId") ?: ""
                        RecipeDetailScreen(
                            recipeId = recipeId,
                            viewModel = mainViewModel,
                            onNavigateBack = {
                                navController.popBackStack()
                            }
                        )
                    }
                }
            }
        }
    }
}
