/* ==========================================================================
   ANANYA SHUKLA — ENGINEERING LAB v2.0 SYSTEM BEHAVIOR (script.js)
   Mouse Parallax Engine, Interactive Terminal Shell, Three.js Labs, & UI Loops
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientThreeJS();
  initMouseParallax();
  initNavigationTracker();
  initTelemetryObserver();
  initProjectSystem();
  initGithubContributions();
  initTerminalShell();
});

/* ==========================================================================
   1. THREE.JS AMBIENT LAB SYSTEM (Progressive Enhancement)
   ========================================================================== */
function initAmbientThreeJS() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  // Gracefully fallback to standard CSS if WebGL is unavailable
  if (typeof THREE === 'undefined') {
    console.log('Three.js not loaded. Falling back to 2.5D CSS.');
    return;
  }

  let scene, camera, renderer, particles, lines;
  let particleCount = 45;
  let positions = [];
  let velocities = [];
  let connectionMaxDistance = 110;

  try {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 250;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Define colors matching visual identity
    const colors = [
      new THREE.Color('#FFD54A'), // Yellow
      new THREE.Color('#89E7F7'), // Cyan
      new THREE.Color('#FF8A00'), // Orange
    ];

    const geometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400;
      const y = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 200;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      positions.push({ x, y, z });
      velocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.2
      });

      // Random color from palette
      const color = colors[Math.floor(Math.random() * colors.length)];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Custom Canvas Texture for perfectly round Neo-Brutalist nodes
    const size = 16;
    const pCanvas = document.createElement('canvas');
    pCanvas.width = size;
    pCanvas.height = size;
    const ctx = pCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    const texture = new THREE.CanvasTexture(pCanvas);
    const material = new THREE.PointsMaterial({
      size: 10,
      map: texture,
      vertexColors: true,
      transparent: true,
      alphaTest: 0.1
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Line connections between points
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x89e7f7,
      transparent: true,
      opacity: 0.15
    });
    const lineGeom = new THREE.BufferGeometry();
    lines = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lines);

    // Mouse drift parameters
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.05;
      targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera drift
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      const positionsArray = particles.geometry.attributes.position.array;
      const connectedPositions = [];

      for (let i = 0; i < particleCount; i++) {
        // Move particles
        positions[i].x += velocities[i].x;
        positions[i].y += velocities[i].y;
        positions[i].z += velocities[i].z;

        // Bounce off bounds
        if (Math.abs(positions[i].x) > 200) velocities[i].x *= -1;
        if (Math.abs(positions[i].y) > 200) velocities[i].y *= -1;
        if (Math.abs(positions[i].z) > 100) velocities[i].z *= -1;

        positionsArray[i * 3] = positions[i].x;
        positionsArray[i * 3 + 1] = positions[i].y;
        positionsArray[i * 3 + 2] = positions[i].z;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Draw connections
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dz = positions[i].z - positions[j].z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

          if (dist < connectionMaxDistance) {
            connectedPositions.push(positions[i].x, positions[i].y, positions[i].z);
            connectedPositions.push(positions[j].x, positions[j].y, positions[j].z);
          }
        }
      }

      lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(connectedPositions, 3));
      lines.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

  } catch (error) {
    console.warn("WebGL system initialization failed. Fallback operational.", error);
  }
}

/* ==========================================================================
   2. MOUSE PARALLAX & TILT ENGINE
   ========================================================================== */
function initMouseParallax() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice || window.innerWidth < 768) return; // Skip on mobile for performance

  const tiltElements = document.querySelectorAll('.tilt-element');

  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const wWidth = window.innerWidth;
    const wHeight = window.innerHeight;

    // Calculate percentage coordinates from center (-0.5 to 0.5)
    const px = (mouseX / wWidth) - 0.5;
    const py = (mouseY / wHeight) - 0.5;

    tiltElements.forEach(el => {
      const depth = parseFloat(el.getAttribute('data-depth')) || 0.1;
      
      // Calculate rotation angles
      const rotX = -py * depth * 60; // Max tilt rotation angle 30deg
      const rotY = px * depth * 60;

      // Calculate translation offsets
      const transX = px * depth * 40;
      const transY = py * depth * 40;

      el.style.setProperty('--rx', `${rotX}deg`);
      el.style.setProperty('--ry', `${rotY}deg`);
      
      // Additional shift offset shadow effect
      el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${transX}px, ${transY}px, 10px)`;
    });
  });

  // Reset elements on mouse leave
  window.addEventListener('mouseleave', () => {
    tiltElements.forEach(el => {
      el.style.setProperty('--rx', `0deg`);
      el.style.setProperty('--ry', `0deg`);
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)`;
    });
  });
}

/* ==========================================================================
   3. NAVIGATION TRACKER (INDEX AUTO-ACTIVE SCROLL)
   ========================================================================== */
function initNavigationTracker() {
  const sections = document.querySelectorAll('.section-scroll-marker');
  const indexTabs = document.querySelectorAll('.index-tab');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');

  // Toggle mobile overlay
  if (mobileMenuBtn && mobileOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('open');
      mobileOverlay.classList.toggle('open');
    });

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('open');
        mobileOverlay.classList.remove('open');
      });
    });
  }

  // Set active class on desktop tabs on click
  indexTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      indexTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Scroll spy implementation using IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Center viewport tracking
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (!id) return;

        // Map parent sections if needed
        let targetId = id;
        
        indexTabs.forEach(tab => {
          if (tab.getAttribute('data-target') === targetId) {
            indexTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   4. LEARNING TELEMETRY PROGRESS BARS
   ========================================================================== */
function initTelemetryObserver() {
  const telemetryFills = document.querySelectorAll('.telemetry-fill');
  
  const observerOptions = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        telemetryFills.forEach(fill => {
          const target = fill.getAttribute('data-target');
          fill.style.width = `${target}%`;
        });
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  const container = document.querySelector('.learning-telemetry-note');
  if (container) {
    observer.observe(container);
  }
}

/* ==========================================================================
   5. PROJECT FILTER & CARD EXPANDER SYSTEM
   ========================================================================== */
function initProjectSystem() {
  const projectCards = document.querySelectorAll('.project-card');
  const expandButtons = document.querySelectorAll('.project-expand-btn');

  // Expand project card details
  expandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      card.classList.toggle('expanded');
      
      if (card.classList.contains('expanded')) {
        btn.innerHTML = 'COLLAPSE &uarr;';
        card.style.boxShadow = 'var(--shadow-lg)';
      } else {
        btn.innerHTML = 'DETAILS &darr;';
        card.style.boxShadow = 'var(--shadow)';
      }
    });
  });
}

// Global toggle helper for Experiment Log accordion
window.toggleExp = function(headerElement) {
  const card = headerElement.closest('.exp-log-card');
  const indicator = card.querySelector('.exp-indicator');
  card.classList.toggle('open');
  
  if (card.classList.contains('open')) {
    indicator.innerHTML = '&minus;';
  } else {
    indicator.innerHTML = '&plus;';
  }
};

/* ==========================================================================
   6. STATIC GITHUB MOCK CONTRIBUTION CHART
   ========================================================================== */
function initGithubContributions() {
  const grid = document.getElementById('contribution-grid');
  if (!grid) return;

  // Build a contribution tracker mapping (7 weeks, 5 days per week = 35 boxes)
  const columns = 7;
  const rows = 5;
  const colors = [
    '#f0f0f0', // None
    '#89e7f7', // Light Cyan
    '#ffd54a', // Yellow
    '#ff8a00', // Orange
  ];

  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      const dot = document.createElement('div');
      dot.className = 'contrib-dot';
      
      // Seed random behavior with bias towards active contributions
      let colorIdx = 0;
      const rand = Math.random();
      if (rand > 0.85) colorIdx = 3;      // High Orange
      else if (rand > 0.60) colorIdx = 2; // Mid Yellow
      else if (rand > 0.20) colorIdx = 1; // Low Cyan
      
      dot.style.backgroundColor = colors[colorIdx];
      grid.appendChild(dot);
    }
  }
}

/* ==========================================================================
   7. INTERACTIVE MONOSPACE NOTEBOOK TERMINAL (ANANYA@DEV-LAB)
   ========================================================================== */
function initTerminalShell() {
  const inputEl = document.getElementById('terminal-input');
  const bodyEl = document.getElementById('terminal-body');
  if (!inputEl || !bodyEl) return;

  // Keep focus in terminal when clicking body
  window.focusTerminal = function() {
    inputEl.focus();
  };

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = inputEl.value.trim().toLowerCase();
      processCommand(command);
      inputEl.value = '';
    }
  });

  function printLine(text, isOutput = true, cssClass = '') {
    const line = document.createElement('div');
    line.className = isOutput ? 'terminal-output' : 'terminal-line';
    if (cssClass) line.classList.add(cssClass);
    line.innerHTML = text;
    
    // Insert before prompt wrapper
    const promptWrapper = inputEl.closest('.terminal-input-line');
    bodyEl.insertBefore(line, promptWrapper);
    
    // Auto-scroll body
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function processCommand(cmd) {
    // Print echo command
    printLine(`ANANYA@DEV-LAB:~$ ${cmd}`, false);

    if (!cmd) return;

    switch (cmd) {
      case 'clear':
        // Flush everything except input line
        const promptLine = bodyEl.querySelector('.terminal-input-line');
        bodyEl.innerHTML = '';
        bodyEl.appendChild(promptLine);
        break;

      case 'help':
        printLine(`
          Available Commands:<br>
          &nbsp;&nbsp;<span class="cmd">about</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Print brief details about Ananya<br>
          &nbsp;&nbsp;<span class="cmd">skills</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List primary active technologies<br>
          &nbsp;&nbsp;<span class="cmd">projects</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show built &amp; building projects<br>
          &nbsp;&nbsp;<span class="cmd">learning</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Print active learning progress metrics<br>
          &nbsp;&nbsp;<span class="cmd">architecture</span>&nbsp;Render schematic layout outline<br>
          &nbsp;&nbsp;<span class="cmd">roadmap</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Display engineering progress pathway<br>
          &nbsp;&nbsp;<span class="cmd">contact</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List communication network endpoints<br>
          &nbsp;&nbsp;<span class="cmd">clear</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Flush console screen
        `);
        break;

      case 'about':
        printLine(`
          NAME: ANANYA SHUKLA<br>
          ROLE: Full Stack Developer & AI Engineer<br>
          FOCUS: Integrating LLMs and robust distributed system architectures.<br>
          DESC: "I don't just write code—I build full-stack applications, explore AI engineering, and learn how systems are designed, scaled, debugged, and improved."
        `);
        break;

      case 'skills':
        printLine(`
          > Active:<br>
          &nbsp;&nbsp;- Java, Python, JavaScript, Next.js, React.js, Express, Node.js, MongoDB<br>
          > Core AI:<br>
          &nbsp;&nbsp;- LLM APIs, Vector DBs, Context RAG Pipelines<br>
          > Tooling:<br>
          &nbsp;&nbsp;- Git, Github, npm, VS Code
        `);
        break;

      case 'projects':
        printLine(`
          ✓ BUILT:<br>
          &nbsp;&nbsp;- AI Resume Analyzer (diagnostic resume validator)<br>
          &nbsp;&nbsp;- AI HireMe Chatbot (recruiter conversational agent)
        `);
        break;

      case 'learning':
        printLine(`
          Current Learning Telemetry:<br>
          &nbsp;&nbsp;Web Dev: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[████████░░] 80%<br>
          &nbsp;&nbsp;Backend: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[██████░░░░] 60%<br>
          &nbsp;&nbsp;AI Eng: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[█████░░░░░] 50%<br>
          &nbsp;&nbsp;DSA: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[████░░░░░░] 40%<br>
          &nbsp;&nbsp;Sys Design: &nbsp;&nbsp;[███░░░░░░░] 30%
        `);
        break;

      case 'architecture':
        printLine(`
          CLIENT -> [LOAD BALANCER] -> [API SERVERS] -> [REDIS CACHE] -> [DATABASE]
        `);
        break;

      case 'roadmap':
        printLine(`
          PROGRAMMING &rarr; WEB DEV &rarr; BACKEND &rarr; DATABASES &rarr; CS+DSA &rarr; AI LAB &rarr; SYSTEM DESIGN
        `);
        break;

      case 'contact':
        printLine(`
          EMAIL: shuklaananya762@gmail.com<br>
          GITHUB: https://github.com/anapearl06<br>
          LINKEDIN: https://linkedin.com/in/ananyashukla12<br>
          X: https://x.com/ana12chris
        `);
        break;

      default:
        printLine(`bash: command not found: ${cmd}. Type <span class="cmd">help</span> for a list of endpoints.`);
        break;
    }
  }
}
