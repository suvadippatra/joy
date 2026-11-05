import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RotateCcw, Compass, Eye, Sparkles, Sun, Moon, Globe, Shield, Orbit } from 'lucide-react';
import { LangId } from '../../services/weatherTranslations';
import { computeAstroSnapshot } from '../../services/weatherService';

interface Celestial3DViewProps {
  lat: number;
  lon: number;
  placeName: string;
  lang: LangId;
}

export const Celestial3DView: React.FC<Celestial3DViewProps> = ({
  lat,
  lon,
  placeName,
  lang
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'live' | 'eclipse'>('live');
  const [viewPreset, setViewPreset] = useState<'overview' | 'earth' | 'moon'>('overview');

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Interaction controls
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.5,
    phi: 1.15,
    radius: 34
  });

  const now = useMemo(() => new Date(), []);
  const astroData = useMemo(() => computeAstroSnapshot(now, lat, lon), [now, lat, lon]);

  // High-Resolution Procedural Earth, Clouds, and Moon Textures
  const textures = useMemo(() => {
    // 1. High-Detail Earth Texture Canvas (2048x1024)
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 2048;
    earthCanvas.height = 1024;
    const eCtx = earthCanvas.getContext('2d')!;

    // Deep Ocean gradient
    const oceanGrad = eCtx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#0a2540');
    oceanGrad.addColorStop(0.3, '#0b3259');
    oceanGrad.addColorStop(0.5, '#0d47a1');
    oceanGrad.addColorStop(0.7, '#0b3259');
    oceanGrad.addColorStop(1, '#0a2540');
    eCtx.fillStyle = oceanGrad;
    eCtx.fillRect(0, 0, 2048, 1024);

    // Continental Shelf (Cyan/Teal coastal shallow waters)
    eCtx.fillStyle = 'rgba(2, 132, 199, 0.4)';
    const drawShelf = (cx: number, cy: number, rx: number, ry: number) => {
      eCtx.beginPath();
      eCtx.ellipse(cx, cy, rx + 14, ry + 14, 0, 0, Math.PI * 2);
      eCtx.fill();
    };

    // Continents
    const drawLand = (cx: number, cy: number, rx: number, ry: number, color = '#2e7d32') => {
      eCtx.fillStyle = color;
      eCtx.beginPath();
      eCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      eCtx.fill();
    };

    // Eurasia & Mediterranean
    drawShelf(1400, 360, 280, 180);
    drawLand(1400, 360, 270, 170, '#388e3c');
    drawLand(1200, 300, 120, 80, '#2e7d32'); // Europe

    // Indian Subcontinent (Accurate Peninsular Relief)
    drawShelf(1420, 500, 90, 120);
    eCtx.beginPath();
    eCtx.moveTo(1370, 440);
    eCtx.lineTo(1470, 440);
    eCtx.lineTo(1420, 600); // Kanyakumari apex
    eCtx.closePath();
    eCtx.fillStyle = '#43a047';
    eCtx.fill();

    // Himalayan Mountain Arc (snow & arid relief)
    eCtx.strokeStyle = '#e0e0e0';
    eCtx.lineWidth = 14;
    eCtx.beginPath();
    eCtx.arc(1420, 460, 90, Math.PI * 1.1, Math.PI * 1.8);
    eCtx.stroke();

    // Sri Lanka teardrop island
    eCtx.beginPath();
    eCtx.ellipse(1430, 630, 12, 18, 0, 0, Math.PI * 2);
    eCtx.fillStyle = '#2e7d32';
    eCtx.fill();

    // Africa & Sahara Desert
    drawShelf(1024, 560, 140, 220);
    drawLand(1024, 560, 130, 210, '#388e3c');
    // Sahara Arid Sand
    eCtx.fillStyle = '#d4a373';
    eCtx.beginPath();
    eCtx.ellipse(1020, 420, 120, 70, 0, 0, Math.PI * 2);
    eCtx.fill();

    // North America
    drawShelf(460, 340, 160, 150);
    drawLand(460, 340, 150, 140, '#2e7d32');

    // South America
    drawShelf(580, 680, 110, 200);
    drawLand(580, 680, 100, 190, '#1b5e20'); // Amazon green

    // Australia
    drawShelf(1680, 720, 110, 80);
    drawLand(1680, 720, 100, 70, '#c28b5e'); // Outback red-amber

    // Polar Ice caps
    eCtx.fillStyle = 'rgba(248, 250, 252, 0.95)';
    eCtx.fillRect(0, 0, 2048, 70); // Arctic
    eCtx.fillRect(0, 940, 2048, 84); // Antarctica

    // User location target pin on Earth
    const pinX = ((lon + 180) / 360) * 2048;
    const pinY = ((90 - lat) / 180) * 1024;
    eCtx.fillStyle = '#ff1744';
    eCtx.beginPath();
    eCtx.arc(pinX, pinY, 9, 0, Math.PI * 2);
    eCtx.fill();
    eCtx.strokeStyle = '#ffffff';
    eCtx.lineWidth = 3;
    eCtx.stroke();

    // 2. Realistic Semi-Transparent Clouds Canvas (1024x512)
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 1024;
    cloudCanvas.height = 512;
    const cCtx = cloudCanvas.getContext('2d')!;
    cCtx.clearRect(0, 0, 1024, 512);

    cCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let i = 0; i < 48; i++) {
      const cx = (i * 47) % 1024;
      const cy = 100 + ((i * 31) % 320);
      const rx = 40 + (i % 6) * 15;
      const ry = 15 + (i % 4) * 8;
      cCtx.beginPath();
      cCtx.ellipse(cx, cy, rx, ry, 0.1, 0, Math.PI * 2);
      cCtx.fill();
    }

    // 3. Moon Texture Canvas with Craters & Lunar Maria (512x256)
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 512;
    moonCanvas.height = 256;
    const mCtx = moonCanvas.getContext('2d')!;
    mCtx.fillStyle = '#9e9e9e';
    mCtx.fillRect(0, 0, 512, 256);

    // Maria (Dark volcanic plains)
    mCtx.fillStyle = '#616161';
    mCtx.beginPath();
    mCtx.arc(190, 110, 48, 0, Math.PI * 2);
    mCtx.arc(260, 100, 38, 0, Math.PI * 2);
    mCtx.arc(230, 150, 42, 0, Math.PI * 2);
    mCtx.fill();

    // Craters
    for (let i = 0; i < 45; i++) {
      const cx = (i * 37) % 512;
      const cy = (i * 23) % 256;
      const r = 3 + (i % 6);
      mCtx.beginPath();
      mCtx.arc(cx, cy, r, 0, Math.PI * 2);
      mCtx.fillStyle = 'rgba(40, 40, 40, 0.4)';
      mCtx.fill();
      mCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      mCtx.stroke();
    }

    return {
      earthTex: new THREE.CanvasTexture(earthCanvas),
      cloudTex: new THREE.CanvasTexture(cloudCanvas),
      moonTex: new THREE.CanvasTexture(moonCanvas)
    };
  }, [lat, lon]);

  // Setup Three.js Scene with Real Shadows (Moon shadow onto Earth)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. High-Performance WebGL Renderer with Shadow Maps enabled!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Realistic shadows
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Starfield Cosmic Particles
    const starCount = 500;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 90 + Math.random() * 30;
      const th = Math.random() * Math.PI * 2;
      const ph = (Math.random() - 0.5) * Math.PI;
      starPos[i] = r * Math.cos(ph) * Math.sin(th);
      starPos[i + 1] = r * Math.sin(ph);
      starPos[i + 2] = r * Math.cos(ph) * Math.cos(th);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.75 });
    scene.add(new THREE.Points(starGeom, starMat));

    // 5. Sun Celestial Body (Casting Directional Sunlight & Shadows)
    const sunGroup = new THREE.Group();
    sunGroup.position.set(0, 0, -48);

    const sunGeom = new THREE.SphereGeometry(4.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3a0 });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunGroup.add(sunMesh);

    // Glowing Sun Corona
    const coronaGeom = new THREE.SphereGeometry(5.8, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffa000,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide
    });
    sunGroup.add(new THREE.Mesh(coronaGeom, coronaMat));
    scene.add(sunGroup);

    // Directional Sunlight with Shadows enabled
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.copy(sunGroup.position);
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;

    scene.add(sunLight);
    scene.add(sunLight.target);

    // Soft Ambient Light so the night side of Earth isn't pitch black
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.45);
    scene.add(ambientLight);

    // 6. Earth Celestial Sphere (Receiving Shadows, Casting Shadows)
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = THREE.MathUtils.degToRad(23.44); // Authentic Earth axial tilt

    const earthGeom = new THREE.SphereGeometry(6, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: textures.earthTex,
      roughness: 0.65,
      metalness: 0.08
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true; // Crucial: Receives Moon's shadow!
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Atmospheric Clouds Layer on Earth
    const cloudsGeom = new THREE.SphereGeometry(6.12, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: textures.cloudTex,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeom, cloudsMat);
    cloudsMesh.receiveShadow = true;
    earthGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Atmosphere Glow Halo
    const atmoGeom = new THREE.SphereGeometry(6.35, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    earthGroup.add(new THREE.Mesh(atmoGeom, atmoMat));
    scene.add(earthGroup);

    // 7. Moon Celestial Sphere (Casting Shadows onto Earth)
    const moonGroup = new THREE.Group();
    moonGroup.rotation.x = THREE.MathUtils.degToRad(5.14); // Lunar orbit inclination

    const moonGeom = new THREE.SphereGeometry(1.65, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      map: textures.moonTex,
      roughness: 0.85,
      metalness: 0.05
    });
    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
    moonMesh.castShadow = true; // Crucial: Casts shadow onto Earth!
    moonMesh.receiveShadow = true;
    moonGroup.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Lunar Orbit Line
    const orbitCurve = new THREE.EllipseCurve(0, 0, 16, 16, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(64);
    const orbitGeom = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.25 });
    moonGroup.add(new THREE.Line(orbitGeom, orbitMat));

    scene.add(moonGroup);

    // 8. Align Real Astronomical Positions
    // Local Solar Time Rotation: Align user location to solar noon
    const curHour = now.getHours() + now.getMinutes() / 60;
    // Rotation so current local time faces sun accurately
    const solarAngle = ((curHour - 12) / 24) * Math.PI * 2;
    earthMesh.rotation.y = solarAngle;

    // Actual Lunar Phase Angle
    const synodicAge = astroData.moonAge; // 0 to 29.53 days
    const moonAngle = (synodicAge / 29.53) * Math.PI * 2;

    if (viewMode === 'eclipse') {
      // Eclipse Alignment: Moon directly between Sun & Earth casting shadow
      moonMesh.position.set(0, 0, -16);
    } else {
      moonMesh.position.set(
        Math.cos(moonAngle) * 16,
        Math.sin(moonAngle) * 1.4,
        Math.sin(moonAngle) * 16
      );
    }

    // Gentle Real-Time Animation Loop (Buttery smooth 60fps)
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Very subtle slow cloud drift
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0003;
      }

      // Update Camera based on user orbit drag
      const cam = cameraRef.current;
      if (cam) {
        const { theta, phi, radius } = cameraAngleRef.current;
        cam.position.x = radius * Math.sin(phi) * Math.sin(theta);
        cam.position.y = radius * Math.cos(phi);
        cam.position.z = radius * Math.sin(phi) * Math.cos(theta);
        cam.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [textures, lat, lon, viewMode, now, astroData]);

  // Camera presets
  useEffect(() => {
    if (viewPreset === 'overview') {
      cameraAngleRef.current = { theta: 0.5, phi: 1.15, radius: 34 };
    } else if (viewPreset === 'earth') {
      cameraAngleRef.current = { theta: 0.1, phi: 1.25, radius: 16 };
    } else if (viewPreset === 'moon') {
      cameraAngleRef.current = { theta: -1.3, phi: 1.2, radius: 24 };
    }
  }, [viewPreset]);

  // Touch and Mouse Orbit Drag Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    cameraAngleRef.current.theta -= dx * 0.008;
    cameraAngleRef.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, cameraAngleRef.current.phi - dy * 0.008));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(11, Math.min(65, cameraAngleRef.current.radius + e.deltaY * 0.04));
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 3D WebGL Canvas Container */}
      <div
        className="relative w-full h-[390px] sm:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Viewport Top Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Top Left: Badges */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md">
              <Sparkles size={12} className="text-amber-400" />
              <span>Real-Time Astronomical State</span>
            </span>
          </div>

          {/* Top Right: Camera Presets */}
          <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-md">
            <button
              type="button"
              onClick={() => setViewPreset('overview')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                viewPreset === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setViewPreset('earth')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                viewPreset === 'earth' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Earth Focus
            </button>
            <button
              type="button"
              onClick={() => setViewPreset('moon')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                viewPreset === 'moon' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Moon Orbit
            </button>
          </div>
        </div>

        {/* Bottom Mode Switcher: Real-Time vs Moon Shadow / Eclipse Alignment */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-auto flex items-center justify-between bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 shadow-2xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('live')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'live' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe size={13} />
              <span>Live Actual State</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('eclipse')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'eclipse' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Orbit size={13} />
              <span>Moon's Shadow on Earth</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-300 hidden sm:flex items-center gap-2">
            <span>Phase: <b className="text-amber-300">{astroData.moonPhaseName}</b></span>
            <span>•</span>
            <span>Illum: <b className="text-white">{astroData.moonIllumination}%</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};
