import React from 'react';
import NotificationView from './NotificationView';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Notification = () => {
    const navigate = useNavigate();
    
    return (
        <div style={{ background: 'var(--bg-app)', minHeight: '100vh', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button 
                    onClick={() => navigate('/message')}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        background: 'white', border: 'none', padding: '12px 20px', 
                        borderRadius: '12px', cursor: 'pointer', marginBottom: '2rem',
                        fontWeight: 600, boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <ArrowLeft size={20} /> Back to Messages
                </button>
                <div style={{ height: '600px' }}>
                    <NotificationView 
                        notifications={[]} 
                        onClearOne={() => {}} 
                        onClearAll={() => {}} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Notification;
