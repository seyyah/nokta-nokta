import fs from "node:fs";
import path from "node:path";

const outPath = path.resolve("assets/avatar.glb");

const materialDefs = [
  { name: "skin_warm", color: [0.72, 0.51, 0.39, 1] },
  { name: "jacket_graphite", color: [0.12, 0.14, 0.16, 1] },
  { name: "shirt_clay", color: [0.83, 0.77, 0.68, 1] },
  { name: "hair_ink", color: [0.08, 0.07, 0.06, 1] },
  { name: "eye_dark", color: [0.03, 0.04, 0.05, 1] },
  { name: "mouth_coral", color: [0.42, 0.11, 0.12, 1] }
];

const chunks = [];
const bufferViews = [];
const accessors = [];
const meshes = [];
const nodes = [];

function align4(value) {
  return (value + 3) & ~3;
}

function pushBuffer(data, componentType, type, count, min, max, target) {
  const buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  const offset = align4(chunks.reduce((total, chunk) => total + chunk.length, 0));
  const padding = offset - chunks.reduce((total, chunk) => total + chunk.length, 0);
  if (padding > 0) {
    chunks.push(Buffer.alloc(padding));
  }
  chunks.push(buffer);
  const bufferView = bufferViews.length;
  bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buffer.length, target });
  const accessor = accessors.length;
  accessors.push({ bufferView, componentType, count, type, min, max });
  return accessor;
}

function addMesh(name, geometry, material) {
  const position = pushBuffer(
    new Float32Array(geometry.positions),
    5126,
    "VEC3",
    geometry.positions.length / 3,
    geometry.min,
    geometry.max,
    34962
  );
  const normal = pushBuffer(
    new Float32Array(geometry.normals),
    5126,
    "VEC3",
    geometry.normals.length / 3,
    [-1, -1, -1],
    [1, 1, 1],
    34962
  );
  const indices = pushBuffer(
    new Uint16Array(geometry.indices),
    5123,
    "SCALAR",
    geometry.indices.length,
    [0],
    [Math.max(...geometry.indices)],
    34963
  );
  const mesh = meshes.length;
  meshes.push({
    name,
    primitives: [
      {
        attributes: { POSITION: position, NORMAL: normal },
        indices,
        material
      }
    ]
  });
  return mesh;
}

function addNode(name, mesh, translation = [0, 0, 0], scale = [1, 1, 1], children) {
  const node = { name, translation, scale };
  if (mesh !== undefined) {
    node.mesh = mesh;
  }
  if (children?.length) {
    node.children = children;
  }
  nodes.push(node);
  return nodes.length - 1;
}

function ellipsoid(lat, lon) {
  const positions = [];
  const normals = [];
  const indices = [];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let y = 0; y <= lat; y += 1) {
    const v = y / lat;
    const theta = v * Math.PI;
    for (let x = 0; x <= lon; x += 1) {
      const u = x / lon;
      const phi = u * Math.PI * 2;
      const sx = Math.sin(theta) * Math.cos(phi);
      const sy = Math.cos(theta);
      const sz = Math.sin(theta) * Math.sin(phi);
      positions.push(sx, sy, sz);
      normals.push(sx, sy, sz);
      min[0] = Math.min(min[0], sx);
      min[1] = Math.min(min[1], sy);
      min[2] = Math.min(min[2], sz);
      max[0] = Math.max(max[0], sx);
      max[1] = Math.max(max[1], sy);
      max[2] = Math.max(max[2], sz);
    }
  }

  for (let y = 0; y < lat; y += 1) {
    for (let x = 0; x < lon; x += 1) {
      const a = y * (lon + 1) + x;
      const b = a + lon + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  return { positions, normals, indices, min, max };
}

function cuboid(width, height, depth) {
  const x = width / 2;
  const y = height / 2;
  const z = depth / 2;
  const faces = [
    [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z], [0, 0, 1]],
    [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z], [0, 0, -1]],
    [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z], [0, 1, 0]],
    [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z], [0, -1, 0]],
    [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z], [1, 0, 0]],
    [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z], [-1, 0, 0]]
  ];
  const positions = [];
  const normals = [];
  const indices = [];
  faces.forEach((face, faceIndex) => {
    const offset = faceIndex * 4;
    for (let i = 0; i < 4; i += 1) {
      positions.push(...face[i]);
      normals.push(...face[4]);
    }
    indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
  });
  return { positions, normals, indices, min: [-x, -y, -z], max: [x, y, z] };
}

function cylinder(segments) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    positions.push(x, -1, z, x, 1, z);
    normals.push(x, 0, z, x, 0, z);
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  return { positions, normals, indices, min: [-1, -1, -1], max: [1, 1, 1] };
}

const headMesh = addMesh("soft_head_mesh", ellipsoid(12, 16), 0);
const hairMesh = addMesh("side_part_hair_mesh", ellipsoid(8, 16), 3);
const torsoMesh = addMesh("audit_jacket_mesh", ellipsoid(8, 14), 1);
const shirtMesh = addMesh("inner_shirt_mesh", cuboid(0.52, 0.78, 0.08), 2);
const neckMesh = addMesh("neck_mesh", cylinder(12), 0);
const eyeMesh = addMesh("eye_mesh", ellipsoid(6, 8), 4);
const mouthMesh = addMesh("responsive_mouth_mesh", cuboid(0.36, 0.08, 0.035), 5);

const leftEye = addNode("LeftEye", eyeMesh, [-0.24, 0.09, 0.82], [0.045, 0.055, 0.025]);
const rightEye = addNode("RightEye", eyeMesh, [0.24, 0.09, 0.82], [0.045, 0.055, 0.025]);
const mouth = addNode("Mouth", mouthMesh, [0, -0.24, 0.86], [1, 1, 1]);
const hair = addNode("Hair", hairMesh, [0, 0.33, 0.02], [0.62, 0.34, 0.57]);
const head = addNode("AnalystHead", headMesh, [0, 0.67, 0], [0.58, 0.68, 0.56], [
  leftEye,
  rightEye,
  mouth,
  hair
]);
const torso = addNode("GraphiteJacket", torsoMesh, [0, -0.54, -0.02], [0.8, 0.62, 0.34]);
const shirt = addNode("ClayShirt", shirtMesh, [0, -0.45, 0.29], [1, 1, 1]);
const neck = addNode("Neck", neckMesh, [0, 0.11, -0.02], [0.19, 0.27, 0.19]);
const root = addNode("NoktaAnalystAvatar", undefined, [0, 0, 0], [1, 1, 1], [
  torso,
  shirt,
  neck,
  head
]);

const bin = Buffer.concat(chunks);
const json = {
  asset: { version: "2.0", generator: "Nokta Audit Forge local asset generator" },
  scene: 0,
  scenes: [{ nodes: [root] }],
  nodes,
  meshes,
  materials: materialDefs.map((material) => ({
    name: material.name,
    pbrMetallicRoughness: {
      baseColorFactor: material.color,
      metallicFactor: 0,
      roughnessFactor: 0.82
    }
  })),
  accessors,
  bufferViews,
  buffers: [{ byteLength: bin.length }]
};

const jsonBuffer = Buffer.from(JSON.stringify(json));
const paddedJsonLength = align4(jsonBuffer.length);
const paddedBinLength = align4(bin.length);
const totalLength = 12 + 8 + paddedJsonLength + 8 + paddedBinLength;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(totalLength, 8);

const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(paddedJsonLength, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const jsonChunk = Buffer.concat([jsonBuffer, Buffer.alloc(paddedJsonLength - jsonBuffer.length, 0x20)]);

const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(paddedBinLength, 0);
binHeader.writeUInt32LE(0x004e4942, 4);
const binChunk = Buffer.concat([bin, Buffer.alloc(paddedBinLength - bin.length)]);

fs.writeFileSync(outPath, Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]));
console.log(`wrote ${outPath}`);
