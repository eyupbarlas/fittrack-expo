import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutSession, WorkoutExercise, WorkoutSet } from '../../types';

const STORAGE_KEY = 'fittrack_workouts';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loadWorkouts = createAsyncThunk('workouts/load', async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
});

export const saveWorkoutsToStorage = createAsyncThunk(
  'workouts/save',
  async (sessions: WorkoutSession[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return sessions;
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface WorkoutsState {
  sessions: WorkoutSession[];
  activeSession: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;
  lastSynced: string | null;
}

const initialState: WorkoutsState = {
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,
  lastSynced: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    startWorkout(state, action: PayloadAction<WorkoutSession>) {
      state.activeSession = action.payload;
    },

    addExerciseToActive(state, action: PayloadAction<WorkoutExercise>) {
      if (state.activeSession) {
        state.activeSession.exercises.push(action.payload);
      }
    },

    removeExerciseFromActive(state, action: PayloadAction<string>) {
      if (state.activeSession) {
        state.activeSession.exercises = state.activeSession.exercises.filter(
          e => e.id !== action.payload
        );
      }
    },

    updateSet(
      state,
      action: PayloadAction<{
        exerciseId: string;
        setId: string;
        updates: Partial<WorkoutSet>;
      }>
    ) {
      if (!state.activeSession) return;
      const exercise = state.activeSession.exercises.find(
        e => e.id === action.payload.exerciseId
      );
      if (!exercise) return;
      const setIndex = exercise.sets.findIndex(s => s.id === action.payload.setId);
      if (setIndex !== -1) {
        exercise.sets[setIndex] = { ...exercise.sets[setIndex], ...action.payload.updates };
      }
    },

    addSet(state, action: PayloadAction<{ exerciseId: string; set: WorkoutSet }>) {
      if (!state.activeSession) return;
      const exercise = state.activeSession.exercises.find(
        e => e.id === action.payload.exerciseId
      );
      if (exercise) {
        exercise.sets.push(action.payload.set);
      }
    },

    removeSet(state, action: PayloadAction<{ exerciseId: string; setId: string }>) {
      if (!state.activeSession) return;
      const exercise = state.activeSession.exercises.find(
        e => e.id === action.payload.exerciseId
      );
      if (exercise) {
        exercise.sets = exercise.sets.filter(s => s.id !== action.payload.setId);
      }
    },

    updateActiveSession(state, action: PayloadAction<Partial<WorkoutSession>>) {
      if (state.activeSession) {
        state.activeSession = { ...state.activeSession, ...action.payload };
      }
    },

    finishWorkout(state, action: PayloadAction<WorkoutSession>) {
      state.sessions.unshift(action.payload);
      state.activeSession = null;
      state.lastSynced = new Date().toISOString();
    },

    discardWorkout(state) {
      state.activeSession = null;
    },

    deleteWorkout(state, action: PayloadAction<string>) {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
    },

    updateWorkout(state, action: PayloadAction<WorkoutSession>) {
      const idx = state.sessions.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) {
        state.sessions[idx] = action.payload;
      }
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(loadWorkouts.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWorkouts.fulfilled, (state, action) => {
        state.sessions = action.payload;
        state.isLoading = false;
        state.lastSynced = new Date().toISOString();
      })
      .addCase(loadWorkouts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load workouts';
      })
      .addCase(saveWorkoutsToStorage.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to save workouts';
      });
  },
});

export const {
  startWorkout,
  addExerciseToActive,
  removeExerciseFromActive,
  updateSet,
  addSet,
  removeSet,
  updateActiveSession,
  finishWorkout,
  discardWorkout,
  deleteWorkout,
  updateWorkout,
  clearError,
} = workoutsSlice.actions;

export default workoutsSlice.reducer;
