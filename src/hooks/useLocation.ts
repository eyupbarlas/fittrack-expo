import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import type { WorkoutLocation } from '../types';

interface LocationState {
  location: WorkoutLocation | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
}

/**
 * Hook for requesting and fetching GPS location.
 * Used to tag workouts with their location (criterion 6).
 */
export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: false,
    error: null,
    permissionStatus: null,
  });

  const requestAndFetch = useCallback(async (): Promise<WorkoutLocation | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setState(prev => ({ ...prev, permissionStatus: status }));

      if (status !== Location.PermissionStatus.GRANTED) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Location permission denied. Enable it in Settings to tag workouts.',
        }));
        return null;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const workoutLocation: WorkoutLocation = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      };

      // Try to get a human-readable address
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        });
        if (address) {
          workoutLocation.address = [address.street, address.city, address.country]
            .filter(Boolean)
            .join(', ');
        }
      } catch {
        // Address is optional — silently ignore if reverse geocoding fails
      }

      setState(prev => ({ ...prev, location: workoutLocation, isLoading: false }));
      return workoutLocation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return null;
    }
  }, []);

  const clearLocation = useCallback(() => {
    setState(prev => ({ ...prev, location: null, error: null }));
  }, []);

  return {
    ...state,
    requestAndFetch,
    clearLocation,
  };
};
