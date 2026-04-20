import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TRAINING_PLAN = {
  date: 'Monday, April 20',
  title: 'Endurance Base + Tempo Intervals',
  source: 'TrainingPeaks',
  tss: 112,
  duration: '2h 15min',
  distance: '68 km',
  ifactor: 0.78,
  notes:
    'Focus on steady cadence during tempo blocks. Stay in zone 2 for recovery intervals. Hydrate every 20 min.',
  blocks: [
    { type: 'warmup',   label: 'Warm-Up',       duration: '20 min', zone: 'Z1-Z2', description: 'Easy spin, gradually increase cadence to 90rpm', power: '120-160W' },
    { type: 'interval', label: 'Tempo Block 1',  duration: '15 min', zone: 'Z3',   description: 'Steady tempo at 88-92rpm, flat terrain',          power: '210-240W' },
    { type: 'recovery', label: 'Recovery',       duration: '5 min',  zone: 'Z1',   description: 'Easy spin, hydrate',                              power: '100-130W' },
    { type: 'interval', label: 'Tempo Block 2',  duration: '15 min', zone: 'Z3',   description: 'Tempo with slight grade, seated climbing',         power: '220-250W' },
    { type: 'recovery', label: 'Recovery',       duration: '5 min',  zone: 'Z1',   description: 'Easy spin, nutrition',                            power: '100-130W' },
    { type: 'interval', label: 'Tempo Block 3',  duration: '15 min', zone: 'Z3-Z4',description: 'Progressive tempo, last 3 min push to sweet spot',power: '230-265W' },
    { type: 'recovery', label: 'Recovery',       duration: '5 min',  zone: 'Z1',   description: 'Easy spin',                                       power: '100-130W' },
    { type: 'endurance',label: 'Endurance Ride', duration: '35 min', zone: 'Z2',   description: 'Steady endurance pace, practice aero position',    power: '160-195W' },
    { type: 'cooldown', label: 'Cool Down',      duration: '10 min', zone: 'Z1',   description: 'Easy spin, stretch after',                        power: '90-120W'  },
  ],
};

const WEEK_DAYS = [
  { day: 'Mon', date: '20', active: true,  type: 'Tempo' },
  { day: 'Tue', date: '21', active: false, type: 'Rest' },
  { day: 'Wed', date: '22', active: false, type: 'VO2max' },
  { day: 'Thu', date: '23', active: false, type: 'Easy' },
  { day: 'Fri', date: '24', active: false, type: 'Rest' },
  { day: 'Sat', date: '25', active: false, type: 'Long' },
  { day: 'Sun', date: '26', active: false, type: 'Recovery' },
];

const ZONE_COLORS = {
  'Z1': '#3B82F6', 'Z1-Z2': '#60A5FA', 'Z2': '#22C55E',
  'Z3': '#F59E0B', 'Z3-Z4': '#F97316', 'Z4': '#EF4444', 'Z5': '#DC2626',
};
const BLOCK_COLORS = {
  warmup: '#60A5FA', interval: '#F59E0B', recovery: '#3B82F6',
  endurance: '#22C55E', cooldown: '#818CF8',
};

export default function PlanView() {
  useAuth();
  const [visible, setVisible] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [syncPulse, setSyncPulse] = useState(false);
  const p = TRAINING_PLAN;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setSyncPulse(true);
      setTimeout(() => setSyncPulse(false), 1000);
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease' }}>
      {/* Week Strip */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
        {WEEK_DAYS.map((d, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '8px 3px', borderRadius: 12,
            background: d.active
              ? 'linear-gradient(180deg, rgba(255,87,34,0.18), rgba(255,87,34,0.04))'
              : 'rgba(255,255,255,0.03)',
            border: d.active ? '1px solid rgba(255,87,34,0.4)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.3s', cursor: 'pointer',
            transform: d.active ? 'scale(1.04)' : 'scale(1)',
          }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{d.day}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: d.active ? '#FF5722' : 'rgba(255,255,255,0.55)', margin: '2px 0' }}>{d.date}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: d.type === 'Rest' ? 'rgba(255,255,255,0.18)' : d.active ? '#FF7043' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{d.type}</div>
          </div>
        ))}
      </div>

      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,87,34,0.14), rgba(255,87,34,0.03))',
        borderRadius: 18, padding: 20, marginBottom: 14,
        border: '1px solid rgba(255,87,34,0.18)',
        position: 'relative', overflow: 'hidden',
        transition: 'box-shadow 0.4s',
        boxShadow: '0 8px 40px rgba(255,87,34,0.08)',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 140, height: 140,
          borderRadius: '50%', background: 'rgba(255,87,34,0.06)',
          transition: 'transform 0.6s', animation: 'slowSpin 20s linear infinite',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>{p.date}</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 10 }}>{p.title}</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10, color: '#FF7043', fontWeight: 700,
            background: 'rgba(255,87,34,0.12)', padding: '4px 12px', borderRadius: 20,
            textTransform: 'uppercase', letterSpacing: 1.2,
          }}>
            ⚡ {p.source}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 0, marginTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          {[
            { label: 'TSS', value: p.tss },
            { label: 'Duration', value: p.duration },
            { label: 'Distance', value: p.distance },
            { label: 'IF', value: p.ifactor },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: i === 0 ? 'left' : 'center', paddingRight: 8 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "'JetBrains Mono', monospace", marginTop: 3 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Bar */}
      <div style={{
        display: 'flex', height: 6, borderRadius: 6, overflow: 'hidden',
        marginBottom: 14, gap: 2,
      }}>
        {p.blocks.map((b, i) => (
          <div key={i} style={{
            flex: parseInt(b.duration) || 1,
            background: BLOCK_COLORS[b.type] || '#94A3B8',
            borderRadius: 3, transition: 'flex 0.5s ease',
          }} />
        ))}
      </div>

      {/* Coach Notes */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '13px 15px',
        marginBottom: 14, border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>📝</span>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontStyle: 'italic' }}>
          {p.notes}
        </div>
      </div>

      {/* Workout Blocks */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 10 }}>
          Workout Structure
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
          {p.blocks.map((b, i) => (
            <WorkoutBlock
              key={i} block={b} index={i}
              expanded={expandedBlock === i}
              onToggle={() => setExpandedBlock(expandedBlock === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* Zone Legend */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '12px 2px', justifyContent: 'center' }}>
        {['Z1', 'Z2', 'Z3', 'Z4', 'Z5'].map(z => (
          <div key={z} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ width: 9, height: 9, borderRadius: 3, background: ZONE_COLORS[z] }} />
            {z}
          </div>
        ))}
      </div>

      {/* Sync Status */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {['Garmin Connect', 'TrainingPeaks'].map(s => (
          <div key={s} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '12px 8px', borderRadius: 13,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.3s',
          }}>
            <span style={{
              fontSize: 8, color: '#4CAF50',
              boxShadow: syncPulse ? '0 0 8px rgba(76,175,80,0.8)' : 'none',
              transition: 'box-shadow 0.3s',
            }}>●</span>
            {s}
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)' }}>Synced</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutBlock({ block, index, expanded, onToggle }) {
  const color = BLOCK_COLORS[block.type] || '#94A3B8';
  const zoneColor = ZONE_COLORS[block.zone] || '#94A3B8';

  return (
    <div
      onClick={onToggle}
      style={{
        borderLeft: `3px solid ${color}`,
        background: expanded ? `${color}0d` : 'transparent',
        transition: 'background 0.25s',
        cursor: 'pointer',
        borderBottom: index < 8 ? '1px solid rgba(255,255,255,0.03)' : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 12, padding: '13px 15px', alignItems: 'center' }}>
        <div style={{ minWidth: 50, textAlign: 'center' }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: zoneColor,
            fontFamily: "'JetBrains Mono', monospace",
            background: `${zoneColor}18`, padding: '3px 7px', borderRadius: 6,
          }}>{block.zone}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>{block.duration}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{block.label}</span>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color, fontWeight: 600 }}>{block.power}</span>
          </div>
          {expanded && (
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 5, lineHeight: 1.5,
              animation: 'expandIn 0.2s ease',
            }}>
              {block.description}
            </div>
          )}
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.2)', fontSize: 11,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s',
        }}>▾</div>
      </div>
    </div>
  );
}
