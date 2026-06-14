import { storageService } from '../services/storageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage is auto-mocked via jest.setup.ts
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('storageService', () => {
  describe('setWorkouts / getWorkouts', () => {
    it('saves and retrieves workout data', async () => {
      const workouts = [{ id: '1', name: 'Push Day' }];
      mockAsyncStorage.setItem.mockResolvedValueOnce();
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(workouts));

      const saveResult = await storageService.setWorkouts(workouts);
      const retrieved = await storageService.getWorkouts();

      expect(saveResult).toBe(true);
      expect(retrieved).toEqual(workouts);
    });

    it('returns null when no workouts stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      const result = await storageService.getWorkouts();
      expect(result).toBeNull();
    });
  });

  describe('setProfile / getProfile', () => {
    it('saves and retrieves profile data', async () => {
      const profile = { id: 'u1', name: 'Eyüp', weeklyGoal: 4, joinedDate: '2024-01-01' };
      mockAsyncStorage.setItem.mockResolvedValueOnce();
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(profile));

      await storageService.setProfile(profile);
      const result = await storageService.getProfile();
      expect(result).toEqual(profile);
    });
  });

  describe('offline queue', () => {
    it('adds operations to the queue', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null); // empty queue
      mockAsyncStorage.setItem.mockResolvedValueOnce();

      const result = await storageService.addToOfflineQueue({ type: 'CREATE', data: { id: '1' } });
      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('clears the queue', async () => {
      mockAsyncStorage.removeItem.mockResolvedValueOnce();
      await storageService.clearOfflineQueue();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        expect.stringContaining('offline_queue')
      );
    });
  });

  describe('setCacheTimestamp', () => {
    it('stores a timestamp string', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce();
      const result = await storageService.setCacheTimestamp();
      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
