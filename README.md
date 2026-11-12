# Routine Sathy Mobile 🌅

Mindful daily routine, circadian rhythm tracking, and morning anchor alarm system built with React Native and Expo.

---

## 🌟 Key Features

### 1. Circadian Morning Anchor Alarm
- **Progressive Volume Crescendo**: Starts at 10% volume and gently ramps to 100% over 2 to 5 minutes to prevent cortisol spikes.
- **Offline-First Audio Bundling**: 4 ambient acoustic themes (`sunrise-forest`, `ocean-waves`, `zen-bowl`, `energetic-dawn`) bundled directly in `assets/sounds/` for 100% offline reliability.
- **REM Bedtime Advisor**: Computes optimal wind-down bedtime based on 90-minute ultradian REM cycles and schedules a gentle reminder.
- **Hydration Awakening Mission**: Optional 1-glass (250ml) water intake challenge that silences the alarm and automatically logs morning hydration.
- **Circadian Snooze Limit**: Strict 3-snooze limit to protect circadian wake-time consistency.

### 2. Daily Anchors & 100-Point Score Formula
- **Wake-up Anchor (Max 30 pts)**: Continuous linear scoring from user's target wake time down to 0 after 4 hours.
- **Hydration Anchor (Max 30 pts)**: Proportional credit toward daily water target (steppers for +250ml, +500ml).
- **Study & Focus Anchor (Max 40 pts)**: Proportional credit toward daily deep focus target.
- **Largest Remainder Point Distribution**: Guarantees that individual integer components strictly sum up to `totalScore` out of 100.
- **7-Day Dynamic Habit Streak Path**: Visual path reflecting circadian consistency and 60+ point milestones.

### 3. Offline Write Queue
- Mutations during connection loss are queued in `sathy_offline_pending_routine`.
- Changes are preserved optimistically in local state.
- Automatically flushes and synchronizes to cloud on next focus or network reconnect.

### 4. Design System & Theming
- Rooted in the **Forest Theme** (`#052418` dark canvas, `#0D5A3A` brand primary, `#F59E0B` sunrise amber).
- Fully adaptive dark/light tokens with centralized `PrimitiveTokens` and semantic palettes.
- Fluid Reanimated tab bar and spring animations.

---

## 🛠 Tech Stack

- **Framework**: [Expo SDK 57](https://expo.dev) + [React Native 0.86](https://reactnative.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **State & Context**: React 19 Contexts (`AuthContext`, `AlarmContext`, `ThemeContext`, `OnboardingContext`)
- **Animation**: [React Native Reanimated 3](https://docs.swmansion.com/react-native-reanimated/)
- **Audio & Haptics**: `expo-audio`, `expo-haptics`
- **Notifications & Background**: `expo-notifications`, `expo-task-manager`
- **Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
- **Type Safety**: TypeScript (Strict mode, 0 errors, 0 ESLint warnings)

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Android Studio (for Android Emulator) or Xcode (for iOS Simulator)
- Expo CLI (`npx expo`)

### Installation

```bash
# Clone the repository and navigate to mobile app
cd routine-sathy-mobile

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root of `routine-sathy-mobile`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_USE_LOCAL=true
EXPO_PUBLIC_LOCAL_IP=10.0.2.2 # Android emulator localhost alias
```

### Running the App

```bash
# Start Metro bundler with clean cache
npx expo start -c

# Run directly on connected Android device/emulator
npx expo run:android

# Run directly on iOS simulator
npx expo run:ios
```

If testing on an Android emulator:
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000
```

---

## 🧪 Quality Assurance & Scripts

```bash
# Type check (must exit with 0 errors)
npx tsc --noEmit

# Lint check (must exit with 0 warnings)
npm run lint

# Lint auto-fix
npm run lint -- --fix
```

---

## 📱 Building for Production

### Android (APK & Google Play AAB)

```bash
# Install EAS CLI globally if not already installed
npm install -g eas-cli

# Configure build profile
eas build:configure

# Build standalone APK for testing
eas build --platform android --profile preview

# Build production App Bundle (AAB) for Google Play Store
eas build --platform android --profile production
```

### iOS (TestFlight & App Store)

```bash
# Build for iOS TestFlight
eas build --platform ios --profile production
```

---

## 📂 Project Architecture

```
routine-sathy-mobile/
├── assets/
│   ├── sounds/               # Bundled offline circadian audio files (.wav)
│   ├── branding/             # App icons, splash screens, logos
│   └── images/               # Illustration assets
├── src/
│   ├── app/                  # Expo Router file-based screens
│   │   ├── (tabs)/           # Main bottom tabs (Today, Progress, Profile)
│   │   ├── login.tsx         # User authentication
│   │   ├── signup.tsx        # Registration
│   │   ├── onboarding.tsx    # Welcome introduction
│   │   └── add-routine.tsx   # Habit manager
│   ├── components/           # Universal UI primitives and design components
│   │   ├── ui/               # Cards, Buttons, Steppers, Modals
│   │   └── illustrations/    # Scalable vector circadian artwork
│   ├── context/              # Global state providers (Alarm, Auth, Theme)
│   ├── features/
│   │   └── today/            # Extracted feature logic & WakePickerModal
│   ├── services/             # API client, alarm scheduler & audio player
│   ├── theme/                # Central design tokens & semantic palettes
│   └── utils/                # Offline queue, date formatting, haptics
├── app.json                  # Expo app configuration & permissions
├── package.json
└── tsconfig.json
```

---

## 📄 License
Routine Sathy is proprietary software. All rights reserved.
