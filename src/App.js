import React, { Component } from 'react';
import './App.css';
const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const { dialog } = require('electron')
const fs = require("fs")


console.log(ipcRenderer)

class App extends Component {
  render() {
    return (
      <div className="App">
        <main>
            <h1 className="hdr">Seleccione la ruta para guardar los archivos</h1>
            <button className="btn" onClick={() =>{
                ipcRenderer.send('Abraham', 'Lerolero')
            } }>Browse</button>
        </main>
      </div>
    );
  }
}

export default App;
