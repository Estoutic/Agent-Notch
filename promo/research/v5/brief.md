# Research brief: how to make a 10/10 launch film for a dev tool, made with Claude Code

## Product
Agent Notch: a free, open-source macOS app (MIT, github.com/Forichok/Agent-Notch). It shows each Claude Code and Codex agent as a mark beside the MacBook notch: working (green), waiting for you (amber), stuck (red), done. Click the notch and a panel drops down: permissions with Allow/Deny/Always plus the ⌃⌥Y / ⌃⌥N hotkeys, questions, plan approval, every project and its subagents, usage limits, context and cost, a jump to the agent's window, a completion toast, 13 themes and per-event sounds. It reads local logs only and makes no network calls. Install: `brew install --cask forichok/tap/agent-notch`.
The problem it solves: you run 12 agents, and one has sat on a permission prompt for 20 minutes because you didn't see it. YOU are the bottleneck.

## Where we are
The current film (v4) scores 3/10 in the owner's eyes. It is a Remotion 4 project (React, 30 fps): flat 2D UI recreations, kinetic captions, a procedural Blender MacBook (Cycles, about 6 s on screen, with an empty dark screen), and a Suno music track. Contact sheets: `promo/out/frames-v4/sheet-promo.png` and `sheet-vertical.png` in the working directory; the film is `promo/out/agent-notch-promo.mp4`. Look at them.
Tools on this Mac: Claude Code (Opus), Codex, Remotion, Blender 5.1 (Metal GPU, M1 Max), ffmpeg, Swift (the app can render its real UI to PNG), Suno (the owner generates), Python. The owner can sign up for paid tools if a tool clearly pays off; name the price.
The owner wants: WOW, dynamic, provocative, the top-1 ad for an IT product.

## Rules
- Research the open web, current to 2026: GitHub repos, official docs, release notes, X/Twitter threads, YouTube breakdowns, blogs, Reddit, HN, MCP registries, skill marketplaces.
- Check every claim against a primary source. Give a URL and a date for each. Mark anything you could not verify "UNVERIFIED". No invented repos, versions, stars or prices.
- Allowed: read the repo, browse, write ONE file: your report at the path given below. Forbidden: editing anything else, git commit or push, installing global software, sign-ups, purchases.
- Be concrete: name tools, versions and install commands, and say exactly how Claude Code would drive each one (skill, MCP, CLI, script). Rank by impact on the final result per hour of work.
- End the report with "Top 10 recommendations for Agent Notch" (each: what, why, how, cost, risk) and "What NOT to do".
- Stop when the report is written. Length: 1500–3000 words, English.
