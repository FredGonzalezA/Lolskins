const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const NamedRegExp = require('named-regexp-groups')
const regex = new NamedRegExp('(?<link>https?:\/\/.+(?<version>ModSkin_.+)\.zip)([^a-zA-Z0-9_])');
const path = require('path');
const url = require('url');
let mainWindow;
let http = require('http');
let options = {
    host: 'leagueskin.net',
    path: '/p/download-mod-skin-2020-chn'
};
let download = require('download-file')
let drct = {
    directory: "./Descargas",
    filename: "Lolskins.zip"
}

const {ipcMain} = require('electron')
const {dialog} = require('electron')

ipcMain.on('Abraham', (p1, p2) => {
    console.log('Recibiendo', p2)
    dialog.showOpenDialog({properties: ['openFile', 'multiSelections']})
})

callback = function (response) {
    var str = '';

    //another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been received, so we just print it out here
    response.on('end', function () {
        descargador(regex.exec(str));
    });
}

http.request(options, callback).end();


function descargador(str) {
    let lnk = '';
    lnk = str.groups.link;
    download(lnk, drct, function(err){
        if (err) throw err
        console.log("meow")
    })


}


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);

    mainWindow.webContents.openDevTools();
    mainWindow.setResizable(false);

    mainWindow.on('closed', function () {

        mainWindow = null
    })

}


app.on('ready', createWindow);


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});




