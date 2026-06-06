import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  mousePos: { x: number; y: number };
  isNight: boolean;
}

export default function ThreeScene({ mousePos, isNight }: ThreeSceneProps) {
  const mountRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    animId: number;
    trees: THREE.Group[];
    leaves: { mesh: THREE.Mesh; vel: THREE.Vector3; rot: THREE.Vector3; life: number }[];
    stars: THREE.Points;
    flowers: { mesh: THREE.Group; vel: THREE.Vector3; rot: THREE.Vector3 }[];
    clock: THREE.Clock;
    cameraZoom: number;
  } | null>(null);

  useEffect(() => {
    const canvas = mountRef.current;
    if (!canvas) return;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // --- Scene ---
    const scene = new THREE.Scene();

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 18);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(isNight ? 0x1a0a2e : 0xfff0f5, 0.6);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0xf472b6, 2, 50);
    pointLight1.position.set(-10, 10, 10);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0xa78bfa, 2, 50);
    pointLight2.position.set(10, -5, 8);
    scene.add(pointLight2);
    const pointLight3 = new THREE.PointLight(0xfbbf24, 1.5, 40);
    pointLight3.position.set(0, 15, 5);
    scene.add(pointLight3);

    // --- Stars / Particle Field ---
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const palette = [
      new THREE.Color(0xfbbf24),
      new THREE.Color(0xf472b6),
      new THREE.Color(0xa78bfa),
      new THREE.Color(0x60a5fa),
      new THREE.Color(0xffffff),
    ];
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3]     = (Math.random() - 0.5) * 120;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
      const c = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3]     = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
      starSizes[i] = Math.random() * 3 + 0.5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Tree Builder ---
    const makeTrunk = (h: number, r: number, color: number) => {
      const geo = new THREE.CylinderGeometry(r * 0.5, r, h, 8);
      const mat = new THREE.MeshPhongMaterial({ color, shininess: 10 });
      return new THREE.Mesh(geo, mat);
    };
    const makeLeafCluster = (radius: number, color: number, emissive: number) => {
      const geo = new THREE.SphereGeometry(radius, 8, 8);
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive,
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.92,
        shininess: 20,
      });
      return new THREE.Mesh(geo, mat);
    };

    const buildTree = (x: number, z: number, scale: number, side: 'L' | 'R'): THREE.Group => {
      const tree = new THREE.Group();
      tree.position.set(x, -10, z);

      // Trunk
      const trunk = makeTrunk(5 * scale, 0.4 * scale, 0x5c3317);
      trunk.position.y = 2.5 * scale;
      tree.add(trunk);

      // Leaf clusters — layered
      const leafColors = [0x2d6a4f, 0x40916c, 0x52b788, 0x74c69d];
      const emissiveColors = [0x1a3c2f, 0x2d6a4f, 0x40916c, 0x52b788];
      const layers = [
        { y: 5.5 * scale, r: 2.8 * scale },
        { y: 7.0 * scale, r: 2.2 * scale },
        { y: 8.3 * scale, r: 1.7 * scale },
        { y: 9.3 * scale, r: 1.1 * scale },
      ];
      layers.forEach((l, i) => {
        const cluster = makeLeafCluster(l.r, leafColors[i], emissiveColors[i]);
        cluster.position.y = l.y;
        // slight offset for naturalness
        cluster.position.x = (Math.random() - 0.5) * 0.5 * scale;
        tree.add(cluster);
      });

      // Extra side branches
      for (let b = 0; b < 3; b++) {
        const angle = (b / 3) * Math.PI * 2 + (side === 'L' ? 0 : Math.PI / 3);
        const br = makeLeafCluster(1.4 * scale, leafColors[1], emissiveColors[1]);
        br.position.set(
          Math.cos(angle) * 2.5 * scale,
          (5.5 + b * 0.8) * scale,
          Math.sin(angle) * 1.2 * scale
        );
        tree.add(br);
      }

      return tree;
    };

    // Build trees
    const trees: THREE.Group[] = [];
    const treeConfigs = [
      { x: -18, z: -5, s: 1.1, side: 'L' as const },
      { x: -14, z:  2, s: 0.85, side: 'L' as const },
      { x: -22, z: -2, s: 0.7, side: 'L' as const },
      { x:  18, z: -5, s: 1.1, side: 'R' as const },
      { x:  14, z:  2, s: 0.85, side: 'R' as const },
      { x:  22, z: -2, s: 0.7, side: 'R' as const },
    ];
    treeConfigs.forEach(cfg => {
      const t = buildTree(cfg.x, cfg.z, cfg.s, cfg.side);
      scene.add(t);
      trees.push(t);
    });

    // --- Falling Leaves ---
    const leaves: { mesh: THREE.Mesh; vel: THREE.Vector3; rot: THREE.Vector3; life: number; maxLife: number }[] = [];
    const leafShapes = [
      new THREE.PlaneGeometry(0.25, 0.35),
      new THREE.CircleGeometry(0.15, 5),
    ];
    const leafColors2 = [0x52b788, 0x74c69d, 0x40916c, 0xb7e4c7, 0xd8f3dc, 0xf9c74f, 0xf8961e];

    const spawnLeaf = () => {
      const geo = leafShapes[Math.floor(Math.random() * leafShapes.length)];
      const mat = new THREE.MeshPhongMaterial({
        color: leafColors2[Math.floor(Math.random() * leafColors2.length)],
        transparent: true,
        opacity: Math.random() * 0.5 + 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      // Spawn near trees
      const side = Math.random() > 0.5 ? 1 : -1;
      mesh.position.set(
        side * (13 + Math.random() * 8),
        6 + Math.random() * 4,
        (Math.random() - 0.5) * 8
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(mesh);
      const maxLife = 5 + Math.random() * 4;
      leaves.push({
        mesh,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.6, -0.5 - Math.random() * 0.5, (Math.random() - 0.5) * 0.3),
        rot: new THREE.Vector3((Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.06),
        life: 0,
        maxLife,
      });
    };

    // Seed initial leaves
    for (let i = 0; i < 30; i++) spawnLeaf();

    // --- 3D Flowers ---
    const buildFlower = (): THREE.Group => {
      const group = new THREE.Group();
      const petalColors = [0xf472b6, 0xfbbf24, 0xa78bfa, 0xfb7185, 0xfde68a, 0xc4b5fd];
      const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
      // Center
      const centerGeo = new THREE.SphereGeometry(0.12, 6, 6);
      const centerMat = new THREE.MeshPhongMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.4 });
      group.add(new THREE.Mesh(centerGeo, centerMat));
      // Petals
      for (let p = 0; p < 6; p++) {
        const pGeo = new THREE.EllipseCurve(0, 0, 0.22, 0.12, 0, Math.PI * 2, false, 0);
        const pts = pGeo.getPoints(12);
        const shape = new THREE.Shape(pts.map(pt => new THREE.Vector2(pt.x, pt.y)));
        const petalGeo = new THREE.ShapeGeometry(shape);
        const petalMat = new THREE.MeshPhongMaterial({
          color: petalColor,
          emissive: petalColor,
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });
        const petal = new THREE.Mesh(petalGeo, petalMat);
        const angle = (p / 6) * Math.PI * 2;
        petal.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0);
        petal.rotation.z = angle;
        group.add(petal);
      }
      return group;
    };

    const flowers: { mesh: THREE.Group; vel: THREE.Vector3; rot: THREE.Vector3 }[] = [];
    for (let i = 0; i < 18; i++) {
      const f = buildFlower();
      const z = (Math.random() - 0.5) * 20;
      const scale = 0.4 + Math.random() * 0.8;
      f.scale.setScalar(scale);
      f.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 25,
        z
      );
      f.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(f);
      flowers.push({
        mesh: f,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.008,
          0
        ),
        rot: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.006
        ),
      });
    }

    // --- Clock ---
    const clock = new THREE.Clock();
    let cameraZoom = 18;
    let animId = 0;

    // --- Animate ---
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      // t is used below in animate loop

      // Camera slow zoom-in on load (first 4 seconds)
      if (cameraZoom > 14) {
        cameraZoom -= 0.02;
        camera.position.z = cameraZoom;
      }

      // Camera parallax from mouse
      const targetX = mousePos.x * 3;
      const targetY = mousePos.y * 1.5;
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      // Stars twinkle
      const starSizesArr = stars.geometry.attributes.size.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        starSizesArr[i] = (0.5 + Math.abs(Math.sin(t * 1.5 + i * 0.3))) * (starSizes[i]);
      }
      stars.geometry.attributes.size.needsUpdate = true;
      stars.rotation.y = t * 0.005;
      stars.rotation.x = t * 0.002;

      // Tree sway
      trees.forEach((tree, i) => {
        const side = i < 3 ? 1 : -1;
        tree.rotation.z = Math.sin(t * 0.6 + i * 0.5) * 0.03 * side;
      });

      // Leaves
      const leafSpawnInterval = 0.2;
      if (Math.floor(t / leafSpawnInterval) > Math.floor((t - 0.016) / leafSpawnInterval)) {
        if (leaves.length < 60) spawnLeaf();
      }
      for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];
        leaf.life += 0.016;
        // wind oscillation
        leaf.mesh.position.x += leaf.vel.x + Math.sin(t * 1.2 + i) * 0.02;
        leaf.mesh.position.y += leaf.vel.y;
        leaf.mesh.position.z += leaf.vel.z;
        leaf.mesh.rotation.x += leaf.rot.x;
        leaf.mesh.rotation.y += leaf.rot.y;
        leaf.mesh.rotation.z += leaf.rot.z;
        // Fade near end
        const prog = leaf.life / leaf.maxLife;
        (leaf.mesh.material as THREE.MeshPhongMaterial).opacity = prog > 0.7 ? (1 - prog) / 0.3 * 0.6 : 0.6;
        if (leaf.life > leaf.maxLife || leaf.mesh.position.y < -14) {
          scene.remove(leaf.mesh);
          leaf.mesh.geometry.dispose();
          (leaf.mesh.material as THREE.Material).dispose();
          leaves.splice(i, 1);
        }
      }

      // Flowers
      flowers.forEach((f, i) => {
        f.mesh.position.x += f.vel.x;
        f.mesh.position.y += f.vel.y + Math.sin(t * 0.5 + i) * 0.003;
        f.mesh.rotation.x += f.rot.x;
        f.mesh.rotation.y += f.rot.y;
        f.mesh.rotation.z += f.rot.z;
        // Wrap around
        if (f.mesh.position.x > 30) f.mesh.position.x = -30;
        if (f.mesh.position.x < -30) f.mesh.position.x = 30;
        if (f.mesh.position.y > 15) f.mesh.position.y = -15;
        if (f.mesh.position.y < -15) f.mesh.position.y = 15;
      });

      // Lights pulse
      pointLight1.intensity = 1.5 + Math.sin(t * 1.2) * 0.5;
      pointLight2.intensity = 1.5 + Math.cos(t * 0.9) * 0.5;
      pointLight3.intensity = 1.0 + Math.sin(t * 0.7) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    // Store refs
    sceneRef.current = { renderer, scene, camera, animId, trees, leaves, stars, flowers, clock, cameraZoom };

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []); // eslint-disable-line

  // Update night mode lighting via effect
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene } = sceneRef.current;
    scene.traverse(obj => {
      if ((obj as THREE.AmbientLight).isLight && obj.type === 'AmbientLight') {
        (obj as THREE.AmbientLight).color.set(isNight ? 0x0d0621 : 0xfff0f5);
        (obj as THREE.AmbientLight).intensity = isNight ? 0.3 : 0.6;
      }
    });
  }, [isNight]);

  return <canvas id="three-canvas" ref={mountRef} />;
}
