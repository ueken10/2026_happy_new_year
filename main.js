// Three.js、FontLoader、TextGeometry、Tone.jsはグローバル変数として利用可能

// シーン、カメラ、レンダラーの設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000020);
scene.fog = new THREE.Fog(0x000020, 10, 100);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ライティング
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0xff00ff, 2, 100);
pointLight1.position.set(-10, 5, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00ffff, 2, 100);
pointLight2.position.set(10, -5, 10);
scene.add(pointLight2);

// パーティクル背景
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1000;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 200;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
    opacity: 0.6
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// ワイヤーフレームの地面
const groundGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
const groundMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // 水平に配置
ground.position.y = -10; // 下に配置
scene.add(ground);

// テキストメッシュグループ
let textMesh = null;
let startTime = Date.now();
const moveDuration = 12000; // 移動とアニメーションは12秒
const stillDuration = 3000; // 静止は3秒
const animationDuration = moveDuration + stillDuration; // 合計15秒

// Tone.jsの設定
let synth = null;
let isAudioInitialized = false;
let soundPlayed = false; // 12秒後の音が鳴ったかどうかを記録

async function initAudio() {
    if (!isAudioInitialized) {
        await Tone.start();
        synth = new Tone.PolySynth(Tone.Synth).toDestination();
        synth.volume.value = -10;
        isAudioInitialized = true;
    }
}

// ページ読み込み時に自動で音声を初期化
initAudio();

// フォントの読み込みとテキストの作成
const loader = new THREE.FontLoader();
loader.load(
    'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
    function (font) {
        const textGeometry = new THREE.TextGeometry('2026\nHAPPY\nNEW YEAR', {
            font: font,
            size: 3,
            height: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.3,
            bevelSize: 0.2,
            bevelOffset: 0,
            bevelSegments: 5
        });

        textGeometry.center();

        // グラデーションマテリアル効果のために複数のマテリアルを使用
        const textMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            emissive: 0xff4400,
            emissiveIntensity: 0.3,
            shininess: 100,
            specular: 0xffffff
        });

        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        // 初期位置を遠くに設定
        textMesh.position.z = -100;
        textMesh.position.y = 0;
        textMesh.position.x = 0;
        
        scene.add(textMesh);
        
        // アニメーション開始
        startTime = Date.now();
        console.log('テキストが読み込まれました');
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('フォントの読み込みエラー:', error);
    }
);

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    // パーティクルの回転
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;

    // テキストのアニメーション
    if (textMesh) {
        // 最初の12秒でアニメーション、残り3秒で静止
        const moveProgress = Math.min(elapsed / moveDuration, 1);
        const easeProgress = 1 - Math.pow(1 - moveProgress, 3);
        
        if (moveProgress < 1) {
            // 移動中（0-12秒）
            // 奥（z=-100）から手前（z=10）に移動
            textMesh.position.z = -100 + (easeProgress * 110);
            
            // 回転アニメーション
            textMesh.rotation.x = Math.sin(moveProgress * Math.PI * 2) * 0.5;
            textMesh.rotation.y = moveProgress * Math.PI * 4;
            textMesh.rotation.z = Math.cos(moveProgress * Math.PI * 2) * 0;
            
            // スケールアニメーション（だんだん大きく）
            const scale = 0.5 + easeProgress * 0.5;
            textMesh.scale.set(scale, scale, scale);
            
            // カラーアニメーション
            const hue = (moveProgress * 360) % 360;
            textMesh.material.color.setHSL(hue / 360, 1, 0.6);
            textMesh.material.emissive.setHSL((hue + 180) % 360 / 360, 1, 0.3);
        } else {
            // 静止中（12-15秒）- まっすぐに表示
            textMesh.position.z = 10;
            // 回転をすべて0にしてまっすぐに表示
            textMesh.rotation.x = 0;
            textMesh.rotation.y = 0;
            textMesh.rotation.z = 0;
            // スケールとカラーは最後の状態を維持
            textMesh.scale.set(1, 1, 1);
        }
        
        // 12秒後にオーケストラヒットの音を鳴らす
        if (elapsed >= moveDuration && !soundPlayed) {
            soundPlayed = true;
            if (isAudioInitialized && synth) {
                const now = Tone.now();
                // オーケストラヒット風の和音（複数の音を同時に鳴らす）
                synth.triggerAttackRelease(['C3', 'E3', 'G3', 'C4', 'E4', 'G4'], '1.5', now);
            }
        }
        
        // 15秒後にループ
        if (progress >= 1) {
            startTime = Date.now();
            soundPlayed = false; // 次のループのためにリセット
        }
    }

    // ライトのアニメーション
    const time = currentTime * 0.001;
    pointLight1.position.x = Math.sin(time) * 20;
    pointLight1.position.y = Math.cos(time) * 10;
    
    pointLight2.position.x = Math.cos(time * 0.7) * 20;
    pointLight2.position.y = Math.sin(time * 0.7) * 10;

    renderer.render(scene, camera);
}

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// アニメーション開始
animate();

console.log('2026 HAPPY NEW YEAR - Flying Logo started!');
console.log('クリックして音声を有効にしてください');
