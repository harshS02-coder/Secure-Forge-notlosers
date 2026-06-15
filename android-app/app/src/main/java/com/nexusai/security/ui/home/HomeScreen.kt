package com.nexusai.security.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nexusai.security.data.model.DashboardStats
import com.nexusai.security.data.model.ScanJob
import com.nexusai.security.ui.theme.NexusColors
import com.nexusai.security.ui.theme.EyebrowStyle

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel()
) {
    val stats by viewModel.stats.collectAsState()
    val recentScans by viewModel.recentScans.collectAsState()

    Box(modifier = Modifier.fillMaxSize().background(NexusColors.Background)) {
        // Decorative background elements
        Box(
            modifier = Modifier
                .offset(x = (-100).dp, y = (-50).dp)
                .size(300.dp)
                .background(NexusColors.Primary.copy(alpha = 0.1f), CircleShape)
                .blur(80.dp)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Hero Header
            HeroSection()

            Spacer(modifier = Modifier.height(8.dp))

            // Stats Grid
            StatsGrid(stats)

            Spacer(modifier = Modifier.height(24.dp))

            // Quick Actions
            QuickActions()

            Spacer(modifier = Modifier.height(24.dp))

            // Recent Scans
            RecentScansSection(recentScans)

            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
fun HeroSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 48.dp)
    ) {
        Text(
            "NEXUS AI",
            style = EyebrowStyle,
            color = NexusColors.Primary,
            fontWeight = FontWeight.Bold
        )
        Text(
            "Security Dashboard",
            style = MaterialTheme.typography.headlineLarge.copy(
                fontWeight = FontWeight.ExtraBold,
                fontSize = 32.sp
            ),
            color = NexusColors.OnSurface
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Real-time protection enabled",
            style = MaterialTheme.typography.bodyMedium,
            color = NexusColors.OnSurfaceSecondary
        )
    }
}

@Composable
fun StatsGrid(stats: DashboardStats) {
    Column(modifier = Modifier.padding(horizontal = 20.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard(
                label = "Total Scans",
                value = stats.totalScans.toString(),
                icon = Icons.Rounded.Shield,
                modifier = Modifier.weight(1f),
                color = NexusColors.Primary
            )
            StatCard(
                label = "Detected",
                value = stats.totalThreats.toString(),
                icon = Icons.Rounded.WarningAmber,
                modifier = Modifier.weight(1f),
                color = NexusColors.Error
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard(
                label = "Risk Level",
                value = "${stats.averageRiskScore}%",
                icon = Icons.Rounded.AutoGraph,
                modifier = Modifier.weight(1f),
                color = NexusColors.Warning
            )
            StatCard(
                label = "Active Protections",
                value = "12",
                icon = Icons.Rounded.CheckCircle,
                modifier = Modifier.weight(1f),
                color = NexusColors.Success
            )
        }
    }
}

@Composable
fun StatCard(
    label: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    color: Color
) {
    Surface(
        modifier = modifier,
        color = NexusColors.SurfaceCard,
        shape = MaterialTheme.shapes.large,
        border = BorderStroke(1.dp, NexusColors.Hairline.copy(alpha = 0.5f))
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(color.copy(alpha = 0.1f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                value,
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 28.sp
                ),
                color = NexusColors.OnSurface
            )
            Text(
                label,
                style = MaterialTheme.typography.labelMedium,
                color = NexusColors.OnSurfaceMuted
            )
        }
    }
}

@Composable
fun QuickActions() {
    Column(modifier = Modifier.padding(horizontal = 20.dp)) {
        Text(
            "QUICK ACTIONS",
            style = EyebrowStyle,
            color = NexusColors.OnSurfaceMuted,
            modifier = Modifier.padding(bottom = 12.dp, start = 4.dp)
        )

        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = NexusColors.SurfaceCard,
            shape = MaterialTheme.shapes.large,
            border = BorderStroke(1.dp, NexusColors.Hairline.copy(alpha = 0.5f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ActionBtn(
                    label = "New Scan",
                    icon = Icons.Rounded.AddCircle,
                    color = NexusColors.Primary,
                    modifier = Modifier.weight(1f)
                )
                ActionBtn(
                    label = "Settings",
                    icon = Icons.Rounded.Settings,
                    color = NexusColors.OnSurfaceSecondary,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
fun ActionBtn(label: String, icon: ImageVector, color: Color, modifier: Modifier) {
    Surface(
        onClick = {},
        modifier = modifier.height(56.dp),
        color = color.copy(alpha = 0.1f),
        shape = MaterialTheme.shapes.medium,
        contentColor = color
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(icon, null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(label, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun RecentScansSection(scans: List<ScanJob>) {
    Column(modifier = Modifier.padding(horizontal = 20.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp, start = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "RECENT ACTIVITY",
                style = EyebrowStyle,
                color = NexusColors.OnSurfaceMuted
            )
            Text(
                "View All",
                style = MaterialTheme.typography.labelLarge,
                color = NexusColors.Primary
            )
        }

        if (scans.isEmpty()) {
            EmptyState()
        } else {
            scans.take(3).forEach { scan ->
                ScanListItem(scan)
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}

@Composable
fun ScanListItem(scan: ScanJob) {
    val riskColor = when (scan.riskLevel) {
        "critical" -> NexusColors.Error
        "high" -> NexusColors.Warning
        "medium" -> NexusColors.Warning
        else -> NexusColors.Success
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = NexusColors.SurfaceCard,
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, NexusColors.Hairline.copy(alpha = 0.3f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(riskColor.copy(alpha = 0.1f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Rounded.Description,
                    null,
                    tint = riskColor,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    scan.fileName,
                    style = MaterialTheme.typography.bodyLarge,
                    color = NexusColors.OnSurface,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    "Threat Score: ${scan.riskScore ?: 0}/100",
                    style = MaterialTheme.typography.bodySmall,
                    color = NexusColors.OnSurfaceMuted
                )
            }
            Icon(
                Icons.Rounded.ChevronRight,
                null,
                tint = NexusColors.OnSurfaceMuted,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
fun EmptyState() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = NexusColors.SurfaceCard,
        shape = MaterialTheme.shapes.large,
        border = BorderStroke(1.dp, NexusColors.Hairline.copy(alpha = 0.5f))
    ) {
        Column(
            modifier = Modifier.padding(40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Rounded.CloudOff,
                null,
                modifier = Modifier.size(48.dp),
                tint = NexusColors.OnSurfaceMuted.copy(alpha = 0.5f)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                "No Activity Yet",
                style = MaterialTheme.typography.titleMedium,
                color = NexusColors.OnSurfaceSecondary
            )
        }
    }
}
