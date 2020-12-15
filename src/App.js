import 'bootstrap/dist/css/bootstrap.min.css';
import React, {Component} from 'react';
import './Componentes/App.css';
import Bototonesdeopciones from "./Componentes/Bototonesdeopciones";
import {Bar} from "./Componentes/Barradeprogreso"

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


export class App extends Component {


    constructor(props) {
        super(props);
        this.onLaunchClicked = this.onLaunchClicked.bind(this);
        this.state = {
            isButtonDisabled: false,
            showMessage: false,
            mensajeDeAviso: 'Iniciando',
            mensajeDelBoton: 'Iniciar',
            mostrarBoton: true,
        }
    }

    onLaunchClicked(event) {
        this.setState({showMessage: true})
        event.preventDefault();
        this.setState({
            isButtonDisabled: true
        })
        setTimeout(() => this.setState({isButtonDisabled: false}), 2);
        ipcRenderer.send('Abraham', 'Lerolero')
        ipcRenderer.on('errorDeDescarga', (valor)=>{
            this.setState({mostrarBoton: valor})
        })

        this.setState({
            mensajeDelBoton: 'Reintentar',
            mensajeDeAviso: 'Descarga en proceso',
            mostrarBoton: false
        })
    }


    render() {

        return (
            <div className="App">
                <main>
                    <Bototonesdeopciones/>
                    {this.state.mostrarBoton && <button className="btn"
                                                        disabled={this.state.isButtonDisabled}
                                                        onClick={this.onLaunchClicked}> {this.state.mensajeDelBoton}
                                                </button>
                    }
                    {this.state.showMessage && <p className="hdr">{this.state.mensajeDeAviso}</p>}
                    <Bar/>
                </main>
            </div>

        );
    }
}

export default App;
