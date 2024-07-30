from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import random
from fastapi.responses import FileResponse
import asyncio

app = FastAPI()

templates = Jinja2Templates(directory='apiWarriors')


@app.get("/", response_class=FileResponse)
async def maze():
    return "maze.html"


@app.get("/static/game.js", response_class=FileResponse)
async def maze():
    return "static/game.js"


@app.get("/static/test.js", response_class=FileResponse)
async def maze():
    return "static/test.js"


@app.get("/static/player.png", response_class=FileResponse)
async def maze():
    return "static/player.png"


@app.get("/static/ladder.png", response_class=FileResponse)
async def maze():
    return "static/ladder.png"


@app.get("/static/exit.png", response_class=FileResponse)
async def maze():
    return "static/exit.png"
    
@app.get("/favicon.ico", response_class=FileResponse)
async def maze():
    return "favicon.ico"


@app.get("/static/wall.png", response_class=FileResponse)
async def maze():
    return "static/wall.png"

@app.get("/static/styles.css", response_class=FileResponse)
async def maze():
    return "static/styles.css"


@app.get("/static/floor.png", response_class=FileResponse)
async def maze():
    return "static/floor.png"



directions = [
    (-1, 0), (1, 0), (0, -1), (0, 1)
]


def shuffle(array):
    random.shuffle(array)

@app.get("/map", )
async def generate_maze():
    width = 20
    height = 10
    depth = 3
    maze = [[[0 for _ in range(width)] for _ in range(height)] for _ in range(depth)]

    for d in range(depth):
        stack = [(0, 0)]
        maze[d][0][0] = 1

        while stack:
            current = stack[-1]
            current_row, current_col = current
            neighbors = []

            shuffle(directions)

            for dr, dc in directions:
                new_row, new_col = current_row + dr, current_col + dc

                if 0 <= new_row < height and 0 <= new_col < width and maze[d][new_row][new_col] == 0:
                    count_walls = 0
                    for dr2, dc2 in directions:
                        check_row, check_col = new_row + dr2, new_col + dc2
                        if check_row < 0 or check_row >= height or check_col < 0 or check_col >= width or maze[d][check_row][check_col] == 0:
                            count_walls += 1

                    if count_walls >= 3:
                        neighbors.append((new_row, new_col))

            if neighbors:
                next_cell = random.choice(neighbors)
                stack.append(next_cell)
                maze[d][next_cell[0]][next_cell[1]] = 1
            else:
                stack.pop()

    for d in range(depth - 1):
        maze[d][random.randint(0, height - 1)][random.randint(0, width - 1)] = 2  # Set teleport points
    maze[depth - 1][height - 1][width - 1] = 3  # Mark end point
    
    return maze




