# Alight Motion Premium Tool (AM Prem)

Replication and enhancement of the Alight Motion Premium verification tool inspired by maya327.my.id/tool, featuring high-fidelity Neobrutalist styling, dual-step authentication flow, configurable backend API proxy integration, and an interactive retro audio player.

### User Review & Critical Decisions

> [!IMPORTANT]
> The original website's backend (`api.php`) protects its external API keys securely on its server and does not expose them to client browsers. In alignment with your answers, this application includes a **Custom Backend Proxy / API Endpoint Settings Panel** allowing you to direct verification requests to any backend URL or custom API Key, alongside pre-configured mock proxy simulation handlers for instant live testing.

- **Confirmed Decision 1**: Backend integration via a custom API proxy endpoint configurable directly from the UI with custom API key headers.
- **Confirmed Decision 2**: Focused single-page architecture strictly on the **Tool AM Prem** interface (Step 1: Kirim Link & Step 2: Verifikasi Link) with all badges, disclaimer consent, and status displays.
- **Confirmed Decision 3**: Retro Neobrutalist music player widget with play/pause controls, web audio soundtrack generation, volume adjustment, and gesture auto-start.

---

### 1. Overview & Core Concept

- **What It Does**: Provides a dedicated, responsive Neobrutalist web tool for submitting Alight Motion account emails, triggering magic login links, verifying token links, and tracking request status in real-time.
- **Target Audience**: Video editors, motion designers, and Alight Motion users looking for an intuitive utility interface to request and verify premium access links.
- **Key Value**: Recreates the visual aesthetic of the original tool while providing transparency into API keys, custom backend routing, and responsive feedback without broken external ad scripts or hidden vulnerabilities.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Step 1 (Kirim Link ke Email)**: User inputs their account email -> Clicks "KIRIM LINK →" -> System dispatches the request to the configured API proxy (with loading state "MEMPROSES…") -> Email is prefilled automatically into Step 2 on success.
  2. **Step 2 (Verifikasi Link Masuk)**: User inputs the received magic link URL -> Checks the required risk acknowledgment consent box -> Clicks "AJUKAN VERIFIKASI →" -> System verifies the token with the proxy service and reports the activation response.
  3. **API Configuration Modal**: User clicks the "⚙ API SETTINGS" button on the navigation bar to inspect what API keys do, view request payloads, and set custom proxy endpoints (`https://.../api.php`) or header keys.
  4. **Background Audio Player**: A floating neobrutalist soundbar at the bottom right corner with interactive play/pause, volume control, and status indicators.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Neo-Brutalist retro pop — bold high-contrast outlines, vivid pastel fills, playful angles, and stark dropped shadows.
  - *Color Palette*:
    - Canvas Background: `#fffdf5` (warm cream) with subtle `28px × 28px` grid pattern
    - Ink / Border: `#161616` (deep charcoal black with `3px` solid stroke and `6px 6px 0` hard shadows)
    - Primary Accents: `#ffde59` (Canary Yellow), `#ff77b7` (Bubblegum Pink), `#74c9ff` (Sky Blue), `#79e28d` (Mint Green), `#b9a3ff` (Soft Purple)
  - *Typography & Hierarchy*:
    - Display Headings: Bold geometric typography (`clamp(2.5rem, 6vw, 4.5rem)`), high-impact weight, tight line-height
    - Step Badges: Blocky sticker tags with tilted shadows
    - Body & Inputs: Crisp sans-serif with monospace accents for tokens and URLs
  - *Component Styling*:
    - Strict `3px` dark borders on all cards, inputs, and buttons
    - Offset button hover interactions (`translate(-2px, -2px)` with expanded shadow `6px 6px 0`)
    - Accessible color-coded status boxes (Green for Success, Red for Error, Blue for In-Progress)

- **Interactive Feedback & Motion**:
  - Micro-interactions on buttons and inputs with snappy 150ms transitions
  - Live form validation preventing submission without email or mandatory consent check
  - Tabular status feedback messages explaining HTTP response status or timeout errors

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Flexible Backend Proxy & API Key Management**
  - *Chosen Approach*: Implement an Express backend proxy route (`/api/proxy`) combined with a client-side API configuration modal. If no custom API URL is set, the server handles requests gracefully with full schema simulation and diagnostic logs.
  - *Why*: Allows you to test the app immediately out of the box while letting you plug in any private server URL or API Key at runtime without editing code.
  - *Alternatives Considered*: Hardcoding a single broken external URL would fail whenever the remote endpoint is down or firewalled.

- **Decision 2: Web Audio Synthesized Lo-Fi Soundtrack vs External MP3**
  - *Chosen Approach*: Implement an interactive audio engine using Web Audio API + fallback ambient soundtrack.
  - *Why*: Avoids broken external media URLs (CORS / 404 from external CDN) while guaranteeing reliable autoplay-on-interaction and zero broken audio assets.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                       Top Navigation Bar                        │
│  [A] GET ALIGHT PREMIUM         [⚙ API Settings]  [API Status]  │
└─────────────────────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     Step 1: Kirim Link          │   │     Step 2: Verifikasi Link     │
│ ┌─────────────────────────────┐ │   │ ┌─────────────────────────────┐ │
│ │ Email Input                 │ │   │ │ Email (Prefilled)           │ │
│ └─────────────────────────────┘ │   │ │ Magic Link URL              │ │
│ [KIRIM LINK →]                  │   │ └─────────────────────────────┘ │
│ [Status Banner: Info/Err/Succ]  │   │ [AJUKAN VERIFIKASI →]           │
└─────────────────────────────────┘   │ [Status Banner: Info/Err/Succ]  │
                                      └─────────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│       Privacy & Consent         │   │      Floating Audio Player      │
│  [✓] Risk Acknowledgment Check  │   │  [♫] MUSIK WEBSITE  [▶ / Ⅱ]      │
└─────────────────────────────────┘   └─────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│             API Proxy Engine (/api/verify & /api/send)          │
│   • Forward to Custom Endpoint / Return Diagnostic Simulation   │
│   • Header Injection (API Key, CSRF, User-Agent)                │
└─────────────────────────────────────────────────────────────────┘
```

- **State Model**:
  - `sendForm`: `{ email: string, isSubmitting: boolean, status: { type, message } }`
  - `verifyForm`: `{ email: string, magicLink: string, consent: boolean, isSubmitting: boolean, status: { type, message } }`
  - `apiConfig`: `{ customEndpoint: string, apiKey: string, mockMode: boolean, timeoutSec: number }`
  - `audioState`: `{ isPlaying: boolean, volume: number, isLoaded: boolean }`

- **Interactive Component Mapping**:
  - `Header`: Displays brand logo, live connection pill, and trigger for API Settings Modal.
  - `SendCard`: Handles email validation, dispatches link request, auto-syncs email state into the verification step.
  - `VerifyCard`: Checks consent checkbox, processes magic link submission with timeout handling (up to 28s).
  - `ApiSettingsModal`: Details API key architecture, provides editable endpoint/key inputs, and offers a payload tester.
  - `MusicWidget`: Floating bottom bar reproducing the original retro audio player with sound controls.
