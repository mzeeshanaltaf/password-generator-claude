# RandPass

> **Unbreakable by Design**

A lightweight, client-side random password generator with real-time strength analysis and brute-force crack time estimation. No frameworks, no dependencies, no server — just open `index.html`.

---

## Features

- **Cryptographically secure** — uses `window.crypto.getRandomValues()`, never `Math.random()`
- **Configurable length** — slider from 10 to 50 characters (default 16)
- **Character set selection** — toggle Uppercase, Lowercase, Numbers, and Symbols independently
- **Live password generation** — regenerates instantly on every setting change
- **One-click copy** — copies to clipboard with a 2-second visual confirmation
- **Strength indicator** — 5-segment color bar based on Shannon entropy
- **Crack time estimate** — brute-force time calculated with `BigInt` precision, assuming a 10 billion guesses/sec GPU attack
- **Zero dependencies** — pure HTML, CSS, and JavaScript; works offline

---

## Getting Started

No installation or build step required.

```bash
git clone https://github.com/your-username/randpass.git
cd randpass
```

Then open `index.html` in any modern browser.

> Works with Chrome, Firefox, Edge, and Safari.

---

## How It Works

### Password Generation

Each character is selected by drawing a value from `crypto.getRandomValues(Uint32Array)` and mapping it to the active character pool via modulo. This ensures uniform distribution using a cryptographically strong entropy source.

**Active character pools:**

| Option     | Characters          | Pool size |
|------------|---------------------|-----------|
| Uppercase  | A–Z                 | 26        |
| Lowercase  | a–z                 | 26        |
| Numbers    | 0–9                 | 10        |
| Symbols    | `!@#$%^&*()_+-=[]{}|;:,.<>?` | 32 |

### Strength Meter

Strength is measured using Shannon entropy:

```
entropy (bits) = length × log₂(pool size)
```

| Strength    | Entropy threshold |
|-------------|-------------------|
| Very Weak   | < 28 bits         |
| Weak        | 28 – 35 bits      |
| Fair        | 36 – 59 bits      |
| Strong      | 60 – 127 bits     |
| Very Strong | ≥ 128 bits        |

### Crack Time Estimate

Assumes an offline GPU attack running at **10 billion guesses per second**. Total combinations (`pool size ^ length`) are computed using JavaScript `BigInt` to avoid floating-point precision loss, then converted to a human-readable duration.

---

## Project Structure

```
randpass/
├── index.html            # Page markup
├── style.css             # Dark theme styles
├── script.js             # Password logic
├── CLAUDE.md             # AI assistant context
├── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## Privacy

All passwords are generated **locally in your browser**. No data is sent to any server, no analytics, no tracking.

---

## License

[MIT](LICENSE)
