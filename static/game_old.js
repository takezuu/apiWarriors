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

// Пример использования функции
getMapData().then(data => {
    if (data) {
        // Записываем данные в переменную
        maze = data;
//        console.log(maze);
	drawMaze();
    }
});




function generateMaze(width, height, depth) {
    const maze = Array.from({ length: depth }, () => 
        Array.from({ length: height }, () => 
            Array.from({ length: width }, () => 0)
        )
    );

    for (let d = 0; d < depth; d++) {
        const stack = [[0, 0]];
        maze[d][0][0] = 1;

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const [currentRow, currentCol] = current;
            const neighbors = [];

            shuffle(directions);

            for (const [dr, dc] of directions) {
                const newRow = currentRow + dr;
                const newCol = currentCol + dc;

                if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width && maze[d][newRow][newCol] === 0) {
                    let countWalls = 0;
                    for (const [dr2, dc2] of directions) {
                        const checkRow = newRow + dr2;
                        const checkCol = newCol + dc2;
                        if (checkRow < 0 || checkRow >= height || checkCol < 0 || checkCol >= width || maze[d][checkRow][checkCol] === 0) {
                            countWalls++;
                        }
                    }

                    if (countWalls >= 3) {
                        neighbors.push([newRow, newCol]);
                    }
                }
            }

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                stack.push(next);
                maze[d][next[0]][next[1]] = 1;
            } else {
                stack.pop();
            }
        }
    }

    for (let d = 0; d < depth - 1; d++) {
        maze[d][Math.floor(Math.random() * height)][Math.floor(Math.random() * width)] = 2; // Set teleport points
    }
    maze[depth - 1][height - 1][width - 1] = 3;  // Mark end point
    return maze;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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

    context.fillStyle = '#111111'; //  фон
    context.fillRect(0, 0, canvas.width, canvas.height);

    const currentLevel = playerPos.level;
    
    context.fillStyle = '#301406'; //  цвет для стен
    console.log(maze)
    for (let row = 0; row < mazeHeight; row++) {
        for (let col = 0; col < mazeWidth; col++) {
            const distance = Math.abs(row - playerPos.row) + Math.abs(col - playerPos.col);
            if (!darknessMode || distance <= visibilityRadius) {
		
		
                if (maze[currentLevel][row][col] === 0) {
                    context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
                // Телепорт
                if (maze[currentLevel][row][col] === 2) {
                    context.drawImage(teleportImg, col * cellSize, row * cellSize, cellSize, cellSize);
                }
                // Конечная точка
                if (currentLevel === mazeDepth - 1 && row === mazeHeight - 1 && col === mazeWidth - 1) {
                    context.drawImage(exitImg, col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    // Рисуем игрока
    context.drawImage(playerImg, playerPos.col * cellSize, playerPos.row * cellSize, cellSize, cellSize);
}

// Начальная отрисовка лабиринта
//drawMaze();
