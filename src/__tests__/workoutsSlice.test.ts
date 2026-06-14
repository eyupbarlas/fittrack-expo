import workoutsReducer, {
  startWorkout,
  finishWorkout,
  discardWorkout,
  deleteWorkout,
  addExerciseToActive,
  addSet,
  removeSet,
  updateSet,
  clearError,
} from '../store/slices/workoutsSlice';
import type { WorkoutSession, WorkoutExercise } from '../types';
import { EXERCISES } from '../constants/workoutData';

const makeSession = (overrides: Partial<WorkoutSession> = {}): WorkoutSession => ({
  id: 'session_001',
  name: 'Test Push Day',
  date: '2024-06-01T10:00:00.000Z',
  startTime: '2024-06-01T10:00:00.000Z',
  exercises: [],
  isCompleted: false,
  ...overrides,
});

const makeExercise = (overrides: Partial<WorkoutExercise> = {}): WorkoutExercise => ({
  id: 'ex_001',
  exercise: EXERCISES[0],
  sets: [{ id: 'set_001', completed: false, reps: 8, weight: 60 }],
  ...overrides,
});

const initialState = {
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,
  lastSynced: null,
};

describe('workoutsSlice', () => {
  describe('startWorkout', () => {
    it('sets the active session', () => {
      const session = makeSession();
      const state = workoutsReducer(initialState, startWorkout(session));
      expect(state.activeSession).toEqual(session);
      expect(state.sessions).toHaveLength(0);
    });
  });

  describe('finishWorkout', () => {
    it('moves active session to sessions array and clears active', () => {
      const session = makeSession({ isCompleted: true, duration: 3600 });
      const stateWithActive = workoutsReducer(initialState, startWorkout(session));
      const finalState = workoutsReducer(stateWithActive, finishWorkout(session));

      expect(finalState.activeSession).toBeNull();
      expect(finalState.sessions).toHaveLength(1);
      expect(finalState.sessions[0].id).toBe('session_001');
    });

    it('prepends the finished session (newest first)', () => {
      const oldSession = makeSession({ id: 'old' });
      const stateWithOld = { ...initialState, sessions: [oldSession] };
      const newSession = makeSession({ id: 'new', isCompleted: true });
      const finalState = workoutsReducer(stateWithOld, finishWorkout(newSession));

      expect(finalState.sessions[0].id).toBe('new');
      expect(finalState.sessions[1].id).toBe('old');
    });
  });

  describe('discardWorkout', () => {
    it('clears the active session without saving', () => {
      const session = makeSession();
      const stateWithActive = workoutsReducer(initialState, startWorkout(session));
      const finalState = workoutsReducer(stateWithActive, discardWorkout());

      expect(finalState.activeSession).toBeNull();
      expect(finalState.sessions).toHaveLength(0);
    });
  });

  describe('deleteWorkout', () => {
    it('removes the specified session by id', () => {
      const s1 = makeSession({ id: 'keep' });
      const s2 = makeSession({ id: 'delete_me' });
      const stateWithSessions = { ...initialState, sessions: [s1, s2] };
      const finalState = workoutsReducer(stateWithSessions, deleteWorkout('delete_me'));

      expect(finalState.sessions).toHaveLength(1);
      expect(finalState.sessions[0].id).toBe('keep');
    });

    it('does nothing if id does not exist', () => {
      const s1 = makeSession({ id: 'existing' });
      const stateWithSession = { ...initialState, sessions: [s1] };
      const finalState = workoutsReducer(stateWithSession, deleteWorkout('nonexistent'));

      expect(finalState.sessions).toHaveLength(1);
    });
  });

  describe('addExerciseToActive', () => {
    it('adds an exercise to the active session', () => {
      const session = makeSession();
      const stateWithActive = workoutsReducer(initialState, startWorkout(session));
      const exercise = makeExercise();
      const finalState = workoutsReducer(stateWithActive, addExerciseToActive(exercise));

      expect(finalState.activeSession?.exercises).toHaveLength(1);
      expect(finalState.activeSession?.exercises[0].id).toBe('ex_001');
    });

    it('does nothing if there is no active session', () => {
      const exercise = makeExercise();
      const state = workoutsReducer(initialState, addExerciseToActive(exercise));
      expect(state.activeSession).toBeNull();
    });
  });

  describe('addSet', () => {
    it('adds a set to the correct exercise', () => {
      const session = makeSession({ exercises: [makeExercise()] });
      const stateWithActive = workoutsReducer(initialState, startWorkout(session));
      const finalState = workoutsReducer(
        stateWithActive,
        addSet({ exerciseId: 'ex_001', set: { id: 'new_set', completed: false } })
      );
      expect(finalState.activeSession?.exercises[0].sets).toHaveLength(2);
    });
  });

  describe('removeSet', () => {
    it('removes the correct set', () => {
      const session = makeSession({
        exercises: [
          makeExercise({
            sets: [
              { id: 'set_a', completed: false },
              { id: 'set_b', completed: true },
            ],
          }),
        ],
      });
      const stateWithActive = workoutsReducer(initialState, startWorkout(session));
      const finalState = workoutsReducer(
        stateWithActive,
        removeSet({ exerciseId: 'ex_001', setId: 'set_a' })
      );
      expect(finalState.activeSession?.exercises[0].sets).toHaveLength(1);
      expect(finalState.activeSession?.exercises[0].sets[0].id).toBe('set_b');
    });
  });

  describe('updateSet', () => {
    it('updates set fields correctly', () => {
      const session = makeSession({ exercises: [makeExercise()] });
      const stateWithActive = workoutsReducer(initialState, startWorkout(session));
      const finalState = workoutsReducer(
        stateWithActive,
        updateSet({ exerciseId: 'ex_001', setId: 'set_001', updates: { completed: true, weight: 80 } })
      );
      const updatedSet = finalState.activeSession?.exercises[0].sets[0];
      expect(updatedSet?.completed).toBe(true);
      expect(updatedSet?.weight).toBe(80);
    });
  });

  describe('clearError', () => {
    it('clears the error field', () => {
      const stateWithError = { ...initialState, error: 'Something went wrong' };
      const finalState = workoutsReducer(stateWithError, clearError());
      expect(finalState.error).toBeNull();
    });
  });
});
