import * as THREE from './Assets/Vendor/three.module.js';

const hero = document.querySelector('.sectors-hero');
const canvas = document.querySelector('.sectors-hero-canvas');
const dragSurface = document.querySelector('.sectors-hero-drag-surface');

if (hero && canvas && dragSurface) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 180);
  camera.position.z = 54;

  const galaxy = new THREE.Group();
  galaxy.rotation.x = -0.38;
  galaxy.rotation.z = -0.16;
  scene.add(galaxy);

  const nebula = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          vec2 point = (vUv - 0.5) * 2.0;
          float radius = length(point);
          float angle = atan(point.y, point.x);
          float spiral = 0.5 + 0.5 * cos(angle * 3.0 - radius * 10.5);
          float arm = pow(max(spiral, 0.0), 3.0);
          float envelope = exp(-radius * 2.35) * (1.0 - smoothstep(0.12, 1.08, radius));
          float core = exp(-radius * 19.0);
          vec3 deepBlue = vec3(0.025, 0.10, 0.22);
          vec3 icyBlue = vec3(0.24, 0.56, 0.88);
          vec3 armColor = mix(deepBlue, icyBlue, arm);
          vec3 color = mix(armColor, vec3(0.82, 0.91, 1.0), core);
          float opacity = envelope * (0.14 + arm * 0.62) + core * 0.72;
          gl_FragColor = vec4(color, opacity);
        }
      `
    })
  );
  nebula.position.z = -0.12;
  galaxy.add(nebula);

  const createGalaxyStars = () => {
    const positions = [];
    const colors = [];
    const armCount = 3;
    const starCount = 12500;
    const color = new THREE.Color();

    for (let index = 0; index < starCount; index += 1) {
      const radius = Math.pow(Math.random(), 0.72);
      const arm = index % armCount;
      const angle = arm * (Math.PI * 2 / armCount) + radius * 9.2 + (Math.random() - 0.5) * 0.52;
      const spread = (Math.random() - 0.5) * (0.055 + radius * 0.06);
      positions.push(
        Math.cos(angle) * radius + spread,
        Math.sin(angle) * radius * 0.68 + spread,
        (Math.random() - 0.5) * 0.025
      );

      color.setHSL(0.57 + Math.random() * 0.1, 0.58, 0.48 + Math.random() * 0.34);
      colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.045,
      transparent: true,
      opacity: 0.74,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    return new THREE.Points(geometry, material);
  };

  galaxy.add(createGalaxyStars());

  const backgroundPositions = [];
  const backgroundColors = [];
  const backgroundColor = new THREE.Color();

  for (let index = 0; index < 1900; index += 1) {
    backgroundPositions.push(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 68,
      -Math.random() * 54
    );
    const tint = Math.random();
    backgroundColor.setRGB(0.48 + tint * 0.42, 0.62 + tint * 0.3, 0.82 + tint * 0.18);
    backgroundColors.push(backgroundColor.r, backgroundColor.g, backgroundColor.b);
  }

  const backgroundGeometry = new THREE.BufferGeometry();
  backgroundGeometry.setAttribute('position', new THREE.Float32BufferAttribute(backgroundPositions, 3));
  backgroundGeometry.setAttribute('color', new THREE.Float32BufferAttribute(backgroundColors, 3));
  const backgroundStars = new THREE.Points(
    backgroundGeometry,
    new THREE.PointsMaterial({
      size: 0.055,
      transparent: true,
      opacity: 0.56,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
  );
  scene.add(backgroundStars);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const baseRotation = { x: galaxy.rotation.x, y: 0.22 };
  const interactionRotation = { x: 0, y: 0 };
  const scrollRotation = { x: 0, y: 0 };
  const targetRotation = { x: baseRotation.x, y: baseRotation.y };
  let dragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  const render = () => renderer.render(scene, camera);

  const updateTargetRotation = () => {
    targetRotation.x = THREE.MathUtils.clamp(
      baseRotation.x + interactionRotation.x + scrollRotation.x,
      -1.1,
      1.1
    );
    targetRotation.y = baseRotation.y + interactionRotation.y + scrollRotation.y;

    if (reducedMotion) {
      galaxy.rotation.set(targetRotation.x, targetRotation.y, galaxy.rotation.z);
      render();
    }
  };

  const updateScrollRotation = () => {
    const heroBounds = hero.getBoundingClientRect();
    const progress = THREE.MathUtils.clamp(
      (window.innerHeight - heroBounds.top) / (window.innerHeight + heroBounds.height),
      0,
      1
    );
    scrollRotation.y = (progress - 0.5) * 1.4;
    scrollRotation.x = Math.sin(progress * Math.PI) * 0.2;
    hero.style.setProperty('--galaxy-scroll-shift', `${((progress - 0.5) * 28).toFixed(2)}px`);
    updateTargetRotation();
  };

  const resizeScene = () => {
    const width = Math.max(1, hero.clientWidth);
    const height = Math.max(1, hero.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const viewWidth = viewHeight * camera.aspect;
    const radius = Math.min(viewHeight * 0.48, viewWidth * 0.4);
    galaxy.scale.set(radius, radius * 0.72, radius * 0.34);
    galaxy.position.set(viewWidth * 0.13, viewHeight * 0.025, 0);
    updateScrollRotation();
    render();
  };

  dragSurface.addEventListener('pointerdown', (event) => {
    dragging = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    dragSurface.setPointerCapture(event.pointerId);
  });

  dragSurface.addEventListener('pointermove', (event) => {
    if (!dragging) {
      return;
    }

    interactionRotation.y += (event.clientX - lastPointerX) * 0.006;
    interactionRotation.x += (event.clientY - lastPointerY) * 0.004;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    updateTargetRotation();
  });

  const stopDragging = () => {
    dragging = false;
  };
  dragSurface.addEventListener('pointerup', stopDragging);
  dragSurface.addEventListener('pointercancel', stopDragging);

  dragSurface.addEventListener('keydown', (event) => {
    const rotationStep = 0.12;
    if (event.key === 'ArrowLeft') interactionRotation.y -= rotationStep;
    else if (event.key === 'ArrowRight') interactionRotation.y += rotationStep;
    else if (event.key === 'ArrowUp') interactionRotation.x -= rotationStep;
    else if (event.key === 'ArrowDown') interactionRotation.x += rotationStep;
    else return;
    event.preventDefault();
    updateTargetRotation();
  });

  window.addEventListener('resize', resizeScene);
  window.addEventListener('scroll', updateScrollRotation, { passive: true });
  resizeScene();
  hero.dataset.galaxyScene = 'ready';

  if (!reducedMotion) {
    const animate = () => {
      requestAnimationFrame(animate);
      if (!dragging) targetRotation.y += 0.00035;
      galaxy.rotation.x += (targetRotation.x - galaxy.rotation.x) * 0.045;
      galaxy.rotation.y += (targetRotation.y - galaxy.rotation.y) * 0.045;
      backgroundStars.rotation.y -= 0.000025;
      render();
    };
    animate();
  }
}