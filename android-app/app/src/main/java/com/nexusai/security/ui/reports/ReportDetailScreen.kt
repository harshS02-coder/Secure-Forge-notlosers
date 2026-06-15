package com.nexusai.security.ui.reports

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.nexusai.security.data.model.FullReport
import com.nexusai.security.data.model.ThreatFinding
import com.nexusai.security.ui.theme.NexusColors
import com.nexusai.security.ui.theme.EyebrowStyle

@Composable
fun ReportDetailScreen(
    scanId: Long,
    navController: NavController,
    viewModel: ReportsViewModel = hiltViewModel()
) {
    val report by viewModel.report.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }

    LaunchedEffect(scanId) {
        viewModel.loadReport(scanId)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NexusColors.SurfaceSecondary)
    ) {
        // Header
        Surface(color = NexusColors.Surface) {
            Column(modifier = Modifier.padding(16.dp)) {
                TextButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.Default.ArrowBack, null, tint = NexusColors.OnSurface)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Back", color = NexusColors.OnSurface)
                }

                report?.let { r ->
                    Text("Scan #${r.scan.id}", style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
                    Text(r.scan.fileName, style = MaterialTheme.typography.headlineLarge)

                    Spacer(modifier = Modifier.height(8.dp))

                    // Score badge
                    val riskColor = when (r.scan.riskLevel) {
                        "critical" -> NexusColors.Error
                        "high" -> NexusColors.Warning
                        "medium" -> NexusColors.Warning
                        else -> NexusColors.Success
                    }
                    val riskBg = when (r.scan.riskLevel) {
                        "critical" -> NexusColors.ErrorBg
                        "high" -> NexusColors.WarningBg
                        "medium" -> NexusColors.WarningBg
                        else -> NexusColors.SuccessBg
                    }
                    Surface(color = riskBg, shape = RoundedCornerShape(0.dp)) {
                        Row(modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("${r.scan.riskScore ?: 0}", style = MaterialTheme.typography.titleLarge.copy(fontSize = 28.sp, color = riskColor))
                            Text("/100  ", style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
                            Text((r.scan.riskLevel ?: "unknown").uppercase(), style = MaterialTheme.typography.labelSmall, color = riskColor)
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Tabs
                    TabRow(
                        selectedTabIndex = selectedTab,
                        containerColor = NexusColors.Surface,
                        contentColor = NexusColors.Primary,
                        indicator = { tabPositions ->
                            if (selectedTab < tabPositions.size) {
                                Box(
                                    modifier = Modifier
                                        .tabIndicatorOffset(tabPositions[selectedTab])
                                        .height(2.dp)
                                        .background(NexusColors.Primary)
                                )
                            }
                        }
                    ) {
                        listOf("OVERVIEW", "THREATS", "AI").forEachIndexed { index, title ->
                            Tab(
                                selected = selectedTab == index,
                                onClick = { selectedTab = index },
                                text = { Text(title, style = MaterialTheme.typography.labelSmall) }
                            )
                        }
                    }
                }
            }
        }

        // Content
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = NexusColors.Primary)
            }
        } else {
            report?.let { r ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp)
                ) {
                    when (selectedTab) {
                        0 -> OverviewTab(r)
                        1 -> ThreatsTab(r.findings)
                        2 -> AIAnalysisTab(r)
                    }
                }
            }
        }
    }
}

@Composable
fun OverviewTab(report: FullReport) {
    // Risk Breakdown
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(1.dp, NexusColors.Hairline)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Risk Breakdown", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(12.dp))
            ScoreBar("Static Analysis", report.scan.staticScore ?: 0)
            Spacer(modifier = Modifier.height(8.dp))
            ScoreBar("Behavioral Analysis", report.scan.behaviorScore ?: 0)
            Spacer(modifier = Modifier.height(8.dp))
            ScoreBar("AI Detection", report.scan.dynamicScore ?: 0)
        }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // AI Summary
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(1.dp, NexusColors.Hairline)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("AI ANALYSIS", style = EyebrowStyle, color = NexusColors.OnSurfaceSecondary)
            Spacer(modifier = Modifier.height(8.dp))
            Text(report.summary.aiExecutiveSummary, style = MaterialTheme.typography.bodyMedium)
        }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Recommendations
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(1.dp, NexusColors.Hairline)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Recommendations", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(8.dp))
            report.summary.recommendations.forEach { rec ->
                Row(modifier = Modifier.padding(vertical = 4.dp)) {
                    Icon(Icons.Default.CheckCircle, null, tint = NexusColors.Success, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(rec, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

@Composable
fun ScoreBar(label: String, score: Int) {
    val color = when {
        score > 75 -> NexusColors.Error
        score > 50 -> NexusColors.Warning
        score > 25 -> NexusColors.Warning
        else -> NexusColors.Success
    }

    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, style = MaterialTheme.typography.bodySmall)
            Text("$score/100", style = MaterialTheme.typography.bodySmall, color = color)
        }
        Spacer(modifier = Modifier.height(4.dp))
        LinearProgressIndicator(
            progress = score / 100f,
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp),
            color = color,
            trackColor = NexusColors.Hairline
        )
    }
}

@Composable
fun ThreatsTab(findings: List<ThreatFinding>) {
    if (findings.isEmpty()) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(0.dp),
            colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
            border = BorderStroke(1.dp, NexusColors.Hairline)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(Icons.Default.Security, null, tint = NexusColors.Success, modifier = Modifier.size(48.dp))
                Spacer(modifier = Modifier.height(8.dp))
                Text("No threats detected", style = MaterialTheme.typography.titleLarge)
                Text("This application appears safe", style = MaterialTheme.typography.bodyMedium, color = NexusColors.OnSurfaceMuted)
            }
        }
    } else {
        findings.forEach { finding ->
            ThreatCard(finding)
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun ThreatCard(finding: ThreatFinding) {
    var expanded by remember { mutableStateOf(false) }
    val borderColor = when (finding.severity) {
        "critical" -> NexusColors.Error
        "high" -> NexusColors.Warning
        "medium" -> NexusColors.Warning
        else -> NexusColors.Success
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(1.dp, NexusColors.Hairline)
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .width(4.dp)
                        .height(40.dp)
                        .background(borderColor)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(finding.title, style = MaterialTheme.typography.bodyLarge)
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(color = when (finding.severity) {
                            "critical" -> NexusColors.ErrorBg
                            "high" -> NexusColors.WarningBg
                            else -> NexusColors.SuccessBg
                        }, shape = RoundedCornerShape(0.dp)) {
                            Text(
                                finding.severity.uppercase(),
                                style = MaterialTheme.typography.labelSmall,
                                color = borderColor,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(finding.description ?: "", style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
                }
                IconButton(onClick = { expanded = !expanded }) {
                    Icon(
                        if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                        null,
                        tint = NexusColors.OnSurfaceMuted
                    )
                }
            }

            AnimatedVisibility(visible = expanded) {
                Column(modifier = Modifier.padding(16.dp)) {
                    finding.evidence?.let { evidence ->
                        Text("Evidence:", style = MaterialTheme.typography.labelSmall, color = NexusColors.OnSurfaceSecondary)
                        evidence.forEach { e ->
                            Surface(
                                color = NexusColors.SurfaceSecondary,
                                shape = RoundedCornerShape(0.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 2.dp)
                            ) {
                                Text(e, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(8.dp))
                            }
                        }
                    }
                    finding.recommendation?.let { rec ->
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Recommendation:", style = MaterialTheme.typography.labelSmall, color = NexusColors.OnSurfaceSecondary)
                        Text(rec, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}

@Composable
fun AIAnalysisTab(report: FullReport) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(1.dp, NexusColors.Hairline)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("EXECUTIVE SUMMARY", style = EyebrowStyle, color = NexusColors.OnSurfaceSecondary)
            Spacer(modifier = Modifier.height(8.dp))
            Text(report.summary.aiExecutiveSummary, style = MaterialTheme.typography.bodyMedium)
        }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Stats
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(
            "Critical" to report.summary.criticalCount,
            "High" to report.summary.highCount,
            "Medium" to report.summary.mediumCount
        ).forEach { (label, count) ->
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(0.dp),
                colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
                border = BorderStroke(1.dp, NexusColors.Hairline)
            ) {
                Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(count.toString(), style = MaterialTheme.typography.headlineMedium.copy(fontSize = 28.sp))
                    Text(label, style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
                }
            }
        }
    }
}
