import { assets } from "./assets.js"
import { game } from "./game.js"
import { AnimatedSprite } from "./graphics.js"
import { input } from "./input.js"
import { PhysicsObject } from "./physics.js"

/** @abstract */
export class Entity {

    id = -1
    visible = true

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

    delete() {}
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
    #moveSpeed = 70
    #velocity = {
        x: 0,
        y: 0,
    }

    #shootCooldownBase = 0.25
    #shootCooldown = 0.25
    alive = true

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
        game.scene.physics.spawn(this.#physics)
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
            this.#shootCooldown -= deltaTime
        }

        // Shoot
        if (input.shoot == 1 && this.#shootCooldown <= 0) {
            const bullet = new Bullet("playerBullet", this.position.x + 10, this.position.y, 125, 0)
            game.scene.spawn(bullet)
            this.#shootCooldown = this.#shootCooldownBase
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
            game.scene.spawn(explosion)
            self.alive = false
            self.delete()
        }

        if (object.name == "enemyBullet") {
            const explosion = new Explosion(self.position.x, self.position.y)
            game.scene.spawn(explosion)
            self.alive = false
            self.delete()
        }

        
    }

    delete() {
        game.scene.free(this)
        game.scene.physics.free(this.#physics)
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
    #basePositionY = 0
    #basePositionX
    #orbitSpeed = 0.001
    #orbitRadius = 30
    #orbitDirection = 1
    #horizontalSpeed = 10
    #orbitStartRot = 0
    #shootCooldownBase = 5
    #shootCooldown = this.#shootCooldownBase
    #bulletSpeed = 80


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
        game.scene.physics.spawn(this.#physics)

        this.#orbitStartRot = Math.random() * 20
        this.#orbitSpeed = 0.001 + Math.random() * 0.002
        this.#orbitRadius = 5 + Math.random() * 10

        if (Math.random() > 0.5) {
            this.#orbitDirection = 1
        }
        else {
            this.#orbitDirection = -1
        }

        this.#horizontalSpeed = 30 + Math.random() * 40
        this.#shootCooldownBase = 4 + Math.random() * 10
        this.#shootCooldown = 2 + Math.random() * 2
    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.#basePositionX -= this.#horizontalSpeed * deltaTime
        this.position.x += this.#basePositionX

        // this.position.y = this.#basePositionY + (Math.sin(performance.now() * 0.001) * 30) + (Math.cos(performance.now() * 0.001) * 30)
        this.position.x = this.#basePositionX + Math.cos(performance.now() * this.#orbitSpeed * this.#orbitDirection + (this.#orbitStartRot)) * this.#orbitRadius
        this.position.y = this.#basePositionY + Math.sin(performance.now() * this.#orbitSpeed * this.#orbitDirection + (this.#orbitStartRot)) * this.#orbitRadius

        this.#physics.x = Math.round(this.position.x + 2)
        this.#physics.y = Math.round(this.position.y + 2)

        if (game.stats.player.position.x + 64 < this.position.x) {
            this.#shootCooldown -= deltaTime
            if (this.#shootCooldown <= 0) {

                let vel = [
                    game.stats.player.position.x - this.position.x,
                    game.stats.player.position.y - this.position.y,
                ]

                let mag = Math.sqrt(
                    Math.pow(vel[0], 2) + Math.pow(vel[1], 2)
                )
                vel[0] /= mag
                vel[1] /= mag

                vel[0] *= this.#bulletSpeed
                vel[1] *= this.#bulletSpeed

                const bullet = new Bullet("enemyBullet", this.position.x, this.position.y, vel[0], vel[1])
                game.scene.spawn(bullet)
                this.#shootCooldown = this.#shootCooldownBase
            }
        }


        this.#sprite.step(deltaTime)
        if (this.position.x < -32) {
            this.delete()
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

    delete() {
        game.scene.free(this)
        game.scene.physics.free(this.#physics)
    }

    /**
     * 
     * @param {Flappy} self 
     * @param {PhysicsObject} object 
     */
    onCollide(self, object) {
        if (object.name == "playerBullet") {
            game.scene.free(self)
            game.scene.physics.free(self.#physics)

            const explosion = new Explosion(self.position.x, self.position.y)
            game.scene.spawn(explosion)
            game.stats.score += 5
            object.entity.delete()
        }
    }

    constructor(x, y) {
        super(x, y)
        this.#basePositionX = x
        this.#basePositionY = y
    }
}

export class Swoopy extends Spatial {

    /** @type { AnimatedSprite } */
    #sprite = null

    /** @type { PhysicsObject } */
    #physics = null

    ready() {
        this.#sprite = new AnimatedSprite(
            assets.images.sprites,
            16,
            16,
            1,
            4,
            0.35,
            true,
        )

        this.#physics = new PhysicsObject("enemy", this, this.position.x, this.position.y, 16, 10, this.onCollide)
        game.scene.physics.spawn(this.#physics)
    }

    update(deltaTime) {

        this.#sprite.step(deltaTime)
        this.position.x += -165 * deltaTime

        if (this.position.x < -32) {
            this.delete()
        }

        this.#physics.x = this.position.x
        this.#physics.y = this.position.y + 2
    }

    render(gfx) {
        this.#sprite.draw(gfx, this.position.x, this.position.y)
        // this.#physics.draw(gfx)
    }

    delete() {
        game.scene.free(this)
        game.scene.physics.free(this.#physics)
    }


    onCollide(self, object) {
        if (object.name == "playerBullet") {
            game.scene.free(self)
            game.scene.physics.free(self.#physics)

            const explosion = new Explosion(self.position.x, self.position.y)
            game.scene.spawn(explosion)
            game.stats.score += 100
            object.entity.delete()
        }
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
        game.scene.physics.spawn(this.#physics)
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
            this.delete()
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
    }

    delete() {
        game.scene.free(this)
        game.scene.physics.free(this.#physics)
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
            game.scene.free(this)
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
        x: 288 + 16, //288 + 288,
        y: 0,
        w: 64,
        h: 160 - 16,
    }
    #cooldown = 0.0001
    #baseCooldown = 0.3

    /** @type { Array<Entity> } */
    #enemies = []

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
    step(deltaTime) {
        this.#cooldown -= deltaTime

        for (let i = 0; i < this.#enemies.length; i++) {
            let enemy = this.#enemies[i]
            while (enemy && enemy.id == -1) {
                this.#enemies.splice(i, 1)
                enemy = this.#enemies[i]
            }
        }

        if (this.#cooldown <= 0) {
            // Spawn new enemy.
            let enemy
            const rand = Math.random()
            if (rand < 0.25) {
                enemy = new Swoopy(this.#rect.x + Math.random() * this.#rect.w, this.#rect.y + Math.random() * this.#rect.h)
            }
            else
            {
                enemy = new Flappy(this.#rect.x + Math.random() * this.#rect.w, this.#rect.y + Math.random() * this.#rect.h)
            }
            // gameLevel.spawn(enemy)
            game.scene.spawn(enemy)
            this.#enemies.push(enemy)
            this.#cooldown = this.#baseCooldown
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