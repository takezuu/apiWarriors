from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse

app = FastAPI()

templates = Jinja2Templates(directory='templates')


@app.get("/", response_class=HTMLResponse)
async def maze(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("maze.html", context)


# @app.get("/static/game.js", response_class=HTMLResponse)
# async def game(request: Request):
#     context = {'request': request}
#     return templates.TemplateResponse("static/game.js", context)

@app.get("/static/game.js", response_class=FileResponse)
async def player():
    return "templates/static/game.js"


@app.get("/static/player.png", response_class=FileResponse)
async def player():
    return "templates/static/player.png"


@app.get("/static/ladder.png", response_class=FileResponse)
async def ladder():
    return "templates/static/ladder.png"


@app.get("/static/exit.png", response_class=FileResponse)
async def exit_png():
    return "templates/static/exit.png"


@app.get("/favicon.ico", response_class=FileResponse)
async def favicon():
    return "templates/static/favicon.ico"
