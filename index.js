const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

const GRID_WIDTH = 100;
const GRID_HEIGHT = 100;

canvas.width = GRID_WIDTH * 10;
canvas.height = GRID_HEIGHT * 10;

let GRID = new Array(GRID_WIDTH * GRID_HEIGHT).fill(0);

function initializeGrid() {
    for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
        GRID[i] = Math.random() > 0.8 ? 1 : 0;
    }
}
initializeGrid();

function neighbornCount(x, y) {
    let liveCount = 0;
    for (let yO = y - 1; yO <= y + 1; yO++) {
        for (let xO = x - 1; xO <= x + 1; xO++) {
            if (xO >= 0 && xO < GRID_WIDTH && yO >= 0 && yO < GRID_HEIGHT) {
                liveCount += GRID[xO + GRID_WIDTH * yO];
            }
        }
    }
    return liveCount - GRID[x + GRID_WIDTH * y];
}

function simulationStep() {
    let TEMP = new Array(GRID_WIDTH * GRID_HEIGHT).fill(0);
    for (let y = 1; y < GRID_HEIGHT - 1; y++) {
        for (let x = 1; x < GRID_WIDTH - 1; x++) {
            let neighborCount = neighbornCount(x, y);
            let state = GRID[x + GRID_WIDTH * y];
            if (state === 0 && neighborCount === 3) {
                TEMP[x + GRID_WIDTH * y] = 1;
            } else if (state === 1 && (neighborCount === 2 || neighborCount === 3)) {
                TEMP[x + GRID_WIDTH * y] = 1;
            } else {
                TEMP[x + GRID_WIDTH * y] = 0;
            }
        }
    }
    GRID = TEMP;
}

function drawGrid() {
    const cellWidth = canvas.width / GRID_WIDTH;
    const cellHeight = canvas.height / GRID_HEIGHT;

    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const state = GRID[x + GRID_WIDTH * y];
            ctx.fillStyle = state === 1 ? 'black' : 'white';
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
    }
}

let isPlaying = false;

function animate() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    simulationStep();
    drawGrid();
    requestAnimationFrame(animate);
}


document.getElementById('playButton').addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        animate();
    }
    document.getElementById('drawButton').disabled = true;
});

document.getElementById('stopButton').addEventListener('click', () => {
    isPlaying = false;
    document.getElementById('drawButton').disabled = false;
});

isPlaying = true;
animate();

document.getElementById('drawButton').addEventListener('click', () => {

    const handleMouseDown = (event) => {
        event.preventDefault(); 
        const cellWidth = canvas.width / GRID_WIDTH;
        const cellHeight = canvas.height / GRID_HEIGHT;

        const x = Math.floor(event.offsetX / cellWidth);
        const y = Math.floor(event.offsetY / cellHeight); 

        if (event.button === 0) {
            GRID[x + GRID_WIDTH * y] = 1;
        } else if (event.button === 2) {
            GRID[x + GRID_WIDTH * y] = 0;
        }

        drawGrid();
    };

    canvas.addEventListener('mousedown', handleMouseDown);

    document.getElementById('stopButton').addEventListener('click', () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        document.getElementById('playButton').disabled = false;
    });
});