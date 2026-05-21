# IDEA

This Track A submission treats nokta-audit as a quiet boundary object between a mobile tester and a coding agent. The host app is deliberately small: three screens, one router-derived screen name, one dependency bundle, and one audit mount. The interesting part is not UI volume; it is the discipline that the package never becomes the owner of navigation, storage choice, or native imports.

The use case is a solo developer reviewing a mobile flow after a customer call. The customer can point at a specific visual issue, write a short note, and export a Markdown artifact. The developer can hand that artifact to Codex and run a time-boxed forge loop. In this version, the app models that closed loop with Capture, Reports, and Forge screens so every audit report can map directly to one narrow repair.

The main design constraint is reversibility. If the audit package is removed, the product surface still runs as a compact tri-screen Expo Router app. If the storage implementation changes, only the host storage adapter changes. If sharing changes from Expo Sharing to a future in-house bridge, only the host `deps.shareFile` implementation changes.
