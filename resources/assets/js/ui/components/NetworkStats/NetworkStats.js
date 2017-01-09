import React from 'react'

export default function({
  stats
}) {
  return (
    <div className="hud-network-stats no-pointer-events">
      <table>
        <tr>
          <td>Data Sent:</td>
          <td>{ stats.dataSent }</td>
        </tr>
        <tr>
          <td>Data Sent/sec:</td>
          <td>{ stats.dataSentPerSecond }</td>
        </tr>
        <tr>
          <td>Data Received:</td>
          <td>{ stats.dataReceived }</td>
        </tr>
        <tr>
          <td>Data Received/sec:</td>
          <td>{ stats.dataReceivedPerSecond }</td>
        </tr>
      </table>
    </div>
  )
}
