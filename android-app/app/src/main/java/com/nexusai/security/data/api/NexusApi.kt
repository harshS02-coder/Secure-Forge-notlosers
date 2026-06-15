package com.nexusai.security.data.api

import com.nexusai.security.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface NexusApi {
    // Scan endpoints
    @POST("api/trpc/scan.create")
    suspend fun createScan(@Body request: Map<String, @JvmSuppressWildcards Any>): Response<Map<String, @JvmSuppressWildcards Any>>

    @GET("api/trpc/scan.getById")
    suspend fun getScan(@Query("input") input: String): Response<Map<String, @JvmSuppressWildcards Any>>

    @GET("api/trpc/scan.list")
    suspend fun listScans(@Query("input") input: String? = null): Response<Map<String, @JvmSuppressWildcards Any>>

    // Report endpoints
    @GET("api/trpc/report.getByScanId")
    suspend fun getReport(@Query("input") input: String): Response<Map<String, @JvmSuppressWildcards Any>>

    // Dashboard endpoints
    @GET("api/trpc/dashboard.stats")
    suspend fun getStats(): Response<Map<String, @JvmSuppressWildcards Any>>

    @GET("api/trpc/dashboard.recentScans")
    suspend fun getRecentScans(@Query("input") input: String? = null): Response<Map<String, @JvmSuppressWildcards Any>>

    // Settings endpoints
    @POST("api/trpc/settings.addLLMConfig")
    suspend fun addLLMConfig(@Body request: Map<String, @JvmSuppressWildcards Any>): Response<Map<String, @JvmSuppressWildcards Any>>

    @GET("api/trpc/settings.getLLMConfigs")
    suspend fun getLLMConfigs(): Response<Map<String, @JvmSuppressWildcards Any>>

    @POST("api/trpc/settings.setDefaultLLM")
    suspend fun setDefaultLLM(@Body request: Map<String, @JvmSuppressWildcards Any>): Response<Map<String, @JvmSuppressWildcards Any>>

    @POST("api/trpc/settings.deleteLLMConfig")
    suspend fun deleteLLMConfig(@Body request: Map<String, @JvmSuppressWildcards Any>): Response<Map<String, @JvmSuppressWildcards Any>>
}
