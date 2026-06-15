# Track A — Dot Capture & Enrich

## Core Idea

A raw idea is the most fragile moment in the product lifecycle. People discard it, forget it, or — worse — build it without ever questioning whether it's worth building. **Dot Capture** is the first station of the NOKTA pipeline: it catches the raw dot before it disappears, and turns it into a validated, structured engineering spec through guided AI questioning.

One sentence in → five engineering questions → one-page spec. No chat. No open-ended conversation. No hallucinated market claims.

---

## Problem

Most ideas die in the gap between "I have an idea" and "I have a spec I can act on." The gap exists because:

1. Open-ended AI chat (ChatGPT, Claude.ai) generates bulk text but no structure
2. Engineering questions require domain knowledge most founders don't have
3. There's no friction between "idea" and "assumption" — people skip validation

Dot Capture closes this gap with a constrained, metric-driven flow that forces five specific clarifications before any spec is produced.

---

## Target Users

- Solo founders and indie hackers who have a new product idea and need to structure it fast
- Product managers who want a first-pass spec without a whiteboard session
- Students and builders in hackathons where time is the binding constraint
- Angel investors who want a one-page summary from a founder's verbal pitch

---

## The Five Questions (Engineering Categories)

The AI is constrained to ask exactly one question per category, in order:

| # | Category | Example question |
|---|---|---|
| 1 | Problem | What specific pain point does this solve, for whom? |
| 2 | User | Who is the primary user and what is their typical context? |
| 3 | Scope | What is the minimum version that proves the idea works? |
| 4 | Constraint | What's the biggest technical or resource constraint? |
| 5 | Success Metric | How will you know in 30 days that this succeeded? |

Constraining to categories prevents the AI from asking overlapping questions or going on tangents. It also produces a structured input for the spec generator.

---

## Output: One-Page Spec

The spec has six fixed sections:

1. **Problem** — reframed from the user's answers, concrete
2. **Target Users** — specific, not "everyone who..."
3. **Scope (MVP)** — what's in, what's explicitly out
4. **Constraints** — technical, time, resource
5. **Success Metrics** — measurable, time-boxed
6. **First Feature to Build** — the single next action

The spec is rendered in-app and shareable via native share sheet (text format for paste into Notion, email, etc.).

---

## Technical Architecture

```
User Input (idea text)
    │
    ▼
Claude Haiku (Q1: Problem)
    │   user answers
    ▼
Claude Haiku (Q2: User)
    │   ...
    ▼
Claude Haiku (Q5: Success Metric)
    │   all 5 Q&As
    ▼
Claude Haiku (Spec Generator)
    │
    ▼
One-Page Spec (rendered + shareable)
```

- Each API call is independent (no streaming, no session state on server)
- All state lives in React Navigation route params (QA array passed screen-to-screen)
- API key injected at build time via `EXPO_PUBLIC_ANTHROPIC_API_KEY`

---

## What makes this different from "just asking Claude"

| Open chat | Dot Capture |
|---|---|
| User must know what to ask | Questions are generated for you |
| Output is a wall of text | Output is a fixed, structured spec |
| No constraint on hallucination | Questions constrain to what *you* know |
| No stopping condition | Exactly 5 questions, always |
| Nothing to commit to | Shareable artifact you can hand off |

---

## Future Extensions (beyond this track)

- **Voice input** on HomeScreen — tap to record, Whisper transcribes to text, same pipeline
- **Spec export** to Markdown file or Notion page via Notion API
- **Idea history** — local storage of all past spec runs with search
- **Slop check** — after spec generation, run Track B on the output to score the idea's market claims (cross-track integration)
