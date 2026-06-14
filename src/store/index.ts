import { configureStore } from '@reduxjs/toolkit';
import workoutsReducer from './slices/workoutsSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    workouts: workoutsReducer,
    profile: profileReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types because they may carry Date objects
        ignoredActions: ['workouts/finishWorkout', 'workouts/startWorkout'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
