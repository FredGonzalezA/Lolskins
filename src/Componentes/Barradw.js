import React, {Component} from 'react';
import './App.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const {dialog} = require('electron')
const fs = require("fs")

class Barradw extends Component {
    render() {
        return (
            <div className="App">
                <main>
                    <header>
                        <button className="option" onClick={() => {
                            ipcRenderer.send('cerrado', 'cerrarventana')
                        }}>X
                        </button>
                        <button className="option" onClick={() => {
                            ipcRenderer.send('minimizado', 'minimizado')
                        }}>-
                        </button>
                    </header>

                </main>

            </div>
        );
    }
}

export default Barradw;