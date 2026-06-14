import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { StyleSheet } from 'react-native';
import { store } from '../src/store';
import { loadWorkouts } from '../src/store/slices/workoutsSlice';
import { loadProfile } from '../src/store/slices/profileSlice';
import { notificationsService } from '../src/services/notificationsService';
import { Colors } from '../src/constants/theme';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load persisted data on app start
    store.dispatch(loadWorkouts());
    store.dispatch(loadProfile());

    // Request notification permissions (non-blocking)
    notificationsService.requestPermissions();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <AppInitializer>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="workout/active"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="workout/[id]"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="workout/new"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        </AppInitializer>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});
