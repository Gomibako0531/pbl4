// src/App.jsx
import React, { useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert } from "react-bootstrap";
// App.jsx 内の generateSchedule を置き換え
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = [1, 2, 3, 4, 5];

// ダミー講義プール（教授名/形式/期末の有無つき）
const CLASS_POOL = [
  { name:"Class A", prof:"Dr. Sato",    format:"Face-to-face", final:true  },
  { name:"Class B", prof:"Dr. Tanaka",  format:"On-demand (online)", final:false },
  { name:"Class C", prof:"Dr. Suzuki",  format:"Hybrid", final:true },
  { name:"Seminar X", prof:"Dr. Yamada", format:"Face-to-face", final:false },
  { name:"Lab Y",     prof:"Dr. Ito",    format:"Face-to-face", final:true },
  { name:"Workshop Z",prof:"Dr. Watanabe",format:"On-demand (online)", final:false },
  { name:"Elective M",prof:"Dr. Kobayashi",format:"Hybrid", final:true },
  { name:"Elective N",prof:"Dr. Kimura", format:"Face-to-face", final:false },
];

// 簡易スコアで希望に近いコマを選ぶ
function generateSchedule(prefs) {
  const grid = Array.from({ length: PERIODS.length }, () =>
    Array.from({ length: DAYS.length }, () => null)
  );

  // 1) 使える講義候補をフィルタ
  let pool = CLASS_POOL.filter(c => {
    if (prefs.dislikedProf?.trim()) {
      const bad = prefs.dislikedProf.toLowerCase();
      if (c.prof.toLowerCase().includes(bad)) return false;
    }
    return true;
  });

  // 2) スロットごとの希望スコア算出関数
  const scoreSlot = (day, period, course) => {
    let s = 0;

    // Day Off は埋めない
    if (prefs.dayOff !== "No Preference") {
      const off = prefs.dayOff;
      if ((off === "Monday" && day === "Mon")
       || (off === "Friday" && day === "Fri")
       || (off.includes("Mid-week") && day === "Wed")) return -Infinity;
    }

    // 朝/遅めの希望
    if (prefs.morningLate === "Prefer Morning" && period <= 2) s += 2;
    if (prefs.morningLate === "Prefer Late"    && period >= 4) s += 2;

    // 形式の希望
    if (prefs.format !== "No Preference") {
      if (course.format === prefs.format) s += 2;
      else if (prefs.format === "Hybrid" && course.format === "Face-to-face") s += 1; // ゆるめ加点例
    }

    // 期末の希望
    if (prefs.finals !== "No Preference") {
      if (prefs.finals === "Yes" && course.final) s += 2;
      if (prefs.finals === "No"  && !course.final) s += 2;
    }

    // リベラルアーツの希望（ここではダミーで Class A/B を一般教養と見なす例）
    if (prefs.liberalArts !== "No Preference") {
      const isLA = ["Class A","Class B"].includes(course.name);
      if (prefs.liberalArts === "Yes, take liberal arts" && isLA) s += 1;
      if (prefs.liberalArts === "No, focus on major" && !isLA) s += 1;
    }

    return s;
  };

  // 3) 各スロットに高スコアの講義を入れる（最大8コマ）
  const slotsToFill = 8;
  let used = new Set();

  for (let k = 0; k < slotsToFill; k++) {
    let best = { i: -1, j: -1, course: null, score: -Infinity };

    for (let i = 0; i < PERIODS.length; i++) {
      for (let j = 0; j < DAYS.length; j++) {
        if (grid[i][j]) continue; // 既に埋まってる

        for (const c of pool) {
          if (used.has(c.name)) continue; // 同じ講義は1回まで（仮）
          const sc = scoreSlot(DAYS[j], PERIODS[i], c);
          if (sc > best.score) best = { i, j, course: c, score: sc };
        }
      }
    }

    // 置ける場所があれば配置
    if (best.course && best.score > -Infinity) {
      grid[best.i][best.j] = `${best.course.name} (${best.course.prof})`;
      used.add(best.course.name);
    } else {
      break; // 置けないなら終了
    }
  }

  return grid; // [periodIdx][dayIdx]
}


function PreferencesForm({ onSave }) {
  const [prefs, setPrefs] = useState({
    morningLate: "No Preference",
    finals: "No Preference",
    dayOff: "No Preference",
    format: "No Preference",
    liberalArts: "No Preference",
    dislikedProf: "",
  });

  // 状態更新のショート関数
  const handleChange = (field, value) => {
    setPrefs({ ...prefs, [field]: value });
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">Preferences</Card.Title>
        <Form
          className="row g-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(prefs);
          }}
        >
          {/* 1. Prefer morning or late classes */}
          <Form.Group as={Col} md={6}>
            <Form.Label>1. Prefer morning or late classes?</Form.Label>
            <Form.Select
              value={prefs.morningLate}
              onChange={(e) => handleChange("morningLate", e.target.value)}
            >
              <option>No Preference</option>
              <option>Prefer Morning</option>
              <option>Prefer Late</option>
            </Form.Select>
          </Form.Group>

          {/* 2. Prefer courses with finals */}
          <Form.Group as={Col} md={6}>
            <Form.Label>2. Prefer courses with finals?</Form.Label>
            <Form.Select
              value={prefs.finals}
              onChange={(e) => handleChange("finals", e.target.value)}
            >
              <option>No Preference</option>
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Form.Group>

          {/* 3. Prefer having day off */}
          <Form.Group as={Col} md={6}>
            <Form.Label>3. Prefer having day off?</Form.Label>
            <Form.Select
              value={prefs.dayOff}
              onChange={(e) => handleChange("dayOff", e.target.value)}
            >
              <option>No Preference</option>
              <option>Monday</option>
              <option>Friday</option>
              <option>Mid-week (Wed)</option>
            </Form.Select>
          </Form.Group>

          {/* 4. Prefer on-demand or face-to-face */}
          <Form.Group as={Col} md={6}>
            <Form.Label>4. Prefer on-demand or face-to-face?</Form.Label>
            <Form.Select
              value={prefs.format}
              onChange={(e) => handleChange("format", e.target.value)}
            >
              <option>No Preference</option>
              <option>On-demand (online)</option>
              <option>Face-to-face</option>
              <option>Hybrid</option>
            </Form.Select>
          </Form.Group>

          {/* 5. Prefer taking liberal arts or not */}
          <Form.Group as={Col} md={6}>
            <Form.Label>5. Prefer taking liberal arts or not</Form.Label>
            <Form.Select
              value={prefs.liberalArts}
              onChange={(e) => handleChange("liberalArts", e.target.value)}
            >
              <option>No Preference</option>
              <option>Yes, take liberal arts</option>
              <option>No, focus on major</option>
            </Form.Select>
          </Form.Group>

          {/* 6. Any professors you don't like */}
          <Form.Group as={Col} md={6}>
            <Form.Label>6. Any professors you don't like? (optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name(s)"
              value={prefs.dislikedProf}
              onChange={(e) => handleChange("dislikedProf", e.target.value)}
            />
          </Form.Group>

          {/* Save button */}
          <Col xs={12}>
            <Button type="submit" variant="primary">
              Save Preferences
            </Button>
          </Col>
        </Form>
      </Card.Body>
    </Card>
  );
}


// ScheduleView を差し替え
function ScheduleView({ prefs, onBack }) {
  const [nonce, setNonce] = useState(0);            // ← 再生成トリガ

  const schedule = useMemo(() => generateSchedule(prefs), [prefs, nonce]); // ← 依存に追加

  return (
    <>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className="mb-0">Recommended Timetable (1 week)</Card.Title>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={onBack}>Back to Preferences</Button>
              <Button variant="outline-primary" onClick={() => setNonce(n => n + 1)}>
                Generate Again
              </Button>
            </div>
          </div>

          {/* 6つの preference のサマリ（必要なら） */}
          {/* ... 省略（前回のAlert部分） ... */}

          <div className="table-responsive">
            <Table bordered hover className="align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 100 }}>Period</th>
                  {DAYS.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((p, i) => (
                  <tr key={p}>
                    <th>{p}</th>
                    {DAYS.map((d, j) => (
                      <td key={`${i}-${j}`}>
                        {schedule[i][j] ?? <span className="text-muted">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <div className="position-fixed bottom-0 end-0 m-3">
        <Button size="lg" variant="success">Confirm</Button>
      </div>
    </>
  );
}



export default function App() {
  const [prefs, setPrefs] = useState(null);
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">Schedule Planner</a>
        </div>
      </nav>

      <Container className="py-4">
        <Row className="g-4">
          <Col lg={8} className="mx-auto">
            {!prefs ? (
              <PreferencesForm onSave={setPrefs} />
            ) : (
              <ScheduleView
                prefs={prefs}
                onBack={() => setPrefs(null)}
                onRegenerate={() => setPrefs({ ...prefs })} // 依存で再生成
              />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}
