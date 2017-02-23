import Client from '../Client'
import PlayBloodSpray from '../PlayBloodSpray'
import PlayRocketExplosion from '../PlayRocketExplosion'
import damagePlayersInBlastDamageRadius from '../damagePlayersInBlastDamageRadius'
import GameConsts from 'lib/GameConsts'

export default function () {
  const state = this.game.store.getState()
  const currentWeapon = state.player.currentWeapon

  this.game.physics.arcade.overlap(window.RS.bullets, window.RS.enemies, function (bullet, enemy) {
    if (
      !state.room.id ||
      state.room.state !== 'active' ||
      enemy.data.team === window.RS.player.data.team ||
      enemy.data.isProtected
    ) return

    const yDiff = enemy.y - bullet.y
    const headshotTolerance = 20
    const wasHeadshot = yDiff > headshotTolerance

    bullet.kill()

    const bulletDamage = wasHeadshot
      ? state.player[currentWeapon].damage + 30
      : state.player[currentWeapon].damage

    PlayBloodSpray.call(this, {
      bulletRotation: bullet.rotation,
      bulletX: bullet.x,
      bulletY: bullet.y,
      playerX: enemy.x
    })

    if (bullet.weaponId === 'RPG') {
      damagePlayersInBlastDamageRadius.call(this, bullet)

      PlayRocketExplosion.call(this, {
        bulletX: bullet.x,
        bulletY: bullet.y
      })
    }

    Client.send(GameConsts.EVENT.PLAYER_DAMAGED, {
      damage: bulletDamage,
      weaponId: state.player[currentWeapon].id,
      damagedPlayerId: enemy.data.id,
      attackingPlayerId: window.SOCKET_ID,
      wasHeadshot
    })
  }, null, this)
}
