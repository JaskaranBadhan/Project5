import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getGroups, createGroup, deleteGroup, reset } from '../store/slices/groupSlice';
import { Plus, Users, Lock, Unlock, Trash2, Mail, Check, X, ThumbsUp } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { groups, isLoading, isError, message } = useSelector((state) => state.groups);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false
    });
    const [myInvites, setMyInvites] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            dispatch(getGroups());
            fetchMyInvites();
        }
        return () => {
            dispatch(reset());
        };
    }, [user, navigate, dispatch]);

    const fetchMyInvites = async () => {
        try {
            const res = await api.get('/invites/my');
            setMyInvites(res.data);
        } catch (err) {
            }
    };

    const handleAcceptInvite = async (inviteId) => {
        try {
            await api.post(`/invites/${inviteId}/accept`);
            fetchMyInvites();
            dispatch(getGroups());
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept invite');
        }
    };

    const handleRejectInvite = async (inviteId) => {
        try {
            await api.post(`/invites/${inviteId}/reject`);
            fetchMyInvites();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject invite');
        }
    };

    const onChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: value
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(createGroup(formData));
        setShowModal(false);
        setFormData({ name: '', description: '', isPrivate: false });
    };

    const handleDelete = (e, groupId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this group?')) {
            dispatch(deleteGroup(groupId));
        }
    };

    const handleLikeGroup = async (e, groupId) => {
        e.stopPropagation();
        try {
            await api.post(`/groups/${groupId}/like`);
            dispatch(getGroups());
        } catch (err) {
            }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Groups</h1>
                    <p className="mt-1 text-gray-500">Manage and join study circles</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Create Group
                </button>
            </div>

            {isLoading && <p>Loading groups...</p>}
            {isError && <p className="text-red-500">Error: {message}</p>}

            {myInvites.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="text-purple-600" size={24} />
                        <h2 className="text-2xl font-bold text-gray-900">Pending Invites</h2>
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">{myInvites.length}</span>
                    </div>
                    <div className="space-y-3">
                        {myInvites.map((invite) => (
                            <div key={invite._id} className="bg-white rounded-lg p-4 flex justify-between items-center shadow-sm border border-purple-100">
                                <div>
                                    <h3 className="font-bold text-gray-900">{invite.group.name}</h3>
                                    <p className="text-sm text-gray-500">Invited by: {invite.inviter.username}</p>
                                    <p className="text-xs text-gray-400 mt-1">{invite.group.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptInvite(invite._id)}
                                        className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <Check size={18} /> Accept
                                    </button>
                                    <button
                                        onClick={() => handleRejectInvite(invite._id)}
                                        className="flex items-center gap-1 bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <div key={group._id} onClick={() => navigate(`/groups/${group._id}`)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${group.isPrivate ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {group.isPrivate ? <Lock size={24} /> : <Unlock size={24} />}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{group.members ? group.members.length : 0} members</span>
                                    {user && group.creator && user._id === group.creator._id && (
                                        <button
                                            onClick={(e) => handleDelete(e, group._id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Group"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{group.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2">{group.description}</p>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-400">
                                <span className='flex items-center gap-1'><Users size={14} /> {group.creator && group.creator.username}</span>
                                <button
                                    onClick={(e) => handleLikeGroup(e, group._id)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${group.likes && group.likes.includes(user._id)
                                            ? 'bg-indigo-100 text-indigo-600'
                                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                >
                                    <ThumbsUp size={14} />
                                    <span className="font-medium">{group.likes ? group.likes.length : 0}</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-3 text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-300">You haven't joined any groups yet.</p>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Group</h2>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                                <input type="text" name="name" required value={formData.name} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g., Advanced Physics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" required value={formData.description} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="What is this group about?" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="isPrivate" id="isPrivate" checked={formData.isPrivate} onChange={onChange} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                                <label htmlFor="isPrivate" className="text-sm text-gray-700">Private Group</label>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">Create Group</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
