import React, { useEffect, useState, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import './CallHistory.css'; // We'll assume some basic styling or use inline

const CallHistory = () => {
    const { user } = useContext(SocketContext);
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        fetch(`${import.meta.env.VITE_API_URL}/api/calls/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setCalls(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch call history:", err);
                setLoading(false);
            });
    }, [user]);

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) return <div>Loading history...</div>;

    return (
        <div className="call-history-container">
            <h2>Call History</h2>
            {calls.length === 0 ? <p>No calls yet.</p> : (
                <ul className="call-list">
                    {calls.map(call => {
                        const isCaller = call.callerId._id === user.id;
                        const otherParty = isCaller ? call.receiverId : call.callerId;
                        const isMissed = call.status === 'missed' || call.status === 'rejected';

                        return (
                            <li key={call._id} className={`call-item ${isMissed ? 'missed' : ''}`}>
                                <div className="call-info">
                                    <span className="call-icon">
                                        {isMissed ? '❌' : '📞'}
                                    </span>
                                    <div className="call-details">
                                        <strong>{otherParty ? otherParty.username : 'Unknown'}</strong>
                                        <span className="call-type">
                                            {isCaller ? 'Outgoing' : 'Incoming'} • {formatDate(call.startTime)}
                                        </span>
                                    </div>
                                </div>
                                <div className="call-meta">
                                    <span className={`status ${call.status}`}>{call.status}</span>
                                    {call.duration > 0 && <span className="duration">{formatDuration(call.duration)}</span>}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default CallHistory;
