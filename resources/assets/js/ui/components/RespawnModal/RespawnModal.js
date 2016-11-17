// @flow
import autobind from 'autobind-decorator'
import React, { Component } from 'react'
import get from 'lodash/get'
import cs from 'classnames'
import CopyToClipboard from 'react-copy-to-clipboard'

import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'

import GameConsts from 'lib/GameConsts'

@autobind
export default class RespawnModal extends Component {
    props: Props
    state: Object = {
        elapsed: 0,
        copied: false,
    }

    componentDidMount() {
        this.timer = setInterval(this.tick.bind(this), 100)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }


    tick() {
        const { respawnTime } = this.props.player
        const currentTime = Math.floor(Date.now())
        const timeRemaining = respawnTime - currentTime
        let seconds = Number((timeRemaining / 1000).toFixed(1))
        if (seconds % 1 === 0) seconds = seconds + '.0'

        if (isNaN(seconds) || seconds <= 0) {
            this.setState({ elapsed: 0 })
            return
        }

        this.setState({ elapsed: seconds })
    }

    renderDamageGiven() {
        const { player, room } = this.props

        if (! get(player, 'attackingDamageStats.attackingDamage')) return null

        const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
        const defendingHits = get(player, 'attackingDamageStats.attackingHits')
        const defendingDamage = get(player, 'attackingDamageStats.attackingDamage')

        return (
            <div>
                <strong className="text-success">Damage given:</strong>
                <strong>{ defendingDamage }</strong> in 
                <strong>{ defendingHits } hits</strong>
                to { attackingPlayerName }
            </div>
        )
    }

    renderDamageTaken() {
        const { player, room } = this.props

        if (! player.damageStats) return null

        const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
        const attackingHits = get(player, 'damageStats.attackingHits')
        const attackingDamage = get(player, 'damageStats.attackingDamage')

        return (
            <div>
                <strong className="text-danger">Damage taken:</strong> <strong>{ attackingDamage }</strong> in <strong>{ attackingHits } hits</strong> from { attackingPlayerName }
                <br />
            </div>
        )
    }
    socialMedia() {
        const shareLink = window.location.href
        const encodedShareLink = encodeURIComponent(shareLink)

        let tooltipContent = (
            <div className="row">
                <div className="col-sm-12 ">
                    <p>Invite people into this game.</p>
                    <a
                        href={ 'https://www.facebook.com/sharer/sharer.php?u=' + encodedShareLink }
                        target="_blank"
                    >
                        <img className="social-image" src="/images/icons/facebook-3-128.png" />
                    </a>
                    &nbsp;
                    <a
                        href={ 'https://twitter.com/home?status=' + encodedShareLink }
                        target="_blank"
                    >
                        <img className="social-image" src="/images/icons/twitter-3-128.png" />
                    </a>
                </div>
            </div>
        )

        return (
                <OverlayTrigger placement="right" 
                                overlay={
                                <Tooltip id="Copy Invitation Link To Clipboard">
                                  {tooltipContent}
                                </Tooltip>}>
                                <Glyphicon glyph="user" />
                </OverlayTrigger>
                ) 
    }

    reset(e) {
      e.preventDefault()
      setTimeout(() => {
        this.setState({
          copied: false,
        })
      }, 5000)
    }
    
    directLink() {
        let { copied } = this.state
        const shareLink = window.location.href

        let tooltipContent = !copied
          ? <strong>Click for an invite link to this game!</strong> 
          : <strong style={{color: '#00ff74'}}> Copied Link!</strong>
        return (
                <OverlayTrigger placement="right" 
                                overlay={
                                <Tooltip id="Copy Invitation Link To Clipboard">
                                  {tooltipContent}
                                </Tooltip>}>
                  <CopyToClipboard text={`${shareLink}`}
                    onCopy={() => this.setState({copied: true})}>
                    <Glyphicon onClick={this.reset}
                               glyph="link" />
                  </CopyToClipboard>
                </OverlayTrigger>
        )
    }
    youDied() {
        return (
          <div className="text-center">
              <button >Respawn Now</button>
          </div>
        )
    }

    renderCauseOfDeath() {
        const { player, room } = this.props
        const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
        const selectedWeapon = get(GameConsts, `WEAPONS[${player.damageStats.weaponId}]`)
        const attackingPlayerId = get(player, 'damageStats.attackingPlayerId', false)

        if (! attackingPlayerId) {
            return (
                <div className="row">
                    <div className="col-sm-12 text-center">
                        <h4>You killed yourself...</h4>
                    </div>
                </div>
            )
        } else {

            return (
                <div className="row">
                    <div className="col-sm-12 text-center">
                        <img
                            className="weapon-image"
                            src={ '/images/guns/large/' + selectedWeapon.image }
                        />
                        <h4><strong>{ attackingPlayerName }</strong> killed you with their <strong>{ selectedWeapon.name }</strong></h4>
                        { this.renderDamageTaken() }
                        { this.renderDamageGiven() }
                    </div>
                </div>
            )
        }

    }
    openSettingsModal() {
        return (
          <div className="text-center">
              <button 
                  className="btn btn-primary btn-md btn-block"
                  onClick={ this.props.onOpenSettingsModal }>
                  Change Settings
              </button>
          </div>
        )
    }

    render() {
        const { player } = this.props
        const attackingPlayerId = get(player, 'damageStats.attackingPlayerId', false)
        const modalContentClasses = cs('modal-content', {
            'modal-content-suicide': ! attackingPlayerId,
        })

        return (
            <div>
                <div
                    className="modal modal-respawn"
                    style={ { display: 'block' } }
                >
                    <div className="modal-dialog">
                        <div className={ modalContentClasses }>
                            <div className="modal-header">
                                <h4 className="modal-title">Respawn</h4>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-sm-12">
                                        { this.renderCauseOfDeath() }
                                    </div>
                                </div>

                                <h4 className="text-center">Respawning in { this.state.elapsed } seconds</h4>
                                { this.youDied() }
                                <hr />
                                <div className="text-center">
                                    { this.socialMedia() }
                                    { this.directLink() }
                                    { this.openSettingsModal() }    
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

type Props = {
    player: Object,
    room: Object,
}
