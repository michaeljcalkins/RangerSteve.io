import updatePlayerColor from './updatePlayerColor'

export default function() {
    RS.enemies.forEach(enemy => updatePlayerColor(enemy, enemy.data.team))
}
