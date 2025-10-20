/* ---- Theme tokens ---- */
:root {
  --bg: #0f172a;
  --panel: #111827;
  --panel-border: #1f2937;
  --ink: #e2e8f0;
  --muted: #9ca3af;
  --brand: #2563eb;
  --brand-border: #1e40af;
  --field-bg: #0b1220;
  --field-border: #334155;
  --danger-bg: #7f1d1d;
  --danger-ink: #fee2e2;
  --danger-border: #991b1b;
  --radius: 12px;
  --shadow: 0 6px 24px rgba(0,0,0,.25);
}

/* ---- Base ---- */
html, body { height: 100%; }
body {
  background: var(--bg);
  color: var(--ink);
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Arial, sans-serif;
}
h1, h2, p { margin: 0; }
p + p { margin-top: 6px; }

/* ---- Layout ---- */
.shell {
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
}
.container {
  max-width: 920px;
  margin: 0 auto;
  padding: 32px 16px;
}

/* ---- Card ---- */
.card {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 20px;
}

/* ---- Typography helpers ---- */
.muted { color: var(--muted); }

/* ---- Form ---- */
.field { display: grid; gap: 8px; }
.field__label { font-weight: 600; }
.select, .textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--field-bg);
  color: var(--ink);
  border: 1px solid var(--field-border);
  border-radius: var(--radius);
  outline: none;
}
.textarea { resize: vertical; }
.form__row { display: grid; gap: 16px; margin-top: 16px; }

/* ---- Buttons ---- */
.btn {
  padding: 10px 16px;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  border: 1px solid var(--brand-border);
  background: var(--brand);
  color: #fff;
  transition: transform .08s ease, background-color .08s ease, border-color .08s ease, opacity .08s ease;
}
.btn:hover { transform: translateY(-1px); }
.btn--ghost {
  background: transparent;
  color: var(--ink);
  border-color: var(--field-border);
}
.btn-row {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

/* ---- Alerts ---- */
.alert--error {
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--danger-bg);
  color: var(--danger-ink);
  border: 1px solid var(--danger-border);
}

/* ---- Timetable ---- */
.tt-grid {
  display: grid;
  grid-template-columns: 110px repeat(5, 1fr);
  gap: 10px;
  margin-top: 16px;
}
.tt-head {
  background: transparent;
  border: 1px dashed var(--field-border);
  color: var(--muted);
  border-radius: var(--radius);
  padding: 10px;
  font-weight: 700;
  text-align: center;
}
.tt-period, .tt-cell {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius);
  padding: 10px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.tt-period { font-weight: 700; }
