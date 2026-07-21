import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { connectSocket, getSocket } from '../services/socket';
import CallModal from '../components/CallModal.jsx';
import SEO from '../components/SEO.jsx';
import {
  MessageSquare, Send, Phone, Video, Search, User, MapPin,
  Building2, Circle, Clock, CheckCheck, Sparkles, ArrowLeft, ShieldCheck, Image as ImageIcon, Paperclip
} from 'lucide-react';

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get('convId');

  const { user, isAuthenticated, openAuthModal } = useAppStore();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);

  // WebRTC Call State
  const [callState, setCallState] = useState('idle'); // 'idle'|'calling'|'incoming'|'connected'
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callTargetUser, setCallTargetUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  const pcRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatBottomRef = useRef(null);

  const socket = getSocket();

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  // 1. Connect Socket & Load Conversations
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const s = connectSocket(user._id || user.id);

    s.on('online_users_list', (users) => {
      setOnlineUsers(users);
    });

    s.on('receive_message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => (m._id || m.id) === (msg._id || msg.id))) return prev;
        return [...prev, msg];
      });

      setConversations((prev) =>
        prev.map((c) => {
          if ((c._id || c.id) === (msg.conversation_id || msg.conversation_id?._id)) {
            return {
              ...c,
              last_message: msg.text,
              last_message_at: msg.created_at || new Date(),
            };
          }
          return c;
        })
      );
    });

    s.on('user_typing', () => {
      setIsOtherTyping(true);
    });

    s.on('user_stop_typing', () => {
      setIsOtherTyping(false);
    });

    async function fetchConvs() {
      setIsLoadingConvs(true);
      try {
        const convList = await api.getMyConversations();
        setConversations(convList || []);
        if (initialConvId) {
          const match = (convList || []).find((c) => (c._id || c.id) === initialConvId);
          if (match) setActiveConv(match);
        } else if (convList?.length) {
          setActiveConv(convList[0]);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setIsLoadingConvs(false);
      }
    }

    fetchConvs();
  }, [isAuthenticated, user, initialConvId]);

  // Load Messages for Active Conversation
  useEffect(() => {
    if (!activeConv) return;
    const cId = activeConv._id || activeConv.id;
    setIsLoadingMsgs(true);

    api.getConversationMessages(cId)
      .then((msgList) => {
        setMessages(msgList || []);
      })
      .catch((err) => console.error('Error fetching messages:', err))
      .finally(() => setIsLoadingMsgs(false));
  }, [activeConv]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !activeConv) return;

    const cId = activeConv._id || activeConv.id;
    const textToSend = newMessageText.trim();
    setNewMessageText('');

    try {
      const sentMsg = await api.sendMessageRest(cId, textToSend);
      setMessages((prev) => [...prev, sentMsg]);

      const otherParticipant = getOtherParticipant(activeConv);
      const recipientId = otherParticipant?._id || otherParticipant?.id;
      if (socket && recipientId) {
        socket.emit('send_message', {
          conversation_id: cId,
          recipient_id: recipientId,
          text: textToSend,
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    const myId = user?._id || user?.id;
    return conv.participants.find((p) => (p._id || p.id) !== myId) || conv.participants[0];
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <MessageSquare size={48} style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sign In Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please sign in to view your messages and chat with property owners.</p>
        <button onClick={openAuthModal} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem' }}>
          Sign In Now
        </button>
      </div>
    );
  }

  const currentOtherUser = activeConv ? getOtherParticipant(activeConv) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <SEO title="Messages & Chat" description="Direct buyer-seller messaging and negotiation room." />

      <div className="glass-panel" style={{ borderRadius: '1.75rem', overflow: 'hidden', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', height: '78vh' }}>
        
        {/* Left Sidebar: Conversations List */}
        <div style={{ borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Messages</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}>
              <Search size={16} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {isLoadingConvs ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                No active conversations yet.
              </div>
            ) : (
              conversations.map((c) => {
                const other = getOtherParticipant(c);
                const isSelected = (activeConv?._id || activeConv?.id) === (c._id || c.id);
                return (
                  <div
                    key={c._id || c.id}
                    onClick={() => setActiveConv(c)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: '1rem',
                      cursor: 'pointer', backgroundColor: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                      marginBottom: '0.375rem', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ position: 'relative', width: '2.5rem', height: '2.5rem', borderRadius: '50%', overflow: 'hidden', border: '1px solid #6366f1', flexShrink: 0 }}>
                      <img src={other?.profile_image_url || other?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {other?.full_name || other?.name || 'Seller'}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.last_message || 'Start conversation...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Chat View */}
        {activeConv ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={currentOtherUser?.profile_image_url || currentOtherUser?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop'} alt="Avatar" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentOtherUser?.full_name || 'Seller'}</h3>
                  <span style={{ fontSize: '0.6875rem', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    ● Online
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {currentOtherUser?.phone && (
                  <a href={`tel:${currentOtherUser.phone}`} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', textDecoration: 'none' }}>
                    <Phone size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, i) => {
                const isMe = (m.sender_id?._id || m.sender_id || m.sender) === (user._id || user.id);
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '70%', padding: '0.75rem 1rem', borderRadius: '1.25rem',
                        backgroundColor: isMe ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.06)',
                        background: isMe ? '#6366f1' : 'rgba(255,255,255,0.06)',
                        color: 'white', fontSize: '0.875rem', lineHeight: 1.5,
                        borderBottomRightRadius: isMe ? '0.25rem' : '1.25rem',
                        borderBottomLeftRadius: !isMe ? '0.25rem' : '1.25rem',
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
              {isOtherTyping && (
                <div style={{ fontSize: '0.75rem', color: '#818cf8', fontStyle: 'italic' }}>
                  {currentOtherUser?.full_name} is typing...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="glass-input"
                style={{ fontSize: '0.875rem', padding: '0.75rem 1rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.25rem', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
