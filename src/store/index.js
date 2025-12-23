import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import groupReducer from './slices/groupSlice';
import threadReducer from './slices/threadSlice';
import adminReducer from './slices/adminSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        groups: groupReducer,
        threads: threadReducer,
        admin: adminReducer
    }
});