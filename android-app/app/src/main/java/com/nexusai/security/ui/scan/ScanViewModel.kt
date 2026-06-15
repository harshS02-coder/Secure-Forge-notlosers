package com.nexusai.security.ui.scan

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexusai.security.data.model.ScanJob
import com.nexusai.security.data.repository.ScanRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ScanViewModel @Inject constructor(
    private val repository: ScanRepository
) : ViewModel() {

    private val _scanState = MutableStateFlow<ScanState>(ScanState.Idle)
    val scanState: StateFlow<ScanState> = _scanState

    private val _scanProgress = MutableStateFlow(0)
    val scanProgress: StateFlow<Int> = _scanProgress

    private val _scanSteps = MutableStateFlow<List<ScanStep>>(defaultSteps())
    val scanSteps: StateFlow<List<ScanStep>> = _scanSteps

    private var currentJobId: Long? = null

    fun startScan(fileName: String, fileBytes: ByteArray) {
        viewModelScope.launch {
            _scanState.value = ScanState.Uploading
            _scanProgress.value = 10
            updateStep(0, ScanStepStatus.COMPLETED)
            updateStep(1, ScanStepStatus.ACTIVE)

            repository.createScan(fileName, fileBytes).onSuccess { job ->
                currentJobId = job.id
                _scanState.value = ScanState.Processing
                pollForCompletion(job.id)
            }.onFailure {
                _scanState.value = ScanState.Error(it.message ?: "Upload failed")
            }
        }
    }

    private suspend fun pollForCompletion(jobId: Long) {
        repeat(30) { iteration ->
            delay(2000)
            repository.getScan(jobId).onSuccess { job ->
                _scanProgress.value = 15 + (iteration * 3)

                when (job.status) {
                    "processing" -> {
                        updateStep(1, ScanStepStatus.COMPLETED)
                        updateStep(2, ScanStepStatus.COMPLETED)
                        updateStep(3, ScanStepStatus.COMPLETED)
                        updateStep(4, ScanStepStatus.ACTIVE)
                    }
                    "completed" -> {
                        completeAllSteps()
                        _scanProgress.value = 100
                        _scanState.value = ScanState.Completed(job)
                        return
                    }
                    "failed" -> {
                        _scanState.value = ScanState.Error("Analysis failed")
                        return
                    }
                    else -> { /* pending */ }
                }
            }
        }
    }

    fun reset() {
        _scanState.value = ScanState.Idle
        _scanProgress.value = 0
        _scanSteps.value = defaultSteps()
        currentJobId = null
    }

    private fun updateStep(index: Int, status: ScanStepStatus) {
        val steps = _scanSteps.value.toMutableList()
        if (index < steps.size) {
            steps[index] = steps[index].copy(status = status)
            _scanSteps.value = steps
        }
    }

    private fun completeAllSteps() {
        _scanSteps.value = _scanSteps.value.map { it.copy(status = ScanStepStatus.COMPLETED) }
    }

    private fun defaultSteps() = listOf(
        ScanStep("Uploading file", ScanStepStatus.PENDING),
        ScanStep("Extracting APK contents", ScanStepStatus.PENDING),
        ScanStep("Analyzing permissions", ScanStepStatus.PENDING),
        ScanStep("Detecting API calls", ScanStepStatus.PENDING),
        ScanStep("Running AI threat analysis", ScanStepStatus.PENDING),
        ScanStep("Generating report", ScanStepStatus.PENDING)
    )
}

sealed class ScanState {
    object Idle : ScanState()
    object Uploading : ScanState()
    object Processing : ScanState()
    data class Completed(val job: ScanJob) : ScanState()
    data class Error(val message: String) : ScanState()
}

data class ScanStep(
    val label: String,
    val status: ScanStepStatus
)

enum class ScanStepStatus { PENDING, ACTIVE, COMPLETED, ERROR }
