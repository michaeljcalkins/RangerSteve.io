import React from 'react'

export default function() {
    return (
        <div className="hud-network-stats no-pointer-events">
            <table>
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
