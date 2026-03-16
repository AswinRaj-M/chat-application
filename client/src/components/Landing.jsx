import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { 
    MessageCircle, 
    Zap, 
    Shield, 
    Globe, 
    ArrowRight, 
    Video, 
    Users, 
    Heart,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useContext(SocketContext);
    const { theme, toggleTheme } = useTheme();

    // If user is already logged in, they probably want to go to the app
    useEffect(() => {
        if (user) {
            navigate('/message');
        }
    }, [user, navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div style={{ background: 'var(--bg-app)', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Header / Nav */}
            <nav style={{ 
                padding: '1.5rem 10%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--bg-input)',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '12px', color: 'white' }}>
                        <MessageCircle size={24} />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Nexus</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                            console.log("Navigating to login...");
                            navigate('/login');
                        }}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            fontWeight: 600, 
                            cursor: 'pointer', 
                            color: 'var(--text-main)',
                            padding: '8px 12px'
                        }}
                    >
                        Login
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                            console.log("Navigating to signup...");
                            navigate('/signup');
                        }}
                        style={{ 
                            background: 'var(--accent)', 
                            color: 'white', 
                            padding: '12px 24px', 
                            borderRadius: '14px', 
                            border: 'none', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        Get Started
                    </motion.button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ 
                padding: '160px 10% 80px 10%', 
                textAlign: 'center',
                background: theme === 'dark' ? 'radial-gradient(circle at top right, #1e1b4b, transparent)' : 'radial-gradient(circle at top right, #ede9fe, transparent)',
                position: 'relative',
                zIndex: 1
            }}>
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '100px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
                        <Zap size={16} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>New: Crystal Clear Video Calls</span>
                    </motion.div>
                    
                    <motion.h1 variants={itemVariants} style={{ 
                        fontSize: '4.5rem', 
                        fontWeight: 900, 
                        lineHeight: 1.1, 
                        color: 'var(--text-main)',
                        marginBottom: '1.5rem',
                        maxWidth: '900px',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        Connecting people in <span style={{ color: 'var(--accent)' }}>real-time</span> across the globe.
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} style={{ 
                        fontSize: '1.25rem', 
                        color: 'var(--text-muted)', 
                        maxWidth: '650px', 
                        margin: '0 auto 3rem auto',
                        lineHeight: 1.6
                    }}>
                        Experience the next generation of social messaging. Secure, fast, and beautiful. Built for modern connections.
                    </motion.p>
                    
                    <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <motion.button 
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.5)' }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => {
                                console.log("Navigating to signup from hero...");
                                navigate('/signup');
                            }}
                            style={{ 
                                padding: '18px 40px', 
                                borderRadius: '16px', 
                                border: 'none', 
                                background: 'var(--accent)', 
                                color: 'white', 
                                fontSize: '1.1rem', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.4)'
                            }}
                        >
                            Start Chatting Now <ArrowRight size={20} />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Simulated App Screenshot */}
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    style={{ 
                        marginTop: '5rem',
                        background: 'var(--bg-card)',
                        padding: '1rem',
                        borderRadius: '32px',
                        boxShadow: 'var(--shadow-blue)',
                        maxWidth: '1000px',
                        margin: '5rem auto 0 auto',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ background: '#f1f5f9', height: '500px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                         {/* This would ideally show the actual app UI mockup */}
                         <div style={{ textAlign: 'center' }}>
                            <MessageCircle size={80} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 600 }}>Interactive Dashboard Preview</p>
                         </div>
                    </div>
                </motion.div>
            </section>

            {/* Why This App? */}
            <section style={{ padding: '100px 10%' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Why Nexus?</h2>
                    <p style={{ color: 'var(--text-muted)' }}>We built this app to solve the problems of modern communication.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                    {[
                        { icon: <Shield size={32} />, title: 'Privacy First', desc: 'Secure connection system. You only talk with people you trust.' },
                        { icon: <Zap size={32} />, title: 'Lightning Fast', desc: 'Real-time messaging and typing indicators with zero delay.' },
                        { icon: <Video size={32} />, title: 'Video Calls', desc: 'High-quality P2P video and audio calling integrated seamlessly.' }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -10 }}
                            style={{ 
                                background: 'var(--bg-card)', 
                                padding: '3rem 2.5rem', 
                                borderRadius: '25px', 
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--bg-input)'
                            }}
                        >
                            <div style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>{feature.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '100px 10%', background: 'var(--bg-card)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
                    <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>How it works.</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {[
                                { step: '01', title: 'Create Account', desc: 'Sign up in seconds and customize your profile.' },
                                { step: '02', title: 'Find Friends', desc: 'Search for people by username and send requests.' },
                                { step: '03', title: 'Connect & Chat', desc: 'Once accepted, start messaging or calling instantly.' }
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)', opacity: 0.3 }}>{s.step}</div>
                                    <div>
                                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{s.title}</h4>
                                        <p style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ x: 50, opacity: 0 }} 
                        whileInView={{ x: 0, opacity: 1 }} 
                        viewport={{ once: true }}
                        style={{ background: 'var(--bg-app)', borderRadius: '30px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                         <Users size={120} style={{ color: 'var(--accent)', opacity: 0.2 }} />
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '80px 10% 40px 10%', background: '#1e293b', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <MessageCircle size={32} />
                            <span style={{ fontSize: '1.75rem', fontWeight: 900 }}>Nexus</span>
                        </div>
                        <p style={{ color: '#94a3b8', maxWidth: '300px' }}>The future of social communication. Stay connected, stay secure.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4rem' }}>
                        <div>
                            <h5 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Links</h5>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: '#94a3b8' }}>
                                <li>Home</li>
                                <li>About</li>
                                <li>Security</li>
                            </ul>
                        </div>
                        <div>
                            <h5 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Social</h5>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: '#94a3b8' }}>
                                <li>Twitter</li>
                                <li>Instagram</li>
                                <li>Discord</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #334155', paddingTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    &copy; 2026 Nexus Messaging Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
