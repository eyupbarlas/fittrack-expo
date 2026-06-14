import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../../types';

const STORAGE_KEY = 'fittrack_profile';

export const loadProfile = createAsyncThunk('profile/load', async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
});

export const saveProfile = createAsyncThunk('profile/save', async (profile: UserProfile) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
});

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile(state) {
      state.profile = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadProfile.pending, state => {
        state.isLoading = true;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isLoading = false;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load profile';
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to save profile';
      });
  },
});

export const { updateProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
