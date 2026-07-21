import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ShieldCheck, X } from 'lucide-react';

export default function CallModal({
  callState, // 'idle' | 'calling' | 'incoming' | 'connected'
  targetUser,
  isVideo = false,
  localStream,
  remoteStream,
  onAnswerCall,
  onRejectCall,
  onEndCall,
  onToggleMic,
  onToggleVideo,
  isMicMuted,
  isVideoDisabled,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  if (callState === 'idle') return null;

  const userImg = targetUser?.profile_image_url || targetUser?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop';
  const userName = targetUser?.full_name || targetUser?.name || 'User';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', padding: '1rem' }}>
      
      {/* INCOMING CALL MODAL */}
      {callState === 'incoming' && (
        <div className="glass-panel" style={{ width: '100%', maxWidth: '24rem', padding: '2rem', borderRadius: '1.5rem', backgroundColor: '#090518', border: '1px solid rgba(99,102,241,0.4)', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}>
          <div style={{ position: 'relative', width: '5rem', height: '5rem', margin: '0 auto 1.25rem', borderRadius: '9999px', overflow: 'hidden', border: '3px solid #6366f1', boxShadow: '0 0 30px rgba(99,102,241,0.5)' }}>
            <img src={userImg} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{userName}</h3>
          <p style={{ fontSize: '0.875rem', color: '#818cf8', marginTop: '0.25rem', fontWeight: 600 }}>
            Incoming {isVideo ? 'Video' : 'Voice'} Call...
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <button
              onClick={onRejectCall}
              style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(239,68,68,0.4)' }}
              title="Decline Call"
            >
              <PhoneOff size={22} />
            </button>
            <button
              onClick={onAnswerCall}
              style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16,185,129,0.4)' }}
              title="Accept Call"
            >
              {isVideo ? <Video size={22} /> : <Phone size={22} />}
            </button>
          </div>
        </div>
      )}

      {/* OUTGOING CALLING / CONNECTED MODAL */}
      {(callState === 'calling' || callState === 'connected') && (
        <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: isVideo ? '48rem' : '26rem', backgroundColor: '#090518', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ height: '0.625rem', width: '0.625rem', borderRadius: '9999px', backgroundColor: callState === 'connected' ? '#10b981' : '#facc15' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                {callState === 'connected' ? 'Call Connected' : 'Calling...'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>WebRTC Encrypted</span>
          </div>

          {/* VIDEO CONTAINER */}
          {isVideo ? (
            <div style={{ position: 'relative', width: '100%', height: '22rem', borderRadius: '1rem', overflow: 'hidden', backgroundColor: '#030014', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {!remoteStream && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <img src={userImg} alt={userName} style={{ width: '5rem', height: '5rem', borderRadius: '9999px', objectFit: 'cover', border: '2px solid #6366f1' }} />
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Waiting for {userName} to connect video...</span>
                </div>
              )}

              {/* Local Video Thumbnail */}
              <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '7rem', height: '5rem', borderRadius: '0.75rem', overflow: 'hidden', border: '2px solid #6366f1', boxShadow: '0 4px 14px rgba(0,0,0,0.6)', backgroundColor: '#090518' }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          ) : (
            /* VOICE CALL AVATAR CONTAINER */
            <div style={{ padding: '2rem 1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', width: '6rem', height: '6rem', margin: '0 auto 1rem', borderRadius: '9999px', overflow: 'hidden', border: '3px solid #6366f1', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                <img src={userImg} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{userName}</h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {callState === 'connected' ? 'Voice Call Active' : 'Connecting call...'}
              </p>

              {/* Hidden audio element for remote stream */}
              <audio ref={remoteVideoRef} autoPlay />
            </div>
          )}

          {/* CALL CONTROL BUTTONS */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={onToggleMic}
              style={{ padding: '0.875rem', borderRadius: '9999px', backgroundColor: isMicMuted ? '#ef4444' : 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
              title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {isVideo && (
              <button
                onClick={onToggleVideo}
                style={{ padding: '0.875rem', borderRadius: '9999px', backgroundColor: isVideoDisabled ? '#ef4444' : 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                title={isVideoDisabled ? 'Turn On Camera' : 'Turn Off Camera'}
              >
                {isVideoDisabled ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            )}

            <button
              onClick={onEndCall}
              style={{ padding: '0.875rem 1.75rem', borderRadius: '9999px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(239,68,68,0.4)' }}
            >
              <PhoneOff size={18} /> End Call
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
