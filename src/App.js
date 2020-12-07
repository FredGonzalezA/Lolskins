import 'bootstrap/dist/css/bootstrap.min.css';
import React, {Component} from 'react';
import './Componentes/App.css';
import Barradw from "./Componentes/Barradw";
import {Bar} from "./Componentes/Pprincipal"
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const {dialog} = require('electron')
const fs = require("fs")



export class App extends Component {

    render() {
        return (
            <div className="App">
                <main>
                    <Barradw/>
                    <h1 className="hdr">Seleccione la ruta para guardar los archivos</h1>
                    <button className="btn" onClick={() => {
                        ipcRenderer.send('Abraham', 'Lerolero')
                    }}>Browse
                    </button>
                </main>
                <Bar/>
            </div>

        );
    }
}

export default App;
