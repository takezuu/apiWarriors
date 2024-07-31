const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');

const cellSize = 60;
const mazeWidth = 20;
const mazeHeight = 10;
const mazeDepth = 3;
const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
];

const visibilityRadius = 3; // Радиус видимости
let darknessMode = true; // Переменная для режима темноты

const playerImg = new Image();
playerImg.src = 'static/player.png';

const teleportImg = new Image();
teleportImg.src = 'static/ladder.png'; // Иконка для точек телепортации

const exitImg = new Image();
exitImg.src = 'static/exit.png'; // Иконка для конечной точки

const wallImg = new Image();
wallImg.src = 'static/wall.png'; // Иконка для стен

const floorImg = new Image();
floorImg.src = 'static/floor.png'; // Иконка для пола

let maze = 0;
let playerPos = { level: 0, row: 0, col: 0 };
let startTime;
let currentFloorStartTime;
let timerId;  // Новый идентификатор таймера

document.addEventListener('keydown', handleKeyPress);

async function getMapData() {
    try {
        const response = await fetch('/map');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}



window.onhold = function() {

// Пример использования функции
	getMapData().then(data => {
		if (data) {
			// Записываем данные в переменную
			maze = data;
	//        console.log(maze);
			drawMaze();
		}
});};


function handleKeyPress(event) {
    if (!startTime) {
        startTime = Date.now();
        currentFloorStartTime = Date.now();
        updateTimer();
    }

    const newPos = { ...playerPos };
    if (event.key === 'ArrowLeft') {
        newPos.col--;
    } else if (event.key === 'ArrowRight') {
        newPos.col++;
    } else if (event.key === 'ArrowUp') {
        newPos.row--;
    } else if (event.key === 'ArrowDown') {
        newPos.row++;
    } else if (event.key === 'd') {
        darknessMode = !darknessMode;
        drawMaze();
        return;
    }

    if (newPos.row >= 0 && newPos.row < mazeHeight &&
        newPos.col >= 0 && newPos.col < mazeWidth &&
        maze[newPos.level][newPos.row][newPos.col] !== 0) {
        playerPos = newPos;

        if (maze[newPos.level][newPos.row][newPos.col] === 2) {
            teleportPlayer();
        } else if (newPos.level === mazeDepth - 1 && newPos.row === mazeHeight - 1 && newPos.col === mazeWidth - 1) {
            displayCompletionMessage();
        }
    }

    drawMaze();
}

function teleportPlayer() {
    const newLevel = (playerPos.level + 1) % mazeDepth;
    for (let row = 0; row < mazeHeight; row++) {
        for (let col = 0; col < mazeWidth; col++) {
            if (maze[newLevel][row][col] === 1) {
                playerPos.level = newLevel;
                playerPos.row = row;
                playerPos.col = col;
                return;
            }
        }
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = `Time: ${elapsed}s`;
    timerId = requestAnimationFrame(updateTimer);
}

function displayCompletionMessage() {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    messageElement.textContent = `Congratulations! You completed the maze in ${totalTime} seconds.`;
    document.removeEventListener('keydown', handleKeyPress);
    cancelAnimationFrame(timerId);  // Остановка таймера
}

function drawMaze() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#141414'; // Темно-серый фон
    context.fillRect(0, 0, canvas.width, canvas.height);

    const currentLevel = playerPos.level;

    for (let row = 0; row < mazeHeight; row++) {
        for (let col = 0; col < mazeWidth; col++) {
            const distance = Math.abs(row - playerPos.row) + Math.abs(col - playerPos.col);
            if (!darknessMode || distance <= visibilityRadius) {
                if (maze[currentLevel][row][col] === 0) {
                    context.drawImage(wallImg, col * cellSize, row * cellSize, cellSize, cellSize);
                } else {
                    context.drawImage(floorImg, col * cellSize, row * cellSize, cellSize, cellSize);
                }

                if (maze[currentLevel][row][col] === 2) {
                    context.drawImage(teleportImg, col * cellSize, row * cellSize, cellSize, cellSize);
                }
                if (currentLevel === mazeDepth - 1 && row === mazeHeight - 1 && col === mazeWidth - 1) {
                    context.drawImage(exitImg, col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    // Рисуем игрока
	context.drawImage(playerImg, playerPos.col * cellSize, playerPos.row * cellSize, cellSize, cellSize);
}


