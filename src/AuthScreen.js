import { useState } from 'react';
import { useAuth } from './AuthContext';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255,87,34,0.3); }
  50% { box-shadow: 0 0 40px rgba(255,87,34,0.6); }
}
`;

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        if (!fullName.trim()) { setError('Name is required'); setLoading(false); return; }
        await signUp(email, password, fullName);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #070710 0%, #0d0d1a 40%, #0a0a0f 100%)',
        fontFamily: "'Outfit', sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,87,34,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(33,150,243,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%', maxWidth: '400px',
          animation: 'fadeIn 0.6s ease',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              fontSize: '52px', marginBottom: '12px',
              display: 'inline-block', animation: 'float 3s ease-in-out infinite',
            }}>🚴‍♂️</div>
            <div style={{
              fontSize: '10px', fontWeight: 700,
              color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
              letterSpacing: '4px', marginBottom: '6px',
            }}>VO2 Performance</div>
            <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              <span style={{ color: '#FF5722' }}>VO2</span>
              <span style={{ color: 'rgba(255,255,255,0.9)' }}> RideSync</span>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
              Your cycling team. Connected.
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '20px', padding: '32px 28px',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            animation: 'glow 3s ease-in-out infinite',
          }}>
            {/* Mode Toggle */}
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px', padding: '4px', marginBottom: '28px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                  flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                  background: mode === m ? 'linear-gradient(135deg, #FF5722, #FF7043)' : 'transparent',
                  color: mode === m ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  boxShadow: mode === m ? '0 4px 16px rgba(255,87,34,0.3)' : 'none',
                }}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={submit}>
              {mode === 'signup' && (
                <InputField
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="e.g. Sarah Kim"
                  icon="👤"
                />
              )}
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@vo2performance.com"
                icon="📧"
              />
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                icon="🔒"
              />

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
                  fontSize: '13px', color: '#EF4444',
                }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(255,87,34,0.4)' : 'linear-gradient(135deg, #FF5722, #FF7043)',
                border: 'none', borderRadius: '13px',
                color: '#fff', fontFamily: "'Outfit', sans-serif",
                fontWeight: 700, fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 6px 24px rgba(255,87,34,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                {loading ? (
                  <>
                    <div style={{
                      width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    }} />
                    Loading…
                  </>
                ) : (
                  mode === 'login' ? 'Sign In to RideSync' : 'Join the Team'
                )}
              </button>
            </form>
          </div>

          <div style={{
            textAlign: 'center', marginTop: '24px',
            fontSize: '11px', color: 'rgba(255,255,255,0.15)',
          }}>
            VO2 Performance © 2026 · RideSync
          </div>
        </div>
      </div>
    </>
  );
}

function InputField({ label, type, value, onChange, placeholder, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 600,
        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
        letterSpacing: '1.5px', marginBottom: '6px',
      }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: focused ? 'rgba(255,87,34,0.06)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(255,87,34,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '12px', transition: 'all 0.3s', padding: '0 14px',
      }}>
        <span style={{ fontSize: '16px', marginRight: '8px', opacity: 0.6 }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontFamily: "'Outfit', sans-serif",
            fontSize: '14px', padding: '13px 0',
          }}
        />
      </div>
    </div>
  );
}
