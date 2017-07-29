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
	timeout = 0				// failsafe timeout for blocking packets
	
	// Get character ID on login and disable noctenium
	dispatch.hook('S_LOGIN', 2, {order: -100}, event => {
		cid = event.cid
		noctActive = false
	})
	
	// Detect noctenium activation
	dispatch.hook('S_ABNORMALITY_BEGIN', 2, {order: -100}, event => {
		// if target is your character and noctenium is toggled on, set true
		if (event.target.equals(cid) && [902, 910, 911, 912, 913, 916].includes(event.id)) {
			noctActive = true
			if (debug) {console.log('noctActive', noctActive)}
		}
	})
	
	// Detect noctenium end
	dispatch.hook('S_ABNORMALITY_END', 1, {order: -100}, event => {
		// if target is your character and noctenium is toggled off, set false
		if (event.target.equals(cid) && [902, 910, 911, 912, 913, 916].includes(event.id)) {
			noctActive = false
			if (debug) {console.log('noctActive', noctActive)}
		}
	})
	
	// if "Skill" method for skills OR achievements
	if (config.inventoryMethod.toLowerCase() == 'skill' || config.achievementMethod.toLowerCase() == 'skill') {
		// detect skill usage
		dispatch.hook('S_ACTION_STAGE', 'raw', {order: -100}, code => {
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
	}
	
	// Skill method inventory
	if (config.inventoryMethod.toLowerCase() == 'skill') {
		// Block S_INVEN
		dispatch.hook('S_INVEN', 'raw', {order: 999}, code => {
			let timeDifference = Date.now() - timeout
			if (noctActive && counter.S_INVEN > 0 && timeDifference < 10000) {
				if (debug) {console.log('S_INVEN Blocked')}
				counter.S_INVEN -= 1
				return false
			}
		})
		// Block S_INVEN_CHANGEDSLOT
		dispatch.hook('S_INVEN_CHANGEDSLOT', 'raw', {order: 999}, code => {
			let timeDifference = Date.now() - timeout
			if (noctActive && counter.S_INVEN_CHANGEDSLOT > 0 && timeDifference < 10000) {
				if (debug) {console.log('S_INVEN_CHANGEDSLOT Blocked')}
				counter.S_INVEN_CHANGEDSLOT -= 1
				return false
			}
		})
	}
	
	// Combat method inventory
	if (config.inventoryMethod.toLowerCase() == 'combat') {
		// Detect combat status
		dispatch.hook('S_USER_STATUS', 1, {order: -100}, event => {
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
		// TODO!!!
		// Block S_INVEN
		// Allow after C_SHOW_INVEN
		// Block S_INVEN_CHANGEDSLOT
	}
	
	// Skill method achievements
	if (config.achievementMethod.toLowerCase() == 'skill') {
		dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 'raw', {order: 999}, code => {
			let timeDifference = Date.now() - timeout
			if (noctActive && counter.S_UPDATE_ACHIEVEMENT_PROGRESS > 0 && timeDifference < 10000) {
				if (debug) {console.log('S_UPDATE_ACHIEVEMENT_PROGRESS Blocked')}
				counter.S_UPDATE_ACHIEVEMENT_PROGRESS -= 1
				return false
			}
		})
	}
	
	// Method created by Pinkie Pie (https://github.com/pinkipi)
	if (config.achievementMethod.toLowerCase() == 'smart') {
		// S_LOAD_ACHIEVEMENT_LIST
		dispatch.hook('S_LOAD_ACHIEVEMENT_LIST', 1, event => {
			achieves = {}
			if (debug) {console.log('S_LOAD_ACHIEVEMENT_LIST')}
		})
		// S_UPDATE_ACHIEVEMENT_PROGRESS
		dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 1, event => {
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
		})
		// comparison function
		function compareJSON(obj1, obj2) {
			if (debug) {console.log('compareJSON')}
			return JSON.stringify(obj1) == JSON.stringify(obj2)
		}
	}
}
