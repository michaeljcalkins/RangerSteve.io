import React, { PropTypes } from 'react'

export default function ChooseCharacterMenu(props) {
    const { onViewChange } = props

    let characters = [
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

    function handleSelectPrimaryClick(evt) {
        console.log(evt.target.value)
        onViewChange('main')
    }

    function renderCharacters() {
        return characters.map((character, index) => {
            return (
                <div
                    className="option-group option-character-group align-middle"
                    onClick={ handleSelectPrimaryClick }
                    value={ character.name }
                    key={ index }
                >
                    <div>
                        <img src={ character.image } height="160" />
                    </div>
                    <span className="option-name">{ character.name }</span>
                </div>
            )
        })
    }

    return (
        <div className="row">
            <div className="col-sm-12">
                <label>Select a character</label>
                <div className="options-menu">
                    { renderCharacters() }
                </div>
            </div>
        </div>
    )
}

ChooseCharacterMenu.propTypes = {

}
