import React, { PropTypes } from 'react'

export default function ChooseCharacterMenu({
    onViewChange
}) {
    const characters = [
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

    function handleSelectPrimaryClick() {
        onViewChange('main')
    }

    function renderCharacters() {
        return characters.map(function(character, index) {
            return (
                <div
                    className="option-group option-character-group align-middle"
                    key={ index }
                    onClick={ handleSelectPrimaryClick.bind(this, character) }
                >
                    <div>
                        <img height="160" src={ character.image } />
                    </div>
                    <span className="option-name">{ character.name }</span>
                </div>
            )
        })
    }

    return (
        <div className="row">
            <div className="col-sm-12">
                <label>Select a Character</label>
                <em className="pull-right">(Changes take effect when you respawn)</em>
                <div className="options-menu">
                    { renderCharacters() }
                </div>
            </div>
        </div>
    )
}

ChooseCharacterMenu.propTypes = {
    onViewChange: PropTypes.func.isRequired
}
