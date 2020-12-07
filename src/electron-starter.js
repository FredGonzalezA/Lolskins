const electron = require('electron');
const app = electron.app;
const mkdirp = require('mkdirp')
const BrowserWindow = electron.BrowserWindow;
const NamedRegExp = require('named-regexp-groups')
const regex = new NamedRegExp('(?<link>https?:\/\/.+(?<version>ModSkin_.+)\.zip)([^a-zA-Z0-9_])');
const path = require('path');
const https = require('https')
const {ipcMain} = require('electron')
const {dialog} = require('electron')
const extract = require('extract-zip')
const yauzl = require("yauzl")
let url = require('url');
let fs = require('fs');
let mainWindow;
let http = require('http');
let progressBar = require("electron-progressbar");
let options = {
    host: 'leagueskin.net',
    path: '/p/download-mod-skin-2020-chn'
};
let drct = {
    directory: " ",
    filename: "Lolskins.zip"
}
let dircc = '';
let exec = require('child_process').execFile;
let received_bytes = 0;
let total_bytes = 0;

function fuckuabraham(received, total) {


    const percentage = (received * 100) / total;
    console.log(percentage + "% | " + received + " bytes de " + total + " bytes.");
    const windows = BrowserWindow.getAllWindows()

    if(windows.length > 0) {
        windows[0].webContents.send('carga', percentage)
    }

}


function download(file, options, callback) {


    if (!file) throw("Need a file url to download")

    if (!callback && typeof options === 'function') {
        callback = options
    }

    options = typeof options === 'object' ? options : {}
    options.timeout = options.timeout || 20000
    options.directory = options.directory ? options.directory : '.'

    const uri = file.split('/');
    options.filename = options.filename || uri[uri.length - 1]

    const path = options.directory + "/" + options.filename;

    let req;
    if (url.parse(file).protocol === null) {
        file = 'http://' + file
        req = http
    } else if (url.parse(file).protocol === 'https:') {
        req = https
    } else {
        req = http
    }

    const request = req.get(file, function (response) {

        if (response.statusCode === 200) {

            mkdirp(options.directory, err => {
                if (err) throw err
                const file = fs.createWriteStream(path);
                response.pipe(file)
                total_bytes = parseInt(response.headers['content-length']);
                response.on('data', function (chunk) {
                    // Update the received bytes
                    received_bytes += chunk.length;
                    fuckuabraham(received_bytes, total_bytes);
                });
            })


        } else {

            if (callback) callback(response.statusCode)

        }

        response.on("end", function () {
            if (callback) callback(false, path)
        })

        request.setTimeout(options.timeout, function () {
            request.abort()
            callback("Timeout")
        })

    }).on('error', function (e) {

        if (callback) callback(e)

    });

}

async function unzip(destino, archivo) {

    try {
        await extract(archivo, {dir: destino})
        console.log('Extraction complete')
    } catch (err) {
        // handle any errors
    }

}

function Revzip(archivo, cb) {
    yauzl.open(archivo, {lazyEntries: true}, function (err, zipfile) {
        if (err) throw err;
        zipfile.readEntry();
        zipfile.on("entry", function (entry) {
            console.log(entry.fileName.endsWith('.exe'), 'Archivo.exe')
            if (entry.fileName.endsWith('.exe')) {
                cb(entry.fileName)
            }
            zipfile.readEntry();
        })
    })
}

ipcMain.on('Abraham', async (p1, p2) => {
        console.log('Recibiendo', p2)
        dircc = await (dialog.showOpenDialog({properties: ['openDirectory']}))

        callback = function (response) {
            let str = '';

            //another chunk of data has been received, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been received, so we just print it out here
            response.on('end', function () {

                const rx = regex.exec(str);
                const comparador = rx.groups.version;
                fs.exists(path.normalize(dircc.filePaths[0]) + '\\version.txt', function (exists) {

                    if (exists) {
                        let archivo = fs.readFileSync(path.normalize(dircc.filePaths[0]) + '\\version.txt', 'utf-8')
                        if (archivo === comparador) {
                            let ejecutador = fs.readFileSync(path.normalize(dircc.filePaths[0]) + '\\direcciondelexe.txt', 'utf-8')
                            exec(ejecutador, function (err, data) {
                                console.log(err)
                                console.log(data.toString());
                            });
                        } else {
                            descargador(regex.exec(str));
                        }
                    } else {
                        descargador(regex.exec(str))
                    }
                })
            });
        }

        http.request(options, callback).end();


        function descargador(str) {

            const lnk = str.groups.link;
            const ver = str.groups.version;
            drct.directory = path.normalize(dircc.filePaths[0]);
            fs.writeFile(drct.directory + '\\version.txt', ver, function (err) {
                if (err) throw err;
                console.log('File is created successfully.');
            });

            download(lnk, drct, function (err) {
                if (err) throw err
                console.log("Descarga completada")
                const archivo = drct.directory + '\\Lolskins.zip'
                unzip(drct.directory, archivo).then(() => {
                    Revzip(archivo, (na) => {
                        console.log(path.join(drct.directory, na), 'Direccion')
                        fs.writeFile(drct.directory + '\\direcciondelexe.txt', path.join(drct.directory, na), function (err) {
                            if (err) throw err;
                            console.log('File 2 is created successfully.');
                        });
                        exec(path.join(drct.directory, na), function (err, data) {
                            console.log(err)
                            console.log(data.toString());
                        });
                    });
                })

            })

        }

    }
)


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        icon: path.join(__dirname, './Componentes/assets/Icono.png'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
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
    ipcMain.on('cerrado', (p1, p2) => {

        mainWindow.close()
    })
    ipcMain.on('minimizado', (p1, p2) => {

        mainWindow.minimize()
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





