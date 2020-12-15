import React, {Component} from 'react';
import './App.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;



class Bototonesdeopciones extends Component {
    render() {
        return (
            <header>
                <button className="woption" onClick={() => {
                    ipcRenderer.send('cerrado', 'cerrarventana')
                }}>❌
                </button>
                <button className="woption" onClick={() => {
                    ipcRenderer.send('minimizado', 'minimizado')
                }}>➖
                </button>
                {/*<button className="option" onClick={() => {*/}
                {/*    ipcRenderer.send('minimizado', 'minimizado')*/}
                {/*}}>⚙️*/}
                {/*</button>*/}
            </header>


        );
    }
}

export default Bototonesdeopciones;