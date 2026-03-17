import React, { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { fetchData } from '../../services/api';

const Login = () => {
    const { loginUser, user } = useContext(SocketContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/message');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const { ok, data } = await fetchData('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: username.trim(), password })
        });

        if (ok) {
            loginUser(data.user);
            navigate('/message');
        } else {
            setError(data.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="section-card" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', width: '100%', maxWidth: '400px', flex: 'none', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <LogIn size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Login</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Welcome back to the social world</p>
                </div>

                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Username</label>
                        <div className="search-container" style={{ padding: '0.5rem 1rem' }}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Enter your username"
                                style={{ background: 'transparent' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
                        <div className="search-container" style={{ padding: '0.5rem 1rem' }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ background: 'transparent' }}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="voice-btn" style={{ width: '100%', height: '50px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, marginBottom: '2rem' }}>
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        New here? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
