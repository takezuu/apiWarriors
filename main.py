from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import random
from fastapi.responses import FileResponse

app = FastAPI()

templates = Jinja2Templates(directory='templates')


@app.get("/", response_class=HTMLResponse)
async def maze(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("maze.html", context)


@app.get("/map")
async def generate_maze():
    width = height = 10
    depth = 3
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    g_maze = [[[0 for _ in range(width)] for _ in range(height)] for _ in range(depth)]

    for d in range(depth):
        stack = [(0, 0)]
        g_maze[d][0][0] = 1

        while stack:
            current = stack[-1]
            current_row, current_col = current
            neighbors = []

            for i in range(len(directions) - 1, 0, -1):
                j = random.randint(0, i)
                directions[i], directions[j] = directions[j, directions[i]]

            for dr, dc in directions:
                new_row = current_row + dr
                new_col = current_col + dc

                if height > new_row >= 0 == g_maze[d][new_row][new_col] and 0 <= new_col < width:
                    count_walls = 0
                    for dr2, dc2 in directions:
                        check_row = new_row + dr2
                        check_col = new_col + dc2
                        if (check_row < 0 or check_row >= height or
                                check_col < 0 or check_col >= width or
                                g_maze[d][check_row][check_col] == 0):
                            count_walls += 1

                    if count_walls >= 3:
                        neighbors.append((new_row, new_col))

            if neighbors:
                next_cell = random.choice(neighbors)
                stack.append(next_cell)
                g_maze[d][next_cell[0]][next_cell[1]] = 1
            else:
                stack.pop()

    for d in range(depth - 1):
        g_maze[d][random.randint(0, height - 1)][random.randint(0, width - 1)] = 2  # Set teleport points

    g_maze[depth - 1][height - 1][width - 1] = 3  # Mark end point

    return g_maze
