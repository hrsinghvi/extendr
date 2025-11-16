# ExtenAI: Vibecoding for Chrome Extensions

> AI-first platform that turns natural language into fully functional Chrome extensions. Users describe behavior, the AI writes the code, and the platform provides a secure interactive preview plus a ready-to-publish ZIP export.

---

# Summary

ExtenAI is a web-only, chat-driven platform that lets anyone build Chrome extensions without writing code. Users explain what they want in natural language, the AI generates all necessary files and assets, and a sandboxed environment runs a realistic preview. The MVP focuses on AI generation, iteration through conversation, and export as a ready-to-publish ZIP bundle. This document lists all features, system components, integrations, constraints, security considerations, and operational requirements needed to design, build, test, and launch the product.

---

# Goals and Success Criteria

- Convert an idea into a functioning Chrome extension within minutes.
- Provide a safe, accurate developer-quality code output that follows Manifest V3 and Chrome policies.
- Offer a realistic, interactive preview that reproduces extension runtime behavior without user installation.
- Maintain a high iteration velocity through chat-based editing.
- Enable download of a ready-to-publish ZIP including manifest, assets, and a publication checklist.
- Achieve low friction onboarding and a measurable conversion from trial to export.

**Key Metrics:**

- Median time from first message to working preview < 3 minutes.
- Percentage of generated projects functional without manual fixes > 90%.
- Export to ZIP conversion rate per session > 30%.
- User satisfaction score > 80%.

---

# Target Users

- Non-developers who know a problem they want solved but cannot code.
- Product builders and founders prototyping browser functionality.
- Hobbyists and power users customizing browsing workflows.
- Beginner developers who want prototypes fast.
- Educators and students for hands-on learning.

---

# Core Product Principles

- Conversation first: main interaction model is chat, not file editors.
- End-to-end generation: AI produces all required code, manifest, and assets.
- Preview fidelity: sandbox must closely mimic Chrome extension behavior.
- Safety by default: limit generation of disallowed behavior and surface safe alternatives.
- Minimal friction export: downloadable ZIP ready for Chrome Web Store submission.

---

# MVP Feature List

## Conversational Generation

- Freeform natural language input.
- Clarifying prompts from AI to resolve ambiguous requirements.
- Intent extraction to map user requests to Chrome APIs, permissions, and patterns.
- Prompt engineering templates to ensure Manifest V3 compliance.
- Controlled randomness for deterministic reproducibility.

## Full Extension Scaffolding

- Automatic generation of: manifest.json, popup HTML/CSS/JS, options page, background service worker, content scripts, icons, and README.
- Support for common Chrome APIs: storage, runtime messaging, alarms, notifications, action, tabs, scripting, webRequest (MV3), cookies.
- Inline comments and minimal documentation explaining function and permissions.

## Interactive Sandbox Preview

- Isolated runtime simulating Chrome APIs: chrome.storage, chrome.runtime, chrome.action, chrome.notifications, chrome.tabs, chrome.scripting, chrome.alarms.
- Load sample webpages and run content scripts.
- Popup simulation with click interactions, form inputs, state persistence.
- Mocked permission prompts and a permissions dashboard.
- Logging console for runtime errors and messages.
- State inspector for storage and messaging payloads.

## Iteration Loop via Chat

- Users request changes in plain language and system applies incremental updates.
- AI tracks project state and diffs between versions.
- Snapshot and rollback support for reverting builds.
- Conflict resolution for edits that imply breaking changes.

## Export and Packaging

- Server-side ZIP generation with correct folder structure and permissions.
- README with publishing checklist and Chrome Web Store instructions.
- Optional code style preference (ES6 modules vs classic scripts).

## Safety and Policy Guardrails

- Filters to block malware, credential theft, covert data exfiltration, disallowed scraping.
- Permissions minimization and rationale explanation.
- Policy warning messages with safe alternatives.
- Logging of flagged requests for internal review and model improvement.

---

# Advanced Features and Future Roadmap

- Direct publishing via OAuth to Google Developer account.
- Monetization support: premium features, license keys, subscription hooks.
- Templates marketplace: community and first-party templates.
- Code editor mode with syntax highlighting, linting, and live rebuilds.
- Multi-browser support: Firefox WebExtensions, Edge, Safari.
- Analytics: usage telemetry and crash reports.
- Team collaboration: project sharing, role-based access.
- Version control integration: GitHub/GitLab export and commits.
- Offline development kit for local iteration.

---

# Technical Architecture

## Frontend

- SPA framework for chat UI, project state, preview iframe, and user flows.
- Project state persisted server-side. No raw code editing in MVP.

## Backend

- API layer: handles chat messages, project state, AI generation, security checks, artifact assembly.
- AI orchestration: crafts prompts, validates outputs, produces consistent file sets.
- ZIP and asset generation service.
- Sandbox runtime service for preview instances.
- Persistent project store for sessions, snapshots, and audit logs.

## AI Integration

- LLM provider for code generation with prompt templates and validation.
- Post-processing: enforce manifest format, API compatibility, static linting, inject comments and README.
- Safety filters and prompt-level constraints.

## Sandbox Design

- Containerized or iframe-based isolated runtime.
- API shims emulate chrome.\* behaviors and enforce rate limits.
- Network filtering to prevent accidental data leaks.
- Runtime instrumentation for errors, logs, and console output.

## Storage and Assets

- Temporary cloud storage for projects and assets.
- Expiration policy for unclaimed projects.
- CDN for serving preview assets and icons.

---

# Security, Privacy, and Compliance

- No collection or persistence of user credentials.
- Explicit prompts when sensitive permissions are required.
- Generated code does not transmit user data; telemetry is opt-in.
- Secure handling of uploaded assets with virus scanning.
- GDPR and CCPA compliance for data retention and deletion.
- Audit trail for flagged requests and moderation.

---

# Developer and QA Requirements

- Unit tests for code generation templates and manifest assembly.
- Integration tests deploying extensions to test harness.
- Fuzz testing LLM outputs to catch invalid manifests or unsafe code.
- End-to-end tests for chat, iteration, preview, and export.
- Security tests for sandbox escapes, XSS, and unauthorized network access.

---

# Documentation and Onboarding

- Auto-generated README per project explaining structure, permissions, and publish steps.
- Guided onboarding and example prompts.
- Developer docs explaining AI-to-API mapping and template extensions.

---

# Business Considerations

- Freemium model with usage limits; paid tier unlocks more projects, exports, and direct publishing.
- Template marketplace revenue share.
- Enterprise licensing for teams and education.
- Support plans: email for free tier, priority for paid tiers.

---

# Example Extension Archetypes

- Popup utilities: timers, note takers, quick search.
- Content modifiers: dark mode injectors, article cleaners, price highlighters.
- Productivity tools: tab groupers, link savers, quick commands.
- Integrations: surface third-party API data in popup UI.
- Automation: page actions triggered by URL patterns, scheduled tasks, DOM changes.
- Security and privacy: cookie managers, tracker blockers, privacy toggles.

---

# Launch Checklist

- Core chat flow with prompt templates and safety filters.
- Sandbox fidelity validated against core Chrome APIs.
- Manifest V3 conformance tests passed.
- Export packaging and README generation tested.
- Security scanning and policy avoidance filters in place.
- Onboarding content and example prompts published.
- Basic analytics and error reporting instrumented.
