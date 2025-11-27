// theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  
  // update button text
  const btn = document.getElementById('theme-toggle');
  const isDark = document.body.classList.contains('dark-mode');
  if (isDark) {
    btn.textContent = '☀️ Light';
  } else {
    btn.textContent = '🌙 Dark';
  }
  
  // update scene background color
  const renderer = window.getRendererGlobal();
  if (renderer) {
    renderer.setClearColor(isDark ? 0x0a0e1a : 0xf8f9fa);
  }
  
  switchBackground();
});

// set initial button text
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (document.body.classList.contains('dark-mode')) {
      btn.textContent = '☀️ Light';
    } else {
      btn.textContent = '🌙 Dark';
    }
  });
} else {
  const btn = document.getElementById('theme-toggle');
  if (document.body.classList.contains('dark-mode')) {
    btn.textContent = '☀️ Light';
  } else {
    btn.textContent = '🌙 Dark';
  }
}

function switchBackground() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const scene = window.getSceneGlobal();
  const effectObjects = window.getEffectObjectsGlobal();
  
  if (!scene || !effectObjects) return;
  
  const matrixCanvas = document.getElementById('matrix-canvas');
  
  if (isDarkMode) {
    // show matrix canvas
    if (matrixCanvas) matrixCanvas.style.display = 'block';
    if (effectObjects.particles) {
      scene.remove(effectObjects.particles);
    }
    window.setCurrentEffect('matrix');
  } else {
    // hide matrix, show particles
    if (matrixCanvas) matrixCanvas.style.display = 'none';
    if (effectObjects.particles && scene.children.indexOf(effectObjects.particles) === -1) {
      scene.add(effectObjects.particles);
    }
    window.setCurrentEffect('particles');
  }
}

// three.js scene - high quality animated background with multiple effects
let sceneGlobal, rendererGlobal, effectObjectsGlobal, currentEffectGlobal = 'particles';

if (window.THREE) {
  let scene, camera, renderer, particles, currentEffect = 'particles';
  let scrollProgress = 0;
  let effectObjects = {};

  function initThreeScene() {
    // setup scene
    scene = new THREE.Scene();
    const isDark = document.body.classList.contains('dark-mode');
    scene.background = new THREE.Color(isDark ? 0x0a0e1a : 0xf8f9fa);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // make globals accessible
    sceneGlobal = scene;
    rendererGlobal = renderer;
    effectObjectsGlobal = effectObjects;

    const canvas = document.getElementById('bg-canvas');
    canvas.parentNode.insertBefore(renderer.domElement, canvas);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
    renderer.domElement.style.pointerEvents = 'none';

    // add lighting
    const light = new THREE.PointLight(isDark ? 0x00ff41 : 0x00a300, 1, 500);
    light.position.set(50, 50, 50);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // create all effects
    createParticlesEffect();
    createMatrixEffect();

    // show initial effect
    if (isDark) {
      if (window.matrixCanvas) window.matrixCanvas.style.display = 'block';
      currentEffect = 'matrix';
    } else {
      scene.add(effectObjects.particles);
      currentEffect = 'particles';
    }
    currentEffectGlobal = currentEffect;

    // handle events
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);

    animate();
  }

  function createParticlesEffect() {
    const particleCount = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 200;
      colors[i] = 0;
      colors[i + 1] = 0.64;
      colors[i + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00a300';
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      map: texture,
      size: 0.8,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const points = new THREE.Points(geometry, material);
    effectObjects.particles = points;
  }

  function createMatrixEffect() {
    // create canvas-based matrix effect instead of Three.js particles
    const matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'matrix-canvas';
    matrixCanvas.style.position = 'fixed';
    matrixCanvas.style.top = '0';
    matrixCanvas.style.left = '0';
    matrixCanvas.style.zIndex = '-1';
    matrixCanvas.style.pointerEvents = 'none';
    matrixCanvas.style.display = 'none';
    document.body.appendChild(matrixCanvas);
    
    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const charSize = 10;
    const columns = matrixCanvas.width / charSize;
    const drops = Array(Math.floor(columns)).fill(0);
    let time = 0;

    function drawMatrix() {
      ctx.fillStyle = 'rgba(10, 14, 26, 0.05)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = `${charSize}px 'Courier New', monospace`;
      ctx.globalAlpha = 0.3;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * charSize, drops[i] * charSize);
        if (drops[i] * charSize > matrixCanvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      ctx.globalAlpha = 1;
    }

    function animateMatrix() {
      drawMatrix();
      time++;
      requestAnimationFrame(animateMatrix);
    }

    // expose matrix canvas and animation for theme toggle
    window.matrixCanvas = matrixCanvas;
    window.animateMatrix = animateMatrix;
    window.stopMatrixAnimation = false;
    
    // start animation
    animateMatrix();

    // handle resize
    window.addEventListener('resize', () => {
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
    });
  }

  function onScroll() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = window.scrollY / scrollHeight;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    // animate based on current effect
    const obj = effectObjects[currentEffect];
    if (obj) {
      obj.rotation.x += 0.0001 + scrollProgress * 0.001;
      obj.rotation.y += 0.0003 + scrollProgress * 0.001;
      obj.rotation.z += 0.0002 + scrollProgress * 0.0005;
      obj.position.y = scrollProgress * 20 - 10;
    }

    renderer.render(scene, camera);
  }

  // expose globals for theme toggle
  window.getSceneGlobal = () => scene;
  window.getRendererGlobal = () => renderer;
  window.getEffectObjectsGlobal = () => effectObjects;
  window.getCurrentEffect = () => currentEffect;
  window.setCurrentEffect = (effect) => { currentEffect = effect; };

  // init when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeScene);
  } else {
    initThreeScene();
  }
}

// fallback: set year in footer
document.addEventListener('DOMContentLoaded', function() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // typing effect for name
  const nameEl = document.getElementById('name');
  const names = ['Adwait', 'Cybersecurity Student', 'Ethical Hacker'];
  let nameIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentName = names[nameIndex];
    if (isDeleting) {
      nameEl.textContent = currentName.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        nameIndex = (nameIndex + 1) % names.length;
      }
    } else {
      nameEl.textContent = currentName.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentName.length) {
        isDeleting = true;
        setTimeout(typeEffect, 1500);
        return;
      }
    }
    setTimeout(typeEffect, 50);
  }
  if (nameEl) typeEffect();

  // smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
});
