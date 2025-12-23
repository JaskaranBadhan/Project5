import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, fetchStats, deleteUser, updateUserRole, toggleBanUser, updateUserOnlineStatus } from '../store/slices/adminSlice';
import { Users, Shield, Ban, Trash2, Search, UserCog } from 'lucide-react';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../services/api';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { users, stats, loading, error } = useSelector((state) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');

    useEffect(() => {

        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        dispatch(fetchAllUsers());
        dispatch(fetchStats());

        const socket = io(SERVER_URL);

        socket.on('user_status_changed', ({ userId, isOnline }) => {
            dispatch(updateUserOnlineStatus({ userId, isOnline }));
        });

        return () => {
            socket.disconnect();
        };
    }, [dispatch, user, navigate]);

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await dispatch(deleteUser(userId));

        }
    };

    const handleChangeRole = async (userId, newRole) => {
        if (window.confirm(`Change user role to ${newRole}?`)) {
            await dispatch(updateUserRole({ userId, role: newRole }));

        }
    };

    const handleToggleBan = async (userId) => {
        await dispatch(toggleBanUser(userId));

    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage users and monitor platform activity</p>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Users</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                </div>
                                <Users className="text-indigo-600" size={32} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Admins</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.adminCount}</p>
                                </div>
                                <Shield className="text-purple-600" size={32} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Banned</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.bannedCount}</p>
                                </div>
                                <Ban className="text-red-600" size={32} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">New (7d)</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.recentSignups}</p>
                                </div>
                                <UserCog className="text-green-600" size={32} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Active (7d)</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.recentLogins}</p>
                                </div>
                                <Users className="text-blue-600" size={32} />
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                    </select>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logins</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No users found</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{u.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleChangeRole(u._id, e.target.value)}
                                                    className="text-sm border rounded px-2 py-1"
                                                    disabled={u._id === user._id}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="moderator">Moderator</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {u.isBanned ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                        Banned
                                                    </span>
                                                ) : u.isOnline ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                        Online
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                        Offline
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.loginCount || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleToggleBan(u._id)}
                                                        disabled={u._id === user._id}
                                                        className={`p-2 rounded ${u.isBanned ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        title={u.isBanned ? 'Unban' : 'Ban'}
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        disabled={u._id === user._id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
