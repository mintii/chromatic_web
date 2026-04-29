# Chromatic Web

A browser-based chat interface for the [ruby_chromatic_agent](../ruby_chromatic_agent) — an AI assistant for exploring art, color palettes, artists, techniques, and styles. Built with Ruby + Sinatra.

## What it does

Chromatic lets you have a flowing conversation with an AI agent about visual art and color. Ask it about painters, color theory, artistic movements, or specific palettes. As you explore, the sidebar tracks everything discovered in the session — artists, palettes, techniques, and styles — and you can export the full conversation as Markdown when you're done.

## Project layout

```
Overclock AI Class/
├── chromatic_web/          ← this app
└── ruby_chromatic_agent/   ← AI agent (loaded directly via require_relative)
```

The web app has no database. All state lives in memory for the lifetime of the server process and is persisted to `data/session.json` between restarts.

## Prerequisites

- Ruby 3.x
- Bundler (`gem install bundler`)
- An Anthropic API key (stored in `.env`)

## Setup

```bash
# 1. Install dependencies
bundle install

# 2. Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
```

## Running

```bash
# Development server on http://localhost:4567
bundle exec ruby app.rb

# Or via Rack / Puma
bundle exec rackup
```

## Using the app

- **Chat** — type a message and press Enter (or click Send). The agent responds with Markdown rendered inline.
- **Session sidebar** — the right panel auto-updates with a running summary of artists, palettes, techniques, and styles uncovered so far.
- **New session** — click "New Session" to wipe the conversation and start fresh.
- **Export** — visit `/export` to download the full conversation as a `.md` file.

## API routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Chat UI |
| `POST` | `/chat` | `{ message }` → `{ response, summary }` JSON |
| `POST` | `/reset` | Clear conversation and reinitialize agent |
| `GET` | `/export` | Download session as Markdown |

## Architecture notes

- **`app.rb`** — all Sinatra routes; holds a single global `$agent` instance.
- **`ChromaticAgent#chat`** — synchronous call; may take a few seconds on complex queries while tools run.
- **`SESSION`** — a `SessionMemory` singleton (from the agent repo) that accumulates discovered topics. Serialized to `data/session.json` on every response so the session survives a server restart.
- **`public/`** — plain HTML/CSS/JS, no build step. CSS variables in `style.css` make theming straightforward.
