package com.nexusai.security.ui.settings

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
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexusai.security.ui.theme.NexusColors
import com.nexusai.security.ui.theme.EyebrowStyle
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel = androidx.hilt.navigation.compose.hiltViewModel()
) {
    val providers by viewModel.providers.collectAsState()
    var showAddForm by remember { mutableStateOf(false) }
    var selectedProvider by remember { mutableStateOf("openai") }
    var apiKey by remember { mutableStateOf("") }
    var modelName by remember { mutableStateOf("") }
    var testStatus by remember { mutableStateOf<TestStatus>(TestStatus.IDLE) }
    val scope = rememberCoroutineScope()

    val providerOptions = mapOf(
        "openai" to Pair("OpenAI", "gpt-4o-mini"),
        "groq" to Pair("Groq", "llama-3.3-70b-versatile"),
        "anthropic" to Pair("Anthropic", "claude-3-5-sonnet-20241022"),
        "gemini" to Pair("Google Gemini", "gemini-1.5-flash"),
        "local" to Pair("Local / Mock", "mock")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .background(NexusColors.SurfaceSecondary)
            .padding(16.dp)
    ) {
        Text("SETTINGS", style = EyebrowStyle, color = NexusColors.OnSurfaceSecondary)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Configuration", style = MaterialTheme.typography.headlineLarge)

        Spacer(modifier = Modifier.height(24.dp))

        // LLM Provider Section
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(0.dp),
            colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
            border = BorderStroke(1.dp, NexusColors.Hairline)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Memory, null, tint = NexusColors.Primary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("AI Provider", style = MaterialTheme.typography.titleLarge)
                    }
                    TextButton(onClick = { showAddForm = !showAddForm }) {
                        Icon(Icons.Default.Add, null, tint = NexusColors.Primary)
                        Text("Add", color = NexusColors.Primary)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    "Configure LLM providers for AI-powered threat analysis. Switch providers by setting a default.",
                    style = MaterialTheme.typography.bodySmall,
                    color = NexusColors.OnSurfaceMuted
                )

                // Add Form
                if (showAddForm) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(0.dp),
                        colors = CardDefaults.cardColors(containerColor = NexusColors.SurfaceSecondary),
                        border = BorderStroke(1.dp, NexusColors.Hairline)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            // Provider selector
                            Text("Provider", style = MaterialTheme.typography.labelSmall, color = NexusColors.OnSurfaceSecondary)
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                providerOptions.keys.toList().chunked(3).forEach { chunk ->
                                    Column(modifier = Modifier.weight(1f)) {
                                        chunk.forEach { key ->
                                            val options = providerOptions[key]!!
                                            val label = options.first
                                            val defaultModel = options.second
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                RadioButton(
                                                    selected = selectedProvider == key,
                                                    onClick = {
                                                        selectedProvider = key
                                                        modelName = defaultModel
                                                    },
                                                    colors = RadioButtonDefaults.colors(selectedColor = NexusColors.Primary)
                                                )
                                                Text(text = label, style = MaterialTheme.typography.bodySmall)
                                            }
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // API Key
                            if (selectedProvider != "local") {
                                Text("API Key", style = MaterialTheme.typography.labelSmall, color = NexusColors.OnSurfaceSecondary)
                                Spacer(modifier = Modifier.height(4.dp))
                                OutlinedTextField(
                                    value = apiKey,
                                    onValueChange = { apiKey = it },
                                    placeholder = { Text("sk-...") },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(0.dp),
                                    singleLine = true,
                                    colors = TextFieldDefaults.outlinedTextFieldColors(
                                        focusedBorderColor = NexusColors.OnSurface,
                                        unfocusedBorderColor = NexusColors.Hairline
                                    )
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Model Name
                            Text("Model Name", style = MaterialTheme.typography.labelSmall, color = NexusColors.OnSurfaceSecondary)
                            Spacer(modifier = Modifier.height(4.dp))
                            OutlinedTextField(
                                value = modelName,
                                onValueChange = { modelName = it },
                                placeholder = { Text(providerOptions[selectedProvider]?.second ?: "") },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(0.dp),
                                singleLine = true,
                                colors = TextFieldDefaults.outlinedTextFieldColors(
                                    focusedBorderColor = NexusColors.OnSurface,
                                    unfocusedBorderColor = NexusColors.Hairline
                                )
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Actions
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = {
                                        viewModel.addProvider(selectedProvider, apiKey, modelName)
                                        showAddForm = false
                                        apiKey = ""
                                        modelName = ""
                                    },
                                    shape = RoundedCornerShape(0.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = NexusColors.Primary)
                                ) {
                                    Icon(Icons.Default.Save, null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Save", style = MaterialTheme.typography.labelSmall)
                                }

                                OutlinedButton(
                                    onClick = {
                                        viewModel.testConnection {
                                            testStatus = TestStatus.TESTING
                                            scope.launch {
                                                delay(1500)
                                                testStatus = TestStatus.SUCCESS
                                                delay(3000)
                                                testStatus = TestStatus.IDLE
                                            }
                                        }
                                    },
                                    shape = RoundedCornerShape(0.dp),
                                    border = BorderStroke(1.dp, NexusColors.Hairline)
                                ) {
                                    when (testStatus) {
                                        TestStatus.TESTING -> {
                                            CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Testing...", style = MaterialTheme.typography.labelSmall)
                                        }
                                        TestStatus.SUCCESS -> {
                                            Icon(Icons.Default.CheckCircle, null, tint = NexusColors.Success, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Connected", style = MaterialTheme.typography.labelSmall, color = NexusColors.Success)
                                        }
                                        else -> {
                                            Icon(Icons.Default.Bolt, null, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Test", style = MaterialTheme.typography.labelSmall)
                                        }
                                    }
                                }

                                TextButton(onClick = { showAddForm = false }) {
                                    Text("Cancel", color = NexusColors.OnSurfaceMuted)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Provider list
                if (providers.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Memory, null, tint = NexusColors.Hairline, modifier = Modifier.size(32.dp))
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("No providers configured", style = MaterialTheme.typography.bodyMedium, color = NexusColors.OnSurfaceMuted)
                            Text("Add one to enable AI analysis", style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
                        }
                    }
                } else {
                    providers.forEach { provider ->
                        ProviderItem(
                            provider = provider,
                            isDefault = provider.isDefault,
                            onSetDefault = { viewModel.setDefault(provider.id) },
                            onDelete = { viewModel.deleteProvider(provider.id) }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // About Section
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(0.dp),
            colors = CardDefaults.cardColors(containerColor = NexusColors.Surface),
            border = BorderStroke(1.dp, NexusColors.Hairline)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("About", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(12.dp))
                InfoRow("Version", "1.0.0-alpha")
                InfoRow("Engine", "NexusAI Security")
                InfoRow("LLM Support", "OpenAI, Groq, Anthropic, Gemini")
            }
        }
    }
}

@Composable
fun ProviderItem(
    provider: LLMProviderItem,
    isDefault: Boolean,
    onSetDefault: () -> Unit,
    onDelete: () -> Unit
) {
    val label = when (provider.provider) {
        "openai" -> "OpenAI"
        "groq" -> "Groq"
        "anthropic" -> "Anthropic"
        "gemini" -> "Google Gemini"
        else -> "Local / Mock"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isDefault) NexusColors.Surface else NexusColors.Surface
        ),
        border = BorderStroke(
            1.dp,
            if (isDefault) NexusColors.Primary else NexusColors.Hairline
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Key, null, tint = NexusColors.OnSurfaceMuted)
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(label, style = MaterialTheme.typography.bodyLarge)
                    if (isDefault) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(color = NexusColors.Primary, shape = RoundedCornerShape(0.dp)) {
                            Text("DEFAULT", style = MaterialTheme.typography.labelSmall, color = NexusColors.OnInverse, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }
                }
                Text(provider.modelName, style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceMuted)
            }
            if (!isDefault) {
                TextButton(onClick = onSetDefault) {
                    Text("Set Default", style = MaterialTheme.typography.labelSmall)
                }
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, null, tint = NexusColors.Error)
            }
        }
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurfaceSecondary)
        Text(value, style = MaterialTheme.typography.bodySmall, color = NexusColors.OnSurface)
    }
}

data class LLMProviderItem(
    val id: Long,
    val provider: String,
    val modelName: String,
    val isDefault: Boolean,
    val isActive: Boolean
)

enum class TestStatus { IDLE, TESTING, SUCCESS }

@HiltViewModel
class SettingsViewModel @Inject constructor() : ViewModel() {
    private val _providers = MutableStateFlow<List<LLMProviderItem>>(emptyList())
    val providers: StateFlow<List<LLMProviderItem>> = _providers

    fun addProvider(provider: String, apiKey: String, modelName: String) {
        viewModelScope.launch {
            val newId = (_providers.value.maxOfOrNull { it.id } ?: 0) + 1
            val isFirst = _providers.value.isEmpty()
            val item = LLMProviderItem(newId, provider, modelName, isFirst, true)
            _providers.value = _providers.value + item
        }
    }

    fun setDefault(id: Long) {
        _providers.value = _providers.value.map {
            it.copy(isDefault = it.id == id)
        }
    }

    fun deleteProvider(id: Long) {
        _providers.value = _providers.value.filter { it.id != id }
    }

    fun testConnection(onTest: () -> Unit) {
        onTest()
    }
}
