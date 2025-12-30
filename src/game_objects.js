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

        this.#velocity.x = input.dir.x * this.#moveSpeed * deltaTime
        this.#velocity.y = input.dir.y * this.#moveSpeed * deltaTime

        this.position.x += this.#velocity.x
        this.position.y += this.#velocity.y

        if (input.dir.y == 0) {
            this.#sprite.currentFrame = 1
        }
        if (input.dir.y == -1) {
            this.#sprite.currentFrame = 2
        }
        if (input.dir.y == 1) {
            this.#sprite.currentFrame = 0
        }

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
        }

        physics.queueDelete(self.#physics)
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
        this.#sprite.step(deltaTime)
        this.#physics.x = this.position.x + 2
        this.#physics.y = this.position.y + 2
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

export class Explosion extends Spatial {

    /** @type {AnimatedSprite} */
    #sprite = null

    ready() {

        this.#sprite = new AnimatedSprite(
            assets.images.sprites,
            16, 16,
            4,
            4,
            0.1,
            true,
        )
    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {

        this.#sprite.step(deltaTime)

        if (this.#sprite.currentFrame == 3) {
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