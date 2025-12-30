import { Background, Bullet, Entity, Flappy, Label, Player, Swoopy } from "./game_objects.js"

class Game {

    /** @type { Array<Entity> } */
    gameObjects = []

    /** @type { Array<Entity> } */
    #spawnQueue = []

    /** @type { Array<Entity> } */
    #deleteQueue = []

    /** @type { Array<Entity> } */
    #readyQueue = []

    start() {
        const backgroud = new Background()
        this.queueSpawn(backgroud)

        const player = new Player(64, 64)
        this.queueSpawn(player)

        const label = new Label("12 29 2025", 8, 8)
        this.queueSpawn(label)

        const flappy = new Flappy(288 - 50, 60)
        this.queueSpawn(flappy)

        const swoopy = new Swoopy(288 - 50, 60 + 20)
        this.queueSpawn(swoopy)
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     * @param {number} deltaTime 
     */
    update(gfx, deltaTime) {


        // Run through delete queue. MARK: TEST
        if (this.#deleteQueue.length > 0) {

            for (let i = 0; i < this.#deleteQueue.length; i++) {

                const index = this.#deleteQueue[i].id
                this.gameObjects[index].id = -1
            }

            this.#deleteQueue.splice(0, this.#deleteQueue.length)

            for (let i = 0; i < this.gameObjects.length; i++) {
                const object = this.gameObjects[i]

                if (object.id == -1) {
                    this.gameObjects.splice(i, 1)
                }

                if (this.gameObjects[i]) {
                    this.gameObjects[i].id = i
                }

            }
        }

        // Run through spawn queue.
        if (this.#spawnQueue.length > 0) {
            for (let i = 0; i < this.#spawnQueue.length; i++) {

                const object = this.#spawnQueue[i]
                object.id = this.gameObjects.length
                this.gameObjects.push(object)
                this.#readyQueue.push(object)
            }

            this.#spawnQueue.splice(0, this.#spawnQueue.length)
        }

        if (this.#readyQueue.length > 0) {
            for (let i = 0; i < this.#readyQueue.length; i++) {
                const object = this.#readyQueue[i]
                object.ready()
            }

            this.#readyQueue.splice(0, this.#readyQueue.length)
        }

        // Update.
        for (let i = 0; i < this.gameObjects.length; i++) {

            const object = this.gameObjects[i]
            object.update(deltaTime)
        }

        // Render.
        for (let i = 0; i < this.gameObjects.length; i++) {

            const object = this.gameObjects[i]
            object.render(gfx)
        }
    }

    /**
     * 
     * @param {Entity} entity 
     */
    queueSpawn(entity) {
        this.#spawnQueue.push(entity)
    }

    /**
     * 
     * @param {Entity} entity 
     */
    queueDelete(entity) {
        this.#deleteQueue.push(entity)
    }
}

export const game = new Game()