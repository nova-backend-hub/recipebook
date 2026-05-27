package com.soli.recipebook.presentation

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.soli.recipebook.data.RecipeEntity
import com.soli.recipebook.presentation.theme.*

// Simple Navigation routes
sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Feed : Screen("feed")
    object CameraOcr : Screen("camera_ocr")
    object Detail : Screen("detail/{recipeId}") {
        fun createRoute(recipeId: String) = "detail/$recipeId"
    }
}

/**
 * 1. SPLASH SCREEN COMPOSABLE
 */
@Composable
fun SplashScreen(onNavigateToOnboarding: () -> Unit) {
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(2000) // 2 seconds splash delays
        onNavigateToOnboarding()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(CrimsonRed, Color(0xFF4C0519))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Restaurant,
                contentDescription = "Logo",
                tint = Color.White,
                modifier = Modifier.size(72.dp)
            )
            Text(
                text = "RecipeBook",
                color = Color.White,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            CircularProgressIndicator(color = SoftPeach, strokeWidth = 3.dp)
        }
    }
}

/**
 * 2. ONBOARDING SCREEN COMPOSABLE
 */
@Composable
fun OnboardingScreen(onNavigateToFeed: () -> Unit) {
    var step by remember { mutableStateOf(1) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top branding
            Text(
                text = "RecipeBook AI",
                color = CrimsonRed,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )

            // Dynamic onboarding slides content
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                Icon(
                    imageVector = when(step) {
                        1 -> Icons.Default.CameraAlt
                        2 -> Icons.Default.Psychology
                        else -> Icons.Default.CloudSync
                    },
                    contentDescription = "Onboarding Slide",
                    tint = CrimsonRed,
                    modifier = Modifier.size(80.dp)
                )

                Text(
                    text = when(step) {
                        1 -> "Scan Screenshots Instantly"
                        2 -> "AI Recipe Quality Review"
                        else -> "Offline Support & Sync"
                    },
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkCharcoal,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = when(step) {
                        1 -> "Took screenshots of food recipes online? Capture or upload them immediately inside the app. Our ML Kit OCR extracts text instantly."
                        2 -> "Gemini intelligence evaluates instructions, formats neat checklist arrays, and warns of toxic cooking errors before publishing."
                        else -> "Saved SQLite Room database lets you access cooking guides offline. Synchronizes automatically once network connection is verified."
                    },
                    fontSize = 14.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp
                )
            }

            // Steps dots and Next controls
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                // Dots row
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    (1..3).forEach { i ->
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(if (step == i) CrimsonRed else BorderGrey)
                        )
                    }
                }

                // Call to actions buttons
                Button(
                    onClick = {
                        if (step < 3) step++ else onNavigateToFeed()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(text = if (step < 3) "Next Page" else "Let's Cook!", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

/**
 * 3. FEED / COMMUNITY SCREEN COMPOSABLE
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(
    viewModel: MainViewModel,
    onNavigateToCameraOcr: () -> Unit,
    onNavigateToDetail: (String) -> Unit
) {
    val recipes by viewModel.recipes.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val syncStatus by viewModel.syncLogs.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("RecipeBook Feed", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = DarkCharcoal
                ),
                actions = {
                    IconButton(onClick = { viewModel.triggerSyncQueue() }) {
                        Icon(imageVector = Icons.Default.CloudSync, contentDescription = "Sync", tint = CrimsonRed)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToCameraOcr,
                containerColor = CrimsonRed,
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(imageVector = Icons.Default.CameraAlt, contentDescription = "Scan OCR")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(SoftGrey)
        ) {
            // Synced statuses bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SoftPeach)
                    .padding(vertical = 8.dp, horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = syncStatus, fontSize = 11.sp, color = CrimsonRed, fontWeight = FontWeight.SemiBold)
                Icon(
                    imageVector = Icons.Default.CheckCircle, 
                    contentDescription = "status", 
                    tint = CrimsonRed, 
                    modifier = Modifier.size(14.dp)
                )
            }

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = CrimsonRed)
                }
            } else if (recipes.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(imageVector = Icons.Default.Book, contentDescription = "Empty", tint = BorderGrey, modifier = Modifier.size(64.dp))
                        Text(text = "No Recipes Scanned Yet", fontWeight = FontWeight.Bold, color = Color.Gray)
                        Text(text = "Click the camera button below to scan screenshots!", fontSize = 12.sp, color = Color.Gray)
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(recipes) { recipe ->
                        RecipeFeedCard(recipe = recipe, onClick = { onNavigateToDetail(recipe.id) })
                    }
                }
            }
        }
    }
}

@Composable
fun RecipeFeedCard(recipe: RecipeEntity, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Mock banner box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
                    .background(Brush.verticalGradient(listOf(Color(0xFFE5E5E5), Color(0xFFD4D4D4))))
            ) {
                // Confidence badge
                Box(
                    modifier = Modifier
                        .padding(12.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(CrimsonRed)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                        .align(Alignment.TopStart)
                ) {
                    Text(
                        text = "${Math.round(recipe.confidenceScore * 100)}% AI Accuracy",
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(text = recipe.title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DarkCharcoal)
                Text(text = recipe.description, fontSize = 12.sp, color = Color.Gray, maxLines = 2)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "${recipe.servings} Servings", fontSize = 11.sp, color = CrimsonRed, fontWeight = FontWeight.SemiBold)
                    Text(text = "${recipe.cookTime} Mins Cooking", fontSize = 11.sp, color = CrimsonRed, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

/**
 * 4. CAMERA OCR SCANNER SCREEN COMPOSABLE
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CameraOcrScreen(viewModel: MainViewModel, onNavigateBack: () -> Unit) {
    var rawCapturedText by remember { mutableStateOf("") }
    var scanCompleted by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("OCR Camera Scanner", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Camera grid simulator viewport
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color.Black)
                    .border(2.dp, CrimsonRed, RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(imageVector = Icons.Default.CameraAlt, contentDescription = "Camera", tint = Color.White, modifier = Modifier.size(48.dp))
                    Text(text = "Align screenshot text within guidelines", color = Color.White, fontSize = 12.sp)
                }
            }

            // Simulate Screenshot capture triggers
            if (!scanCompleted) {
                Button(
                    onClick = {
                        rawCapturedText = "SPAGHETTI CARBONARA... ingredients: 400g spaghetti, 3 eggs, cheese... instructions: boil pasta, mix eggs, toss..."
                        scanCompleted = true
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Simulate Screenshot Capture", fontWeight = FontWeight.Bold)
                }
            } else {
                Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    // Preview parsed block
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(SoftPeach)
                            .padding(12.dp)
                    ) {
                        Text(text = rawCapturedText, fontSize = 11.sp, color = CrimsonRed, maxLines = 4)
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(
                            onClick = { scanCompleted = false },
                            colors = ButtonDefaults.buttonColors(containerColor = SoftPeach, contentColor = CrimsonRed),
                            modifier = Modifier.weight(1f).height(50.dp),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Re-scan", fontWeight = FontWeight.Bold)
                        }
                        
                        Button(
                            onClick = {
                                viewModel.uploadOcrText(rawCapturedText)
                                onNavigateBack()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                            modifier = Modifier.weight(2f).height(50.dp),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("AI Recipe Extraction", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

/**
 * 5. RECIPE DETAIL SCREEN WITH NUMERICAL SCALING WIDGET
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecipeDetailScreen(
    recipeId: String,
    viewModel: MainViewModel,
    onNavigateBack: () -> Unit
) {
    val recipes by viewModel.recipes.collectAsState()
    val recipe = recipes.find { it.id == recipeId }

    var servingsMultiplier by remember { mutableStateOf(4) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(recipe?.title ?: "Recipe Details", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (recipe == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = "Recipe profile not found.")
            }
            return@Scaffold
        }

        val originalServings = recipe.servings
        val ingredientsList = recipe.ingredientsCsv.split("|")
        val instructionsList = recipe.instructionsCsv.split("|")

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color.White),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Interactive scaling selectors
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SoftPeach)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Smart Ingredient Scaling", fontWeight = FontWeight.Bold, color = CrimsonRed)
                            Text("Active Servings", fontSize = 11.sp, color = Color.Gray)
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(onClick = { if (servingsMultiplier > 1) servingsMultiplier-- }) {
                                Icon(imageVector = Icons.Default.Remove, contentDescription = "Dec", tint = CrimsonRed)
                            }
                            
                            Text(
                                text = servingsMultiplier.toString(), 
                                fontSize = 24.sp, 
                                fontWeight = FontWeight.Bold, 
                                color = CrimsonRed
                            )

                            IconButton(onClick = { servingsMultiplier++ }) {
                                Icon(imageVector = Icons.Default.Add, contentDescription = "Inc", tint = CrimsonRed)
                            }
                        }
                    }
                }
            }

            // Ingredients checklist adapting to scale factor
            item {
                Text("Ingredients list", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = DarkCharcoal)
                Spacer(modifier = Modifier.height(8.dp))
                
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    ingredientsList.forEach { ing ->
                        // Calculate multipliers dynamically
                        val factor = servingsMultiplier.toFloat() / originalServings
                        val numberRegex = "(\\d+(\\.\\d+)?)".toRegex()
                        val scaledIng = ing.replace(numberRegex) { match ->
                            val originalVal = match.value.toFloat()
                            val multiplied = originalVal * factor
                            "%.1f".format(multiplied)
                        }

                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = "item", tint = CrimsonRed, modifier = Modifier.size(16.dp))
                            Text(text = scaledIng, fontSize = 13.sp, color = DarkCharcoal)
                        }
                    }
                }
            }

            // Instructions steps list
            item {
                Text("Instructions steps", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = DarkCharcoal)
                Spacer(modifier = Modifier.height(8.dp))

                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    instructionsList.forEachIndexed { i, step ->
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(SoftPeach),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = (i + 1).toString(), fontSize = 11.sp, color = CrimsonRed, fontWeight = FontWeight.Bold)
                            }
                            Text(text = step, fontSize = 13.sp, color = DarkCharcoal, modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }
    }
}
