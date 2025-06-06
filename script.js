document.addEventListener('DOMContentLoaded', function() {
    console.log('Game loaded!');
});

// Sliding Puzzle Game
let PUZZLE_SIZE = 3;
let TIMER_SECONDS = 0;
let timerInterval = null;
let timeLeft = 0;
let gameActive = false;

const IMAGE_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80'; // Unsplash image, 300x300 or 400x400

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function isSolvable(tiles) {
    let invCount = 0;
    for (let i = 0; i < tiles.length - 1; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) invCount++;
        }
    }
    return invCount % 2 === 0;
}

function createPuzzle() {
    const puzzle = document.getElementById('puzzle');
    puzzle.innerHTML = '';
    let tiles = Array.from({length: PUZZLE_SIZE * PUZZLE_SIZE}, (_, i) => i);
    do {
        shuffle(tiles);
    } while (!isSolvable(tiles) || isSolved(tiles));
    tiles.forEach((tile, idx) => {
        const tileDiv = document.createElement('button');
        tileDiv.className = 'tile' + (tile === 0 ? ' empty' : '');
        tileDiv.tabIndex = tile === 0 ? -1 : 0;
        tileDiv.dataset.index = idx;
        tileDiv.dataset.tile = tile;
        if (tile !== 0) {
            const x = (tile - 1) % PUZZLE_SIZE;
            const y = Math.floor((tile - 1) / PUZZLE_SIZE);
            tileDiv.style.backgroundImage = `url('${IMAGE_URL}')`;
            tileDiv.style.backgroundSize = `${PUZZLE_SIZE * 100}px ${PUZZLE_SIZE * 100}px`;
            tileDiv.style.backgroundPosition = `-${x * 100}px -${y * 100}px`;
        }
        tileDiv.addEventListener('click', () => moveTile(idx));
        puzzle.appendChild(tileDiv);
    });
}

function getTiles() {
    return Array.from(document.querySelectorAll('.tile')).map(t => +t.dataset.tile);
}

function isSolved(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
}

function moveTile(idx) {
    if (!gameActive) return;
    const tiles = getTiles();
    const emptyIdx = tiles.indexOf(0);
    const validMoves = [
        emptyIdx - 1, emptyIdx + 1,
        emptyIdx - PUZZLE_SIZE, emptyIdx + PUZZLE_SIZE
    ];
    if (!validMoves.includes(idx)) return;
    // Prevent wrap-around
    if (idx === emptyIdx - 1 && emptyIdx % PUZZLE_SIZE === 0) return;
    if (idx === emptyIdx + 1 && idx % PUZZLE_SIZE === 0) return;
    // Swap
    const puzzle = document.getElementById('puzzle');
    const children = Array.from(puzzle.children);
    [children[emptyIdx].dataset.tile, children[idx].dataset.tile] = [children[idx].dataset.tile, children[emptyIdx].dataset.tile];
    // Update classes and backgrounds
    children.forEach((tileDiv, i) => {
        const tile = +tileDiv.dataset.tile;
        tileDiv.className = 'tile' + (tile === 0 ? ' empty' : '');
        tileDiv.tabIndex = tile === 0 ? -1 : 0;
        if (tile !== 0) {
            const x = (tile - 1) % PUZZLE_SIZE;
            const y = Math.floor((tile - 1) / PUZZLE_SIZE);
            tileDiv.style.backgroundImage = `url('${IMAGE_URL}')`;
            tileDiv.style.backgroundSize = `${PUZZLE_SIZE * 100}px ${PUZZLE_SIZE * 100}px`;
            tileDiv.style.backgroundPosition = `-${x * 100}px -${y * 100}px`;
        } else {
            tileDiv.style.backgroundImage = '';
        }
    });
    // Check win
    if (isSolved(getTiles())) {
        endGame(true);
    }
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    timeLeft = seconds;
    const timerDiv = document.getElementById('timer');
    timerDiv.style.display = '';
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerDiv = document.getElementById('timer');
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerDiv.textContent = `Time left: ${min}:${sec.toString().padStart(2, '0')}`;
}

function endGame(won) {
    gameActive = false;
    clearInterval(timerInterval);
    document.getElementById('timer').style.display = '';
    document.getElementById('win').style.display = won ? 'block' : 'none';
    document.getElementById('lose').style.display = won ? 'none' : 'block';
    // Disable all tiles
    document.querySelectorAll('.tile').forEach(btn => btn.disabled = true);
}

function startGame(difficulty) {
    // Set puzzle size and timer
    if (difficulty === 'easy') {
        PUZZLE_SIZE = 3;
        TIMER_SECONDS = 5 * 60;
    } else if (difficulty === 'medium') {
        PUZZLE_SIZE = 3;
        TIMER_SECONDS = 4 * 60;
    } else if (difficulty === 'hard') {
        PUZZLE_SIZE = 4;
        TIMER_SECONDS = 3 * 60;
    }
    // Hide difficulty buttons
    document.getElementById('difficulty').style.display = 'none';
    // Hide win/lose
    document.getElementById('win').style.display = 'none';
    document.getElementById('lose').style.display = 'none';
    // Show puzzle and timer
    document.getElementById('puzzle').style.display = '';
    document.getElementById('timer').style.display = '';
    // Set puzzle grid size
    const puzzle = document.getElementById('puzzle');
    puzzle.style.gridTemplateColumns = `repeat(${PUZZLE_SIZE}, 100px)`;
    puzzle.style.gridTemplateRows = `repeat(${PUZZLE_SIZE}, 100px)`;
    puzzle.style.width = `${PUZZLE_SIZE * 100 + (PUZZLE_SIZE - 1) * 2}px`;
    // Create puzzle
    createPuzzle();
    // Enable tiles
    setTimeout(() => {
        document.querySelectorAll('.tile').forEach(btn => btn.disabled = false);
    }, 10);
    // Start timer
    gameActive = true;
    startTimer(TIMER_SECONDS);
}

// Difficulty button listeners
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('difficulty').style.display = '';
    document.getElementById('puzzle').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
    document.getElementById('win').style.display = 'none';
    document.getElementById('lose').style.display = 'none';
    document.querySelectorAll('#difficulty button').forEach(btn => {
        btn.addEventListener('click', function() {
            startGame(btn.dataset.diff);
        });
    });
});
