import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GlobeNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      1,
      2000
    );
    camera.position.z = 280;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.sortObjects = true;

    // Globe group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // ── Particle Globe ──────────────────────────────────────────────
    const GLOBE_RADIUS = 100;
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = GLOBE_RADIUS + (Math.random() - 0.5) * 4;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 1.5 * Math.random();
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0x1c69d4,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particleSystem);

    // Inner shell
    const innerCount = 1000;
    const innerPositions = new Float32Array(innerCount * 3);
    for (let i = 0; i < innerCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = GLOBE_RADIUS * 0.85;

      innerPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      innerPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      innerPositions[i * 3 + 2] = r * Math.cos(phi);
    }

    const innerGeo = new THREE.BufferGeometry();
    innerGeo.setAttribute("position", new THREE.BufferAttribute(innerPositions, 3));
    const innerMat = new THREE.PointsMaterial({
      color: 0x1c69d4,
      size: 1,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerSystem = new THREE.Points(innerGeo, innerMat);
    globeGroup.add(innerSystem);

    // ── Arcs ────────────────────────────────────────────────────────
    interface ArcData {
      line: THREE.Line;
      points: THREE.Vector3[];
    }

    const arcs: ArcData[] = [];
    const arcCount = 20;

    for (let i = 0; i < arcCount; i++) {
      const startTheta = Math.random() * Math.PI * 2;
      const startPhi = Math.acos(2 * Math.random() - 1);
      const endTheta = Math.random() * Math.PI * 2;
      const endPhi = Math.acos(2 * Math.random() - 1);

      const start = new THREE.Vector3(
        GLOBE_RADIUS * Math.sin(startPhi) * Math.cos(startTheta),
        GLOBE_RADIUS * Math.sin(startPhi) * Math.sin(startTheta),
        GLOBE_RADIUS * Math.cos(startPhi)
      );
      const end = new THREE.Vector3(
        GLOBE_RADIUS * Math.sin(endPhi) * Math.cos(endTheta),
        GLOBE_RADIUS * Math.sin(endPhi) * Math.sin(endTheta),
        GLOBE_RADIUS * Math.cos(endPhi)
      );

      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(GLOBE_RADIUS * 1.3);

      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      const curvePoints = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x1c69d4,
        transparent: true,
        opacity: 0.15,
      });
      const line = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(line);
      arcs.push({ line, points: curvePoints });
    }

    // ── Data Packets ────────────────────────────────────────────────
    interface Packet {
      mesh: THREE.Mesh;
      arcIndex: number;
      progress: number;
      speed: number;
    }

    const packets: Packet[] = [];
    const packetGeo = new THREE.SphereGeometry(0.8, 6, 6);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < 10; i++) {
      const arcIndex = i % arcCount;
      const mesh = new THREE.Mesh(packetGeo, packetMat.clone());
      mesh.position.copy(arcs[arcIndex].points[0]);
      globeGroup.add(mesh);
      packets.push({
        mesh,
        arcIndex,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
      });
    }

    // ── Rings ───────────────────────────────────────────────────────
    interface RingData {
      line: THREE.Line;
      rotationSpeed: { x: number; y: number; z: number };
    }

    const rings: RingData[] = [];
    const ringConfigs = [
      { radius: 120, opacity: 0.4, rx: 0.002, ry: 0.001, rz: 0 },
      { radius: 150, opacity: 0.2, rx: -0.001, ry: 0.002, rz: 0.001 },
      { radius: 180, opacity: 0.1, rx: 0.001, ry: -0.001, rz: 0.002 },
    ];

    for (const config of ringConfigs) {
      const ringPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        ringPoints.push(
          new THREE.Vector3(
            config.radius * Math.cos(angle),
            0,
            config.radius * Math.sin(angle)
          )
        );
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x1c69d4,
        transparent: true,
        opacity: config.opacity,
      });
      const ring = new THREE.Line(ringGeo, ringMat);
      globeGroup.add(ring);
      rings.push({
        line: ring,
        rotationSpeed: { x: config.rx, y: config.ry, z: config.rz },
      });
    }

    // ── Mouse Interaction ───────────────────────────────────────────
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetRotationY = (e.clientX / window.innerWidth - 0.5) * 0.5;
      targetRotationX = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };

    window.addEventListener("pointermove", handleMouseMove);

    // ── Animation Loop ──────────────────────────────────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Auto rotation
      globeGroup.rotation.y += 0.001;

      // Mouse influence (lerp)
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.02;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.02;

      // Ring rotations
      for (const ring of rings) {
        ring.line.rotation.x += ring.rotationSpeed.x;
        ring.line.rotation.y += ring.rotationSpeed.y;
        ring.line.rotation.z += ring.rotationSpeed.z;
      }

      // Packet movement
      for (const packet of packets) {
        packet.progress += packet.speed;
        if (packet.progress > 1) packet.progress = 0;

        const arc = arcs[packet.arcIndex];
        const pointIndex = Math.floor(packet.progress * (arc.points.length - 1));
        packet.mesh.position.copy(arc.points[pointIndex]);
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize Handler ──────────────────────────────────────────────
    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}
