'use strict';

// ─── Character sets ────────────────────────────────────────────────
const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// ─── Strength config ───────────────────────────────────────────────
const STRENGTH_LEVELS = [
  { label: 'Very Weak', color: '#ef4444', segments: 1, minBits: 0   },
  { label: 'Weak',      color: '#f97316', segments: 2, minBits: 28  },
  { label: 'Fair',      color: '#eab308', segments: 3, minBits: 36  },
  { label: 'Strong',    color: '#22c55e', segments: 4, minBits: 60  },
  { label: 'Very Strong', color: '#06b6d4', segments: 5, minBits: 128 }
];

// Attacker speed: 10 billion guesses/second (GPU offline attack)
const GUESSES_PER_SECOND = BigInt('10000000000');

// ─── DOM refs ─────────────────────────────────────────────────────
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn        = document.getElementById('copyBtn');
const copyLabel      = document.getElementById('copyLabel');
const generateBtn    = document.getElementById('generateBtn');
const lengthSlider   = document.getElementById('lengthSlider');
const lengthValue    = document.getElementById('lengthValue');
const chkUpper       = document.getElementById('chkUpper');
const chkLower       = document.getElementById('chkLower');
const chkNumbers     = document.getElementById('chkNumbers');
const chkSymbols     = document.getElementById('chkSymbols');
const strengthLabel  = document.getElementById('strengthLabel');
const crackTime      = document.getElementById('crackTime');
const segments       = [1, 2, 3, 4, 5].map(i => document.getElementById(`seg${i}`));

const checkboxes = [chkUpper, chkLower, chkNumbers, chkSymbols];

// ─── Build character pool ──────────────────────────────────────────
function getCharset() {
  let pool = '';
  if (chkUpper.checked)   pool += CHARS.upper;
  if (chkLower.checked)   pool += CHARS.lower;
  if (chkNumbers.checked) pool += CHARS.numbers;
  if (chkSymbols.checked) pool += CHARS.symbols;
  return pool;
}

// ─── Cryptographically random password ────────────────────────────
function generatePassword() {
  const pool   = getCharset();
  const length = parseInt(lengthSlider.value, 10);

  if (!pool.length) return;

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += pool[array[i] % pool.length];
  }

  passwordOutput.value = password;
  updateStrengthUI(length, pool.length);
}

// ─── Entropy & strength ────────────────────────────────────────────
function calcEntropy(length, poolSize) {
  if (poolSize < 2) return 0;
  return length * Math.log2(poolSize);
}

function calcStrength(bits) {
  let level = STRENGTH_LEVELS[0];
  for (const l of STRENGTH_LEVELS) {
    if (bits >= l.minBits) level = l;
  }
  return level;
}

// ─── Brute-force crack time (BigInt for large numbers) ────────────
function calcCrackTime(length, poolSize) {
  if (poolSize < 1) return '—';

  const combinations = BigInt(poolSize) ** BigInt(length);
  const seconds      = combinations / GUESSES_PER_SECOND;

  if (seconds === 0n) return 'Instantly';

  const s = Number(seconds);

  if (s < 60)           return formatNum(s, 'second');
  if (s < 3600)         return formatNum(s / 60, 'minute');
  if (s < 86400)        return formatNum(s / 3600, 'hour');
  if (s < 31_536_000)   return formatNum(s / 86400, 'day');

  // For very large values stay in BigInt
  const years = seconds / BigInt(31_536_000);

  if (years < 100n)       return formatBig(years, 'year');
  if (years < 10_000n)    return formatBig(years / 100n, 'century', 'centuries');
  if (years < 1_000_000n) return formatBig(years / 1000n, 'millennium', 'millennia');

  return 'Longer than the age of the universe';
}

function formatNum(value, unit) {
  const n = Math.round(value);
  return `${n.toLocaleString()} ${unit}${n !== 1 ? 's' : ''}`;
}

function formatBig(value, unit, plural) {
  const n = Number(value);
  const label = plural ? (n !== 1 ? plural : unit) : `${unit}${n !== 1 ? 's' : ''}`;
  return `${n.toLocaleString()} ${label}`;
}

// ─── Update UI after generation ────────────────────────────────────
function updateStrengthUI(length, poolSize) {
  const bits   = calcEntropy(length, poolSize);
  const level  = calcStrength(bits);
  const timeStr = calcCrackTime(length, poolSize);

  // Strength bar
  segments.forEach((seg, i) => {
    if (i < level.segments) {
      seg.style.backgroundColor = level.color;
    } else {
      seg.style.backgroundColor = '';
    }
  });

  // Strength label
  strengthLabel.textContent  = level.label;
  strengthLabel.style.color  = level.color;

  // Crack time
  crackTime.textContent = timeStr;
}

// ─── Prevent last checkbox from being unchecked ────────────────────
function guardCheckboxes() {
  const checked = checkboxes.filter(c => c.checked);
  checkboxes.forEach(c => {
    c.disabled = checked.length === 1 && c.checked;
  });
}

// ─── Copy to clipboard ─────────────────────────────────────────────
function copyToClipboard() {
  const text = passwordOutput.value;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showCopied();
  }).catch(() => {
    // Fallback for non-HTTPS or old browsers
    passwordOutput.select();
    document.execCommand('copy');
    showCopied();
  });
}

function showCopied() {
  copyBtn.classList.add('copied');
  copyLabel.textContent = 'Copied!';

  // Swap clipboard icon for checkmark
  const icon = copyBtn.querySelector('.icon');
  icon.innerHTML = `
    <polyline points="20 6 9 17 4 12"></polyline>
  `;

  setTimeout(() => {
    copyBtn.classList.remove('copied');
    copyLabel.textContent = 'Copy';
    icon.innerHTML = `
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    `;
  }, 2000);
}

// ─── Event listeners ───────────────────────────────────────────────
lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
  generatePassword();
});

checkboxes.forEach(chk => {
  chk.addEventListener('change', () => {
    guardCheckboxes();
    generatePassword();
  });
});

generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);

// ─── Init ──────────────────────────────────────────────────────────
guardCheckboxes();
generatePassword();
