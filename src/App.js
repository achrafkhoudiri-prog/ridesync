import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthScreen from './AuthScreen';
import PlanView from './PlanView';
import LiveView from './LiveView';
import ChatView from './ChatView';

const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  background: #0a0a0f;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100%;
}

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes livePulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%,-50%) scale(1); }
  50%       { opacity: 0.08; transform: translate(-50%,-50%) scale(1.7); }
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes slowSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes expandIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes tabSlide {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255,87,34,0.2); }
  50% { box-shadow: 0 0 40px rgba(255,87,34,0.45); }
}
`;

const TABS = [
  { id: 'plan', icon: '📋', label: 'Plan' },
  { id: 'live', icon: '📡', label: 'Live' },
  { id: 'chat', icon: '💬', label: 'Chat' },
];

function AppShell() {
  const { session, profile, signOut } = useAuth();
  const [tab, setTab] = useState('plan');
  const [menuOpen, setMenuOpen] = useState(false);

  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid rgba(255,87,34,0.3)',
          borderTopColor: '#FF5722', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f18 50%, #0a0a0f 100%)',
      fontFamily: "'Outfit', sans-serif",
      color: '#fff',
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
      paddingBottom: 90,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div>
          <div style={{
            fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.22)',
            textTransform: 'uppercase', letterSpacing: 3, marginBottom: 3,
          }}>VO2 Performance</div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
            <span style={{ color: '#FF5722' }}>VO2</span>
            <span style={{ color: 'rgba(255,255,255,0.9)' }}> RideSync</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.22)',
            padding: '5px 11px', borderRadius: 20,
            fontSize: 10, fontWeight: 700, color: '#4CAF50',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4CAF50',
              animation: 'livePulse 1.8s ease-in-out infinite',
            }} />
            LIVE
          </div>

          <div
            onClick={() => setMenuOpen(o => !o)}
            style={{
              width: 36, height: 36, borderRadius: 11, cursor: 'pointer',
              background: `linear-gradient(135deg, ${profile?.color || '#FF5722'}40, ${profile?.color || '#FF5722'}15)`,
              border: `1.5px solid ${profile?.color || '#FF5722'}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}
          >
            {profile?.avatar_emoji || '🚴'}
          </div>
        </div>
      </div>

      {/* Profile dropdown */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
          <div style={{
            position: 'fixed', top: 70, right: 18, zIndex: 200,
            background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '8px', minWidth: 180,
            boxShadow: '0 16px 50px rgba(0,0,0,0.6)',
            animation: 'popIn 0.18s ease',
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{profile?.full_name || 'Athlete'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>VO2 Performance</div>
            </div>
            <button onClick={() => { signOut(); setMenuOpen(false); }} style={{
              width: '100%', padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, cursor: 'pointer',
              color: '#EF4444', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              textAlign: 'left',
            }}>
              Sign Out
            </button>
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div key={tab} style={{ animation: 'tabSlide 0.3s ease' }}>
          {tab === 'plan' && <PlanView />}
          {tab === 'live' && <LiveView />}
          {tab === 'chat' && <ChatView />}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        padding: '10px 16px 20px',
        background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        zIndex: 100,
      }}>
        <div style={{
          display: 'flex', gap: 5,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 18, padding: '5px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 7, padding: '11px 8px', borderRadius: 14, border: 'none',
                background: active
                  ? 'linear-gradient(135deg, #FF5722, #FF7043)'
                  : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.38)',
                fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: active ? '0 6px 24px rgba(255,87,34,0.35)' : 'none',
                transform: active ? 'scale(1.02)' : 'scale(1)',
              }}>
                <span style={{ fontSize: 17 }}>{t.icon}</span>
                {active && <span>{t.label}</span>}
                }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </>
  );
}
