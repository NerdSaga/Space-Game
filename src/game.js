import { Background, Bullet, Entity, Flappy, GameLevel, Label, Player, Swoopy } from "./game_objects.js"

class Game {

    /** @type { Array<Entity> } */
    gameObjects = []

    stats = {
        score: 0
    }

    saveData = {
        highScore: 0
    }

    /** @type { Array<Entity> } */
    #spawnQueue = []

    /** @type { Array<Entity> } */
    #deleteQueue = []

    /** @type { Array<Entity> } */
    #readyQueue = []

    start() {

        const gameLevel = new GameLevel()
        this.queueSpawn(gameLevel)
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
                let object = this.gameObjects[i]

                while (object && object.id == -1) {

                    this.gameObjects.splice(i, 1)
                    object = this.gameObjects[i]
                }

                if (this.gameObjects[i] && this.gameObjects[i].id != -1) {
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