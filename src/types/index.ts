// ─── Core Domain Types ────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full_body';

export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'custom';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// ─── Exercise ─────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  category: WorkoutCategory;
  description: string;
  imageUrl?: string;
}

// ─── Workout Set ──────────────────────────────────────────────────────────────

export interface WorkoutSet {
  id: string;
  reps?: number;
  weight?: number;     // in kg
  duration?: number;   // in seconds (for cardio/timed sets)
  distance?: number;   // in km (for cardio)
  completed: boolean;
  restTime?: number;   // in seconds
}

// ─── Workout Exercise ─────────────────────────────────────────────────────────

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

// ─── Workout Session ──────────────────────────────────────────────────────────

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;             // ISO string
  startTime: string;        // ISO string
  endTime?: string;         // ISO string
  duration?: number;        // in seconds
  exercises: WorkoutExercise[];
  notes?: string;
  photoUri?: string;
  location?: WorkoutLocation;
  totalVolume?: number;     // sum of (weight * reps) across all sets
  caloriesBurned?: number;
  isCompleted: boolean;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface WorkoutLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

// ─── Workout Template ─────────────────────────────────────────────────────────

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkoutCategory;
  difficulty: DifficultyLevel;
  estimatedDuration: number; // in minutes
  exercises: Array<{
    exercise: Exercise;
    defaultSets: number;
    defaultReps?: number;
    defaultWeight?: number;
    defaultDuration?: number;
  }>;
  muscleGroups: MuscleGroup[];
}

// ─── Personal Record ──────────────────────────────────────────────────────────

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number; // weight * reps
  date: string;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  weight?: number;   // in kg
  height?: number;   // in cm
  fitnessGoal?: 'lose_weight' | 'build_muscle' | 'improve_endurance' | 'stay_fit';
  avatarUri?: string;
  weeklyGoal?: number; // workouts per week
  joinedDate: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface WeeklyStats {
  weekStart: string;
  totalWorkouts: number;
  totalDuration: number;  // seconds
  totalVolume: number;
  totalCalories: number;
}

// ─── Async State ──────────────────────────────────────────────────────────────

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootTabParamList = {
  index: undefined;
  workouts: undefined;
  progress: undefined;
  profile: undefined;
};
