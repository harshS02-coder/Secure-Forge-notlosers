package com.nexusai.security.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexusai.security.data.model.DashboardStats
import com.nexusai.security.data.model.ScanJob
import com.nexusai.security.data.repository.ScanRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: ScanRepository
) : ViewModel() {

    private val _stats = MutableStateFlow(DashboardStats(0, 0, 0, 0, 0, 0, 0, 0))
    val stats: StateFlow<DashboardStats> = _stats

    private val _recentScans = MutableStateFlow<List<ScanJob>>(emptyList())
    val recentScans: StateFlow<List<ScanJob>> = _recentScans

    init {
        loadStats()
        loadRecentScans()
    }

    private fun loadStats() {
        viewModelScope.launch {
            repository.getStats().onSuccess { _stats.value = it }
        }
    }

    private fun loadRecentScans() {
        viewModelScope.launch {
            repository.getRecentScans().onSuccess { _recentScans.value = it }
        }
    }
}
