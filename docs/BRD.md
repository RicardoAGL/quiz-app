# Business Requirements Document (BRD)

# Quiz App - Módulos de Inversión

**Version**: 1.0
**Date**: 2026-02-06
**Status**: Baseline

---

## 1. Executive Summary

The Quiz App is an interactive, self-study web application designed for students preparing for investment certification exams. It provides an adaptive learning experience across six financial modules: Equities, Fixed Income, Commodities, Financial Derivatives, Bitcoin & Cryptocurrencies, and Real Estate Investment.

The app runs entirely client-side as an installable Progressive Web App (PWA), requiring no backend infrastructure. All user data persists locally in the browser, enabling offline study sessions.

---

## 2. Business Objectives

| # | Objective | Description |
|---|-----------|-------------|
| O1 | Effective study tool | Maximize learning efficiency through adaptive question selection |
| O2 | Self-paced learning | Allow users to study anytime, anywhere, including offline |
| O3 | Progress tracking | Provide clear visibility into strengths and weaknesses per topic |
| O4 | Low barrier to entry | Zero setup, installable, works on any device with a browser |
| O5 | Easy content expansion | Add new modules without code changes |

---

## 3. Target Users

| User Type | Description |
|-----------|-------------|
| **Primary** | Students preparing for investment certification exams (CFA-equivalent Spanish modules) |
| **Secondary** | Self-learners interested in financial markets and investment topics |

**User Assumptions**:
- Users study primarily on mobile devices (phone/tablet) and occasionally on desktop
- Study sessions are short (5-20 minutes), often on commutes or breaks
- Users want to focus on their weakest areas without manual tracking
- Users may study offline (subway, airplane, areas with poor connectivity)

---

## 4. Functional Requirements

### 4.1 Module System

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-MOD-01 | The app shall support multiple independent question modules | Must | Implemented |
| FR-MOD-02 | Users shall be able to switch between modules via a navigation menu | Must | Implemented |
| FR-MOD-03 | New modules shall be addable by creating a JSON file and a config entry (no code changes) | Must | Implemented |
| FR-MOD-04 | Each module shall maintain independent statistics and progress | Must | Implemented |
| FR-MOD-05 | The module selector shall be accessible from all non-question screens | Should | Implemented |

**Current modules**:

| Module | Topic | Questions |
|--------|-------|-----------|
| Módulo 4 | Renta Variable (Equities) | 48 |
| Módulo 5 | Renta Fija (Fixed Income) | 33 |
| Módulo 6 | Materias Primas (Commodities) | 78 |
| Módulo 7 | Derivados Financieros (Derivatives) | 48 |
| Módulo 8 | Bitcoin y Criptomonedas | 58 |
| Módulo 9 | Inversión Inmobiliaria (Real Estate) | 48 |

### 4.2 Study Modes

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-SM-01 | **Random Adaptive Practice**: The app shall present questions using a weighted algorithm that prioritizes unanswered and frequently-failed questions | Must | Implemented |
| FR-SM-02 | **Sequential Practice**: Users shall be able to review all questions in their original order | Must | Implemented |
| FR-SM-03 | **Review Failures**: Users shall be able to practice only questions where incorrect answers exceed correct ones | Must | Implemented |
| FR-SM-04 | **Review Bookmarked**: Users shall be able to practice only their bookmarked questions | Must | Implemented |
| FR-SM-05 | **Review by Block**: Users shall be able to practice questions from a specific topic block | Must | Implemented |
| FR-SM-06 | In all review modes, users shall navigate forward and backward through questions | Must | Implemented |

### 4.3 Adaptive Learning Algorithm

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AL-01 | Unanswered questions shall have the highest selection probability | Must | Implemented |
| FR-AL-02 | Questions with higher failure rates shall be selected more frequently | Must | Implemented |
| FR-AL-03 | Questions seen fewer times shall receive a frequency bonus | Should | Implemented |
| FR-AL-04 | The algorithm shall not repeat a question within the same session | Must | Implemented |

**Algorithm weights**:
- Unanswered questions: weight = 20 (highest)
- Failed questions: weight scales with failure rate squared (up to ~8)
- All questions: minimum base weight of 0.5
- Frequency bonus: inversely proportional to times seen

### 4.4 Question Interaction

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-QI-01 | Each question shall display the question text, four options, and the topic block | Must | Implemented |
| FR-QI-02 | Users must explicitly submit their answer before seeing results | Must | Implemented |
| FR-QI-03 | After submission, the correct answer shall be highlighted in green and incorrect in red | Must | Implemented |
| FR-QI-04 | After submission, a detailed explanation shall be displayed | Must | Implemented |
| FR-QI-05 | Options shall be disabled after submission to prevent changes | Must | Implemented |
| FR-QI-06 | Users shall be able to bookmark/unbookmark any question | Must | Implemented |
| FR-QI-07 | The question's historical performance (correct/incorrect count) shall be visible | Should | Implemented |

### 4.5 Statistics and Progress

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-ST-01 | The home screen shall display a summary of progress (answered, total, accuracy) | Must | Implemented |
| FR-ST-02 | A dedicated statistics screen shall show global metrics: answered, correct, incorrect, accuracy, total attempts | Must | Implemented |
| FR-ST-03 | Statistics shall be broken down by topic block with individual accuracy and progress | Must | Implemented |
| FR-ST-04 | Block cards shall show a visual progress bar with accuracy-based color | Should | Implemented |
| FR-ST-05 | Clicking a block card shall navigate to review mode for that block | Should | Implemented |
| FR-ST-06 | Users shall be able to reset all statistics with a double-confirm dialog | Must | Implemented |
| FR-ST-07 | Session statistics (current session correct/incorrect/accuracy) shall be displayed during quiz mode | Should | Implemented |

### 4.6 Data Persistence

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-DP-01 | All statistics shall persist across browser sessions via localStorage | Must | Implemented |
| FR-DP-02 | All bookmarks shall persist across browser sessions via localStorage | Must | Implemented |
| FR-DP-03 | Data shall be saved immediately after each answer submission and bookmark toggle | Must | Implemented |
| FR-DP-04 | The app shall gracefully handle corrupted or missing localStorage data | Should | Implemented |

### 4.7 Progressive Web App (PWA)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-PWA-01 | The app shall be installable on mobile and desktop devices | Must | Implemented |
| FR-PWA-02 | The app shall function fully offline after initial load | Must | Implemented |
| FR-PWA-03 | The service worker shall auto-update when new versions are deployed | Must | Implemented |
| FR-PWA-04 | All static assets (JS, CSS, HTML, JSON, images) shall be cached for offline use | Must | Implemented |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| NFR-P-01 | The app shall load in under 3 seconds on 3G connection (first visit) | Should | Implemented |
| NFR-P-02 | Subsequent loads shall be instant (cached by service worker) | Must | Implemented |
| NFR-P-03 | Question transitions shall feel instantaneous (<100ms) | Must | Implemented |

### 5.2 Responsiveness

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| NFR-R-01 | The app shall be fully usable on screens from 320px to 1440px+ | Must | Implemented |
| NFR-R-02 | Mobile layout shall be single-column, desktop shall use split panels | Should | Implemented |
| NFR-R-03 | Touch targets shall be at least 44x44px | Must | Implemented |
| NFR-R-04 | Typography shall scale fluidly using clamp() | Should | Implemented |

### 5.3 Accessibility

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| NFR-A-01 | Interactive elements shall have ARIA labels | Should | Partial |
| NFR-A-02 | The app shall support keyboard navigation (ESC to close menus) | Should | Partial |
| NFR-A-03 | Color contrast shall meet WCAG AA standards | Should | Partial |

### 5.4 Deployment

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| NFR-D-01 | The app shall auto-deploy to GitHub Pages on push to `main` | Must | Implemented |
| NFR-D-02 | CI/CD pipeline shall build and deploy in under 3 minutes | Should | Implemented |

---

## 6. User Interface Overview

### 6.1 Screen Map

```
┌─────────────────────────────────────────────────┐
│                  HOME SCREEN                     │
│  ┌──────────┐  ┌──────────────────────────────┐ │
│  │ Progress  │  │  Práctica Aleatoria     →Quiz│ │
│  │ Summary   │  │  Práctica en Orden  →Seq.Mode│ │
│  │           │  │  Repasar Fallos      →Review │ │
│  │ Answered  │  │  Marcadas            →Review │ │
│  │ Accuracy  │  │  Estadísticas         →Stats │ │
│  └──────────┘  └──────────────────────────────┘ │
│  [☰ Module Selector]                             │
└─────────────────────────────────────────────────┘
         │              │            │
         ▼              ▼            ▼
┌──────────────┐ ┌────────────┐ ┌──────────────┐
│  QUIZ SCREEN │ │ SEQUENTIAL │ │  STATISTICS   │
│              │ │   MODE     │ │              │
│ Adaptive     │ │            │ │ Global Stats │
│ weighted     │ │ All / By   │ │ Per-Block    │
│ questions    │ │ Block      │ │ Progress     │
│              │ │ selection  │ │ Bars         │
│ Session      │ │            │ │              │
│ stats        │ │     │      │ │ Click block  │
└──────────────┘ │     │      │ │ → Review     │
                 │     ▼      │ └──────┬───────┘
                 │ ┌────────┐ │        │
                 │ │ REVIEW │◄┘────────┘
                 │ │ SCREEN │
                 │ │        │
                 │ │ Modes: │
                 │ │ •Failed│
                 │ │ •Saved │
                 │ │ •Block │
                 │ │ •All   │
                 │ │        │
                 │ │ ◄ Prev │
                 │ │ Next ► │
                 └─┴────────┘
```

### 6.2 Responsive Breakpoints

| Range | Layout | Key Behaviors |
|-------|--------|---------------|
| 320-599px | Single column, stacked | Vertical cards, full-width buttons |
| 600-767px | Single column, wider spacing | Slight padding increases |
| 768-1023px | Adaptive grid (2 cols for blocks) | Block cards in grid |
| 1024-1439px | Split panel (left stats + right actions) | Desktop two-column layout |
| 1440px+ | Same with increased spacing | Larger max-widths |

---

## 7. Data Architecture

### 7.1 Question Data Model

```json
{
  "id": "m7-1",
  "block": "Derivados y Factores de Riesgo",
  "question": "¿Cuál es la función principal...?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 2,
  "explanation": "Detailed explanation text..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique across all modules (pattern: `m{module}-{number}`) |
| block | string | Topic/section grouping within the module |
| question | string | The question text |
| options | string[4] | Exactly four answer options |
| correctAnswer | number (0-3) | Zero-indexed correct option |
| explanation | string | Shown after answering |

### 7.2 Statistics Data Model (localStorage)

```json
{
  "m7-1": { "correct": 3, "incorrect": 1, "lastAttempt": "2026-02-06T..." },
  "m7-2": { "correct": 0, "incorrect": 2, "lastAttempt": "2026-02-06T..." }
}
```

### 7.3 Bookmarks Data Model (localStorage)

```json
["m7-1", "m5-12", "m6-3"]
```

---

## 8. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 19 | Component-based UI |
| Build Tool | Vite | Fast dev server and production builds |
| Routing | React Router v7 | Client-side navigation |
| State Management | React Context API | Global quiz state |
| Styling | Vanilla CSS | No framework dependency |
| Storage | localStorage | Client-side persistence |
| PWA | vite-plugin-pwa (Workbox) | Offline support, installability |
| Hosting | GitHub Pages | Static hosting |
| CI/CD | GitHub Actions | Automated deployment |

---

## 9. Current Limitations and Known Constraints

| # | Limitation | Impact | Notes |
|---|-----------|--------|-------|
| L1 | Data stored only in browser localStorage | Data lost if browser data cleared | No backup/export mechanism |
| L2 | No user authentication | Single-user per browser only | No multi-device sync |
| L3 | No backend/API | Cannot share data or collaborate | Fully client-side by design |
| L4 | Statistics are global across modules in storage | Resetting clears ALL modules | No per-module reset option |
| L5 | No exam simulation mode | Cannot practice under timed conditions | Only untimed practice |
| L6 | Questions are static | No way to add questions from the UI | Requires JSON file editing |
| L7 | Single language (Spanish) | Not accessible to non-Spanish speakers | Content is domain-specific |
| L8 | No dark mode | May cause eye strain in low-light | Single visual theme |

---

## 10. Improvement Backlog

_This section captures future enhancements. Items will be added as they are identified and prioritized._

| # | Improvement | Category | Priority | Status |
|---|------------|----------|----------|--------|
| | | | | |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-06 | Ricardo / Claude | Initial baseline document |
