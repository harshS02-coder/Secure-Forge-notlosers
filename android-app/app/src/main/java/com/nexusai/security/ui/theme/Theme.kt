package com.nexusai.security.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

import androidx.compose.ui.graphics.Color
import androidx.compose.material3.darkColorScheme

private val NexusShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

private val DarkColorScheme = darkColorScheme(
    primary = NexusColors.Primary,
    onPrimary = NexusColors.OnInverse,
    primaryContainer = NexusColors.PrimaryVariant.copy(alpha = 0.2f),
    onPrimaryContainer = NexusColors.Primary,
    secondary = NexusColors.SurfaceSecondary,
    onSecondary = NexusColors.OnSurface,
    secondaryContainer = NexusColors.SurfaceSecondary,
    onSecondaryContainer = NexusColors.OnSurface,
    tertiary = NexusColors.Accent,
    onTertiary = NexusColors.OnSurface,
    background = NexusColors.Background,
    onBackground = NexusColors.OnSurface,
    surface = NexusColors.Surface,
    onSurface = NexusColors.OnSurface,
    surfaceVariant = NexusColors.SurfaceSecondary,
    onSurfaceVariant = NexusColors.OnSurfaceSecondary,
    error = NexusColors.Error,
    onError = NexusColors.OnInverse,
    errorContainer = NexusColors.ErrorBg,
    onErrorContainer = NexusColors.Error,
    outline = NexusColors.Hairline,
    outlineVariant = NexusColors.Hairline,
    scrim = Color.Black.copy(alpha = 0.5f),
    inverseSurface = NexusColors.OnSurface,
    inverseOnSurface = NexusColors.Background,
    inversePrimary = NexusColors.PrimaryVariant
)

@Composable
fun NexusAITheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = NexusTypography,
        shapes = NexusShapes,
        content = content
    )
}
