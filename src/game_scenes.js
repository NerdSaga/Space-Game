import { game } from "./game.js"
import { Background, EnemySpawner, Entity, Flappy, Label, Player } from "./game_objects.js"
import { input } from "./input.js"
import { PhysicsEngine } from "./physics.js"

export { Scene, TitleScreen, GameLevel }

/** @abstract */
class Scene {

    physics = new PhysicsEngine()
    /** @type { Array<Entity> } */
    #entities = []

    /** @type { Array<Entity> } */
    #readyQueue = []

    #hasQueueDelete = false

    /** @type { Array<Entity> } */
    #spawnQueue = []

    /**
     *
     * @param {number} deltaTime 
     * @param {CanvasRenderingContext2D} gfx 
     */
    update(deltaTime, gfx) {

        this.physics.update()

        // Run through free queue.
        if (this.#hasQueueDelete) {

            for (let i = 0; i < this.#entities.length; i++) {

                let entity = this.#entities[i]

                while (entity && entity.id < 0) {

                    this.#entities.splice(i, 1)
                    entity = this.#entities[i]
                }
            }
        }

        // Run through spawn queue.
        if (this.#spawnQueue.length > 0) {

            for (let i = 0; i < this.#spawnQueue.length; i++) {

                const entity = this.#spawnQueue[i]
                entity.id = this.#entities.length
                this.#entities.push(entity)
                this.#readyQueue.push(entity)
            }

            this.#spawnQueue.splice(0, this.#spawnQueue.length)
        }


        // Run through ready queue.
        if (this.#readyQueue.length > 0) {

            for (let i = 0; i < this.#readyQueue.length; i++) {

                const entity = this.#readyQueue[i]
                entity.ready()
            }

            this.#readyQueue.splice(0, this.#readyQueue.length)
        }

        // Update entities.
        for (let i = 0; i < this.#entities.length; i++) {

            const entity = this.#entities[i]
            entity.update(deltaTime)
        }

        // Render entities.
        for (let i = 0; i < this.#entities.length; i++) {

            const entity = this.#entities[i]

            if (!entity.visible) { continue }

            entity.render(gfx)
        }

    }

    /** @abstract */
    start() {}

    end() {
        
        this.#entities.splice(0, this.#entities.length)
        this.#readyQueue.splice(0, this.#readyQueue.length)
        this.#spawnQueue.splice(0, this.#spawnQueue.length)

        this.physics.physicsObjects.splice(0, this.physics.physicsObjects.length)
    }

    /**
     * 
     * @param {Entity} entity 
     */
    spawn(entity) {
        this.#spawnQueue.push(entity)
    }

    /**
     * 
     * @param { Entity } entity 
     */
    free(entity) {
        entity.id = -1
        this.#hasQueueDelete = true
    }
}

class TitleScreen extends Scene {

    #startingGame = false

    /** @type { Label } */
    #startLabel = null
    #startLabelCountdownBase = 0.75
    #startLabelCountdown = this.#startLabelCountdownBase

    start() {
        this.#startLabel = new Label("PRESS SPACE 2 START", 288/2 - 19*4, 160/2)
        this.#startLabel.visible = false

        this.spawn(new Background())
        this.spawn(this.#startLabel)
    }

    update(deltaTime, gfx) {
        super.update(deltaTime, gfx)

        if (input.shoot > 0) {
            this.startGame()
        }

        if (this.#startLabelCountdown <= 0) {
            this.#startLabelCountdown = this.#startLabelCountdownBase
            this.#startLabel.visible = !this.#startLabel.visible
        }

        this.#startLabelCountdown -= deltaTime
    }

    startGame() {
        game.loadScene(new GameLevel())
    }
}

class GameLevel extends Scene {

    /** @type { EnemySpawner } */
    #enemySpawner = null
    #scoreLabel = new Label("SCORE: ", 8, 8)
    #player = new Player(32, 160/2 - 8)

    #endGameCountdownBase = 5
    #endGameCountdown = this.#endGameCountdownBase

    start() {
        this.spawn(new Background())
        this.spawn(this.#scoreLabel)
        this.spawn(this.#player)

        this.#enemySpawner = new EnemySpawner()
        this.spawn(this.#enemySpawner)
    }

    update(deltaTime, gfx) {
        super.update(deltaTime, gfx)
        this.#enemySpawner.step(deltaTime)
        this.#scoreLabel.text = "SCORE:" + String(game.stats.score)

        if (!this.#player.alive) {
            this.#endGameCountdown -= deltaTime
        }

        if (this.#endGameCountdown <= 0) {
            game.loadScene(new TitleScreen())
        }
    }
}