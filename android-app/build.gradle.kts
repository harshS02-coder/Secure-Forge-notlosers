plugins {
    id("com.android.application") version "7.4.2"
    id("org.jetbrains.kotlin.android") version "1.8.10"
    id("com.google.dagger.hilt.android") version "2.44"
    id("org.jetbrains.kotlin.kapt") version "1.8.10"
}

android {
    namespace = "com.nexusai.security"
    compileSdk = 33

    sourceSets {
        getByName("main") {
            java.srcDirs("app/src/main/java")
            kotlin.srcDirs("app/src/main/kotlin", "app/src/main/java")
            res.srcDirs("app/src/main/res")
            manifest.srcFile("app/src/main/AndroidManifest.xml")
        }
    }

    defaultConfig {
        applicationId = "com.nexusai.security"
        minSdk = 26
        targetSdk = 33
        versionCode = 1
        versionName = "1.0.0-alpha"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.4.3"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
        freeCompilerArgs = freeCompilerArgs + listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api"
        )
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.9.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.1")
    implementation("androidx.activity:activity-compose:1.7.0")

    implementation(platform("androidx.compose:compose-bom:2023.03.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    
    implementation("androidx.navigation:navigation-compose:2.5.3")
    implementation("com.google.dagger:hilt-android:2.44")
    kapt("com.google.dagger:hilt-compiler:2.44")
    implementation("androidx.hilt:hilt-navigation-compose:1.0.0")

    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.10.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4")
}

kapt {
    correctErrorTypes = true
}
