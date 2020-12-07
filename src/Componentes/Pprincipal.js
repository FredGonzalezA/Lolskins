import React, {Component} from 'react';
import * as electron from "electron";
import {ProgressBar} from "react-bootstrap";

const ipcRenderer = electron.ipcRenderer;
const fs = require("fs")

let _evtPercentage = null;

ipcRenderer.on("carga", (evt, percentage) => {
    _evtPercentage && _evtPercentage(percentage)
})


export const Bar = () => {
    const [percentage, setPercentage] = React.useState(0);
    React.useEffect(() => {
        _evtPercentage = setPercentage;
    }, []);
    return <ProgressBar now={percentage}/>}

    // return <div style={{position: "relative", width: 200, height: 50, backgroundColor: "black"}}>
    //     <div style={{position: "absolute", width: percentage + "%", height: 50, backgroundColor: "black"}}/>
    //     </div>;}

