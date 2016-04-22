<template>
    <div class="row">
        <div class="col-sm-12">
            <label>Select a character</label>
            <div class="options-menu">
                <div
                    class="option-group option-character-group align-middle"
                    v-for="character in characters"
                    @click="handleSelectPrimaryClick"
                    value="character.name"
                    key="index"
                >
                    <div>
                        <img src="character.image" height="160" />
                    </div>
                    <span class="option-name">{{character.name}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['onViewChange'],
    data: function() {
        return {
            characters: [
                {
                    name: 'Ranger Steve',
                    image: '/images/characters/Ranger-Steve.png'
                },
                {
                    name: 'G.I. John',
                    image: '/images/characters/GIJohn.png'
                },
                {
                    name: 'Real Estate Rob',
                    image: '/images/characters/RealEstateRob.png'
                },
                {
                    name: 'LavaEagle',
                    image: '/images/characters/LavaEagle.png'
                }
            ]
        }
    },
    methods: {
        handleSelectPrimaryClick: function(evt) {
            console.log(evt.target.value)
            onViewChange('main')
        }
    }
}
</script>
