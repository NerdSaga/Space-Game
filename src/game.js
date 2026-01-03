import { Player } from "./game_objects.js"
import { GameLevel, Scene, TitleScreen } from "./game_scenes.js"

class Game {

    /** @type { Scene } */
    scene = null
    #loadSceneQueue = null

    stats = {
        score: 0,
        highScore: 0,

        /** @type { Player } */
        player: null
    }
    #saveData = {
        highScore: 0
    }

    start() {
        let saveDataJson = localStorage.getItem("save_data")
        if (!saveDataJson || saveDataJson == 'undefined') {
            saveDataJson = JSON.stringify(this.#saveData)
        }

        const prevSaveData = JSON.parse(saveDataJson)
        this.stats.highScore = prevSaveData.highScore
        
        this.loadScene(new TitleScreen())
    }

    update(deltaTime, gfx) {

        if (this.#loadSceneQueue) {
            if (this.scene) {
                this.scene.end()
            }
            this.scene = this.#loadSceneQueue
            this.#loadSceneQueue = null
            this.scene.start()
        }

        this.scene.update(deltaTime, gfx)
    }

    loadScene(scene) {
        game.stats.player = null
        this.#loadSceneQueue = scene
    }

    save() {
        if (this.stats.score > this.stats.highScore) {
            this.#saveData.highScore = this.stats.score
            this.stats.highScore = this.stats.score
        }
        
        const jsonData = JSON.stringify(this.#saveData)
        localStorage.setItem("save_data", jsonData)
    }
}

export const game = new Game()