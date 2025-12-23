import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send, User, MessageSquare, Paperclip, X, FileText, MoreVertical, Trash2, ThumbsUp, Reply as ReplyIcon, MapPin } from 'lucide-react';
import FilePreviewModal from '../components/FilePreviewModal';
import api, { SERVER_URL } from '../services/api';
import { io } from 'socket.io-client';

const PrivateChat = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [files, setFiles] = useState([]);
    const [replyTo, setReplyTo] = useState(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const activeConversationRef = useRef(null);

    // File Preview State
    const [previewFile, setPreviewFile] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const openPreview = (file) => {
        setPreviewFile({
            url: `${SERVER_URL}/uploads/${file.path.split(/[\\/]/).pop()}`,
            name: file.name,
            type: file.mimetype
        });
        setShowPreviewModal(true);
    };

    useEffect(() => {
        socketRef.current = io(SERVER_URL);

        const fetchConversations = async () => {
            setLoading(true);
            try {
                const res = await api.get('/private-chat');
                setConversations(res.data);

                if (userId) {
                    const startRes = await api.post('/private-chat/start', { recipientId: userId });
                    setActiveConversation(startRes.data);

                    if (!res.data.find(c => c._id === startRes.data._id)) {
                        setConversations(prev => [startRes.data, ...prev]);
                    }
                }
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();

        socketRef.current.on('receive_private_message', (message) => {
            const currentConvo = activeConversationRef.current;
            if (currentConvo && currentConvo._id === message.conversationId) {
                setMessages(prev => {
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
            updateConversationList(message);
        });

        socketRef.current.on('update_private_message', (updatedMessage) => {
            const currentConvo = activeConversationRef.current;
            if (currentConvo && currentConvo._id === updatedMessage.conversationId) {
                setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
            }

        });

        return () => socketRef.current.disconnect();
    }, [userId]);

    const updateConversationList = (message) => {
        setConversations(prev => {
            return prev.map(c => {
                if (c._id === message.conversationId) {
                    return { ...c, lastMessage: message, updatedAt: new Date() };
                }
                return c;
            }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });
    };

    useEffect(() => {
        if (!activeConversation) return;

        activeConversationRef.current = activeConversation;

        socketRef.current.emit('join_conversation', activeConversation._id);

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/private-chat/${activeConversation._id}/messages`);
                setMessages(res.data);
            } catch (err) { }
        };
        fetchMessages();
    }, [activeConversation]);

    const prevMessagesLen = useRef(0);

    useEffect(() => {
        if (messages.length > prevMessagesLen.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevMessagesLen.current = messages.length;
    }, [messages]);

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!input.trim() && files.length === 0) || !activeConversation) return;

        try {
            const formData = new FormData();
            formData.append('conversationId', activeConversation._id);
            formData.append('content', input);
            if (replyTo) formData.append('replyTo', replyTo._id);

            files.forEach(file => {
                formData.append('files', file);
            });

            const res = await api.post('/private-chat/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setInput('');
            setFiles([]);
            setReplyTo(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) { }
    };

    const handleLike = async (msgId) => {

        setMessages(prev => prev.map(msg => {
            if (msg._id === msgId) {
                const userIdStr = user._id.toString();
                const isLiked = msg.likes.includes(userIdStr);
                return {
                    ...msg,
                    likes: isLiked
                        ? msg.likes.filter(id => id !== userIdStr)
                        : [...msg.likes, userIdStr]
                };
            }
            return msg;
        }));

        try {
            await api.put(`/private-chat/messages/${msgId}/like`);
        } catch (err) {
        }
    };

    const handleDelete = async (msgId) => {
        if (!window.confirm('Delete for everyone?')) return;

        setMessages(prev => prev.map(msg => {
            if (msg._id === msgId) {
                return { ...msg, isDeleted: true, deletedBy: user._id };
            }
            return msg;
        }));

        try {
            await api.delete(`/private-chat/messages/${msgId}`);
        } catch (err) { }
    };

    const handleLocationShare = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            if (!activeConversation) return;

            try {
                const formData = new FormData();
                formData.append('conversationId', activeConversation._id);
                formData.append('lat', latitude);
                formData.append('lng', longitude);

                await api.post('/private-chat/messages', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } catch (err) {
                console.error("Location share error:", err);
                alert("Failed to share location. Please try again.");
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            let errorMessage = 'Unable to retrieve your location';
            if (error.code === 1 && error.message.includes('secure origin')) {
                errorMessage = "Location sharing requires HTTPS or localhost. For local testing on other devices, go to chrome://flags/#unsafely-treat-insecure-origin-as-secure and add your local IP.";
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }
            alert(errorMessage);
        });
    };

    const handleDeleteConversation = async (e, conversationId) => {
        e.stopPropagation();
        if (!window.confirm('Delete this entire conversation? This cannot be undone.')) return;

        try {
            await api.delete(`/private-chat/${conversationId}`);
            setConversations(prev => prev.filter(c => c._id !== conversationId));
            if (activeConversation && activeConversation._id === conversationId) {
                setActiveConversation(null);
                setMessages([]);
            }
        } catch (err) {
            alert('Failed to delete conversation');
        }
    };

    const getOtherParticipant = (convo) => {
        return convo.participants.find(p => p._id !== user._id) || {};
    };

    return (
        <div className="w-full h-[calc(100vh-64px)] flex bg-gray-50">
            <FilePreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                fileUrl={previewFile?.url}
                fileName={previewFile?.name}
                fileType={previewFile?.type}
            />

            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare /> Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(convo => {
                        const other = getOtherParticipant(convo);
                        return (
                            <div
                                key={convo._id}
                                onClick={() => setActiveConversation(convo)}
                                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 group flex items-center justify-between ${activeConversation?._id === convo._id ? 'bg-indigo-50' : ''}`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                                        {other.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-semibold text-gray-900 truncate">{other.username}</h4>
                                            <span className="text-xs text-gray-400">
                                                {convo.updatedAt && new Date(convo.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {convo.lastMessage?.content || <span className="italic">No messages yet</span>}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleDeleteConversation(e, convo._id)}
                                    className="ml-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Conversation"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 bg-white flex flex-col">
                {activeConversation ? (
                    <>
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {getOtherParticipant(activeConversation).username?.[0]?.toUpperCase()}
                            </div>
                            <h3 className="text-lg font-bold">{getOtherParticipant(activeConversation).username}</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender._id === user._id || msg.sender === user._id;
                                return (
                                    <div
                                        key={idx}
                                        id={`message-${msg._id}`}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-colors duration-1000`}
                                    >
                                        <div className={`max-w-[70%] relative group`}>

                                            <div className={`absolute top-0 ${isMe ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-sm border rounded-lg p-1`}>
                                                <button onClick={() => handleLike(msg._id)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600" title="Like">
                                                    <ThumbsUp size={14} />
                                                </button>
                                                <button onClick={() => { setReplyTo(msg); document.querySelector('input[type="text"]')?.focus(); }} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600" title="Reply">
                                                    <ReplyIcon size={14} />
                                                </button>
                                                {isMe && (
                                                    <button onClick={() => handleDelete(msg._id)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {msg.replyTo && (
                                                <div
                                                    onClick={() => {
                                                        const targetOption = document.getElementById(`message-${msg.replyTo._id}`);
                                                        if (targetOption) {
                                                            targetOption.scrollIntoView({ behavior: 'smooth', block: 'center' });

                                                            targetOption.classList.add('bg-blue-50');
                                                            setTimeout(() => targetOption.classList.remove('bg-blue-50'), 2000);
                                                        } else {
                                                            alert('Original message not found (older messages may not be loaded)');
                                                        }
                                                    }}
                                                    className={`text-xs p-2 mb-1 rounded opacity-70 border-l-2 cursor-pointer hover:opacity-100 transition-opacity ${isMe ? 'bg-indigo-700 border-indigo-300 text-indigo-100' : 'bg-gray-200 border-gray-400 text-gray-600'}`}
                                                >
                                                    <span className="font-bold">{msg.replyTo.sender?.username || 'User'}</span>: {msg.replyTo.content?.substring(0, 30) || '...'}
                                                </div>
                                            )}

                                            <div className={`px-4 py-2 rounded-lg ${isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>

                                                {!msg.isDeleted && msg.files && msg.files.length > 0 && (
                                                    <div className="mb-2 space-y-2">
                                                        {msg.files.map((file, i) => (
                                                            <div key={i}>
                                                                {file.mimetype && file.mimetype.startsWith('image/') ? (
                                                                    <img
                                                                        src={`${SERVER_URL}/uploads/${file.path.split(/[\\/]/).pop()}`}
                                                                        alt="attachment"
                                                                        className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                        onClick={() => openPreview(file)}
                                                                    />
                                                                ) : (
                                                                    <button
                                                                        onClick={() => openPreview(file)}
                                                                        className={`flex items-center gap-2 p-2 rounded ${isMe ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-gray-200 hover:bg-gray-300'} transition-colors w-full text-left`}
                                                                    >
                                                                        <FileText size={16} />
                                                                        <span className="text-sm underline truncate">{file.name}</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {!msg.isDeleted && msg.location && (
                                                    <div className="mb-2 w-64 h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            frameBorder="0"
                                                            src={`https://maps.google.com/maps?q=${msg.location.lat},${msg.location.lng}&z=15&output=embed`}
                                                            title="Location"
                                                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                                        />
                                                        <div className="p-1 text-xs text-center bg-white border-t">
                                                            <a
                                                                href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                📍 Open in Google Maps
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {msg.isDeleted ? (
                                                    <p className="italic opacity-70 text-sm">🚫 This message was deleted by {msg.deletedBy?.username || msg.sender?.username || 'User'}</p>
                                                ) : (
                                                    msg.content && <p>{msg.content}</p>
                                                )}

                                                <div className={`flex items-center justify-end gap-2 mt-1 text-[10px] ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                    {msg.likes && msg.likes.length > 0 && (
                                                        <span className="flex items-center gap-0.5"><ThumbsUp size={10} /> {msg.likes.length}</span>
                                                    )}
                                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {replyTo && (
                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                                <span>Replying to <b>{replyTo.sender.username}</b></span>
                                <button onClick={() => setReplyTo(null)}><X size={16} /></button>
                            </div>
                        )}

                        {files.length > 0 && (
                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-white border px-2 py-1 rounded text-xs">
                                        <span className="truncate max-w-[100px]">{file.name}</span>
                                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 rounded"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2 items-center">
                            <input
                                type="file"
                                multiple
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                                title="Attach File"
                            >
                                <Paperclip size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={handleLocationShare}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                                title="Share Location"
                            >
                                <MapPin size={20} />
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
                                placeholder={files.length > 0 ? "Add a caption..." : "Type a message..."}
                            />
                            <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                        {loading ? (
                            <p>Loading chat...</p>
                        ) : (
                            <>
                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium mb-2">Private Messages</p>
                                <p className="text-sm">Select a conversation or go to a Group to message members.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default PrivateChat;
