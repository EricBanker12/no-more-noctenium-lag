// module for tera-proxy
module.exports = function noMoreNocteniumLag(dispatch) {
    // Constants
    const config = require('./config.js'),
    debug = false
    
    // Variables
    let cid = null,			// character ID
    noctActive = false,		// noctenium status
    inCombat = false,		// combat status
    achieves = null,		// for Pinkie Pie's "Smart" achievement method
    counter = {},			// for skill methods
    timeout = 0				// Handler variable for failsafe timeout
    
    // Get character ID on login and disable noctenium
    dispatch.hook('S_LOGIN', 10, event => {
        cid = event.gameId
        noctActive = false
    })
    
    // Detect noctenium activation
    dispatch.hook('S_ABNORMALITY_BEGIN', 2, event => {
        // if target is your character and noctenium is toggled on, set true
        if (event.target.equals(cid) && [902, 910, 911, 912, 913, 916, 920, 921, 922, 929].includes(event.id)) {
            noctActive = true
            if (debug) {console.log('noctActive', noctActive)}
        }
    })
    
    // Detect noctenium end
    dispatch.hook('S_ABNORMALITY_END', 1, event => {
        // if target is your character and noctenium is toggled off, set false
        if (event.target.equals(cid) && [902, 910, 911, 912, 913, 916, 920, 921, 922, 929].includes(event.id)) {
            noctActive = false
            if (debug) {console.log('noctActive', noctActive)}
        }
    })
    
    // detect skill usage
    dispatch.hook('S_ACTION_STAGE', 'raw', {order: 999, filter: {fake: null}}, code => {
        // if noctenium active
        if (noctActive) {
            // set counter to block X number of packets
            counter.S_INVEN = 2
            counter.S_INVEN_CHANGEDSLOT = 1
            counter.S_UPDATE_ACHIEVEMENT_PROGRESS = 1
            // set failsafe timeout
            timeout = Date.now()
        }
    })
    
    // Detect combat status
    dispatch.hook('S_USER_STATUS', 1, event => {
        // if character is your character
        if(event.target.equals(cid)) {
            // if in combat, set true
            if (event.status == 1) {
                inCombat = true
                if (debug) {console.log('inCombat', inCombat)}
            }
            else {
                inCombat = false
                if (debug) {console.log('inCombat', inCombat)}
            }
        }
    })
    
    // Allow after C_SHOW_INVEN
    dispatch.hook('C_SHOW_INVEN', 'raw', code => {
        // if noctenium active
        if (noctActive) {
            // set counter to allow packets
            counter.S_INVEN = 0
            counter.S_INVEN_CHANGEDSLOT = 0
            counter.S_UPDATE_ACHIEVEMENT_PROGRESS = 0
        }
    })
    
    // Block S_INVEN
    dispatch.hook('S_INVEN', 'raw', {order: 999}, code => {
        // Skill method inventory
        if (config.inventoryMethod.toLowerCase() == 'skill') {
            let timeDifference = Date.now() - timeout
            if (noctActive && counter.S_INVEN > 0 && timeDifference < 10000) {
                if (debug) {console.log('S_INVEN Blocked')}
                counter.S_INVEN -= 1
                return false
            }
        }
        // Combat method inventory
        if (config.inventoryMethod.toLowerCase() == 'combat') {
            let timeDifference = Date.now() - timeout
            if (noctActive && counter.S_INVEN > 0 && timeDifference < config.timeout && inCombat) {
                if (debug) {console.log('S_INVEN Blocked')}
                counter.S_INVEN -= 1
                return false
            }
        }
    })
    
    // Block S_INVEN_CHANGEDSLOT
    dispatch.hook('S_INVEN_CHANGEDSLOT', 'raw', {order: 999}, code => {
        // Skill method inventory
        if (config.inventoryMethod.toLowerCase() == 'skill') {
            let timeDifference = Date.now() - timeout
            if (noctActive && counter.S_INVEN_CHANGEDSLOT > 0 && timeDifference < 10000) {
                if (debug) {console.log('S_INVEN_CHANGEDSLOT Blocked')}
                counter.S_INVEN_CHANGEDSLOT -= 1
                return false
            }
        }
        // Combat method inventory
        if (config.inventoryMethod.toLowerCase() == 'combat') {
            let timeDifference = Date.now() - timeout
            if (noctActive && counter.S_INVEN_CHANGEDSLOT > 0 && timeDifference < config.timeout && inCombat) {
                if (debug) {console.log('S_INVEN_CHANGEDSLOT Blocked')}
                counter.S_INVEN_CHANGEDSLOT -= 1
                return false
            }
        }
    })
    
    // Achievements
    dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 'raw', {order: 999}, code => {
        // Skill method achievements
        if (config.achievementMethod.toLowerCase() == 'skill') {
            let timeDifference = Date.now() - timeout
            if (noctActive && counter.S_UPDATE_ACHIEVEMENT_PROGRESS > 0 && timeDifference < config.timeout) {
                if (debug) {console.log('S_UPDATE_ACHIEVEMENT_PROGRESS Blocked')}
                counter.S_UPDATE_ACHIEVEMENT_PROGRESS -= 1
                return false
            }
        }
        // Combat method achievements
        if (config.achievementMethod.toLowerCase() == 'combat') {
            let timeDifference = Date.now() - timeout
            if (noctActive && counter.S_UPDATE_ACHIEVEMENT_PROGRESS > 0 && timeDifference < config.timeout && inCombat) {
                if (debug) {console.log('S_UPDATE_ACHIEVEMENT_PROGRESS Blocked')}
                counter.S_UPDATE_ACHIEVEMENT_PROGRESS -= 1
                return false
            }
        }
        /*
        // Smart method achievements
        // Method created by Pinkie Pie (https://github.com/pinkipi)
        if (config.achievementMethod.toLowerCase() == 'smart') {
            if (debug) {console.log('S_UPDATE_ACHIEVEMENT_PROGRESS')}
            let achievements = []

            for(let achieve of event.achievements) {
                if(!compareJSON(achieve.requirements, achieves[achieve.id])) {
                    achievements.push(achieve)
                    achieves[achieve.id] = achieve.requirements
                }
            }
            Object.assign(event, {achievements})
            return true
        }
        */
    })
    
    // comparison function
    function compareJSON(obj1, obj2) {
        if (debug) {console.log('compareJSON')}
        return JSON.stringify(obj1) == JSON.stringify(obj2)
    }
    /*
    // S_LOAD_ACHIEVEMENT_LIST
    dispatch.hook('S_LOAD_ACHIEVEMENT_LIST', 1, event => {
        if (config.achievementMethod.toLowerCase() == 'smart') {
            achieves = {}
            if (debug) {console.log('S_LOAD_ACHIEVEMENT_LIST')}
        }
    })
    */
}
