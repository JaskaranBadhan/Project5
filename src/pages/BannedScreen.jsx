import React from 'react';
import { Ban } from 'lucide-react';

const BannedScreen = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Ban className="text-red-600" size={48} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Banned</h1>
                <p className="text-gray-600 mb-6">
                    Your account has been banned by an administrator. You no longer have access to this platform.
                </p>
                <p className="text-sm text-gray-500">
                    If you believe this is a mistake, please contact support.
                </p>
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}
                    className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default BannedScreen;
