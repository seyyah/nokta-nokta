# Verify

Run these checks from the app directory unless noted.

```bash
npm install
npm run typecheck
npx expo install --check
npx expo export --platform android
npx expo export:embed --platform android --dev false --minify true --bytecode --entry-file node_modules/expo-router/entry.js --bundle-output C:\codex_tmp\apkpatch-231118060\assets\index.android.bundle --assets-dest C:\codex_tmp\apkpatch-231118060\rn-assets
```

Run these checks from the repo root.

```bash
rg -n "AuditWidget" submissions/231118060-audit-forge/app -g "!node_modules"
rg -n "isMeteringEnabled|canOpenURL|Avatar asset could not be loaded" submissions/231118060-audit-forge/app -g "!node_modules"
git status --short
git diff --name-only origin/codex/231118060-audit-forge
```

APK artifact check:

```bash
python -c "import zipfile; z=zipfile.ZipFile('submissions/231118060-audit-forge/app-release.apk'); print('AndroidManifest.xml' in z.namelist(), 'classes.dex' in z.namelist(), any(n.endswith('.glb') for n in z.namelist()))"
```

Latest APK refresh checks:

```bash
apksigner verify --verbose --print-certs submissions/231118060-audit-forge/app-release.apk
zipalign -c -p 4 submissions/231118060-audit-forge/app-release.apk
```

Expected `AuditWidget` result:

```text
submissions/231118060-audit-forge/app/app/_layout.tsx:<line>: <MobileAudit.AuditWidget ... />
```

Manual checks:

- Capture route asks for mic permission only after user action.
- Mic recording options explicitly keep metering enabled.
- Silence keeps the avatar idle.
- Speech moves both the bars and the avatar mouth.
- Reports route keeps audit evidence readable.
- Bridge route opens the Jitsi room, not a fake local call screen, and reports URL-handler failure inline.
- Diff stays inside `submissions/231118060-audit-forge/`.
- `app-release.apk` is signed, zipaligned and carries the current Hermes bundle.
