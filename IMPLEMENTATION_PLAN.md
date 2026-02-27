# RandPass — Implementation Plan

## Context
Building a brand-new random password generator web app named **RandPass** with the tagline *"Unbreakable by Design"*. The working directory is currently empty. The app must be pure HTML/CSS/JS (no build tools, no dependencies) with a dark theme, and must be openable directly in a browser via `index.html`.

---

## File Structure

```
index.html   ← markup + links to CSS/JS
style.css    ← all styles (dark theme, slider, checkboxes, strength bar)
script.js    ← password generation, strength calculation, crack-time logic
```

---

## Feature Spec

### 1. Header
- App name: **RandPass** (bold, large, monospace/tech font)
- Tagline: *Unbreakable by Design* (muted subtitle)

### 2. Password Display & Copy
- Readonly `<input type="text">` showing the generated password
- **Copy button** (clipboard icon + "Copy" label) to the right of the input
- On copy success: button briefly changes to "Copied!" with a checkmark for 2 seconds
- Auto-generate a password on page load

### 3. Password Length Slider
- `<input type="range">` — min `10`, max `50`, default `16`
- Display current value dynamically (e.g., "Length: 16")
- Regenerate password live on slider change

### 4. Character Set Checkboxes
- Four checkboxes, **all checked by default**:
  - Uppercase (A–Z) — 26 chars
  - Lowercase (a–z) — 26 chars
  - Numbers (0–9) — 10 chars
  - Symbols (`!@#$%^&*()_+-=[]{}|;:,.<>?`) — 32 chars
- **Guard**: prevent unchecking the last active checkbox (disable it when it's the only one left)
- Regenerate password live on any checkbox change

### 5. Generate Button
- Prominent "Generate Password" button
- Clicking generates a new password with current settings

### 6. Password Strength Indicator
- 5-segment visual bar (one colored segment per strength level)
- Strength label displayed next to the bar
- Strength levels (based on entropy in bits):

| Level       | Entropy (bits) | Bar color  |
|-------------|---------------|------------|
| Very Weak   | < 28          | #ef4444 (red)    |
| Weak        | 28–35         | #f97316 (orange) |
| Fair        | 36–59         | #eab308 (yellow) |
| Strong      | 60–127        | #22c55e (green)  |
| Very Strong | ≥ 128         | #06b6d4 (cyan)   |

Entropy formula: `bits = length × log2(charsetSize)`

### 7. Brute Force Crack Time
- Assumption: attacker runs at **10 billion (10^10) guesses/second** (GPU offline attack)
- Total combinations: `charsetSize ^ length`
- Time in seconds: `combinations / 10^10`
- Displayed in human-readable form:

| Threshold       | Display        |
|-----------------|----------------|
| < 1 second      | Instantly       |
| < 60 seconds    | X seconds       |
| < 3600          | X minutes       |
| < 86400         | X hours         |
| < 31536000      | X days          |
| < 3.15e10       | X years         |
| < 3.15e12       | X centuries     |
| ≥ 3.15e12       | X millennia / "Longer than the age of the universe" |

Use JavaScript `BigInt` for large exponentiation to avoid precision loss.

---

## Visual Design (Dark Theme)

| Token           | Value              |
|-----------------|--------------------|
| Page bg         | `#0f172a`          |
| Card bg         | `#1e293b`          |
| Card border     | `#334155`          |
| Text primary    | `#f1f5f9`          |
| Text muted      | `#94a3b8`          |
| Accent (cyan)   | `#06b6d4`          |
| Success (green) | `#10b981`          |
| Font (headings) | `'Courier New', monospace` |
| Font (body)     | `Inter, system-ui, sans-serif` |

- Centered card layout, max-width ~480px, rounded corners, subtle border
- Custom-styled range slider (cyan thumb, dark track)
- Custom-styled checkboxes (cyan accent on checked state)
- Subtle box-shadow glow on the password input field

---

## Implementation Details

### `script.js` — Key Functions

```
getCharset()               → builds character pool from checked options
generatePassword()         → crypto.getRandomValues() for cryptographic randomness
calcEntropy(len, poolSize) → len * Math.log2(poolSize)
calcStrength(entropy)      → returns { level, label, color, segments }
calcCrackTime(len, poolSize) → BigInt math → human-readable string
copyToClipboard()          → navigator.clipboard.writeText() with fallback
updateStrengthUI()         → refreshes bar segments, label, and crack time
guardCheckboxes()          → disables the last active checkbox
```

**Cryptographic randomness**: Use `window.crypto.getRandomValues(new Uint32Array(length))` modulo charset length to pick each character — not `Math.random()`.

### Event Wiring
- `slider` → `input` event → update length label → `generatePassword()`
- `checkboxes` → `change` event → guard last-one logic → `generatePassword()`
- `generateBtn` → `click` → `generatePassword()`
- `copyBtn` → `click` → `copyToClipboard()`

---

## Files to Create

| File        | Purpose                        |
|-------------|--------------------------------|
| `index.html` | Page structure, links CSS/JS  |
| `style.css`  | All styles                    |
| `script.js`  | All logic                     |

---

## Verification

1. Open `index.html` directly in Chrome/Firefox (no server needed)
2. Verify a password is auto-generated on load
3. Move the slider — confirm password updates and length label changes
4. Uncheck checkboxes one by one — verify the last one cannot be unchecked
5. Click "Copy" — paste into a text editor and confirm the password matches
6. Observe strength bar and crack time update in real time
7. Test edge cases: length=10 with only one charset (weakest), length=50 with all charsets (strongest)
