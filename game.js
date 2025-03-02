// Initialize Supabase client
const supabaseClient = supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
canvas.width = 800;
canvas.height = 600;

// Get DOM elements
const scoreSubmission = document.getElementById('scoreSubmission');
const finalScoreSpan = document.getElementById('finalScore');
const submitScoreBtn = document.getElementById('submitScore');
const skipButton = document.getElementById('skipButton');
const playerNameInput = document.getElementById('playerName');
const playerEmailInput = document.getElementById('playerEmail');
const leaderboardEntries = document.getElementById('leaderboardEntries');

// Game variables
let bird;
let pipes = [];
let particles = [];
let score = 0;
let gameOver = false;
let pipeWidth;
let pipeGap;
let gameState = 'start'; // 'start', 'playing', 'over'

// Initialize game variables
function initGame() {
    const initialY = canvas.height / 2;
    bird = {
        x: canvas.width * 0.2,
        y: initialY,
        initialY: initialY, // Store initial Y position for floating animation
        velocity: 0,
        gravity: 0.5,
        jump: -8,
        size: Math.min(canvas.width, canvas.height) * 0.05,
        rotation: 0,
        floating: true
    };
    
    pipeWidth = canvas.width * 0.1;
    pipeGap = canvas.height * 0.25;
    pipes = [];
    particles = [];
    score = 0;
    gameOver = false;
    gameState = 'start';
}

// Set initial canvas size
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Update canvas size
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Update game dimensions
    if (bird) {
        bird.x = canvas.width * 0.2;
        bird.y = canvas.height / 2;
        bird.size = Math.min(canvas.width, canvas.height) * 0.05;
        pipeWidth = canvas.width * 0.1;
        pipeGap = canvas.height * 0.25;
    }
}

// Initialize game on window load
window.addEventListener('load', () => {
    try {
        console.log('Game loading...'); // Debug log
        
        // Set initial canvas size
        canvas.width = 800;
        canvas.height = 600;
        console.log('Canvas size set to:', canvas.width, 'x', canvas.height); // Debug log
        
        // Initialize game
        initGame();
        console.log('Game initialized, bird:', bird); // Debug log
        
        // Load leaderboard
        loadLeaderboard();
        
        // Start game loop
        console.log('Starting game loop...'); // Debug log
        gameLoop();
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Error initializing game. Check console for details.');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
});

// Particle system
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1.0; // Life from 1 to 0
        this.decay = Math.random() * 0.02 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life})`;
        ctx.fill();
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (gameState === 'start') {
            gameState = 'playing';
            bird.floating = false;
        } else if (gameState === 'over') {
            // Only reset if not clicking on the form
            if (!scoreSubmission.contains(document.activeElement)) {
                resetGame();
            }
        } else if (gameState === 'playing') {
            bird.velocity = bird.jump;
            // Add particles when bird jumps
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(bird.x, bird.y + bird.size/2));
            }
        }
    }
});

// Update click event listener
canvas.addEventListener('click', (e) => {
    if (gameState === 'start') {
        gameState = 'playing';
        bird.floating = false;
    } else if (gameState === 'over') {
        // Only reset if not clicking on the form
        if (!scoreSubmission.contains(e.target)) {
            resetGame();
        }
    } else if (gameState === 'playing') {
        bird.velocity = bird.jump;
        // Add particles when bird jumps
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(bird.x, bird.y + bird.size/2));
        }
    }
});

function resetGame() {
    initGame();
    scoreSubmission.style.display = 'none';
    playerNameInput.value = '';
    playerEmailInput.value = '';
}

// Game functions
function createPipe() {
    const gapPosition = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
        x: canvas.width,
        gapY: gapPosition,
        passed: false
    });
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.size/2, bird.y + bird.size/2);
    
    // Rotate bird based on velocity
    if (gameState === 'playing') {
        bird.rotation = Math.min(Math.PI/4, Math.max(-Math.PI/4, bird.velocity * 0.1));
    } else {
        bird.rotation = 0;
    }
    ctx.rotate(bird.rotation);
    
    // Bird body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.size/1.5, bird.size/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(-bird.size/4, -bird.size/4, bird.size/3, bird.size/4, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.size/3, -bird.size/6, bird.size/6, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.size/3, -bird.size/6, bird.size/10, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(bird.size/2, 0);
    ctx.lineTo(bird.size, -bird.size/8);
    ctx.lineTo(bird.size, bird.size/8);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function drawPipe(x, gapY) {
    const gradient = ctx.createLinearGradient(x, 0, x + pipeWidth, 0);
    gradient.addColorStop(0, '#2ecc71');
    gradient.addColorStop(0.5, '#27ae60');
    gradient.addColorStop(1, '#2ecc71');

    // Top pipe
    ctx.fillStyle = gradient;
    ctx.fillRect(x, 0, pipeWidth, gapY);
    
    // Pipe cap (top)
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(x - 5, gapY - 30, pipeWidth + 10, 30);
    
    // Bottom pipe
    ctx.fillStyle = gradient;
    ctx.fillRect(x, gapY + pipeGap, pipeWidth, canvas.height - (gapY + pipeGap));
    
    // Pipe cap (bottom)
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(x - 5, gapY + pipeGap, pipeWidth + 10, 30);
}

async function loadLeaderboard() {
    try {
        const { data, error } = await supabaseClient
            .from('leaderboard')
            .select('name, score')
            .order('score', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Leaderboard error:', error);
            leaderboardEntries.innerHTML = '<p>Error loading leaderboard. Please try again later.</p>';
            return;
        }

        if (!data || data.length === 0) {
            leaderboardEntries.innerHTML = '<p>No scores yet. Be the first to play!</p>';
            return;
        }

        // Update leaderboard display
        leaderboardEntries.innerHTML = data
            .map((entry, index) => `
                <div class="leaderboard-entry">
                    <span>${index + 1}. ${entry.name}</span>
                    <span>${entry.score}</span>
                </div>
            `)
            .join('');
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardEntries.innerHTML = '<p>Error loading leaderboard. Please try again later.</p>';
    }
}

async function submitScore(name, email, score) {
    try {
        // Show loading state
        submitScoreBtn.disabled = true;
        submitScoreBtn.textContent = 'Submitting...';

        const { error } = await supabaseClient
            .from('leaderboard')
            .insert([
                { name, email, score }
            ]);

        if (error) {
            console.error('Submission error:', error);
            if (error.code === '42P01') {
                alert('Error: Leaderboard table not found. Please make sure to set up the database correctly.');
            } else if (error.code === '23505') {
                alert('You have already submitted this score.');
            } else {
                alert(`Error submitting score: ${error.message}`);
            }
            return;
        }

        // Reload leaderboard after submission
        await loadLeaderboard();
        
        // Hide submission form and continue game
        scoreSubmission.style.display = 'none';
        resetGame();
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(46, 204, 113, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
        `;
        successMessage.textContent = 'Score submitted successfully!';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
        console.error('Error submitting score:', error);
        alert('Error submitting score. Please try again.');
    } finally {
        // Reset button state
        submitScoreBtn.disabled = false;
        submitScoreBtn.textContent = 'Submit Score';
    }
}

// Event listeners for score submission
submitScoreBtn.addEventListener('click', async () => {
    const name = playerNameInput.value.trim();
    const email = playerEmailInput.value.trim();
    
    if (!name || !email) {
        alert('Please enter both name and email');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    await submitScore(name, email, score);
});

skipButton.addEventListener('click', () => {
    scoreSubmission.style.display = 'none';
    resetGame();
});

// Modify the existing game over handling
function handleGameOver() {
    gameState = 'over';
    gameOver = true;
    finalScoreSpan.textContent = score;
    scoreSubmission.style.display = 'block';
}

// Update the collision detection to use the new game over handling
function update() {
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    if (gameState === 'start') {
        // Floating animation
        const floatingOffset = Math.sin(Date.now() / 400) * 10;
        bird.y = bird.initialY + floatingOffset;
        bird.rotation = 0;
        return;
    }

    if (gameState === 'over') return;

    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Check collisions with ground and ceiling
    if (bird.y + bird.size * 0.8 > canvas.height || bird.y - bird.size * 0.4 < 0) {
        handleGameOver();
        return;
    }

    // Update pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - canvas.width * 0.375) {
        createPipe();
    }

    const pipeSpeed = canvas.width * 0.003;
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        // Calculate bird's center point for circular hitbox
        const birdCenterX = bird.x;
        const birdCenterY = bird.y;
        const hitboxRadius = bird.size * 0.3; // Smaller hitbox radius

        // Calculate closest point on pipe to bird center
        const closestX = Math.max(pipes[i].x, Math.min(birdCenterX, pipes[i].x + pipeWidth));
        const closestYTop = Math.min(birdCenterY, pipes[i].gapY);
        const closestYBottom = Math.max(birdCenterY, pipes[i].gapY + pipeGap);

        // Check collision with top pipe
        const distanceTop = Math.sqrt(
            Math.pow(birdCenterX - closestX, 2) + 
            Math.pow(birdCenterY - closestYTop, 2)
        );

        // Check collision with bottom pipe
        const distanceBottom = Math.sqrt(
            Math.pow(birdCenterX - closestX, 2) + 
            Math.pow(birdCenterY - closestYBottom, 2)
        );

        // If either distance is less than hitbox radius, collision occurred
        if (distanceTop < hitboxRadius || distanceBottom < hitboxRadius) {
            handleGameOver();
            return;
        }

        // Update score
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function draw() {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pipes only during gameplay or game over
    if (gameState === 'playing' || gameState === 'over') {
        pipes.forEach(pipe => {
            drawPipe(pipe.x, pipe.gapY);
        });
    }

    // Draw particles
    particles.forEach(particle => {
        particle.draw();
    });

    // Draw bird
    drawBird();

    // Draw score during gameplay or game over
    if (gameState === 'playing' || gameState === 'over') {
        const fontSize = Math.max(20, Math.min(canvas.width, canvas.height) * 0.04);
        ctx.fillStyle = '#000';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(`Score: ${score}`, 10, fontSize + 6);
    }

    // Draw welcome screen
    if (gameState === 'start') {
        const messageHeight = canvas.height * 0.15;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height/2 - messageHeight, canvas.width, messageHeight * 2);
        
        ctx.fillStyle = '#FFF';
        const titleSize = Math.max(32, Math.min(canvas.width, canvas.height) * 0.08);
        const instructionSize = Math.max(20, Math.min(canvas.width, canvas.height) * 0.04);
        
        ctx.font = `bold ${titleSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Flappy Bird', canvas.width/2, canvas.height/2);
        
        ctx.font = `${instructionSize}px Arial`;
        ctx.fillText('Click or press Space to start', canvas.width/2, canvas.height/2 + titleSize);
        
        // Reset text alignment for other text
        ctx.textAlign = 'left';
    }

    // Draw game over message
    if (gameState === 'over') {
        const messageHeight = canvas.height * 0.15;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height/2 - messageHeight, canvas.width, messageHeight * 2);
        
        ctx.fillStyle = '#FFF';
        const gameOverSize = Math.max(32, Math.min(canvas.width, canvas.height) * 0.08);
        const restartSize = Math.max(20, Math.min(canvas.width, canvas.height) * 0.04);
        
        ctx.font = `bold ${gameOverSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        
        ctx.font = `${restartSize}px Arial`;
        ctx.fillText('Click or press Space to restart', canvas.width/2, canvas.height/2 + gameOverSize);
        
        // Reset text alignment for other text
        ctx.textAlign = 'left';
    }
}

// Game loop
function gameLoop() {
    try {
        console.log('Game State:', gameState); // Debug log
        console.log('Bird Position:', bird ? `x: ${bird.x}, y: ${bird.y}` : 'Bird not initialized'); // Debug log
        
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Error in game loop:', error);
        alert('Game error occurred. Check console for details.');
    }
} 