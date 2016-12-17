import React from 'react'

export default function() {
    return (
        <div
            class="hud hud-item no-pointer-events"
            style="
                font-family: Arial;
                font-size: 12px;
                font-weight: normal;
                height: 115px;
                left: 10px;
                padding: 15px;
                position: absolute;
                text-align: left;
                top: 10px;
                width: 250px;
            "
        >
            <table class="table">
                <tr>
                    <td>Data Sent:</td>
                    <td>{ window.RS.networkStats.dataSent }</td>
                </tr>
                <tr>
                    <td>Data Sent/sec:</td>
                    <td>{ window.RS.networkStats['dataSent/sec'] }</td>
                </tr>
                <tr>
                    <td>Data Received:</td>
                    <td>{ window.RS.networkStats.dataReceived }</td>
                </tr>
                <tr>
                    <td>Data Received/sec:</td>
                    <td>{ window.RS.networkStats['dataReceived/sec'] }</td>
                </tr>
            </table>
        </div>
    )
}
