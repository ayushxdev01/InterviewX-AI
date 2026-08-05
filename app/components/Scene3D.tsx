"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Scene3D({ opacity = 1 }: { opacity?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Shape 1: top-left corner
    const geo1 = new THREE.IcosahedronGeometry(2.6, 1);
    const wire1 = new THREE.WireframeGeometry(geo1);
    const line1 = new THREE.LineSegments(
      wire1,
      new THREE.LineBasicMaterial({ color: 0x5b8def, transparent: true, opacity: 0.5 })
    );
    line1.position.set(-5.5, 3, -3);
    scene.add(line1);

    // Shape 2: bottom-right corner — same shape, same color, for balance
    const geo2 = new THREE.IcosahedronGeometry(2.6, 1);
    const wire2 = new THREE.WireframeGeometry(geo2);
    const line2 = new THREE.LineSegments(
      wire2,
      new THREE.LineBasicMaterial({ color: 0x5b8def, transparent: true, opacity: 0.5 })
    );
    line2.position.set(5.5, -3, -3);
    scene.add(line2);

    // Particle field
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 220;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x3ddc97,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let frameId: number;
    let t = 0;
    function animate() {
      t += 0.003;

      line1.rotation.x += 0.0015;
      line1.rotation.y += 0.002;

      line2.rotation.x -= 0.0013;
      line2.rotation.y -= 0.0018;

      particles.rotation.y -= 0.0006;

      camera.position.x = Math.sin(t) * 0.6;
      camera.position.y = Math.cos(t * 0.7) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      geo1.dispose();
      wire1.dispose();
      geo2.dispose();
      wire2.dispose();
      particleGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ opacity }}
      className="absolute inset-0 -z-10 pointer-events-none"
    />
  );
}