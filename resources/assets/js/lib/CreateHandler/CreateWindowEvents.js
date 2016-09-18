export default function() {
    window.addEventListener('resize', () => {
        this.game.scale.refresh()
        this.game.width = window.innerWidth
        this.game.height = window.innerHeight

        this.hurtBorderSprite.width = window.innerWidth
        this.hurtBorderSprite.height = window.innerHeight
    })
}
