import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) return <div className="p-8">Please login to view profile.</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 h-32"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6">
                        <div className="h-32 w-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                            {user.username?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.username}</h1>
                    <p className="text-gray-500 mb-6 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                            {user.role.toUpperCase()}
                        </span>
                    </p>

                    <div className="space-y-4 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-4 text-gray-700">
                            <div className="bg-gray-100 p-2 rounded-lg"><User size={20} /></div>
                            <div>
                                <p className="text-xs text-gray-500">Username</p>
                                <p className="font-medium">{user.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-700">
                            <div className="bg-gray-100 p-2 rounded-lg"><Mail size={20} /></div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-700">
                            <div className="bg-gray-100 p-2 rounded-lg"><Shield size={20} /></div>
                            <div>
                                <p className="text-xs text-gray-500">Role</p>
                                <p className="font-medium capitalize">{user.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
