import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const MOCK_ATHLETES = [
  { id: 'a1', full_name: 'Sarah K.',  avatar_emoji: '🚴‍♀️', color: '#4CAF50' },
  { id: 'a2', full_name: 'Marco P.',  avatar_emoji: '🚴‍♂️', color: '#2196F3' },
  { id: 'a3', full_name: 'Lina W.',   avatar_emoji: '🚴‍♀️', color: '#FF9800' },
];

const INITIAL_POSITIONS = {
  a1: { lat: 25.0657, lng: 55.3076, speed: 31.2, x: 90,  y: 110 },
  a2: { lat: 25.0612, lng: 55.3134, speed: 29.8, x: 200, y: 155 },
  a3: { lat: 25.0589, lng: 55.3201, speed: 33.1, x: 310, y: 180 },
};

export default function LiveView() {
  const { profile } = useAuth();
  const [positions, setPositions] = useState(INITIAL_POSITIONS);
  const [myPos, setMyPos] = useState({ lat: 25.0643, lng: 55.3010, speed: 27.4, x: 60, y: 200 });
  const [elapsed, setElapsed] = useState(0);
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);
  const [zoom, setZoom] = useState(1); // eslint-disable-line no-unused-vars
  const mapRef = useRef(null);
  const tickRef = useRef(0);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(e => e + 1);
      tickRef.current += 1;
      setPositions(prev => {
        const next = {};
        Object.keys(prev).forEach(id => {
          const p = prev[id];
          next[id] = {
            ...p,
            lat: p.lat + (Math.random() - 0.48) * 0.0003,
            lng: p.lng + (Math.random() - 0.45) * 0.0004,
            speed: Math.max(18, Math.min(42, p.speed + (Math.random() - 0.5) * 1.5)),
            x: Math.max(20, Math.min(360, p.x + (Math.random() - 0.48) * 6)),
            y: Math.max(20, Math.min(310, p.y + (Math.random() - 0.45) * 4)),
          };
        });
        return next;
      });
      setMyPos(prev => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.47) * 0.0003,
        lng: prev.lng + (Math.random() - 0.44) * 0.0004,
        speed: Math.max(18, Math.min(42, prev.speed + (Math.random() - 0.5) * 1.5)),
        x: Math.max(20, Math.min(360, prev.x + (Math.random() - 0.47) * 5)),
        y: Math.max(20, Math.min(310, prev.y + (Math.random() - 0.44) * 4)),
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = s => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const myName = profile?.full_name || 'You';
  const myColor = profile?.color || '#FF5722';
  const myEmoji = profile?.avatar_emoji || '🚴';

  const allAthletes = [
    { id: 'me', full_name: myName, avatar_emoji: myEmoji, color: myColor, pos: myPos },
    ...MOCK_ATHLETES.map(a => ({ ...a, pos: positions[a.id] })),
  ];

  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease' }}>

      {/* Map */}
      <div ref={mapRef} style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        height: 320, background: '#071220',
        border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16,
        boxShadow: '0 16px 60px rgba(0,0,0,0.5)',
      }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <pattern id="mapgrid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
            </pattern>
            <radialGradient id="mapglow" cx="50%" cy="60%">
              <stop offset="0%" stopColor="rgba(255,87,34,0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="blur">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapgrid)" />
          <rect width="100%" height="100%" fill="url(#mapglow)" />
          {/* Simulated roads */}
          <path d="M 30,300 Q 120,210 240,190 T 420,110" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 15,180 Q 150,235 300,155 T 450,200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" strokeDasharray="10,7" />
          <path d="M 80,310 Q 180,260 300,225 T 460,160" fill="none" stroke="rgba(255,87,34,0.1)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 100,80 Q 200,140 320,150 T 440,260" fill="none" stroke="rgba(33,150,243,0.06)" strokeWidth="2" />
          {/* Route glow */}
          <path d="M 30,300 Q 120,210 240,190 T 420,110" fill="none" stroke="rgba(255,87,34,0.04)" strokeWidth="12" filter="url(#blur)" />
          {/* Label */}
          <text x="240" y="280" fill="rgba(255,255,255,0.06)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" letterSpacing="2">AL QUDRA CYCLING TRACK · DUBAI</text>
        </svg>

        {/* Athlete dots */}
        {allAthletes.map((a) => (
          <div
            key={a.id}
            onClick={() => setSelected(selected === a.id ? null : a.id)}
            style={{
              position: 'absolute',
              left: a.pos.x,
              top: a.pos.y,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: selected === a.id ? 20 : 5,
              transition: 'left 1.6s ease, top 1.6s ease',
            }}
          >
            {/* Outer pulse */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 44, height: 44, borderRadius: '50%',
              border: `1.5px solid ${a.color}`,
              opacity: 0.25,
              animation: 'livePulse 2s ease-in-out infinite',
              animationDelay: `${Math.random() * 1}s`,
            }} />
            {/* Inner dot */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${a.color}ff, ${a.color}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15,
              boxShadow: selected === a.id
                ? `0 0 0 2px #fff, 0 0 24px ${a.color}88`
                : `0 0 16px ${a.color}55`,
              transition: 'box-shadow 0.3s',
            }}>{a.avatar_emoji}</div>
            {/* Name tag */}
            {selected === a.id && (
              <div style={{
                position: 'absolute', top: '110%', left: '50%',
                transform: 'translateX(-50%)', marginTop: 4,
                fontSize: 10, fontWeight: 700, color: '#fff',
                whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace",
                background: `${a.color}cc`, padding: '3px 8px', borderRadius: 6,
                animation: 'popIn 0.2s ease',
              }}>
                {a.full_name} · {a.pos.speed.toFixed(1)} km/h
              </div>
            )}
          </div>
        ))}

        {/* LIVE badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)',
          padding: '6px 13px', borderRadius: 20,
          border: '1px solid rgba(239,68,68,0.35)',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'livePulse 1.4s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#EF4444', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1.5 }}>LIVE</span>
        </div>

        {/* Timer */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)',
          padding: '6px 13px', borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Zoom controls */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {['+', '−'].map((c, i) => (
            <button key={i} onClick={() => setZoom(z => Math.max(0.7, Math.min(2, z + (i === 0 ? 0.2 : -0.2))))} style={{
              width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{c}</button>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 9, color: 'rgba(255,255,255,0.15)', fontFamily: "'JetBrains Mono', monospace" }}>
          Connect Garmin for real GPS
        </div>
      </div>

      {/* Section label */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 10 }}>
        Athletes on Ride
      </div>

      {/* Athlete rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {allAthletes.map(a => (
          <div
            key={a.id}
            onClick={() => setSelected(selected === a.id ? null : a.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 15px', borderRadius: 15,
              background: selected === a.id
                ? `linear-gradient(135deg, ${a.color}18, ${a.color}06)`
                : 'rgba(255,255,255,0.025)',
              border: selected === a.id ? `1px solid ${a.color}45` : '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer', transition: 'all 0.28s',
              transform: selected === a.id ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: `linear-gradient(135deg, ${a.color}35, ${a.color}12)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
              boxShadow: `0 0 12px ${a.color}30`,
            }}>{a.avatar_emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{a.full_name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                {a.pos.lat.toFixed(4)}°N · {a.pos.lng.toFixed(4)}°E
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: a.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {a.pos.speed.toFixed(1)}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.5 }}>km/h</div>
            </div>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#4CAF50', boxShadow: '0 0 8px rgba(76,175,80,0.6)',
              marginLeft: 4,
            }} />
          </div>
        ))}
      </div>

      {/* Data sources */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {['Garmin LiveTrack', 'TrainingPeaks Live'].map(s => (
          <div key={s} style={{
            flex: 1, textAlign: 'center', padding: '11px 8px', borderRadius: 13,
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
            fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500,
          }}>
            <span style={{ color: '#4CAF50', marginRight: 4 }}>●</span>{s}
          </div>
        ))}
      </div>
    </div>
  );
}
