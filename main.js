/**
 * ============================================================================
 * ABISMO — Descida à Fossa das Marianas
 * Script Principal: GSAP ScrollTrigger, Profundímetro, Lanterna, Cardume e Áudio
 * ============================================================================
 */

// Registrar plugins do GSAP caso o objeto global esteja carregado
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. BANCO DE DADOS DAS CRIATURAS MARINHAS (Para o Modal Interativo)
     -------------------------------------------------------------------------- */
  const CREATURES_DATA = {
    'sardinella': {
      name: 'Cardume de Sardinhas-Laranja',
      scientific: 'Sardinella aurita',
      depth: '0 – 200 metros',
      fact: 'Nadam em sincronia estrita sem colidir graças à sua linha lateral — um canal repleto de neuromastos sensoriais capaz de detectar vibrações milimétricas na pressão da água.'
    },
    'aequorea': {
      name: 'Água-Viva Cristalina',
      scientific: 'Aequorea victoria',
      depth: '200 – 1.000 metros',
      fact: 'Foi através dos tecidos translúcidos desta hidromedusa que os cientistas isolaram a GFP (Proteína Verde Fluorescente), ferramenta vital da genética moderna que rendeu o Nobel de Química em 2008.'
    },
    'myctophid': {
      name: 'Peixe-Lanterna',
      scientific: 'Myctophum punctatum',
      depth: '200 – 1.000 metros',
      fact: 'Possui fileiras de órgãos fotóforos na barriga que emitem luz para baixo com a mesma intensidade da penumbra solar, tornando sua silhueta invisível para predadores que olham do fundo para cima (contra-iluminação).'
    },
    'anglerfish': {
      name: 'Peixe-Pescador Abissal',
      scientific: 'Melanocetus johnsonii',
      depth: '1.000 – 4.000 metros',
      fact: 'A luz verde-azulada em sua antena (esca) não é produzida pelo peixe, mas por uma colônia viva de bactérias simbióticas que recebem nutrientes do sangue do peixe em troca da luminescência atrativa.'
    },
    'vampire-squid': {
      name: 'Lula-Vampira do Inferno',
      scientific: 'Vampyroteuthis infernalis',
      depth: '1.000 – 4.000 metros',
      fact: 'Apesar do nome aterrorizante, ela não é predadora: é uma detritívora pacífica que usa dois filamentos telescópicos aveludados para recolher e engolir flocos lentos de neve marinha.'
    },
    'stygiomedusa': {
      name: 'Água-Viva Fantasma Gigante',
      scientific: 'Stygiomedusa gigantea',
      depth: '4.000 – 6.000 metros',
      fact: 'Com um sino de 1 metro e quatro braços orais em fita que passam de 10 metros de comprimento, foi avistada apenas cerca de 115 vezes em mais de um século de exploração submarina.'
    },
    'submersible': {
      name: 'Submersível Científico Hadal',
      scientific: 'Deep Sea Exploration Vehicle (DSV)',
      depth: '6.000 – 10.994 metros',
      fact: 'Sua cabine é uma esfera de titânio maciço com paredes de 64 mm de espessura, projetada para suportar mais de 110 mil toneladas de pressão externa sem sofrer microfissuras.'
    }
  };

  /* --------------------------------------------------------------------------
     2. ELEMENTOS DO PROFUNDÍMETRO E SENSORES
     -------------------------------------------------------------------------- */
  const valDepth = document.getElementById('val-depth');
  const valPressure = document.getElementById('val-pressure');
  const valTemp = document.getElementById('val-temp');
  const valLight = document.getElementById('val-light');
  const gaugeTrack = document.getElementById('gauge-track');
  const gaugeMarker = document.getElementById('gauge-marker');
  const btnSurface = document.getElementById('btn-surface');

  // Variáveis para interpolação suave (lerp) das leituras numéricas
  let targetDepth = 0;
  let currentDepth = 0;
  const MAX_DEPTH = 10994; // Challenger Deep

  /**
   * Atualiza as variáveis calculadas a partir da profundidade atual
   */
  function updateTelemetry(depth) {
    // Pressão: 1 atm na superfície + 1 atm a cada 10 metros de coluna d'água
    const pressure = 1 + (depth / 10);

    // Temperatura: de 26°C na superfície descendo rapidamente até ~4°C aos 1000m e ~1.2°C no fundo
    let temp;
    if (depth <= 200) {
      temp = 26 - (depth / 200) * 8; // 26°C a 18°C
    } else if (depth <= 1000) {
      temp = 18 - ((depth - 200) / 800) * 14; // 18°C a 4°C
    } else {
      temp = 4 - ((depth - 1000) / (MAX_DEPTH - 1000)) * 2.8; // 4°C a 1.2°C
    }

    // Luz solar: 100% na superfície, cai para ~1% aos 200m, extingue-se a 0% aos 1000m
    let light;
    if (depth <= 200) {
      light = Math.max(1, 100 - (depth / 200) * 99);
    } else if (depth <= 1000) {
      light = Math.max(0, 1 - ((depth - 200) / 800) * 1);
    } else {
      light = 0;
    }

    // Renderiza números formatados
    valDepth.textContent = Math.round(depth).toLocaleString('pt-BR');
    valPressure.textContent = pressure.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    valTemp.textContent = temp.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    valLight.textContent = Math.round(light);
  }

  /**
   * Loop de interpolação contínua para rolagem suave dos números
   */
  function renderTelemetryLoop() {
    // Lerp suave (10% por frame)
    currentDepth += (targetDepth - currentDepth) * 0.12;
    if (Math.abs(targetDepth - currentDepth) < 0.2) {
      currentDepth = targetDepth;
    }
    updateTelemetry(currentDepth);

    requestAnimationFrame(renderTelemetryLoop);
  }
  requestAnimationFrame(renderTelemetryLoop);

  /* --------------------------------------------------------------------------
     3. INTEGRAÇÃO GSAP SCROLLTRIGGER (Sincronização com o Scroll)
     -------------------------------------------------------------------------- */
  const oceanColumn = document.getElementById('ocean-column');
  const torchMask = document.getElementById('diver-torch-mask');

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: oceanColumn,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress; // de 0.0 a 1.0

        // Atualiza a meta do profundímetro
        targetDepth = progress * MAX_DEPTH;

        // Atualiza o marcador visual na régua
        const percentProgress = (progress * 100).toFixed(1);
        if (gaugeTrack) gaugeTrack.style.height = `${percentProgress}%`;
        if (gaugeMarker) gaugeMarker.style.top = `${percentProgress}%`;

        // Controle da Lanterna do Mergulhador:
        // A partir dos 200m (progresso ~ 0.018), a opacidade da escuridão sobe
        // Aos 1000m (progresso ~ 0.09), a escuridão é quase total (0.95)
        let darkProgress = 0;
        if (targetDepth > 150) {
          darkProgress = Math.min(0.96, ((targetDepth - 150) / 850) * 0.96);
        }
        document.documentElement.style.setProperty('--torch-opacity', darkProgress);

        // Exibe o botão "Subir à Superfície" depois que o usuário passa dos 800m
        if (targetDepth > 800) {
          btnSurface.classList.add('is-visible');
        } else {
          btnSurface.classList.remove('is-visible');
        }
      }
    });

    // Parallax suave das criaturas e textos para profundidade de 3 camadas
    gsap.utils.toArray('.creature-interactive').forEach((creature) => {
      gsap.to(creature, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: creature,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    gsap.utils.toArray('.zone-narrative').forEach((narrative) => {
      gsap.to(narrative, {
        y: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: narrative,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2
        }
      });
    });
  } else {
    // Fallback nativo caso GSAP não esteja disponível
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      targetDepth = progress * MAX_DEPTH;
      
      const percent = progress * 100;
      if (gaugeTrack) gaugeTrack.style.height = `${percent}%`;
      if (gaugeMarker) gaugeMarker.style.top = `${percent}%`;

      let darkProgress = 0;
      if (targetDepth > 150) {
        darkProgress = Math.min(0.96, ((targetDepth - 150) / 850) * 0.96);
      }
      document.documentElement.style.setProperty('--torch-opacity', darkProgress);

      if (targetDepth > 800) {
        btnSurface.classList.add('is-visible');
      } else {
        btnSurface.classList.remove('is-visible');
      }
    }, { passive: true });
  }

  // Ação do Botão "Subir à Superfície"
  btnSurface.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  /* --------------------------------------------------------------------------
     4. LANTERNA DO MERGULHADOR (Cursor com Inércia e Suporte Mobile)
     -------------------------------------------------------------------------- */
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let torchCurrentX = mouseX;
  let torchCurrentY = mouseY;
  let hasGyroscope = false;

  // Rastreia o ponteiro do mouse
  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Rastreia toques em dispositivos móveis
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  // Suporte a Giroscópio em dispositivos móveis (inclinação sutil da lanterna)
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        hasGyroscope = true;
        // Converte inclinação (-30 a +30 graus) em deslocamento relativo à tela
        const offsetX = (e.gamma / 30) * (window.innerWidth * 0.3);
        const offsetY = ((e.beta - 45) / 30) * (window.innerHeight * 0.3);
        mouseX = (window.innerWidth / 2) + offsetX;
        mouseY = (window.innerHeight / 2) + offsetY;
      }
    }, { passive: true });
  }

  /**
   * Loop de renderização da lanterna com amortecimento físico (inércia do feixe)
   */
  function torchLoop() {
    // Inércia: a lanterna segue o cursor suavemente com 10% de aproximação por frame
    torchCurrentX += (mouseX - torchCurrentX) * 0.1;
    torchCurrentY += (mouseY - torchCurrentY) * 0.1;

    document.documentElement.style.setProperty('--torch-x', `${torchCurrentX.toFixed(1)}px`);
    document.documentElement.style.setProperty('--torch-y', `${torchCurrentY.toFixed(1)}px`);

    requestAnimationFrame(torchLoop);
  }
  requestAnimationFrame(torchLoop);

  /* --------------------------------------------------------------------------
     5. CARDUME DE PEIXES (ALGORITMO BOIDS REATIVO AO CURSOR)
     - Executa no Canvas apenas na Zona de Superfície para máximo desempenho
     -------------------------------------------------------------------------- */
  const boidsCanvas = document.getElementById('boids-canvas');
  const boidsCtx = boidsCanvas ? boidsCanvas.getContext('2d') : null;

  class FishBoid {
    constructor(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * (h * 0.8) + (h * 0.1);
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.length = 12 + Math.random() * 8;
      this.speedLimit = 3.5;
      this.color = `rgba(226, 247, 248, ${0.45 + Math.random() * 0.4})`;
    }

    update(w, h, cursorX, cursorY, isCursorNear) {
      // Repulsão do cursor do visitante (fuga de predador)
      if (isCursorNear) {
        const dx = this.x - cursorX;
        const dy = this.y - cursorY;
        const dist = Math.hypot(dx, dy);
        const fleeRadius = 160;

        if (dist < fleeRadius && dist > 0) {
          const force = (fleeRadius - dist) / fleeRadius;
          this.vx += (dx / dist) * force * 1.8;
          this.vy += (dy / dist) * force * 1.8;
        }
      }

      // Variação orgânica de curso
      this.vx += (Math.random() - 0.5) * 0.2;
      this.vy += (Math.random() - 0.5) * 0.1;

      // Limite de velocidade
      const currentSpeed = Math.hypot(this.vx, this.vy);
      if (currentSpeed > this.speedLimit) {
        this.vx = (this.vx / currentSpeed) * this.speedLimit;
        this.vy = (this.vy / currentSpeed) * this.speedLimit;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Manter dentro da tela horizontalmente com looping suave
      if (this.x < -30) this.x = w + 30;
      if (this.x > w + 30) this.x = -30;

      // Manter dentro dos limites da zona superficial
      if (this.y < 40) this.vy += 0.3;
      if (this.y > h - 40) this.vy -= 0.3;
    }

    draw(ctx) {
      const angle = Math.atan2(this.vy, this.vx);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);

      // Forma simples hidrodinâmica de peixe
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.length, 0);
      ctx.quadraticCurveTo(0, -this.length * 0.3, -this.length * 0.7, 0);
      ctx.quadraticCurveTo(0, this.length * 0.3, this.length, 0);
      ctx.fill();

      // Nadadeira caudal
      ctx.beginPath();
      ctx.moveTo(-this.length * 0.6, 0);
      ctx.lineTo(-this.length * 1.1, -this.length * 0.35);
      ctx.lineTo(-this.length * 1.1, this.length * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  let boids = [];
  const BOID_COUNT = 45;
  let surfaceHeight = 0;

  function resizeBoids() {
    if (!boidsCanvas) return;
    const surfaceSection = document.getElementById('zona-superficie');
    if (surfaceSection) {
      boidsCanvas.width = window.innerWidth;
      surfaceHeight = surfaceSection.offsetHeight;
      boidsCanvas.height = surfaceHeight;
    }
  }

  function initBoids() {
    if (!boidsCanvas || !boidsCtx) return;
    resizeBoids();
    boids = [];
    for (let i = 0; i < BOID_COUNT; i++) {
      boids.push(new FishBoid(boidsCanvas.width, boidsCanvas.height));
    }
  }
  initBoids();

  function boidsAnimationLoop() {
    if (!boidsCanvas || !boidsCtx) return;

    // Só processa e renderiza se o usuário estiver próximo da superfície (economia de CPU/GPU)
    if (window.scrollY < surfaceHeight + 200) {
      boidsCtx.clearRect(0, 0, boidsCanvas.width, boidsCanvas.height);

      const cursorCanvasY = mouseY + window.scrollY;
      const isCursorNear = cursorCanvasY <= surfaceHeight + 100;

      for (let i = 0; i < boids.length; i++) {
        boids[i].update(boidsCanvas.width, boidsCanvas.height, mouseX, cursorCanvasY, isCursorNear);
        boids[i].draw(boidsCtx);
      }
    }

    requestAnimationFrame(boidsAnimationLoop);
  }
  requestAnimationFrame(boidsAnimationLoop);

  /* --------------------------------------------------------------------------
     6. NEVE MARINHA E PARTÍCULAS EM SUSPENSÃO (Canvas Global)
     -------------------------------------------------------------------------- */
  const particlesCanvas = document.getElementById('particles-canvas');
  const particlesCtx = particlesCanvas ? particlesCanvas.getContext('2d') : null;

  class MarineSnowFlake {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, initial = false) {
      this.x = Math.random() * w;
      this.y = initial ? Math.random() * h : -10;
      this.size = Math.random() * 2.2 + 0.6;
      this.speedY = Math.random() * 0.6 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.oscillation = Math.random() * Math.PI * 2;
    }

    update(w, h) {
      this.oscillation += 0.02;
      this.x += this.speedX + Math.sin(this.oscillation) * 0.2;
      this.y += this.speedY;

      if (this.y > h + 10 || this.x < -20 || this.x > w + 20) {
        this.reset(w, h);
      }
    }

    draw(ctx) {
      ctx.fillStyle = `rgba(226, 241, 248, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let particles = [];
  const PARTICLE_COUNT = 90; // Máximo disciplinado de ~100 para 60fps constantes

  function resizeParticles() {
    if (!particlesCanvas) return;
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', () => {
    resizeBoids();
    resizeParticles();
  });
  resizeParticles();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new MarineSnowFlake(window.innerWidth, window.innerHeight));
  }

  function particlesAnimationLoop() {
    if (!particlesCanvas || !particlesCtx) return;

    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(particlesCanvas.width, particlesCanvas.height);
      particles[i].draw(particlesCtx);
    }

    requestAnimationFrame(particlesAnimationLoop);
  }
  requestAnimationFrame(particlesAnimationLoop);

  /* --------------------------------------------------------------------------
     7. MODAL INTERATIVO DAS CRIATURAS (Acessível via Teclado e Toque)
     -------------------------------------------------------------------------- */
  const modalBackdrop = document.getElementById('creature-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDepth = document.getElementById('modal-creature-depth');
  const modalName = document.getElementById('modal-creature-name');
  const modalScientific = document.getElementById('modal-creature-scientific');
  const modalFact = document.getElementById('modal-creature-fact');
  let lastFocusedElement = null;

  function openCreatureModal(creatureId) {
    const data = CREATURES_DATA[creatureId];
    if (!data) return;

    lastFocusedElement = document.activeElement;

    modalName.textContent = data.name;
    modalScientific.textContent = data.scientific;
    modalDepth.textContent = data.depth;
    modalFact.innerHTML = data.fact;

    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    modalCloseBtn.focus();
  }

  function closeCreatureModal() {
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  document.querySelectorAll('.creature-interactive').forEach((btn) => {
    btn.addEventListener('click', () => {
      const creatureId = btn.getAttribute('data-creature');
      openCreatureModal(creatureId);
    });
  });

  modalCloseBtn.addEventListener('click', closeCreatureModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeCreatureModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
      closeCreatureModal();
    }
  });

  /* --------------------------------------------------------------------------
     8. SOM AMBIENTE DO OCEANO (WEB AUDIO API SINTETIZADA PURA)
     - Sem arquivos externos; ruído marinho relaxante com filtro ressonante
     -------------------------------------------------------------------------- */
  const btnSound = document.getElementById('btn-sound');
  let audioCtx = null;
  let isSoundActive = false;
  let masterGain = null;
  let oceanSource = null;

  function initOceanAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();

    // Volume mestre suave
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Gerador de ruído rosa (Brownian/Pink Noise) para reproduzir a pressão e o fluxo d'água
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Ganho compensatório
    }

    oceanSource = audioCtx.createBufferSource();
    oceanSource.buffer = noiseBuffer;
    oceanSource.loop = true;

    // Filtro passa-baixa ressonante que simula a audição debaixo d'água
    const lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.setValueAtTime(220, audioCtx.currentTime);
    lowPassFilter.Q.setValueAtTime(2.5, audioCtx.currentTime);

    // Modulador LFO para simular o vai-e-vem lento das correntes marinhas profundas
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime); // Ciclo lento de ~8 segundos

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(70, audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(lowPassFilter.frequency);

    oceanSource.connect(lowPassFilter);
    lowPassFilter.connect(masterGain);

    lfo.start();
    oceanSource.start();
  }

  function toggleSound() {
    if (!audioCtx) {
      initOceanAudio();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isSoundActive) {
      // Fade-in suave de volume em 0.6 segundos
      masterGain.gain.linearRampToValueAtTime(0.28, audioCtx.currentTime + 0.6);
      isSoundActive = true;
      btnSound.classList.add('is-playing');
      btnSound.setAttribute('aria-pressed', 'true');
      btnSound.setAttribute('aria-label', 'Desativar som ambiente do oceano');
    } else {
      // Fade-out suave de volume em 0.4 segundos
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
      isSoundActive = false;
      btnSound.classList.remove('is-playing');
      btnSound.setAttribute('aria-pressed', 'false');
      btnSound.setAttribute('aria-label', 'Ativar som ambiente das profundezas');
    }
  }

  btnSound.addEventListener('click', toggleSound);

  /* --------------------------------------------------------------------------
     9. FORMULÁRIO DA LISTA DE ESPERA (CTA DA EXPEDIÇÃO)
     -------------------------------------------------------------------------- */
  const waitlistForm = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('waitlist-email');
  const formFeedback = document.getElementById('form-feedback');
  const btnSubmit = document.getElementById('btn-submit-cta');

  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      // Validação simples e robusta de formato de e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Por favor, insira o seu endereço de e-mail.';
        emailInput.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Por favor, informe um endereço de e-mail válido.';
        emailInput.focus();
        return;
      }

      // Sucesso na inscrição simulada
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = 'Inscrição confirmada! Você receberá o sinal do diário de bordo da expedição.';
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>Assento Reservado</span>';
      emailInput.disabled = true;
    });
  }

});
