const fs = require('fs');
const path = require('path');

const threeCorePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'three',
  'build',
  'three.core.js'
);
const memoizeOnePackagePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-web',
  'node_modules',
  'memoize-one',
  'package.json'
);

const replacements = [
  {
    find: `class Vector2 {\n\n\tstatic {\n\n\t\t/**\n\t\t * This flag can be used for type testing.\n\t\t *\n\t\t * @type {boolean}\n\t\t * @readonly\n\t\t * @default true\n\t\t */\n\t\tVector2.prototype.isVector2 = true;\n\n\t}\n`,
    replace: 'class Vector2 {\n',
  },
  {
    find: `}\n\n/**\n * Class for representing a Quaternion.`,
    replace: `}\n\nVector2.prototype.isVector2 = true;\n\n/**\n * Class for representing a Quaternion.`,
  },
  {
    find: `class Vector3 {\n\n\tstatic {\n\n\t\t/**\n\t\t * This flag can be used for type testing.\n\t\t *\n\t\t * @type {boolean}\n\t\t * @readonly\n\t\t * @default true\n\t\t */\n\t\tVector3.prototype.isVector3 = true;\n\n\t}\n`,
    replace: 'class Vector3 {\n',
  },
  {
    find: `}\n\nconst _vector$c = /*@__PURE__*/ new Vector3();`,
    replace: `}\n\nVector3.prototype.isVector3 = true;\n\nconst _vector$c = /*@__PURE__*/ new Vector3();`,
  },
  {
    find: `class Matrix3 {\n\n\tstatic {\n\n\t\t/**\n\t\t * This flag can be used for type testing.\n\t\t *\n\t\t * @type {boolean}\n\t\t * @readonly\n\t\t * @default true\n\t\t */\n\t\tMatrix3.prototype.isMatrix3 = true;\n\n\t}\n`,
    replace: 'class Matrix3 {\n',
  },
  {
    find: `}\n\nconst _m3 = /*@__PURE__*/ new Matrix3();`,
    replace: `}\n\nMatrix3.prototype.isMatrix3 = true;\n\nconst _m3 = /*@__PURE__*/ new Matrix3();`,
  },
  {
    find: `class Vector4 {\n\n\tstatic {\n\n\t\t/**\n\t\t * This flag can be used for type testing.\n\t\t *\n\t\t * @type {boolean}\n\t\t * @readonly\n\t\t * @default true\n\t\t */\n\t\tVector4.prototype.isVector4 = true;\n\n\t}\n`,
    replace: 'class Vector4 {\n',
  },
  {
    find: `}\n\n/**\n * A render target is a buffer where the video card draws pixels for a scene`,
    replace: `}\n\nVector4.prototype.isVector4 = true;\n\n/**\n * A render target is a buffer where the video card draws pixels for a scene`,
  },
  {
    find: `class Matrix4 {\n\n\tstatic {\n\n\t\t/**\n\t\t * This flag can be used for type testing.\n\t\t *\n\t\t * @type {boolean}\n\t\t * @readonly\n\t\t * @default true\n\t\t */\n\t\tMatrix4.prototype.isMatrix4 = true;\n\n\t}\n`,
    replace: 'class Matrix4 {\n',
  },
  {
    find: `}\n\nconst _v1$7 = /*@__PURE__*/ new Vector3();`,
    replace: `}\n\nMatrix4.prototype.isMatrix4 = true;\n\nconst _v1$7 = /*@__PURE__*/ new Vector3();`,
  },
  {
    find: `class Matrix2 {\n\n\tstatic {\n\n\t\t/**\n\t\t * This flag can be used for type testing.\n\t\t *\n\t\t * @type {boolean}\n\t\t * @readonly\n\t\t * @default true\n\t\t */\n\t\tMatrix2.prototype.isMatrix2 = true;\n\n\t}\n`,
    replace: 'class Matrix2 {\n',
  },
  {
    find: `}\n\nconst _vector$4 = /*@__PURE__*/ new Vector2();`,
    replace: `}\n\nMatrix2.prototype.isMatrix2 = true;\n\nconst _vector$4 = /*@__PURE__*/ new Vector2();`,
  },
];

if (fs.existsSync(threeCorePath)) {
  const source = fs.readFileSync(threeCorePath, 'utf8');

  if (source.includes('Vector2.prototype.isVector2 = true;') && !source.includes('static {')) {
    console.log('three static block patch already applied.');
  } else {
    let updated = source;
    for (const { find, replace } of replacements) {
      updated = updated.replace(find, replace);
    }

    if (updated === source) {
      console.warn('No three static block replacements were applied.');
    } else {
      fs.writeFileSync(threeCorePath, updated, 'utf8');
      console.log('Patched three.core.js static class blocks for Expo web compatibility.');
    }
  }
} else {
  console.warn('three.core.js not found, skipping patch.');
}

if (fs.existsSync(memoizeOnePackagePath)) {
  const memoizePackage = JSON.parse(fs.readFileSync(memoizeOnePackagePath, 'utf8'));
  if (memoizePackage.module !== memoizePackage.main) {
    memoizePackage.module = memoizePackage.main;
    fs.writeFileSync(memoizeOnePackagePath, `${JSON.stringify(memoizePackage, null, 2)}\n`, 'utf8');
    console.log('Patched memoize-one package entry for react-native-web compatibility.');
  }
}
