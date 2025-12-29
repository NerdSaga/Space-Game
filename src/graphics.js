export { Drawable, AnimatedSprite }
/** @abstract */
class Drawable {

    /**
     * @param {CanvasRenderingContext2D} gfx 
     */
    /** @abstract */
    draw(gfx) {}
}

class AnimatedSprite {

    /** @type { HTMLImageElement } */
    #image = null
    #tileSizeX = 16
    #tileSizeY = 16
    #row = 0
    #frameCount = 4
    #oneShot = true

    #timePerFrame
    currentFrame = 0
    #counter = 0


    /**
     * 
     * @param {number} time 
     */
    step(time) {
        this.#counter += time
        if (this.#counter > this.#timePerFrame) {
            this.#counter = 0

            this.currentFrame += 1

            if (this.#oneShot && this.currentFrame >= this.#frameCount) {
                this.currentFrame = this.#frameCount - 1
            }

            if (!this.#oneShot && this.currentFrame >= this.#frameCount) {
                this.currentFrame = 0
            }
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} gfx 
     */
    draw(gfx, x, y) {
        gfx.drawImage(
            this.#image,
            this.currentFrame * this.#tileSizeX, this.#row * this.#tileSizeY,
            this.#tileSizeX, this.#tileSizeY,
            Math.round(x), Math.round(y), 16, 16
        )
    }

    /**
     * 
     * @param {HTMLImageElement} image 
     * @param {number} tileSizeX 
     * @param {number} tileSizeY 
     * @param {number} startRow 
     * @param {number} frameCount 
     * @param {number} timePerFrame 
     * @param {boolean} oneShot 
     */
    constructor(image, tileSizeX, tileSizeY, startRow, frameCount, timePerFrame, oneShot) {
        this.#image = image
        this.#tileSizeX = tileSizeX
        this.#tileSizeY = tileSizeY
        this.#row = startRow
        this.#frameCount = frameCount
        this.#oneShot = oneShot
        this.#timePerFrame = timePerFrame
    }
}