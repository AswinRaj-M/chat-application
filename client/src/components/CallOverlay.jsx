import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, UserPlus, MessageSquare, X } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';

const CallOverlay = () => {
    const {
        call, callAccepted, myVideo, userVideo,
        stream, callEnded, leaveCall, rejectCall, toggleMute, isMuted, answerCall, getMedia
    } = useContext(SocketContext);

    const [duration, setDuration] = useState(0);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    useEffect(() => {
        let timer;
        if (callAccepted && !callEnded) {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(timer);
    }, [callAccepted, callEnded]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = async () => {
        const video = call.callType === 'video';
        const s = await getMedia(video, true);
        if (s) answerCall(s);
    };

    if (callEnded || (!call.isReceivingCall && !callAccepted && !call.from)) return null;

    // 1. Incoming Call UI
    if (call.isReceivingCall && !callAccepted) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="calling-screen"
            >
                <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={32} color="#818cf8" />
                </div>
                
                <span className="incoming-tag">Incoming Call</span>
                
                <h1 className="caller-name-lg">{call.name || "Unknown Caller"}</h1>
                <p className="caller-subtext">Voice Call...</p>
                
                <div className="profile-img-container">
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring" style={{ animationDelay: '0.5s' }}></div>
                    <img 
                        src={`https://ui-avatars.com/api/?name=${call.name || 'U'}&background=4338ca&color=fff&size=200`} 
                        alt="Caller" 
                        className="profile-img-large" 
                    />
                </div>
                
                <button className="glass-pill">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} />
                        Reply with Message
                    </div>
                </button>
                
                <div className="call-actions-row">
                    <div className="call-action-btn" onClick={rejectCall}>
                        <div className="circle-btn-lg btn-decline">
                            <PhoneOff size={32} style={{ transform: 'rotate(0deg)' }} />
                        </div>
                        <span className="action-label">Decline</span>
                    </div>
                    
                    <div className="call-action-btn" onClick={handleAnswer}>
                        <div className="circle-btn-lg btn-accept">
                            <Phone size={32} />
                        </div>
                        <span className="action-label">Accept</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    // 2. Active Call UI
    if (callAccepted && !callEnded) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="calling-screen"
            >
                {call.callType === 'video' ? (
                    <div className="video-modal-v2">
                        <video playsInline ref={userVideo} autoPlay className="remote-video-full" />
                        <div className="local-video-pip">
                            <video playsInline muted ref={myVideo} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        
                        {/* Overlay controls on video */}
                        <div style={{ position: 'absolute', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '0 2rem' }}>
                            <div className="controls-glass-panel">
                                <div className="control-item" onClick={toggleMute}>
                                    <div className={`circle-btn-md ${isMuted ? 'active' : ''}`}>
                                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                    </div>
                                    <span className="control-label">Mute</span>
                                </div>
                                <div className="control-item" onClick={() => setIsSpeakerOn(!isSpeakerOn)}>
                                    <div className={`circle-btn-md ${isSpeakerOn ? 'active' : ''}`}>
                                        <Volume2 size={24} />
                                    </div>
                                    <span className="control-label">Speaker</span>
                                </div>
                                <div className="control-item">
                                    <div className="circle-btn-md active">
                                        <Video size={24} />
                                    </div>
                                    <span className="control-label">Video</span>
                                </div>
                                <div className="control-item">
                                    <div className="circle-btn-md">
                                        <UserPlus size={24} />
                                    </div>
                                    <span className="control-label">Add</span>
                                </div>
                            </div>
                            
                            <button className="end-call-pill" onClick={leaveCall}>
                                End Call
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="active-call-header">
                            <div className="duration-pill">
                                <div className="dot-green"></div>
                                {formatDuration(duration)}
                            </div>
                            <h1 className="caller-name-lg" style={{ marginTop: '0.5rem' }}>{call.name || "Sarah Jenkins"}</h1>
                            <p className="caller-subtext">Active Call</p>
                        </div>
                        
                        <div className="active-profile-container">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${call.name || 'S'}&background=4338ca&color=fff&size=260`} 
                                alt="Active Caller" 
                                className="active-profile-img" 
                            />
                        </div>
                        
                        <div className="call-actions-row" style={{ flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                            <div className="controls-glass-panel">
                                <div className="control-item" onClick={toggleMute}>
                                    <div className={`circle-btn-md ${isMuted ? 'active' : ''}`}>
                                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                    </div>
                                    <span className="control-label">Mute</span>
                                </div>
                                <div className="control-item" onClick={() => setIsSpeakerOn(!isSpeakerOn)}>
                                    <div className={`circle-btn-md ${isSpeakerOn ? 'active' : ''}`}>
                                        <Volume2 size={24} />
                                    </div>
                                    <span className="control-label">Speaker</span>
                                </div>
                                <div className="control-item">
                                    <div className="circle-btn-md">
                                        <Video size={24} />
                                    </div>
                                    <span className="control-label">Video</span>
                                </div>
                                <div className="control-item">
                                    <div className="circle-btn-md">
                                        <UserPlus size={24} />
                                    </div>
                                    <span className="control-label">Add</span>
                                </div>
                            </div>
                            
                            <button className="end-call-pill" onClick={leaveCall}>
                                End Call
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        );
    }

    // Default return for cases like "Calling..." (where I am the initiator)
    if (call.from === 'me' || (!call.isReceivingCall && call.userToCall)) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="calling-screen"
            >
                <div className="active-call-header">
                    <div className="duration-pill" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        Calling...
                    </div>
                    <h1 className="caller-name-lg" style={{ marginTop: '0.5rem' }}>{call.name || "User"}</h1>
                    <p className="caller-subtext">Waiting for answer</p>
                </div>
                
                <div className="active-profile-container">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${call.name || 'U'}&background=4338ca&color=fff&size=260`} 
                        alt="Calling" 
                        className="active-profile-img" 
                    />
                </div>
                
                <div className="call-actions-row" style={{ marginTop: 'auto' }}>
                    <div className="call-action-btn" onClick={leaveCall}>
                        <div className="circle-btn-lg btn-decline">
                            <PhoneOff size={32} />
                        </div>
                        <span className="action-label">Cancel</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    return null;
};

export default CallOverlay;
