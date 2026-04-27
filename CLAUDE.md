# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`chromatic_web` is a Ruby Sinatra web app that wraps the `ruby_chromatic_agent` CLI agent in a browser-based chat interface. It lives alongside the agent in the same parent directory:

```
Overclock AI Class/
├── chromatic_web/          ← this repo
└── ruby_chromatic_agent/   ← agent (loaded via require_relative)
```

## Commands

```bash
# Install dependencies
bundle install

# Copy env from agent (first-time setup)
cp ../ruby_chromatic_agent/.env .env

# Start dev server (http://localhost:4567)
bundle exec ruby app.rb

# Or via Rack
bundle exec rackup
```

## Architecture

The app has no database — all state is in-process:

- **`app.rb`** — Sinatra routes. Loads the agent via `require_relative '../ruby_chromatic_agent/agent'`, which transitively loads `memory.rb` and all five tool files. Holds a single global `$agent` (one `ChromaticAgent` instance per server process).
- **`ChromaticAgent#chat(message)`** — synchronous; blocks until the tool-runner finishes all tool calls. Can take several seconds on complex queries.
- **`SESSION`** — global `SessionMemory` singleton (defined in the agent repo) that accumulates discovered artists, palettes, techniques, and styles across the conversation. `POST /reset` calls `SESSION.reset!` and reinitializes `$agent`.

### Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Chat UI |
| POST | `/chat` | `{message}` → `{response, summary}` JSON |
| POST | `/reset` | Reinitializes agent and SESSION |

### Frontend

Static files in `public/` (no build step):
- `app.js` — plain fetch-based JS; appends message bubbles, updates sidebar summary, auto-resizes textarea, Enter-to-send
- `style.css` — CSS variables at `:root` for easy theming; two-column flexbox layout (chat + summary sidebar)

Agent responses often contain Markdown and URLs. URLs are linkified in `app.js`; other Markdown is rendered as plain `pre-wrap` text for now.
