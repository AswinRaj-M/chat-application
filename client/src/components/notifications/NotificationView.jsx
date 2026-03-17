import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';

const NotificationView = ({ notifications, onClearOne, onClearAll, onMarkAsRead }) => {
    const [activeTab, setActiveTab] = useState('unread');

    const unread = notifications.filter(n => !n.read);
    const read = notifications.filter(n => n.read);

    const currentNotifications = activeTab === 'unread' ? unread : read;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="section-card" 
            style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                maxWidth: '900px',
                margin: '0 auto',
                width: '100%'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontWeight: 800 }}>Notifications</h2>
                {notifications.length > 0 && (
                    <button 
                        onClick={onClearAll}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--bg-input)' }}>
                <button 
                    onClick={() => setActiveTab('unread')}
                    style={{ 
                        padding: '0.75rem 0.5rem', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: activeTab === 'unread' ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: 700,
                        borderBottom: activeTab === 'unread' ? '2px solid var(--accent)' : '2px solid transparent',
                        position: 'relative'
                    }}
                >
                    Unread
                    {unread.length > 0 && (
                        <span style={{ 
                            marginLeft: '8px', 
                            background: activeTab === 'unread' ? 'var(--accent)' : '#cbd5e1', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '10px', 
                            fontSize: '0.7rem' 
                        }}>
                            {unread.length}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('read')}
                    style={{ 
                        padding: '0.75rem 0.5rem', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: activeTab === 'read' ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: 700,
                        borderBottom: activeTab === 'read' ? '2px solid var(--accent)' : '2px solid transparent'
                    }}
                >
                    Read
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence mode="popLayout">
                {currentNotifications.length === 0 ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                    >
                        <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No {activeTab} notifications</p>
                    </motion.div>
                ) : (
                    currentNotifications.map((n) => (
                        <motion.div 
                            key={n.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            style={{ 
                                padding: '1rem', 
                                background: n.read ? 'var(--bg-card)' : 'var(--bg-app)', 
                                border: n.read ? '1px solid var(--bg-input)' : '1px solid transparent',
                                borderRadius: '16px', 
                                display: 'flex', 
                                gap: '1rem', 
                                alignItems: 'center',
                                position: 'relative'
                            }}
                        >
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '12px', 
                                background: n.type === 'request' ? 'var(--accent-light)' : '#fee2e2',
                                color: n.type === 'request' ? 'var(--accent)' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {n.type === 'request' ? <UserPlus size={20} /> : <MessageSquare size={20} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{n.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {!n.read && (
                                    <button 
                                        onClick={() => onMarkAsRead(n.id)}
                                        title="Mark as read"
                                        style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => onClearOne(n.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default NotificationView;
