# Decisions

## 2026-05-21T17:41+03:00 - Track selection

Decision: Track A.

Reasoning: The implementation focuses on microphone-driven voice visualization, low-latency mouth motion, avatar mounting through React Three Fiber, and visible latency reporting. The microphone recorder status interval is set to 50 ms, keeping the UI-to-mouth driver below the 200 ms target in the app pipeline.

## 2026-05-21T17:41+03:00 - Avatar and lipsync pipeline

Decision: Use the Avaturn GLB at `app/avatar.glb` and drive lipsync in two layers.

Reasoning: The provided Avaturn export contains a skinned avatar with Head and Neck bones but does not contain morph target names or blendshape targets. The app still implements the wass08/r3f-lipsync-tutorial style pipeline shape: load GLB with `useGLTF`, traverse meshes, drive recognized viseme or ARKit morph target names when present, and fall back to a procedural mouth mesh bound to the avatar face when morph targets are absent. This keeps the pipeline extensible while making the delivered avatar visibly respond to live microphone input.

## 2026-05-21T17:41+03:00 - Expert bridge

Decision: Use an embedded Jitsi Meet WebRTC room through `react-native-webview`.

Reasoning: Jitsi requires no project key and is suitable for a manual STUCK bridge. The app opens a deterministic room from the `Uzmana Baglan` button, grants WebView media capture, starts audio and video unmuted, and exposes the Jitsi toolbar with the `desktop` screen-share control. Android camera, microphone, and audio permissions are declared in `app.json`; iOS camera and microphone usage descriptions are also declared.

## 2026-05-21T17:41+03:00 - EAS payload size

Decision: Keep `.easignore` scoped to generated folders and local dependency output.

Reasoning: `node_modules`, `.expo`, `android`, and `ios` are ignored so EAS uploads the app source and assets without generated native folders or local dependencies.
