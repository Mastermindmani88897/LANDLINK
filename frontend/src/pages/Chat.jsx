import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { connectSocket, getSocket } from '../services/socket';
import CallModal from '../components/CallModal.jsx';
import {
  MessageSquare, Send, Phone, Video, Search, User, MapPin,
  Building2, Circle, Clock, CheckCheck, Sparkles, ArrowLeft, ShieldCheck
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

  // STUN / TURN servers config
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];
  if (import.meta.env.VITE_STUN_SERVER) {
    iceServers.push({ urls: import.meta.env.VITE_STUN_SERVER });
  }
  if (import.meta.env.VITE_TURN_SERVER) {
    iceServers.push({
      urls: import.meta.env.VITE_TURN_SERVER,
      username: import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || '',
    });
  }

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

      // Update conversations list summary
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

    // WebRTC Signaling Listeners
    s.on('incoming_call', async ({ signal_data, from_user, conversation_id, is_video }) => {
      setCallTargetUser(from_user);
      setIsVideoCall(is_video);
      setCallState('incoming');
      window.incomingCallSignal = signal_data;
    });

    s.on('call_accepted', async ({ signal_data }) => {
      if (pcRef.current && signal_data) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal_data));
        setCallState('connected');
      }
    });

    s.on('ice_candidate', async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    });

    s.on('call_ended', () => {
      endCallCleanup();
    });

    s.on('call_rejected', () => {
      alert('Call was declined.');
      endCallCleanup();
    });

    loadConversations();

    return () => {
      s.off('receive_message');
      s.off('user_typing');
      s.off('user_stop_typing');
      s.off('incoming_call');
      s.off('call_accepted');
      s.off('ice_candidate');
      s.off('call_ended');
      s.off('call_rejected');
    };
  }, [isAuthenticated, user]);

  const loadConversations = async () => {
    setIsLoadingConvs(true);
    try {
      const data = await api.getMyConversations();
      setConversations(data || []);
      if (data && data.length > 0) {
        const target = initialConvId
          ? data.find((c) => (c._id || c.id) === initialConvId) || data[0]
          : data[0];
        selectConversation(target);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const selectConversation = async (conv) => {
    if (!conv) return;
    setActiveConv(conv);
    setIsLoadingMsgs(true);
    const convId = conv._id || conv.id;

    if (socket) {
      socket.emit('join_conversation', convId);
    }

    try {
      const msgs = await api.getConversationMessages(convId);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMsgs(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleTypingInput = (e) => {
    setNewMessageText(e.target.value);
    if (!activeConv || !socket) return;
    const convId = activeConv._id || activeConv.id;
    socket.emit('typing', { conversation_id: convId, user_name: user.full_name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversation_id: convId });
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConv) return;
    const text = newMessageText.trim();
    setNewMessageText('');
    const convId = activeConv._id || activeConv.id;

    const otherUser = getOtherParticipant(activeConv);
    const recipientId = otherUser?._id || otherUser?.id;

    if (socket && recipientId) {
      socket.emit('send_message', {
        conversation_id: convId,
        sender_id: user._id || user.id,
        receiver_id: recipientId,
        text,
      });
      socket.emit('stop_typing', { conversation_id: convId });
    } else {
      try {
        const msg = await api.sendMessageRest(convId, text);
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        alert('Failed to send message.');
      }
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    const myId = (user?._id || user?.id)?.toString();
    return conv.participants.find((p) => (p._id || p.id)?.toString() !== myId) || conv.participants[0];
  };

  const isUserOnline = (participant) => {
    if (!participant) return false;
    const pId = (participant._id || participant.id)?.toString();
    return onlineUsers.includes(pId);
  };

  // ─── WEBRTC SIGNALING HANDLERS ─────────────────────────────────────────────
  const initiateCall = async (video = false) => {
    const otherUser = getOtherParticipant(activeConv);
    if (!otherUser) return;
    const recipientId = otherUser._id || otherUser.id;

    if (!isUserOnline(otherUser)) {
      alert(`${otherUser.full_name || 'User'} is currently offline. Calls can only be made when the user is online.`);
      return;
    }

    setIsVideoCall(video);
    setCallTargetUser(otherUser);
    setCallState('calling');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice_candidate', { to_user: recipientId, candidate: event.candidate });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call_user', {
        user_to_call: recipientId,
        signal_data: offer,
        from_user: user,
        conversation_id: activeConv._id || activeConv.id,
        is_video: video,
      });
    } catch (err) {
      console.error('Call initialization error:', err);
      alert('Could not access microphone or camera.');
      endCallCleanup();
    }
  };

  const answerIncomingCall = async () => {
    if (!window.incomingCallSignal || !callTargetUser) return;
    const senderId = callTargetUser._id || callTargetUser.id;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoCall });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice_candidate', { to_user: senderId, candidate: event.candidate });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(window.incomingCallSignal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer_call', { to_user: senderId, signal_data: answer });
      setCallState('connected');
    } catch (err) {
      console.error('Failed to answer call:', err);
      endCallCleanup();
    }
  };

  const rejectIncomingCall = () => {
    if (callTargetUser && socket) {
      socket.emit('reject_call', { to_user: callTargetUser._id || callTargetUser.id });
    }
    endCallCleanup();
  };

  const endCallCleanup = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setCallState('idle');
    window.incomingCallSignal = null;
  };

  const handleEndCallClick = () => {
    if (callTargetUser && socket) {
      socket.emit('end_call', { to_user: callTargetUser._id || callTargetUser.id });
    }
    endCallCleanup();
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideoTrack = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoDisabled(!videoTrack.enabled);
      }
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="glass-panel" style={{ maxWidth: '30rem', margin: '0 auto', padding: '2.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <MessageSquare size={48} style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Please Sign In</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            You must be signed in to view messages and chat with property sellers.
          </p>
          <button onClick={openAuthModal} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.75rem 1.75rem', fontSize: '0.875rem', borderRadius: '0.75rem' }}>
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  const activeOtherUser = getOtherParticipant(activeConv);
  const activeOnline = isUserOnline(activeOtherUser);

  const filteredConvs = conversations.filter((c) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(c);
    return other?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      
      {/* WebRTC In-Call Modal */}
      <CallModal
        callState={callState}
        targetUser={callTargetUser}
        isVideo={isVideoCall}
        localStream={localStream}
        remoteStream={remoteStream}
        onAnswerCall={answerIncomingCall}
        onRejectCall={rejectIncomingCall}
        onEndCall={handleEndCallClick}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideoTrack}
        isMicMuted={isMicMuted}
        isVideoDisabled={isVideoDisabled}
      />

      {/* Main Messaging Layout */}
      <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 11rem)', minHeight: '520px', borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        
        {/* SIDEBAR CONVERSATIONS LIST */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} style={{ color: '#818cf8' }} /> My Messages
            </h2>
            <div style={{ position: 'relative', marginTop: '0.875rem' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.25rem', fontSize: '0.75rem', borderRadius: '0.625rem' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {isLoadingConvs ? (
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', padding: '2rem' }}>Loading conversations...</p>
            ) : filteredConvs.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                No active conversations found. Click "Message Seller" on any property to start chatting.
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const cId = conv._id || conv.id;
                const other = getOtherParticipant(conv);
                const online = isUserOnline(other);
                const isSelected = activeConv && (activeConv._id || activeConv.id) === cId;
                const avatar = other?.profile_image_url || other?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
                const unread = conv.unread_count?.[user?._id || user?.id] || 0;

                return (
                  <div
                    key={cId}
                    onClick={() => selectConversation(conv)}
                    style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent', borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={avatar} alt={other?.full_name} style={{ width: '2.75rem', height: '2.75rem', borderRadius: '9999px', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: 0, right: 0, height: '0.625rem', width: '0.625rem', borderRadius: '9999px', backgroundColor: online ? '#10b981' : '#64748b', border: '2px solid #090518' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {other?.full_name || 'Seller'}
                        </h4>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{formatTime(conv.last_message_at)}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: isSelected ? '#cbd5e1' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.125rem' }}>
                        {conv.last_message || 'Start chatting...'}
                      </p>
                    </div>

                    {unread > 0 && (
                      <span style={{ backgroundColor: '#6366f1', color: 'white', fontSize: '10px', fontWeight: 800, padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT WINDOW */}
        {activeConv ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* CHAT HEADER */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={activeOtherUser?.profile_image_url || activeOtherUser?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                    alt={activeOtherUser?.full_name}
                    style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', bottom: 0, right: 0, height: '0.625rem', width: '0.625rem', borderRadius: '9999px', backgroundColor: activeOnline ? '#10b981' : '#64748b', border: '2px solid #090518' }} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{activeOtherUser?.full_name || 'User'}</h3>
                  <span style={{ fontSize: '0.75rem', color: activeOnline ? '#34d399' : '#94a3b8', fontWeight: 600 }}>
                    {activeOnline ? '● Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS (Voice & Video Call) */}
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                {activeConv.property_id && (
                  <Link to={`/properties/${activeConv.property_id.id || activeConv.property_id._id || activeConv.property_id}`} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', borderRadius: '0.625rem' }}>
                    <Building2 size={13} /> View Property
                  </Link>
                )}

                <button onClick={() => initiateCall(false)} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '0.625rem', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }} title="Voice Call">
                  <Phone size={16} />
                </button>

                <button onClick={() => initiateCall(true)} className="btn-primary" style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }} title="Video Call">
                  <Video size={16} /> Video Call
                </button>
              </div>
            </div>

            {/* MESSAGES STREAM */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {isLoadingMsgs ? (
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', margin: 'auto' }}>Loading chat history...</p>
              ) : messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                  No messages yet. Send a greeting to start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const mId = msg._id || msg.id;
                  const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString();
                  const isMine = senderId === (user?._id || user?.id)?.toString();

                  return (
                    <div
                      key={mId}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}
                    >
                      <div
                        style={{
                          maxWidth: '75%',
                          padding: '0.75rem 1rem',
                          borderRadius: isMine ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                          backgroundColor: isMine ? '#4f46e5' : 'rgba(255,255,255,0.08)',
                          color: '#f8fafc',
                          fontSize: '0.875rem',
                          lineHeight: '1.4',
                          boxShadow: isMine ? '0 4px 14px rgba(79,70,229,0.3)' : 'none',
                        }}
                      >
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isOtherTyping && (
                <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: '#818cf8', animation: 'ping 1s infinite' }} />
                  {activeOtherUser?.full_name || 'User'} is typing...
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* MESSAGE INPUT */}
            <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessageText}
                onChange={handleTypingInput}
                className="glass-input"
                style={{ flex: 1, fontSize: '0.875rem', borderRadius: '0.75rem' }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 800 }}
              >
                <Send size={16} /> Send
              </button>
            </form>

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '2rem' }}>
            <MessageSquare size={48} style={{ color: '#475569', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>No Conversation Selected</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.375rem' }}>Choose a contact from the left list to start messaging.</p>
          </div>
        )}

      </div>
    </div>
  );
}
