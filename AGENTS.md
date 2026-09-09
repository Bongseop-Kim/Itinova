# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Design system

Visual work (color, type, spacing, component surfaces) follows `docs/design-system.md`. Read it before writing any UI code; use its tokens verbatim, don't invent values.

Flows and features are in `docs/design.md`.

# iOS simulator test harness

- Use `xcrun simctl` for installation, launch, deep links, and screenshots.
- Prefer Codex Computer Use (`cua_repl`) for UI inspection, taps, typing, and scrolling. Read fresh UI state before choosing the next action.
- Use Maestro for repeatable E2E flows when needed; check whether it is installed first.
- Use Orca only when the tools above cannot handle the task or the user explicitly requests it.
- Verify the affected flow and resulting state. Preserve existing user data; clean up only test data created by the agent.
