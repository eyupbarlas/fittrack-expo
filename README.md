# FitTrack 🏋️

A feature-rich fitness and workout tracking mobile app built with **React Native (Expo)**, designed for the Mobile Programming Languages laboratory course.

---

## 📸 Screenshots

| Home Dashboard | Active Workout | Progress |
|:-:|:-:|:-:|
| _Weekly goal ring, recent workouts, streak_ | _Live timer, set tracking, exercise picker_ | _Personal records, 7-day bar chart_ |

> Screenshots will be added after first build. Run the app and take them with `expo-screenshot`.

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native + Expo SDK 52 |
| Navigation | Expo Router (file-based) |
| State Management | Redux Toolkit |
| Animations | React Native Reanimated v3 |
| Gestures | React Native Gesture Handler |
| Haptics | Expo Haptics |
| Storage | AsyncStorage (data) + SecureStore (sensitive) |
| Notifications | Expo Notifications |
| Location | Expo Location |
| Camera/Photos | Expo Image Picker |
| Testing | Jest + React Native Testing Library |
| Linting | ESLint + Prettier |

---

## 📁 Project Structure

```
fittrack-expo/
├── app/                      # Expo Router screens (file-based routing)
│   ├── (tabs)/               # Bottom tab navigator
│   │   ├── _layout.tsx       # Tab bar configuration
│   │   ├── index.tsx         # 🏠 Home / Dashboard
│   │   ├── workouts.tsx      # 🏋️ Workout history
│   │   ├── progress.tsx      # 📈 Progress & stats
│   │   └── profile.tsx       # 👤 User profile
│   ├── workout/
│   │   ├── active.tsx        # Live workout tracking (modal)
│   │   ├── new.tsx           # New workout / template picker (modal)
│   │   └── [id].tsx          # Workout detail view
│   └── _layout.tsx           # Root layout + Redux Provider
│
└── src/
    ├── components/
    │   ├── common/           # Button, Card, StatBadge, EmptyState
    │   ├── workout/          # WorkoutCard (swipe-to-delete), SetRow
    │   └── progress/         # ProgressRing (animated SVG)
    ├── constants/
    │   ├── theme.ts          # Colors, spacing, typography, shadows
    │   └── workoutData.ts    # Exercise library + workout templates
    ├── hooks/
    │   ├── useAppStore.ts    # Typed Redux hooks
    │   ├── useWorkoutTimer.ts # Live timer hook
    │   ├── useHaptics.ts     # Haptic feedback hook
    │   ├── useLocation.ts    # GPS location hook
    │   └── useNetworkStatus.ts # Offline detection hook
    ├── services/
    │   ├── storageService.ts # AsyncStorage abstraction
    │   └── notificationsService.ts # Push notification helpers
    ├── store/
    │   ├── index.ts          # Redux store configuration
    │   └── slices/
    │       ├── workoutsSlice.ts # Workout sessions state
    │       └── profileSlice.ts  # User profile state
    ├── types/
    │   └── index.ts          # TypeScript domain types
    ├── utils/
    │   └── formatters.ts     # Date, weight, volume formatters
    └── __tests__/            # Test suites
        ├── formatters.test.ts
        ├── workoutsSlice.test.ts
        ├── useWorkoutTimer.test.ts
        ├── components.test.tsx
        └── storageService.test.ts
```

---

## 🛠 Setup & Installation

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android) **or** an emulator

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/eyupbarlas/fittrack-expo.git
cd fittrack-expo

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start

# 4. Scan the QR code with Expo Go, or press:
#    'a' for Android emulator
#    'i' for iOS simulator
```

### Running Tests

```bash
# Run all tests
npm test

# With coverage report
npm run test:coverage

# Watch mode during development
npm run test -- --watchAll
```

### Linting

```bash
# Check for lint errors
npm run lint

# Auto-fix fixable issues
npm run lint:fix
```

---

## 📦 Building with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure (first time only)
eas build:configure

# Build a preview APK (Android)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview
```

The `eas.json` file contains `development`, `preview`, and `production` build profiles.

---

## ✅ Evaluation Criteria Coverage

### Base Criteria (Grade 4.0)

| # | Criterion | Implementation |
|---|---|---|
| 1 | Architecture | Redux Toolkit (`store/slices/`), custom hooks, service layer |
| 2 | Screen sizes | Flexbox layout, `useWindowDimensions`, no hardcoded widths |
| 3 | Code quality | ESLint + Prettier, TypeScript strict mode, <150-line components |
| 4 | Tests | 5 test files, 30+ test cases covering hooks, reducers, utils, components |
| 5 | Documentation | This README + JSDoc comments on hooks and services |
| 6 | Native features | GPS Location, Image Picker (camera/gallery), Notifications, Haptics |
| 7 | Async ops | try/catch/finally everywhere, loading/error/success states |
| 8 | Navigation | Expo Router: tabs + stack + modals (3 navigation types) |
| 9 | Performance | FlatList with `removeClippedSubviews`, `initialNumToRender`, `React.memo` |
| 10 | UI/UX | Consistent dark theme (`theme.ts`), React Native Paper-inspired components |
| 11 | State management | Redux Toolkit with typed slices, local `useState` for UI state |
| 12 | Error handling | Alert dialogs, permission denial handling, try/catch on all async |
| 13 | Offline mode | AsyncStorage cache, loads persisted data when offline |
| 14 | Security | No API keys in code; `.env` in `.gitignore`; inputs validated |
| 15 | Deployment | EAS build configured, `app.json` with icon/splash/permissions |

### Extended Criterion D — Animations, Gestures & Haptics

| Feature | Implementation |
|---|---|
| **Animations** | `FadeInDown` enter animations on every screen; animated SVG `ProgressRing` with Reanimated; button press scale spring; set completion bounce |
| **Gestures** | Swipe-to-delete on `WorkoutCard` using Gesture Handler `Pan + Tap` composed gesture; snap reveal with collapse animation on confirm |
| **Haptics** | `useHaptics` hook: light tap on selections, `success` on workout finish and set completion, `warning` on delete/discard |

---

## 🏃 Core Features

- **Workout Templates** — 5 pre-built templates (Push, Pull, Legs, Cardio, HIIT)
- **Live Workout Tracking** — Running timer, per-set weight/reps logging with completion toggle
- **Exercise Library** — 15 exercises with muscle group tagging
- **Progress Dashboard** — Weekly goal ring, 7-day activity chart, personal records
- **Swipe to Delete** — Gesture-based delete with collapse animation
- **GPS Tagging** — Optionally tag workouts with location + reverse geocoding
- **Daily Reminders** — Scheduled push notification via Expo Notifications
- **Workout Streak** — Consecutive active days counter on the dashboard
- **Profile** — Name, weight, height, weekly goal, avatar from photo library

---

## 📄 License

MIT — free to use for educational purposes.
