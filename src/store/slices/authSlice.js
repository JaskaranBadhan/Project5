import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await api.post('/auth/login', userData);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const response = await api.post('/auth/register', userData);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
});

const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;

const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            });
    }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
