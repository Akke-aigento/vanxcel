import { useMemo } from "react";

interface Props {
  phase: number;
  batteryLocation?: string; // "under_passenger_seat" | "garage_rear" | etc
  solarWp?: number;
  inverterW?: number;
  batteryAh?: number;
}

/* ── Shared SVG style constants ── */
const S = {
  stroke: "currentColor",
  strokeThin: 1,
  strokeMed: 1.5,
  labelFill: "hsl(var(--muted-foreground))",
  labelSize: 11,
  green: "#22c55e",
  teal: "#008593",
  red: "#ef4444",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  grey: "#6b7280",
  darkGrey: "#374151",
};

/* ── Phase 0: Preparation — workbench top-down ── */
const Phase0 = () => (
  <svg viewBox="0 0 680 300" className="w-full h-auto max-w-[680px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Workbench */}
    <rect x={20} y={20} width={640} height={260} rx={8} stroke={S.stroke} strokeWidth={S.strokeThin} strokeDasharray="4 3" opacity={0.3} />
    <text x={340} y={15} textAnchor="middle" fontSize={10} fill={S.labelFill}>Werkbank / tafel</text>

    {/* Battery */}
    <rect x={50} y={60} width={80} height={50} rx={4} stroke={S.green} strokeWidth={S.strokeMed} fill={S.green + "1a"} />
    <text x={90} y={82} textAnchor="middle" fontSize={10} fill={S.green} fontWeight="600">Batterij</text>
    <text x={68} y={100} fontSize={9} fill={S.labelFill}>+</text>
    <text x={108} y={100} fontSize={9} fill={S.labelFill}>–</text>

    {/* VanXcel Converter */}
    <rect x={170} y={50} width={120} height={70} rx={6} stroke={S.teal} strokeWidth={2} fill={S.teal + "1a"} />
    <text x={230} y={78} textAnchor="middle" fontSize={11} fill={S.teal} fontWeight="700">VanXcel</text>
    <text x={230} y={95} textAnchor="middle" fontSize={9} fill={S.teal}>5-in-1 Converter</text>

    {/* Cables coiled */}
    <ellipse cx={370} cy={85} rx={30} ry={25} stroke={S.red} strokeWidth={S.strokeMed} fill={S.red + "0d"} />
    <text x={370} y={89} textAnchor="middle" fontSize={9} fill={S.red}>Kabels</text>

    {/* Multimeter */}
    <rect x={440} y={55} width={45} height={65} rx={4} stroke={S.stroke} strokeWidth={S.strokeThin} fill="none" />
    <rect x={452} y={62} width={22} height={16} rx={2} stroke={S.stroke} strokeWidth={0.8} />
    <text x={463} y={74} textAnchor="middle" fontSize={7} fill={S.labelFill}>12.8V</text>
    <circle cx={463} cy={100} r={6} stroke={S.stroke} strokeWidth={0.8} />
    <text x={463} y={130} textAnchor="middle" fontSize={9} fill={S.labelFill}>Multimeter</text>

    {/* Crimp tool */}
    <line x1={520} y1={60} x2={560} y2={110} stroke={S.stroke} strokeWidth={S.strokeMed} strokeLinecap="round" />
    <line x1={560} y1={60} x2={520} y2={110} stroke={S.stroke} strokeWidth={S.strokeMed} strokeLinecap="round" />
    <text x={540} y={130} textAnchor="middle" fontSize={9} fill={S.labelFill}>Krimptang</text>

    {/* Drill */}
    <rect x={600} y={60} width={40} height={30} rx={3} stroke={S.stroke} strokeWidth={S.strokeThin} />
    <line x1={620} y1={60} x2={620} y2={45} stroke={S.stroke} strokeWidth={2} strokeLinecap="round" />
    <text x={620} y={105} textAnchor="middle" fontSize={9} fill={S.labelFill}>Boormachine</text>

    {/* Checklist */}
    <rect x={50} y={160} width={100} height={90} rx={4} stroke={S.stroke} strokeWidth={S.strokeThin} opacity={0.5} />
    <text x={100} y={180} textAnchor="middle" fontSize={10} fill={S.labelFill} fontWeight="600">✓ Checklist</text>
    {["Kabels", "Zekeringen", "Gereedschap", "Handleiding"].map((item, i) => (
      <text key={i} x={65} y={198 + i * 14} fontSize={8} fill={S.labelFill}>☐ {item}</text>
    ))}

    {/* Screwdriver set */}
    <g transform="translate(200, 165)">
      {[0, 12, 24, 36, 48].map((dx, i) => (
        <rect key={i} x={dx} y={0} width={8} height={50} rx={2} stroke={S.stroke} strokeWidth={0.8} fill="none" />
      ))}
      <text x={24} y={65} textAnchor="middle" fontSize={9} fill={S.labelFill}>Schroevendraaiers</text>
    </g>

    {/* Heat shrink */}
    <g transform="translate(320, 170)">
      {[0, 18, 36].map((dx, i) => (
        <rect key={i} x={dx} y={0} width={12} height={30} rx={6} stroke={S.stroke} strokeWidth={0.8} fill={S.red + "1a"} />
      ))}
      <text x={24} y={45} textAnchor="middle" fontSize={9} fill={S.labelFill}>Krimpkous</text>
    </g>

    {/* Cable ties */}
    <g transform="translate(430, 170)">
      <rect x={0} y={0} width={60} height={35} rx={3} stroke={S.stroke} strokeWidth={0.8} fill="none" />
      <line x1={10} y1={10} x2={50} y2={10} stroke={S.stroke} strokeWidth={0.5} />
      <line x1={10} y1={18} x2={50} y2={18} stroke={S.stroke} strokeWidth={0.5} />
      <line x1={10} y1={26} x2={50} y2={26} stroke={S.stroke} strokeWidth={0.5} />
      <text x={30} y={48} textAnchor="middle" fontSize={9} fill={S.labelFill}>Kabelbinders</text>
    </g>
  </svg>
);

/* ── Phase 1: Battery mounting ── */
const Phase1UnderSeat = ({ batteryAh }: { batteryAh?: number }) => (
  <svg viewBox="0 0 680 340" className="w-full h-auto max-w-[680px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Seat side view */}
    <rect x={180} y={40} width={200} height={20} rx={4} stroke={S.stroke} strokeWidth={S.strokeMed} />
    <text x={280} y={55} textAnchor="middle" fontSize={10} fill={S.labelFill}>Passagiersstoel</text>

    {/* Seat back */}
    <rect x={350} y={40} width={20} height={100} rx={4} stroke={S.stroke} strokeWidth={S.strokeMed} />

    {/* Seat base / pedestal */}
    <rect x={200} y={60} width={150} height={80} rx={2} stroke={S.stroke} strokeWidth={S.strokeThin} strokeDasharray="4 3" />

    {/* Arrow up — lifting seat */}
    <line x1={280} y1={35} x2={280} y2={10} stroke={S.teal} strokeWidth={2} markerEnd="url(#arrowUp)" />
    <defs>
      <marker id="arrowUp" markerWidth="8" markerHeight="6" refX="4" refY="6" orient="auto">
        <path d="M0,6 L4,0 L8,6" fill={S.teal} />
      </marker>
    </defs>
    <text x={310} y={15} fontSize={9} fill={S.teal}>Stoel optillen</text>

    {/* 4 bolts */}
    {[{x: 210, y: 65}, {x: 340, y: 65}, {x: 210, y: 130}, {x: 340, y: 130}].map((b, i) => (
      <g key={i}>
        <circle cx={b.x} cy={b.y} r={4} fill="none" stroke={S.stroke} strokeWidth={1} />
        <circle cx={b.x} cy={b.y} r={1.5} fill={S.stroke} />
      </g>
    ))}
    <text x={360} y={70} fontSize={8} fill={S.labelFill}>Torx T45</text>

    {/* Battery underneath */}
    <rect x={215} y={170} width={120} height={60} rx={6} stroke={S.green} strokeWidth={2} fill={S.green + "1a"} />
    <text x={275} y={195} textAnchor="middle" fontSize={12} fill={S.green} fontWeight="700">{batteryAh ?? 100}Ah LiFePO4</text>
    <text x={230} y={220} fontSize={9} fill={S.labelFill}>+</text>
    <text x={320} y={220} fontSize={9} fill={S.labelFill}>–</text>

    {/* Mounting plate */}
    <rect x={205} y={235} width={140} height={8} rx={2} stroke={S.grey} strokeWidth={1} fill={S.grey + "1a"} />
    <text x={275} y={258} textAnchor="middle" fontSize={9} fill={S.labelFill}>Montageplaat</text>

    {/* ANL fuse + disconnect */}
    <rect x={370} y={180} width={35} height={20} rx={3} stroke={S.red} strokeWidth={S.strokeMed} fill={S.red + "1a"} />
    <text x={387} y={195} textAnchor="middle" fontSize={8} fill={S.red}>ANL</text>

    <circle cx={430} cy={190} r={12} stroke={S.red} strokeWidth={S.strokeMed} fill={S.red + "0d"} />
    <text x={430} y={194} textAnchor="middle" fontSize={8} fill={S.red}>⊘</text>
    <text x={430} y={215} textAnchor="middle" fontSize={8} fill={S.labelFill}>Schakelaar</text>

    {/* Airbag warning */}
    <g transform="translate(80, 100)">
      <polygon points="20,0 40,35 0,35" fill={S.orange + "33"} stroke={S.orange} strokeWidth={1.5} />
      <text x={20} y={28} textAnchor="middle" fontSize={14} fill={S.orange}>!</text>
      <text x={20} y={50} textAnchor="middle" fontSize={9} fill={S.orange} fontWeight="600">Airbag</text>
      <text x={20} y={62} textAnchor="middle" fontSize={8} fill={S.labelFill}>Connector</text>
      <text x={20} y={74} textAnchor="middle" fontSize={8} fill={S.labelFill}>LOSKOPPELEN</text>
    </g>
  </svg>
);

const Phase1Rear = ({ batteryAh }: { batteryAh?: number }) => (
  <svg viewBox="0 0 680 320" className="w-full h-auto max-w-[680px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bus rear cross-section */}
    <rect x={140} y={30} width={400} height={230} rx={12} stroke={S.stroke} strokeWidth={S.strokeMed} />
    <text x={340} y={25} textAnchor="middle" fontSize={10} fill={S.labelFill}>Dwarsdoorsnede achterkant</text>

    {/* Floor */}
    <line x1={150} y1={250} x2={530} y2={250} stroke={S.stroke} strokeWidth={2} />

    {/* Battery on floor */}
    <rect x={270} y={190} width={120} height={55} rx={6} stroke={S.green} strokeWidth={2} fill={S.green + "1a"} />
    <text x={330} y={215} textAnchor="middle" fontSize={12} fill={S.green} fontWeight="700">{batteryAh ?? 100}Ah</text>
    <text x={330} y={235} textAnchor="middle" fontSize={9} fill={S.green}>LiFePO4</text>

    {/* Mounting plate */}
    <rect x={260} y={248} width={140} height={6} rx={2} stroke={S.grey} strokeWidth={1} fill={S.grey + "1a"} />

    {/* Mounting bolts */}
    {[275, 310, 350, 385].map((bx, i) => (
      <g key={i}>
        <line x1={bx} y1={248} x2={bx} y2={265} stroke={S.stroke} strokeWidth={1} />
        <circle cx={bx} cy={267} r={3} fill="none" stroke={S.stroke} strokeWidth={1} />
      </g>
    ))}

    {/* Arrow to chassis */}
    <text x={330} y={285} textAnchor="middle" fontSize={10} fill={S.orange} fontWeight="600">↓ Stevig bevestigen!</text>

    {/* Wall brackets */}
    {[255, 395].map((wx, i) => (
      <g key={i}>
        <line x1={wx} y1={200} x2={wx < 300 ? wx - 20 : wx + 20} y2={140} stroke={S.grey} strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={wx < 300 ? wx - 30 : wx + 30} y={135} textAnchor="middle" fontSize={8} fill={S.labelFill}>L-bracket</text>
      </g>
    ))}
  </svg>
);

/* ── Phase 2: Fuse box ── */
const Phase2 = () => {
  const circuits = [
    { label: "LED", a: "5A", color: "#fbbf24" },
    { label: "Koelkast", a: "10A", color: "#60a5fa" },
    { label: "USB", a: "5A", color: "#a78bfa" },
    { label: "Pomp", a: "10A", color: "#34d399" },
    { label: "Ventilator", a: "5A", color: "#f472b6" },
    { label: "Heater", a: "15A", color: "#fb923c" },
    { label: "Reserve", a: "—", color: S.grey },
    { label: "Reserve", a: "—", color: S.grey },
    { label: "Reserve", a: "—", color: S.grey },
    { label: "Reserve", a: "—", color: S.grey },
    { label: "Reserve", a: "—", color: S.grey },
    { label: "Reserve", a: "—", color: S.grey },
  ];

  return (
    <svg viewBox="0 0 680 320" className="w-full h-auto max-w-[680px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x={340} y={20} textAnchor="middle" fontSize={12} fill={S.labelFill} fontWeight="600">Zekeringkast — vooraanzicht</text>

      {/* Fuse box housing */}
      <rect x={120} y={35} width={340} height={200} rx={6} stroke={S.stroke} strokeWidth={S.strokeMed} />

      {/* Fuse slots (4x3 grid) */}
      {circuits.map((c, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const fx = 140 + col * 80;
        const fy = 55 + row * 60;
        return (
          <g key={i}>
            <rect x={fx} y={fy} width={55} height={35} rx={3} stroke={c.color} strokeWidth={1.5} fill={c.color + "1a"} />
            <text x={fx + 27} y={fy + 18} textAnchor="middle" fontSize={9} fill={c.color} fontWeight="600">{c.label}</text>
            <text x={fx + 27} y={fy + 30} textAnchor="middle" fontSize={8} fill={S.labelFill}>{c.a}</text>
          </g>
        );
      })}

      {/* Input cable */}
      <line x1={120} y1={135} x2={80} y2={135} stroke={S.red} strokeWidth={2} />
      <text x={70} y={130} textAnchor="end" fontSize={9} fill={S.red}>+ IN (van batterij)</text>

      {/* Negative busbar */}
      <rect x={500} y={70} width={16} height={140} rx={3} stroke={S.darkGrey} strokeWidth={2} fill={S.darkGrey + "33"} />
      <text x={540} y={100} fontSize={10} fill={S.darkGrey} fontWeight="600">Negatieve</text>
      <text x={540} y={115} fontSize={10} fill={S.darkGrey} fontWeight="600">Busbar</text>

      {/* Connection points on busbar */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={508} cy={85 + i * 22} r={3} fill={S.darkGrey} stroke={S.stroke} strokeWidth={0.5} />
      ))}

      <text x={508} y={230} textAnchor="middle" fontSize={8} fill={S.labelFill}>– (naar chassis)</text>
    </svg>
  );
};

/* ── Phase 3: Cable routing — bus side view ── */
const Phase3 = () => (
  <svg viewBox="0 0 680 300" className="w-full h-auto max-w-[680px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bus side profile */}
    <path
      d="M 40 200 L 40 80 Q 40 50 70 50 L 150 40 Q 160 30 180 30 L 600 30 Q 640 30 640 60 L 640 200 Z"
      stroke={S.stroke} strokeWidth={S.strokeMed} fill="none"
    />
    {/* Windshield */}
    <line x1={150} y1={40} x2={170} y2={80} stroke={S.stroke} strokeWidth={S.strokeThin} />

    {/* Cabin divider */}
    <line x1={200} y1={35} x2={200} y2={200} stroke={S.stroke} strokeWidth={1} strokeDasharray="6 4" />
    <text x={120} y={110} textAnchor="middle" fontSize={9} fill={S.labelFill}>Cabine</text>
    <text x={420} y={110} textAnchor="middle" fontSize={9} fill={S.labelFill}>Laadruimte</text>

    {/* Floor */}
    <line x1={40} y1={200} x2={640} y2={200} stroke={S.stroke} strokeWidth={2} />

    {/* Wheels */}
    <circle cx={110} cy={200} r={25} fill="none" stroke={S.stroke} strokeWidth={1.5} />
    <circle cx={570} cy={200} r={25} fill="none" stroke={S.stroke} strokeWidth={1.5} />

    {/* Roof line for solar */}
    <line x1={250} y1={30} x2={600} y2={30} stroke={S.yellow} strokeWidth={3} strokeDasharray="6 3" />
    <text x={425} y={22} textAnchor="middle" fontSize={9} fill={S.yellow}>Zonnepaneel (op dak)</text>

    {/* Cable route 1: Starter → Leisure (along floor) */}
    <path
      d="M 80 175 C 130 175, 180 185, 200 185 L 500 185"
      stroke={S.red} strokeWidth={2} strokeDasharray="8 4" fill="none"
    />
    <text x={350} y={180} textAnchor="middle" fontSize={8} fill={S.red}>Starter → Converter (16mm²)</text>

    {/* Cable route 2: Roof → Interior (solar) */}
    <path
      d="M 400 30 L 400 50 C 400 80 420 100 420 150"
      stroke={S.yellow} strokeWidth={1.5} strokeDasharray="6 3" fill="none"
    />

    {/* Doorvoer punt - dak */}
    <circle cx={400} cy={30} r={5} fill={S.orange + "33"} stroke={S.orange} strokeWidth={1.5} />
    <text x={418} y={52} fontSize={8} fill={S.orange}>Dakdoorvoer</text>

    {/* Doorvoer punt - scheidingswand */}
    <circle cx={200} cy={130} r={5} fill={S.orange + "33"} stroke={S.orange} strokeWidth={1.5} />
    <text x={215} y={125} fontSize={8} fill={S.orange}>Scheidingswand</text>

    {/* Warning triangles */}
    <g transform="translate(155, 155)">
      <polygon points="8,0 16,14 0,14" fill={S.orange + "44"} stroke={S.orange} strokeWidth={1} />
      <text x={8} y={12} textAnchor="middle" fontSize={8} fill={S.orange}>!</text>
    </g>
    <text x={170} y={182} fontSize={7} fill={S.orange}>Brandstofleiding</text>
  </svg>
);

/* ── Phase 4: VanXcel connections ── */
const Phase4 = () => (
  <svg viewBox="0 0 680 380" className="w-full h-auto max-w-[680px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Converter body */}
    <rect x={200} y={80} width={280} height={180} rx={10} stroke={S.teal} strokeWidth={2.5} fill={S.teal + "0d"} />
    <text x={340} y={120} textAnchor="middle" fontSize={16} fill={S.teal} fontWeight="800">VanXcel 5-in-1</text>
    <text x={340} y={140} textAnchor="middle" fontSize={11} fill={S.teal}>Converter</text>

    {/* ① Remote display (top right) */}
    <line x1={480} y1={110} x2={570} y2={80} stroke={S.grey} strokeWidth={1} />
    <rect x={555} y={65} width={60} height={25} rx={3} stroke={S.grey} strokeWidth={1} fill={S.grey + "1a"} />
    <text x={585} y={82} textAnchor="middle" fontSize={8} fill={S.labelFill}>Remote</text>
    <circle cx={488} cy={107} r={10} fill={S.teal + "33"} stroke={S.teal} strokeWidth={1.5} />
    <text x={488} y={111} textAnchor="middle" fontSize={9} fill="hsl(0 0% 90%)" fontWeight="700">①</text>

    {/* ② Aarding (bottom left) */}
    <line x1={220} y1={260} x2={140} y2={310} stroke={S.green} strokeWidth={1.5} />
    <text x={130} y={330} textAnchor="middle" fontSize={9} fill={S.green}>⏚ Chassis</text>
    <circle cx={215} cy={262} r={10} fill={S.teal + "33"} stroke={S.teal} strokeWidth={1.5} />
    <text x={215} y={266} textAnchor="middle" fontSize={9} fill="hsl(0 0% 90%)" fontWeight="700">②</text>

    {/* ③ Anderson + ACC (left) */}
    <line x1={200} y1={150} x2={90} y2={130} stroke={S.red} strokeWidth={2} />
    <rect x={30} y={118} width={60} height={25} rx={3} stroke={S.red} strokeWidth={1} fill={S.red + "1a"} />
    <text x={60} y={135} textAnchor="middle" fontSize={8} fill={S.red}>Anderson</text>
    <text x={60} y={155} textAnchor="middle" fontSize={7} fill={S.labelFill}>→ Starterbatterij</text>
    <circle cx={198} cy={148} r={10} fill={S.teal + "33"} stroke={S.teal} strokeWidth={1.5} />
    <text x={198} y={152} textAnchor="middle" fontSize={9} fill="hsl(0 0% 90%)" fontWeight="700">③</text>
    {/* ACC thin line */}
    <line x1={200} y1={170} x2={90} y2={180} stroke={S.red} strokeWidth={0.8} strokeDasharray="3 2" />
    <text x={80} y={195} textAnchor="end" fontSize={7} fill={S.labelFill}>ACC trigger</text>

    {/* ④ MC4 solar (top) */}
    <line x1={300} y1={80} x2={280} y2={30} stroke={S.yellow} strokeWidth={1.5} />
    <rect x={250} y={10} width={60} height={22} rx={3} stroke={S.yellow} strokeWidth={1} fill={S.yellow + "1a"} />
    <text x={280} y={26} textAnchor="middle" fontSize={8} fill={S.yellow}>MC4 Solar</text>
    <circle cx={298} cy={80} r={10} fill={S.teal + "33"} stroke={S.teal} strokeWidth={1.5} />
    <text x={298} y={84} textAnchor="middle" fontSize={9} fill="hsl(0 0% 90%)" fontWeight="700">④</text>

    {/* ⑤ AC IN (left bottom) */}
    <line x1={200} y1={220} x2={90} y2={240} stroke={S.purple} strokeWidth={2} />
    <rect x={30} y={228} width={60} height={25} rx={3} stroke={S.purple} strokeWidth={1} fill={S.purple + "1a"} />
    <text x={60} y={245} textAnchor="middle" fontSize={8} fill={S.purple}>AC IN</text>
    <text x={60} y={265} textAnchor="middle" fontSize={7} fill={S.labelFill}>Walstroom 230V</text>
    <circle cx={198} cy={218} r={10} fill={S.teal + "33"} stroke={S.teal} strokeWidth={1.5} />
    <text x={198} y={222} textAnchor="middle" fontSize={9} fill="hsl(0 0% 90%)" fontWeight="700">⑤</text>

    {/* ⑥ Batterij (bottom, red + black THICK) */}
    <line x1={320} y1={260} x2={300} y2={340} stroke={S.red} strokeWidth={3} />
    <line x1={360} y1={260} x2={380} y2={340} stroke={S.darkGrey} strokeWidth={3} />
    <text x={290} y={360} textAnchor="middle" fontSize={9} fill={S.red}>+ (rood 16mm²)</text>
    <text x={400} y={360} textAnchor="middle" fontSize={9} fill={S.darkGrey}>– (zwart 16mm²)</text>
    <circle cx={340} cy={262} r={10} fill={S.teal + "33"} stroke={S.teal} strokeWidth={1.5} />
    <text x={340} y={266} textAnchor="middle" fontSize={9} fill="hsl(0 0% 90%)" fontWeight="700">⑥</text>
    <text x={340} y={375} textAnchor="middle" fontSize={9} fill={S.labelFill} fontWeight="600">LAATST aansluiten!</text>

    {/* AC OUT (right) */}
    <line x1={480} y1={200} x2={570} y2={220} stroke={S.purple} strokeWidth={1.5} strokeDasharray="6 3" />
    <rect x={555} y={208} width={70} height={25} rx={3} stroke={S.purple} strokeWidth={1} fill={S.purple + "0d"} />
    <text x={590} y={225} textAnchor="middle" fontSize={8} fill={S.purple}>AC OUT 230V</text>

    {/* USB output (right) */}
    <line x1={480} y1={160} x2={560} y2={155} stroke={S.grey} strokeWidth={1} />
    <text x={580} y={158} fontSize={8} fill={S.labelFill}>USB-A / USB-C</text>

    {/* Order legend */}
    <text x={340} y={15} textAnchor="middle" fontSize={10} fill={S.labelFill}>Aansluitvolgorde:</text>
    <text x={60} y={15} fontSize={8} fill={S.labelFill}>① Remote → ② Aarding → ③ Anderson → ④ Solar → ⑤ AC IN → ⑥ Batterij</text>
  </svg>
);

/* ── Phase 5: Testing ── */
const Phase5 = () => (
  <svg viewBox="0 0 680 300" className="w-full h-auto max-w-[680px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Multimeter */}
    <rect x={240} y={30} width={200} height={180} rx={12} stroke={S.stroke} strokeWidth={2} />
    <rect x={275} y={50} width={130} height={60} rx={4} stroke={S.stroke} strokeWidth={1.5} fill="hsl(0 0% 8%)" />
    <text x={340} y={90} textAnchor="middle" fontSize={28} fill={S.green} fontWeight="700" fontFamily="monospace">12.8V</text>
    {/* Dial */}
    <circle cx={340} cy={155} r={30} fill="none" stroke={S.stroke} strokeWidth={1.5} />
    <line x1={340} y1={155} x2={355} y2={135} stroke={S.red} strokeWidth={2} />
    <text x={340} y={200} textAnchor="middle" fontSize={9} fill={S.labelFill}>DC Voltage</text>

    {/* Probes */}
    <line x1={300} y1={210} x2={180} y2={270} stroke={S.red} strokeWidth={2.5} strokeLinecap="round" />
    <line x1={380} y1={210} x2={500} y2={270} stroke={S.darkGrey} strokeWidth={2.5} strokeLinecap="round" />

    {/* Probe tips */}
    <circle cx={180} cy={270} r={4} fill={S.red} />
    <circle cx={500} cy={270} r={4} fill={S.darkGrey} />

    {/* Busbar */}
    <rect x={130} y={275} width={100} height={15} rx={3} stroke={S.red} strokeWidth={1.5} fill={S.red + "1a"} />
    <text x={180} y={287} textAnchor="middle" fontSize={8} fill={S.red}>+ Busbar</text>

    <rect x={450} y={275} width={100} height={15} rx={3} stroke={S.darkGrey} strokeWidth={1.5} fill={S.darkGrey + "1a"} />
    <text x={500} y={287} textAnchor="middle" fontSize={8} fill={S.darkGrey}>– Busbar</text>

    {/* Result indicators */}
    <g transform="translate(30, 80)">
      <text x={0} y={0} fontSize={18} fill={S.green}>✓</text>
      <text x={25} y={0} fontSize={10} fill={S.green} fontWeight="600">12.8 – 13.6V = OK</text>
    </g>
    <g transform="translate(30, 110)">
      <text x={0} y={0} fontSize={18} fill={S.red}>✗</text>
      <text x={25} y={0} fontSize={10} fill={S.red} fontWeight="600">&lt; 12.0V = Probleem</text>
    </g>
    <g transform="translate(30, 140)">
      <text x={0} y={0} fontSize={18} fill={S.orange}>!</text>
      <text x={25} y={0} fontSize={10} fill={S.orange} fontWeight="600">OL = Open circuit</text>
    </g>
  </svg>
);

/* ── Phase 6: Finishing ── */
const Phase6 = () => (
  <svg viewBox="0 0 680 260" className="w-full h-auto max-w-[680px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Camera */}
    <g transform="translate(60, 40)">
      <rect x={0} y={10} width={80} height={55} rx={8} stroke={S.stroke} strokeWidth={S.strokeMed} />
      <circle cx={40} cy={38} r={16} stroke={S.stroke} strokeWidth={1.5} />
      <circle cx={40} cy={38} r={8} stroke={S.stroke} strokeWidth={1} />
      <rect x={25} y={4} width={30} height={10} rx={3} stroke={S.stroke} strokeWidth={1} />
      <text x={40} y={90} textAnchor="middle" fontSize={10} fill={S.teal} fontWeight="600">Maak foto's!</text>
      <text x={40} y={105} textAnchor="middle" fontSize={8} fill={S.labelFill}>Van alle aansluitingen</text>
    </g>

    {/* Document */}
    <g transform="translate(210, 40)">
      <rect x={0} y={0} width={70} height={85} rx={4} stroke={S.stroke} strokeWidth={S.strokeMed} />
      <line x1={10} y1={15} x2={60} y2={15} stroke={S.stroke} strokeWidth={0.8} />
      <line x1={10} y1={25} x2={50} y2={25} stroke={S.stroke} strokeWidth={0.8} />
      <line x1={10} y1={35} x2={55} y2={35} stroke={S.stroke} strokeWidth={0.8} />
      <line x1={10} y1={45} x2={40} y2={45} stroke={S.stroke} strokeWidth={0.8} />
      <rect x={15} y={52} width={40} height={25} rx={2} stroke={S.stroke} strokeWidth={0.6} />
      <text x={35} y={100} textAnchor="middle" fontSize={10} fill={S.teal} fontWeight="600">Bewaar schema</text>
      <text x={35} y={115} textAnchor="middle" fontSize={8} fill={S.labelFill}>Digitaal & geprint</text>
    </g>

    {/* Labeled fuse box */}
    <g transform="translate(370, 40)">
      <rect x={0} y={0} width={90} height={60} rx={4} stroke={S.stroke} strokeWidth={S.strokeMed} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={5 + i * 14} y={8} width={10} height={18} rx={2} stroke={S.stroke} strokeWidth={0.6} fill={S.yellow + "33"} />
      ))}
      {/* Label sticker */}
      <rect x={5} y={35} width={80} height={18} rx={2} fill={S.teal + "22"} stroke={S.teal} strokeWidth={0.8} />
      <text x={45} y={48} textAnchor="middle" fontSize={7} fill={S.teal}>LED|FRIGO|USB|PUMP|FAN|HTR</text>
      <text x={45} y={80} textAnchor="middle" fontSize={10} fill={S.teal} fontWeight="600">Label zekeringen</text>
    </g>

    {/* Toolbox */}
    <g transform="translate(530, 40)">
      <rect x={0} y={15} width={100} height={55} rx={6} stroke={S.stroke} strokeWidth={S.strokeMed} />
      <rect x={10} y={5} width={80} height={14} rx={4} stroke={S.stroke} strokeWidth={1} />
      <rect x={35} y={0} width={30} height={8} rx={3} stroke={S.stroke} strokeWidth={1} />
      <text x={50} y={90} textAnchor="middle" fontSize={10} fill={S.teal} fontWeight="600">Bewaar in je bus</text>
      <text x={50} y={105} textAnchor="middle" fontSize={8} fill={S.labelFill}>Reserve zekeringen &</text>
      <text x={50} y={117} textAnchor="middle" fontSize={8} fill={S.labelFill}>basis gereedschap</text>
    </g>

    {/* Bottom tip */}
    <rect x={100} y={170} width={480} height={60} rx={8} fill={S.teal + "0d"} stroke={S.teal} strokeWidth={1} />
    <text x={340} y={195} textAnchor="middle" fontSize={11} fill={S.teal} fontWeight="600">✓ Gefeliciteerd! Je installatie is compleet.</text>
    <text x={340} y={215} textAnchor="middle" fontSize={9} fill={S.labelFill}>Bewaar dit schema, je foto's en de handleiding op een veilige plek.</text>
  </svg>
);

/* ── Main PhaseIllustration component ── */
const PhaseIllustration = ({ phase, batteryLocation, solarWp, inverterW, batteryAh }: Props) => {
  const illustration = useMemo(() => {
    switch (phase) {
      case 0: return <Phase0 />;
      case 1:
        return batteryLocation?.includes("rear") || batteryLocation?.includes("garage")
          ? <Phase1Rear batteryAh={batteryAh} />
          : <Phase1UnderSeat batteryAh={batteryAh} />;
      case 2: return <Phase2 />;
      case 3: return <Phase3 />;
      case 4: return <Phase4 />;
      case 5: return <Phase5 />;
      case 6: return <Phase6 />;
      default: return null;
    }
  }, [phase, batteryLocation, batteryAh]);

  if (!illustration) return null;

  return (
    <div className="mb-4 rounded-lg border border-border/30 bg-card/30 p-3 overflow-x-auto">
      {illustration}
    </div>
  );
};

export default PhaseIllustration;
