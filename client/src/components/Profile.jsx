import React, { useState, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { User, X, Camera, MapPin, AlignLeft, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

const Profile = ({ onClose }) => {
    const { user, loginUser } = useContext(SocketContext);
    const { theme, toggleTheme } = useTheme();
    const [image, setImage] = useState(user?.profileImage || '');
    const [cover, setCover] = useState(user?.coverImage || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [location, setLocation] = useState(user?.location || '');
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'profile') setImage(reader.result);
                else setCover(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setUploading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user.id, 
                    profileImage: image, 
                    coverImage: cover,
                    bio, 
                    location 
                })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                loginUser({ 
                    ...user, 
                    profileImage: updatedUser.profileImage, 
                    coverImage: updatedUser.coverImage,
                    bio: updatedUser.bio,
                    location: updatedUser.location
                });
                toast.success('Settings updated successfully!');
                if (onClose) onClose();
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update settings');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.75rem' }}>Profile Settings</h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>Manage your public presence and account theme.</p>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'var(--bg-app)', border: 'none', cursor: 'pointer', 
                            color: 'var(--text-muted)', width: '40px', height: '40px', 
                            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
 
            {/* Cover Photo */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Cover Photo</label>
                <div style={{ 
                    height: '160px', 
                    borderRadius: '20px', 
                    background: cover ? `url(${cover}) center/cover` : 'linear-gradient(90deg, var(--accent) 0%, #6366f1 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid var(--bg-input)'
                }}>
                    <label style={{ 
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        background: 'rgba(0,0,0,0.3)', color: 'white', cursor: 'pointer', opacity: 0, transition: '0.3s',
                        backdropFilter: 'blur(2px)'
                    }} className="hover-trigger">
                        <Camera size={24} />
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>
            
            {/* Profile Avatar */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '30px',
                        background: 'var(--bg-app)', overflow: 'hidden', border: '4px solid var(--bg-card)',
                        boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {image ? <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="var(--text-muted)" />}
                    </div>
                    <label style={{ 
                        position: 'absolute', bottom: '-2px', right: '-2px', background: 'var(--accent)', color: 'white', 
                        width: '32px', height: '32px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', border: '3px solid var(--bg-card)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                        <Camera size={16} />
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} style={{ display: 'none' }} />
                    </label>
                </div>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{user?.username}</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose a unique avatar and cover photo</p>
                </div>
            </div>
 
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700 }}>Bio</label>
                <div className="search-container" style={{ padding: '1rem', alignItems: 'flex-start' }}>
                    <AlignLeft size={18} style={{ marginTop: '0.2rem', color: 'var(--text-muted)' }} />
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the world about yourself..."
                        style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', color: 'var(--text-main)', resize: 'none', minHeight: '80px', fontFamily: 'inherit', fontSize: '1rem', lineHeight: '1.5' }}
                    />
                </div>
            </div>
 
            <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700 }}>Location</label>
                <div className="search-container" style={{ padding: '0.85rem 1rem' }}>
                    <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
                    <input 
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Where are you based?"
                        style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', color: 'var(--text-main)', fontSize: '1rem' }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Appearance</label>
                <div 
                    onClick={toggleTheme}
                    style={{ 
                        background: 'var(--bg-app)', padding: '1rem', borderRadius: '16px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        cursor: 'pointer', border: '1px solid var(--bg-input)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {theme === 'dark' ? <Moon size={20} color="var(--accent)" /> : <Sun size={20} color="#f59e0b" />}
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <div style={{ 
                        width: '40px', height: '22px', background: theme === 'dark' ? 'var(--accent)' : '#cbd5e1', 
                        borderRadius: '20px', position: 'relative', transition: '0.3s' 
                    }}>
                        <div style={{ 
                            width: '16px', height: '16px', background: 'white', borderRadius: '50%', 
                            position: 'absolute', top: '3px', left: theme === 'dark' ? '21px' : '3px', transition: '0.3s' 
                        }}></div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSave} 
                disabled={uploading} 
                className="voice-btn" 
                style={{ width: '100%', height: '50px', borderRadius: '14px', fontSize: '1rem', fontWeight: 700 }}
            >
                {uploading ? 'Applying Changes...' : 'Save Settings'}
            </button>
        </div>
    );
};

export default Profile;
