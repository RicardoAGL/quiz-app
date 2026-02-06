# ADR-002: CI/CD Pipeline and Security Hardening

## Status

Accepted

## Date

2026-02-06

## Context

### The Problem

The quiz-app project had no automated quality gates. The existing `deploy.yml` workflow would build and deploy to GitHub Pages on every push to `main`, but without running linting or tests first. There were no checks on pull requests, no local pre-commit hooks, and no security hardening of any kind -- no Content Security Policy, no error boundary, and several latent vulnerabilities in both application code and dependencies.

This meant:

1. **Broken code could reach production** -- a push to `main` that introduced a lint error or failing test would still deploy.
2. **No PR feedback loop** -- contributors had no way to validate their changes before merging.
3. **No local safety net** -- developers could commit and push linting violations or untested changes without friction.
4. **Supply chain risk** -- GitHub Actions referenced by mutable version tags (e.g., `actions/checkout@v4`) could be silently replaced with compromised code.
5. **Client-side vulnerabilities** -- no CSP to restrict script execution, no error boundary to prevent blank screens on render failures, and a `localStorage.clear()` call that could wipe unrelated origin data.

### Prior State

- `deploy.yml` existed but used version-tag references and had no lint/test steps.
- No `ci.yml` existed.
- No pre-commit hooks.
- No Content Security Policy.
- No ErrorBoundary component.
- `storage.js` exposed a `clear()` method wrapping `localStorage.clear()`.
- `ReviewScreen.jsx` called `decodeURIComponent()` without error handling.
- `devDependencies` included unused packages with known CVEs (glob, lru-cache, source-map).
- `vite-plugin-pwa` was incorrectly listed under `dependencies` instead of `devDependencies`.
- No `.env` patterns in `.gitignore`.
- No testing infrastructure (no test runner, no test utilities, no tests).

## Decision

The changes are grouped into three areas: CI/CD pipeline, security hardening, and testing infrastructure.

### 1. CI/CD Pipeline

#### deploy.yml Hardening

The existing deployment workflow was updated with the following changes:

- **SHA-pinned actions** -- All GitHub Actions references use full commit SHA hashes instead of mutable version tags. This prevents a compromised or hijacked tag from injecting malicious code into the build pipeline:

  ```yaml
  uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1
  uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0
  uses: actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b # v5.0.0
  uses: actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b # v4.0.0
  uses: actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e # v4.0.5
  ```

- **Lint step before build** -- `npm run lint` runs after dependency installation and before the build, catching code style violations early.

- **Test step before build** -- `npm run test -- --run` executes the full test suite in single-run mode. A failing test blocks the build and prevents deployment.

- **cancel-in-progress** -- `concurrency.cancel-in-progress: true` cancels any in-flight deployment when a newer push arrives, avoiding wasted runner minutes on superseded commits.

- **Upgraded actions** -- `upload-pages-artifact` updated to v4, `configure-pages` updated to v5.

#### ci.yml (New PR Validation Workflow)

A new workflow was created to provide feedback on pull requests before they merge:

```yaml
name: CI
on:
  pull_request:
    branches: [main]
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

The workflow runs lint, test, and build in sequence. It uses the same SHA-pinned actions and npm caching as the deploy workflow. The concurrency group (`ci-${{ github.ref }}`) ensures that pushing a new commit to a PR branch cancels the previous run for that same branch.

#### Pre-commit Hooks (husky + lint-staged)

Local quality gates were added using husky (v9) and lint-staged (v16):

- The `.husky/pre-commit` hook runs `cd quiz && npx lint-staged`.
- The lint-staged configuration in `quiz/package.json` targets `*.{js,jsx}` files with two commands:
  - `eslint --fix` -- auto-fixes what it can, fails on remaining errors.
  - `vitest related --run` -- runs only the tests related to the changed files, in single-run mode.

This catches issues at commit time, before they reach the CI pipeline.

### 2. Security Hardening

#### Content Security Policy

A CSP meta tag was added to `quiz/index.html`:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self';
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           font-src https://fonts.gstatic.com;
           img-src 'self' data:;">
```

This restricts script execution to same-origin only, prevents inline scripts (XSS mitigation), allows styles from self and Google Fonts (with `unsafe-inline` required for React's runtime style injection), and limits image sources to self and data URIs.

#### Error Boundary

An `ErrorBoundary` class component (`quiz/src/components/ErrorBoundary.jsx`) was created and wraps the entire application. It uses React's `getDerivedStateFromError` and `componentDidCatch` lifecycle methods to catch render errors in the component tree. Instead of showing a blank white screen, it renders a user-friendly error message in Spanish with a "Volver al inicio" button that navigates to the app root.

#### Storage Service Fix

The `clear()` method was removed from `quiz/src/services/storage.js`. The original method called `localStorage.clear()`, which removes all keys for the entire origin -- not just quiz-app keys. If the app shared an origin with other applications or browser extensions stored data under the same origin, this would destroy their data. The existing `resetAllData()` method correctly targets only the two quiz-specific keys (`quizStats` and `bookmarks`) using `removeItem()`.

#### URI Decoding Safety

A `safeDecode()` helper was added to `quiz/src/screens/ReviewScreen.jsx`:

```javascript
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
```

This prevents `URIError` crashes when the `blockName` URL parameter contains malformed percent-encoded sequences (e.g., `%ZZ`). The helper is used in the ref-based snapshot computation and in the display heading.

#### .env Protection

`.env`, `.env.local`, and `.env.*.local` patterns were added to `.gitignore` to prevent accidental commits of environment files that might contain secrets or API keys.

#### Dependency Cleanup

- Removed unused transitive dependencies with known CVEs: `glob`, `lru-cache`, `source-map`.
- Moved `vite-plugin-pwa` from `dependencies` to `devDependencies` (it is a build tool, not a runtime dependency).
- Ran `npm audit fix`, achieving 0 vulnerabilities.

### 3. Testing Infrastructure

#### Vitest Configuration

Vitest was configured in `quiz/vite.config.js` with:

- `globals: true` -- makes `describe`, `it`, `expect` available without imports.
- `environment: 'jsdom'` -- provides a DOM environment for React component tests.
- `setupFiles: './src/test/setup.js'` -- loads `@testing-library/jest-dom` matchers globally.
- `css: true` -- processes CSS imports in tests instead of ignoring them.

#### Test Utilities

`quiz/src/test/utils.jsx` provides three reusable helpers:

- **`renderWithProviders(ui, options)`** -- Wraps a component in `BrowserRouter` and `QuizProvider` for integration-style tests that need routing and quiz context.
- **`mockLocalStorage()`** -- Creates an isolated in-memory localStorage mock with `getItem`, `setItem`, `removeItem`, `clear`, `length`, and `key` methods.
- **`createMockQuestions(count)`** -- Generates an array of quiz questions matching the app schema. Uses 5 preset questions with varied blocks and generates additional ones for larger counts.

#### Test Runner Scripts

Three npm scripts were added to `quiz/package.json`:

- `npm run test` -- starts Vitest in watch mode for development.
- `npm run test:ui` -- opens the Vitest UI for interactive test exploration.
- `npm run test:coverage` -- runs tests with code coverage reporting.

## Consequences

### Positive

- **No untested code reaches production** -- the deploy workflow now requires lint and test to pass before building and deploying. A regression will block the pipeline.
- **PR authors get fast feedback** -- the CI workflow validates every pull request against the same lint/test/build sequence, catching issues before code review.
- **Local feedback is immediate** -- pre-commit hooks run ESLint and related tests on every commit, catching issues before they enter the git history.
- **Supply chain attacks are mitigated** -- SHA-pinned actions cannot be silently swapped via tag manipulation. Updating an action requires a deliberate commit changing the hash.
- **XSS attack surface is reduced** -- the CSP blocks inline scripts and limits resource origins, preventing common injection vectors.
- **Render errors are handled gracefully** -- the ErrorBoundary prevents blank screens and gives users a recovery path.
- **Data integrity is preserved** -- removing `localStorage.clear()` ensures only quiz-app data is affected by reset operations.
- **URL parameter crashes are eliminated** -- `safeDecode()` handles malformed input without throwing.
- **Zero known dependency vulnerabilities** -- cleanup and audit ensure a clean baseline.

### Negative

- **SHA-pinned actions require manual updates** -- when a new version of an action is released, someone must look up the new commit SHA and update the workflow file. Version tags are more convenient but less secure.
- **Pre-commit hooks add friction** -- running ESLint and related tests on every commit adds a few seconds of wait time. Developers can bypass hooks with `--no-verify`, but this is intentional friction.
- **`unsafe-inline` in style-src** -- the CSP allows inline styles because React (and many CSS-in-JS patterns) inject styles at runtime. A stricter policy using nonces would require build-tool integration and was deferred.
- **CI runs are sequential** -- lint, test, and build run in sequence rather than in parallel. For a project of this size the total time is under a minute, but this could be parallelized if build times grow.

### Neutral

- The testing infrastructure (Vitest, React Testing Library, jsdom) is the standard toolchain for Vite-based React projects and does not introduce unusual dependencies.
- The ErrorBoundary uses a class component because React's error boundary API requires `getDerivedStateFromError`, which is only available in class components. This is expected and documented by React.
- The `prepare` script (`cd .. && husky`) runs automatically on `npm install` to set up git hooks. This is the standard husky installation pattern for monorepo-like structures where the `.git` directory is in a parent directory.
