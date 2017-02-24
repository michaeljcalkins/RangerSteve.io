import PlayBloodSpray from '../PlayBloodSpray'
import PlayRocketExplosion from '../PlayRocketExplosion'
import damagePlayersInBlastDamageRadius from '../damagePlayersInBlastDamageRadius'
import GameConsts from 'lib/GameConsts'
import Client from '../Client'

export default function () {
  const state = this.game.store.getState()
  const currentWeapon = state.player.currentWeapon

  this.game.physics.arcade.collide(window.RS.bullets, window.RS.enemies, function (bullet, enemy) {
    if (
      !state.room.id ||
      state.room.state !== 'active' ||
      enemy.data.isProtected
    ) return

    const yDiff = enemy.y - bullet.y
    const headshotTolerance = 20
    const wasHeadshot = yDiff > headshotTolerance

    bullet.kill()

    const bulletDamage = wasHeadshot
      ? GameConsts.WEAPONS[bullet.weaponId].damage + 30
      : GameConsts.WEAPONS[bullet.weaponId].damage

    PlayBloodSpray.call(this, {
      bulletY: bullet.y,
      bulletX: bullet.x,
      playerX: enemy.x,
      bulletRotation: bullet.rotation
    })

    if (bullet.weaponId === 'RPG') {
      damagePlayersInBlastDamageRadius.call(this, bullet)

      PlayRocketExplosion.call(this, {
        bulletY: bullet.y,
        bulletX: bullet.x
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
