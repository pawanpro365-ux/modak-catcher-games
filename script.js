/**
 * Modak Catcher - Ganpati Bappa Morya!
 * A festive HTML5 Canvas Game celebrating Ganesh Chaturthi.
 */

// ==========================================
// 1. GAME CONSTANTS & SOUND ENGINE (Web Audio API)
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.musicEnabled = localStorage.getItem("modak_music") !== "false";
    this.sfxEnabled = localStorage.getItem("modak_sfx") !== "false";
    this.musicInterval = null;
    this.tempo = 132; // Festive Dhol tempo (BPM)
    this.step = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Synthesize Dhol Bass Hit ("Dha / Dhum")
  playDholBass() {
    if (!this.sfxEnabled && !this.musicEnabled) return;
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    // Pitch drops quickly for drum punch
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Synthesize Dhol Treble Slap ("Ta / Takk")
  playDholTreble() {
    if (!this.sfxEnabled && !this.musicEnabled) return;
    if (!this.ctx) return;

    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Highpass filter for sharp rim tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Start festive dhol rhythm loop
  startMusic() {
    if (!this.musicEnabled) return;
    this.init();
    if (this.musicInterval) return;

    const intervalMs = (60 / this.tempo / 4) * 1000; // 16th note steps
    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled) return;
      const beat = this.step % 16;
      // Festive Dholak rhythm pattern:
      // Bass: hits on 0, 6, 8, 12
      // Treble: hits on 2, 4, 7, 10, 14, 15
      if (beat === 0 || beat === 6 || beat === 8 || beat === 12) {
        this.playDholBass();
      }
      if (beat === 2 || beat === 4 || beat === 7 || beat === 10 || beat === 14 || beat === 15) {
        this.playDholTreble();
      }
      this.step++;
    }, intervalMs);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Sound effect: Catch Regular Modak (Temple bell chime)
  playCatchModak() {
    if (!this.sfxEnabled) return;
    this.init();

    const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 harmonic chime
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + (idx * 0.02);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  // Sound effect: Catch Golden Modak (Celestial arpeggio)
  playGoldenModak() {
    if (!this.sfxEnabled) return;
    this.init();

    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    arpeggio.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + i * 0.05;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  // Sound effect: Missed Modak / Life Lost
  playLifeLost() {
    if (!this.sfxEnabled) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Sound effect: Level Up
  playLevelUp() {
    if (!this.sfxEnabled) return;
    this.init();

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + (idx * 0.08);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  // Sound effect: Game Over
  playGameOver() {
    if (!this.sfxEnabled) return;
    this.init();

    const notes = [440, 415.30, 370, 329.63]; // Descending melancholy chime
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + (idx * 0.15);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }
}

// ==========================================
// 2. MODAK CATCHER GAME ENGINE
// ==========================================
class ModakCatcherGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.sound = new SoundEngine();

    // Game dimensions
    this.width = 460;
    this.height = 580;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Game State
    this.state = "START"; // 'START', 'PLAYING', 'PAUSED', 'GAME_OVER'
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.modaksCaught = 0;
    this.highScore = parseInt(localStorage.getItem("modak_highScore") || "0", 10);
    this.lastScore = parseInt(localStorage.getItem("modak_lastScore") || "0", 10);

    // Ganesha Character State
    this.ganesha = {
      x: this.width / 2 - 40,
      y: this.height - 95,
      width: 80,
      height: 85,
      speed: 7.5,
      targetX: this.width / 2 - 40,
      blessingWave: 0
    };

    // Falling Objects & Particles
    this.modaks = [];
    this.particles = [];
    this.floatingTexts = [];
    this.ambientPetals = [];

    // Timing & Spawning
    this.lastSpawnTime = 0;
    this.spawnInterval = 1400; // ms
    this.levelBannerTimer = 0;
    this.levelBannerText = "";
    this.screenShake = 0;

    // Input Tracking
    this.keys = { left: false, right: false };
    this.isDragging = false;
    this.currentLeaderboardTab = "ALL"; // 'ALL' or 'MY_CAMPUS'
    this.myCampus = localStorage.getItem("modak_my_campus") || "NIAT Greater Noida";
    this.wasPlayingBeforeLeaderboard = false;
    this.serverUrl = window.location.protocol.startsWith("http") ? window.location.origin : "http://localhost:3000";

    // User Profile (remember devotee details so they aren't asked after 1st game)
    this.userProfile = this.loadUserProfile();

    // Leaderboard
    this.leaderboard = this.loadLeaderboard();

    // DOM Elements
    this.dom = {
      score: document.getElementById("score"),
      level: document.getElementById("level"),
      highScore: document.getElementById("highScore"),
      livesContainer: document.getElementById("livesContainer"),
      canvasOverlay: document.getElementById("canvasOverlay"),
      startScreen: document.getElementById("startScreen"),
      canvasGameOverScreen: document.getElementById("canvasGameOverScreen"),
      overlayScoreVal: document.getElementById("overlayScoreVal"),
      overlayPlayAgainBtn: document.getElementById("overlayPlayAgainBtn"),
      overlayLeaderboardBtn: document.getElementById("overlayLeaderboardBtn"),
      startBtn: document.getElementById("startBtn"),
      pauseBtn: document.getElementById("pauseBtn"),
      musicToggleBtn: document.getElementById("musicToggleBtn"),
      sfxToggleBtn: document.getElementById("sfxToggleBtn"),
      leaderboardBtn: document.getElementById("leaderboardBtn"),
      modalBackdrop: document.getElementById("modalBackdrop"),
      modalCloseBtn: document.getElementById("modalCloseBtn"),
      gameOverView: document.getElementById("gameOverView"),
      leaderboardView: document.getElementById("leaderboardView"),
      finalScoreVal: document.getElementById("finalScoreVal"),
      newHighScoreBanner: document.getElementById("newHighScoreBanner"),
      savedProfileSection: document.getElementById("savedProfileSection"),
      savedProfileName: document.getElementById("savedProfileName"),
      savedProfileNiatId: document.getElementById("savedProfileNiatId"),
      savedProfileCampus: document.getElementById("savedProfileCampus"),
      switchUserBtn: document.getElementById("switchUserBtn"),
      saveScoreForm: document.getElementById("saveScoreForm"),
      playerNameInput: document.getElementById("playerNameInput"),
      playerNiatIdInput: document.getElementById("playerNiatIdInput"),
      playerCampusSelect: document.getElementById("playerCampusSelect"),
      playAgainBtn: document.getElementById("playAgainBtn"),
      viewLeaderboardFromGameOverBtn: document.getElementById("viewLeaderboardFromGameOverBtn"),
      tabAllCampuses: document.getElementById("tabAllCampuses"),
      tabMyCampus: document.getElementById("tabMyCampus"),
      myCampusSelectorContainer: document.getElementById("myCampusSelectorContainer"),
      myCampusFilterSelect: document.getElementById("myCampusFilterSelect"),
      leaderboardPlayAgainBtn: document.getElementById("leaderboardPlayAgainBtn"),
      leaderboardBody: document.getElementById("leaderboardBody"),
      clearLeaderboardBtn: document.getElementById("clearLeaderboardBtn"),
      closeLeaderboardBtn: document.getElementById("closeLeaderboardBtn"),
      activeDevoteeBar: document.getElementById("activeDevoteeBar"),
      activeDevoteeName: document.getElementById("activeDevoteeName"),
      activeDevoteeNiatId: document.getElementById("activeDevoteeNiatId"),
      switchUserBarBtn: document.getElementById("switchUserBarBtn")
    };

    // Initialize campus selectors to saved preference
    if (this.userProfile && this.userProfile.campus) {
      this.myCampus = this.userProfile.campus;
    }
    if (this.dom.playerCampusSelect) {
      this.dom.playerCampusSelect.value = this.myCampus;
    }
    if (this.dom.myCampusFilterSelect) {
      this.dom.myCampusFilterSelect.value = this.myCampus;
    }

    this.updateActiveDevoteeDisplay();
    this.syncLeaderboardFromServer();
    this.initAmbientPetals();
    this.bindEvents();
    this.updateHUD();
    this.updateAudioButtons();

    // Start rendering loop
    this.lastFrameTime = performance.now();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  // Populate floating flower petals in the background
  initAmbientPetals() {
    this.ambientPetals = [];
    for (let i = 0; i < 14; i++) {
      this.ambientPetals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 5 + Math.random() * 6,
        speedY: 0.6 + Math.random() * 0.8,
        speedX: Math.sin(Math.random() * Math.PI * 2) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        color: Math.random() > 0.4 ? "#ff9800" : "#ff4081" // Marigold or rose
      });
    }
  }

  bindEvents() {
    // Keyboard Controls
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        this.keys.left = true;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        this.keys.right = true;
      } else if (e.key === "p" || e.key === "P") {
        this.togglePause();
      } else if (e.key === " " && (this.state === "START" || this.state === "GAME_OVER")) {
        if (this.dom.modalBackdrop.classList.contains("hidden")) {
          e.preventDefault();
          this.startGame();
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        this.keys.left = false;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        this.keys.right = false;
      }
    });

    // Mouse & Touch Controls (Direct dragging or tracking)
    const updatePointerPos = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const canvasX = (clientX - rect.left) * scaleX;
      this.ganesha.targetX = Math.max(0, Math.min(this.width - this.ganesha.width, canvasX - this.ganesha.width / 2));
    };

    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      updatePointerPos(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
      if (this.isDragging || this.state === "PLAYING") {
        updatePointerPos(e.clientX);
      }
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        this.isDragging = true;
        updatePointerPos(e.touches[0].clientX);
      }
    }, { passive: true });

    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        updatePointerPos(e.touches[0].clientX);
      }
    }, { passive: true });

    this.canvas.addEventListener("touchend", () => {
      this.isDragging = false;
    });

    // UI Buttons
    this.dom.startBtn.addEventListener("click", () => this.startGame());
    this.dom.pauseBtn.addEventListener("click", () => this.togglePause());

    if (this.dom.overlayPlayAgainBtn) {
      this.dom.overlayPlayAgainBtn.addEventListener("click", () => this.startGame());
    }
    if (this.dom.overlayLeaderboardBtn) {
      this.dom.overlayLeaderboardBtn.addEventListener("click", () => this.showLeaderboard());
    }
    if (this.dom.viewLeaderboardFromGameOverBtn) {
      this.dom.viewLeaderboardFromGameOverBtn.addEventListener("click", () => this.showLeaderboard());
    }
    if (this.dom.leaderboardPlayAgainBtn) {
      this.dom.leaderboardPlayAgainBtn.addEventListener("click", () => this.startGame());
    }

    // Tabs & Campus Filters
    if (this.dom.tabAllCampuses) {
      this.dom.tabAllCampuses.addEventListener("click", () => this.switchLeaderboardTab("ALL"));
    }
    if (this.dom.tabMyCampus) {
      this.dom.tabMyCampus.addEventListener("click", () => this.switchLeaderboardTab("MY_CAMPUS"));
    }
    if (this.dom.myCampusFilterSelect) {
      this.dom.myCampusFilterSelect.addEventListener("change", (e) => this.setMyCampus(e.target.value));
    }
    if (this.dom.playerCampusSelect) {
      this.dom.playerCampusSelect.addEventListener("change", (e) => this.setMyCampus(e.target.value));
    }

    this.dom.musicToggleBtn.addEventListener("click", () => {
      this.sound.musicEnabled = !this.sound.musicEnabled;
      localStorage.setItem("modak_music", this.sound.musicEnabled);
      if (this.sound.musicEnabled && this.state === "PLAYING") {
        this.sound.startMusic();
      } else {
        this.sound.stopMusic();
      }
      this.updateAudioButtons();
    });

    this.dom.sfxToggleBtn.addEventListener("click", () => {
      this.sound.sfxEnabled = !this.sound.sfxEnabled;
      localStorage.setItem("modak_sfx", this.sound.sfxEnabled);
      this.updateAudioButtons();
    });

    this.dom.leaderboardBtn.addEventListener("click", () => this.showLeaderboard());
    this.dom.modalCloseBtn.addEventListener("click", () => this.closeModal(true));
    this.dom.closeLeaderboardBtn.addEventListener("click", () => this.closeModal(true));
    this.dom.playAgainBtn.addEventListener("click", () => {
      this.startGame();
    });

    if (this.dom.switchUserBtn) {
      this.dom.switchUserBtn.addEventListener("click", () => this.promptSwitchUser());
    }
    if (this.dom.switchUserBarBtn) {
      this.dom.switchUserBarBtn.addEventListener("click", () => this.openUserProfileModal());
    }

    this.dom.saveScoreForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const playerName = (this.dom.playerNameInput.value || "").trim() || "Devotee";
      const niatId = (this.dom.playerNiatIdInput ? this.dom.playerNiatIdInput.value : "").trim() || "NIAT-STUDENT";
      const campus = this.dom.playerCampusSelect ? this.dom.playerCampusSelect.value : this.myCampus;

      // Remember devotee profile so subsequent games don't require entering details!
      this.saveUserProfile(playerName, niatId, campus);
      this.setMyCampus(campus);
      this.saveToLeaderboard(playerName, niatId, campus, this.score, this.level);
      this.showLeaderboard();
    });

    this.dom.clearLeaderboardBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear the temple records?")) {
        this.leaderboard = [];
        localStorage.removeItem("modak_leaderboard");
        this.renderLeaderboardTable();
      }
    });
  }

  updateAudioButtons() {
    if (this.sound.musicEnabled) {
      this.dom.musicToggleBtn.classList.add("active");
      this.dom.musicToggleBtn.innerText = "🥁 Music: ON";
    } else {
      this.dom.musicToggleBtn.classList.remove("active");
      this.dom.musicToggleBtn.innerText = "🥁 Music: OFF";
    }

    if (this.sound.sfxEnabled) {
      this.dom.sfxToggleBtn.classList.add("active");
      this.dom.sfxToggleBtn.innerText = "🔔 SFX: ON";
    } else {
      this.dom.sfxToggleBtn.classList.remove("active");
      this.dom.sfxToggleBtn.innerText = "🔔 SFX: OFF";
    }
  }

  startGame() {
    this.sound.init();
    this.state = "PLAYING";
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.modaksCaught = 0;
    this.modaks = [];
    this.particles = [];
    this.floatingTexts = [];
    this.spawnInterval = 1350;
    this.lastSpawnTime = performance.now();
    this.lastFrameTime = performance.now();
    this.screenShake = 0;
    this.levelBannerTimer = 0;
    this.keys.left = false;
    this.keys.right = false;
    this.isDragging = false;
    this.wasPlayingBeforeLeaderboard = false;
    this.ganesha.x = this.width / 2 - 40;
    this.ganesha.targetX = this.ganesha.x;

    // Hide overlays & modals
    this.dom.canvasOverlay.classList.add("hidden");
    if (this.dom.startScreen) this.dom.startScreen.classList.remove("hidden");
    if (this.dom.canvasGameOverScreen) this.dom.canvasGameOverScreen.classList.add("hidden");
    this.dom.modalBackdrop.classList.add("hidden");
    this.dom.pauseBtn.innerText = "⏸️ Pause";

    this.updateHUD();

    if (this.sound.musicEnabled) {
      this.sound.startMusic();
    }
  }

  togglePause() {
    if (this.state === "PLAYING") {
      this.state = "PAUSED";
      this.dom.pauseBtn.innerText = "▶️ Resume";
      this.sound.stopMusic();
    } else if (this.state === "PAUSED") {
      this.state = "PLAYING";
      this.dom.pauseBtn.innerText = "⏸️ Pause";
      if (this.sound.musicEnabled) {
        this.sound.startMusic();
      }
    }
  }

  updateHUD() {
    this.dom.score.innerText = this.score;
    this.dom.level.innerText = this.level;
    this.dom.highScore.innerText = this.highScore;

    // Render lives icons (🥟)
    const lifeIcons = this.dom.livesContainer.querySelectorAll(".life-icon");
    lifeIcons.forEach((icon, idx) => {
      if (idx < this.lives) {
        icon.classList.add("active");
      } else {
        icon.classList.remove("active");
      }
    });
  }

  // Spawns standard or golden modak
  spawnModak() {
    const isGolden = Math.random() < 0.16; // 16% chance of Golden Modak
    const baseSpeed = 2.4 + (this.level - 1) * 0.45;
    const speed = isGolden ? baseSpeed * 1.25 : baseSpeed + (Math.random() * 0.8);
    const size = isGolden ? 36 : 32;

    this.modaks.push({
      x: 30 + Math.random() * (this.width - 60 - size),
      y: -40,
      width: size,
      height: size,
      speedY: speed,
      speedX: (Math.random() - 0.5) * 0.8,
      swayAngle: Math.random() * Math.PI * 2,
      isGolden: isGolden,
      rotation: (Math.random() - 0.5) * 0.2
    });
  }

  // Create bursts of festive petals/sparkles
  createCatchParticles(x, y, isGolden) {
    const count = isGolden ? 24 : 14;
    const colors = isGolden
      ? ["#ffd700", "#ffea00", "#ffab00", "#ffffff"]
      : ["#ff9800", "#ff5722", "#ffeb3b", "#e91e63"];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.025,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        isSparkle: isGolden
      });
    }
  }

  // Poof particles when modak touches the ground
  createMissParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI + (Math.random() * Math.PI); // Upward puff
      const speed = 1.5 + Math.random() * 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        color: "#b0bec5",
        alpha: 0.8,
        decay: 0.035,
        rotation: 0,
        rotSpeed: 0,
        isSparkle: false
      });
    }
  }

  // Floating text like "+1", "+5"
  addFloatingText(text, x, y, color = "#ff9800") {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vy: -1.8,
      alpha: 1,
      color: color
    });
  }

  // Main Game Loop
  gameLoop(timestamp) {
    const delta = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    if (this.state === "PLAYING") {
      this.update(timestamp);
    }

    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(timestamp) {
    // 1. Move Ganesha smoothly
    if (this.keys.left) {
      this.ganesha.x -= this.ganesha.speed;
      this.ganesha.targetX = this.ganesha.x;
    } else if (this.keys.right) {
      this.ganesha.x += this.ganesha.speed;
      this.ganesha.targetX = this.ganesha.x;
    } else {
      // Easing toward pointer/targetX
      const dx = this.ganesha.targetX - this.ganesha.x;
      this.ganesha.x += dx * 0.22;
    }

    // Keep Ganesha inside bounds
    this.ganesha.x = Math.max(8, Math.min(this.width - this.ganesha.width - 8, this.ganesha.x));
    this.ganesha.blessingWave += 0.05;

    // 2. Modak Spawning
    if (timestamp - this.lastSpawnTime > this.spawnInterval) {
      this.spawnModak();
      this.lastSpawnTime = timestamp;
      // Slight randomized interval
      this.spawnInterval = Math.max(650, 1400 - (this.level * 90) + (Math.random() * 200 - 100));
    }

    // 3. Modaks Update & Collision Detection
    const ganeshaCatchZone = {
      x: this.ganesha.x + 8,
      y: this.ganesha.y + 12,
      width: this.ganesha.width - 16,
      height: 40
    };

    for (let i = this.modaks.length - 1; i >= 0; i--) {
      const m = this.modaks[i];
      m.y += m.speedY;
      m.swayAngle += 0.04;
      m.x += Math.sin(m.swayAngle) * 0.6;

      // Catch Detection
      if (
        m.y + m.height >= ganeshaCatchZone.y &&
        m.y <= ganeshaCatchZone.y + ganeshaCatchZone.height &&
        m.x + m.width >= ganeshaCatchZone.x &&
        m.x <= ganeshaCatchZone.x + ganeshaCatchZone.width
      ) {
        // Successful Catch!
        const pts = m.isGolden ? 5 : 1;
        this.score += pts;
        this.modaksCaught++;

        if (m.isGolden) {
          this.sound.playGoldenModak();
          this.addFloatingText("+5 Kesari!", m.x, m.y, "#ffd700");
          this.createCatchParticles(m.x + m.width / 2, m.y + m.height / 2, true);
        } else {
          this.sound.playCatchModak();
          this.addFloatingText("+1", m.x, m.y, "#ff6f00");
          this.createCatchParticles(m.x + m.width / 2, m.y + m.height / 2, false);
        }

        // Level Up check every 10 modaks
        if (this.modaksCaught % 10 === 0) {
          this.level++;
          this.sound.playLevelUp();
          this.levelBannerText = `✨ LEVEL ${this.level}! SPEED UP! ✨`;
          this.levelBannerTimer = 110;
        }

        this.modaks.splice(i, 1);
        this.updateHUD();
        continue;
      }

      // Missed Modak (hits ground)
      if (m.y + m.height >= this.height - 18) {
        this.lives--;
        this.screenShake = 12;
        this.createMissParticles(m.x + m.width / 2, this.height - 20);
        this.sound.playLifeLost();
        this.addFloatingText("-1 Life", m.x, this.height - 50, "#d32f2f");
        this.modaks.splice(i, 1);
        this.updateHUD();

        if (this.lives <= 0) {
          this.endGame();
          return;
        }
      }
    }

    // 4. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // Gravity
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 5. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 6. Ambient Petals
    this.ambientPetals.forEach((petal) => {
      petal.y += petal.speedY;
      petal.x += petal.speedX;
      petal.rotation += petal.rotSpeed;
      if (petal.y > this.height) {
        petal.y = -15;
        petal.x = Math.random() * this.width;
      }
    });

    if (this.screenShake > 0) {
      this.screenShake *= 0.85;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    if (this.levelBannerTimer > 0) {
      this.levelBannerTimer--;
    }
  }

  // End of Game
  endGame() {
    this.state = "GAME_OVER";
    this.sound.stopMusic();
    this.sound.playGameOver();

    // High Score tracking
    let isNewHighScore = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("modak_highScore", this.highScore);
      isNewHighScore = true;
    }
    localStorage.setItem("modak_lastScore", this.score);
    this.updateHUD();

    // Show Game Over Modal
    this.dom.finalScoreVal.innerText = this.score;
    if (this.dom.overlayScoreVal) {
      this.dom.overlayScoreVal.innerText = this.score;
    }
    if (isNewHighScore && this.score > 0) {
      this.dom.newHighScoreBanner.classList.remove("hidden");
    } else {
      this.dom.newHighScoreBanner.classList.add("hidden");
    }

    // IF USER DETAILS ARE ALREADY SAVED (from game 1):
    // Detail entry is NOT required! Automatically record offering and show saved profile
    if (this.userProfile && this.userProfile.name) {
      this.saveToLeaderboard(
        this.userProfile.name,
        this.userProfile.niatId,
        this.userProfile.campus,
        this.score,
        this.level
      );
      this.showGameOverWithSavedProfile();
    } else {
      // First game: ask for Name, NIAT ID, and Campus
      this.showGameOverModal();
    }
  }

  showGameOverWithSavedProfile() {
    this.dom.modalBackdrop.classList.remove("hidden");
    this.dom.gameOverView.classList.remove("hidden");
    this.dom.leaderboardView.classList.add("hidden");

    if (this.dom.savedProfileSection) {
      this.dom.savedProfileSection.classList.remove("hidden");
      if (this.dom.savedProfileName) this.dom.savedProfileName.innerText = this.userProfile.name;
      if (this.dom.savedProfileNiatId) this.dom.savedProfileNiatId.innerText = this.userProfile.niatId;
      if (this.dom.savedProfileCampus) this.dom.savedProfileCampus.innerText = this.userProfile.campus;
    }
    if (this.dom.saveScoreForm) {
      this.dom.saveScoreForm.classList.add("hidden");
    }
  }

  showGameOverModal() {
    this.dom.modalBackdrop.classList.remove("hidden");
    this.dom.gameOverView.classList.remove("hidden");
    this.dom.leaderboardView.classList.add("hidden");

    if (this.dom.savedProfileSection) {
      this.dom.savedProfileSection.classList.add("hidden");
    }
    if (this.dom.saveScoreForm) {
      this.dom.saveScoreForm.classList.remove("hidden");
    }
    if (this.dom.playerCampusSelect) {
      this.dom.playerCampusSelect.value = this.myCampus;
    }
    setTimeout(() => {
      if (this.dom.playerNameInput) this.dom.playerNameInput.focus();
    }, 150);
  }

  promptSwitchUser() {
    if (this.dom.savedProfileSection) {
      this.dom.savedProfileSection.classList.add("hidden");
    }
    if (this.dom.saveScoreForm) {
      this.dom.saveScoreForm.classList.remove("hidden");
      if (this.dom.playerNameInput) {
        this.dom.playerNameInput.focus();
        this.dom.playerNameInput.select();
      }
    }
  }

  openUserProfileModal() {
    this.dom.modalBackdrop.classList.remove("hidden");
    this.dom.gameOverView.classList.remove("hidden");
    this.dom.leaderboardView.classList.add("hidden");
    this.promptSwitchUser();
  }

  loadUserProfile() {
    try {
      const data = localStorage.getItem("modak_user_profile");
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {}
    return null;
  }

  saveUserProfile(name, niatId, campus) {
    this.userProfile = {
      name: (name || "Devotee").trim(),
      niatId: (niatId || "NIAT-DEV-001").trim(),
      campus: (campus || this.myCampus || "NIAT Greater Noida").trim()
    };
    localStorage.setItem("modak_user_profile", JSON.stringify(this.userProfile));
    this.myCampus = this.userProfile.campus;
    localStorage.setItem("modak_my_campus", this.myCampus);
    this.updateActiveDevoteeDisplay();
  }

  updateActiveDevoteeDisplay() {
    if (!this.dom.activeDevoteeBar) return;
    if (this.userProfile) {
      this.dom.activeDevoteeBar.classList.remove("hidden");
      if (this.dom.activeDevoteeName) this.dom.activeDevoteeName.innerText = this.userProfile.name;
      if (this.dom.activeDevoteeNiatId) this.dom.activeDevoteeNiatId.innerText = this.userProfile.niatId;

      if (this.dom.playerNameInput) this.dom.playerNameInput.value = this.userProfile.name;
      if (this.dom.playerNiatIdInput) this.dom.playerNiatIdInput.value = this.userProfile.niatId;
      if (this.dom.playerCampusSelect) this.dom.playerCampusSelect.value = this.userProfile.campus;
    } else {
      this.dom.activeDevoteeBar.classList.add("hidden");
    }
  }

  showLeaderboard() {
    if (this.state === "PLAYING") {
      this.wasPlayingBeforeLeaderboard = true;
      this.state = "PAUSED";
      this.sound.stopMusic();
      this.dom.pauseBtn.innerText = "▶️ Resume";
    }
    this.dom.modalBackdrop.classList.remove("hidden");
    this.dom.gameOverView.classList.add("hidden");
    this.dom.leaderboardView.classList.remove("hidden");
    this.syncLeaderboardFromServer();
    this.renderLeaderboardTable();
  }

  showCanvasRestartOverlay() {
    if (this.dom.overlayScoreVal) {
      this.dom.overlayScoreVal.innerText = this.score;
    }
    if (this.dom.startScreen) {
      this.dom.startScreen.classList.add("hidden");
    }
    if (this.dom.canvasGameOverScreen) {
      this.dom.canvasGameOverScreen.classList.remove("hidden");
    }
    this.dom.canvasOverlay.classList.remove("hidden");
  }

  closeModal(triggerCanvasRestart = true) {
    this.dom.modalBackdrop.classList.add("hidden");
    if (this.wasPlayingBeforeLeaderboard) {
      this.wasPlayingBeforeLeaderboard = false;
      this.state = "PLAYING";
      this.lastSpawnTime = performance.now();
      this.lastFrameTime = performance.now();
      this.dom.pauseBtn.innerText = "⏸️ Pause";
      if (this.sound.musicEnabled) {
        this.sound.startMusic();
      }
    } else if (this.state === "GAME_OVER" && triggerCanvasRestart) {
      this.showCanvasRestartOverlay();
    }
  }

  setMyCampus(campus) {
    if (!campus) return;
    this.myCampus = campus;
    localStorage.setItem("modak_my_campus", this.myCampus);
    if (this.userProfile) {
      this.userProfile.campus = campus;
      localStorage.setItem("modak_user_profile", JSON.stringify(this.userProfile));
    }
    if (this.dom.playerCampusSelect) {
      this.dom.playerCampusSelect.value = this.myCampus;
    }
    if (this.dom.myCampusFilterSelect) {
      this.dom.myCampusFilterSelect.value = this.myCampus;
    }
    this.renderLeaderboardTable();
  }

  switchLeaderboardTab(tab) {
    this.currentLeaderboardTab = tab;
    if (tab === "MY_CAMPUS") {
      this.dom.tabMyCampus.classList.add("active");
      this.dom.tabAllCampuses.classList.remove("active");
      this.dom.myCampusSelectorContainer.classList.remove("hidden");
    } else {
      this.dom.tabAllCampuses.classList.add("active");
      this.dom.tabMyCampus.classList.remove("active");
      this.dom.myCampusSelectorContainer.classList.add("hidden");
    }
    this.renderLeaderboardTable();
  }

  // Sync leaderboard from local server
  async syncLeaderboardFromServer() {
    try {
      const res = await fetch(`${this.serverUrl}/api/leaderboard`, { method: "GET" });
      if (res.ok) {
        const records = await res.json();
        if (Array.isArray(records)) {
          this.leaderboard = records;
          localStorage.setItem("modak_leaderboard", JSON.stringify(records));
          this.renderLeaderboardTable();
        }
      }
    } catch (err) {
      // Local server is not reachable, fallback smoothly to localStorage
    }
  }

  // LocalStorage Leaderboard
  loadLeaderboard() {
    try {
      const data = localStorage.getItem("modak_leaderboard");
      let records = data ? JSON.parse(data) : [
        { name: "Bal Ganesha", niatId: "NIAT-DEV-001", campus: "NIAT Main Campus", score: 45, level: 5, date: "Festival Day" },
        { name: "Aarav Sharma", niatId: "NIAT-GN-2024", campus: "NIAT Greater Noida", score: 38, level: 4, date: "Sep 12" },
        { name: "Mooshak", niatId: "NIAT-DEL-108", campus: "NIAT Delhi NCR", score: 28, level: 3, date: "Shukla Chaturthi" },
        { name: "Priya Singh", niatId: "NIAT-PUN-042", campus: "NIAT Pune", score: 22, level: 3, date: "Sep 11" },
        { name: "Devotee", niatId: "NIAT-BLR-019", campus: "NIAT Bangalore", score: 14, level: 2, date: "Sep 10" }
      ];
      records.forEach((r) => {
        if (!r.campus) r.campus = "NIAT Main Campus";
        if (!r.niatId) r.niatId = "NIAT-STUDENT";
      });
      return records;
    } catch (e) {
      return [];
    }
  }

  async saveToLeaderboard(name, niatId, campus, score, level) {
    const today = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const newEntry = {
      name: (name || "Devotee").trim(),
      niatId: (niatId || "NIAT-DEV-001").trim(),
      campus: (campus || this.myCampus).trim(),
      score: score,
      level: level,
      date: today
    };

    // 1. Immediately store in local memory and localStorage
    this.leaderboard.push(newEntry);
    this.leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("modak_leaderboard", JSON.stringify(this.leaderboard));

    // 2. Persist to local server
    try {
      const res = await fetch(`${this.serverUrl}/api/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          this.leaderboard = data.leaderboard;
          localStorage.setItem("modak_leaderboard", JSON.stringify(this.leaderboard));
        }
      }
    } catch (err) {
      // Local server offline, localStorage backup already saved
    }

    this.renderLeaderboardTable();
  }

  renderLeaderboardTable() {
    this.dom.leaderboardBody.innerHTML = "";
    
    const subtitle = document.querySelector(".leaderboard-subtitle");
    let displayList = [];
    if (this.currentLeaderboardTab === "MY_CAMPUS") {
      displayList = this.leaderboard.filter((e) => (e.campus || "NIAT Main Campus") === this.myCampus);
      if (subtitle) {
        subtitle.innerText = `Showing records for ${this.myCampus} (${displayList.length} ${displayList.length === 1 ? 'Record' : 'Records'})`;
      }
    } else {
      displayList = this.leaderboard;
      if (subtitle) {
        subtitle.innerText = `All NIAT Campus Records (${displayList.length} ${displayList.length === 1 ? 'Record' : 'Records'})`;
      }
    }

    if (displayList.length === 0) {
      const msg = this.currentLeaderboardTab === "MY_CAMPUS"
        ? `No records yet for ${this.escapeHTML(this.myCampus)}. Be the first campus champion!`
        : "No scores yet. Play and make an offering!";
      this.dom.leaderboardBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 16px; color:#888;">${msg}</td></tr>`;
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];
    displayList.forEach((entry, idx) => {
      const tr = document.createElement("tr");
      const rankBadge = medals[idx] ? `${medals[idx]} #${idx + 1}` : `#${idx + 1}`;
      const rankClass = idx < 3 ? `rank-${idx + 1}` : "";
      const isMyCampusMatch = entry.campus === this.myCampus;
      if (isMyCampusMatch && this.currentLeaderboardTab === "ALL") {
        tr.classList.add("my-campus-row");
      }

      const campusShort = (entry.campus || "NIAT").replace(/^NIAT\s*/i, "");
      const niatIdDisplay = entry.niatId || "NIAT-STUDENT";

      tr.innerHTML = `
        <td class="${rankClass}">${rankBadge}</td>
        <td>
          <div class="devotee-cell">
            <strong>${this.escapeHTML(entry.name)}</strong>
            <span class="table-niat-id">${this.escapeHTML(niatIdDisplay)}</span>
          </div>
        </td>
        <td><span class="campus-badge" title="${this.escapeHTML(entry.campus || 'NIAT')}">${this.escapeHTML(campusShort)}</span></td>
        <td style="color:#d32f2f; font-weight:700;">${entry.score}</td>
        <td>Lv ${entry.level}</td>
        <td style="color:#777; font-size:11px;">${entry.date || "Today"}</td>
      `;
      this.dom.leaderboardBody.appendChild(tr);
    });
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ==========================================
  // 3. CANVAS RENDERING ENGINE
  // ==========================================
  render() {
    this.ctx.save();

    // Screen Shake on damage
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    // 1. Background
    this.renderBackground();

    // 2. Ambient Petals
    this.renderAmbientPetals();

    // 3. Modaks
    this.modaks.forEach((m) => this.drawModak(m));

    // 4. Bal Ganesha Character
    this.drawGanesha(this.ganesha.x, this.ganesha.y, this.ganesha.width, this.ganesha.height);

    // 5. Particles
    this.renderParticles();

    // 6. Floating Score Texts
    this.renderFloatingTexts();

    // 7. Level Up Banner
    if (this.levelBannerTimer > 0) {
      this.renderLevelBanner();
    }

    // 8. Paused Overlay
    if (this.state === "PAUSED") {
      this.renderPauseScreen();
    }

    this.ctx.restore();
  }

  renderBackground() {
    // Warm gradient sky
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, "#fff5e6");
    skyGrad.addColorStop(0.65, "#ffe8cc");
    skyGrad.addColorStop(1, "#ffd8a8");
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Temple Arch Motif at Top
    this.ctx.strokeStyle = "rgba(255, 152, 0, 0.25)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.width / 2, -40, 180, 0, Math.PI);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(this.width / 2, -40, 210, 0, Math.PI);
    this.ctx.stroke();

    // Auspicious Sun Rays from Center Top
    this.ctx.save();
    this.ctx.translate(this.width / 2, 0);
    this.ctx.strokeStyle = "rgba(255, 215, 0, 0.12)";
    this.ctx.lineWidth = 1.5;
    for (let a = -Math.PI / 2 + 0.2; a < Math.PI / 2; a += 0.22) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(Math.cos(a) * 450, Math.sin(a) * 450);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // Temple Floor / Podium at Bottom
    const floorGrad = this.ctx.createLinearGradient(0, this.height - 30, 0, this.height);
    floorGrad.addColorStop(0, "#e65100");
    floorGrad.addColorStop(1, "#8d2b02");
    this.ctx.fillStyle = floorGrad;
    this.ctx.fillRect(0, this.height - 24, this.width, 24);

    // Golden decorative line on floor
    this.ctx.fillStyle = "#ffd700";
    this.ctx.fillRect(0, this.height - 24, this.width, 3);

    // Little Rangoli dots on floor
    for (let rx = 15; rx < this.width; rx += 25) {
      this.ctx.beginPath();
      this.ctx.arc(rx, this.height - 12, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = "#ffe082";
      this.ctx.fill();
    }
  }

  renderAmbientPetals() {
    this.ambientPetals.forEach((p) => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = 0.45;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  // Draw Detailed Modak
  drawModak(m) {
    this.ctx.save();
    this.ctx.translate(m.x + m.width / 2, m.y + m.height / 2);
    this.ctx.rotate(m.rotation);

    const w = m.width;
    const h = m.height;
    const isGolden = m.isGolden;

    // Glowing halo for golden modak
    if (isGolden) {
      this.ctx.save();
      const glowGrad = this.ctx.createRadialGradient(0, 0, 4, 0, 0, w * 0.9);
      glowGrad.addColorStop(0, "rgba(255, 235, 59, 0.7)");
      glowGrad.addColorStop(0.6, "rgba(255, 179, 0, 0.35)");
      glowGrad.addColorStop(1, "rgba(255, 152, 0, 0)");
      this.ctx.fillStyle = glowGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, w * 0.9, 0, Math.PI * 2);
      this.ctx.fill();

      // Little rotating sparkle star
      this.ctx.rotate(m.swayAngle * 2);
      this.ctx.fillStyle = "#ffffff";
      for (let s = 0; s < 4; s++) {
        this.ctx.rotate(Math.PI / 2);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -w * 0.65);
        this.ctx.lineTo(w * 0.12, 0);
        this.ctx.lineTo(0, w * 0.12);
        this.ctx.lineTo(-w * 0.12, 0);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    // Shadow
    this.ctx.beginPath();
    this.ctx.ellipse(0, h * 0.44, w * 0.36, 4, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(0,0,0,0.14)";
    this.ctx.fill();

    // Modak Base Body (teardrop dumpling shape)
    this.ctx.beginPath();
    this.ctx.moveTo(0, -h * 0.48); // Sharp peak
    // Right curve down
    this.ctx.bezierCurveTo(w * 0.35, -h * 0.1, w * 0.52, h * 0.22, w * 0.28, h * 0.45);
    // Rounded bottom
    this.ctx.bezierCurveTo(w * 0.15, h * 0.52, -w * 0.15, h * 0.52, -w * 0.28, h * 0.45);
    // Left curve up
    this.ctx.bezierCurveTo(-w * 0.52, h * 0.22, -w * 0.35, -h * 0.1, 0, -h * 0.48);
    this.ctx.closePath();

    // Fill Gradient
    const modakGrad = this.ctx.createRadialGradient(-w * 0.1, -h * 0.1, 2, 0, 0, w * 0.6);
    if (isGolden) {
      modakGrad.addColorStop(0, "#fff9c4");
      modakGrad.addColorStop(0.4, "#ffd54f");
      modakGrad.addColorStop(0.85, "#ffb300");
      modakGrad.addColorStop(1, "#e65100");
    } else {
      modakGrad.addColorStop(0, "#ffffff");
      modakGrad.addColorStop(0.5, "#fff8e1");
      modakGrad.addColorStop(0.85, "#ffe082");
      modakGrad.addColorStop(1, "#ffca28");
    }
    this.ctx.fillStyle = modakGrad;
    this.ctx.fill();

    // Modak Pleats / Flutes (Traditional steamed creases)
    this.ctx.strokeStyle = isGolden ? "rgba(230, 81, 0, 0.45)" : "rgba(255, 179, 0, 0.5)";
    this.ctx.lineWidth = 1.2;

    const pleatLines = [-0.22, -0.1, 0.1, 0.22];
    pleatLines.forEach((offset) => {
      this.ctx.beginPath();
      this.ctx.moveTo(0, -h * 0.44);
      this.ctx.quadraticCurveTo(w * offset * 1.5, h * 0.05, w * offset, h * 0.45);
      this.ctx.stroke();
    });

    // Auspicious Saffron/Kumkum dot on the apex
    this.ctx.beginPath();
    this.ctx.arc(0, -h * 0.38, 2.2, 0, Math.PI * 2);
    this.ctx.fillStyle = isGolden ? "#d32f2f" : "#c62828";
    this.ctx.fill();

    this.ctx.restore();
  }

  // Draw Bal Ganesha with Crown, Tilak, Trunk, and Offering Plate
  drawGanesha(x, y, w, h) {
    this.ctx.save();
    this.ctx.translate(x + w / 2, y + h / 2);

    const headY = -h * 0.1;

    // 1. Auspicious Golden Aura (Halo) behind Ganesha
    const auraGrad = this.ctx.createRadialGradient(0, headY - 6, 10, 0, headY - 6, w * 0.65);
    auraGrad.addColorStop(0, "rgba(255, 235, 59, 0.65)");
    auraGrad.addColorStop(0.6, "rgba(255, 179, 0, 0.3)");
    auraGrad.addColorStop(1, "rgba(255, 152, 0, 0)");
    this.ctx.fillStyle = auraGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, headY - 6, w * 0.65, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Large Auspicious Ears
    const earY = headY + 2;
    // Left Ear
    this.ctx.beginPath();
    this.ctx.ellipse(-w * 0.38, earY, w * 0.18, h * 0.18, -0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffb07c";
    this.ctx.fill();
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = "#e67e22";
    this.ctx.stroke();

    // Left Ear Inner
    this.ctx.beginPath();
    this.ctx.ellipse(-w * 0.38, earY, w * 0.1, h * 0.1, -0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ff8a65";
    this.ctx.fill();

    // Right Ear
    this.ctx.beginPath();
    this.ctx.ellipse(w * 0.38, earY, w * 0.18, h * 0.18, 0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffb07c";
    this.ctx.fill();
    this.ctx.strokeStyle = "#e67e22";
    this.ctx.stroke();

    // Right Ear Inner
    this.ctx.beginPath();
    this.ctx.ellipse(w * 0.38, earY, w * 0.1, h * 0.1, 0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ff8a65";
    this.ctx.fill();

    // Golden Kundan Earring (Jhumka) on ears
    this.ctx.fillStyle = "#ffd700";
    this.ctx.beginPath();
    this.ctx.arc(-w * 0.44, earY + h * 0.14, 3, 0, Math.PI * 2);
    this.ctx.arc(w * 0.44, earY + h * 0.14, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // 3. Body & Yellow Dhoti (Pitambar)
    this.ctx.beginPath();
    this.ctx.ellipse(0, h * 0.28, w * 0.3, h * 0.22, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffb07c";
    this.ctx.fill();

    // Pitambar Dhoti Wrap
    this.ctx.beginPath();
    this.ctx.ellipse(0, h * 0.32, w * 0.31, h * 0.16, 0, 0, Math.PI);
    this.ctx.fillStyle = "#ffca28";
    this.ctx.fill();
    this.ctx.strokeStyle = "#d84315";
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // 4. Head (Bal Ganesha chubby face)
    this.ctx.beginPath();
    this.ctx.arc(0, headY, w * 0.28, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffb07c";
    this.ctx.fill();
    this.ctx.strokeStyle = "#e67e22";
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();

    // 5. Crown (Mukut)
    this.ctx.beginPath();
    this.ctx.moveTo(-w * 0.22, headY - h * 0.16);
    this.ctx.lineTo(w * 0.22, headY - h * 0.16);
    this.ctx.lineTo(w * 0.15, headY - h * 0.46);
    this.ctx.lineTo(0, headY - h * 0.54); // Pointy tip
    this.ctx.lineTo(-w * 0.15, headY - h * 0.46);
    this.ctx.closePath();

    const crownGrad = this.ctx.createLinearGradient(0, headY - h * 0.54, 0, headY - h * 0.16);
    crownGrad.addColorStop(0, "#ffe082");
    crownGrad.addColorStop(0.5, "#ffc107");
    crownGrad.addColorStop(1, "#ff8f00");
    this.ctx.fillStyle = crownGrad;
    this.ctx.fill();
    this.ctx.strokeStyle = "#b71c1c";
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Ruby on Crown
    this.ctx.beginPath();
    this.ctx.arc(0, headY - h * 0.34, 3.5, 0, Math.PI * 2);
    this.ctx.fillStyle = "#d32f2f";
    this.ctx.fill();

    // Pearl / Bead line on crown base
    this.ctx.fillStyle = "#ffffff";
    for (let px = -w * 0.16; px <= w * 0.16; px += 6) {
      this.ctx.beginPath();
      this.ctx.arc(px, headY - h * 0.16, 1.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 6. Auspicious Tilak on Forehead
    // Yellow Sandalwood paste U-shape
    this.ctx.strokeStyle = "#fff9c4";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, headY - 10, 6, 0.1, Math.PI - 0.1);
    this.ctx.stroke();

    // Red Sindoor vertical line
    this.ctx.strokeStyle = "#d32f2f";
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, headY - 14);
    this.ctx.lineTo(0, headY - 4);
    this.ctx.stroke();

    // 7. Expressive Cute Eyes
    const eyeY = headY - 5;
    [-w * 0.12, w * 0.12].forEach((ex) => {
      // White of eye
      this.ctx.beginPath();
      this.ctx.ellipse(ex, eyeY, 4.5, 3.5, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fill();

      // Pupil
      this.ctx.beginPath();
      this.ctx.arc(ex, eyeY, 2.4, 0, Math.PI * 2);
      this.ctx.fillStyle = "#3e2723";
      this.ctx.fill();

      // Sparkle in eye
      this.ctx.beginPath();
      this.ctx.arc(ex - 1, eyeY - 1, 1, 0, Math.PI * 2);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fill();
    });

    // 8. Graceful Curved Trunk (Sonad)
    this.ctx.beginPath();
    this.ctx.moveTo(-4, headY + 4);
    this.ctx.bezierCurveTo(-6, headY + 18, -14, headY + 24, -22, headY + 16);
    this.ctx.bezierCurveTo(-26, headY + 10, -20, headY + 6, -15, headY + 10);
    this.ctx.bezierCurveTo(-11, headY + 14, 0, headY + 12, 4, headY + 4);
    this.ctx.closePath();
    this.ctx.fillStyle = "#ffb07c";
    this.ctx.fill();
    this.ctx.strokeStyle = "#e67e22";
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();

    // Little Modak in the trunk!
    this.ctx.beginPath();
    this.ctx.arc(-20, headY + 12, 3.5, 0, Math.PI * 2);
    this.ctx.fillStyle = "#fff8e1";
    this.ctx.fill();

    // Auspicious Tusk (Ekdant)
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.moveTo(3, headY + 8);
    this.ctx.lineTo(8, headY + 10);
    this.ctx.lineTo(3, headY + 13);
    this.ctx.fill();

    // 9. Marigold Garland (Har)
    const garlandRadius = w * 0.26;
    for (let ga = 0.2; ga <= Math.PI - 0.2; ga += 0.34) {
      const gx = Math.cos(ga) * garlandRadius;
      const gy = headY + 10 + Math.sin(ga) * (garlandRadius * 0.9);
      this.ctx.beginPath();
      this.ctx.arc(gx, gy, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = Math.sin(ga * 5) > 0 ? "#ff9800" : "#ffeb3b";
      this.ctx.fill();
    }

    // 10. Hands: Left hand holds a Golden Offering Plate (Thali for catching!)
    // Plate stretches across Ganesha's width as the visual catch basket
    const plateY = headY + h * 0.18;
    this.ctx.save();
    // Glowing catch plate
    this.ctx.beginPath();
    this.ctx.ellipse(0, plateY, w * 0.44, 10, 0, 0, Math.PI * 2);
    const plateGrad = this.ctx.createLinearGradient(-w * 0.4, 0, w * 0.4, 0);
    plateGrad.addColorStop(0, "#ffb300");
    plateGrad.addColorStop(0.5, "#fff59d");
    plateGrad.addColorStop(1, "#ff8f00");
    this.ctx.fillStyle = plateGrad;
    this.ctx.fill();
    this.ctx.strokeStyle = "#e65100";
    this.ctx.lineWidth = 1.8;
    this.ctx.stroke();

    // Modaks already placed on the puja plate
    [-w * 0.2, 0, w * 0.2].forEach((px, i) => {
      this.ctx.beginPath();
      this.ctx.arc(px, plateY - 4, 4.5, 0, Math.PI * 2);
      this.ctx.fillStyle = i === 1 ? "#ffe082" : "#ffffff";
      this.ctx.fill();
    });
    this.ctx.restore();

    this.ctx.restore();
  }

  // Render Explosion & Sparkle Particles
  renderParticles() {
    this.particles.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;

      if (p.isSparkle) {
        // 4-point star sparkle
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          this.ctx.rotate(Math.PI / 2);
          this.ctx.moveTo(0, -p.size * 1.5);
          this.ctx.lineTo(p.size * 0.3, 0);
          this.ctx.lineTo(0, p.size * 0.3);
          this.ctx.lineTo(-p.size * 0.3, 0);
        }
        this.ctx.fill();
      } else {
        // Flower petal particle
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });
  }

  // Render Floating Texts
  renderFloatingTexts() {
    this.floatingTexts.forEach((ft) => {
      this.ctx.save();
      this.ctx.globalAlpha = ft.alpha;
      this.ctx.font = "bold 16px 'Poppins', sans-serif";
      this.ctx.fillStyle = ft.color;
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(ft.text, ft.x, ft.y);
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });
  }

  // Level Up Banner
  renderLevelBanner() {
    this.ctx.save();
    const alpha = Math.min(1, this.levelBannerTimer / 30);
    this.ctx.globalAlpha = alpha;

    const bannerY = this.height / 2 - 30;
    this.ctx.fillStyle = "rgba(211, 47, 47, 0.9)";
    this.ctx.fillRect(0, bannerY - 15, this.width, 50);

    this.ctx.strokeStyle = "#ffd700";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, bannerY - 15, this.width, 50);

    this.ctx.font = "bold 20px 'Cinzel', serif";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.shadowColor = "#ffd700";
    this.ctx.shadowBlur = 8;
    this.ctx.fillText(this.levelBannerText, this.width / 2, bannerY + 10);

    this.ctx.restore();
  }

  // Pause Screen Banner
  renderPauseScreen() {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.font = "bold 28px 'Cinzel', serif";
    this.ctx.fillStyle = "#ffd700";
    this.ctx.textAlign = "center";
    this.ctx.fillText("⏸️ GAME PAUSED", this.width / 2, this.height / 2 - 10);

    this.ctx.font = "14px 'Poppins', sans-serif";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText("Press 'P' or click Pause to resume", this.width / 2, this.height / 2 + 25);
    this.ctx.restore();
  }
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  window.game = new ModakCatcherGame();
});
