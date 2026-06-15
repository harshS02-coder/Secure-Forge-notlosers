package com.nexusai.security.data.model

import com.google.gson.annotations.SerializedName

data class ScanJob(
    val id: Long,
    val fileName: String,
    val fileHash: String,
    val fileSize: Long,
    val mimeType: String?,
    val status: String,
    val riskScore: Int?,
    val riskLevel: String?,
    val aiSummary: String?,
    val staticScore: Int?,
    val dynamicScore: Int?,
    val behaviorScore: Int?,
    val createdAt: String,
    val updatedAt: String,
    val completedAt: String?
)

data class ThreatFinding(
    val id: Long,
    val scanJobId: Long,
    val category: String,
    val severity: String,
    val title: String,
    val description: String?,
    val evidence: List<String>?,
    val recommendation: String?,
    val aiAnalysis: String?,
    val createdAt: String
)

data class Permission(
    val name: String,
    val level: String,
    val description: String
)

data class APIUsage(
    val className: String,
    val methodName: String,
    val frequency: Int,
    val riskLevel: String
)

data class DashboardStats(
    val totalScans: Int,
    val totalThreats: Int,
    val criticalCount: Int,
    val highCount: Int,
    val mediumCount: Int,
    val lowCount: Int,
    val scansThisWeek: Int,
    val averageRiskScore: Int
)

data class ReportSummary(
    val totalThreats: Int,
    val criticalCount: Int,
    val highCount: Int,
    val mediumCount: Int,
    val lowCount: Int,
    val aiExecutiveSummary: String,
    val recommendations: List<String>
)

data class FullReport(
    val scan: ScanJob,
    val findings: List<ThreatFinding>,
    val summary: ReportSummary
)

data class CreateScanRequest(
    val fileName: String,
    val fileHash: String,
    val fileSize: Long,
    val mimeType: String?
)

data class ScanResponse(
    val id: Long
)

data class LLMConfig(
    val id: Long,
    val provider: String,
    val modelName: String,
    val isDefault: Boolean,
    val isActive: Boolean
)

data class AddLLMConfigRequest(
    val provider: String,
    val apiKey: String,
    val modelName: String
)

enum class ScanStatus {
    @SerializedName("pending") PENDING,
    @SerializedName("processing") PROCESSING,
    @SerializedName("completed") COMPLETED,
    @SerializedName("failed") FAILED
}

enum class RiskLevel {
    LOW, MEDIUM, HIGH, CRITICAL
}

enum class Severity {
    INFO, LOW, MEDIUM, HIGH, CRITICAL
}
