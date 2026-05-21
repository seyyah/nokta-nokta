const fs = require("fs");
const path = require("path");

const packageRoot = path.join(__dirname, "..", "node_modules", "@xtatistix", "mobile-audit", "src", "components");

function writeIfChanged(file, source, patched) {
  if (patched !== source) {
    fs.writeFileSync(file, patched);
    console.log(`[patch-mobile-audit] patched ${path.basename(file)}`);
  }
}

function patchSelector() {
  const file = path.join(packageRoot, "AuditSelector.tsx");
  if (!fs.existsSync(file)) return;

  const source = fs.readFileSync(file, "utf8");
  const patched = source
    .replace(/const \{ width: SCREEN_W, height: SCREEN_H \} = Dimensions\.get\('screen'\);/g, "const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');")
    .replace(/bottom: 48,/g, "bottom: 24,");

  writeIfChanged(file, source, patched);
}

function patchOverlay() {
  const file = path.join(packageRoot, "AuditOverlay.tsx");
  if (!fs.existsSync(file)) return;

  const source = fs.readFileSync(file, "utf8");
  let patched = source
    .replace(/const PREVIEW_H = [^;\n]+;[^\n]*/g, "const PREVIEW_H = Platform.OS === 'web' ? 96 : 140; // compact on web so actions stay visible")
    .replace(/behavior=\{Platform\.OS === 'ios' \? 'padding' : 'height'\}/g, "behavior={Platform.OS === 'ios' ? 'padding' : undefined}")
    .replace(/const screenW = Dimensions\.get\('screen'\)\.width;/g, "const screenW = Dimensions.get('window').width;")
    .replace(/const screenH = Dimensions\.get\('screen'\)\.height;/g, "const screenH = Dimensions.get('window').height;")
    .replace(/style=\{styles\.input\}|style=\{\[styles\.input, Platform\.OS === 'web' && styles\.inputWeb\]\}/g, "style={[styles.input, Platform.OS === 'web' && styles.inputWeb]}")
    .replace(/\n\s*autoFocus[^\n]*/g, "\n            autoFocus={Platform.OS !== 'web'}")
    .replace(/paddingBottom: 40,/g, "maxHeight: '92%',\n    paddingBottom: Platform.OS === 'web' ? 20 : 40,");

  patched = patched.replace(/(\n  inputWeb: \{\n    minHeight: 64,\n  \},)+/g, "\n  inputWeb: {\n    minHeight: 64,\n  },");

  if (!patched.includes("inputWeb: {")) {
    patched = patched.replace("  actions: {", "  inputWeb: {\n    minHeight: 64,\n  },\n  actions: {");
  }

  writeIfChanged(file, source, patched);
}

patchSelector();
patchOverlay();
