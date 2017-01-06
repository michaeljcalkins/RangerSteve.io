import { assert } from 'chai'

import getRoomIdByPlayerId from './getRoomIdByPlayerId'

describe('getRoomIdByPlayerId', function() {
  const rooms = {"nasty-ape-49":{"id":"nasty-ape-49","players":{"RP1rh7XFV8K2Z7GmAAAA":{"x":2380,"y":1698,"id":"RP1rh7XFV8K2Z7GmAAAA","meta":{"health":100,"kills":0,"deaths":0,"bestKillingSpree":0,"score":0,"nickname":"Slaughter Rob","killingSpree":0,"headshots":0,"secondsInRound":3,"damageInflicted":0,"bulletsFired":0,"bulletsHit":0,"weaponId":"AK47","team":null},"rightArmAngle":-97.5355814023172,"leftArmAngle":-98.53558140231722,"facing":"left"}},"roundEndTime":1478066909,"state":"active","map":"PunkCity","gamemode":"Deathmatch","redTeamScore":0,"blueTeamScore":0,"messages":[]}}

  it('should return false if no room id was found', function() {
    assert.equal(getRoomIdByPlayerId(), false)
  })

  it('should return false if no room id was found', function() {
    assert.equal(getRoomIdByPlayerId(null, rooms), false)
  })

  it('should return a string if a room was found with this player in it', function() {
    assert.equal(getRoomIdByPlayerId('RP1rh7XFV8K2Z7GmAAAA', rooms), 'nasty-ape-49')
  })
})