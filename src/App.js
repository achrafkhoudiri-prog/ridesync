import { useState, useEffect, useRef } from "react";

// --- DATA ---
const ATHLETES = [
  { id: 1, name: "You", avatar: "🚴", color: "#FF5722" },
  { id: 2, name: "Sarah K.", avatar: "🚴‍♀️", color: "#4CAF50" },
  { id: 3, name: "Marco P.", avatar: "🚴‍♂️", color: "#2196F3" },
  { id: 4, name: "Lina W.", avatar: "🚴‍♀️", color: "#9C27B0" },
];

const TRAINING_PLAN = {
  date: "Monday, April 20",
  title: "Endurance Base + Tempo Intervals",
  source: "TrainingPeaks",
  tss: 112,
  duration: "2h 15min",
  distance: "68 km",
  ifactor: 0.78,
  notes: "Focus on steady cadence during tempo blocks. Stay in zone 2 for recovery intervals. Hydrate every 20 min.",
  blocks: [
    { type: "warmup", label: "Warm-Up", duration: "20 min", zone: "Z1-Z2", description: "Easy spin, gradually increase cadence to 90rpm", power: "120-160W" },
    { type: "interval", label: "Tempo Block 1", duration: "15 min", zone: "Z3", description: "Steady tempo at 88-92rpm, flat terrain", power: "210-240W" },
    { type: "recovery", label: "Recovery", duration: "5 min", zone: "Z1", description: "Easy spin, hydrate", power: "100-130W" },
    { type: "interval", label: "Tempo Block 2", duration: "15 min", zone: "Z3", description: "Tempo with slight grade, seated climbing", power: "220-250W" },
    { type: "recovery", label: "Recovery", duration: "5 min", zone: "Z1", description: "Easy spin, nutrition", power: "100-130W" },
    { type: "interval", label: "Tempo Block 3", duration: "15 min", zone: "Z3-Z4", description: "Progressive tempo, last 3 min push to sweet spot", power: "230-265W" },
    { type: "recovery", label: "Recovery", duration: "5 min", zone: "Z1", description: "Easy spin", power: "100-130W" },
    { type: "endurance", label: "Endurance Ride", duration: "35 min", zone: "Z2", description: "Steady endurance pace, practice aero position", power: "160-195W" },
    { type: "cooldown", label: "Cool Down", duration: "10 min", zone: "Z1", description: "Easy spin, stretch after", power: "90-120W" },
  ],
};

const WEEK_DAYS = [
  { day: "Mon", date: "20", active: true, type: "Tempo", done: false },
  { day: "Tue", date: "21", active: false, type: "Rest", done: false },
  { day: "Wed", date: "22", active: false, type: "VO2max", done: false },
  { day: "Thu", date: "23", active: false, type: "Easy", done: false },
  { day: "Fri", date: "24", active: false, type: "Rest", done: false },
  { day: "Sat", date: "25", active: false, type: "Long", done: false },
  { day: "Sun", date: "26", active: false, type: "Recovery", done: false },
];

const MESSAGES = [
  { id: 1, athlete: ATHLETES[1], text: "Anyone up for the Al Qudra loop at 5:30 AM tomorrow? Route looks perfect for tempo work.", time: "8:12 AM", reactions: ["👍", "🔥"] },
  { id: 2, athlete: ATHLETES[2], text: "I'm in! My coach programmed tempo intervals too. We can draft together on the flat sections.", time: "8:24 AM", reactions: ["💪"] },
  { id: 3, athlete: ATHLETES[3], text: "Count me in. I'll bring the tailwind 😂 Also — anyone else getting their Garmin data synced late? Mine took 6 hours yesterday.", time: "8:31 AM", reactions: [] },
  { id: 4, athlete: ATHLETES[1], text: "Yeah Garmin Connect has been slow. TrainingPeaks picked it up faster for me. Let's meet at the parking lot by the camel crossing.", time: "8:45 AM", reactions: ["👍", "👍"] },
  { id: 5, athlete: ATHLETES[0], text: "See you all there! I'll have my live location on so you can track me if I drop off the back 😅", time: "9:02 AM", reactions: ["😂", "🔥"] },
];

// Simulated GPS routes (Dubai Al Qudra area)
const ROUTES = {
  1: { lat: 25.0657, lng: 55.3076, heading: 45, speed: 31.2 },
  2: { lat: 25.0612, lng: 55.3134, heading: 48, speed: 29.8 },
  3: { lat: 25.0589, lng: 55.3201, heading: 52, speed: 33.1 },
  4: { lat: 25.0543, lng: 55.3098, heading: 38, speed: 27.4 },
};

// --- ZONE COLORS ---
const ZONE_COLORS = {
  "Z1": "#3B82F6",
  "Z1-Z2": "#60A5FA",
  "Z2": "#22C55E",
  "Z3": "#F59E0B",
  "Z3-Z4": "#F97316",
  "Z4": "#EF4444",
  "Z5": "#DC2626",
};

const getZoneColor = (zone) => {
  return ZONE_COLORS[zone] || "#94A3B8";
};

const getBlockColor = (type) => {
  const map = {
    warmup: "#60A5FA",
    interval: "#F59E0B",
    recovery: "#3B82F6",
    endurance: "#22C55E",
    cooldown: "#818CF8",
  };
  return map[type] || "#94A3B8";
};

// --- STYLES ---
const fonts = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

// --- COMPONENTS ---

function TabBar({ active, onChange }) {
  const tabs = [
    { id: "plan", icon: "📋", label: "Plan" },
    { id: "live", icon: "📡", label: "Live" },
    { id: "chat", icon: "💬", label: "Chat" },
  ];
  return (
    <div style={{
      display: "flex", gap: 4, background: "rgba(15,15,20,0.95)",
      borderRadius: 16, padding: 4, backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.06)"
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, padding: "10px 16px", borderRadius: 12, border: "none",
          background: active === t.id ? "linear-gradient(135deg, #FF5722, #FF7043)" : "transparent",
          color: active === t.id ? "#fff" : "rgba(255,255,255,0.45)",
          fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13,
          cursor: "pointer", transition: "all 0.3s ease",
          boxShadow: active === t.id ? "0 4px 20px rgba(255,87,34,0.3)" : "none"
        }}>
          <span style={{ fontSize: 16 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function WeekStrip() {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {WEEK_DAYS.map((d, i) => (
        <div key={i} style={{
          flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 12,
          background: d.active
            ? "linear-gradient(180deg, rgba(255,87,34,0.2), rgba(255,87,34,0.05))"
            : "rgba(255,255,255,0.03)",
          border: d.active ? "1px solid rgba(255,87,34,0.4)" : "1px solid rgba(255,255,255,0.05)",
          transition: "all 0.3s"
        }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>
            {d.day}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700,
            color: d.active ? "#FF5722" : "rgba(255,255,255,0.6)",
            margin: "2px 0"
          }}>{d.date}</div>
          <div style={{
            fontSize: 9, fontWeight: 600,
            color: d.type === "Rest" ? "rgba(255,255,255,0.2)" : d.active ? "#FF7043" : "rgba(255,255,255,0.35)",
            textTransform: "uppercase", letterSpacing: 0.5
          }}>{d.type}</div>
        </div>
      ))}
    </div>
  );
}

function TrainingBlock({ block, index, total }) {
  const pct = ((index + 1) / total) * 100;
  return (
    <div style={{
      display: "flex", gap: 12, padding: "14px 16px", marginBottom: 2,
      background: "rgba(255,255,255,0.02)",
      borderLeft: `3px solid ${getBlockColor(block.type)}`,
      borderRadius: "0 10px 10px 0",
      transition: "all 0.2s",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        width: `${pct}%`, background: `${getBlockColor(block.type)}08`,
        transition: "width 0.5s"
      }} />
      <div style={{ minWidth: 52, textAlign: "center", position: "relative" }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: getZoneColor(block.zone),
          fontFamily: "'JetBrains Mono', monospace",
          background: `${getZoneColor(block.zone)}15`,
          padding: "3px 8px", borderRadius: 6
        }}>{block.zone}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{block.duration}</div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{block.label}</span>
          <span style={{
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            color: getBlockColor(block.type), fontWeight: 600
          }}>{block.power}</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3, lineHeight: 1.4 }}>
          {block.description}
        </div>
      </div>
    </div>
  );
}

function PlanView() {
  const p = TRAINING_PLAN;
  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <WeekStrip />

      {/* Header Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,87,34,0.12), rgba(255,87,34,0.03))",
        borderRadius: 16, padding: 20, marginBottom: 16,
        border: "1px solid rgba(255,87,34,0.15)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -20, right: -20, width: 120, height: 120,
          borderRadius: "50%", background: "rgba(255,87,34,0.06)"
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              {p.date}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>
              {p.title}
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, color: "#FF7043", fontWeight: 600,
              background: "rgba(255,87,34,0.15)", padding: "3px 10px", borderRadius: 20,
              textTransform: "uppercase", letterSpacing: 1
            }}>
              ⚡ {p.source}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
          {[
            { label: "TSS", value: p.tss, unit: "" },
            { label: "Duration", value: p.duration, unit: "" },
            { label: "Distance", value: p.distance, unit: "" },
            { label: "IF", value: p.ifactor, unit: "" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coach Notes */}
      <div style={{
        background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 16px",
        marginBottom: 16, border: "1px solid rgba(255,255,255,0.05)",
        display: "flex", gap: 10, alignItems: "flex-start"
      }}>
        <span style={{ fontSize: 16 }}>📝</span>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontStyle: "italic" }}>
          {p.notes}
        </div>
      </div>

      {/* Workout Blocks */}
      <div style={{ marginBottom: 8 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, paddingLeft: 4
        }}>Workout Structure</div>
        <div style={{
          background: "rgba(255,255,255,0.02)", borderRadius: 14, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          {p.blocks.map((b, i) => (
            <TrainingBlock key={i} block={b} index={i} total={p.blocks.length} />
          ))}
        </div>
      </div>

      {/* Zone Legend */}
      <div style={{
        display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 0",
        justifyContent: "center"
      }}>
        {["Z1", "Z2", "Z3", "Z4", "Z5"].map(z => (
          <div key={z} style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 10, color: "rgba(255,255,255,0.4)"
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 3, background: getZoneColor(z) }} />
            {z}
          </div>
        ))}
      </div>

      {/* Garmin / TP Sync */}
      <div style={{
        display: "flex", gap: 8, marginTop: 8
      }}>
        {["Garmin Connect", "TrainingPeaks"].map(s => (
          <div key={s} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "12px 16px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500,
            cursor: "pointer"
          }}>
            <span style={{ fontSize: 8, color: "#4CAF50" }}>●</span>
            {s}
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Synced</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveMap() {
  const [positions, setPositions] = useState(ROUTES);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(e => e + 1);
      setPositions(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const p = next[id];
          next[id] = {
            ...p,
            lat: p.lat + (Math.random() - 0.48) * 0.0004,
            lng: p.lng + (Math.random() - 0.45) * 0.0005,
            speed: Math.max(18, Math.min(42, p.speed + (Math.random() - 0.5) * 2)),
          };
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Map Container */}
      <div style={{
        position: "relative", borderRadius: 18, overflow: "hidden",
        height: 340, background: "#0a1628",
        border: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 16
      }}>
        {/* Simulated map grid */}
        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            <radialGradient id="mapGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(255,87,34,0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#mapGlow)" />

          {/* Simulated road lines */}
          <path d="M 50,320 Q 150,200 280,180 T 500,100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="8,6" />
          <path d="M 20,200 Q 180,250 350,150 T 520,220" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <path d="M 100,340 Q 200,280 320,240 T 480,170" fill="none" stroke="rgba(255,87,34,0.12)" strokeWidth="3" />

          {/* Route label */}
          <text x="300" y="290" fill="rgba(255,255,255,0.1)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">AL QUDRA CYCLING TRACK</text>
        </svg>

        {/* Athlete dots */}
        {ATHLETES.map((a, i) => {
          const pos = positions[a.id];
          if (!pos) return null;
          const x = 80 + i * 100 + Math.sin(elapsed * 0.3 + i) * 20;
          const y = 120 + i * 40 + Math.cos(elapsed * 0.2 + i) * 15;
          return (
            <div key={a.id} onClick={() => setSelectedAthlete(selectedAthlete === a.id ? null : a.id)}
              style={{
                position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)",
                cursor: "pointer", transition: "all 1.8s ease",
                zIndex: selectedAthlete === a.id ? 10 : 1
              }}>
              {/* Pulse ring */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: 40, height: 40, borderRadius: "50%",
                border: `2px solid ${a.color}`,
                opacity: 0.3, animation: "pulse 2s infinite"
              }} />
              {/* Dot */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${a.color}, ${a.color}88)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, boxShadow: `0 0 20px ${a.color}44`,
                border: selectedAthlete === a.id ? "2px solid #fff" : "2px solid transparent"
              }}>{a.avatar}</div>
              {/* Name label */}
              <div style={{
                position: "absolute", top: "100%", left: "50%",
                transform: "translateX(-50%)", marginTop: 4,
                fontSize: 9, fontWeight: 700, color: a.color,
                whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace",
                background: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: 4
              }}>{a.name}</div>
            </div>
          );
        })}

        {/* Live badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
          padding: "6px 12px", borderRadius: 20,
          border: "1px solid rgba(239,68,68,0.3)"
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#EF4444",
            animation: "pulse 1.5s infinite"
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
        </div>

        {/* Timer */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
          padding: "6px 12px", borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Map attribution */}
        <div style={{
          position: "absolute", bottom: 8, right: 12,
          fontSize: 9, color: "rgba(255,255,255,0.2)"
        }}>
          Connect Garmin for real GPS data
        </div>
      </div>

      {/* Athlete Cards */}
      <div style={{
        fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase", letterSpacing: 2, marginBottom: 10
      }}>Athletes on ride</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ATHLETES.map(a => {
          const pos = positions[a.id];
          return (
            <div key={a.id} onClick={() => setSelectedAthlete(selectedAthlete === a.id ? null : a.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: 14,
                background: selectedAthlete === a.id
                  ? `linear-gradient(135deg, ${a.color}18, ${a.color}08)`
                  : "rgba(255,255,255,0.02)",
                border: selectedAthlete === a.id
                  ? `1px solid ${a.color}40`
                  : "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer", transition: "all 0.3s"
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${a.color}30, ${a.color}10)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18
              }}>{a.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{a.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  {pos?.lat.toFixed(4)}°N, {pos?.lng.toFixed(4)}°E
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: a.color,
                  fontFamily: "'JetBrains Mono', monospace"
                }}>{pos?.speed.toFixed(1)}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>km/h</div>
              </div>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#4CAF50", boxShadow: "0 0 8px rgba(76,175,80,0.5)"
              }} />
            </div>
          );
        })}
      </div>

      {/* Data Source */}
      <div style={{
        display: "flex", gap: 8, marginTop: 16
      }}>
        {["Garmin LiveTrack", "TrainingPeaks Live"].map(s => (
          <div key={s} style={{
            flex: 1, textAlign: "center", padding: "10px 12px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500
          }}>
            <span style={{ color: "#4CAF50", marginRight: 4 }}>●</span>{s}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatView() {
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), athlete: ATHLETES[0],
      text: input, time: "Now", reactions: []
    }]);
    setInput("");
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 500 }}>
      {/* Chat Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", borderRadius: 14, marginBottom: 12,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ fontSize: 20 }}>🚴‍♂️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Al Qudra Ride Group</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {ATHLETES.length} athletes · {ATHLETES.length} online
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {ATHLETES.map((a, i) => (
            <div key={a.id} style={{
              width: 24, height: 24, borderRadius: "50%",
              background: `linear-gradient(135deg, ${a.color}, ${a.color}88)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, marginLeft: i > 0 ? -6 : 0,
              border: "2px solid #0a0a0f", zIndex: ATHLETES.length - i
            }}>{a.avatar}</div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12,
        paddingRight: 4, marginBottom: 12
      }}>
        {/* Ride info card */}
        <div style={{
          alignSelf: "center", background: "rgba(255,87,34,0.08)",
          border: "1px solid rgba(255,87,34,0.15)", borderRadius: 12,
          padding: "8px 16px", fontSize: 11, color: "rgba(255,255,255,0.5)",
          textAlign: "center"
        }}>
          🗓 Tomorrow's Ride — Al Qudra Loop · 68km · 5:30 AM
        </div>

        {messages.map(m => {
          const isMe = m.athlete.id === 1;
          return (
            <div key={m.id} style={{
              display: "flex", gap: 8,
              flexDirection: isMe ? "row-reverse" : "row",
              alignItems: "flex-end"
            }}>
              {!isMe && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${m.athlete.color}30, ${m.athlete.color}10)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, flexShrink: 0
                }}>{m.athlete.avatar}</div>
              )}
              <div style={{ maxWidth: "75%" }}>
                {!isMe && (
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: m.athlete.color,
                    marginBottom: 3, paddingLeft: 4
                  }}>{m.athlete.name}</div>
                )}
                <div style={{
                  padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: isMe
                    ? "linear-gradient(135deg, #FF5722, #FF7043)"
                    : "rgba(255,255,255,0.06)",
                  color: isMe ? "#fff" : "rgba(255,255,255,0.85)",
                  fontSize: 13, lineHeight: 1.5
                }}>
                  {m.text}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginTop: 4,
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0
                }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{m.time}</span>
                  {m.reactions.length > 0 && (
                    <div style={{
                      display: "flex", gap: 2, background: "rgba(255,255,255,0.05)",
                      padding: "1px 6px", borderRadius: 10, fontSize: 12
                    }}>
                      {m.reactions.map((r, i) => <span key={i}>{r}</span>)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEnd} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex", gap: 8, padding: "8px",
        background: "rgba(255,255,255,0.03)", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)"
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Message the group..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: 13, fontFamily: "'Outfit', sans-serif",
            padding: "8px 12px"
          }}
        />
        <button onClick={send} style={{
          background: input.trim() ? "linear-gradient(135deg, #FF5722, #FF7043)" : "rgba(255,255,255,0.06)",
          border: "none", borderRadius: 12, padding: "8px 16px",
          color: input.trim() ? "#fff" : "rgba(255,255,255,0.2)",
          fontWeight: 700, fontSize: 13, cursor: "pointer",
          transition: "all 0.2s", fontFamily: "'Outfit', sans-serif"
        }}>
          Send
        </button>
      </div>
    </div>
  );
}

// --- MAIN APP ---
export default function AthleteHub() {
  const [tab, setTab] = useState("plan");

  return (
    <>
      <style>{fonts}{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%,-50%) scale(1); }
          50% { opacity: 0.1; transform: translate(-50%,-50%) scale(1.6); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0f, #111118, #0a0a0f)",
        fontFamily: "'Outfit', sans-serif",
        color: "#fff",
        maxWidth: 480,
        margin: "0 auto",
        padding: "16px 16px 24px"
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20, padding: "0 2px"
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase", letterSpacing: 3, marginBottom: 4
            }}>VO2 Athletes Hub</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              <span style={{ color: "#FF5722" }}>VO2</span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}> RideSync</span>
            </div>
          </div>
          <img
            src="data:image/png;base64,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"
            alt="VO2 Performance"
            style={{
              height: 42, width: "auto", objectFit: "contain",
              filter: "drop-shadow(0 0 8px rgba(255,87,34,0.3))"
            }}
          />
        </div>

        {/* Tab Bar */}
        <div style={{ marginBottom: 20 }}>
          <TabBar active={tab} onChange={setTab} />
        </div>

        {/* Content */}
        {tab === "plan" && <PlanView />}
        {tab === "live" && <LiveMap />}
        {tab === "chat" && <ChatView />}
      </div>
    </>
  );
}
