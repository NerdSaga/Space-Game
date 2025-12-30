export { input }

const input = {

    moveUp: 0,
    moveDown: 0,
    moveLeft: 0,
    moveRight: 0,
    dir: {
        x: 0,
        y: 0,
    },
    shoot: 0,
}

function updateDirection() {
    input.dir.x = input.moveRight - input.moveLeft
    input.dir.y = input.moveDown - input.moveUp
}

addEventListener("keyup", (ev) => {

    if (ev.key == "w") {
        input.moveUp = 0
    }
    if (ev.key == "a") {
        input.moveLeft = 0
    }
    if (ev.key == "s") {
        input.moveDown = 0
    }
    if (ev.key == "d") {
        input.moveRight = 0
    }

    if (ev.key == " ") {
        input.shoot = 0
    }

    updateDirection()

})

addEventListener("keydown", (ev) => {

    if (ev.key == "w") {
        input.moveUp = 1
    }
    if (ev.key == "a") {
        input.moveLeft = 1
    }
    if (ev.key == "s") {
        input.moveDown = 1
    }
    if (ev.key == "d") {
        input.moveRight = 1
    }

    if (ev.key == " ") {
        input.shoot = 1
    }

    updateDirection()
})