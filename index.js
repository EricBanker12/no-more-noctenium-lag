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

    let method = config.inventoryMethod.toLowerCase()

    // check to block a packet
    function blockPacket(name) {
        let timeDifference = Date.now() - startTime
        // if noctenium active and within timeout of last skill
        if (noctActive && counter[name] > 0 && timeDifference < config.timeout) {
            // check method and combat status
            if ((method == 'combat' && inCombat) || method == 'skill') {
                // block packet
                if (config.debug) dispatch.log(`${name} Blocked`)
                counter[name] -= 1
                return false
            }
        }
        // do not block packet
        if (config.debug) dispatch.log(name)
        return null
    }
    
    // Get character ID on login and disable noctenium
    dispatch.hook('S_LOGIN', dispatch.majorPatchVersion < 86 ? 13 : 14, event => {
        gameId = event.gameId
        noctActive = false
        counter = {}
    })
    
    // Detect noctenium activation
    dispatch.hook('S_ABNORMALITY_BEGIN', 4, {filter: {silenced: null}}, event => {
        // if target is your character and noctenium is toggled on, set true
        if (event.target == gameId && noct.includes(event.id)) {
            noctActive = true
            if (config.debug) {dispatch.log('noctActive', noctActive)}
        }
    })
    
    // Detect noctenium end
    dispatch.hook('S_ABNORMALITY_END', 1, {filter: {silenced: null}}, event => {
        // if target is your character and noctenium is toggled off, set false
        if (event.target == gameId && noct.includes(event.id)) {
            noctActive = false
            counter = {}
            if (config.debug) {dispatch.log('noctActive', noctActive)}
        }
    })
    
    // detect skill usage
    dispatch.hook('S_ACTION_STAGE', 9, {order: -999, filter: {silenced: null}}, event => {
        // if noctenium active
        if (noctActive && gameId == event.gameId) {
            // set counter to block X number of packets
            // counter.S_INVEN = 1
            // counter.S_INVEN_CHANGEDSLOT = 1
            counter.S_UPDATE_ACHIEVEMENT_PROGRESS = 1
            counter.S_INVEN_USERDATA = 1
            counter.S_ITEMLIST = 1
            // set failsafe timeout
            startTime = Date.now()
        }
    })
    
    // Detect combat status
    dispatch.hook('S_USER_STATUS', 3, event => {
        // if character is your character
        if(event.gameId == gameId) {
            // check if in combat
            inCombat = (event.status == 1)
            if (config.debug) {dispatch.log('inCombat', inCombat)}
        }
    })
    
    // if (dispatch.majorPatchVersion < 85) {
    //     // Allow after C_SHOW_INVEN
    //     dispatch.hook('C_SHOW_INVEN', 'raw', {order: 999, filter: {fake: null}}, () => {
    //         // if noctenium active
    //         if (noctActive) {
    //             // set counter to allow packets
    //             counter.S_INVEN = 0
    //             counter.S_INVEN_CHANGEDSLOT = 0
    //             counter.S_UPDATE_ACHIEVEMENT_PROGRESS = 0
    //         }
    //     })

    //     // Block S_INVEN
    //     dispatch.hook('S_INVEN', 'raw', {order: -999}, (code, data) => {
    //         if (counter.S_INVEN) {
    //             let more = data.readUInt8(26)
    //             if (more) counter.S_INVEN += 1
    //         }
    //         return blockPacket('S_INVEN')
    //     })

    //     // Block S_INVEN_CHANGEDSLOT
    //     dispatch.hook('S_INVEN_CHANGEDSLOT', 'raw', {order: -999}, () => {
    //         return blockPacket('S_INVEN_CHANGEDSLOT')
    //     })
    // }

    // Allow after C_SHOW_ITEMLIST
    dispatch.hook('C_SHOW_ITEMLIST', 'raw', {order: 999, filter: {fake: null}}, () => {
        // if noctenium active
        if (noctActive) {
            // set counter to allow packets
            counter.S_INVEN_USERDATA = 0
            counter.S_ITEMLIST = 0
            counter.S_UPDATE_ACHIEVEMENT_PROGRESS = 0
        }
    })

    // S_INVEN_USERDATA
    dispatch.hook('S_INVEN_USERDATA', 'raw', {order: -999}, () => {
        return blockPacket('S_INVEN_USERDATA')
    })

    // Block S_ITEMLIST
    dispatch.hook('S_ITEMLIST', 'raw', {order: -999}, (code, data) => {
        if (counter.S_ITEMLIST) {
            let lastInBatch = data.readUInt8(48)
            if (!lastInBatch) counter.S_ITEMLIST += 1
        }
        return blockPacket('S_ITEMLIST')
    })
    
    // Achievements
    dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 'raw', {order: -999}, () => {
        return blockPacket('S_UPDATE_ACHIEVEMENT_PROGRESS')
    })
}
