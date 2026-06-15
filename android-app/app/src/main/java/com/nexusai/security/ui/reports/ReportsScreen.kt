package com.nexusai.security.ui.reports

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.nexusai.security.data.model.ScanJob
import com.nexusai.security.ui.theme.NexusColors
import com.nexusai.security.ui.theme.EyebrowStyle

@Composable
fun ReportsScreen(
    navController: NavController,
    viewModel: ReportsViewModel = hiltViewModel()
) {
    val scans by viewModel.scans.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var filter by remember { mutableStateOf("all") }

    val filteredScans = scans.filter {
        filter == "all" || it.riskLevel == filter
    }

    val filters = listOf("all" to "All", "critical" to "Critical", "high" to "High", "medium" to "Medium", "low" to "Low")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NexusColors.SurfaceSecondary)
    ) {
        // Header
        Surface(
            color = NexusColors.Surface,
            tonalElevation = 0.dp
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("THREAT REPORTS", style = EyebrowStyle, color = NexusColors.OnSurfaceSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                Text("All Reports", style = MaterialTheme.typography.headlineLarge, color = NexusColors.OnSurface)
            }
        }

        // Filters
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            filters.forEach { (value, label) ->
                Button(
                    onClick = { filter = value },
                    shape = RoundedCornerShape(0.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (filter == value) NexusColors.OnSurface else NexusColors.Surface,
                        contentColor = if (filter == value) NexusColors.OnInverse else NexusColors.OnSurface
                    ),
                    border = if (filter != value) BorderStroke(1.dp, NexusColors.Hairline) else null,
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(label, style = MaterialTheme.typography.labelSmall)
                }
            }
        }

        // List
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = NexusColors.Primary)
            }
        } else if (filteredScans.isEmpty()) {
            EmptyReports()
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredScans) { scan ->
                    ReportCard(scan) {
                        navController.navigate("report/${scan.id}")
                    }
                }
            }
        }
    }
}

@Composable
fun ReportCard(scan: ScanJob, onClick: () -> Unit) {
    val riskColor = when (scan.riskLevel) {
        "critical" -> NexusColors.Error
        "high" -> NexusColors.Warning
        "medium" -> NexusColors.Warning
        else -> NexusColors.Success
    }
    val riskBg = when (scan.riskLevel) {
        "critical" -> NexusColors.ErrorBg
        "high" -> NexusColors.WarningBg
        "medium" -> NexusColors.WarningBg
        else -> NexusColors.SuccessBg
    }

    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(1.dp, NexusColors.Hairline)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(NexusColors.SurfaceSecondary),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Description, null, tint = riskColor)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    scan.fileName,
                    style = MaterialTheme.typography.bodyLarge,
                    color = NexusColors.OnSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    scan.createdAt.substringBefore("T"),
                    style = MaterialTheme.typography.bodySmall,
                    color = NexusColors.OnSurfaceMuted
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "${scan.riskScore ?: 0}",
                    style = MaterialTheme.typography.titleLarge.copy(fontSize = 24.sp, color = riskColor)
                )
                Text("/100", style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
                Spacer(modifier = Modifier.width(8.dp))
                Surface(color = riskBg, shape = RoundedCornerShape(0.dp)) {
                    Text(
                        (scan.riskLevel ?: "unknown").uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = riskColor,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Icon(Icons.Default.ChevronRight, null, tint = NexusColors.OnSurfaceMuted)
            }
        }
    }
}

@Composable
fun EmptyReports() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                Icons.Default.Security,
                null,
                modifier = Modifier.size(64.dp),
                tint = NexusColors.Hairline
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text("No reports yet", style = MaterialTheme.typography.headlineSmall, color = NexusColors.OnSurface)
            Text("Scan your first APK to get started", style = MaterialTheme.typography.bodyMedium, color = NexusColors.OnSurfaceMuted)
        }
    }
}
