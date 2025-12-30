import { Entity } from "./game_objects"

export { physics, PhysicsObject }

class PhysicsEngine {

    /** @type {Array<PhysicsObject>} */
    physicsObjects = []

    /** @type {Array<PhysicsObject>} */
    #spawnQueue = []

    /** @type {Array<PhysicsObject>} */
    #deleteQueue = []

    update() {

        // Run through delete queue.
        if (this.#deleteQueue.length > 0) {

            for (let i = 0; i < this.#deleteQueue.length; i++) {

                const index = this.#deleteQueue[i].id
                this.physicsObjects[index].id = -1
            }

            this.#deleteQueue.splice(0, this.#deleteQueue.length)

            for (let i = 0; i < this.physicsObjects.length; i++) {
                const object = this.physicsObjects[i]

                if (object.id == -1) {
                    this.physicsObjects.splice(i, 1)
                }

                if (this.physicsObjects[i]) {
                    this.physicsObjects[i].id = i
                }
            }
        }

        // Run through spawn queue.
        if (this.#spawnQueue.length > 0) {

            for (let i = 0; i < this.#spawnQueue.length; i++) {

                const object = this.#spawnQueue[i]
                object.id = this.physicsObjects.length
                this.physicsObjects.push(object)
            }

            this.#spawnQueue.splice(0, this.#spawnQueue.length)
        }

        // Run through physics objects.
        for (let i = 0; i < this.physicsObjects.length; i++) {

            const object1 = this.physicsObjects[i]
            for (let j = 0; j < this.physicsObjects.length; j++) {

                
                const object2 = this.physicsObjects[j]

                if (object1.id == object2.id) {
                    continue
                }

                if (this.#checkCollision(object1, object2)) {
                    object1.onCollide(object1.entity, object2)
                }

            }
        }

    }

    /**
     * 
     * @param { PhysicsObject } object1 
     * @param { PhysicsObject } object2 
     * @returns 
     */
    #checkCollision(object1, object2) {

        let checkX = false
        let checkY = false

        if ((object1.x >= object2.x && object1.x <= object2.x + object2.w) || (object2.x >= object1.x && object2.x < object1.x + object1.w)) {
            checkX = true
        }

        if ((object1.y > object2.y && object1.y < object2.y + object2.h) || (object2.y >= object1.y && object2.y <= object1.y + object1.h)) {
            checkY = true
        }



        return checkX && checkY
    }

    /**
     * 
     * @param {PhysicsObject} physicsObject 
     */
    queueSpawn(physicsObject) {
        this.#spawnQueue.push(physicsObject) // MARK: Make this
    }

    /**
     * 
     * @param {PhysicsObject} physicsObject 
     */
    queueDelete(physicsObject) {
        this.#deleteQueue.push(physicsObject)
    }
}



class PhysicsObject {

    id = -1
    name = "physicsObject"
    x = 0
    y = 0
    w = 0
    h = 0
    /** @type { Entity } */
    entity = null

    onCollide = (self, object) => {

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     */
    draw(gfx) {
        gfx.fillStyle = "#ffffff55"
        gfx.fillRect(this.x, this.y, this.w, this.h)
    }

    /**
     * 
     * @param {string} name 
     * @param {Entity} entity 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {Function} onCollide 
     */
    constructor(name, entity, x, y, w, h, onCollide) {

        this.name = name
        this.entity = entity
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.onCollide = onCollide
    }
}

const physics = new PhysicsEngine()