import { useState, useEffect, useRef } from 'react';
import { supabase, DEFAULT_ROOM_ID } from './supabase';
import { useAuth } from './AuthContext';

const EMOJI_REACTIONS = ['👍', '🔥', '💪', '😂', '🚴', '⚡'];

const SEED_MESSAGES = [
  { id: 's1', user_id: 'u2', text: "Anyone up for the Al Qudra loop at 5:30 AM tomorrow? Route looks perfect for tempo work.", created_at: new Date(Date.now() - 3600000 * 2).toISOString(), reactions: ['👍', '🔥'], profile: { full_name: 'Sarah K.', avatar_emoji: '🚴‍♀️', color: '#4CAF50' } },
  { id: 's2', user_id: 'u3', text: "I'm in! My coach programmed tempo intervals too. We can draft together on the flat sections.", created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(), reactions: ['💪'], profile: { full_name: 'Marco P.', avatar_emoji: '🚴‍♂️', color: '#2196F3' } },
  { id: 's3', user_id: 'u4', text: "Count me in. I'll bring the tailwind 😂 Also — anyone else getting their Garmin data synced late? Mine took 6 hours yesterday.", created_at: new Date(Date.now() - 3600000).toISOString(), reactions: [], profile: { full_name: 'Lina W.', avatar_emoji: '🚴‍♀️', color: '#FF9800' } },
  { id: 's4', user_id: 'u2', text: "Yeah Garmin Connect has been slow. TrainingPeaks picked it up faster for me. Let's meet at the parking lot by the camel crossing.", created_at: new Date(Date.now() - 1800000).toISOString(), reactions: ['👍', '👍'], profile: { full_name: 'Sarah K.', avatar_emoji: '🚴‍♀️', color: '#4CAF50' } },
];

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatView() {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showReactions, setShowReactions] = useState(null);
  const [visible, setVisible] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*, profile:profiles(full_name, avatar_emoji, color)')
        .eq('room_id', DEFAULT_ROOM_ID)
        .order('created_at', { ascending: true })
        .limit(80);
      if (data && data.length > 0) {
        setMessages([...SEED_MESSAGES, ...data]);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('chat_room_' + DEFAULT_ROOM_ID)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${DEFAULT_ROOM_ID}`,
      }, async (payload) => {
        const newMsg = payload.new;
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_emoji, color')
          .eq('id', newMsg.user_id)
          .maybeSingle();
        setMessages(prev => [...prev, { ...newMsg, profile: profileData }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    if (!session) {
      setMessages(prev => [...prev, {
        id: 'local_' + Date.now(),
        user_id: 'me',
        text,
        created_at: new Date().toISOString(),
        reactions: [],
        profile: { full_name: profile?.full_name || 'You', avatar_emoji: profile?.avatar_emoji || '🚴', color: profile?.color || '#FF5722' },
      }]);
      setSending(false);
      return;
    }

    const { error } = await supabase.from('chat_messages').insert({
      room_id: DEFAULT_ROOM_ID,
      user_id: session.user.id,
      text,
    });
    if (error) {
      setMessages(prev => [...prev, {
        id: 'err_' + Date.now(),
        user_id: session.user.id,
        text,
        created_at: new Date().toISOString(),
        reactions: [],
        profile: { full_name: profile?.full_name || 'You', avatar_emoji: profile?.avatar_emoji || '🚴', color: profile?.color || '#FF5722' },
      }]);
    }
    setSending(false);
  };

  const toggleReaction = async (msgId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const reactions = Array.isArray(m.reactions) ? m.reactions : [];
      const has = reactions.includes(emoji);
      return { ...m, reactions: has ? reactions.filter(r => r !== emoji) : [...reactions, emoji] };
    }));
    setShowReactions(null);
  };

  const myId = session?.user?.id || 'me';

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'all 0.5s ease',
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 200px)', minHeight: 480,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '12px 14px', borderRadius: 15, marginBottom: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'linear-gradient(135deg, rgba(255,87,34,0.25), rgba(255,87,34,0.08))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>🚴‍♂️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Al Qudra Ride Group</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>4 athletes · all online</div>
        </div>
        <div style={{ display: 'flex' }}>
          {['#4CAF50','#2196F3','#FF9800','#FF5722'].map((c, i) => (
            <div key={i} style={{
              width: 26, height: 26, borderRadius: '50%',
              background: c, marginLeft: i > 0 ? -7 : 0,
              border: '2px solid #0a0a0f', zIndex: 4 - i,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
            }}>
              {['🚴‍♀️','🚴‍♂️','🚴‍♀️','🚴'][i]}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10,
        paddingRight: 4, marginBottom: 10,
      }}>
        {/* Ride info banner */}
        <div style={{
          alignSelf: 'center',
          background: 'rgba(255,87,34,0.08)', border: '1px solid rgba(255,87,34,0.15)',
          borderRadius: 12, padding: '8px 18px', fontSize: 11, color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
        }}>
          Tomorrow's Ride — Al Qudra Loop · 68km · 5:30 AM
        </div>

        {messages.map(m => {
          const isMe = m.user_id === myId;
          const p = m.profile || {};
          const reactions = Array.isArray(m.reactions) ? m.reactions : [];
          return (
            <div key={m.id} style={{
              display: 'flex', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end',
            }}>
              {!isMe && (
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: `linear-gradient(135deg, ${p.color || '#666'}30, ${p.color || '#666'}10)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>{p.avatar_emoji || '🚴'}</div>
              )}
              <div style={{ maxWidth: '76%' }}>
                {!isMe && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: p.color || '#aaa', marginBottom: 3, paddingLeft: 3 }}>
                    {p.full_name || 'Athlete'}
                  </div>
                )}
                <div
                  onDoubleClick={() => setShowReactions(showReactions === m.id ? null : m.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '15px 15px 4px 15px' : '15px 15px 15px 4px',
                    background: isMe
                      ? 'linear-gradient(135deg, #FF5722, #FF7043)'
                      : 'rgba(255,255,255,0.07)',
                    color: isMe ? '#fff' : 'rgba(255,255,255,0.88)',
                    fontSize: 13, lineHeight: 1.55, cursor: 'default',
                    boxShadow: isMe ? '0 4px 16px rgba(255,87,34,0.25)' : 'none',
                  }}
                >
                  {m.text}
                </div>

                {/* Reaction picker */}
                {showReactions === m.id && (
                  <div style={{
                    display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    animation: 'popIn 0.18s ease',
                  }}>
                    {EMOJI_REACTIONS.map(emoji => (
                      <button key={emoji} onClick={() => toggleReaction(m.id, emoji)} style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, padding: '3px 7px', fontSize: 14, cursor: 'pointer',
                        transition: 'transform 0.15s',
                      }}>{emoji}</button>
                    ))}
                  </div>
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  paddingLeft: isMe ? 0 : 3, paddingRight: isMe ? 3 : 0,
                }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>{formatTime(m.created_at)}</span>
                  {reactions.length > 0 && (
                    <div style={{
                      display: 'flex', gap: 1, background: 'rgba(255,255,255,0.07)',
                      padding: '2px 7px', borderRadius: 10, fontSize: 12,
                    }}>
                      {reactions.map((r, i) => <span key={i}>{r}</span>)}
                      )
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 10px',
        background: 'rgba(255,255,255,0.04)', borderRadius: 17,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Message the group…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: 13, fontFamily: "'Outfit', sans-serif",
            padding: '8px 4px',
          }}
        />
        <button onClick={send} disabled={!input.trim() || sending} style={{
          background: input.trim() ? 'linear-gradient(135deg, #FF5722, #FF7043)' : 'rgba(255,255,255,0.07)',
          border: 'none', borderRadius: 11, padding: '8px 18px',
          color: input.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
          fontWeight: 700, fontSize: 13, cursor: input.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif",
          boxShadow: input.trim() ? '0 4px 14px rgba(255,87,34,0.3)' : 'none',
        }}>
          {sending ? '…' : 'Send'}
        </button>
      </div>
      <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 6 }}>
        Double-tap a message to react
      </div>
    </div>
  );
}
