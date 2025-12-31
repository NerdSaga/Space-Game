import { assets } from "./assets.js"
import { game } from "./game.js"
import { AnimatedSprite } from "./graphics.js"
import { input } from "./input.js"
import { physics, PhysicsObject } from "./physics.js"

/** @abstract */
export class Entity {

    id = -1

    /** @abstract */
    ready() {}

    /**
     * @abstract
     * @param {number} deltaTime 
     */
    update(deltaTime) {}

    /**
     * @abstract
     * @param {CanvasRenderingContext2D} gfx 
     */
    render(gfx) {}
}

export class Spatial extends Entity {

    position = {
        x: 0,
        y: 0,
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        super()
        this.position.x = x
        this.position.y = y
    }
}

export class Background extends Entity {

    #scroll1 = 0
    #scrollSpeed1 = 5

    #scroll2 = 0
    #scrollSpeed2 = 20

    #imageWidth = 160

    ready() {

    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {

        this.#scroll1 -= this.#scrollSpeed1 * deltaTime
        if (this.#scroll1 < -this.#imageWidth) {
            this.#scroll1 = 0
        }

        this.#scroll2 -= this.#scrollSpeed2 * deltaTime
        if (this.#scroll2 < -this.#imageWidth) {
            this.#scroll2 = 0
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     */
    render(gfx) {
        gfx.drawImage(assets.images.backgroundStars, Math.floor(this.#scroll1), 0)
        gfx.drawImage(assets.images.backgroundStars, Math.floor(this.#scroll1) + 160, 0)
        gfx.drawImage(assets.images.backgroundStars, Math.floor(this.#scroll1) + 160 * 2, 0)

        gfx.drawImage(assets.images.backgroundPlanet, Math.floor(this.#scroll2), 0)
        gfx.drawImage(assets.images.backgroundPlanet, Math.floor(this.#scroll2) + 160, 0)
        gfx.drawImage(assets.images.backgroundPlanet, Math.floor(this.#scroll2) + 160 * 2, 0)
    }
}

export class Label extends Spatial {

    text = ""

    ready() {
    
    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     */
    render(gfx) {
        
        for (let i = 0; i < this.text.length; i++) {
            const charCode = this.text.charCodeAt(i)
            const posY = parseInt(charCode / 16) * 8
            const posX = charCode % 16 * 8

            gfx.drawImage(assets.images.pixelFont, posX, posY, 8, 8, this.position.x + (i * 8), this.position.y, 8, 8)
        }

    }

    constructor(text, x, y) {
        super(x, y)
        this.text = text
    }
}

export class Player extends Spatial {

    /** @type {AnimatedSprite} */
    #sprite = null
    #moveSpeed = 80
    #velocity = {
        x: 0,
        y: 0,
    }
    #shootCooldown = 0

    /** @type { PhysicsObject } */
    #physics = null

    ready() {
        this.#sprite = new AnimatedSprite(
            assets.images.sprites,
            16, 16,
            3,
            4,
            0.5,
            true
        )
        this.#physics = new PhysicsObject("player", this, this.position.x, this.position.y, 16, 8, this.onCollide)
        physics.queueSpawn(this.#physics)
    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {

        // Update the player's velocity.
        this.#velocity.x = input.dir.x * this.#moveSpeed * deltaTime
        this.#velocity.y = input.dir.y * this.#moveSpeed * deltaTime

        // Apply the velocity to the player's position.
        this.position.x += this.#velocity.x
        this.position.y += this.#velocity.y

        // Confine the player's position to the screen.
        if (this.position.x < -32) {
            this.position.x = -32
        }
        if (this.position.x > 288) {
            this.position.x = 288
        }
        if (this.position.y < -16) {
            this.position.y = -16
        }
        if (this.position.y > 160) {
            this.position.y = 160
        }

        // Update shoot cooldown
        if (this.#shootCooldown > 0) {
            this.#shootCooldown -= 1 * deltaTime
        }

        // Shoot
        if (input.shoot == 1 && this.#shootCooldown <= 0) {
            const bullet = new Bullet("playerBullet", this.position.x + 10, this.position.y, 125, 0)
            game.queueSpawn(bullet)
            this.#shootCooldown = 0.25
        }

        // Animate player sprite.
        if (input.dir.y == 0) {
            this.#sprite.currentFrame = 1
        }
        if (input.dir.y == -1) {
            this.#sprite.currentFrame = 2
        }
        if (input.dir.y == 1) {
            this.#sprite.currentFrame = 0
        }

        //
        this.#physics.x = Math.round(this.position.x)
        this.#physics.y = Math.round(this.position.y + 3)
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     */
    render(gfx) {
        this.#sprite.draw(gfx, this.position.x, this.position.y)
        // this.#physics.draw(gfx)
    }

    /**
     * @param {Player} self 
     * @param {PhysicsObject} object 
     * 
     */
    onCollide(self, object) {
        if (object.name == "enemy") {
            const explosion = new Explosion(self.position.x, self.position.y)
            game.queueSpawn(explosion)
            game.queueDelete(self)
            physics.queueDelete(self.#physics)
        }

        
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        super(x, y)
    }
}

export class Flappy extends Spatial {

    /** @type { AnimatedSprite } */
    #sprite = null

    /** @type { PhysicsObject } */
    #physics = null

    ready() {
        this.#sprite = new AnimatedSprite(
            assets.images.sprites,
            16, 16,
            0,
            4,
            0.05,
            false,
        )

        this.#physics = new PhysicsObject("enemy", this, this.position.x, this.position.y, 12, 12, this.onCollide)
        physics.queueSpawn(this.#physics)
    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.position.x -= 30 * deltaTime
        this.#sprite.step(deltaTime)
        this.#physics.x = Math.round(this.position.x + 2)
        this.#physics.y = Math.round(this.position.y + 2)

        if (this.position.x < -32) {
            game.queueDelete(this)
            physics.queueDelete(this.#physics)
        }
    }

    /**
     * 
     * @param {number} gfx 
     */
    render(gfx) {
        this.#sprite.draw(gfx, this.position.x, this.position.y)
        // this.#physics.draw(gfx)
    }

    /**
     * 
     * @param {Flappy} self 
     * @param {PhysicsObject} object 
     */
    onCollide(self, object) {
        if (object.name == "playerBullet") {
            game.queueDelete(self)
            physics.queueDelete(self.#physics)

            const explosion = new Explosion(self.position.x, self.position.y)
            game.queueSpawn(explosion)
            game.stats.score += 5
        }
    }

    constructor(x, y) {
        super(x, y)
    }
}

export class Swoopy extends Spatial {

    /** @type { AnimatedSprite } */
    #sprite = null

    ready() {
        this.#sprite = new AnimatedSprite(
            assets.images.sprites,
            16,
            16,
            1,
            4,
            1,
            true,
        )
    }

    update(deltaTime) {
        this.#sprite.step(deltaTime)
    }

    render(gfx) {
        this.#sprite.draw(gfx, this.position.x, this.position.y)
    }
}

export class Bullet extends Spatial {

    name = "bullet"
    velocity = {
        x: 0,
        y: 0,
    }
    #life = 3

    /** @type { PhysicsObject } */
    #physics = null

    /** @type {AnimatedSprite} */
    #sprite = null
    #delete = false


    ready() {
        this.#sprite = new AnimatedSprite(
            assets.images.sprites,
            16, 16,
            2,
            4,
            0.1,
            false,
        )

        this.#physics = new PhysicsObject(this.name, this, this.position.x, this.position.y, 4, 4, this.onCollide)
        physics.queueSpawn(this.#physics)
    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.#sprite.step(deltaTime)
        this.position.x += this.velocity.x * deltaTime
        this.position.y += this.velocity.y * deltaTime
        this.#physics.x = this.position.x + 6
        this.#physics.y = this.position.y + 6 
        this.#life -= 1 * deltaTime
        if (this.#life <= 0) {
            this.#delete = true
        }

        if (this.#delete) {
            game.queueDelete(this)
            physics.queueDelete(this.#physics)
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     */
    render(gfx) {
        this.#sprite.draw(gfx, this.position.x, this.position.y)
        // this.#physics.draw(gfx)
    }

    /**
     * 
     * @param {Bullet} self 
     * @param {PhysicsObject} object 
     */
    onCollide(self, object) {
        self.#delete = true
    }


    /**
     * 
     * @param {string} name 
     * @param {number} x 
     * @param {number} y 
     * @param {number} vx 
     * @param {number} vy 
     */
    constructor(name, x, y, vx, vy) {
        super(x, y)
        this.name = name
        this.position.x = x
        this.position.y = y
        this.velocity.x = vx
        this.velocity.y = vy
    }
}

export class Explosion extends Spatial {

    /** @type {AnimatedSprite} */
    #sprite = null

    ready() {

        this.#sprite = new AnimatedSprite(
            assets.images.sprites,
            16, 16,
            4,
            5,
            0.05,
            true,
        )
    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {

        this.#sprite.step(deltaTime)

        if (this.#sprite.currentFrame == 4) {
            game.queueDelete(this)
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     */
    render(gfx) {
        
        this.#sprite.draw(gfx, this.position.x, this.position.y)
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        super(x, y)
    }
}

export class EnemySpawner extends Entity {

    #rect = {
        x: 288-70,
        y: 20,
        w: 64,
        h: 160 - 40,
    }
    #cooldown = 1

    ready() {

    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {
    }

    /**
     * 
     * @param {GameLevel} gameLevel 
     * @param {number} deltaTime 
     */
    step(gameLevel, deltaTime) {
        this.#cooldown -= 1 * deltaTime
        if (this.#cooldown <= 0) {
            // Spawn new enemy.

            const enemy = new Flappy(this.#rect.x + Math.random() * this.#rect.w, this.#rect.y + Math.random() * this.#rect.h)
            gameLevel.spawn(enemy)
            this.#cooldown = 1
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     */
    render(gfx) {
        gfx.fillStyle = "#ffffff22"
        gfx.fillRect(this.#rect.x, this.#rect.y, this.#rect.w, this.#rect.h)
    }
}

/** @abstract */
export class GameScene extends Entity {

    /** @type {Array<Entity>} */
    #gameObjects = []
    #entityDeleted = false

    end() {
        for (let i = 0; i < this.#gameObjects.length; i++) {
            this.delete(this.#gameObjects[i])
        }
        game.queueDelete(this)
        this.#gameObjects = null
    }

    update(deltaTime) {

        if (this.#entityDeleted)
        {
            for (let i = 0; i <= this.#gameObjects.length; i++) {
                const object = this.#gameObjects[i]
                if (object.id = -1) {
                    this.#gameObjects.splice(i, 1)
                }
            }
        }

    }

    spawn(entity) {
        game.queueSpawn(entity)
        this.#gameObjects.push(entity)
    }

    delete(entity) {
        game.queueDelete(entity)
        this.#entityDeleted = true
    }
}

export class GameLevel extends GameScene {

    /** @type {Label} */
    #scoreLabel = null

    /** @type {EnemySpawner} */
    #enemySpawner = null
    #score = 0

    ready() {

        const background = new Background()
        this.spawn(background)

        const player = new Player(50, 160/2 - 8)
        this.spawn(player)

        this.#enemySpawner = new EnemySpawner()
        this.spawn(this.#enemySpawner)

        this.#scoreLabel = new Label("0", 8, 8)
        this.spawn(this.#scoreLabel)
    }

    update(deltaTime) {
        this.#enemySpawner.step(this, deltaTime)
        this.#scoreLabel.text = "SCORE:" + String(game.stats.score)
    }
}