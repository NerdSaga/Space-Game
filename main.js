import { app, BrowserWindow } from "electron";


app.whenReady().then(() => {

    const window = new BrowserWindow({
        width: 1366,
        height: 768,
        autoHideMenuBar: true,
    })

    window.loadFile("index.html")
})