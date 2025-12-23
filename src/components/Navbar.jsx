import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../store/slices/authSlice';
import { LogOut, User, FolderPlus, MessageSquare, Shield } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">StudyCircle</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2">
                                    <FolderPlus size={18} /> Groups
                                </Link>

                                {user.role === 'admin' && (
                                    <Link to="/admin" className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <Shield size={18} /> Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={onLogout}
                                    className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                                <div className='h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold'>
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            </>
                        ) : (
                            <>

                                <Link to="/admin/login" className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                    <Shield size={18} /> ADMIN
                                </Link>
                                <Link to="/login" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Login</Link>
                                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
