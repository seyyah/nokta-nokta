# APK Build Instructions

This guide explains how to build a standalone `.apk` file using **EAS Build** (Expo Application Services).

---

## Prerequisites

- Expo account → https://expo.dev/signup (free)
- Node.js ≥ 18
- EAS CLI installed globally

```bash
npm install -g eas-cli
```

---

## Step 1 — Login

```bash
eas login
```

Enter your Expo credentials when prompted.

---

## Step 2 — Navigate to app folder

```bash
cd submissions/2021xxxx-nokta/app
```

---

## Step 3 — Configure EAS (first time only)

```bash
eas build:configure
```

This creates `eas.json` in the app folder. When asked, choose **Android**.

Your `eas.json` should include a `preview` profile:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## Step 4 — Build the APK

```bash
eas build --platform android --profile preview
```

- Build runs in the cloud (no Android SDK needed locally)
- Takes ~5–10 minutes
- You'll get a download link when complete

---

## Step 5 — Download & Install

1. Open the link from terminal output, or go to https://expo.dev/accounts/[your-username]/projects/nokta/builds
2. Download the `.apk` file
3. Transfer to Android device and install (enable "Install from unknown sources" if prompted)

---

## Alternative — Local Build (requires Android SDK)

```bash
npx expo run:android --variant release
```

Requires Android Studio + SDK + connected device or emulator.

---

## Notes

- The `eas.json` file is **not included** in this repo to keep it clean. Run `eas build:configure` to generate it.
- iOS `.ipa` builds require an Apple Developer account ($99/year). Not required for this assignment.
- For internal testing, EAS also supports **internal distribution** via QR code without Play Store publishing.
