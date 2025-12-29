export { assets, loadAssets }

const assets = {
    images: {
        /** @type {HTMLImageElement} */
        sprites: null,

        /** @type {HTMLImageElement} */
        backgroundPlanet: null,

        /** @type {HTMLImageElement} */
        backgroundStars: null,

        /** @type {HTMLImageElement} */
        pixelFont: null,
    }
}

async function loadAssets() {

    {
        assets.images.sprites = new Image()
        assets.images.sprites.src = "./assets/sprites.png"
        await assets.images.sprites.decode()
    }

    {
        assets.images.backgroundPlanet = new Image()
        assets.images.backgroundPlanet.src = "./assets/background_planet.png"
        await assets.images.backgroundPlanet.decode()
    }

    {
        assets.images.backgroundStars = new Image()
        assets.images.backgroundStars.src = "./assets/background_stars.png"
        await assets.images.backgroundStars.decode()
    }

    {
        assets.images.pixelFont = new Image()
        assets.images.pixelFont.src = "./assets/pixel_font.png"
        await assets.images.pixelFont.decode()
    }
}