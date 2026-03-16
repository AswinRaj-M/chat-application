import React, { useState, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Signup = () => {
    const { user } = useContext(SocketContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/message');
        }
    }, [user, navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password })
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess('Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
            <div className="section-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px', flex: 'none' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <UserPlus size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Join Us</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Start your journey today</p>
                </div>

                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
                {success && <div style={{ color: '#10b981', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem', background: '#d1fae5', borderRadius: '8px', fontSize: '0.9rem' }}>{success}</div>}
                
                <form onSubmit={handleSignup}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Username</label>
                        <div className="search-container" style={{ padding: '0.5rem 1rem' }}>
                            <input
                                type="text"
                                style={{ background: 'transparent' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
                        <div className="search-container" style={{ padding: '0.5rem 1rem' }}>
                            <input
                                type="password"
                                style={{ background: 'transparent' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Confirm Password</label>
                        <div className="search-container" style={{ padding: '0.5rem 1rem' }}>
                            <input
                                type="password"
                                style={{ background: 'transparent' }}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="voice-btn" style={{ width: '100%', height: '50px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, marginBottom: '2rem' }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Already a member? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
