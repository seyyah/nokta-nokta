# Note Migrator — Track C: Migration & Dedup

## The Problem

Every day, people receive dozens of messages in WhatsApp groups, 
Telegram chats, and social media — recipes shared mid-conversation, 
exam hints scattered across replies, life tips buried in noise. 
Useful information is lost inside chat chaos.

## The Idea

**Note Migrator** takes a raw dump of messy chat messages and 
transforms them into clean, structured idea cards using Claude AI.

Input: Paste any WhatsApp/Telegram/social media chat export  
Output: Categorized, deduplicated idea cards with migration trace

## Track C Alignment

This directly implements the **Migration & Dedup** track:
- **Migration**: moves fragmented chat messages into structured idea cards
- **Dedup**: identifies when multiple messages discuss the same topic and merges them
- **Migration trace**: each card shows which original line numbers it was synthesized from

## Supported Categories

| Emoji | Category | Example |
|-------|----------|---------|
| 🍳 | Recipe | Kek batik ingredients shared across 3 messages |
| 📚 | Study | Exam hints mentioned by multiple classmates |
| ⏰ | Reminder | "Jangan lupa bawak notes esok" |
| 💡 | Tip | Forwarded life hack or study technique |
| 📌 | Other | Everything else worth keeping |

## Key Feature: Migration Trace

Each idea card shows `mergedFrom: [1, 3, 7]` — the exact line 
numbers from the original dump that were collapsed into that card. 
This is NOKTA's anti-slop principle in action: full traceability 
from raw input to clean output.

## Tech Stack

- React Native + Expo (blank-typescript)
- Claude Haiku 4.5 via raw fetch (fast, cost-effective for this use case)
- React Navigation (native stack)
- EXPO_PUBLIC_ env var for secure API key storage

## AI Tool Log

- Claude Code CLI — used throughout for scaffolding, service 
  architecture, and screen implementation

---

# Week 14 — Audit-Forge: Müşteri-Geliştirici Use Case

Track: B

## The Composition I Discovered

NoteMigrator already had a Human-in-the-Loop gate from Week 13:
the ReviewScreen where a human approves or rejects every AI-extracted
card before it reaches the final list. The human was a gatekeeper
inside the AI execution chain.

This week, adding nokta-audit created a second loop on top of that.
Now the same human — as a customer using the app — can tap the FAB,
mark a friction point on any screen, write a feature request in plain
language, and export a structured Markdown report. That report becomes
the direct input for a coding agent running a forge cycle. The agent
reads the report, locates the relevant screen, builds the requested
feature, and commits it. The human reviews the PR.

The composition is: HITL ReviewScreen (human approves AI output) +
nokta-audit (human directs what gets built next). Two loops, one app.
The customer is not just approving — they are specifying. Their
plain-language note inside the widget becomes a spec. The spec becomes
code. This is what hoca meant by "müşteri geliştirici olacak": not
that the customer writes code, but that their observation inside the
app drives what the agent builds next. The audit report is the new
program.md.

## Concrete Evidence

Cycle 1: the customer noted "I want to write why I rejected a card."
The forge cycle added a rejection reason modal to ReviewScreen.
The customer's note was the only spec. No developer wrote a ticket.

Cycle 2: the customer noted "I want to filter cards by category."
The forge cycle added a category filter bar to CardsScreen.
Again — note → forge → feature. No intermediate step.

The loop is: customer sees → customer marks → agent builds →
human reviews. The middle two steps require no developer time.