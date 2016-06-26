export default function() {
    window.addEventListener('resize', () => {
        this.game.scale.refresh()
        this.game.height = window.innerHeight
        this.game.width = window.innerWidth

        this.hurtBorderSprite.width = window.innerWidth
        this.hurtBorderSprite.height = window.innerHeight
    })
}
