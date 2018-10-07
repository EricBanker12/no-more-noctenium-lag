// module for tera-proxy
module.exports = function noMoreNocteniumLag(dispatch) {
    // Constants
    const config = require('./config.js'),
    noct = [902, 910, 911, 912, 913, 916, 917, 920, 921, 922, 929, 999010000]
    
    // Variables
    let gameId = null,		// character ID
    noctActive = false,		// noctenium status
    inCombat = false,		// combat status
    counter = {},			// for skill methods
    startTime = 0			// Handler variable for failsafe timeout

    // check to block a packet
    function blockPacket(name) {
        let timeDifference = Date.now() - startTime
        let method = config.inventoryMethod.toLowerCase()
        // if noctenium active and within timeout of last skill
        if (noctActive && counter[name] > 0 && timeDifference < config.timeout) {
            // check method and combat status
            if ((method == 'combat' && inCombat) || method == 'skill') {
                // block packet
                if (config.debug) console.log(`${name} Blocked`)
                counter[name] -= 1
                return false
            }
        }
        // do not block packet
        if (config.debug) console.log(name)
        return null
    }
    
    // Get character ID on login and disable noctenium
    dispatch.hook('S_LOGIN', 10, event => {
        gameId = event.gameId
        noctActive = false
    })
    
    // Detect noctenium activation
    dispatch.hook('S_ABNORMALITY_BEGIN', dispatch.base.majorPatchVersion >= 75 ? 3 : 2, {order: 999, filter: {silenced: null}}, event => {
        // if target is your character and noctenium is toggled on, set true
        if (event.target.equals(gameId) && noct.includes(event.id)) {
            noctActive = true
            if (config.debug) {console.log('noctActive', noctActive)}
        }
    })
    
    // Detect noctenium end
    dispatch.hook('S_ABNORMALITY_END', 1, {order: 999, filter: {silenced: null}}, event => {
        // if target is your character and noctenium is toggled off, set false
        if (event.target.equals(gameId) && noct.includes(event.id)) {
            noctActive = false
            if (config.debug) {console.log('noctActive', noctActive)}
        }
    })
    
    // detect skill usage
    dispatch.hook('S_ACTION_STAGE', dispatch.base.majorPatchVersion >= 75 ? 8 : 7, {order: 999, filter: {silenced: null}}, event => {
        // if noctenium active
        if (noctActive && event.gameId.equals(gameId)) {
            // set counter to block X number of packets
            counter.S_INVEN = 2
            counter.S_INVEN_CHANGEDSLOT = 1
            counter.S_UPDATE_ACHIEVEMENT_PROGRESS = 1
            // set failsafe timeout
            startTime = Date.now()
        }
    })
    
    // Detect combat status
    dispatch.hook('S_USER_STATUS', 2, event => {
        // if character is your character
        if(event.gameId.equals(gameId)) {
            // check if in combat
            inCombat = (event.status == 1)
            if (config.debug) {console.log('inCombat', inCombat)}
        }
    })
    
    // Allow after C_SHOW_INVEN
    dispatch.hook('C_SHOW_INVEN', 'raw', {order: 999, filter: {fake: null}}, () => {
        // if noctenium active
        if (noctActive) {
            // set counter to allow packets
            counter.S_INVEN = 0
            counter.S_INVEN_CHANGEDSLOT = 0
            counter.S_UPDATE_ACHIEVEMENT_PROGRESS = 0
        }
    })

    // Block S_INVEN
    dispatch.hook('S_INVEN', 'raw', {order: 999}, () => {
        return blockPacket('S_INVEN')
    })
    
    // Block S_INVEN_CHANGEDSLOT
    dispatch.hook('S_INVEN_CHANGEDSLOT', 'raw', {order: 999}, () => {
        return blockPacket('S_INVEN_CHANGEDSLOT')
    })
    
    // Achievements
    dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 'raw', {order: 999}, () => {
        return blockPacket('S_UPDATE_ACHIEVEMENT_PROGRESS')
    })
}
