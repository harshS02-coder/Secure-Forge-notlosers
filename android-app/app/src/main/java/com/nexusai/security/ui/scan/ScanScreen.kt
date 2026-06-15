package com.nexusai.security.ui.scan

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nexusai.security.ui.theme.NexusColors
import com.nexusai.security.ui.theme.EyebrowStyle

@Composable
fun ScanScreen(
    viewModel: ScanViewModel = hiltViewModel()
) {
    val scanState by viewModel.scanState.collectAsState()
    val progress by viewModel.scanProgress.collectAsState()
    val steps by viewModel.scanSteps.collectAsState()

    var selectedFile by remember { mutableStateOf<Uri?>(null) }
    var fileBytes by remember { mutableStateOf<ByteArray?>(null) }
    var fileName by remember { mutableStateOf("") }

    val context = LocalContext.current
    val filePicker = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            selectedFile = it
            fileName = it.lastPathSegment ?: "unknown.apk"
            context.contentResolver.openInputStream(it)?.use { stream ->
                fileBytes = stream.readBytes()
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .background(NexusColors.SurfaceSecondary)
            .padding(16.dp)
    ) {
        // Header
        Text(
            "NEW SCAN",
            style = EyebrowStyle,
            color = NexusColors.OnSurfaceSecondary
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Analyze APK",
            style = MaterialTheme.typography.headlineLarge,
            color = NexusColors.OnSurface
        )
        Spacer(modifier = Modifier.height(24.dp))

        when (scanState) {
            is ScanState.Idle, is ScanState.Error -> {
                UploadSection(
                    selectedFile = selectedFile,
                    fileName = fileName,
                    onPickFile = { filePicker.launch("application/vnd.android.package-archive") },
                    onClearFile = {
                        selectedFile = null
                        fileBytes = null
                        fileName = ""
                    },
                    onStartScan = {
                        fileBytes?.let { bytes ->
                            viewModel.startScan(fileName, bytes)
                        }
                    },
                    canStart = fileBytes != null
                )
            }
            is ScanState.Uploading, is ScanState.Processing -> {
                ProgressSection(progress, steps)
            }
            is ScanState.Completed -> {
                val job = (scanState as ScanState.Completed).job
                ResultSection(job, onReset = { viewModel.reset() })
            }
            else -> {}
        }

        Spacer(modifier = Modifier.height(24.dp))

        // How it works
        HowItWorksSection()
    }
}

@Composable
fun UploadSection(
    selectedFile: Uri?,
    fileName: String,
    onPickFile: () -> Unit,
    onClearFile: () -> Unit,
    onStartScan: () -> Unit,
    canStart: Boolean
) {
    // Drop zone
    Card(
        onClick = onPickFile,
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(2.dp, NexusColors.Hairline)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                Icons.Default.CloudUpload,
                null,
                modifier = Modifier.size(48.dp),
                tint = NexusColors.OnSurfaceMuted
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                "Drag APK file here or tap to browse",
                style = MaterialTheme.typography.bodyLarge,
                color = NexusColors.OnSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "Supports .apk files up to 100MB",
                style = MaterialTheme.typography.bodySmall,
                color = NexusColors.OnSurfaceMuted
            )
        }
    }

    // Selected file
    AnimatedVisibility(visible = selectedFile != null) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp),
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
                    Icon(
                        Icons.Default.InsertDriveFile,
                        null,
                        tint = NexusColors.Primary
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        fileName,
                        style = MaterialTheme.typography.bodyLarge,
                        color = NexusColors.OnSurface
                    )
                }
                IconButton(onClick = onClearFile) {
                    Icon(Icons.Default.Close, null, tint = NexusColors.OnSurfaceMuted)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = onStartScan,
            enabled = canStart,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(0.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = NexusColors.Primary,
                disabledContainerColor = NexusColors.PrimaryDisabled
            )
        ) {
            Icon(Icons.Default.Security, null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Start Analysis", style = MaterialTheme.typography.labelMedium)
        }
    }
}

@Composable
fun ProgressSection(progress: Int, steps: List<ScanStep>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(1.dp, NexusColors.Hairline)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
            .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Progress Ring
            Box(
                modifier = Modifier.size(140.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    progress = progress / 100f,
                    modifier = Modifier.fillMaxSize(),
                    strokeWidth = 8.dp,
                    color = NexusColors.Primary
                )
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "$progress",
                        style = MaterialTheme.typography.headlineLarge.copy(fontSize = 40.sp)
                    )
                    Text("%", style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Steps
            steps.forEach { step ->
                StepItem(step)
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
fun StepItem(step: ScanStep) {
    val (icon, color) = when (step.status) {
        ScanStepStatus.COMPLETED -> Icons.Default.CheckCircle to NexusColors.Success
        ScanStepStatus.ACTIVE -> Icons.Default.Refresh to NexusColors.Primary
        ScanStepStatus.ERROR -> Icons.Default.Error to NexusColors.Error
        else -> Icons.Default.RadioButtonUnchecked to NexusColors.OnSurfaceMuted
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(NexusColors.SurfaceSecondary)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            step.label,
            style = MaterialTheme.typography.bodyMedium,
            color = when (step.status) {
                ScanStepStatus.ACTIVE -> NexusColors.OnSurface
                ScanStepStatus.COMPLETED -> NexusColors.Success
                else -> NexusColors.OnSurfaceMuted
            },
            fontWeight = if (step.status == ScanStepStatus.ACTIVE) FontWeight.Medium else FontWeight.Light
        )
    }
}

@Composable
fun ResultSection(job: com.nexusai.security.data.model.ScanJob, onReset: () -> Unit) {
    val riskColor = when (job.riskLevel) {
        "critical" -> NexusColors.Error
        "high" -> NexusColors.Warning
        "medium" -> NexusColors.Warning
        else -> NexusColors.Success
    }

    val riskBg = when (job.riskLevel) {
        "critical" -> NexusColors.ErrorBg
        "high" -> NexusColors.WarningBg
        "medium" -> NexusColors.WarningBg
        else -> NexusColors.SuccessBg
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
        border = BorderStroke(1.dp, NexusColors.Hairline)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Score
            Box(
                modifier = Modifier
                    .size(120.dp)
                .background(riskBg),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "${job.riskScore ?: 0}",
                        style = MaterialTheme.typography.displayMedium.copy(
                            color = riskColor,
                            fontSize = 48.sp
                        )
                    )
                    Text(
                        (job.riskLevel ?: "unknown").uppercase(),
                        style = MaterialTheme.typography.labelSmall.copy(color = riskColor)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                job.fileName,
                style = MaterialTheme.typography.titleLarge
            )

            Spacer(modifier = Modifier.height(8.dp))

            // AI Summary
            job.aiSummary?.let { summary ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(0.dp),
                    colors = CardDefaults.cardColors(containerColor = NexusColors.SurfaceSecondary),
                    border = BorderStroke(1.dp, NexusColors.Hairline)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "AI ANALYSIS",
                            style = EyebrowStyle,
                            color = NexusColors.OnSurfaceSecondary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            summary,
                            style = MaterialTheme.typography.bodyMedium,
                            color = NexusColors.OnSurface
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onReset,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(0.dp),
                colors = ButtonDefaults.buttonColors(containerColor = NexusColors.Primary)
            ) {
                Text("Scan Another", style = MaterialTheme.typography.labelMedium)
            }
        }
    }
}

@Composable
fun HowItWorksSection() {
    Text(
        "HOW IT WORKS",
        style = EyebrowStyle,
        color = NexusColors.OnSurfaceSecondary,
        modifier = Modifier.padding(bottom = 12.dp)
    )

    val steps = listOf(
        Triple(Icons.Default.Lock, "Static Analysis", "Decompiles APK to examine permissions and code patterns"),
        Triple(Icons.Default.Memory, "AI Detection", "LLM-agnostic engine analyzes for malicious behavior"),
        Triple(Icons.Default.Assessment, "Risk Scoring", "Comprehensive score from static, behavioral, and AI analysis")
    )

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        steps.forEach { (icon, title, desc) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(0.dp),
                colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
                border = BorderStroke(1.dp, NexusColors.Hairline)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(icon, null, tint = NexusColors.Primary, modifier = Modifier.size(28.dp))
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(title, style = MaterialTheme.typography.titleMedium, color = NexusColors.OnSurface)
                        Text(desc, style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
                    }
                }
            }
        }
    }
}
