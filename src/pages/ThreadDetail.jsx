import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getThread, createReply, likeThread, deleteThread, likeReply, updateThread } from '../store/slices/threadSlice';
import { MessageSquare, ThumbsUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../services/api';
const ReplyItem = ({ reply, onReply, onLike, currentUserId }) => {
    const dateStr = reply.createdAt ? format(new Date(reply.createdAt), 'MMM d, yyyy') : '';
    const isLiked = reply.likes && reply.likes.includes(currentUserId);
    const likeCount = reply.likes ? reply.likes.length : 0;

    return (
        <div className={`mt-4 ml-8 border-l-2 border-gray-200 pl-4`}>
            <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold">{reply.author?.username || 'Unknown'}</span>
                    <span className="text-xs text-gray-500">{dateStr}</span>
                </div>
                <p className="mt-2 text-gray-800">{reply.body}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <button
                        onClick={() => onLike(reply._id)}
                        className={`hover:text-indigo-600 flex items-center gap-1 ${isLiked ? 'text-indigo-600 font-medium' : ''}`}
                    >
                        <ThumbsUp size={14} /> {likeCount > 0 ? `${likeCount} ` : ''}Like
                    </button>
                    <button onClick={() => onReply(reply._id)} className="flex items-center gap-1 hover:text-indigo-600"><MessageSquare size={14} /> Reply</button>
                </div>
            </div>
        </div>
    );
};

const ThreadDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentThread, isLoading } = useSelector((state) => state.threads);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const socketRef = useRef();
    const [replyBody, setReplyBody] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        dispatch(getThread(id));

        try {
            socketRef.current = io(SERVER_URL);
            socketRef.current.on('thread_updated', (data) => {
                if (data.threadId === id) {
                    dispatch(getThread(id));
                }
            });
        } catch (err) {
            }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [id, dispatch]);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this thread?')) {
            dispatch(deleteThread(id)).then((res) => {
                if (!res.error) {
                    navigate(-1);
                }
            });
        }
    };

    const handleLike = () => {
        dispatch(likeThread(id));
    };

    const handleLikeReply = (replyId) => {
        dispatch(likeReply(replyId));
    };

    const handleReply = (e) => {
        e.preventDefault();
        dispatch(createReply({
            threadId: id,
            replyData: { body: replyBody, parentReply: replyingTo }
        }));
        setReplyBody('');
        setReplyingTo(null);
    };

    if (isLoading || !currentThread) return <div className="p-8">Loading...</div>;

    const threadDate = currentThread.createdAt ? format(new Date(currentThread.createdAt), 'MMM d, yyyy') : '';

    return (
        <div className="max-w-4xl px-4 py-8 mx-auto">
            <div className="p-6 mb-8 bg-white border border-gray-100 shadow-sm rounded-xl">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">{currentThread.title}</h1>
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{currentThread.author?.username || 'Unknown'}</span>
                    <span>•</span>
                    <span>{threadDate}</span>
                </div>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${currentThread.likes && currentThread.likes.includes(user?._id) ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        <ThumbsUp size={16} />
                        <span>{currentThread.likes ? currentThread.likes.length : 0} Likes</span>
                    </button>
                    {(user?._id === currentThread.author?._id || user?.role === 'admin') && (
                        <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                            <Trash2 size={16} /> Delete
                        </button>
                    )}
                </div>

                <div className="prose text-gray-800 max-w-none">
                    {currentThread.body}
                </div>
            </div>

            <div className="mb-8">
                <h3 className="mb-4 text-xl font-bold">Replies</h3>
                <div className="space-y-4">
                    {currentThread.replies && currentThread.replies.map((reply) => (
                        <ReplyItem
                            key={reply._id}
                            reply={reply}
                            onReply={(id) => setReplyingTo(id)}
                            onLike={handleLikeReply}
                            currentUserId={user?._id}
                        />
                    ))}
                </div>
            </div>

            <div className="sticky p-6 bg-white border border-gray-100 shadow-sm rounded-xl bottom-4">
                <h4 className="mb-2 font-medium">{replyingTo ? 'Replying to comment...' : 'Leave a reply'}</h4>
                {replyingTo && <button onClick={() => setReplyingTo(null)} className="mb-2 text-xs text-red-500">Cancel Reply</button>}
                <form onSubmit={handleReply}>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Write your thoughts..."
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        required
                    ></textarea>
                    <div className="flex justify-end mt-2">
                        <button type="submit" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Post Reply</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ThreadDetail;
