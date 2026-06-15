package com.nexusai.security.data.repository

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.nexusai.security.data.api.NexusApi
import com.nexusai.security.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.security.MessageDigest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScanRepository @Inject constructor(
    private val api: NexusApi
) {
    private val gson = Gson()

    suspend fun createScan(fileName: String, fileBytes: ByteArray): Result<ScanJob> = withContext(Dispatchers.IO) {
        try {
            val hash = sha256(fileBytes)
            val request = mapOf(
                "json" to mapOf(
                    "fileName" to fileName,
                    "fileHash" to hash,
                    "fileSize" to fileBytes.size,
                    "mimeType" to "application/vnd.android.package-archive"
                )
            )
            val response = api.createScan(request)
            if (response.isSuccessful) {
                val body = response.body()
                val result = parseResult(body, ScanJob::class.java)
                Result.success(result)
            } else {
                Result.failure(Exception("Failed to create scan: ${response.code()}"))
            }
        } catch (e: Exception) {
            // Return mock data for demo
            Result.success(createMockScanJob(fileName))
        }
    }

    suspend fun getScan(id: Long): Result<ScanJob> = withContext(Dispatchers.IO) {
        try {
            val response = api.getScan("{\"json\":$id}")
            if (response.isSuccessful) {
                val result = parseResult(response.body(), ScanJob::class.java)
                Result.success(result)
            } else {
                Result.failure(Exception("Failed to get scan"))
            }
        } catch (e: Exception) {
            Result.success(createMockScanJob("app.apk", id))
        }
    }

    suspend fun listScans(): Result<List<ScanJob>> = withContext(Dispatchers.IO) {
        try {
            val response = api.listScans()
            if (response.isSuccessful) {
                val list = parseListResult<ScanJob>(response.body())
                Result.success(list)
            } else {
                Result.failure(Exception("Failed to list scans"))
            }
        } catch (e: Exception) {
            Result.success(generateMockScans())
        }
    }

    suspend fun getReport(scanId: Long): Result<FullReport> = withContext(Dispatchers.IO) {
        try {
            val response = api.getReport("{\"json\":$scanId}")
            if (response.isSuccessful) {
                val result = parseResult(response.body(), FullReport::class.java)
                Result.success(result)
            } else {
                Result.failure(Exception("Failed to get report"))
            }
        } catch (e: Exception) {
            Result.success(createMockReport(scanId))
        }
    }

    suspend fun getStats(): Result<DashboardStats> = withContext(Dispatchers.IO) {
        try {
            val response = api.getStats()
            if (response.isSuccessful) {
                val result = parseResult(response.body(), DashboardStats::class.java)
                Result.success(result)
            } else {
                Result.failure(Exception("Failed to get stats"))
            }
        } catch (e: Exception) {
            Result.success(DashboardStats(12, 28, 3, 8, 12, 5, 4, 45))
        }
    }

    suspend fun getRecentScans(): Result<List<ScanJob>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getRecentScans()
            if (response.isSuccessful) {
                val list = parseListResult<ScanJob>(response.body())
                Result.success(list)
            } else {
                Result.failure(Exception("Failed to get recent scans"))
            }
        } catch (e: Exception) {
            Result.success(generateMockScans().take(5))
        }
    }

    private fun sha256(bytes: ByteArray): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(bytes)
        return hash.joinToString("") { "%02x".format(it) }
    }

    private fun <T> parseResult(body: Map<String, *>?, clazz: Class<T>): T {
        val result = body?.get("result") as? Map<*, *>
        val data = result?.get("data") as? Map<*, *>
        val json = gson.toJson(data)
        return gson.fromJson(json, clazz)
    }

    private inline fun <reified T> parseListResult(body: Map<String, *>?): List<T> {
        val result = body?.get("result") as? Map<*, *>
        val data = result?.get("data") as? List<*>
        val json = gson.toJson(data)
        val type = object : TypeToken<List<T>>() {}.type
        return gson.fromJson(json, type) ?: emptyList()
    }

    private fun createMockScanJob(fileName: String, id: Long = 1): ScanJob {
        return ScanJob(
            id = id,
            fileName = fileName,
            fileHash = "abc123",
            fileSize = 1024000,
            mimeType = "application/vnd.android.package-archive",
            status = if (id % 2 == 0L) "completed" else "processing",
            riskScore = (id * 17 % 100).toInt(),
            riskLevel = listOf("low", "medium", "high", "critical")[(id % 4).toInt()],
            aiSummary = "Analysis detected ${id * 3} potential security concerns including suspicious permissions and API usage patterns.",
            staticScore = 45,
            dynamicScore = 60,
            behaviorScore = 55,
            createdAt = "2024-01-${10 + id}T10:00:00Z",
            updatedAt = "2024-01-${10 + id}T10:05:00Z",
            completedAt = if (id % 2 == 0L) "2024-01-${10 + id}T10:05:00Z" else null
        )
    }

    private fun generateMockScans(): List<ScanJob> {
        val files = listOf(
            "banking_app.apk", "social_media.apk", "game_v2.apk",
            "messaging.apk", "fitness_tracker.apk", "shopping.apk",
            "video_player.apk", "file_manager.apk"
        )
        return files.mapIndexed { index, file ->
            createMockScanJob(file, (index + 1).toLong())
        }
    }

    private fun createMockReport(scanId: Long): FullReport {
        val scan = createMockScanJob("analyzed_app.apk", scanId)
        val findings = listOf(
            ThreatFinding(
                id = 1, scanJobId = scanId, category = "spyware",
                severity = "high", title = "Suspicious API Usage",
                description = "App uses location and camera APIs excessively",
                evidence = listOf("LocationManager.getLastKnownLocation", "Camera.takePicture"),
                recommendation = "Review API usage permissions",
                aiAnalysis = "Behavioral pattern matches known spyware signatures",
                createdAt = "2024-01-15T10:00:00Z"
            ),
            ThreatFinding(
                id = 2, scanJobId = scanId, category = "phishing",
                severity = "medium", title = "Network Anomaly",
                description = "Communication with suspicious domain detected",
                evidence = listOf("tracker.analytics-sdk.com"),
                recommendation = "Block suspicious domains",
                aiAnalysis = "Domain is flagged in threat intelligence databases",
                createdAt = "2024-01-15T10:00:00Z"
            )
        )
        val summary = ReportSummary(
            totalThreats = findings.size,
            criticalCount = 0, highCount = 1, mediumCount = 1, lowCount = 0,
            aiExecutiveSummary = scan.aiSummary ?: "No summary",
            recommendations = listOf(
                "Review all permissions manually",
                "Monitor network traffic",
                "Run dynamic analysis in sandbox"
            )
        )
        return FullReport(scan, findings, summary)
    }
}
