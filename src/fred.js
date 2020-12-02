const electron = require('electron');
window.require = require;
const {ipcRenderer} = require('electron')
const { dialog } = require('electron')

ipcRenderer.on('Abraham',(p1, p2)=>{
    console.log('Recibiendo', p2)
    dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
})

