import { useState, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

const B = "#993935";
const BDark = "#7a2c2a";
const BLight = "#f5eaea";
const Sand = "#F5F2EE";
const SandBorder = "#E2D9D0";
const Ink = "#2C2A28";
const Muted = "#8B8B8D";
const White = "#FFFFFF";
const Green = "#2E7D52";
const GreenLight = "#d4eddf";
const Amber = "#854F0B";
const AmberLight = "#faeeda";
const BrandAccent = "#EB5852";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Nunito:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{min-height:100%;background:#F5F2EE;font-family:'Plus Jakarta Sans',sans-serif;color:#2C2A28}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:#E2D9D0;border-radius:3px}
input,select,textarea,button{font-family:'Plus Jakarta Sans',sans-serif}
`;

const Label = ({ children }) => (
  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: Muted, display: "block", marginBottom: 5 }}>{children}</label>
);
const Input = ({ style, ...p }) => (
  <input style={{ height: 38, width: "100%", border: `1px solid ${SandBorder}`, borderRadius: 8, padding: "0 12px", fontSize: 14, color: Ink, background: White, outline: "none", transition: "border .15s", ...style }}
    onFocus={e => (e.target.style.borderColor = B)} onBlur={e => (e.target.style.borderColor = SandBorder)} {...p} />
);
const Sel = ({ style, children, ...p }) => (
  <select style={{ height: 38, width: "100%", border: `1px solid ${SandBorder}`, borderRadius: 8, padding: "0 12px", fontSize: 14, color: Ink, background: White, outline: "none", cursor: "pointer", ...style }} {...p}>{children}</select>
);
const Textarea = ({ style, ...p }) => (
  <textarea style={{ width: "100%", border: `1px solid ${SandBorder}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: Ink, background: White, outline: "none", resize: "vertical", minHeight: 72, lineHeight: 1.6, transition: "border .15s", ...style }}
    onFocus={e => (e.target.style.borderColor = B)} onBlur={e => (e.target.style.borderColor = SandBorder)} {...p} />
);
const SectionCard = ({ number, title, subtitle, children }) => (
  <div style={{ background: White, border: `1px solid ${SandBorder}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
    <div style={{ background: Sand, padding: "14px 20px", borderBottom: `1px solid ${SandBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: B }}>{number}</span>
      </div>
      <div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", color: Ink }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: Muted, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ padding: 20 }}>{children}</div>
  </div>
);
const Tag = ({ color, bg, children }) => (
  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 20, background: bg, color }}>{children}</span>
);

const EQUIP_GP = [
  { item: "¿El equipo está calibrado?", pond: 10 },
  { item: "¿La cuchilla está afilada?", pond: 1 },
  { item: "¿Las barras y el pin de la cuchilla están lubricados?", pond: 1 },
  { item: "¿La carcasa está en buen estado?", pond: 1 },
  { item: "¿El yoyo retorna con normalidad?", pond: 1 },
  { item: "¿El sitio de medición tiene exceso de humedad?", pond: 1 },
  { item: "¿El equipo se sujeta directamente del mango?", pond: 1 },
  { item: "¿Los accesorios (Contact Plate y Aiming Plate) están bien ajustados?", pond: 1 },
  { item: "¿Se evidencia que hay transmisión de información?", pond: 1 },
  { item: "¿Se está realizando limpieza del equipo al final de la faena?", pond: 1 },
  { item: "¿Se realiza limpieza en el transcurso de la faena?", pond: 1 },
];
const EQUIP_INTRO = [
  { item: "¿El equipo está calibrado?", pond: 10 },
  { item: "¿La luz interna funciona correctamente?", pond: 1 },
  { item: "¿El tambor gira libremente?", pond: 1 },
  { item: "¿El pin que asegura el tambor está bien ubicado?", pond: 1 },
  { item: "¿Se evidencia humedad o agua al interior del equipo?", pond: 1 },
  { item: "¿La línea negra de división en la ventana es visible?", pond: 1 },
  { item: "¿Se está utilizando la lanceta previa antes de la medición?", pond: 1 },
  { item: "¿El equipo está suspendido o sujetado al operario?", pond: 1 },
  { item: "¿Se están registrando los datos obtenidos?", pond: 1 },
  { item: "¿Se está realizando limpieza del equipo al final de la faena?", pond: 1 },
  { item: "¿Se realiza limpieza en el transcurso de la faena?", pond: 1 },
];
const EQUIP_TABLES = { GP4: EQUIP_GP, GP7: EQUIP_GP, Introscopio: EQUIP_INTRO };

const RECS_LIBRARY = [
  { id: "r1",  cat: "Técnica de punción",       text: "Ángulo de punción no perpendicular: el operario realiza la punción con desviación angular respecto al eje longitudinal de la canal." },
  { id: "r2",  cat: "Técnica de punción",       text: "Distancia desde línea media incorrecta: la separación entre la línea media de la canal y el punto de ingreso del equipo es incorrecta." },
  { id: "r3",  cat: "Técnica de punción",       text: "Medición en altura diferente a la punción de referencia: el equipo se inclina o desplaza respecto a la altura de la punción inicial." },
  { id: "r4",  cat: "Técnica de punción",       text: "Errores en identificación anatómica: el operario confunde la costilla verdadera con la costilla falsa." },
  { id: "r5",  cat: "Equipo de medición",       text: "Deficiencias en conservación del equipo: mal manejo, almacenamiento inadecuado o humedad interna detectada." },
  { id: "r6",  cat: "Equipo de medición",       text: "Limpieza deficiente del equipo: acumulación de grasa en pin u otros residuos en componentes críticos al finalizar la jornada." },
  { id: "r7",  cat: "Equipo de medición",       text: "Calibrador patrón ausente o en mal estado: no se dispone del calibrador patrón para la verificación de mediciones." },
  { id: "r8",  cat: "Equipo de medición",       text: "Fallas recurrentes o deterioro prematuro: el equipo presenta fallas frecuentes que afectan la continuidad del proceso." },
  { id: "r9",  cat: "Personal y capacitación",  text: "Falta de formación técnica específica: el operario asignado no cuenta con capacitación adecuada en el procedimiento o en el uso del equipo." },
  { id: "r10", cat: "Personal y capacitación",  text: "Alta rotación de personal: se evidencian cambios frecuentes del operario responsable, afectando la estandarización." },
  { id: "r11", cat: "Personal y capacitación",  text: "Sin operario suplente capacitado: no existe un plan de contingencia para cubrir ausencias del operario principal." },
  { id: "r12", cat: "Trazabilidad y control",   text: "Sin registro de responsable por jornada: no se lleva trazabilidad del operario que realiza la medición en cada turno." },
  { id: "r13", cat: "Trazabilidad y control",   text: "Omisión de mediciones: no se mide el 100% de las canales; se detectan unidades sin procesar durante la jornada." },
  { id: "r14", cat: "Trazabilidad y control",   text: "Pérdida de datos: se registran datos faltantes o fallos en el guardado de información de canales ya procesadas." },
  { id: "r15", cat: "Protocolo y señalización", text: "Deficiencias en el \"hablador\": la instrucción visual es incompleta o ausente, careciendo de la información necesaria para guiar al operario en el puesto de trabajo." },
];

const PHOTO_LABELS = [
  "Imagen 1. Identificación del punto anatómico del espacio intercostal.",
  "Imagen 2. Punzón de inclinación, punto anatómico mal identificado.",
];

const CANAL_COLORS = { B: Green, R: "#C9973E", M: B, I: "#888780" };
const CANAL_LABELS = { B: "Buena", R: "Regular", M: "Mala", I: "Insuficiente" };

function scoreSt(score, max) {
  const p = max > 0 ? (score / max) * 100 : 0;
  if (p >= 80) return { label: "Adecuado", color: Green, bg: GreenLight };
  if (p >= 50) return { label: "Regular", color: Amber, bg: AmberLight };
  return { label: "Deficiente", color: B, bg: BLight };
}

// scoreSt but without label text (just color signal)
function scoreColor(score, max) {
  const p = max > 0 ? (score / max) * 100 : 0;
  if (p >= 80) return { color: Green, bg: GreenLight };
  if (p >= 50) return { color: Amber, bg: AmberLight };
  return { color: B, bg: BLight };
}

// ── REPORT VIEW ────────────────────────────────────────────────────────────
// ── DEMO DATA ─────────────────────────────────────────────────────────────
const DEMO = {
  form: { planta: "", fecha: new Date().toISOString().split("T")[0], responsable: "", responsablePlanta: "", operario: "", equipo: "GP4", canalesTotal: "", canalesInclinadas: "", canalObs: "", observaciones: "" },
  canalCounts: { B: 0, R: 0, M: 0, I: 0 },
  equipScores: {},
  equipObs: "",
  eqScore: "",
  eqObs: "",
  selectedRecs: [],
  customRec: "",
  photos: [null, null],
};

// ── RADIAL GAUGE (SVG) ────────────────────────────────────────────────────
function RadialGauge({ pct, size = 140, color, label }) {
  const r = (size / 2) - 12;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x={size/2} y={size/2 - 6} textAnchor="middle" fill={color}
        style={{ fontFamily: "'Nunito',sans-serif", fontSize: size * 0.22, fontWeight: 700 }}>{pct}%</text>
      <text x={size/2} y={size/2 + 14} textAnchor="middle" fill={color}
        style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: size * 0.09, fontWeight: 600 }}>{label}</text>
    </svg>
  );
}

// ── KPI CARD ──────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color, bg, border }) {
  return (
    <div style={{ background: bg || White, border: `1.5px solid ${border || SandBorder}`, borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
        <span style={{ fontSize: 16, color: color || Muted }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: color || Muted }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 36, fontWeight: 700, color: color || Ink, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: color || Muted, marginTop: 2, opacity: 0.8 }}>{sub}</div>}
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────
function DashSec({ title, tag }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: `1.5px solid ${SandBorder}` }}>
      <div style={{ width: 4, height: 18, background: B, borderRadius: 2 }} />
      <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 700, color: Ink, letterSpacing: "0.03em" }}>{title}</span>
      {tag && <span style={{ background: BLight, color: B, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 20 }}>{tag}</span>}
    </div>
  );
}


function ReportView({ data, onBack }) {
  const totalCanalReal = Object.values(data.canalCounts).reduce((a, b) => a + b, 0);
  const hasRealData = !!(data.form.planta || totalCanalReal > 0 || data.eqScore !== "" || Object.keys(data.equipScores).length > 0);
  const merged = hasRealData ? data : { ...data, ...DEMO, form: { ...DEMO.form, ...Object.fromEntries(Object.entries(data.form).filter(([,v]) => v)) } };
  const { form, equipScores, equipObs, eqScore, eqObs, photos, selectedRecs, customRec, canalCounts, equipRows } = merged;

  const equipTotal = equipRows.reduce((acc, row, i) => {
    const ans = equipScores[i];
    if (ans === undefined) return acc;
    const isNeg = row.item.includes("exceso de humedad") || row.item.includes("humedad o agua");
    return acc + ((isNeg ? ans === "NO" : ans === "SI") ? row.pond : 0);
  }, 0);

  const allRecs = [...selectedRecs, ...(customRec ? [{ id: "custom", text: customRec }] : [])];
  const totalCanales = Object.values(canalCounts).reduce((a, b) => a + b, 0);
  const canalData = totalCanales > 0
    ? ["B","R","M","I"].filter(c => canalCounts[c] > 0).map(cat => ({
        cat, count: canalCounts[cat],
        pct: Math.round((canalCounts[cat] / totalCanales) * 100),
        color: CANAL_COLORS[cat], label: CANAL_LABELS[cat],
      }))
    : null;
  const eqNum = Number(eqScore);
  const bPct = canalData ? (canalData.find(d => d.cat === "B")?.pct || 0) : 0;
  const canalScore = bPct > 81 ? 60 : bPct >= 51 ? 45 : bPct >= 31 ? 30 : bPct > 0 ? 15 : 0;
  const totalScore = canalScore + (eqScore !== "" ? eqNum : 0) + equipTotal;
  const totalPct = Math.round((totalScore / 100) * 100);
  const overallSt = scoreSt(totalScore, 100);
  const mR = canalData?.find(x => x.cat === "M")?.count || 0;
  const iR = canalData?.find(x => x.cat === "I")?.count || 0;
  const desviaciones = mR + iR;
  const desvPct = totalCanales > 0 ? Math.round((desviaciones / totalCanales) * 100) : 0;

  const barData = [
    { name: "Inspección canales", obtenido: canalScore, maximo: 60 },
    { name: "Verif. ecuación", obtenido: eqScore !== "" ? eqNum : 0, maximo: 20 },
    { name: "Estado equipo", obtenido: equipTotal, maximo: 20 },
    { name: "Resultados", obtenido: totalScore, maximo: 100 },
  ];

  const infoFields = [
    ["Fecha de auditoría", form.fecha || "—"],
    ["Planta", form.planta || "—"],
    ["Metodología", form.equipo || "—"],
    ["Canales evaluadas", form.canalesTotal || (totalCanales > 0 ? String(totalCanales) : "—")],
    ["Auditor", form.responsable || "—"],
    ["Responsable planta", form.responsablePlanta || "—"],
    ["Operario", form.operario || "—"],
  ].filter(([, v]) => v && v !== "—");

  const handleExportHTML = () => {
    const el = document.getElementById("report-body");
    if (!el) return;
    const full = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Informe Auditoría Magro — Alura</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Nunito:wght@300;400;600;700;800&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans',sans-serif;background:#F5F2EE;color:#2C2A28;padding:24px}svg text{font-family:'Plus Jakarta Sans',sans-serif}</style></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `informe_auditoria_${(form.planta||"planta").replace(/\s+/g,"_")}_${form.fecha||"2026"}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  const iconSvgs = [
    <svg key="a" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
    <svg key="b" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    <svg key="c" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    <svg key="d" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  ];

  return (
    <div style={{ background: Sand, minHeight: "100vh" }}>
      {/* TOP BAR */}
      <div style={{ background: White, borderBottom: `1px solid ${SandBorder}`, padding: "11px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${SandBorder}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: Muted, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = B; e.currentTarget.style.color = B; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = SandBorder; e.currentTarget.style.color = Muted; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            Volver
          </button>
          <div style={{ width: 1, height: 22, background: SandBorder }} />
          <div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, color: Ink }}>Informe de auditoría — Magro en canales porcinas</div>
            <div style={{ fontSize: 11, color: Muted }}>Generado: {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: overallSt.bg, border: `1px solid ${overallSt.color}44`, borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: overallSt.color }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: overallSt.color }}>{totalPct}% · {totalScore}/100</span>
          </div>
          <button onClick={handleExportHTML}
            style={{ display: "flex", alignItems: "center", gap: 6, background: Ink, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: White, cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#444")} onMouseLeave={e => (e.currentTarget.style.background = Ink)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Descargar HTML
          </button>
          <button onClick={() => window.print()}
            style={{ display: "flex", alignItems: "center", gap: 6, background: B, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: White, cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = BDark)} onMouseLeave={e => (e.currentTarget.style.background = B)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div id="report-body" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* HERO */}
        <div style={{ background: B, borderRadius: 14, overflow: "hidden", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 200px" }}>
          <div style={{ padding: "28px 32px" }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>ALURA · Science for Life · Informe de auditoría</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 28, fontWeight: 700, color: White, lineHeight: 1.1, marginBottom: 20 }}>
              Informe de auditoría<br />magro en canales porcinas
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 24px" }}>
              {infoFields.map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: White }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Resultado general</div>
            <RadialGauge pct={totalPct} size={116} color={White} label="Cumplimiento" />
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 700, color: White }}>{totalScore} / 100 pts</div>
          </div>
        </div>

        {/* SECCIÓN: RESULTADOS */}
        <div style={{ background: White, border: `1px solid ${SandBorder}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <DashSec title="Resultados" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: Muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Gráfica 1. Resultado general de la auditoría</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 44, top: 4, bottom: 4 }}>
                    <XAxis type="number" domain={[0, 120]} tick={{ fontSize: 10, fill: Muted }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: Ink }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v, n) => [v, n === "obtenido" ? "Puntuación obtenida" : "Ponderación máxima"]} />
                    <Bar dataKey="maximo" fill="#E2D9D0" radius={[0,3,3,0]} barSize={11} name="maximo" />
                    <Bar dataKey="obtenido" fill={B} radius={[0,3,3,0]} barSize={11} name="obtenido">
                      <LabelList dataKey="obtenido" position="right" style={{ fontSize: 11, fontWeight: 700, fill: B }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                {[["Puntuación obtenida", B], ["Ponderación máxima", "#E2D9D0"]].map(([l, c]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: Muted }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />{l}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: Muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Gráfica 2. Clasificación de las mediciones</div>
              {canalData ? (
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <PieChart width={150} height={150}>
                    <Pie data={canalData} dataKey="count" cx={75} cy={75} outerRadius={68} innerRadius={30} paddingAngle={2}>
                      {canalData.map(d => <Cell key={d.cat} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => [`${v} (${p.payload.pct}%)`, p.payload.label]} />
                  </PieChart>
                  <div style={{ flex: 1 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead><tr style={{ borderBottom: `1px solid ${SandBorder}` }}>
                        <th style={{ padding: "4px 6px", textAlign: "left", fontSize: 10, color: Muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Clasificación</th>
                        <th style={{ padding: "4px 6px", textAlign: "right", fontSize: 10, color: Muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>%</th>
                      </tr></thead>
                      <tbody>
                        {[["B","Bueno"],["R","Regular"],["M","Malo"],["I","Insuficiente"]].map(([cat, lbl]) => {
                          const entry = canalData.find(x => x.cat === cat);
                          return (
                            <tr key={cat} style={{ borderBottom: `1px solid ${SandBorder}` }}>
                              <td style={{ padding: "6px 6px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: CANAL_COLORS[cat], display: "inline-block", flexShrink: 0 }} />
                                  <span style={{ color: Ink }}>{cat} - {lbl}</span>
                                </div>
                              </td>
                              <td style={{ padding: "6px 6px", textAlign: "right", fontWeight: 700, color: CANAL_COLORS[cat] }}>{entry ? `${entry.pct}%` : "0%"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "40px 0", textAlign: "center", color: Muted, fontSize: 12, fontStyle: "italic" }}>Sin datos de clasificación</div>
              )}
            </div>
          </div>
        </div>

        {/* A B C — 3 COLUMNAS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
          {/* A */}
          <div style={{ background: White, border: `1px solid ${SandBorder}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: BLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: Ink }}>A. Inspección de canales</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "7px 10px", background: scoreSt(canalScore,60).bg, borderRadius: 8, border: `1px solid ${scoreSt(canalScore,60).color}33` }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 700, color: scoreSt(canalScore,60).color, lineHeight: 1 }}>{canalScore}</div>
              <div style={{ fontSize: 10, color: scoreSt(canalScore,60).color, lineHeight: 1.4 }}>de 60 pts<br/><strong>{Math.round((canalScore/60)*100)}%</strong></div>
            </div>
            {form.canalObs && <p style={{ fontSize: 12, color: Ink, lineHeight: 1.7, marginBottom: 8 }}>{form.canalObs}</p>}
            {totalCanales > 0 && form.canalesInclinadas && <p style={{ fontSize: 12, color: Ink, lineHeight: 1.7 }}>
              {`Durante la inserción del equipo ${form.equipo}, se presentaron inclinaciones en ${form.canalesInclinadas} canales (${Math.round((Number(form.canalesInclinadas)/totalCanales)*100)}%), afectando la perpendicularidad y la precisión del procedimiento.`}
            </p>}
          </div>

          {/* B */}
          <div style={{ background: White, border: `1px solid ${SandBorder}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: BLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="13" y2="15"/></svg>
              </div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: Ink }}>B. Verificación de la ecuación</div>
            </div>
            {eqScore !== "" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "7px 10px", background: scoreSt(eqNum,20).bg, borderRadius: 8, border: `1px solid ${scoreSt(eqNum,20).color}33` }}>
                  <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 700, color: scoreSt(eqNum,20).color, lineHeight: 1 }}>{eqScore}</div>
                  <div style={{ fontSize: 10, color: scoreSt(eqNum,20).color, lineHeight: 1.4 }}>de 20 pts<br/><strong>{Math.round((eqNum/20)*100)}%</strong></div>
                </div>
                <p style={{ fontSize: 12, color: Ink, lineHeight: 1.7, marginBottom: 8 }}>
                  {eqNum >= 15 ? "Se verificaron los resultados de magro registrados en el sistema, constatando que la ecuación aplicada corresponde a la versión vigente establecida para el año 2023." : "Al verificar los resultados de magro, se identificó que la ecuación aplicada no corresponde a la versión vigente para el año 2023. Se evidenciaron desviaciones en su implementación."}
                </p>
                <p style={{ fontSize: 12, color: Ink, lineHeight: 1.7 }}>
                  {eqNum >= 15 ? "Esta se encuentra implementada de manera consistente, sin evidenciarse desviaciones en su aplicación." : "Esto genera inconsistencias en los datos reportados. Se recomienda actualización inmediata."}
                </p>
              </>
            ) : <div style={{ padding: "24px 0", textAlign: "center", color: Muted, fontSize: 12, fontStyle: "italic" }}>Sin puntuación registrada</div>}
          </div>

          {/* C */}
          <div style={{ background: White, border: `1px solid ${SandBorder}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: BLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: Ink }}>C. Verificación del estado físico del equipo</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "7px 10px", background: scoreSt(equipTotal,20).bg, borderRadius: 8, border: `1px solid ${scoreSt(equipTotal,20).color}33` }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 700, color: scoreSt(equipTotal,20).color, lineHeight: 1 }}>{equipTotal}</div>
              <div style={{ fontSize: 10, color: scoreSt(equipTotal,20).color, lineHeight: 1.4 }}>de 20 pts<br/><strong>{Math.round((equipTotal/20)*100)}%</strong></div>
            </div>
            {equipObs && <p style={{ fontSize: 12, color: Ink, lineHeight: 1.7 }}>{equipObs}</p>}
          </div>
        </div>

        {/* EVIDENCIA FOTOGRÁFICA (full width) */}
        <div style={{ background: White, border: `1px solid ${SandBorder}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${SandBorder}` }}>
            <div style={{ width: 4, height: 18, background: B, borderRadius: 2 }} />
            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 700, color: Ink }}>Evidencia fotográfica</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[0,1].map(i => {
              const p = photos[i];
              return (
                <div key={i}>
                  <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: `1px solid ${SandBorder}`, marginBottom: 8, height: 180, background: Sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p ? (
                      <>
                        <img src={p.url} alt={PHOTO_LABELS[i]} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", top: 8, right: 8, background: B, color: White, fontSize: 8, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.1em" }}>DESVIACIÓN</div>
                      </>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={SandBorder} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style={{ fontSize: 11, color: Muted }}>Sin foto adjunta</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: Ink, marginBottom: 3 }}>{i === 0 ? "Punción fuera del punto correcto." : "Desalineación del equipo."}</div>
                  <div style={{ fontSize: 11, color: Muted, lineHeight: 1.5, fontStyle: "italic" }}>{PHOTO_LABELS[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECOMENDACIONES + CONCLUSIONES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div style={{ background: White, border: `1px solid ${SandBorder}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${SandBorder}` }}>
              <div style={{ width: 4, height: 18, background: B, borderRadius: 2 }} />
              <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 700, color: Ink }}>Recomendaciones</span>
              {allRecs.length > 0 && <span style={{ background: BLight, color: B, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{allRecs.length}</span>}
            </div>
            {allRecs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allRecs.map((r, i) => {
                  const recTitle = r.text.split(":")[0];
                  const recBody = r.text.includes(":") ? r.text.split(":").slice(1).join(":").trim() : "";
                  return (
                    <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: B, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {iconSvgs[i % 4]}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: Ink, marginBottom: 2 }}>{recTitle}</div>
                        {recBody && <div style={{ fontSize: 12, color: Muted, lineHeight: 1.55 }}>{recBody}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div style={{ padding: "24px 0", textAlign: "center", color: Muted, fontSize: 12, fontStyle: "italic" }}>Sin recomendaciones seleccionadas</div>}
          </div>

          <div style={{ background: White, border: `1px solid ${SandBorder}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${SandBorder}` }}>
              <div style={{ width: 4, height: 18, background: B, borderRadius: 2 }} />
              <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 700, color: Ink }}>Conclusiones</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 12, color: Ink, lineHeight: 1.75 }}>
                {`El resultado de la auditoría evidencia un cumplimiento general del ${totalPct}%.`}
              </p>
              {desviaciones > 0 && <p style={{ fontSize: 12, color: Ink, lineHeight: 1.75 }}>
                {`Se identificaron desviaciones relacionadas con la técnica de medición, la alineación del equipo, acumulación de grasa en el punto de inserción (${desvPct}% de las canales clasificadas M o I), las cuales pueden afectar la precisión y consistencia de los datos entregados al cliente.`}
              </p>}
              <p style={{ fontSize: 12, color: Ink, lineHeight: 1.75 }}>
                {equipTotal >= 16
                  ? "Aunque el equipo se encuentra operativo y con mantenimiento vigente, se recomienda fortalecer la técnica operativa, estandarizar el proceso y asegurar condiciones óptimas del equipo para garantizar datos confiables."
                  : "Se recomienda revisión técnica del equipo, fortalecer el mantenimiento preventivo y la formación del operario responsable de la medición."}
              </p>
              <div style={{ marginTop: 4, padding: "10px 14px", background: overallSt.bg, borderRadius: 8, border: `1px solid ${overallSt.color}33`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 26, fontWeight: 700, color: overallSt.color, lineHeight: 1 }}>{totalScore}/100</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: overallSt.color }}>{totalPct}%</div>
                  <div style={{ fontSize: 11, color: overallSt.color, opacity: 0.75 }}>Puntaje final de la auditoría</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${SandBorder}` }}>
          <span style={{ fontSize: 11, color: Muted }}>Reporte auditoría medición de magro · Alura · 2026</span>
          <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: B }}>{totalPct}% · {totalScore}/100 pts</span>
        </div>
      </div>
    </div>
  );
}
export default function AccuremaxApp() {
  const [view, setView] = useState("form");
  const [form, setForm] = useState({
    planta: "", fecha: new Date().toISOString().split("T")[0],
    responsable: "", responsablePlanta: "", operario: "",
    equipo: "GP4", canalesTotal: "", canalesInclinadas: "", canalObs: "", observaciones: "",
  });
  const [canalCounts, setCanalCounts] = useState({ B: 0, R: 0, M: 0, I: 0 });
  const [equipScores, setEquipScores] = useState({});
  const [equipObs, setEquipObs] = useState("");
  const [eqScore, setEqScore] = useState("");
  const [eqObs, setEqObs] = useState("");
  const [photos, setPhotos] = useState([null, null]);
  const [recs, setRecs] = useState({});
  const [customRec, setCustomRec] = useState("");
  const [toast, setToast] = useState(null);

  const photoRef0 = useRef();
  const photoRef1 = useRef();
  const photoRefs = [photoRef0, photoRef1];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleRec = id => setRecs(r => ({ ...r, [id]: !r[id] }));
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handlePhoto = (idx, e) => { const f = e.target.files[0]; if (!f) return; setPhotos(p => { const n = [...p]; n[idx] = { name: f.name, url: URL.createObjectURL(f) }; return n; }); };
  const removePhoto = idx => setPhotos(p => { const n = [...p]; n[idx] = null; return n; });

  const equipRows = EQUIP_TABLES[form.equipo] || EQUIP_GP;
  const equipTotal = equipRows.reduce((acc, row, i) => {
    const ans = equipScores[i];
    if (ans === undefined) return acc;
    const isNeg = row.item.includes("exceso de humedad") || row.item.includes("humedad o agua");
    return acc + ((isNeg ? ans === "NO" : ans === "SI") ? row.pond : 0);
  }, 0);
  const equipAnswered = Object.keys(equipScores).length;
  const eqNum = Number(eqScore);
  const eqColor = eqNum >= 15 ? Green : eqNum >= 8 ? Amber : eqNum > 0 ? B : Muted;
  const selectedRecs = RECS_LIBRARY.filter(r => recs[r.id]);
  const recCats = [...new Set(RECS_LIBRARY.map(r => r.cat))];

  const handleExport = () => {
    const data = { visita: form, canalCounts, verificacionEquipo: { equipo: form.equipo, respuestas: equipScores, puntuacionTotal: equipTotal, observaciones: equipObs }, verificacionEcuacion: { puntuacion: eqScore, observaciones: eqObs }, evidenciaFotografica: photos.map((p, i) => ({ label: PHOTO_LABELS[i], archivo: p?.name || null })), recomendaciones: [...selectedRecs.map(r => r.text), ...(customRec ? [customRec] : [])], exportadoEn: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `auditoria_magro_${(form.planta || "planta").replace(/\s+/g, "_")}_${form.fecha}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast("Datos exportados correctamente");
  };

  const reportData = { form, equipScores, equipObs, eqScore, eqObs, photos, selectedRecs, customRec, canalCounts, equipRows, equipTotal };

  return (
    <>
      <style>{css}</style>
      {toast && (
        <div style={{ position: "fixed", top: 18, right: 18, zIndex: 9999, background: toast.type === "success" ? Green : toast.type === "info" ? Ink : B, color: White, padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, maxWidth: 300, lineHeight: 1.4, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER with tabs */}
      <div style={{ background: B, borderBottom: `3px solid ${BDark}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "stretch", justifyContent: "space-between" }}>
          <div style={{ padding: "14px 0" }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 26, fontWeight: 700, color: White, letterSpacing: 1, lineHeight: 1 }}>ALURA</div>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginTop: 2 }}>Science for Life</div>
          </div>
          <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
            {[{ id: "form", label: "Datos de la auditoría" }, { id: "report", label: "Informe" }].map(tab => (
              <button key={tab.id} onClick={() => tab.id === "report" ? setView("report") : setView("form")}
                style={{ padding: "0 22px", background: view === tab.id ? "rgba(255,255,255,0.15)" : "transparent", border: "none", borderBottom: view === tab.id ? "3px solid white" : "3px solid transparent", color: view === tab.id ? White : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all .15s", marginBottom: "-3px" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "report" ? (
        <ReportView data={reportData} onBack={() => setView("form")} />
      ) : (
        <div style={{ minHeight: "100vh", background: Sand }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 48px" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 700, color: Ink, lineHeight: 1.2 }}>Auditoría del proceso de medición de grasa dorsal en canales porcinas en planta de beneficio</div>
              <div style={{ fontSize: 13, color: Muted, marginTop: 6, fontStyle: "italic" }}>Registro de auditoría · Medición de magro</div>
            </div>

            {/* 01 DATOS */}
            <SectionCard number="01" title="Datos de la visita" subtitle="Información general de la auditoría">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Planta de beneficio</Label>
                  <Input placeholder="Ej. Frigorífico La Dorada, Planta Mosquera…" value={form.planta} onChange={e => set("planta", e.target.value)} />
                </div>
                <div>
                  <Label>Fecha de visita</Label>
                  <Input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} />
                </div>
                <div>
                  <Label>Responsable de auditoría</Label>
                  <Input placeholder="Nombre completo del evaluador" value={form.responsable} onChange={e => set("responsable", e.target.value)} />
                </div>
                <div>
                  <Label>Responsable de la planta</Label>
                  <Input placeholder="Nombre del jefe o responsable de planta" value={form.responsablePlanta} onChange={e => set("responsablePlanta", e.target.value)} />
                </div>
                <div>
                  <Label>Operario</Label>
                  <Input placeholder="Nombre del operario de medición" value={form.operario} onChange={e => set("operario", e.target.value)} />
                </div>
                <div>
                  <Label>Equipo utilizado</Label>
                  <Sel value={form.equipo} onChange={e => { set("equipo", e.target.value); setEquipScores({}); }}>
                    {Object.keys(EQUIP_TABLES).map(k => <option key={k}>{k}</option>)}
                  </Sel>
                </div>
                <div>
                  <Label>N.° canales auditadas</Label>
                  <Input type="number" placeholder="Ej. 240" min="1" value={form.canalesTotal} onChange={e => set("canalesTotal", e.target.value)} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Observaciones generales</Label>
                  <Textarea placeholder="Condiciones de la planta, clima, contexto de la visita…" value={form.observaciones} onChange={e => set("observaciones", e.target.value)} />
                </div>
              </div>
            </SectionCard>

            {/* 02 EXCEL + CANAL COUNTS */}
            <SectionCard number="02" title="Resultados de verificación de canal" subtitle="Ingresa el conteo de canales por clasificación">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {[["B", "Buena", GreenLight, Green], ["R", "Regular", AmberLight, Amber], ["M", "Mala", BLight, B], ["I", "Insuficiente", "#f1efe8", "#888780"]].map(([cat, label, bg, color]) => (
                  <div key={cat} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 10, padding: "14px 14px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, marginBottom: 8 }}>{cat} — {label}</div>
                    <Input type="number" min="0" value={canalCounts[cat] || ""} placeholder="0"
                      style={{ textAlign: "center", fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 700, color, background: White, height: 48, border: `1px solid ${color}44`, borderRadius: 8 }}
                      onChange={e => setCanalCounts(c => ({ ...c, [cat]: Number(e.target.value) || 0 }))} />
                    {canalCounts[cat] > 0 && (
                      <div style={{ fontSize: 11, color, marginTop: 6, fontWeight: 600 }}>
                        {Math.round((canalCounts[cat] / Math.max(1, Object.values(canalCounts).reduce((a,b)=>a+b,0))) * 100)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {Object.values(canalCounts).some(v => v > 0) && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: Sand, borderRadius: 8, border: `1px solid ${SandBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 12, color: Muted }}>Total canales:</div>
                  <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 700, color: Ink }}>{Object.values(canalCounts).reduce((a,b)=>a+b,0)}</div>
                  <div style={{ flex: 1, display: "flex", gap: 0, height: 6, borderRadius: 20, overflow: "hidden" }}>
                    {[["B",Green],["R","#C9973E"],["M",B],["I","#888780"]].map(([cat,color]) => {
                      const total = Object.values(canalCounts).reduce((a,b)=>a+b,0);
                      const pct = total > 0 ? (canalCounts[cat]||0)/total*100 : 0;
                      return pct > 0 ? <div key={cat} style={{ width: `${pct}%`, background: color, transition: "width .4s" }} /> : null;
                    })}
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard number="02b" title="Observaciones de inspección de canales" subtitle="Descripción narrativa que aparecerá en la tarjeta A del informe">
              <Textarea placeholder="Ej. Las categorías Malo e Insuficiente se asociaron con errores en la identificación del espacio intercostal…" value={form.canalObs} onChange={e => set("canalObs", e.target.value)} />
            </SectionCard>

            <SectionCard number="02c" title="Canales con inclinación" subtitle="Número de canales donde se presentó inclinación del equipo (aparece en tarjeta A)">
              <div style={{ maxWidth: 260 }}>
                <Label>Canales inclinadas (cantidad)</Label>
                <Input type="number" min="0" placeholder="Ej. 51" value={form.canalesInclinadas} onChange={e => set("canalesInclinadas", e.target.value)} />
              </div>
            </SectionCard>

            {/* 03 EQUIPO */}
            <SectionCard number="03" title="Verificación del equipo" subtitle={`${form.equipo} · ${equipAnswered} de ${equipRows.length} ítems · Puntuación: ${equipTotal} / 20`}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 6, background: SandBorder, borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ width: `${(equipTotal / 20) * 100}%`, height: "100%", background: equipTotal >= 16 ? Green : equipTotal >= 10 ? "#C9973E" : B, borderRadius: 20, transition: "width .4s ease" }} />
                </div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 18, fontWeight: 700, color: equipTotal >= 16 ? Green : equipTotal >= 10 ? "#C9973E" : B, minWidth: 52 }}>{equipTotal} / 20</div>
              </div>
              <div style={{ border: `1px solid ${SandBorder}`, borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ background: Sand }}>
                      <th style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: Muted, borderBottom: `1px solid ${SandBorder}`, width: "58%" }}>Ítem de verificación</th>
                      <th style={{ padding: "9px 10px", textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: Muted, borderBottom: `1px solid ${SandBorder}`, width: "14%" }}>Pond.</th>
                      <th style={{ padding: "9px 10px", textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: Muted, borderBottom: `1px solid ${SandBorder}`, width: "28%" }}>Calificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipRows.map((row, i) => {
                      const ans = equipScores[i];
                      const isNeg = row.item.includes("exceso de humedad") || row.item.includes("humedad o agua");
                      const isOk = ans !== undefined && (isNeg ? ans === "NO" : ans === "SI");
                      return (
                        <tr key={i} style={{ borderBottom: i < equipRows.length - 1 ? `1px solid ${SandBorder}` : "none", background: ans === undefined ? White : isOk ? GreenLight : BLight, transition: "background .2s" }}>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: Ink, lineHeight: 1.4 }}>{row.item}</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, color: Muted }}>{row.pond}</span>
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                              {["SI", "NO"].map(opt => {
                                const active = ans === opt;
                                const good = isNeg ? opt === "NO" : opt === "SI";
                                return (
                                  <button key={opt} onClick={() => setEquipScores(s => ({ ...s, [i]: opt }))}
                                    style={{ padding: "4px 11px", borderRadius: 20, border: `1.5px solid ${active ? (good ? Green : B) : SandBorder}`, background: active ? (good ? GreenLight : BLight) : White, color: active ? (good ? Green : B) : Muted, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", transition: "all .15s" }}>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 14 }}>
                <Label>Observaciones del equipo</Label>
                <Textarea placeholder="Estado del equipo, fallas observadas, fecha del último mantenimiento…" value={equipObs} onChange={e => setEquipObs(e.target.value)} />
              </div>
            </SectionCard>

            {/* 04 ECUACIÓN */}
            <SectionCard number="04" title="Verificación de la ecuación" subtitle="Puntuación cualitativa 0 – 20">
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>
                <div>
                  <Label>Puntuación (0 a 20)</Label>
                  <Sel value={eqScore} onChange={e => setEqScore(e.target.value)}>
                    <option value="">— Selecciona —</option>
                    {Array.from({ length: 21 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                  </Sel>
                  {eqScore !== "" && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: eqNum >= 15 ? GreenLight : eqNum >= 8 ? AmberLight : BLight, border: `1px solid ${eqNum >= 15 ? "#b8dcc8" : eqNum >= 8 ? "#e8d5a0" : "#e8c8c8"}` }}>
                      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 30, fontWeight: 700, color: eqColor, lineHeight: 1 }}>{eqScore}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: eqColor }}>{eqNum >= 15 ? "Ecuación correcta" : eqNum >= 8 ? "Revisión recomendada" : "Desviación identificada"}</div>
                        <div style={{ fontSize: 10, color: Muted, marginTop: 1 }}>sobre 20 puntos</div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Observaciones</Label>
                  <Textarea placeholder="¿Se está usando la ecuación vigente? ¿Hay inconsistencias en el cálculo?" value={eqObs} onChange={e => setEqObs(e.target.value)} style={{ minHeight: 90 }} />
                </div>
              </div>
            </SectionCard>

            {/* 05 FOTOS */}
            <SectionCard number="05" title="Evidencia fotográfica" subtitle={`${photos.filter(Boolean).length} de 2 fotos adjuntas`}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[0, 1].map(idx => (
                  <div key={idx}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: Ink, marginBottom: 8, lineHeight: 1.4 }}>{PHOTO_LABELS[idx]}</div>
                    {photos[idx] ? (
                      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${SandBorder}`, aspectRatio: "4/3" }}>
                        <img src={photos[idx].url} alt={PHOTO_LABELS[idx]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button onClick={() => removePhoto(idx)} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", color: White, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", padding: "14px 10px 8px", fontSize: 11, color: White, lineHeight: 1.3 }}>{photos[idx].name}</div>
                      </div>
                    ) : (
                      <div onClick={() => photoRefs[idx].current?.click()}
                        style={{ aspectRatio: "4/3", border: `2px dashed ${SandBorder}`, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: Sand, gap: 8 }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = B)} onMouseLeave={e => (e.currentTarget.style.borderColor = SandBorder)}>
                        <div style={{ width: 44, height: 44, background: BLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                        <span style={{ fontSize: 12, color: Muted }}>Haz clic para agregar foto</span>
                      </div>
                    )}
                    <input ref={photoRefs[idx]} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePhoto(idx, e)} />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* 06 RECOMENDACIONES */}
            <SectionCard number="06" title="Recomendaciones" subtitle={`Selecciona de 1 a 4 · ${selectedRecs.length} seleccionada(s)`}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: selectedRecs.length >= 4 ? BLight : Sand, border: `1px solid ${selectedRecs.length >= 4 ? "#e8c8c8" : SandBorder}` }}>
                <span style={{ fontSize: 12, color: selectedRecs.length >= 4 ? B : Muted, fontWeight: 500 }}>
                  {selectedRecs.length === 0 ? "Selecciona entre 1 y 4 recomendaciones." : selectedRecs.length >= 4 ? "Límite de 4 recomendaciones alcanzado." : `${selectedRecs.length} de 4 seleccionada(s).`}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: selectedRecs.length >= n ? B : SandBorder, transition: "background .2s" }} />)}
                </div>
              </div>
              {recCats.map(cat => (
                <div key={cat} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: Muted, marginBottom: 8, paddingBottom: 5, borderBottom: `1px solid ${SandBorder}` }}>{cat}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {RECS_LIBRARY.filter(r => r.cat === cat).map(r => {
                      const isSelected = !!recs[r.id];
                      const isDisabled = !isSelected && selectedRecs.length >= 4;
                      return (
                        <div key={r.id} onClick={() => !isDisabled && toggleRec(r.id)}
                          style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${isSelected ? B : SandBorder}`, background: isSelected ? BLight : White, cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.4 : 1, transition: "all .15s" }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isSelected ? B : SandBorder}`, background: isSelected ? B : White, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            {isSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1 4 4 7 9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <span style={{ fontSize: 13, color: isSelected ? B : Ink, fontWeight: isSelected ? 600 : 400, lineHeight: 1.5 }}>{r.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div>
                <Label>Recomendación personalizada</Label>
                <Textarea placeholder="Escribe una recomendación específica para esta planta…" value={customRec} onChange={e => setCustomRec(e.target.value)} style={{ minHeight: 60 }} />
              </div>
            </SectionCard>

            {/* 07 ACCIONES */}
            <div style={{ background: BDark, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ background: "#4a1718", padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: White }}>07</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, color: White }}>Acciones</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>Exportar · Guardar borrador · Generar informe</div>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <button onClick={handleExport}
                    style={{ padding: "20px 12px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.25)", color: White, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 13, fontWeight: 700 }}>Exportar datos</div><div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>JSON · todos los campos</div></div>
                  </button>
                  <button onClick={() => showToast("Borrador guardado", "info")}
                    style={{ padding: "20px 12px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.25)", color: White, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 13, fontWeight: 700 }}>Guardar borrador</div><div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>Continuar después</div></div>
                  </button>
                  <button onClick={() => setView("report")}
                    style={{ padding: "20px 12px", borderRadius: 10, background: White, border: `1.5px solid ${White}`, color: B, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f5e8e8")} onMouseLeave={e => (e.currentTarget.style.background = White)}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 13, fontWeight: 700 }}>Generar informe</div><div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Ver informe completo</div></div>
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Datos visita", ok: !!(form.planta && form.fecha && form.responsable) },
                    { label: `Conteo canales`, ok: Object.values(canalCounts).some(v => v > 0) },
                    { label: `Equipo (${equipAnswered}/${equipRows.length})`, ok: equipAnswered === equipRows.length },
                    { label: `Ecuación (${eqScore || "—"}/20)`, ok: eqScore !== "" },
                    { label: `Fotos (${photos.filter(Boolean).length}/2)`, ok: photos.filter(Boolean).length === 2 },
                    { label: `Recomendaciones (${selectedRecs.length})`, ok: selectedRecs.length > 0 },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: s.ok ? "rgba(46,125,82,0.25)" : "rgba(255,255,255,0.07)", border: `1px solid ${s.ok ? "rgba(46,125,82,0.5)" : "rgba(255,255,255,0.12)"}` }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.ok ? "#4caf7d" : "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: s.ok ? "#a8e6c4" : "rgba(255,255,255,0.45)" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 11, color: Muted, paddingTop: 4 }}>
              Reporte auditoría medición de magro · Alura · 2026
            </div>
          </div>
        </div>
      )}
    </>
  );
}
