import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getGroups = createAsyncThunk('groups/getAll', async (_, thunkAPI) => {
    try {
        const response = await api.get('/groups');
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const createGroup = createAsyncThunk('groups/create', async (groupData, thunkAPI) => {
    try {
        const response = await api.post('/groups', groupData);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const deleteGroup = createAsyncThunk('groups/delete', async (id, thunkAPI) => {
    try {
        await api.delete(`/groups/${id}`);
        return id;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

const initialState = {
    groups: [],
    currentGroup: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

export const groupSlice = createSlice({
    name: 'groups',
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
            .addCase(getGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getGroups.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.groups = action.payload;
            })
            .addCase(getGroups.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.groups.push(action.payload);
            })
            .addCase(createGroup.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteGroup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.groups = state.groups.filter((group) => group._id !== action.payload);
            })
            .addCase(deleteGroup.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = groupSlice.actions;
export default groupSlice.reducer;
