import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../store/slices/authSlice';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const { email, password } = formData;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            }
        if (isSuccess || user) {

            if (user && user.role === 'admin') {
                navigate('/admin');
            } else {

                navigate('/');
            }
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { email, password };
        dispatch(login(userData));
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-purple-100">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-10 w-10 text-purple-600" />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Admin Portal</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign in to access the admin dashboard</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
                                placeholder="Admin email address"
                                value={email}
                                onChange={onChange}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {isError && <p className="text-red-500 text-sm text-center">{message}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Admin Sign In'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <p className="text-gray-600">
                        Not an admin?{' '}
                        <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                            Regular Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
