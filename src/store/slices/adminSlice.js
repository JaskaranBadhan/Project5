import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const fetchStats = createAsyncThunk(
    'admin/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/stats');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'admin/deleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/users/${userId}`);
            return userId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'admin/updateUserRole',
    async ({ userId, role }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/users/${userId}/role`, { role });
            return { userId, role };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update role');
        }
    }
);

export const toggleBanUser = createAsyncThunk(
    'admin/toggleBanUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/users/${userId}/ban`);
            return { userId, isBanned: response.data.isBanned };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to ban user');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        users: [],
        stats: null,
        loading: false,
        error: null
    },
    reducers: {
        resetError: (state) => {
            state.error = null;
        },
        updateUserOnlineStatus: (state, action) => {
            const { userId, isOnline } = action.payload;
            const user = state.users.find(u => u._id === userId);
            if (user) {
                user.isOnline = isOnline;
            }
        }
    },
    extraReducers: (builder) => {
        builder

            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })

            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u._id !== action.payload);
            })

            .addCase(updateUserRole.fulfilled, (state, action) => {
                const user = state.users.find(u => u._id === action.payload.userId);
                if (user) user.role = action.payload.role;
            })

            .addCase(toggleBanUser.fulfilled, (state, action) => {
                const user = state.users.find(u => u._id === action.payload.userId);
                if (user) user.isBanned = action.payload.isBanned;
            });
    }
});

export const { resetError, updateUserOnlineStatus } = adminSlice.actions;
export default adminSlice.reducer;
