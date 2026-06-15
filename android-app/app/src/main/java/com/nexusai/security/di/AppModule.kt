package com.nexusai.security.di

import com.nexusai.security.data.api.NexusApi
import com.nexusai.security.data.api.RetrofitClient
import com.nexusai.security.data.repository.ScanRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideNexusApi(): NexusApi = RetrofitClient.api

    @Provides
    @Singleton
    fun provideScanRepository(api: NexusApi): ScanRepository = ScanRepository(api)
}
