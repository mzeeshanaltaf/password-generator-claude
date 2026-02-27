# RandPass — CLAUDE.md

## Project Overview
**RandPass** is a client-side random password generator with the tagline *"Unbreakable by Design"*.
Pure HTML/CSS/JS — no build tools, no dependencies, no server required. Open `index.html` directly in a browser.

## File Structure
```
index.html   — page markup
style.css    — all styles
script.js    — all application logic
CLAUDE.md    — this file
```

## Tech Stack & Constraints
- **No frameworks, no npm, no build step** — everything is vanilla HTML/CSS/JS
- **No external CDN links or third-party libraries** — fully self-contained
- Target browsers: modern evergreen (Chrome, Firefox, Edge, Safari)

## Features
| Feature | Detail |
|---|---|
| Password length | Slider, min 10 / max 50, default 16 |
| Character sets | Uppercase, Lowercase, Numbers, Symbols — all on by default |
| Last-checkbox guard | The final active checkbox is disabled to prevent an empty charset |
| Randomness | `window.crypto.getRandomValues()` — never `Math.random()` |
| Copy | `navigator.clipboard.writeText()` with `execCommand` fallback; 2-second "Copied!" feedback |
| Strength meter | 5-segment bar based on Shannon entropy (`bits = length × log2(poolSize)`) |
| Crack time | `BigInt` exponentiation, assumes 10¹⁰ GPU guesses/second |
| Auto-generate | On page load and on every slider/checkbox change |

## Design System (Dark Theme)
| Token | Value |
|---|---|
| Page background | `#0f172a` |
| Card background | `#1e293b` |
| Border | `#334155` |
| Text primary | `#f1f5f9` |
| Text muted | `#94a3b8` |
| Accent (cyan) | `#06b6d4` |
| Success (green) | `#10b981` |
| Heading font | `'Courier New', monospace` |
| Body font | `Inter, system-ui, sans-serif` |

Strength bar colors: red `#ef4444` → orange `#f97316` → yellow `#eab308` → green `#22c55e` → cyan `#06b6d4`

## Strength & Crack Time Logic

### Entropy thresholds (`script.js`)
```
< 28 bits  → Very Weak
28–35 bits → Weak
36–59 bits → Fair
60–127 bits → Strong
≥ 128 bits  → Very Strong
```

### Crack time display thresholds
```
< 1 second      → "Instantly"
< 60 s          → X seconds
< 3600 s        → X minutes
< 86400 s       → X hours
< 31,536,000 s  → X days
< 100 years     → X years
< 10,000 years  → X centuries
< 1,000,000 yrs → X millennia
else            → "Longer than the age of the universe"
```

## Key Functions (`script.js`)
| Function | Purpose |
|---|---|
| `getCharset()` | Builds character pool from checked options |
| `generatePassword()` | Picks characters via `crypto.getRandomValues()` |
| `calcEntropy(length, poolSize)` | Returns Shannon entropy in bits |
| `calcStrength(bits)` | Maps bits → strength level object |
| `calcCrackTime(length, poolSize)` | BigInt crack time → human-readable string |
| `guardCheckboxes()` | Disables the last active checkbox |
| `copyToClipboard()` | Copies password, shows 2-second feedback |
| `updateStrengthUI(length, poolSize)` | Refreshes bar, label, and crack time |

## Development Notes
- All logic is in a single `script.js` with `'use strict'` at the top
- CSS custom properties (`--bg`, `--accent`, etc.) are defined on `:root` in `style.css`
- The slider track fill is handled via the native range appearance; the thumb is custom-styled with `-webkit-slider-thumb`
- Responsive breakpoint at `420px` collapses the checkbox grid to a single column
