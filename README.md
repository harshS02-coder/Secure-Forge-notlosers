# Secure-Forge

## Business-Centric Mobile Threat Defense for Banking Risk Leaders


Secure-Forge is a comprehensive cybersecurity platform that leverages Generative AI to automate the analysis and risk scoring of Android APK files. Built for banks and financial institutions, it detects fraudulent applications distributed through WhatsApp, SMS, email, and phishing links.

---

## Cipher

```
Secure-Forge Platform
|
|-- Web Dashboard (React + TypeScript + Tailwind CSS)
|   |-- Interactive 3D Globe Network Visualization
|   |-- Cipher Helix Canvas Effect
|   |-- APK Upload & Analysis Flow
|   |-- Threat Reports with AI Explanations
|   |-- LLM Configuration Panel
|   |-- Real-time Dashboard Analytics
|
|-- Backend API (tRPC + Drizzle ORM + Hono + MySQL)
|   |-- LLM-Agnostic Service Layer
|   |   |-- OpenAI (GPT-4o, GPT-4o-mini)
|   |   |-- Groq (Llama 3.3, Mixtral)
|   |   |-- Anthropic (Claude 3.5 Sonnet)
|   |   |-- Google Gemini (1.5 Flash/Pro)
|   |   |-- Local/Mock Provider (no API key)
|   |
|   |-- APK Scanner Service (static analysis)
|   |-- Risk Scorer Service (weighted algorithm)
|   |-- tRPC Routers (type-safe APIs)
|   |-- MySQL Database (Drizzle ORM)
|
|-- Android App (Kotlin + Jetpack Compose)
|   |-- Home Dashboard
|   |-- APK Upload & Scan Flow
|   |-- Reports Browser
|   |-- Report Detail Viewer
|   |-- LLM Settings Configuration
|   |-- Hilt Dependency Injection
```

---

## Key Features

### 1. GenAI-Powered Analysis
- **LLM Agnostic**: Switch between OpenAI, Groq, Anthropic, Gemini, or local mock provider with a single configuration change
- **Automated Reverse Engineering**: Extracts permissions, API calls, code patterns, and network activity
- **AI Threat Interpretation**: Natural language explanations of detected threats
- **Risk Scoring Algorithm**: Weighted scoring (Static 30%, Behavior 30%, AI 40%)

### 2. Web Dashboard
- **BMW-Inspired Design**: Sharp geometries (0px radius), light surfaces (#f6f6f6), restrained blue accent (#1c69d4)
- **3D Globe Network**: Interactive Three.js visualization with particle systems, orbital arcs, and data packets
- **Cipher Helix Effect**: Canvas-based sine-wave typography animation
- **Real-time Analytics**: Dashboard stats, threat trends, scan timeline

### 3. Android App (Kotlin)
- **Jetpack Compose UI**: Modern declarative UI with sharp, engineered aesthetics
- **Full Scan Flow**: Upload APK, track progress, view results
- **Report Viewer**: Tabbed interface (Overview, Threats, AI Analysis)
- **LLM Configuration**: Add, test, and switch AI providers
- **Hilt DI**: Clean architecture with dependency injection

### 4. Security & Analysis
- **Static Analysis**: Permission extraction, API detection, code pattern analysis
- **Dynamic Scoring**: Behavior-based risk assessment
- **Threat Classification**: Malware, Spyware, Trojan, Ransomware, Adware, Phishing
- **Comprehensive Reports**: Executive summaries, technical details, recommendations

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Hono, tRPC 11, Drizzle ORM, MySQL |
| 3D Effects | Three.js (Globe Network) |
| 2D Effects | Canvas API (Cipher Helix) |
| Android | Kotlin, Jetpack Compose, Hilt, Retrofit |
| AI/LLM | OpenAI, Groq, Anthropic, Gemini (LLM-agnostic) |

---

## Database Schema

### Tables
- **users**: OAuth user accounts with roles
- **scan_jobs**: APK scan jobs with status, scores, and AI results
- **threat_findings**: Individual threat detections with severity
- **activity_logs**: Audit trail of user actions
- **llm_configs**: User-configured LLM provider settings

---

## LLM Agnostic Design

The platform uses a factory pattern to support multiple LLM providers:

```kotlin
// Switch LLM provider by changing config
interface LLMProvider {
  suspend fun analyzeAPK(data: APKAnalysisInput): LLMAnalysisOutput
  suspend fun generateReport(findings: List<AIThreat>): String
  suspend fun explainThreat(threat: AIThreat): String
}

// Providers: OpenAI, Groq, Anthropic, Gemini, Mock
val provider = LLMService.getProvider(config)
```

---

## API Endpoints (tRPC)

| Router | Endpoints |
|--------|-----------|
| `scan` | create, getById, list, cancel, reanalyze |
| `report` | getByScanId, getFindings, list |
| `dashboard` | stats, threatTrends, timeline, recentScans |
| `settings` | getLLMConfigs, addLLMConfig, setDefaultLLM, deleteLLMConfig |

---

## Design Philosophy

Following BMW's design language:
- **Sharp Geometry**: 0px border radius everywhere
- **Flat Surfaces**: No shadows, no gradients on surfaces
- **Typography**: Light weight (300) default, medium (500) for actions
- **Color Discipline**: Blue (#1c69d4) reserved exclusively for CTAs
- **Whitespace**: Generous, calm spacing with content-first approach

---

## Getting Started

### Web Dashboard
```bash
cd app
npm install
npm run dev        # Development server
npm run build      # Production build
```

### Android App
```bash
cd android-app
# Open in Android Studio or build with Gradle
./gradlew assembleDebug
```

### Database
```bash
npm run db:push    # Sync schema to MySQL
```

---

## Environment Variables

```env
# Database
DATABASE_URL=mysql://user:pass@localhost:3306/nexusai

# LLM API Keys (optional - uses mock provider if not set)
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
```

---

## License

Enterprise License - Secure-Forge Platform
