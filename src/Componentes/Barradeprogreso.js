import React from 'react';
import * as electron from "electron";
const ipcRenderer = electron.ipcRenderer;


let _evtPercentage = null;

ipcRenderer.on("carga", (evt, percentage) => {
    _evtPercentage && _evtPercentage(percentage)
})


export const Bar = () => {
    const [percentage, setPercentage] = React.useState(0);

    React.useEffect(() => {
        _evtPercentage = setPercentage;
    }, []);



    if(percentage === 0) {
        return null;
    }else

    return <div style={{
        position: "absolute",
        bottom: 25,
        left: 98,
        width: 200,
        height: 18,
        backgroundColor: "black",
        borderRadius:25
    }}>
        <div style={{
            position: "absolute",
            width: percentage + "%",
            height: 18,
            backgroundColor: "green",
            textAlign: "center",
            lineHeight: 1,
            borderRadius:25
        }}>
            {percentage + '%'}</div>
    </div>;
}


