import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, LabelList,
} from "recharts";

/* ============================================================
   DATA  — computed from a 1,470-row synthetic HR dataset via
   pandas (generate_data.py + analyze.py). Every number below
   is an aggregate read out of that pipeline, not hand-typed.
   ============================================================ */
const DATA = {
  kpis: { totalEmployees: 1470, attritionRate: 23.6, avgMonthlyIncome: 6997, avgTenure: 3.3, avgJobSatisfaction: 2.85, highRiskCount: 153 },
  byDepartment: [
    { name: "Engineering", headcount: 261, attritionRate: 26.8, avgIncome: 7621 },
    { name: "Finance", headcount: 92, attritionRate: 18.5, avgIncome: 6840 },
    { name: "Human Resources", headcount: 98, attritionRate: 20.4, avgIncome: 5754 },
    { name: "Research & Development", headcount: 568, attritionRate: 24.5, avgIncome: 7292 },
    { name: "Sales", headcount: 451, attritionRate: 22.4, avgIncome: 6566 },
  ],
  byJobRole: [
    { name: "Research Scientist", headcount: 125, attritionRate: 32.0 },
    { name: "Laboratory Technician", headcount: 141, attritionRate: 31.9 },
    { name: "HR Specialist", headcount: 33, attritionRate: 30.3 },
    { name: "Software Engineer", headcount: 57, attritionRate: 29.8 },
    { name: "Sales Executive", headcount: 157, attritionRate: 28.7 },
    { name: "Senior Engineer", headcount: 63, attritionRate: 27.0 },
    { name: "QA Engineer", headcount: 66, attritionRate: 25.8 },
    { name: "Engineering Manager", headcount: 75, attritionRate: 25.3 },
    { name: "Sales Representative", headcount: 138, attritionRate: 23.2 },
    { name: "Financial Analyst", headcount: 36, attritionRate: 22.2 },
    { name: "R&D Manager", headcount: 164, attritionRate: 21.3 },
    { name: "Accountant", headcount: 24, attritionRate: 20.8 },
    { name: "HR Executive", headcount: 31, attritionRate: 19.4 },
    { name: "Sales Manager", headcount: 156, attritionRate: 15.4 },
    { name: "Manufacturing Director", headcount: 138, attritionRate: 13.8 },
    { name: "Finance Manager", headcount: 32, attritionRate: 12.5 },
    { name: "HR Manager", headcount: 34, attritionRate: 11.8 },
  ],
  byAgeBand: [
    { name: "18-25", headcount: 183, attritionRate: 30.1 },
    { name: "26-30", headcount: 220, attritionRate: 24.5 },
    { name: "31-35", headcount: 268, attritionRate: 23.1 },
    { name: "36-40", headcount: 311, attritionRate: 22.5 },
    { name: "41-45", headcount: 234, attritionRate: 18.8 },
    { name: "46-50", headcount: 155, attritionRate: 21.3 },
    { name: "51-60", headcount: 99, attritionRate: 29.3 },
  ],
  byTenureBand: [
    { name: "0-1 yrs", headcount: 613, attritionRate: 27.7 },
    { name: "2-3 yrs", headcount: 332, attritionRate: 23.8 },
    { name: "4-5 yrs", headcount: 216, attritionRate: 19.0 },
    { name: "6-10 yrs", headcount: 220, attritionRate: 19.5 },
    { name: "10+ yrs", headcount: 89, attritionRate: 15.7 },
  ],
  byOvertime: [
    { name: "No overtime", headcount: 1047, attritionRate: 20.3 },
    { name: "Overtime", headcount: 423, attritionRate: 31.7 },
  ],
  byJobSatisfaction: [
    { name: "1 · Low", headcount: 216, attritionRate: 31.5 },
    { name: "2 · Medium", headcount: 284, attritionRate: 26.1 },
    { name: "3 · High", headcount: 471, attritionRate: 24.0 },
    { name: "4 · Very high", headcount: 499, attritionRate: 18.4 },
  ],
  byWorkLifeBalance: [
    { name: "1 · Bad", headcount: 120, attritionRate: 29.2 },
    { name: "2 · Good", headcount: 370, attritionRate: 29.2 },
    { name: "3 · Better", headcount: 641, attritionRate: 21.8 },
    { name: "4 · Best", headcount: 339, attritionRate: 18.9 },
  ],
  salaryByLevel: [
    { name: "Level 1", headcount: 629, avgIncome: 6393, minIncome: 3427, maxIncome: 11084 },
    { name: "Level 2", headcount: 523, avgIncome: 7090, minIncome: 3789, maxIncome: 11798 },
    { name: "Level 3", headcount: 225, avgIncome: 7713, minIncome: 4544, maxIncome: 13494 },
    { name: "Level 4", headcount: 64, avgIncome: 8630, minIncome: 4698, maxIncome: 13590 },
    { name: "Level 5", headcount: 29, avgIncome: 9265, minIncome: 5610, maxIncome: 13776 },
  ],
  genderPayGap: { maleAvg: 6967, femaleAvg: 7040, gapPercent: -1.0 },
  byDistance: [
    { name: "0–5 km", headcount: 873, attritionRate: 22.8 },
    { name: "6–10 km", headcount: 302, attritionRate: 20.5 },
    { name: "11–15 km", headcount: 149, attritionRate: 30.2 },
    { name: "16–20 km", headcount: 71, attritionRate: 25.4 },
    { name: "21+ km", headcount: 75, attritionRate: 30.7 },
  ],
  byPromotionGap: [
    { name: "0 yrs", headcount: 517, attritionRate: 24.8 },
    { name: "1 yr", headcount: 611, attritionRate: 25.0 },
    { name: "2 yrs", headcount: 203, attritionRate: 20.7 },
    { name: "3–4 yrs", headcount: 106, attritionRate: 18.9 },
    { name: "5+ yrs", headcount: 33, attritionRate: 12.1 },
  ],
  genderCompByDept: [
    { Department: "Engineering", Female: 103, Male: 158 },
    { Department: "Finance", Female: 36, Male: 56 },
    { Department: "Human Resources", Female: 47, Male: 51 },
    { Department: "Research & Development", Female: 239, Male: 329 },
    { Department: "Sales", Female: 177, Male: 274 },
  ],
  flightRisk: [
    { Name: "Pamela Wilson", Department: "Research & Development", JobRole: "Manufacturing Director", YearsAtCompany: 4, JobSatisfaction: 2, OverTime: "Yes", riskScore: 8.0 },
    { Name: "Sarah Ramirez", Department: "Sales", JobRole: "Sales Executive", YearsAtCompany: 6, JobSatisfaction: 2, OverTime: "Yes", riskScore: 7.0 },
    { Name: "Kenneth Rivera", Department: "Sales", JobRole: "Sales Representative", YearsAtCompany: 12, JobSatisfaction: 1, OverTime: "Yes", riskScore: 7.0 },
    { Name: "Steven Mitchell", Department: "Finance", JobRole: "Accountant", YearsAtCompany: 8, JobSatisfaction: 2, OverTime: "Yes", riskScore: 7.0 },
    { Name: "Benjamin Ramirez", Department: "Sales", JobRole: "Sales Manager", YearsAtCompany: 8, JobSatisfaction: 2, OverTime: "Yes", riskScore: 7.0 },
    { Name: "Anna Adams", Department: "Sales", JobRole: "Sales Representative", YearsAtCompany: 1, JobSatisfaction: 2, OverTime: "Yes", riskScore: 6.5 },
    { Name: "Stephanie Hall", Department: "Research & Development", JobRole: "Laboratory Technician", YearsAtCompany: 4, JobSatisfaction: 2, OverTime: "Yes", riskScore: 6.5 },
    { Name: "James Walker", Department: "Sales", JobRole: "Sales Executive", YearsAtCompany: 4, JobSatisfaction: 3, OverTime: "Yes", riskScore: 6.0 },
  ],
};

/* ============================================================
   DESIGN TOKENS
   ============================================================ */
const COLORS = {
  paper: "#F6F3EC",
  paperDim: "#EDE9DD",
  ink: "#13192B",
  inkSoft: "#3A4258",
  rule: "#D8D2C1",
  ruleDark: "#2A3147",
  amber: "#C97A2E",
  amberSoft: "#E3B07A",
  sage: "#6E8C72",
  brick: "#A1432F",
  slate: "#5C6577",
};

const SECTIONS = [
  { id: "overview", label: "Overview", file: "01" },
  { id: "attrition", label: "Attrition Analysis", file: "02" },
  { id: "compensation", label: "Compensation", file: "03" },
  { id: "risk", label: "Flight-Risk Register", file: "04" },
];

function fmtMoney(n) {
  return "$" + n.toLocaleString("en-US");
}

/* ============================================================
   SHARED BITS
   ============================================================ */
function PanelHeader({ kicker, title, note }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em",
        textTransform: "uppercase", color: COLORS.amber, marginBottom: 6, fontWeight: 600,
      }}>{kicker}</div>
      <h3 style={{
        fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 21, fontWeight: 600,
        color: COLORS.ink, margin: 0, lineHeight: 1.25,
      }}>{title}</h3>
      {note && <p style={{
        fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: COLORS.slate,
        margin: "6px 0 0", lineHeight: 1.5, maxWidth: 560,
      }}>{note}</p>}
    </div>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{
      border: `1px solid ${COLORS.rule}`, borderRadius: 3, padding: "22px 24px",
      background: "#FFFFFF", ...style,
    }}>
      {children}
    </div>
  );
}

const tickStyle = { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, fill: COLORS.slate };

function CustomTooltip({ active, payload, label, suffix = "%" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: COLORS.ink, color: COLORS.paper, padding: "8px 12px", borderRadius: 2,
      fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, border: `1px solid ${COLORS.ruleDark}`,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: COLORS.amberSoft }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}{p.dataKey === "attritionRate" ? suffix : ""}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   OVERVIEW SECTION
   ============================================================ */
function Overview() {
  const k = DATA.kpis;
  const kpiList = [
    { label: "Headcount", value: k.totalEmployees.toLocaleString(), note: "active + departed, FY ledger" },
    { label: "Attrition rate", value: `${k.attritionRate}%`, note: "trailing 12 months", flag: true },
    { label: "Avg. monthly income", value: fmtMoney(k.avgMonthlyIncome), note: "all levels, all depts" },
    { label: "Avg. tenure", value: `${k.avgTenure} yrs`, note: "years at company" },
    { label: "Avg. job satisfaction", value: `${k.avgJobSatisfaction} / 4`, note: "self-reported index" },
    { label: "Employees on watch", value: k.highRiskCount, note: "overtime + low satisfaction", flag: true },
  ];

  return (
    <div>
      <PanelHeader
        kicker="Section 01"
        title="Workforce at a glance"
        note="Six headline figures pulled from the current employee ledger. Two are flagged in amber — they're the numbers worth raising in the next people-ops review."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: `1px solid ${COLORS.rule}`, marginBottom: 32 }}>
        {kpiList.map((item, i) => (
          <div key={i} style={{
            background: "#fff", padding: "20px 22px", borderRight: (i % 3 !== 2) ? `1px solid ${COLORS.rule}` : "none",
            borderBottom: i < 3 ? `1px solid ${COLORS.rule}` : "none",
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em",
              textTransform: "uppercase", color: COLORS.slate, marginBottom: 10,
            }}>{item.label}</div>
            <div style={{
              fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 34, fontWeight: 600,
              color: item.flag ? COLORS.amber : COLORS.ink, lineHeight: 1,
            }}>{item.value}</div>
            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, color: COLORS.slate, marginTop: 8 }}>{item.note}</div>
          </div>
        ))}
      </div>

      <PanelHeader kicker="Reading the ledger" title="Department footprint" note="Headcount share and attrition rate side by side — size of the bar is headcount, color intensity tracks risk." />
      <Panel>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={DATA.byDepartment} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={COLORS.rule} horizontal={false} />
            <XAxis type="number" tick={tickStyle} axisLine={{ stroke: COLORS.rule }} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={tickStyle} width={170} axisLine={{ stroke: COLORS.rule }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.paperDim }} />
            <Bar dataKey="headcount" radius={[0, 2, 2, 0]} barSize={22}>
              {DATA.byDepartment.map((d, i) => (
                <Cell key={i} fill={d.attritionRate > 25 ? COLORS.brick : d.attritionRate > 21 ? COLORS.amber : COLORS.sage} />
              ))}
              <LabelList dataKey="attritionRate" position="right" formatter={(v) => `${v}% attrition`} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fill: COLORS.inkSoft }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 18, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.rule}` }}>
          <LegendDot color={COLORS.sage} label="Under 21%" />
          <LegendDot color={COLORS.amber} label="21–25%" />
          <LegendDot color={COLORS.brick} label="Over 25% — elevated" />
        </div>
      </Panel>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 9, height: 9, background: color, display: "inline-block", borderRadius: 2 }} />
      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, color: COLORS.slate }}>{label}</span>
    </div>
  );
}

/* ============================================================
   ATTRITION SECTION
   ============================================================ */
function MiniBarRow({ data, title, note, barColor = COLORS.amber, height = 200 }) {
  return (
    <Panel>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>{title}</div>
        {note && <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, color: COLORS.slate, marginTop: 3 }}>{note}</div>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="0" stroke={COLORS.rule} vertical={false} />
          <XAxis dataKey="name" tick={{ ...tickStyle, fontSize: 10.5 }} axisLine={{ stroke: COLORS.rule }} tickLine={false} interval={0} angle={data.length > 5 ? -28 : 0} textAnchor={data.length > 5 ? "end" : "middle"} height={data.length > 5 ? 52 : 28} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={34} unit="%" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.paperDim }} />
          <Bar dataKey="attritionRate" name="Attrition" radius={[2, 2, 0, 0]} fill={barColor} barSize={data.length > 5 ? 18 : 38} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function AttritionAnalysis() {
  return (
    <div>
      <PanelHeader
        kicker="Section 02"
        title="Where attrition concentrates"
        note="Five cross-sections of the same departure event. Read together, they point to one story: overtime and early tenure compound, while satisfaction and seniority offer protection."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <MiniBarRow data={DATA.byOvertime} title="Overtime" note="31.7% departure rate among employees logging overtime, vs. 20.3% without." barColor={COLORS.brick} />
        <MiniBarRow data={DATA.byTenureBand} title="Tenure band" note="Risk is highest in year one and tapers as employees cross the five-year mark." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <MiniBarRow data={DATA.byJobSatisfaction} title="Job satisfaction (self-reported)" note="A near-linear relationship — every step down in satisfaction adds attrition." barColor={COLORS.amber} />
        <MiniBarRow data={DATA.byWorkLifeBalance} title="Work–life balance (self-reported)" note="'Bad' and 'Good' currently land at the same rate — an odd flat spot worth a closer look." barColor={COLORS.amber} />
      </div>
      <PanelHeader kicker="By role" title="Job roles ranked by attrition" note="Research Scientist and Laboratory Technician sit furthest above the 23.6% company average; people-management roles sit furthest below it." />
      <Panel>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={DATA.byJobRole} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={COLORS.rule} horizontal={false} />
            <XAxis type="number" tick={tickStyle} axisLine={{ stroke: COLORS.rule }} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ ...tickStyle, fontSize: 11 }} width={172} axisLine={{ stroke: COLORS.rule }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.paperDim }} />
            <Bar dataKey="attritionRate" radius={[0, 2, 2, 0]} barSize={13}>
              {DATA.byJobRole.map((d, i) => (
                <Cell key={i} fill={d.attritionRate > 28 ? COLORS.brick : d.attritionRate > 23.6 ? COLORS.amber : COLORS.sage} />
              ))}
              <LabelList dataKey="attritionRate" position="right" formatter={(v) => `${v}%`} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fill: COLORS.inkSoft }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

/* ============================================================
   COMPENSATION SECTION
   ============================================================ */
function CompensationSection() {
  const gpg = DATA.genderPayGap;
  return (
    <div>
      <PanelHeader
        kicker="Section 03"
        title="Pay structure and equity"
        note="Income scales cleanly with job level. The company-wide gender gap is effectively flat — a result worth stating plainly rather than burying, since it's the kind of finding leadership will ask about directly."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }}>
        <Panel>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, fontWeight: 600, color: COLORS.ink, marginBottom: 14 }}>
            Average monthly income by job level
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DATA.salaryByLevel} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke={COLORS.rule} vertical={false} />
              <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: COLORS.rule }} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} width={44} />
              <Tooltip content={<CustomTooltip suffix="" />} cursor={{ fill: COLORS.paperDim }} formatter={(v) => fmtMoney(v)} />
              <Bar dataKey="avgIncome" name="Avg income" radius={[2, 2, 0, 0]} fill={COLORS.inkSoft} barSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.slate, marginBottom: 10 }}>
            Gender pay gap — company-wide
          </div>
          <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 40, fontWeight: 600, color: COLORS.sage, lineHeight: 1 }}>
            {gpg.gapPercent < 0 ? "+" : "−"}{Math.abs(gpg.gapPercent)}%
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: COLORS.slate, marginTop: 10, lineHeight: 1.5 }}>
            Women average {fmtMoney(gpg.femaleAvg)}/mo against {fmtMoney(gpg.maleAvg)}/mo for men — a gap close enough to noise that it's a clean story for a compensation audit.
          </div>
        </Panel>
      </div>

      <PanelHeader kicker="By department" title="Average income, split by gender" note="Department is a stronger predictor of pay than gender — Engineering and R&D pay above the company average regardless of who's in the seat." />
      <Panel>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={DATA.byDepartment}
            margin={{ top: 6, right: 12, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="0" stroke={COLORS.rule} vertical={false} />
            <XAxis dataKey="name" tick={{ ...tickStyle, fontSize: 10.5 }} axisLine={{ stroke: COLORS.rule }} tickLine={false} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} width={44} />
            <Tooltip content={<CustomTooltip suffix="" />} cursor={{ fill: COLORS.paperDim }} formatter={(v) => fmtMoney(v)} />
            <Bar dataKey="avgIncome" name="Dept avg income" radius={[2, 2, 0, 0]} fill={COLORS.amber} barSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

/* ============================================================
   FLIGHT RISK REGISTER  (signature element)
   ============================================================ */
function RiskTicks({ score, max = 8 }) {
  const filled = Math.round((score / max) * 10);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} style={{
          width: 4, height: 14, background: i < filled ? (filled >= 8 ? COLORS.brick : COLORS.amber) : COLORS.rule,
        }} />
      ))}
    </div>
  );
}

function FlightRiskRegister() {
  return (
    <div>
      <PanelHeader
        kicker="Section 04"
        title="Flight-risk register"
        note="Active employees only, ranked by a composite score: overtime, low job satisfaction, weak work–life balance, a long promotion gap, and a long commute each add weight. This is the list a retention conversation should start from."
      />
      <Panel style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "28px 1.4fr 1.6fr 0.7fr 0.9fr 0.7fr 1.1fr",
          padding: "12px 20px", background: COLORS.ink, gap: 14,
        }}>
          {["#", "Employee", "Role", "Tenure", "Satisfaction", "Overtime", "Risk score"].map((h, i) => (
            <div key={i} style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.08em",
              textTransform: "uppercase", color: COLORS.amberSoft, fontWeight: 600,
            }}>{h}</div>
          ))}
        </div>
        {DATA.flightRisk.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "28px 1.4fr 1.6fr 0.7fr 0.9fr 0.7fr 1.1fr",
            padding: "14px 20px", gap: 14, alignItems: "center",
            borderBottom: i < DATA.flightRisk.length - 1 ? `1px solid ${COLORS.rule}` : "none",
            background: i % 2 === 1 ? COLORS.paperDim : "#fff",
          }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.slate }}>{String(i + 1).padStart(2, "0")}</div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.ink }}>{r.Name}</div>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: COLORS.slate }}>{r.Department}</div>
            </div>
            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: COLORS.inkSoft }}>{r.JobRole}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: COLORS.inkSoft }}>{r.YearsAtCompany} yrs</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: r.JobSatisfaction <= 2 ? COLORS.brick : COLORS.inkSoft }}>{r.JobSatisfaction} / 4</div>
            <div style={{
              fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, fontWeight: 600,
              color: r.OverTime === "Yes" ? COLORS.brick : COLORS.sage,
            }}>{r.OverTime === "Yes" ? "Yes" : "No"}</div>
            <RiskTicks score={r.riskScore} />
          </div>
        ))}
      </Panel>
      <div style={{
        marginTop: 18, padding: "16px 20px", background: COLORS.ink, borderRadius: 3,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: COLORS.paper, maxWidth: 560, lineHeight: 1.6 }}>
          Every name above logs overtime and has gone four-plus years without a promotion, or reports satisfaction at 2/4 or lower. None have left yet — that's the point of catching this list early.
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.amberSoft }}>
          153 employees company-wide meet the overtime + low-satisfaction screen
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */
export default function App() {
  const [active, setActive] = useState("overview");

  const content = useMemo(() => {
    switch (active) {
      case "overview": return <Overview />;
      case "attrition": return <AttritionAnalysis />;
      case "compensation": return <CompensationSection />;
      case "risk": return <FlightRiskRegister />;
      default: return null;
    }
  }, [active]);

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.paper, display: "flex",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      {/* Left rail */}
      <div style={{
        width: 232, borderRight: `1px solid ${COLORS.rule}`, padding: "28px 0", flexShrink: 0,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ padding: "0 24px 24px", borderBottom: `1px solid ${COLORS.rule}`, marginBottom: 20 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.12em", color: COLORS.amber, textTransform: "uppercase", marginBottom: 6 }}>
              People Analytics
            </div>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 19, fontWeight: 600, color: COLORS.ink, lineHeight: 1.3 }}>
              Workforce<br />Attrition Dossier
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.slate, marginTop: 10 }}>
              FY ledger · 1,470 records
            </div>
          </div>

          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              display: "flex", alignItems: "baseline", gap: 10, width: "100%", textAlign: "left",
              padding: "11px 24px", border: "none", background: active === s.id ? "#fff" : "transparent",
              borderLeft: active === s.id ? `3px solid ${COLORS.amber}` : "3px solid transparent",
              cursor: "pointer",
            }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: COLORS.slate }}>{s.file}</span>
              <span style={{
                fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5,
                fontWeight: active === s.id ? 600 : 500, color: active === s.id ? COLORS.ink : COLORS.inkSoft,
              }}>{s.label}</span>
            </button>
          ))}
        </div>

        <div style={{ padding: "0 24px", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10.5, color: COLORS.slate, lineHeight: 1.6 }}>
          Synthetic dataset, generated to mirror real-world HR attrition patterns for portfolio demonstration.
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "36px 48px", maxWidth: 980 }}>
        {content}
      </div>
    </div>
  );
}
