import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { Link } from 'react-router-dom';

export default function NotificationCenter() {
  const { isAuthenticated } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      /* ignore non-blocking error */
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0.2rem',
              right: '0.2rem',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.625rem',
              fontWeight: 900,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0c0728',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: '2.5rem',
            width: '340px',
            maxHeight: '440px',
            backgroundColor: '#0d0927',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: 'white' }}>
              Notifications
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => {
                const getIcon = () => {
                  if (n.type === 'APPOINTMENT_ACCEPTED') return <CheckCircle2 size={16} style={{ color: '#34d399' }} />;
                  if (n.type === 'APPOINTMENT_REJECTED') return <XCircle size={16} style={{ color: '#fb7185' }} />;
                  if (n.type === 'APPOINTMENT_REQUEST') return <Calendar size={16} style={{ color: '#f59e0b' }} />;
                  return <Bell size={16} style={{ color: '#818cf8' }} />;
                };

                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      padding: '0.875rem 1.25rem',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      backgroundColor: n.is_read ? 'transparent' : 'rgba(99,102,241,0.08)',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <div style={{ marginTop: '0.125rem', flexShrink: 0 }}>{getIcon()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'white', marginBottom: '0.15rem' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setIsOpen(false)}
                          style={{ fontSize: '0.6875rem', color: '#818cf8', fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: '0.25rem' }}
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
