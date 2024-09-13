const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const restartButton = document.getElementById('restartButton');

let targetRadius = 20;
const minTargetRadius = 10;
const maxTargets = 10;
let targets = [];
let score = 0;
let level = 1;
let levelUpInterval = 5000;
let lastLevelUpTime = Date.now();
let levelInProgress = true;
const explosionRadius = 30;
const explosionDuration = 300;
let explosions = [];

function createTarget() {
    const x = Math.random() * (canvas.width - targetRadius * 2) + targetRadius;
    const y = Math.random() * (canvas.height - targetRadius * 2) + targetRadius;
    targets.push({ x, y, radius: targetRadius, color: 'red' });
}

function drawTargets() {
    targets.forEach(target => {
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.fill();
        ctx.closePath();
    });
}

function drawExplosions() {
    const now = Date.now();
    explosions = explosions.filter(exp => now - exp.startTime < explosionDuration);
    explosions.forEach(exp => {
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, explosionRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'orange';
        ctx.globalAlpha = 1 - (now - exp.startTime) / explosionDuration;
        ctx.fill();
        ctx.closePath();
    });
    ctx.globalAlpha = 1;
}

function drawScoreAndLevel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTargets();
    drawExplosions();
    scoreElement.textContent = `Score: ${score}`;
    levelElement.textContent = `Level: ${level}`;
}

function detectHit(x, y) {
    targets = targets.filter(target => {
        const dist = Math.hypot(x - target.x, y - target.y);
        if (dist < target.radius) {
            score++;
            explosions.push({ x: target.x, y: target.y, startTime: Date.now() });
            return false;
        }
        return true;
    });

    if (targets.length === 0 && levelInProgress) {
        levelInProgress = false;
        setTimeout(() => {
            level++;
            targetRadius = Math.max(minTargetRadius, targetRadius - 2);
            targets = [];
            for (let i = 0; i < maxTargets; i++) {
                createTarget();
            }
            levelInProgress = true;
            drawScoreAndLevel();
        }, 1000);
    }
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    detectHit(x, y);
    drawScoreAndLevel();
});

function initializeGame() {
    canvas.width = 800;
    canvas.height = 600;
    for (let i = 0; i < maxTargets; i++) {
        createTarget();
    }
    gameLoop();
}

function gameLoop() {
    drawScoreAndLevel();
    requestAnimationFrame(gameLoop);
}

restartButton.addEventListener('click', () => {
    score = 0;
    level = 1;
    targetRadius = 20;
    levelInProgress = true;
    explosions = [];
    targets = [];
    initializeGame();
});

initializeGame();
