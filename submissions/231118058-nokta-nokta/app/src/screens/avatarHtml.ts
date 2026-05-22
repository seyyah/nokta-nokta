export const AVATAR_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Avatar 3D</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #080c18;
        }
        #canvas-container {
            width: 100vw;
            height: 100vh;
        }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff6b6b;
            font-family: sans-serif;
            font-size: 14px;
        }
    </style>
    <!-- Three.js ve GLTFLoader CDN'leri -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
</head>
<body>
    <div id="loading">Model Yükleniyor...</div>
    <div id="canvas-container"></div>

    <script>
        let scene, camera, renderer, avatar;
        let headMeshes = [];
        let jawBones = [];
        let headBone = null;
        let neckBone = null;
        let targetHeadNod = 0;
        let targetNeckTilt = 0;
        let clock = new THREE.Clock();

        function init() {
            const container = document.getElementById('canvas-container');

            scene = new THREE.Scene();
            scene.background = null;

            camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.set(0, 0.1, 2.6);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            container.appendChild(renderer.domElement);

            const ambient = new THREE.AmbientLight(0x3355aa, 1.2);
            scene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0x88aaff, 2.0);
            dirLight.position.set(1.5, 3, 2.5);
            scene.add(dirLight);

            const fillLight = new THREE.DirectionalLight(0xff88cc, 0.8);
            fillLight.position.set(-2, 1, 1);
            scene.add(fillLight);

            window.addEventListener('resize', onWindowResize, false);
            animate();

            // İlk yüklendiğinde React Native'e haber ver (Köprü kurulana kadar bekle)
            function sendReady() {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
                } else {
                    setTimeout(sendReady, 500);
                }
            }
            sendReady();
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        let isLoadingModel = false;
        function loadModel(dataUri) {
            if (isLoadingModel) return;
            isLoadingModel = true;

            if (avatar) {
                scene.remove(avatar);
                avatar = null;
            }
            headMeshes = [];
            jawBones = [];
            headBone = null;
            neckBone = null;
            targetHeadNod = 0;
            targetNeckTilt = 0;

            const loader = new THREE.GLTFLoader();
            loader.load(dataUri, (gltf) => {
                isLoadingModel = false;
                avatar = gltf.scene;

                // Modelin kendi yerel bounding box'ı üzerinden yüz koordinatlarını hesaplama:
                const box = new THREE.Box3().setFromObject(avatar);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = maxDim > 0 ? 1.8 / maxDim : 1;
                avatar.scale.setScalar(scale);

                // Yüzü kameranın merkezine oturtmak için baseY referansı
                const faceY = box.max.y - (size.y * 0.12);
                avatar.userData.baseY = -faceY * scale - 0.2;
                avatar.position.set(-center.x * scale, avatar.userData.baseY, -center.z * scale);

                let logs = [];
                // Blendshape (Morph Target) veya Kemik ara
                avatar.traverse((node) => {
                    const lower = node.name.toLowerCase();
                    
                    if (node.isMesh) {
                        const hasMorphs = !!(node.morphTargetInfluences && node.morphTargetDictionary);
                        const geom = node.geometry;
                        const hasGeomMorphs = !!(geom && geom.morphAttributes && Object.keys(geom.morphAttributes).length > 0);
                        
                        logs.push("MESH: " + node.name + " (Mesh Morphs: " + (hasMorphs ? "YES" : "NO") + " | Geom Morphs: " + (hasGeomMorphs ? "YES" : "NO") + ")");
                        
                        if (geom && geom.morphAttributes) {
                            logs.push("  Geom morphAttribute keys: " + Object.keys(geom.morphAttributes).join(', '));
                        }

                        // Eğer model statikse (Avaturn body ama morph target'sız), matematiksel olarak ağız açma deformasyonu oluşturalım!
                        if (!hasMorphs && node.name === 'avaturn_body') {
                            try {
                                geom.computeBoundingBox();
                                const localBox = geom.boundingBox;
                                const localSize = localBox.getSize(new THREE.Vector3());
                                const localCenter = localBox.getCenter(new THREE.Vector3());

                                logs.push("  -> STATİK MODEL İÇİN DİNAMİK 3D DUDAK MORPH TARGET'I ÜRETİLİYOR...");
                                
                                // Ağzın yerel (local) koordinat sınırları
                                const mouthYLocal = localBox.max.y - (localSize.y * 0.082);
                                const searchRadiusY = localSize.y * 0.022;
                                const searchRadiusX = localSize.x * 0.06;
                                const searchRadiusZ = localSize.z * 0.08;

                                const positionAttribute = geom.attributes.position;
                                const vertexCount = positionAttribute.count;
                                const morphPositions = new Float32Array(vertexCount * 3);

                                let modifiedCount = 0;
                                for (let i = 0; i < vertexCount; i++) {
                                    const x = positionAttribute.getX(i);
                                    const y = positionAttribute.getY(i);
                                    const z = positionAttribute.getZ(i);

                                    const dx = Math.abs(x - localCenter.x);
                                    const dy = Math.abs(y - mouthYLocal);
                                    const dz = localBox.max.z - z;

                                    if (dx < searchRadiusX && dy < searchRadiusY && dz < searchRadiusZ) {
                                        // Merkezden uzaklaştıkça etkiyi azaltan yumuşak geçiş katsayıları (Gaussian falloff benzeri)
                                        const factorX = 1.0 - (dx / searchRadiusX);
                                        const factorZ = 1.0 - (dz / searchRadiusZ);
                                        const factor = factorX * factorZ;

                                        if (y < mouthYLocal) {
                                            // Alt dudak ve çene kısmını aşağı (-Y) ve hafif içeri (-Z) çekiyoruz
                                            morphPositions[i * 3 + 1] = -0.015 * factor;
                                            morphPositions[i * 3 + 2] = -0.004 * factor;
                                        } else {
                                            // Üst dudak kısmını hafifçe yukarı (+Y) esnetiyoruz
                                            morphPositions[i * 3 + 1] = 0.003 * factor;
                                        }
                                        modifiedCount++;
                                    }
                                }

                                if (modifiedCount > 0) {
                                    geom.morphAttributes.position = geom.morphAttributes.position || [];
                                    const morphAttribute = new THREE.BufferAttribute(morphPositions, 3);
                                    geom.morphAttributes.position.push(morphAttribute);

                                    node.morphTargetInfluences = [0];
                                    node.morphTargetDictionary = { 'mouthopen': 0 };
                                    node.updateMorphTargets();

                                    headMeshes.push(node);
                                    logs.push("  -> DİNAMİK DUDAK BAŞARIYLA EKLENDİ! Etkilenen Vertex Sayısı: " + modifiedCount);
                                }
                            } catch (err) {
                                logs.push("  -> Dudak üretme hatası: " + err.message);
                            }
                        } else if (hasMorphs) {
                            const keys = Object.keys(node.morphTargetDictionary);
                            logs.push("  Keys for " + node.name + ": " + keys.slice(0, 5).join(', ') + " (Total: " + keys.length + ")");
                            
                            let hasMouthMorph = false;
                            for (let key in node.morphTargetDictionary) {
                                const kLower = key.toLowerCase();
                                if (kLower.includes('jaw') || kLower.includes('mouth') || kLower.includes('viseme') || kLower.includes('open') || kLower.includes('lip') || kLower.includes('funnel')) {
                                    hasMouthMorph = true;
                                    break;
                                }
                            }
                            if (hasMouthMorph) {
                                headMeshes.push(node);
                                logs.push("  -> MATCHED AS MOUTH MORPH MESH!");
                            }
                        }
                    }

                    if (node.isBone) {
                        logs.push("BONE: " + node.name);
                        // Kollar için T-pose düzeltme
                        if (lower === 'leftarm' || lower === 'mixamorigleftarm' || lower === 'left_arm' || lower === 'mixamorig:leftarm') {
                            node.rotation.z = 0;
                            node.rotation.x = 1.2;
                        }
                        if (lower === 'rightarm' || lower === 'mixamorigrightarm' || lower === 'right_arm' || lower === 'mixamorig:rightarm') {
                            node.rotation.z = 0;
                            node.rotation.x = 1.2;
                        }
                        // Çene kemiği ara
                        if (lower.includes('jaw') || lower.includes('mouth') || lower.includes('cene')) {
                            jawBones.push(node);
                            logs.push("  -> MATCHED AS JAW BONE!");
                        }
                        // Kafa kemiği ara
                        if (lower === 'head' || lower.includes('head')) {
                            headBone = node;
                            logs.push("  -> ASSIGNED HEAD BONE!");
                        }
                        // Boyun kemiği ara
                        if (lower === 'neck' || lower.includes('neck')) {
                            neckBone = node;
                            logs.push("  -> ASSIGNED NECK BONE!");
                        }
                    }
                });

                // Ekrana hata ayıklama bilgisini bas
                const debugDiv = document.createElement('div');
                debugDiv.style.cssText = 'position:absolute; top:10px; left:10px; color:#fff; font-size:10px; z-index:99; background:rgba(0,0,0,0.7); padding:5px; max-width:90%; word-wrap:break-word;';
                debugDiv.innerText = 'Meshes: ' + headMeshes.map(m => m.name).join(', ') + ' | Bones: ' + jawBones.map(b => b.name).join(', ');
                document.body.appendChild(debugDiv);

                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'log',
                        message: "=== 3D MODEL LOGS ===\\n" + logs.join('\\n')
                    }));
                }

                scene.add(avatar);
                document.getElementById('loading').style.display = 'none';

            }, undefined, (error) => {
                isLoadingModel = false;
                document.getElementById('loading').innerText = 'Yükleme Hatası!';
                console.error(error);
            });
        }

        function animate() {
            requestAnimationFrame(animate);
            if (avatar) {
                const t = clock.getElapsedTime();
                avatar.rotation.y = Math.sin(t * 0.5) * 0.12;
                
                // Nefes alma efekti
                const baseY = avatar.userData.baseY || 0;
                avatar.position.y += (baseY + Math.sin(t * 1.2) * 0.02 - avatar.position.y) * 0.1;

                // Konuşurken kafa sallama (nodding) ve boyun bükme (tilting) hareketleri
                if (headBone) {
                    const speakNod = Math.sin(t * 16) * targetHeadNod;
                    headBone.rotation.x += (speakNod - headBone.rotation.x) * 0.25;
                }
                if (neckBone) {
                    const speakTilt = Math.cos(t * 10) * targetNeckTilt;
                    neckBone.rotation.z += (speakTilt - neckBone.rotation.z) * 0.25;
                }
            }
            renderer.render(scene, camera);
        }

        document.addEventListener('message', function(event) { handleMessage(event.data); });
        window.addEventListener('message', function(event) { handleMessage(event.data); });

        function handleMessage(dataString) {
            try {
                const data = JSON.parse(dataString);
                
                if (data.type === 'loadGLB') {
                    document.getElementById('loading').innerText = 'Model Çözülüyor...';
                    loadModel(data.base64Uri);
                }
                
                if (data.volume !== undefined) {
                    const vol = data.volume;
                    const targetIntensity = Math.min(1.0, vol * 2.8);

                    // 1. Blendshape tabanlı ağız oynatma (Eğer modelde morph varsa)
                    if (headMeshes.length > 0) {
                        headMeshes.forEach(mesh => {
                            for (let key in mesh.morphTargetDictionary) {
                                const k = key.toLowerCase();
                                if (k.includes('jawopen') || k.includes('mouthopen') || k.includes('viseme_aa') || k.includes('mouth_open')) {
                                    const jawIndex = mesh.morphTargetDictionary[key];
                                    const current = mesh.morphTargetInfluences[jawIndex];
                                    mesh.morphTargetInfluences[jawIndex] += (targetIntensity - current) * 0.3;
                                }
                            }
                        });
                    }
                    
                    // 2. Kemik tabanlı çene oynatma (Eğer modelde çene kemiği varsa)
                    if (jawBones.length > 0) {
                        jawBones.forEach(bone => {
                            const targetX = targetIntensity * 0.35;
                            const currentX = bone.rotation.x;
                            bone.rotation.x += (targetX - currentX) * 0.3;
                        });
                    }

                    // 3. Konuşma jestleri animasyon hedefleri
                    targetHeadNod = targetIntensity * 0.12;
                    targetNeckTilt = targetIntensity * 0.04;
                }
            } catch (e) {
                console.error("Parse error:", e);
            }
        }

        init();
    </script>
</body>
</html>
`;
