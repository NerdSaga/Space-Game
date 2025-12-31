import { loadAssets } from "./assets.js"
import { game } from "./game.js"
import { input } from "./input.js"
import { physics } from "./physics.js"

await loadAssets()

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameSurface")
const gfx = canvas.getContext("2d")


function onWindowResize(ev) {
    canvas.style.width = "100%"
    canvas.style.height = ""

    if (canvas.clientHeight > window.innerHeight) {
        canvas.style.width = ""
        canvas.style.height = "100%"
    }
}
window.addEventListener("resize", onWindowResize)
onWindowResize()


let then = 0
let now = 0
let deltaTime = 1

game.start()
function loop() {
    gfx.fillStyle = "#123456ff"
    gfx.fillRect(0, 0, canvas.width, canvas.height)
    game.update(gfx, deltaTime)
    physics.update()

    requestAnimationFrame(loop)
    now = performance.now()
    deltaTime = (now - then) / 1000
    then = now
}
requestAnimationFrame(loop)
// setInterval(loop, 1000 / 10)