import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { 
    MessageCircle, 
    Zap, 
    Shield, 
    ArrowRight, 
    Video, 
    Users, 
    Moon,
    Sun
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(SocketContext);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (user) {
            navigate('/chat');
        }
    }, [user, navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div style={{ background: 'var(--bg-app)', minHeight: '100vh', overflowX: 'hidden' }}>
            <nav style={{ 
                padding: '1.25rem 8%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                background: 'rgba(var(--bg-card-rgb), 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--bg-input)',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '14px', color: 'white', boxShadow: '0 8px 16px rgba(67, 56, 202, 0.2)' }}>
                        <MessageCircle size={24} />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Nexus</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        style={{ background: 'var(--bg-input)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.button>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', color: 'var(--text-main)', padding: '8px 16px' }}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => navigate('/signup')}
                        style={{ 
                            background: 'var(--accent)', 
                            color: 'white', 
                            padding: '12px 24px', 
                            borderRadius: '14px', 
                            border: 'none', 
                            fontWeight: 800, 
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            boxShadow: '0 8px 20px rgba(67, 56, 202, 0.3)'
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            <section style={{ 
                padding: 'clamp(120px, 20vh, 180px) 8% 100px 8%', 
                textAlign: 'center',
                position: 'relative'
            }}>
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-light)', padding: '10px 20px', borderRadius: '100px', marginBottom: '2.5rem' }}>
                        <Zap size={16} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>Next-Gen Real-time Communication</span>
                    </motion.div>
                    
                    <motion.h1 variants={itemVariants} style={{ 
                        fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
                        fontWeight: 900, 
                        lineHeight: 1.05, 
                        color: 'var(--text-main)',
                        maxWidth: '1000px',
                        margin: '0 auto 2rem auto',
                        letterSpacing: '-2px'
                    }}>
                        Connect with anyone, <span className="gradient-text">anywhere.</span>
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} style={{ 
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
                        color: 'var(--text-muted)', 
                        maxWidth: '700px', 
                        margin: '0 auto 3.5rem auto',
                        lineHeight: 1.5,
                        fontWeight: 500
                    }}>
                        Experience seamless messaging and high-quality video calls in a beautiful, minimalist interface designed for you.
                    </motion.p>
                    
                    <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <motion.button 
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(67, 56, 202, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                            style={{ 
                                padding: '18px 48px', 
                                borderRadius: '18px', 
                                border: 'none', 
                                background: 'var(--accent)', 
                                color: 'white', 
                                fontSize: '1.1rem', 
                                fontWeight: 800, 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem'
                            }}
                        >
                            Start Chatting Now <ArrowRight size={22} />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div 
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    style={{ 
                        marginTop: '6rem',
                        background: 'var(--bg-card)',
                        padding: '1.5rem',
                        borderRadius: '32px',
                        boxShadow: 'var(--shadow-blue)',
                        maxWidth: '1100px',
                        margin: '6rem auto 0 auto',
                        border: '1px solid var(--bg-input)',
                        perspective: '1000px'
                    }}
                >
                    <div style={{ background: 'var(--bg-app)', height: '550px', borderRadius: '20px', display: 'flex', padding: '1rem', gap: '1rem' }}>
                        <div style={{ width: '60px', background: 'var(--accent)', borderRadius: '14px' }}></div>
                        <div style={{ width: '250px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--bg-input)' }}></div>
                        <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', opacity: 0.2 }}>
                                <MessageCircle size={100} color="var(--accent)" />
                                <h3 style={{ marginTop: '1rem' }}>Interactive UI</h3>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <section style={{ padding: '100px 8%', background: 'var(--bg-card)' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-1px' }}>Engineered for Perfection</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>A suite of features designed to enhance your social experience.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {[
                        { icon: <Shield size={36} />, title: 'Privacy First', desc: 'End-to-end connection security. You control who can reach you and when.' },
                        { icon: <Zap size={36} />, title: 'Speed of Light', desc: 'Optimized socket architecture ensures your messages arrive instantly.' },
                        { icon: <Video size={36} />, title: 'P2P Video Calls', desc: 'Direct peer-to-peer communication for the highest quality audio and video.' }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -12 }}
                            style={{ 
                                padding: '3.5rem 3rem', 
                                borderRadius: '30px', 
                                border: '1px solid var(--bg-input)',
                                background: 'var(--bg-app)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{ color: 'var(--accent)', marginBottom: '1.5rem', background: 'var(--accent-light)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.2rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <footer style={{ padding: '80px 8% 40px 8%', background: 'var(--bg-card)', borderTop: '1px solid var(--bg-input)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4rem', marginBottom: '5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '10px', color: 'white' }}>
                                <MessageCircle size={28} />
                            </div>
                            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>Nexus</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '350px', lineHeight: 1.6 }}>The future of social communication. Stay connected, stay secure, and express yourself freely.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '5rem', flexWrap: 'wrap' }}>
                        <div>
                            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Platform</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                                <li style={{ cursor: 'pointer' }}>Features</li>
                                <li style={{ cursor: 'pointer' }}>Security</li>
                                <li style={{ cursor: 'pointer' }}>For Mobile</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Connect</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                                <li style={{ cursor: 'pointer' }}>Twitter</li>
                                <li style={{ cursor: 'pointer' }}>Instagram</li>
                                <li style={{ cursor: 'pointer' }}>Status</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid var(--bg-input)', paddingTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    &copy; 2026 Nexus Messaging Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
