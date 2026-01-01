// ===========================================
// COLT 1V1 REAL MECHANICS - 4000HP/4000DPS
// ===========================================

console.log('🎮 Colt 1v1 Real Mechanics yükleniyor...');

// GLOBAL DEĞİŞKENLER
let currentDifficulty = 'easy';
let gameActive = false;
let gameTime = 0;
let timerInterval = null;
let gameLoopId = null;

// OYUN STATS
const gameStats = {
    playerHP: 4000,
    playerMaxHP: 4000,
    playerDPS: 0,
    botHP: 3000,
    botMaxHP: 3000,
    botDPS: 0,
    
    shotsFired: 0,
    shotsLanded: 0,
    bulletsDodged: 0,
    bulletsIncoming: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    reactionTimes: [],
    killTimes: []
};

// BOT AI SETTINGS
const botAI = {
    easy: {
        hp: 3000,
        dps: 2500,
        accuracy: 0.4,
        reactionTime: 400,
        dodgeChance: 0.3,
        moveSpeed: 2,
        fireRate: 800,
        patterns: ['circle', 'strafe'],
        aggression: 0.3
    },
    medium: {
        hp: 4000,
        dps: 3500,
        accuracy: 0.6,
        reactionTime: 250,
        dodgeChance: 0.5,
        moveSpeed: 3,
        fireRate: 600,
        patterns: ['zigzag', 'wallpeek', 'circle'],
        aggression: 0.6
    },
    hard: {
        hp: 4000,
        dps: 4000,
        accuracy: 0.8,
        reactionTime: 120,
        dodgeChance: 0.7,
        moveSpeed: 4,
        fireRate: 400,
        patterns: ['predictive', 'aggressive', 'mindgame', 'perfectstrafe'],
        aggression: 0.9
    }
};

// DOM ELEMENTLERİ
const dom = {};

// SAYFA YÜKLENDİĞİNDE
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM hazır!');
    
    // DOM ELEMENTLERİNİ BUL
    findDOMElements();
    
    // EVENT LISTENER'LARI KUR
    setupEventListeners();
    
    // ARKA PLANI BAŞLAT
    initBackground();
    
    console.log('🎮 Sistem hazır! Butonlara tıkla!');
});

// DOM ELEMENTLERİNİ BUL
function findDOMElements() {
    dom.difficultySection = document.querySelector('.difficulty-section');
    dom.gameArea = document.getElementById('gameArea');
    dom.currentDifficulty = document.getElementById('currentDifficulty');
    dom.gameTime = document.getElementById('gameTime');
    dom.gameScore = document.getElementById('gameScore');
    dom.currentDPS = document.getElementById('currentDPS');
    dom.backBtn = document.getElementById('backBtn');
    
    // HEALTH BARS
    dom.playerHealth = document.getElementById('playerHealth');
    dom.playerHealthText = document.getElementById('playerHealthText');
    dom.playerDPS = document.getElementById('playerDPS');
    dom.playerDPSText = document.getElementById('playerDPSText');
    dom.botHealth = document.getElementById('botHealth');
    dom.botHealthText = document.getElementById('botHealthText');
    dom.botDPS = document.getElementById('botDPS');
    dom.botDPSText = document.getElementById('botDPSText');
    dom.botMaxHP = document.getElementById('botMaxHP');
    
    // CONTROL BUTTONS
    dom.aimbotBtn = document.getElementById('aimbotBtn');
    dom.dodgeBtn = document.getElementById('dodgeBtn');
    dom.aimbotStatus = document.getElementById('aimbotStatus');
    dom.dodgeStatus = document.getElementById('dodgeStatus');
    
    // SLIDERS
    dom.aimSensitivity = document.getElementById('aimSensitivity');
    dom.dodgeAggressiveness = document.getElementById('dodgeAggressiveness');
    dom.aimValue = document.getElementById('aimValue');
    dom.dodgeValue = document.getElementById('dodgeValue');
    
    // STATS
    dom.ttkStat = document.getElementById('ttkStat');
    dom.shotsLanded = document.getElementById('shotsLanded');
    dom.accuracyStat = document.getElementById('accuracyStat');
    dom.dodgeRate = document.getElementById('dodgeRate');
    dom.dodgedCount = document.getElementById('dodgedCount');
    dom.avgReaction = document.getElementById('avgReaction');
    dom.botPattern = document.getElementById('botPattern');
    dom.botAggro = document.getElementById('botAggro');
    dom.botPeek = document.getElementById('botPeek');
    
    // CANVAS
    dom.backgroundCanvas = document.getElementById('backgroundCanvas');
    dom.gameCanvas = document.getElementById('gameCanvas');
    
    console.log('📋 DOM elementleri bulundu:', Object.keys(dom).length);
}

// EVENT LISTENER'LARI KUR
function setupEventListeners() {
    // ZORLUK BUTONLARI
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const difficulty = this.closest('.diff-card').dataset.difficulty;
            console.log(`🎯 ${difficulty.toUpperCase()} seçildi!`);
            selectDifficulty(difficulty);
        });
    });
    
    // KONTROL BUTONLARI
    if (dom.aimbotBtn) {
        dom.aimbotBtn.addEventListener('click', toggleAimbot);
    }
    
    if (dom.dodgeBtn) {
        dom.dodgeBtn.addEventListener('click', toggleDodge);
    }
    
    if (dom.backBtn) {
        dom.backBtn.addEventListener('click', backToMenu);
    }
    
    // SLIDER'LAR
    if (dom.aimSensitivity) {
        dom.aimSensitivity.addEventListener('input', function(e) {
            dom.aimValue.textContent = `%${e.target.value}`;
        });
    }
    
    if (dom.dodgeAggressiveness) {
        dom.dodgeAggressiveness.addEventListener('input', function(e) {
            dom.dodgeValue.textContent = `%${e.target.value}`;
        });
    }
    
    // OYUN ALANI KLİKLERİ (TEST ATEŞİ)
    if (dom.gameCanvas) {
        dom.gameCanvas.addEventListener('click', function(e) {
            if (gameActive) {
                playerShoot(e.offsetX, e.offsetY);
            }
        });
    }
}

// ZORLUK SEÇİMİ
function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    gameActive = true;
    
    console.log(`🎮 ${difficulty.toUpperCase()} modu başlatılıyor...`);
    
    // UI GÜNCELLE
    updateUIForDifficulty(difficulty);
    
    // OYUN ALANINI GÖSTER
    showGameArea();
    
    // OYUNU BAŞLAT
    startGame(difficulty);
}

function updateUIForDifficulty(difficulty) {
    if (dom.currentDifficulty) {
        dom.currentDifficulty.textContent = `${difficulty.toUpperCase()} MOD`;
        
        // Renk ayarla
        const colors = {
            easy: '#00ff88',
            medium: '#ff9900',
            hard: '#ff3366'
        };
        dom.currentDifficulty.style.color = colors[difficulty] || '#00bfff';
    }
    
    // Bot HP'yi güncelle
    const botSettings = botAI[difficulty];
    if (dom.botMaxHP) {
        dom.botMaxHP.textContent = botSettings.hp;
    }
}

function showGameArea() {
    if (dom.difficultySection) {
        dom.difficultySection.style.display = 'none';
    }
    
    if (dom.gameArea) {
        dom.gameArea.style.display = 'block';
    }
}

// OYUNU BAŞLAT
function startGame(difficulty) {
    // STATS'LARI SIFIRLA
    resetGameStats();
    
    // BOT AYARLARINI YÜKLE
    const botSettings = botAI[difficulty];
    gameStats.botHP = botSettings.hp;
    gameStats.botMaxHP = botSettings.hp;
    
    // SAĞLIK BARLARINI GÜNCELLE
    updateHealthBars();
    
    // ZAMANLAYICIYI BAŞLAT
    startTimer();
    
    // STATS'LARI GÜNCELLE
    updateStatsDisplay();
    
    // CANVAS AYARLA
    setupCanvas();
    
    // OYUN DÖNGÜSÜNÜ BAŞLAT
    startGameLoop();
    
    console.log(`🎮 ${difficulty.toUpperCase()} modu başladı!`);
}

function resetGameStats() {
    gameStats.playerHP = 4000;
    gameStats.playerDPS = 0;
    gameStats.botHP = botAI[currentDifficulty].hp;
    gameStats.botMaxHP = botAI[currentDifficulty].hp;
    gameStats.botDPS = 0;
    
    gameStats.shotsFired = 0;
    gameStats.shotsLanded = 0;
    gameStats.bulletsDodged = 0;
    gameStats.bulletsIncoming = 0;
    gameStats.totalDamageDealt = 0;
    gameStats.totalDamageTaken = 0;
    gameStats.reactionTimes = [];
    gameStats.killTimes = [];
    
    // SKORU SIFIRLA
    if (dom.gameScore) {
        dom.gameScore.textContent = '0';
    }
}

function updateHealthBars() {
    // OYUNCU SAĞLIK
    const playerPercent = (gameStats.playerHP / gameStats.playerMaxHP) * 100;
    if (dom.playerHealth) {
        dom.playerHealth.style.width = `${playerPercent}%`;
    }
    if (dom.playerHealthText) {
        dom.playerHealthText.textContent = `${Math.round(gameStats.playerHP)}/${gameStats.playerMaxHP}`;
    }
    
    // OYUNCU DPS
    const playerDPSPercent = (gameStats.playerDPS / 4000) * 100;
    if (dom.playerDPS) {
        dom.playerDPS.style.width = `${playerDPSPercent}%`;
    }
    if (dom.playerDPSText) {
        dom.playerDPSText.textContent = `${gameStats.playerDPS} DPS`;
    }
    
    // BOT SAĞLIK
    const botPercent = (gameStats.botHP / gameStats.botMaxHP) * 100;
    if (dom.botHealth) {
        dom.botHealth.style.width = `${botPercent}%`;
    }
    if (dom.botHealthText) {
        dom.botHealthText.textContent = `${Math.round(gameStats.botHP)}/${gameStats.botMaxHP}`;
    }
    
    // BOT DPS
    const botDPSPercent = (gameStats.botDPS / 4000) * 100;
    if (dom.botDPS) {
        dom.botDPS.style.width = `${botDPSPercent}%`;
    }
    if (dom.botDPSText) {
        dom.botDPSText.textContent = `${gameStats.botDPS} DPS`;
    }
    
    // RENK GÜNCELLEME
    updateHealthColors(playerPercent, botPercent);
}

function updateHealthColors(playerPercent, botPercent) {
    // OYUNCU RENK
    if (dom.playerHealth) {
        if (playerPercent < 25) {
            dom.playerHealth.style.background = 'linear-gradient(135deg, #ff0000 0%, #ff3366 100%)';
        } else if (playerPercent < 50) {
            dom.playerHealth.style.background = 'linear-gradient(135deg, #ff9900 0%, #ffcc00 100%)';
        } else if (playerPercent < 75) {
            dom.playerHealth.style.background = 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)';
        } else {
            dom.playerHealth.style.background = 'linear-gradient(135deg, #00bfff 0%, #0066ff 100%)';
        }
    }
    
    // BOT RENK
    if (dom.botHealth) {
        if (botPercent < 25) {
            dom.botHealth.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
        } else if (botPercent < 50) {
            dom.botHealth.style.background = 'linear-gradient(135deg, #ff3366 0%, #ff0000 100%)';
        } else if (botPercent < 75) {
            dom.botHealth.style.background = 'linear-gradient(135deg, #ff9900 0%, #ff3366 100%)';
        } else {
            dom.botHealth.style.background = 'linear-gradient(135deg, #ff9900 0%, #ff6600 100%)';
        }
    }
}

// ZAMANLAYICI
function startTimer() {
    gameTime = 0;
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        gameTime++;
        updateTimerDisplay();
        
        // HER SANİYE DPS HESAPLA
        calculateDPS();
        
        // BOT AI UPDATE
        updateBotAI();
        
    }, 1000);
}

function updateTimerDisplay() {
    if (!dom.gameTime) return;
    
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    dom.gameTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// DPS HESAPLAMA
function calculateDPS() {
    // Basit DPS hesaplama (gerçek oyuna göre ayarlanabilir)
    const playerDPS = Math.min(4000, gameStats.totalDamageDealt / gameTime);
    const botDPS = Math.min(4000, gameStats.totalDamageTaken / gameTime);
    
    gameStats.playerDPS = Math.round(playerDPS);
    gameStats.botDPS = Math.round(botDPS);
    
    // DPS GÖSTERGELERİNİ GÜNCELLE
    updateHealthBars();
    
    if (dom.currentDPS) {
        dom.currentDPS.textContent = `${gameStats.playerDPS}`;
    }
}

// BOT AI
function updateBotAI() {
    if (!gameActive) return;
    
    const settings = botAI[currentDifficulty];
    
    // RASTGELE ATEŞ ET
    if (Math.random() < settings.aggression) {
        botShoot();
    }
    
    // BOT STATS'INI GÜNCELLE
    updateBotStatsDisplay();
}

function botShoot() {
    if (!gameActive) return;
    
    const settings = botAI[currentDifficulty];
    gameStats.bulletsIncoming++;
    
    // ACCURACY KONTROLÜ
    const hitChance = Math.random();
    if (hitChance <= settings.accuracy) {
        // HIT!
        const damage = settings.dps / 4; // Saniyede 4 atış varsayımı
        gameStats.playerHP -= damage;
        gameStats.totalDamageTaken += damage;
        
        // REACTION TIME KAYDET
        gameStats.reactionTimes.push(settings.reactionTime);
        
        // DODGE KONTROLÜ
        if (dom.dodgeStatus && dom.dodgeStatus.textContent.includes('AÇIK')) {
            const dodgeRoll = Math.random();
            if (dodgeRoll > 0.5) { // %50 dodge chance when enabled
                gameStats.bulletsDodged++;
                gameStats.playerHP += damage; // Geri al
                gameStats.totalDamageTaken -= damage;
            }
        }
    }
    
    // SAĞLIK BARLARINI GÜNCELLE
    updateHealthBars();
    
    // STATS GÜNCELLE
    updateStatsDisplay();
    
    // OYUN BİTTİ Mİ KONTROL ET
    checkGameOver();
}

// OYUNCU ATEŞ ETME
function playerShoot(targetX, targetY) {
    if (!gameActive) return;
    
    gameStats.shotsFired++;
    
    const settings = botAI[currentDifficulty];
    const hitRoll = Math.random();
    
    // AIMBOT ETKİSİ
    let accuracyBonus = 0;
    if (dom.aimbotStatus && dom.aimbotStatus.textContent.includes('AÇIK')) {
        const sensitivity = dom.aimSensitivity ? parseInt(dom.aimSensitivity.value) : 50;
        accuracyBonus = sensitivity / 200; // %0-50 bonus
    }
    
    // HIT KONTROLÜ
    const baseHitChance = 0.7; // Base %70 hit chance
    const totalHitChance = Math.min(0.95, baseHitChance + accuracyBonus);
    
    if (hitRoll <= totalHitChance) {
        // HIT!
        gameStats.shotsLanded++;
        
        // DAMAGE HESAPLA (4000 DPS = 1000 per shot if 4 shots per second)
        const damage = 1000;
        gameStats.botHP -= damage;
        gameStats.totalDamageDealt += damage;
        
        // KILL TIME HESAPLA
        if (gameStats.botHP <= 0) {
            const killTime = gameTime + (gameStats.botHP + damage) / 1000;
            gameStats.killTimes.push(killTime);
        }
        
        // SKOR EKLE
        if (dom.gameScore) {
            const currentScore = parseInt(dom.gameScore.textContent) || 0;
            dom.gameScore.textContent = currentScore + 100;
        }
    }
    
    // SAĞLIK BARLARINI GÜNCELLE
    updateHealthBars();
    
    // STATS GÜNCELLE
    updateStatsDisplay();
    
    // OYUN BİTTİ Mİ KONTROL ET
    checkGameOver();
}

// STATS GÖSTERİMİ
function updateStatsDisplay() {
    // TTK (Time to Kill)
    if (dom.ttkStat) {
        const ttk = gameStats.botHP / gameStats.playerDPS || 0;
        dom.ttkStat.textContent = ttk > 0 ? `${ttk.toFixed(1)}s` : '0s';
    }
    
    // SHOTS LANDED
    if (dom.shotsLanded) {
        dom.shotsLanded.textContent = gameStats.shotsLanded;
    }
    
    // ACCURACY
    if (dom.accuracyStat) {
        const accuracy = gameStats.shotsFired > 0 ? 
            Math.round((gameStats.shotsLanded / gameStats.shotsFired) * 100) : 0;
        dom.accuracyStat.textContent = `${accuracy}%`;
    }
    
    // DODGE RATE
    if (dom.dodgeRate) {
        const dodgeRate = gameStats.bulletsIncoming > 0 ?
            Math.round((gameStats.bulletsDodged / gameStats.bulletsIncoming) * 100) : 0;
        dom.dodgeRate.textContent = `${dodgeRate}%`;
    }
    
    // DODGED COUNT
    if (dom.dodgedCount) {
        dom.dodgedCount.textContent = gameStats.bulletsDodged;
    }
    
    // AVG REACTION
    if (dom.avgReaction) {
        const avgReaction = gameStats.reactionTimes.length > 0 ?
            Math.round(gameStats.reactionTimes.reduce((a, b) => a + b) / gameStats.reactionTimes.length) : 0;
        dom.avgReaction.textContent = `${avgReaction}ms`;
    }
}

function updateBotStatsDisplay() {
    const settings = botAI[currentDifficulty];
    
    if (dom.botPattern) {
        const patterns = settings.patterns;
        dom.botPattern.textContent = patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    if (dom.botAggro) {
        const aggroLevels = ['Low', 'Medium', 'High', 'Extreme'];
        dom.botAggro.textContent = aggroLevels[Math.floor(settings.aggression * 3)];
    }
    
    if (dom.botPeek) {
        dom.botPeek.textContent = settings.aggression > 0.5 ? 'Yes' : 'No';
    }
}

// OYUN BİTİŞ KONTROLÜ
function checkGameOver() {
    if (gameStats.playerHP <= 0) {
        endGame(false); // KAYBETTİN
    } else if (gameStats.botHP <= 0) {
        endGame(true); // KAZANDIN
    }
}

function endGame(playerWon) {
    gameActive = false;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    const message = playerWon ?
        `🎉 TEBRİKLER! ${currentDifficulty.toUpperCase()} botunu yendin!\n` +
        `Süre: ${dom.gameTime.textContent}\n` +
        `Skor: ${dom.gameScore.textContent}\n` +
        `Accuracy: ${dom.accuracyStat.textContent}` :
        `💀 KAYBETTİN! Bot seni ${Math.round(gameStats.totalDamageTaken)} hasarla yendi.\n` +
        `Süre: ${dom.gameTime.textContent}\n` +
        `Dodge Rate: ${dom.dodgeRate.textContent}`;
    
    setTimeout(() => {
        alert(message);
        backToMenu();
    }, 500);
}

// KONTROL FONKSİYONLARI
function toggleAimbot() {
    if (!dom.aimbotStatus) return;
    
    const isOn = dom.aimbotStatus.textContent.includes('AÇIK');
    dom.aimbotStatus.textContent = `Aimbot: ${isOn ? 'KAPALI' : 'AÇIK'}`;
    dom.aimbotStatus.style.color = isOn ? '#ff6666' : '#00ff88';
    
    console.log(`🎯 Aimbot ${isOn ? 'kapatıldı' : 'açıldı'}`);
}

function toggleDodge() {
    if (!dom.dodgeStatus) return;
    
    const isOn = dom.dodgeStatus.textContent.includes('AÇIK');
    dom.dodgeStatus.textContent = `Auto-Dodge: ${isOn ? 'KAPALI' : 'AÇIK'}`;
    dom.dodgeStatus.style.color = isOn ? '#ff6666' : '#00ff88';
    
    console.log(`🛡️ Auto-Dodge ${isOn ? 'kapatıldı' : 'açıldı'}`);
}

function backToMenu() {
    console.log('🔙 Menüye dönülüyor...');
    
    gameActive = false;
    
    // INTERVAL'LERİ TEMİZLE
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    // MENÜYÜ GÖSTER
    if (dom.difficultySection) {
        dom.difficultySection.style.display = 'block';
    }
    
    if (dom.gameArea) {
        dom.gameArea.style.display = 'none';
    }
}

// CANVAS AYARLARI
function setupCanvas() {
    if (!dom.gameCanvas) return;
    
    const ctx = dom.gameCanvas.getContext('2d');
    const container = dom.gameCanvas.parentElement;
    
    dom.gameCanvas.width = container.clientWidth;
    dom.gameCanvas.height = 650;
    
    // TEMİZLE
    ctx.clearRect(0, 0, dom.gameCanvas.width, dom.gameCanvas.height);
}

// OYUN DÖNGÜSÜ
function startGameLoop() {
    if (!dom.gameCanvas || !gameActive) return;
    
    const ctx = dom.gameCanvas.getContext('2d');
    
    function gameLoop() {
        if (!gameActive) return;
        
        // TEMİZLE
        ctx.clearRect(0, 0, dom.gameCanvas.width, dom.gameCanvas.height);
        
        // ÇİZİMLER
        drawArena(ctx);
        drawPlayer(ctx);
        drawBot(ctx);
        drawUI(ctx);
        
        // DEVAM ET
        gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

// ÇİZİM FONKSİYONLARI
function drawArena(ctx) {
    const canvas = dom.gameCanvas;
    
    // ARKA PLAN
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ARENA
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    
    // ORTA ÇİZGİ
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 50);
    ctx.lineTo(canvas.width / 2, canvas.height - 5
