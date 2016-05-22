import React from 'react'

export default function ControlsMenu() {
    return (
        <div className="row">
            <div className="col-sm-12">
                <div className="well well-sm">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="col-sm-4">Controls</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>A</td>
                                <td>Run left</td>
                            </tr>
                            <tr>
                                <td>D</td>
                                <td>Run right</td>
                            </tr>
                            <tr>
                                <td>W</td>
                                <td>Jump and when in the air fly with jump jet</td>
                            </tr>
                            <tr>
                                <td>Left Click</td>
                                <td>Fire weapon</td>
                            </tr>
                            <tr>
                                <td>Q</td>
                                <td>Switch between primary and secondary weapons</td>
                            </tr>
                            <tr>
                                <td>T</td>
                                <td>Open new chat message</td>
                            </tr>
                            <tr>
                                <td>Tab</td>
                                <td>Open settings modal for choosing nickname, weapons, and character</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
