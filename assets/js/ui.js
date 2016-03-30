import React from 'react'
import ReactDOM from 'react-dom'

const element = document.getElementById('rangersteve-ui')

ReactDOM.render(
    <div>
        <div className="modal hud-settings-modal" style={ { display: "block" } }>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title">Settings</h4>
                    </div>
                    <div className="modal-body">
                        <ul className="nav nav-tabs">
                            <li className="active">
                                <a href="#">General</a>
                            </li>
                            <li>
                                <a href="#">Character</a>
                            </li>
                        </ul>
                        <br />
                        <div className="form-group">
                            <label htmlFor="">Nickname</label>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="">Sound Effects Volume</label>
                            <input type="range"/>
                        </div>
                        <label>Choose your character</label>
                        <div className="well well-sm">
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                            <a href="#" className="thumbnail">
                                <img src="http://placehold.it/134x180" />
                            </a>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="hud-score hud-item">164</div>
        <div className="hud-health hud-item">100</div>
        <div className="hud-leaderboard hud-item">
            <h1>Leaderboard</h1>
            <ol>
                <li>LavaEagle</li>
                <li>Nomad</li>
                <li>JohnnyLegend</li>
                <li>BIGDAWGROB</li>
                <li>magicmike87</li>
                <li>KIAWNATHEKID</li>
                <li>nomoretime</li>
                <li>f4tal3rr0r</li>
                <li>ImRickJames</li>
                <li>Drewpy</li>
            </ol>
        </div>
        <div className="hud-ammo hud-item">
            30
            <div className="progress">
                <div
                    style={ { width: '60%' } }
                    className="progress-bar"
                ></div>
            </div>
        </div>
        <div className="hud-settings hud-item"></div>
        <div className="hud-weapon-options">
            <div><span>1</span></div>
            <div><span>2</span></div>
            <div><span>3</span></div>
            <div><span>4</span></div>
            <div><span>5</span></div>
            <div><span>6</span></div>
            <div><span>7</span></div>
            <div><span>8</span></div>
            <div><span>9</span></div>
            <div><span>10</span></div>
        </div>
    </div>,
    element
)
