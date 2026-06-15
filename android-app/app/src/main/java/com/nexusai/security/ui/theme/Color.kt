package com.nexusai.security.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush

object NexusColors {
    // Primary - Futuristic Blue/Cyan
    val Primary = Color(0xFF00E5FF)
    val PrimaryVariant = Color(0xFF007BFF)
    val Accent = Color(0xFF7000FF) // Cyber Purple
    
    // Neutrals - Deep Dark Theme
    val Background = Color(0xFF07080A)
    val Surface = Color(0xFF111318)
    val SurfaceSecondary = Color(0xFF1B1E26)
    val SurfaceCard = Color(0xFF16181D)
    
    val OnSurface = Color(0xFFFFFFFF)
    val OnSurfaceSecondary = Color(0xFF94A3B8)
    val OnSurfaceMuted = Color(0xFF64748B)
    val OnInverse = Color(0xFF07080A)

    val Hairline = Color(0xFF1E293B)
    
    // Status
    val Success = Color(0xFF00FF94)
    val SuccessBg = Color(0x1A00FF94)
    val Warning = Color(0xFFFFB800)
    val WarningBg = Color(0x1AFFB800)
    val Error = Color(0xFFFF4D4D)
    val ErrorBg = Color(0x1AFF4D4D)

    // Gradients
    val MainGradient = Brush.verticalGradient(
        listOf(Primary, PrimaryVariant)
    )
    val CardGradient = Brush.linearGradient(
        listOf(Color(0xFF1E293B), Color(0xFF0F172A))
    )
    
    // Legacy mapping (for compatibility during migration)
    val PrimaryHover = PrimaryVariant
    val PrimaryDisabled = Color(0xFF1E293B)
    val SurfaceDark = Background
}
