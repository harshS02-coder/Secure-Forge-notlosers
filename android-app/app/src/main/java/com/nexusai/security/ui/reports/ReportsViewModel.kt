package com.nexusai.security.ui.reports

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexusai.security.data.model.FullReport
import com.nexusai.security.data.model.ScanJob
import com.nexusai.security.data.repository.ScanRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReportsViewModel @Inject constructor(
    private val repository: ScanRepository
) : ViewModel() {

    private val _scans = MutableStateFlow<List<ScanJob>>(emptyList())
    val scans: StateFlow<List<ScanJob>> = _scans

    private val _report = MutableStateFlow<FullReport?>(null)
    val report: StateFlow<FullReport?> = _report

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    init {
        loadScans()
    }

    fun loadScans() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.listScans().onSuccess { _scans.value = it }
            _isLoading.value = false
        }
    }

    fun loadReport(scanId: Long) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.getReport(scanId).onSuccess { _report.value = it }
            _isLoading.value = false
        }
    }
}
