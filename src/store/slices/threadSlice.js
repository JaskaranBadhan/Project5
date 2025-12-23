import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createThread = createAsyncThunk('threads/create', async ({ groupId, threadData }, thunkAPI) => {
    try {
        const response = await api.post(`/groups/${groupId}/threads`, threadData);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getThread = createAsyncThunk('threads/get', async (threadId, thunkAPI) => {
    try {
        const response = await api.get(`/threads/${threadId}`);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const createReply = createAsyncThunk('threads/reply', async ({ threadId, replyData }, thunkAPI) => {
    try {
        const response = await api.post(`/threads/${threadId}/replies`, replyData);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

const initialState = {
    currentThread: null,
    threads: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ''
};

export const likeThread = createAsyncThunk(
    'threads/like',
    async (threadId, thunkAPI) => {
        try {

            const response = await api.put(`/threads/${threadId}/like`, );
            return response.data;
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteThread = createAsyncThunk(
    'threads/delete',
    async (threadId, thunkAPI) => {
        try {

            const response = await api.delete(`/threads/${threadId}`);
            return response.data;
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const likeReply = createAsyncThunk(
    'threads/likeReply',
    async (replyId, thunkAPI) => {
        try {
            const response = await api.put(`/threads/replies/${replyId}/like`, );
            return { replyId, likes: response.data };
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const threadSlice = createSlice({
    name: 'threads',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';

            state.currentThread = null;
        },
        updateThread: (state, action) => {
            if (state.currentThread && state.currentThread._id === action.payload._id) {
                state.currentThread = action.payload;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createThread.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createThread.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;

                state.threads.push(action.payload);
            })
            .addCase(createThread.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getThread.pending, (state, action) => {

                if (!state.currentThread || state.currentThread._id !== action.meta.arg) {
                    state.isLoading = true;
                }
            })
            .addCase(getThread.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.currentThread = action.payload;
            })
            .addCase(getThread.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createReply.fulfilled, (state, action) => {
                if (state.currentThread) {

                    state.currentThread.replies.push(action.payload);
                }
            })
            .addCase(likeThread.fulfilled, (state, action) => {
                if (state.currentThread) {
                    state.currentThread.likes = action.payload;
                }
            })
            .addCase(likeReply.fulfilled, (state, action) => {
                if (state.currentThread && state.currentThread.replies) {
                    const reply = state.currentThread.replies.find(r => r._id === action.payload.replyId);
                    if (reply) {
                        reply.likes = action.payload.likes;
                    }
                }
            })
            .addCase(deleteThread.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.currentThread = null;
            });
    },
});

export const { reset, updateThread } = threadSlice.actions;
export default threadSlice.reducer;
