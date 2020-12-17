const electron = require('electron');
const app = electron.app;
const mkdirp = require('mkdirp')
const BrowserWindow = electron.BrowserWindow;
const NamedRegExp = require('named-regexp-groups')
const regex = new NamedRegExp('(?<link>https?:\/\/.+(?<version>ModSkin_.+)\.zip)([^a-zA-Z0-9_])');
const path = require('path');
const https = require('https')
const {ipcMain} = require('electron')
const extract = require('extract-zip')
const yauzl = require("yauzl")

const direccionDeInstalacionDeDatos = process.env.APPDATA + '\\Fred\\Lolskins\\Data'
mkdirp(direccionDeInstalacionDeDatos)
const direccionDeInstalacionDePrograma = process.env.APPDATA + '\\Fred\\Lolskins\\Programa'
mkdirp(direccionDeInstalacionDePrograma)

let url = require('url');
let fs = require('fs');
let mainWindow;
let http = require('http');
let options = {
    host: 'leagueskin.net',
    path: '/p/download-mod-skin-2020-chn'
};
let drct = {
    directory: " ",
    filename: "Lolskins.zip"
}
let exec = require('child_process').execFile;
let received_bytes = 0;
let total_bytes = 0;
let rmDir;

const find = require('find-process');

app.on('before-quit' , (e) => {
    find('port', process.env.PORT || 3000)
        .then(function (list) {
            if(list[0] != null){
                process.kill(list[0].pid, 'SIGHUP');
            }
        }.catch((e) => {
            console.log(e.stack || e);
        }));
});

const bajadadelHTML = (options) => new Promise((resolve, reject) => {

    let callback = function (response) {
        let str = '';


        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', () => resolve(str))
    }
    http.request(options, callback).end();
})

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 200,
        transparent: true,
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


    mainWindow.setResizable(false);

    mainWindow.on('closed', function () {

        mainWindow = null
    })
    ipcMain.on('cerrado', () => {

        mainWindow.close()
    })
    ipcMain.on('minimizado', () => {

        mainWindow.minimize()
    })
}

// const archivo = fs.readFileSync(path.normalize(direccionDeInstalacionDeDatos) + '\\version.txt', 'utf-8')
app.on('ready', () => {
    bajadadelHTML(options).then((str) => {
        const rx = regex.exec(str);
        const comparador = rx.groups.version;
        fs.exists(path.normalize(direccionDeInstalacionDeDatos) + '\\direcciondelexe.txt',
            function (exists) {
                fs.exists(path.normalize(direccionDeInstalacionDeDatos) + '\\version.txt',
                    function (existsVersion) {
                        if (existsVersion) {
                            const archivo = fs.readFileSync(path.normalize(direccionDeInstalacionDeDatos) + '\\version.txt', 'utf-8')
                            if (exists && comparador === archivo) {
                                let ejecutador = fs.readFileSync(path.normalize(direccionDeInstalacionDeDatos)
                                    + '\\direcciondelexe.txt', 'utf-8')
                                exec(ejecutador, function (err, data) {
                                    console.log(err)
                                    console.log(data.toString());
                                    app.quit()
                                });
                            } else if (archivo !== comparador) {
                                createWindow()
                                ipcMain.on('AppLista', ()=>{
                                    const windows = BrowserWindow.getAllWindows()
                                    if (windows.length > 0) {
                                        windows[0].webContents.send('Actualizacion', 'Procesos')
                                    }
                                })
                                eliminadorDeCarpetas(direccionDeInstalacionDeDatos, false)
                                eliminadorDeCarpetas(direccionDeInstalacionDePrograma, false)
                                metodoPrincipaldeDescarga(regex.exec(str));
                            }
                        } else {
                            createWindow()
                        }
                    })

            })
    })
})
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

ipcMain.on('Abraham', async (p1, p2) => {
    console.log('Recibiendo', p2)
    // dircc = await (dialog.showOpenDialog({properties: ['openDirectory']}))
    bajadadelHTML(options).then((str) => {
    metodoPrincipaldeDescarga(regex.exec(str))

})})


function progresoDeLaDescarga(received, total) {

    const windows = BrowserWindow.getAllWindows()
    const percentage = (received * 100) / total;
    console.log(percentage + "% | " + received + " bytes de " + total + " bytes.");
    if (windows.length > 0) {
        windows[0].webContents.send('carga', percentage.toFixed())
    }

}

function descargador(file, options, callback) {


    if (!file) throw("Se nececita archivo para descargar")

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
                    progresoDeLaDescarga(received_bytes, total_bytes);
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

async function extractorDelZip(destino, archivo) {

    try {
        await extract(archivo, {dir: destino})
        console.log('Extraccion completada')
    } catch (err) {
        // handle any errors
    }

}

function lectordelZIP(archivo, cb) {
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

function metodoPrincipaldeDescarga(str) {

    const lnk = str.groups.link;
    const ver = str.groups.version;
    drct.directory = path.normalize(direccionDeInstalacionDePrograma);
    fs.writeFile(direccionDeInstalacionDeDatos + '\\version.txt', ver, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });

    descargador(lnk, drct, function (err) {
        if (err) {
            mainWindow.webContents.send('errorDeDescarga', true)
        }
        console.log("Descarga del zip completada")
        const archivo = drct.directory + '\\Lolskins.zip'
        extractorDelZip(drct.directory, archivo).then(() => {
            lectordelZIP(archivo, (na) => {
                fs.writeFile(direccionDeInstalacionDeDatos + '\\direcciondelexe.txt',
                    path.join(direccionDeInstalacionDePrograma, na),
                    function (err) {
                        if (err) throw err;
                        console.log('Archivo con la direccion del exe creado');
                    });
                fs.unlink(direccionDeInstalacionDePrograma + '\\' + drct.filename, (err) => {
                    if (err) throw err;
                })
                exec(path.join(drct.directory, na), function (err, data) {
                    console.log(err)
                    console.log(data.toString());
                });
                mainWindow.close()
            });
        })
    })

}

eliminadorDeCarpetas = function (dirPath, eliminarmismacarpeta) {
    if (eliminarmismacarpeta === undefined)
        eliminarmismacarpeta = true;
    try {
        var files = fs.readdirSync(dirPath);
    } catch (e) {
        return;
    }
    if (files.length > 0)
        for (let i = 0; i < files.length; i++) {
            let filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
    if (eliminarmismacarpeta)
        fs.rmdirSync(dirPath);
};





