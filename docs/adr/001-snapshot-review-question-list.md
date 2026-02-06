# ADR-001: Snapshot Review Question List to Prevent Mid-Session Shifts

## Status

Accepted

## Date

2026-02-06

## Context

### The Problem

In the "Repasar Fallos" (Review Failures) mode, users reported that answering a question caused a **different question** to appear in the UI. The selected answer would then be evaluated against the new question, producing incorrect results. When navigating back to the home screen, the error count was reduced by one, confirming the answer was being recorded for the original question.

### Root Cause Analysis

The ReviewScreen component used a `useCallback` + `useEffect` pattern to load the question list:

```jsx
const loadQuestions = useCallback(() => {
  // calls getIncorrectQuestions() which depends on stats
  questionList = getIncorrectQuestions();
  setQuestionsList(questionList);
}, [getIncorrectQuestions, /* ...other deps */]);

useEffect(() => {
  loadQuestions();
}, [loadQuestions]);
```

The dependency chain that caused the bug:

1. User selects answer and clicks "Validar Respuesta"
2. `recordAnswer()` is called, which updates `stats` in `QuizContext`
3. `stats` change causes `getIncorrectQuestions` to return a new function reference (it closes over `stats`)
4. `loadQuestions` is recreated because its dependency `getIncorrectQuestions` changed
5. The `useEffect` re-runs `loadQuestions()`
6. `getIncorrectQuestions()` now returns a shorter list (the correctly-answered question is removed)
7. `questionsList` state is replaced with the new shorter list
8. `currentIndex` remains the same, but now points to a different question
9. The UI renders the wrong question

This is a common React pitfall where context-derived functions in `useCallback` dependencies create unintended re-execution cascades.

### First Attempt (Insufficient)

An `initializedRef` was added to skip subsequent `loadQuestions` calls:

```jsx
useEffect(() => {
  if (!initializedRef.current) {
    loadQuestions();
    initializedRef.current = true;
  }
}, [loadQuestions]);
```

This was fragile because:
- It still relied on the effect lifecycle and timing
- The ref could be reset if the component remounted (e.g., React strict mode in development)
- It masked the real problem rather than solving it architecturally

## Decision

Replace the `useCallback` + `useEffect` mechanism with a **ref-based snapshot computed during render**:

```jsx
const questionsRef = useRef(null);
if (questionsRef.current === null && questions.length > 0) {
  if (isSequentialMode) {
    questionsRef.current = [...questions];
  } else if (isBlockMode) {
    questionsRef.current = getQuestionsByBlock(decodeURIComponent(blockName));
  } else if (isBookmarkedMode) {
    questionsRef.current = getBookmarkedQuestions();
  } else {
    questionsRef.current = getIncorrectQuestions();
  }
}
const questionsList = questionsRef.current || [];
```

Key properties of this approach:
- **Computed during render**, not in an effect (no timing issues)
- **Computed exactly once**: the `null` check ensures the ref is only set on the first render where `questions` are available
- **Immune to context changes**: subsequent renders skip the computation because `questionsRef.current` is already set
- **No dependency arrays**: eliminates the entire class of bugs caused by stale or changing dependencies

The empty-list redirect was moved to a simple, focused `useEffect` that only depends on `questions.length`.

## Consequences

### Positive
- The question list is guaranteed stable for the entire review session
- Simpler code: removed `useCallback`, reduced `useEffect` complexity
- Eliminates the dependency cascade between stats updates and question list rendering
- Answers are still recorded to stats (enabling correct counts on the home screen)

### Negative
- If a user unbookmarks a question during a "Marcadas" review, the question still appears until they exit and re-enter the review (acceptable trade-off for stability)
- The eslint `react-hooks/exhaustive-deps` rule needs a disable comment for the redirect effect

### Neutral
- The pattern (ref-based snapshot during render) is idiomatic React for "compute once" values that depend on props/context but should not re-derive
