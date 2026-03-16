import React from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Bell, User, Star } from 'lucide-react';

const DashboardHome = ({ user, onNavigate }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dashboard-home-container"
            style={{ padding: 'clamp(1rem, 5vw, 2rem)', height: '100%', overflowY: 'auto' }}
        >
            <div style={{ marginBottom: 'clamp(1.5rem, 5vw, 3rem)' }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, margin: 0 }}>Welcome back, {user?.username}! 👋</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', marginTop: '0.5rem' }}>Here's what's happening in your social world today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => onNavigate('/message')}
                    className="section-card" 
                    style={{ padding: '2rem', cursor: 'pointer', border: '1px solid var(--bg-input)' }}
                >
                    <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <MessageSquare size={24} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Messages</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Connect with your friends and share your thoughts in real-time.</p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => onNavigate('/notification')}
                    className="section-card" 
                    style={{ padding: '2rem', cursor: 'pointer', border: '1px solid var(--bg-input)' }}
                >
                    <div style={{ background: '#fee2e2', color: '#ef4444', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Bell size={24} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Notifications</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Stay updated with friend requests and new activities.</p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => onNavigate('/profile')}
                    className="section-card" 
                    style={{ padding: '2rem', cursor: 'pointer', border: '1px solid var(--bg-input)' }}
                >
                    <div style={{ background: '#fef3c7', color: '#d97706', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <User size={24} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Your Profile</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Customize your profile and see how others see you.</p>
                </motion.div>
            </div>

            <div className="section-card premium-card" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <Star size={32} />
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, margin: '0 0 1rem 0' }}>Nexus Premium</h2>
                    <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', opacity: 0.9, maxWidth: '500px', margin: '0 auto 2rem auto' }}>Unlock exclusive icons, custom themes, and more features to express yourself.</p>
                    <button className="voice-btn" style={{ background: 'white', color: 'var(--accent)', width: 'auto', padding: '0 3rem', borderRadius: '14px', fontWeight: 700 }}>Coming Soon</button>
                </div>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-150px', right: '-50px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
