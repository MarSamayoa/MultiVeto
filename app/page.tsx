"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Country = "Russia" | "China" | "United States";
type Filter = "all" | Country;
type YearFilter = "all" | "2022" | "2023" | "2024" | "2025";
type ViewMode = "main" | "alt" | null;

type AltTimeline = {
  title: string;
  desc: string;
  likelihood: string;
};

type Veto = {
  id: number;
  date: string;
  topic: string;
  vetoedBy: Country[];
  impactScore: number;
  category: string;
  whatHappened: string;
  altTimelines: [AltTimeline, AltTimeline];
  justification: string;
  draftSummary: string;
};

const VETOES: Veto[] = [
  {
    id: 1,
    date: "2022-05-26",
    topic: "DPRK sanctions",
    vetoedBy: ["Russia", "China"],
    impactScore: 3,
    category: "Non-Proliferation",
    whatHappened:
      "No new sanctions. North Korea continued ICBM testing at record pace. Existing framework remained without enhanced enforcement.",
    altTimelines: [
      {
        title: "Tighter net",
        desc: "Enhanced sanctions slow DPRK procurement by 6–12 months. Pyongyang adapts, but the delay matters for regional deterrence.",
        likelihood: "Low-Medium",
      },
      {
        title: "Symbolic consensus",
        desc: "Resolution passes but changes little. The real value: reaffirming the Council can still agree on non-proliferation.",
        likelihood: "High",
      },
    ],
    justification: "Russia: sanctions exhausted. China: dialogue over pressure.",
    draftSummary:
      "Strengthen DPRK sanctions after ICBM launches; condemn missile tests.",
  },
  {
    id: 2,
    date: "2022-07-08",
    topic: "Syria cross-border aid",
    vetoedBy: ["Russia"],
    impactScore: 7,
    category: "Humanitarian",
    whatHappened:
      "Aid disrupted for weeks. Compromise restored mechanism for 6 months instead of 12. Four million people lost planning certainty.",
    altTimelines: [
      {
        title: "Stable pipeline",
        desc: "12-month mandate lets agencies invest in health and education infrastructure in Idlib beyond survival mode.",
        likelihood: "High",
      },
      {
        title: "Leverage shift",
        desc: "Stable route reduces Damascus's control over aid. Opposition areas develop parallel governance.",
        likelihood: "Low",
      },
    ],
    justification:
      "Russia: aid should go through Damascus. Cross-border delivery violates sovereignty.",
    draftSummary:
      "Extend cross-border humanitarian aid to Syria via Bab al-Hawa for 12 months.",
  },
  {
    id: 3,
    date: "2022-09-30",
    topic: "Ukraine referenda",
    vetoedBy: ["Russia"],
    impactScore: 5,
    category: "Territorial Integrity",
    whatHappened:
      "GA passed non-binding version (143 votes). Russia proceeded with annexation. No binding SC determination on legal status.",
    altTimelines: [
      {
        title: "Binding condemnation",
        desc: "SC resolution creates stronger non-recognition basis. Banking, insurance, shipping compliance tightens around annexed territories.",
        likelihood: "Medium",
      },
      {
        title: "Enforcement gap persists",
        desc: "Passes but enforcement against nuclear P5 member impossible. Gap between this and the GA resolution may be smaller than expected.",
        likelihood: "High",
      },
    ],
    justification:
      "Russia: interference in internal affairs; referenda reflect self-determination.",
    draftSummary:
      "Condemn referenda as invalid; reject annexation of four Ukrainian regions.",
  },
  {
    id: 4,
    date: "2023-03-20",
    topic: "Mali sanctions",
    vetoedBy: ["Russia"],
    impactScore: 6,
    category: "Sanctions",
    whatHappened:
      "Monitoring ended. UN lost primary tool for tracking arms flows in Mali. Coincided with Wagner Group expansion in the Sahel.",
    altTimelines: [
      {
        title: "Wagner spotlight",
        desc: "Panel continues documenting arms flows, creating friction around Russia's Sahel footprint. Reports become leverage for West African states.",
        likelihood: "Medium",
      },
      {
        title: "Accountability anchor",
        desc: "Documentation creates evidentiary base for future proceedings. Without it, the factual record has an unfillable gap.",
        likelihood: "Medium-High",
      },
    ],
    justification: "Russia: sanctions inappropriate; Panel of Experts biased.",
    draftSummary:
      "Renew Mali sanctions regime and Panel of Experts monitoring arms and rights.",
  },
  {
    id: 5,
    date: "2023-07-11",
    topic: "Syria aid renewal",
    vetoedBy: ["Russia"],
    impactScore: 6,
    category: "Humanitarian",
    whatHappened:
      "Another disruption. Shorter compromise reached. Each brinkmanship cycle degrades agency capacity and costs lives during gaps.",
    altTimelines: [
      {
        title: "Breaking the cycle",
        desc: "Clean renewal signals permanence. Agencies invest in infrastructure, not crisis management. Health outcomes improve measurably.",
        likelihood: "High",
      },
      {
        title: "Normalization",
        desc: "Mechanism becomes accepted practice. Debate shifts from 'should it exist' to 'how to improve it.'",
        likelihood: "Medium",
      },
    ],
    justification: "Russia: aid must go through Damascus.",
    draftSummary:
      "Extend cross-border aid into northwest Syria for 9 months.",
  },
  {
    id: 6,
    date: "2023-10-18",
    topic: "Gaza humanitarian pause",
    vetoedBy: ["United States"],
    impactScore: 8,
    category: "Ceasefire",
    whatHappened:
      "No pause mandated. Ground offensive intensified. Aid access increasingly restricted. Council paralyzed on Gaza for months.",
    altTimelines: [
      {
        title: "Early norms set",
        desc: "11 days after Oct 7, SC-mandated pause establishes rules of engagement. Aid corridors open before the offensive peaks. War trajectory inflected.",
        likelihood: "Medium",
      },
      {
        title: "Ignored but on record",
        desc: "Resolution passes, is not enforced—like many Israel-Palestine SC texts. But creates legal reference point for future proceedings.",
        likelihood: "Medium-High",
      },
    ],
    justification:
      "US: text didn't acknowledge Israel's right to self-defense.",
    draftSummary:
      "Humanitarian pauses in Gaza, hostage release, condemn violence against civilians.",
  },
  {
    id: 7,
    date: "2024-03-22",
    topic: "Gaza ceasefire",
    vetoedBy: ["United States"],
    impactScore: 9,
    category: "Ceasefire",
    whatHappened:
      "Vetoed. Days later Res. 2728 passed demanding Ramadan ceasefire—no enforcement. War continued through catastrophic conditions.",
    altTimelines: [
      {
        title: "Binding demand",
        desc: "Legal obligations on all parties. States providing military support face sharper legal exposure. Arms transfer debates intensify. ICJ references it.",
        likelihood: "Medium",
      },
      {
        title: "Thousands of lives",
        desc: "Even partial implementation saves thousands, prevents worst famine, preserves hospital infrastructure. Reconstruction shortens by years.",
        likelihood: "Low-Medium",
      },
    ],
    justification:
      "US: could jeopardize hostage negotiations; didn't condemn Hamas.",
    draftSummary:
      "Immediate ceasefire, unconditional hostage release, unhindered humanitarian access.",
  },
  {
    id: 8,
    date: "2024-03-28",
    topic: "DPRK Panel of Experts",
    vetoedBy: ["Russia"],
    impactScore: 7,
    category: "Non-Proliferation",
    whatHappened:
      "Panel terminated. Primary mechanism tracking DPRK sanctions evasion—including arms transfers to Russia—lost its institutional home.",
    altTimelines: [
      {
        title: "Inconvenient reports",
        desc: "Panel documents DPRK ammunition transfers to Russia for Ukraine. Reports become diplomatic ammunition. Moscow faces evidence it can't easily dismiss.",
        likelihood: "High",
      },
      {
        title: "Oversight norm holds",
        desc: "Non-proliferation monitoring stays intact. Other panels aren't weakened by precedent. Message: can't dismantle oversight for producing unwelcome findings.",
        likelihood: "Medium-High",
      },
    ],
    justification:
      "Russia: Panel became a political tool of Western states.",
    draftSummary:
      "Renew Panel of Experts monitoring DPRK sanctions implementation.",
  },
  {
    id: 9,
    date: "2024-04-18",
    topic: "Palestine membership",
    vetoedBy: ["United States"],
    impactScore: 9,
    category: "Statehood",
    whatHappened:
      "Membership blocked. Palestine kept non-member observer status. GA upgraded participatory rights, but full membership—with legal consequences—out of reach.",
    altTimelines: [
      {
        title: "Full statehood",
        desc: "Palestine accesses ICC, ICJ, all treaty bodies. Settlement legality justiciable in new forums. Diplomatic architecture fundamentally restructured.",
        likelihood: "Medium",
      },
      {
        title: "Negotiation reset",
        desc: "Palestine enters talks as recognized state, not aspirant. US mediator role complicated—but arguably the disruption needed after decades of stalled talks.",
        likelihood: "Low-Medium",
      },
    ],
    justification: "US: statehood through negotiations, not UN vote.",
    draftSummary:
      "Recommend to GA that Palestine be admitted as full UN member.",
  },
  {
    id: 10,
    date: "2024-06-14",
    topic: "Sudan ceasefire",
    vetoedBy: ["Russia"],
    impactScore: 8,
    category: "Ceasefire",
    whatHappened:
      "No SC-backed ceasefire. Sudan's war deepened into one of the world's worst humanitarian crises. Millions displaced. Famine in multiple regions.",
    altTimelines: [
      {
        title: "Backbone for AU",
        desc: "SC resolution strengthens African-led mediation. AU mediators arrive with binding demand behind them. Neither SAF nor RSF can claim silence.",
        likelihood: "Medium-High",
      },
      {
        title: "Aid corridor mandate",
        desc: "Humanitarian access provisions create legal framework. Blocking aid becomes documented violation, not gray area. Accountability base begins building.",
        likelihood: "Medium",
      },
    ],
    justification:
      "Russia: text unbalanced; AU should lead mediation.",
    draftSummary:
      "Demand cessation of hostilities; protect civilians; humanitarian access.",
  },
  {
    id: 11,
    date: "2024-11-20",
    topic: "Gaza ceasefire (E10)",
    vetoedBy: ["United States"],
    impactScore: 8,
    category: "Ceasefire",
    whatHappened:
      "Vetoed despite unprecedented E10 unanimity. Gap between elected majority and P5 privilege starkly exposed.",
    altTimelines: [
      {
        title: "E10 precedent",
        desc: "First-ever collectively drafted E10 resolution passes. Elected members prove they can act as unified bloc. Political cost of future vetoes rises.",
        likelihood: "Medium",
      },
      {
        title: "Reform catalyst",
        desc: "Adopted E10 resolution demonstrates Council can function around P5 obstruction. Becomes Exhibit A in veto reform debates.",
        likelihood: "Low-Medium",
      },
    ],
    justification:
      "US: didn't address hostage talks or condemn Hamas.",
    draftSummary:
      "All 10 elected members demand permanent ceasefire, hostage release, aid access.",
  },
  {
    id: 12,
    date: "2025-01-14",
    topic: "Space weapons",
    vetoedBy: ["Russia"],
    impactScore: 5,
    category: "Non-Proliferation",
    whatHappened:
      "No reaffirmation of space non-weaponization norm. Militarization accelerated. Outer Space Treaty norms eroded through ambiguity.",
    altTimelines: [
      {
        title: "Norm anchor",
        desc: "SC resolution reinforces Outer Space Treaty. States contemplating orbital weapons face fresh binding reaffirmation raising political cost.",
        likelihood: "Medium",
      },
      {
        title: "Treaty momentum",
        desc: "Call for negotiations creates institutional momentum. Working groups form. Process may take a decade but it begins.",
        likelihood: "Low",
      },
    ],
    justification:
      "Russia: draft ignored its own comprehensive space treaty proposals.",
    draftSummary:
      "Reaffirm WMD prohibition in space; begin binding treaty negotiations.",
  },
  {
    id: 13,
    date: "2025-03-07",
    topic: "Gaza ceasefire (2025)",
    vetoedBy: ["United States"],
    impactScore: 8,
    category: "Ceasefire",
    whatHappened:
      "Another veto. Pattern of US Gaza vetoes became itself a focal point of reform debate. Council's paralysis on its most-discussed conflict became defining.",
    altTimelines: [
      {
        title: "Cumulative weight",
        desc: "Successive adopted resolutions create compounding pressure. Each makes the next harder to ignore. Quantity may produce quality in compliance.",
        likelihood: "Medium",
      },
      {
        title: "Credibility preserved",
        desc: "Council demonstrates it can act on its most consequential crisis. Public trust in multilateral institutions stabilizes rather than cratering.",
        likelihood: "Medium",
      },
    ],
    justification:
      "US: failed to condemn Hamas; didn't recognize Israel's security needs.",
    draftSummary:
      "Immediate ceasefire, hostage release, unimpeded humanitarian access.",
  },
];

const COLORS: Record<Country, string> = {
  Russia: "#e05245",
  China: "#e8a838",
  "United States": "#4a9ede",
};

const ALT = "#d4a24a";
const TRUNK_Y = 300;
const NODE_SPACE = 360;

function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function categoryProfile(category: string) {
  switch (category) {
    case "Humanitarian":
      return { spread: 1.15, lift: 0.9, droop: 1.15 };
    case "Ceasefire":
      return { spread: 1.05, lift: 1.1, droop: 1.05 };
    case "Statehood":
      return { spread: 1.25, lift: 1.0, droop: 0.95 };
    case "Non-Proliferation":
      return { spread: 0.9, lift: 1.2, droop: 0.9 };
    case "Territorial Integrity":
      return { spread: 1.1, lift: 1.0, droop: 1.0 };
    case "Sanctions":
      return { spread: 0.95, lift: 1.05, droop: 1.05 };
    default:
      return { spread: 1, lift: 1, droop: 1 };
  }
}

 function getNodeCx(index: number, count: number, width: number) {
  const occupied = (count - 1) * NODE_SPACE;
  return (width - occupied) / 2 + index * NODE_SPACE;
}

function getBranches(v: Veto, cx: number) {
  const r = seededRand(v.id * 137 + 42);

  const profile = categoryProfile(v.category);
  const impact = v.impactScore / 10;
  const multiVetoBoost = 1 + (v.vetoedBy.length - 1) * 0.12;

  const spreadBase = (90 + impact * 90) * profile.spread * multiVetoBoost;
  const upLift = (70 + impact * 95) * profile.lift;
  const downDrop = (75 + impact * 85) * profile.droop;

  const b1Dx = spreadBase + r() * 55;
  const b1Dy = -(upLift + r() * 36);
  const b2Dx = spreadBase * 0.95 + r() * 65;
  const b2Dy = downDrop + r() * 45;

  const b1Ctrl1 = { x: cx + 18 + r() * 30, y: TRUNK_Y + b1Dy * 0.22 };
  const b1Ctrl2 = {
    x: cx + b1Dx * (0.58 + r() * 0.12),
    y: TRUNK_Y + b1Dy * 0.82,
  };
  const b1End = { x: cx + b1Dx, y: TRUNK_Y + b1Dy };

  const b2Ctrl1 = { x: cx + 22 + r() * 28, y: TRUNK_Y + b2Dy * 0.28 };
  const b2Ctrl2 = {
    x: cx + b2Dx * (0.56 + r() * 0.14),
    y: TRUNK_Y + b2Dy * 0.86,
  };
  const b2End = { x: cx + b2Dx, y: TRUNK_Y + b2Dy };

  const twigScale = 0.8 + impact * 0.9;

  const b1Sub1End = {
    x: b1End.x + (22 + r() * 34) * twigScale,
    y: b1End.y - (16 + r() * 26) * twigScale,
  };
  const b1Sub2End = {
    x: b1End.x + (20 + r() * 30) * twigScale,
    y: b1End.y + (5 + r() * 18) * twigScale,
  };

  const b2Sub1End = {
    x: b2End.x + (24 + r() * 30) * twigScale,
    y: b2End.y + (10 + r() * 24) * twigScale,
  };
  const b2Sub2End = {
    x: b2End.x + (18 + r() * 28) * twigScale,
    y: b2End.y - (8 + r() * 14) * twigScale,
  };

  const b1W = 1.4 + impact * 2.2 + r() * 0.7;
  const b2W = 1.2 + impact * 1.8 + r() * 0.7;
  const nodeR = 4 + impact * 7 + (v.vetoedBy.length - 1) * 1.5;

  return {
    cx,
    nodeR,
    glowR: nodeR * 3.5,
    b1End,
    b1Ctrl1,
    b1Ctrl2,
    b1Sub1End,
    b1Sub2End,
    b1W,
    b2End,
    b2Ctrl1,
    b2Ctrl2,
    b2Sub1End,
    b2Sub2End,
    b2W,
  };
}

function shortCountry(c: Country) {
  return c === "United States" ? "US" : c;
}

function fmtShort(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function fmtLong(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StarField() {
  const stars = useMemo(() => {
    const make = (
      count: number,
      seedBase: number,
      leftMin = 0,
      leftMax = 100,
      topMin = 0,
      topMax = 100
    ) =>
      Array.from({ length: count }, (_, i) => {
        const r = seededRand(seedBase + i * 53);
        const bright = r() > 0.9;
        const medium = !bright && r() > 0.72;

        return {
          left: `${leftMin + r() * (leftMax - leftMin)}%`,
          top: `${topMin + r() * (topMax - topMin)}%`,
          size: bright ? 2 + r() * 1.8 : medium ? 1.2 + r() * 1.2 : 0.5 + r() * 0.9,
          opacity: bright ? 0.45 + r() * 0.25 : medium ? 0.18 + r() * 0.18 : 0.04 + r() * 0.08,
          blur: bright ? 0.8 + r() * 1.4 : medium ? 0.2 + r() * 0.5 : 0,
          twinkle: bright ? r() > 0.35 : medium ? r() > 0.75 : false,
          dur: 6 + r() * 10,
          delay: r() * 6,
        };
      });

    return [
      ...make(85, 100, 0, 100, 0, 100),
      ...make(24, 2000, 0, 100, 0, 100),
      ...make(12, 5000, 0, 100, 0, 100),
      ...make(18, 8000, 70, 100, 8, 94),
      ...make(10, 11000, 30, 70, 10, 90),
    ];
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            opacity: s.opacity,
            filter: `blur(${s.blur}px)`,
            animation: s.twinkle
              ? `starTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`
              : undefined,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(420px 220px at 18% 22%, rgba(255,255,255,0.018), transparent 75%),
            radial-gradient(360px 220px at 58% 26%, rgba(74,158,222,0.025), transparent 78%),
            radial-gradient(320px 180px at 84% 24%, rgba(212,162,74,0.018), transparent 80%)
          `,
        }}
      />
    </div>
  );
}

function BranchParticles({
  from,
  to,
  color,
  active,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  active: boolean;
}) {
  if (!active) return null;

  const particles = Array.from({ length: 8 }, (_, i) => {
    const t = i / 8;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;

    return (
      <circle key={i} cx={x} cy={y} r="1.6" fill={color} opacity="0">
        <animate
          attributeName="opacity"
          values="0;0.85;0"
          dur="2.2s"
          begin={`${i * 0.18}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values="0.8;2.1;0.8"
          dur="2.2s"
          begin={`${i * 0.18}s`}
          repeatCount="indefinite"
        />
      </circle>
    );
  });

  return <g filter="url(#softGlow)">{particles}</g>;
}

function SidePanel({
  veto,
  isMobile,
  onClose,
  onSelectAlt,
}: {
  veto: Veto;
  isMobile: boolean;
  onClose: () => void;
  onSelectAlt: (index: 0 | 1) => void;
}) {
  const shellStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        maxHeight: "74vh",
        overflowY: "auto",
        zIndex: 20,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(11,11,18,0.96)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        backdropFilter: "blur(16px)",
      }
    :{
    position: "fixed",
    top: 132,
    right: 18,
    bottom: 18,
    width: "min(420px, calc(100vw - 36px))",
    overflowY: "auto",
    zIndex: 40,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(12,12,20,0.94)",
    boxShadow: "0 20px 48px rgba(0,0,0,0.42)",
    backdropFilter: "blur(18px)",
  };

  return (
    <div style={shellStyle}>
      <div style={{ padding: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                margin: 0,
                fontFamily: "'Instrument Serif', Georgia, serif",
                color: "#fff",
              }}
            >
              {veto.topic}
            </h2>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 6,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono'",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {fmtLong(veto.date)}
              </span>
              {veto.vetoedBy.map((c) => (
                <span
                  key={c}
                  style={{
                    padding: "1px 8px",
                    borderRadius: 3,
                    background: `${COLORS[c]}18`,
                    color: COLORS[c],
                    fontSize: 8,
                    fontFamily: "'JetBrains Mono'",
                    fontWeight: 500,
                  }}
                >
                  {c.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.58)",
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 7,
              fontFamily: "'JetBrains Mono'",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.48)",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            Draft resolution
          </div>
          <p
            style={{
              fontSize: 12.2,
              color: "rgba(255,255,255,0.80)",
              lineHeight: 1.62,
              margin: 0,
            }}
          >
            {veto.draftSummary}
          </p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 7,
              fontFamily: "'JetBrains Mono'",
              letterSpacing: "0.1em",
              color: COLORS[veto.vetoedBy[0]],
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            Justification
          </div>
          <div
            style={{
              padding: "9px 10px",
              borderRadius: 8,
              borderLeft: `2px solid ${COLORS[veto.vetoedBy[0]]}30`,
              background: `${COLORS[veto.vetoedBy[0]]}08`,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.58,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              {veto.justification}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 7,
              fontFamily: "'JetBrains Mono'",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.48)",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            What actually happened
          </div>
          <div
            style={{
              padding: "10px 11px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p
              style={{
                fontSize: 12.2,
                color: "rgba(255,255,255,0.84)",
                lineHeight: 1.62,
                margin: 0,
              }}
            >
              {veto.whatHappened}
            </p>
          </div>
        </div>

        <div
          style={{
            fontSize: 7,
            fontFamily: "'JetBrains Mono'",
            letterSpacing: "0.1em",
            color: ALT,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Alternate timelines
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {veto.altTimelines.map((alt, j) => (
            <button
              key={j}
              onClick={() => onSelectAlt(j as 0 | 1)}
              style={{
                padding: "12px 12px",
                borderRadius: 10,
                cursor: "pointer",
                textAlign: "left",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.08)`,
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontFamily: "'JetBrains Mono'",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.62)",
                  marginBottom: 6,
                }}
              >
                Alternate {j + 1}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  color: "rgba(255,255,255,0.92)",
                  marginBottom: 4,
                }}
              >
                {alt.title}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono'",
                  color: ALT,
                }}
              >
                {alt.likelihood}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [selId, setSelId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [activeAlt, setActiveAlt] = useState<0 | 1 | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [drag, setDrag] = useState(false);
  const [grown, setGrown] = useState<Record<number, boolean>>({});
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dRef = useRef({ x: 0, sl: 0, moved: false });
  const [viewportW, setViewportW] = useState(0);

  const closeAll = useCallback(() => {
    setSelId(null);
    setViewMode(null);
    setActiveAlt(null);
    setHoveredId(null);
  }, []);


  const fil = useMemo(() => {
    let items = filter === "all" ? VETOES : VETOES.filter((v) => v.vetoedBy.includes(filter));
    if (yearFilter !== "all") items = items.filter((v) => v.date.startsWith(yearFilter));
    return items;
  }, [filter, yearFilter]);

  const sel = useMemo(() => VETOES.find((v) => v.id === selId) ?? null, [selId]);

const totalW = useMemo(
    () => Math.max(fil.length * NODE_SPACE + 300, viewportW || 0),
    [fil.length, viewportW]
  );
  
  const laidOut = useMemo(
    () =>
      fil.map((v, i) => {
        const cx = getNodeCx(i, fil.length, totalW);
        return { veto: v, branch: getBranches(v, cx) };
      }),
    [fil, totalW]
  );

const goMain = useCallback(
  (id: number) => {
    setSelId(id);
    setViewMode("main");
    setActiveAlt(null);
    setGrown((g) => ({ ...g, [id]: true }));

    if (!scrollRef.current) return;

    const found = laidOut.find((item) => item.veto.id === id);
    if (!found) return;

    const container = scrollRef.current;

    container.scrollTo({
      left: Math.max(0, found.branch.cx - container.clientWidth / 2),
      top: Math.max(0, TRUNK_Y - 180),
      behavior: "smooth",
    });
  },
  [laidOut]
);

  const maxImpact = Math.max(...fil.map((v) => v.impactScore));
  const totalH = TRUNK_Y + 70 + maxImpact * 12 + 260;

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    VETOES.forEach((v) => {
      v.vetoedBy.forEach((c) => {
        out[c] = (out[c] || 0) + 1;
      });
    });
    return out;
  }, []);

  const trunkPath = useMemo(() => {
  return `M 60 ${TRUNK_Y} ${laidOut
    .map(({ branch }, i) => {
      const wobble = i % 3 === 0 ? -4 : i % 3 === 1 ? 3 : -2;
      return `L ${branch.cx} ${TRUNK_Y + wobble}`;
    })
    .join(" ")} L ${totalW - 60} ${TRUNK_Y}`;
}, [laidOut, totalW]);



  const md = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-c]") || target.closest("button")) return;
    setDrag(true);
    dRef.current = { x: e.clientX, sl: scrollRef.current?.scrollLeft || 0, moved: false };
  }, []);

  const mm = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!drag) return;
      if (Math.abs(e.clientX - dRef.current.x) > 8) dRef.current.moved = true;
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = dRef.current.sl - (e.clientX - dRef.current.x);
      }
    },
    [drag]
  );

  const backToMain = useCallback(() => {
    if (!selId) return;
    setViewMode("main");
    setActiveAlt(null);
  }, [selId]);

const mu = useCallback(() => {
  setDrag(false);
  dRef.current.moved = false;
}, []);

const cl = useCallback(
  (id: number) => {
    if (dRef.current.moved) return;

    // clicking the same selected veto toggles within its own flow
    if (id === selId) {
      if (viewMode === "alt") {
        backToMain();
        return;
      }

      if (viewMode === "main") {
        closeAll();
        return;
      }
    }

    // clicking any different veto always switches directly to it
    goMain(id);
  },
  [selId, viewMode, closeAll, goMain, backToMain]
);

  const enterAltView = useCallback(
    (index: 0 | 1) => {
      if (!selId || !scrollRef.current) return;
      setViewMode("alt");
      setActiveAlt(index);

      const found = laidOut.find((item) => item.veto.id === selId);
      if (!found) return;

      const targetX = index === 0 ? found.branch.b1End.x : found.branch.b2End.x;
      const targetY = index === 0 ? found.branch.b1End.y : found.branch.b2End.y;

      const container = scrollRef.current;
      const viewportW = container.clientWidth;
      const viewportH = container.clientHeight;

      container.scrollTo({
        left: Math.max(0, targetX - viewportW * 0.5),
        top: Math.max(0, targetY - viewportH * 0.35),
        behavior: "smooth",
      });
    },
    [laidOut, selId]
  );


  const handleMapBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (dRef.current.moved) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-c]") || target.closest("button")) return;
      closeAll();
    },
    [closeAll]
  );

  useEffect(() => {
  const update = () => {
    setViewportW(scrollRef.current?.clientWidth || window.innerWidth || 0);
  };

  update();
  window.addEventListener("resize", update);
  return () => window.removeEventListener("resize", update);
}, []);

useEffect(() => {
  if (!scrollRef.current) return;

  const container = scrollRef.current;

  container.scrollTop = Math.max(0, TRUNK_Y - 300);
  container.scrollLeft = 0;
}, [filter, yearFilter, totalW]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewMode === "alt") backToMain();
        else closeAll();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeAll, viewMode, backToMain]);

  const css = `
    @keyframes growBranch {
      from { stroke-dashoffset: 500; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes growSub {
      from { stroke-dashoffset: 220; opacity: 0; }
      to { stroke-dashoffset: 0; opacity: 1; }
    }
    @keyframes fadeLabel {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes starTwinkle {
      0%, 100% { opacity: 0.12; }
      50% { opacity: 0.32; }
    }
    @keyframes endpointPulse {
      0%, 100% { transform: scale(1); opacity: 0.22; }
      50% { transform: scale(1.18); opacity: 0.5; }
    }
    .branch-grow {
      stroke-dasharray: 500;
      stroke-dashoffset: 500;
      animation: growBranch 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
    }
    .sub-grow {
      stroke-dasharray: 220;
      stroke-dashoffset: 220;
      animation: growSub 0.6s cubic-bezier(0.4,0,0.2,1) 0.5s forwards;
      opacity: 0;
    }
    .sub-grow2 {
      stroke-dasharray: 220;
      stroke-dashoffset: 220;
      animation: growSub 0.6s cubic-bezier(0.4,0,0.2,1) 0.7s forwards;
      opacity: 0;
    }
    .label-fade {
      animation: fadeLabel 0.4s ease 0.6s both;
    }
    .label-fade2 {
      animation: fadeLabel 0.4s ease 0.8s both;
    }
  `;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#04050a",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        userSelect: drag ? "none" : "auto",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <style>{css}</style>

      <div style={{ padding: "16px 24px 0", flexShrink: 0, position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 8,
                fontFamily: "'JetBrains Mono'",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.42)",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Exploring veto explanations and imagined alternate futures.

            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 400,
                margin: 0,
                fontFamily: "'Instrument Serif', Georgia, serif",
              }}
            >
              The Veto <span style={{ color: "rgba(255,255,255,0.56)", fontStyle: "italic" }}>Multiverse</span>
            </h1>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([c, n]) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: COLORS[c as Country],
                      boxShadow: `0 0 8px ${COLORS[c as Country]}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: "'JetBrains Mono'",
                      color: "rgba(255,255,255,0.68)",
                    }}
                  >
                    {c === "United States" ? "US" : c}: {n}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 5,
            padding: "8px 0 10px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {(["all", "Russia", "China", "United States"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                closeAll();
              }}
              style={{
                padding: "3px 11px",
                borderRadius: 5,
                fontSize: 9,
                fontFamily: "'JetBrains Mono'",
                cursor: "pointer",
                border: `1px solid ${
                  filter === f ? (f === "all" ? "rgba(255,255,255,0.34)" : COLORS[f]) : "rgba(255,255,255,0.10)"
                }`,
                background:
                  filter === f
                    ? f === "all"
                      ? "rgba(255,255,255,0.07)"
                      : `${COLORS[f]}18`
                    : "rgba(255,255,255,0.02)",
                color:
                  filter === f
                    ? f === "all"
                      ? "#fff"
                      : COLORS[f]
                    : "rgba(255,255,255,0.55)",
                boxShadow: filter === f && f !== "all" ? `0 0 20px ${COLORS[f]}20` : "none",
              }}
            >
              {f === "all" ? "ALL" : f === "United States" ? "US" : f.toUpperCase()}
            </button>
          ))}

          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              fontFamily: "'JetBrains Mono'",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            drag to explore →
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 5,
            padding: "8px 0 10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: "'JetBrains Mono'",
              color: "rgba(255,255,255,0.32)",
              marginRight: 4,
            }}
          >
            year
          </span>

          {(["all", "2022", "2023", "2024", "2025"] as const).map((yr) => (
            <button
              key={yr}
              onClick={() => {
                setYearFilter(yr);
                closeAll();
              }}
              style={{
                padding: "3px 11px",
                borderRadius: 5,
                fontSize: 9,
                fontFamily: "'JetBrains Mono'",
                cursor: "pointer",
                border: `1px solid ${yearFilter === yr ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.10)"}`,
                background: yearFilter === yr ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
                color: yearFilter === yr ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              {yr === "all" ? "ALL YEARS" : yr}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          ref={scrollRef}
          onMouseDown={md}
          onMouseMove={mm}
          onMouseUp={mu}
          onMouseLeave={mu}
          onClick={handleMapBackgroundClick}
          style={{
            width: "100%",
            height: "100%",
            overflowX: "auto",
            overflowY: "auto",
            cursor: drag ? "grabbing" : "grab",
            position: "relative",
          }}
        >
          <div style={{ width: totalW, height: totalH, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `
                  radial-gradient(1200px 500px at 18% 12%, rgba(74,158,222,0.12), transparent 60%),
                  radial-gradient(900px 420px at 82% 18%, rgba(212,162,74,0.10), transparent 58%),
                  radial-gradient(700px 380px at 52% 75%, rgba(224,82,69,0.08), transparent 62%),
                  radial-gradient(600px 300px at 8% 82%, rgba(74,158,222,0.05), transparent 68%),
                  radial-gradient(520px 260px at 92% 76%, rgba(212,162,74,0.05), transparent 70%),
                  radial-gradient(circle at 50% 50%, rgba(255,255,255,0.025), transparent 55%),
                  linear-gradient(180deg, #03040a 0%, #050712 35%, #080914 100%)
                `,
                zIndex: 0,
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.10) 72%, rgba(0,0,0,0.30) 100%)",
                zIndex: 0,
              }}
            />

            <StarField />

            <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "auto",
              zIndex: 1,
            }}
          >
              <defs>
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="bigGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="
                      1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 16 -6
                    "
                    result="glow"
                  />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path d={trunkPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" filter="url(#bigGlow)" />
              <path d={trunkPath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" strokeLinecap="round" />
              <path d={trunkPath} fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" strokeLinecap="round" />

              {(yearFilter === "all" ? ["2022", "2023", "2024", "2025"] : [yearFilter]).map((yr) => {
                const idx = fil.findIndex((v) => v.date.startsWith(yr));
                if (idx === -1) return null;
                const x = getNodeCx(idx, fil.length, totalW);
                return (
                  <text
                    key={yr}
                    x={x - 8}
                    y={TRUNK_Y - 28}
                    fill="rgba(255,255,255,0.30)"
                    fontSize="11"
                    fontFamily="'JetBrains Mono'"
                    fontWeight="500"
                  >
                    {yr}
                  </text>
                );
              })}

              {laidOut.map(({ veto: v, branch: b }) => {
                const clr = COLORS[v.vetoedBy[0]];
                const isSelected = v.id === selId;
                const isAltView = isSelected && viewMode === "alt";
                const showAlt0 = isAltView && activeAlt === 0;
                const showAlt1 = isAltView && activeAlt === 1;
                const isGrown = grown[v.id];

                return (
                  <g key={v.id}>
                    {isSelected && (
                      <circle cx={b.cx} cy={TRUNK_Y} r={b.glowR} fill={clr} opacity="0.10" filter="url(#bigGlow)" />
                    )}

                    {isSelected && (
                      <circle cx={b.cx} cy={TRUNK_Y} r={b.glowR * 0.7} fill={clr} opacity="0.06">
                        <animate
                          attributeName="r"
                          values={`${b.glowR * 0.62};${b.glowR * 0.82};${b.glowR * 0.62}`}
                          dur="3.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    <path
                      d={`M ${b.cx} ${TRUNK_Y} C ${b.b1Ctrl1.x} ${b.b1Ctrl1.y}, ${b.b1Ctrl2.x} ${b.b1Ctrl2.y}, ${b.b1End.x} ${b.b1End.y}`}
                      fill="none"
                      stroke={showAlt0 ? "#fff" : ALT}
                      strokeWidth={showAlt0 ? b.b1W + 1 : isSelected ? b.b1W : Math.max(0.7, b.b1W * 0.32)}
                      opacity={showAlt0 ? 0.9 : isSelected ? 0.4 : 0.07}
                      className={isSelected && isGrown ? "branch-grow" : undefined}
                      filter={isSelected ? "url(#softGlow)" : undefined}
                    />
                    <path
                      d={`M ${b.b1End.x} ${b.b1End.y} Q ${(b.b1End.x + b.b1Sub1End.x) / 2} ${b.b1End.y - 10}, ${b.b1Sub1End.x} ${b.b1Sub1End.y}`}
                      fill="none"
                      stroke={showAlt0 ? "#fff" : ALT}
                      strokeWidth={showAlt0 ? 1.2 : 0.25}
                      opacity={showAlt0 ? 0.52 : 0.025}
                      className={isSelected && isGrown ? "sub-grow" : undefined}
                    />
                    <path
                      d={`M ${b.b1End.x} ${b.b1End.y} Q ${(b.b1End.x + b.b1Sub2End.x) / 2} ${b.b1End.y + 5}, ${b.b1Sub2End.x} ${b.b1Sub2End.y}`}
                      fill="none"
                      stroke={showAlt0 ? "#fff" : ALT}
                      strokeWidth={showAlt0 ? 0.8 : 0.18}
                      opacity={showAlt0 ? 0.35 : 0.018}
                      className={isSelected && isGrown ? "sub-grow2" : undefined}
                    />

                    <path
                      d={`M ${b.cx} ${TRUNK_Y} C ${b.b2Ctrl1.x} ${b.b2Ctrl1.y}, ${b.b2Ctrl2.x} ${b.b2Ctrl2.y}, ${b.b2End.x} ${b.b2End.y}`}
                      fill="none"
                      stroke={showAlt1 ? "#fff" : ALT}
                      strokeWidth={showAlt1 ? b.b2W + 1 : isSelected ? b.b2W : Math.max(0.55, b.b2W * 0.32)}
                      opacity={showAlt1 ? 0.9 : isSelected ? 0.4 : 0.05}
                      className={isSelected && isGrown ? "branch-grow" : undefined}
                      filter={isSelected ? "url(#softGlow)" : undefined}
                    />
                    <path
                      d={`M ${b.b2End.x} ${b.b2End.y} Q ${(b.b2End.x + b.b2Sub1End.x) / 2} ${b.b2End.y + 8}, ${b.b2Sub1End.x} ${b.b2Sub1End.y}`}
                      fill="none"
                      stroke={showAlt1 ? "#fff" : ALT}
                      strokeWidth={showAlt1 ? 1 : 0.22}
                      opacity={showAlt1 ? 0.46 : 0.016}
                      className={isSelected && isGrown ? "sub-grow" : undefined}
                    />
                    <path
                      d={`M ${b.b2End.x} ${b.b2End.y} Q ${(b.b2End.x + b.b2Sub2End.x) / 2} ${b.b2End.y - 5}, ${b.b2Sub2End.x} ${b.b2Sub2End.y}`}
                      fill="none"
                      stroke={showAlt1 ? "#fff" : ALT}
                      strokeWidth={showAlt1 ? 0.7 : 0.18}
                      opacity={showAlt1 ? 0.30 : 0.012}
                      className={isSelected && isGrown ? "sub-grow2" : undefined}
                    />
                    <circle
                        cx={b.cx}
                        cy={TRUNK_Y}
                        r={18}
                        fill="transparent"
                        pointerEvents="auto"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          cl(v.id);
                        }}
                      />

                      <circle
                        cx={b.cx}
                        cy={TRUNK_Y}
                        r={isSelected ? b.nodeR + 1.5 : b.nodeR}
                        fill={clr}
                        opacity={isSelected ? 1 : 0.62}
                        style={{
                          transition: "all 0.3s",
                          cursor: "pointer",
                          pointerEvents: "auto",
                        }}
                        filter={isSelected ? "url(#softGlow)" : undefined}
                        onClick={(e) => {
                          e.stopPropagation();
                          cl(v.id);
                        }}
                      />

                      {/* Invisible hit area for Alt 1 */}
                      <circle
                        cx={b.b1End.x}
                        cy={b.b1End.y}
                        r={18}
                        fill="transparent"
                        pointerEvents={isSelected ? "auto" : "none"}
                        style={{ cursor: isSelected ? "pointer" : "default" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSelected) return;
                          enterAltView(0);
                        }}
                      />

                    <circle
                      cx={b.b1End.x}
                      cy={b.b1End.y}
                      r={showAlt0 ? 6.2 : isSelected ? 4.2 : 2.6}
                      fill={showAlt0 ? "#fff" : ALT}
                      stroke={showAlt0 ? "#fff" : ALT}
                      strokeWidth="1"
                      opacity={showAlt0 ? 0.92 : isSelected ? 0.55 : 0.16}
                      style={{
                        cursor: isSelected ? "pointer" : "default",
                        pointerEvents: isSelected ? "auto" : "none",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) return;
                        enterAltView(0);
                      }}
                    />

                      {/* Invisible hit area for Alt 2 */}
                      <circle
                        cx={b.b2End.x}
                        cy={b.b2End.y}
                        r={18}
                        fill="transparent"
                        pointerEvents={isSelected ? "auto" : "none"}
                        style={{ cursor: isSelected ? "pointer" : "default" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSelected) return;
                          enterAltView(1);
                        }}
                      />

                    <circle
                      cx={b.b2End.x}
                      cy={b.b2End.y}
                      r={showAlt1 ? 6.2 : isSelected ? 4.2 : 2.6}
                      fill={showAlt1 ? "#fff" : ALT}
                      stroke={showAlt1 ? "#fff" : ALT}
                      strokeWidth="1"
                      opacity={showAlt1 ? 0.92 : isSelected ? 0.55 : 0.16}
                      style={{
                        cursor: isSelected ? "pointer" : "default",
                        pointerEvents: isSelected ? "auto" : "none",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) return;
                        enterAltView(1);
                      }}
                    />

                    <BranchParticles from={{ x: b.cx, y: TRUNK_Y }} to={b.b1End} color={ALT} active={showAlt0} />
                    <BranchParticles from={{ x: b.cx, y: TRUNK_Y }} to={b.b2End} color={ALT} active={showAlt1} />
                  </g>
                );
              })}
            </svg>

            <div
              style={{
                position: "absolute",
                left: 16,
                top: TRUNK_Y - 18,
                padding: "5px 8px",
                borderRadius: 999,
                background: "rgba(8,8,14,0.82)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                fontSize: 8,
                fontFamily: "'JetBrains Mono'",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.58)",
                textTransform: "uppercase",
                zIndex: 3,
                whiteSpace: "nowrap",
                boxShadow: "0 8px 18px rgba(0,0,0,0.22)",
              }}
            >
              Our timeline →
            </div>

            {laidOut.map(({ veto: v, branch: b }) => {
              const clr = COLORS[v.vetoedBy[0]];
              const isSelected = v.id === selId;
              const isMain = isSelected && viewMode === "main";
              const showAlt0 = isSelected && viewMode === "alt" && activeAlt === 0;
              const showAlt1 = isSelected && viewMode === "alt" && activeAlt === 1;
              const isGrown = grown[v.id];

              return (
                <div key={v.id}>
                  {hoveredId === v.id && !isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        left: b.cx - 76,
                        top: TRUNK_Y - 56,
                        width: 152,
                        padding: "6px 8px",
                        borderRadius: 7,
                        background: "rgba(10,10,18,0.90)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: "0 10px 28px rgba(0,0,0,0.32)",
                        backdropFilter: "blur(10px)",
                        pointerEvents: "none",
                        zIndex: 3,
                        fontSize: 8,
                        fontFamily: "'JetBrains Mono'",
                        color: "rgba(255,255,255,0.72)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        textAlign: "center",
                      }}
                    >
                      {v.category} · impact {v.impactScore}/10
                    </div>
                  )}

                  <div
                    data-c="1"
                    onClick={(e) => {
                      e.stopPropagation();
                      cl(v.id);
                    }}
                    onMouseEnter={() => setHoveredId(v.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      position: "absolute",
                      left: b.cx - 106,
                      top: TRUNK_Y + 24,
                      width: 212,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.3s",
                      transform: isSelected ? "scale(1.04)" : "none",
                      zIndex: 3,
                    }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(10,10,18,0.90) 0%, rgba(7,7,14,0.82) 100%)",
                        borderRadius: 9,
                        padding: "9px 11px",
                        border: `1px solid ${isSelected ? `${clr}55` : "rgba(255,255,255,0.10)"}`,
                        boxShadow: isSelected
                          ? `0 0 0 1px ${clr}10, 0 10px 35px rgba(0,0,0,0.35)`
                          : "0 10px 30px rgba(0,0,0,0.22)",
                        backdropFilter: "blur(14px)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 4,
                          marginBottom: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        {v.vetoedBy.map((c) => (
                          <span
                            key={c}
                            style={{
                              fontSize: 7,
                              fontFamily: "'JetBrains Mono'",
                              padding: "1px 5px",
                              borderRadius: 3,
                              background: `${COLORS[c]}20`,
                              color: COLORS[c],
                              textTransform: "uppercase",
                              fontWeight: 500,
                            }}
                          >
                            {shortCountry(c)}
                          </span>
                        ))}
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 400,
                          color: isSelected ? "#fff" : "rgba(255,255,255,0.90)",
                          fontFamily: "'Instrument Serif', Georgia, serif",
                          lineHeight: 1.18,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {v.topic}
                      </div>

                      <div
                        style={{
                          fontSize: 8,
                          fontFamily: "'JetBrains Mono'",
                          color: "rgba(255,255,255,0.46)",
                          marginTop: 3,
                        }}
                      >
                        {fmtShort(v.date)}
                      </div>
                    </div>
                  </div>

                  {isMain && (
                    <>
                      <button
                        data-c="1"
                        onClick={() => enterAltView(0)}
                        style={{
                          position: "absolute",
                          left: b.b1End.x - 22,
                          top: b.b1End.y - 22,
                          width: 44,
                          height: 44,
                          borderRadius: 999,
                          border: `1px solid ${ALT}55`,
                          background: "rgba(212,162,74,0.14)",
                          color: ALT,
                          fontSize: 9,
                          fontFamily: "'JetBrains Mono'",
                          cursor: "pointer",
                          zIndex: 4,
                          boxShadow: `0 0 18px ${ALT}22`,
                        }}
                      >
                        A1
                      </button>

                      <button
                        data-c="1"
                        onClick={() => enterAltView(1)}
                        style={{
                          position: "absolute",
                          left: b.b2End.x - 22,
                          top: b.b2End.y - 22,
                          width: 44,
                          height: 44,
                          borderRadius: 999,
                          border: `1px solid ${ALT}55`,
                          background: "rgba(212,162,74,0.14)",
                          color: ALT,
                          fontSize: 9,
                          fontFamily: "'JetBrains Mono'",
                          cursor: "pointer",
                          zIndex: 4,
                          boxShadow: `0 0 18px ${ALT}22`,
                        }}
                      >
                        A2
                      </button>
                    </>
                  )}

                  {showAlt0 && (
                    <div
                      className={isGrown ? "label-fade" : undefined}
                      style={{
                          position: "absolute",
                          left: b.b1End.x - 120,
                          top: b.b1End.y - 138,
                          width: 340,
                          opacity: isGrown ? undefined : 0,
                          zIndex: 5,
                          pointerEvents: "none",
                        }}
                    >
                      <div
                        style={{
                          padding: "12px 13px",
                          borderRadius: 10,
                          background: "rgba(22,22,30,0.94)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                          backdropFilter: "blur(14px)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 8,
                              fontFamily: "'JetBrains Mono'",
                              color: "#fff",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            ⑂ Alternate 1
                          </div>
                          <button
                            data-c="1"
                            onClick={backToMain}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 999,
                              border: "1px solid rgba(255,255,255,0.12)",
                              background: "rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.72)",
                              fontSize: 8,
                              fontFamily: "'JetBrains Mono'",
                              cursor: "pointer",
                            }}
                          >
                            Back
                          </button>
                        </div>

                        <div
                          style={{
                            fontSize: 10,
                            fontFamily: "'JetBrains Mono'",
                            color: ALT,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            marginBottom: 8,
                          }}
                        >
                          {v.altTimelines[0].title}
                        </div>

                        <div
                          style={{
                            fontSize: 11.5,
                            color: "rgba(255,255,255,0.90)",
                            lineHeight: 1.58,
                            marginBottom: 8,
                          }}
                        >
                          {v.altTimelines[0].desc}
                        </div>

                        <div
                          style={{
                            fontSize: 8,
                            fontFamily: "'JetBrains Mono'",
                            color: "rgba(255,255,255,0.58)",
                          }}
                        >
                          {v.altTimelines[0].likelihood}
                        </div>
                      </div>
                    </div>
                  )}

                  {showAlt1 && (
                    <div
                      className={isGrown ? "label-fade2" : undefined}
                      style={{
                          position: "absolute",
                          left: b.b2End.x - 120,
                          top: b.b2End.y + 28,
                          width: 340,
                          opacity: isGrown ? undefined : 0,
                          zIndex: 5,
                          pointerEvents: "none",
                        }}
                    >
                      <div
                        style={{
                          padding: "12px 13px",
                          borderRadius: 10,
                          background: "rgba(22,22,30,0.94)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                          backdropFilter: "blur(14px)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 8,
                              fontFamily: "'JetBrains Mono'",
                              color: "#fff",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            ⑂ Alternate 2
                          </div>
                          <button
                            data-c="1"
                            onClick={backToMain}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 999,
                              border: "1px solid rgba(255,255,255,0.12)",
                              background: "rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.72)",
                              fontSize: 8,
                              fontFamily: "'JetBrains Mono'",
                              cursor: "pointer",
                            }}
                          >
                            Back
                          </button>
                        </div>

                        <div
                          style={{
                            fontSize: 10,
                            fontFamily: "'JetBrains Mono'",
                            color: ALT,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            marginBottom: 8,
                          }}
                        >
                          {v.altTimelines[1].title}
                        </div>

                        <div
                          style={{
                            fontSize: 11.5,
                            color: "rgba(255,255,255,0.90)",
                            lineHeight: 1.58,
                            marginBottom: 8,
                          }}
                        >
                          {v.altTimelines[1].desc}
                        </div>

                        <div
                          style={{
                            fontSize: 8,
                            fontFamily: "'JetBrains Mono'",
                            color: "rgba(255,255,255,0.58)",
                          }}
                        >
                          {v.altTimelines[1].likelihood}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {sel && viewMode === "main" && (
          <>
            {isMobile && (
              <div
                onClick={closeAll}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.35)",
                  zIndex: 19,
                }}
              />
            )}
            <SidePanel
              veto={sel}
              isMobile={isMobile}
              onClose={closeAll}
              onSelectAlt={enterAltView}
            />
          </>
        )}
      </div>
    </div>
  );
}
