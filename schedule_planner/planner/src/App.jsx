import { useState, useMemo, useEffect } from "react";
import "./App.css";

export default function App() {
  /* ---------- Preferences state ---------- */
  const NO = "none";
  const MAX_CLASSES = 12;

  const initial = {
    time: NO,
    finals: NO,
    dayOff: NO,
    modality: NO,
    liberalArts: NO,
    dislikedProfessors: "",
  };

  const [values, setValues] = useState(() => {
    const saved = localStorage.getItem("preferences");
    return saved ? JSON.parse(saved) : initial;
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const selectedCount = useMemo(() => {
    let c = 0;
    if (values.time !== NO) c++;
    if (values.finals !== NO) c++;
    if (values.dayOff !== NO) c++;
    if (values.modality !== NO) c++;
    if (values.liberalArts !== NO) c++;
    if (values.dislikedProfessors.trim() !== "") c++;
    return c;
  }, [values]);

  useEffect(() => setError(""), [values]);

  const trySet = (key, next) => {
    const prev = values[key];
    const isText = key === "dislikedProfessors";
    const prevText = isText ? String(prev).trim() : "";
    const nextText = isText ? String(next).trim() : "";

    let newCount = selectedCount;
    if (!isText) {
      if (prev === NO && next !== NO) newCount++;
      if (prev !== NO && next === NO) newCount--;
    } else {
      if (!prevText && nextText) newCount++;
      if (prevText && !nextText) newCount--;
    }

    if (newCount > 4) {
      setError("You can select up to 4 preferences only.");
      return;
    }
    setValues((v) => ({ ...v, [key]: next }));
  };

  /* ---------- Mock catalog & schedule logic ---------- */

  const Days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const Periods = [1, 2, 3, 4, 5];

  function buildMockCatalog() {
    const professors = [
      "Tanaka", "Suzuki", "Sato", "Kobayashi", "Yamada",
      "Anderson", "Nguyen", "Kim", "Watanabe", "Garcia",
    ];
    const categories = ["liberal-arts", "specialized"];
    const modalities = ["on-demand", "face-to-face", "hybrid"];

    const catalog = [];
    let id = 1;

    for (const d of Days) {
      for (const p of Periods) {
        const variants = 3;
        for (let k = 0; k < variants; k++) {
          const prof = professors[(id + k) % professors.length];
          const modality = modalities[(p + k) % modalities.length];
          const category = categories[(id + p + k) % categories.length];
          const hasFinal = ((id + k) % 2) === 0;

          catalog.push({
            id: id++,
            name: `${category === "liberal-arts" ? "LA" : "SP"} ${d}${p}-${k + 1}`,
            day: d,
            period: p,
            professor: prof,
            hasFinal,
            modality,
            category,
          });
        }
      }
    }
    return catalog;
  }

  function generateSchedule(prefs) {
    const catalog = buildMockCatalog();

    const dayOffShort =
      prefs.dayOff !== NO
        ? ["monday", "tuesday", "wednesday", "thursday", "friday"].indexOf(
            prefs.dayOff
          ) !== -1
          ? prefs.dayOff.slice(0, 3)
          : null
        : null;

    const disliked = new Set(
      prefs.dislikedProfessors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase())
    );

    let targetLA = 0.4;
    if (prefs.liberalArts === "prefer-la") targetLA = 0.6;
    if (prefs.liberalArts === "prefer-specialized") targetLA = 0.2;

    const bestPerSlot = [];
    let laCount = 0;
    let totalAssigned = 0;

    for (const day of Days) {
      for (const period of Periods) {
        const key = `${day}-${period}`;

        if (dayOffShort && day.toLowerCase().startsWith(dayOffShort)) {
          bestPerSlot.push({ key, course: null, score: -Infinity });
          continue;
        }

        const candidates = catalog.filter(
          (c) => c.day === day && c.period === period
        );

        let best = null;
        let bestScore = -Infinity;

        for (const c of candidates) {
          if (disliked.has(c.professor.toLowerCase())) continue;

          let score = 0;

          if (prefs.time === "morning") {
            if (period <= 2) score += 3;
            else if (period === 3) score += 0.5;
            else score -= 0.5;
          } else if (prefs.time === "late") {
            if (period >= 4) score += 3;
            else if (period === 3) score += 0.5;
            else score -= 0.5;
          }

          if (prefs.finals === "prefer-finals") {
            score += c.hasFinal ? 1.5 : -0.5;
          } else if (prefs.finals === "avoid-finals") {
            score += c.hasFinal ? -1.0 : 1.0;
          }

          if (prefs.modality !== NO) {
            score += c.modality === prefs.modality ? 1.5 : -0.25;
          }

          const currentRatio = totalAssigned === 0 ? 0 : laCount / totalAssigned;
          if (c.category === "liberal-arts") {
            if (currentRatio < targetLA) score += 1.0;
            else score -= 0.25;
          } else {
            if (currentRatio > targetLA) score += 1.0;
            else score -= 0.25;
          }

          score += Math.random() * 0.2;

          if (score > bestScore) {
            bestScore = score;
            best = c;
          }
        }

        bestPerSlot.push({ key, course: best, score: best ? bestScore : -Infinity });

        if (best) {
          totalAssigned++;
          if (best.category === "liberal-arts") laCount++;
        }
      }
    }

    const chosen = bestPerSlot
      .filter((x) => x.course)
      .sort((a, b) => b.score - a.score);
    const keepSet = new Set(chosen.slice(0, MAX_CLASSES).map((x) => x.key));

    const finalSchedule = {};
    for (const { key, course } of bestPerSlot) {
      finalSchedule[key] = course && keepSet.has(key) ? course : null;
    }

    return finalSchedule;
  }

  const [schedule, setSchedule] = useState(null);

  /* ---------- Submit / Reset ---------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCount > 4) {
      setError("You can select up to 4 preferences only.");
      return;
    }
    localStorage.setItem("preferences", JSON.stringify(values));
    const s = generateSchedule(values);
    setSchedule(s);
    setSaved(true);
  };

  const handleReset = () => {
    setValues(initial);
    localStorage.removeItem("preferences");
    setSaved(false);
    setSchedule(null);
  };

  /* ---------- Modal for course detail ---------- */
  const [openCourse, setOpenCourse] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenCourse(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const CourseModal = ({ course, onClose }) => {
    if (!course) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          display: "grid",
          placeItems: "center",
          zIndex: 50,
          padding: 16,
        }}
      >
        <div
          className="card"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 520, width: "100%" }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{course.name}</h2>
          <p className="muted" style={{ marginTop: 6 }}>
            Details
          </p>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <Row label="Day" value={course.day} />
            <Row label="Period" value={String(course.period)} />
            <Row label="Professor" value={course.professor} />
            <Row label="Modality" value={course.modality} />
            <Row label="Final" value={course.hasFinal ? "Yes" : "No"} />
            <Row label="Category" value={course.category === "liberal-arts" ? "Liberal Arts" : "Specialized"} />
          </div>

          <div className="btn-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const Row = ({ label, value }) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div className="muted" style={{ width: 100, fontSize: 14 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );

  /* ---------- UI Components ---------- */
  const Shell = ({ children }) => (
    <div className="shell">
      <div className="container">{children}</div>
    </div>
  );

  const Card = ({ children }) => <div className="card">{children}</div>;

  const Field = ({ label, help, children }) => (
    <div className="field">
      <label className="field__label">{label}</label>
      {children}
      {help && <div className="muted" style={{ fontSize: 12 }}>{help}</div>}
    </div>
  );

  const Select = (props) => <select className="select" {...props} />;
  const Textarea = (props) => <textarea className="textarea" rows={3} {...props} />;

  /* ---------- Views ---------- */
  if (saved) {
    const totalClasses = schedule
      ? Object.values(schedule).filter(Boolean).length
      : 0;

    return (
      <Shell>
        <Card>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Recommended Schedule</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Generated from your preferences (demo data). Total classes: {totalClasses} / {MAX_CLASSES}
          </p>

          <div className="tt-grid">
            <div className="tt-head">Time</div>
            {Days.map((d) => (
              <div key={d} className="tt-head">{d}</div>
            ))}
            {Periods.map((p) => (
              <>
                <div key={`p-${p}`} className="tt-period">Period {p}</div>
                {Days.map((d) => {
                  const key = `${d}-${p}`;
                  const course = schedule?.[key];
                  const clickable = Boolean(course);
                  return (
                    <button
                      key={key}
                      className="tt-cell"
                      onClick={() => clickable && setOpenCourse(course)}
                      disabled={!clickable}
                      style={{
                        background: "var(--panel)",
                        border: "1px solid var(--panel-border)",
                        borderRadius: "var(--radius)",
                        padding: 10,
                        minHeight: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        color: "var(--ink)",
                        opacity: clickable ? 0.95 : 0.6,
                        cursor: clickable ? "pointer" : "default",
                      }}
                      aria-label={clickable ? `Open details for ${course.name}` : "Empty slot"}
                      title={clickable ? "Click to view details" : ""}
                    >
                      {course ? course.name : <span className="muted">-</span>}
                    </button>
                  );
                })}
              </>
            ))}
          </div>

          <div className="btn-row">
            <button className="btn btn--ghost" onClick={() => setSaved(false)}>
              Back to Preferences
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn"
                onClick={() => {
                  const s = generateSchedule(values);
                  setSchedule(s);
                }}
              >
                Generate Again
              </button>
            </div>
          </div>
          <CourseModal course={openCourse} onClose={() => setOpenCourse(null)} />
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Preferences</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          You can select up to <strong>4</strong> preferences. “No Preference” will not be counted.
        </p>

        <form onSubmit={handleSubmit} className="form__row">
          <Field label="1. Prefer morning or late classes?">
            <Select value={values.time} onChange={(e) => trySet("time", e.target.value)}>
              <option value={NO}>No Preference</option>
              <option value="morning">Morning</option>
              <option value="late">Late</option>
            </Select>
          </Field>

          <Field label="2. Prefer courses with final exams?">
            <Select value={values.finals} onChange={(e) => trySet("finals", e.target.value)}>
              <option value={NO}>No Preference</option>
              <option value="prefer-finals">Prefer finals</option>
              <option value="avoid-finals">Prefer no finals</option>
            </Select>
          </Field>

          <Field label="3. Prefer having a day off?" help="One day off in a week (e.g., Wednesday).">
            <Select value={values.dayOff} onChange={(e) => trySet("dayOff", e.target.value)}>
              <option value={NO}>No Preference</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
            </Select>
          </Field>

          <Field label="4. Prefer on-demand or face-to-face?">
            <Select value={values.modality} onChange={(e) => trySet("modality", e.target.value)}>
              <option value={NO}>No Preference</option>
              <option value="on-demand">On-demand</option>
              <option value="face-to-face">Face-to-face</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </Field>

          <Field label="5. Prefer taking liberal arts or not?">
            <Select value={values.liberalArts} onChange={(e) => trySet("liberalArts", e.target.value)}>
              <option value={NO}>No Preference</option>
              <option value="prefer-la">Prefer liberal arts</option>
              <option value="prefer-specialized">Prefer specialized</option>
            </Select>
          </Field>

          <Field label="6. Professors you want to avoid?">
            <Textarea
              value={values.dislikedProfessors}
              onChange={(e) => trySet("dislikedProfessors", e.target.value)}
              placeholder="e.g., Tanaka, Suzuki"
            />
          </Field>

          <div className="btn-row">
            <div className="muted" style={{ fontSize: 14 }}>
              Selected: <strong>{selectedCount}</strong> / 4
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn--ghost" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="btn">
                Save Preferences
              </button>
            </div>
          </div>

          {error && <div className="alert--error">{error}</div>}
        </form>
      </Card>
    </Shell>
  );
}
