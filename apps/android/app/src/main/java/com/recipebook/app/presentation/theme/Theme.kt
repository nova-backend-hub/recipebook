package com.recipebook.app.presentation.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Premium branding design system colors
val CrimsonRed = Color(0xFF881337)
val SoftPeach = Color(0xFFFFF1F2)
val DarkCharcoal = Color(0xFF171717)
val SoftGrey = Color(0xFFFAFAFA)
val BorderGrey = Color(0xFFE5E5E5)

private val LightColorScheme = lightColorScheme(
    primary = CrimsonRed,
    onPrimary = Color.White,
    primaryContainer = SoftPeach,
    onPrimaryContainer = CrimsonRed,
    background = Color.White,
    onBackground = DarkCharcoal,
    surface = SoftGrey,
    onSurface = DarkCharcoal,
    outline = BorderGrey
)

private val DarkColorScheme = darkColorScheme(
    primary = CrimsonRed,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF4C0519),
    onPrimaryContainer = SoftPeach,
    background = DarkCharcoal,
    onBackground = Color.White,
    surface = Color(0xFF262626),
    onSurface = Color.White,
    outline = Color(0xFF404040)
)

@Composable
fun RecipeBookTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
