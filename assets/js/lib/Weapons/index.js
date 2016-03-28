'use strict'

/**
 * Primary Weapons
 * 1. Desert Eagles
 * 2. HK MP5
 * 3. AK47
 * 4. M16
 * 5. Spas-12
 * 6. Ruger 77
 * 7. M79
 * 8. Barret M82A1
 * 9. FN Minimi
 * 10. XM214 Minigun
 */

/**
 * Secondary Weapons
 * 1. Desert Eagle
 * 2. Combat Knife
 * 3. Chainsaw
 * 4. RPG
 */

module.exports = {
    "AK47": require('./AK47'),
    "BarretM90": require('./BarretM90'),
    "DesertEagle": require('./DesertEagle'),
    "M4A1": require('./M4A1'),
    "M79": require('./M79'),
    "M249": require('./M249'),
    "MP5": require('./MP5'),
    // "RPG": require('./RPG'),
    "Spas12": require('./Spas12')
}
