// module for tera-proxy
module.exports = function noMoreNocteniumLag(dispatch) {
	
	// Variables
	let timeout = 0,
	cid = null,
	enabled = false
	
	// Get character ID on login and disable noctenium
	dispatch.hook('S_LOGIN', 2, event => {
		cid = event.cid
		enabled = false
	})
	
	// Detect noctenium activation
	dispatch.hook('S_ABNORMALITY_BEGIN', 2, {order: -100}, event => {
		// if target is your character and noctenium is toggled on, enable
		if (event.target.equals(cid) && [902, 910, 911, 912, 913, 916].includes(event.id)) {
			enabled = true
		}
	})
	
	// Detect noctenium end
	dispatch.hook('S_ABNORMALITY_END', 1, {order: -100}, event => {
		// if target is your character and noctenium is toggled off, disable
		if (event.target.equals(cid) && [902, 910, 911, 912, 913, 916].includes(event.id)) {
			enabled = false
		}
	})
	
	// Get time from starting a skill
	dispatch.hook('S_ACTION_STAGE', 1, {order: -100}, event => {
		if (enabled) {
			timeout = Date.now()
		}
	})
	
	// Block S_INVEN if noctenium was used within 100 ms
	dispatch.hook('S_INVEN', 'raw', {order: 999}, code => {
		let time_difference = Date.now() - timeout
		if (time_difference < 100) {
			return false
		}
	})
	
	// Block S_INVEN_CHANGEDSLOT if noctenium was used within 100 ms
	dispatch.hook('S_INVEN_CHANGEDSLOT', 'raw', {order: 999}, code => {
		let time_difference = Date.now() - timeout
		if (time_difference < 100) {
			return false
		}
	})
	
	// Block S_UPDATE_ACHIEVEMENT_PROGRESS if noctenium was used within 1500 ms
	dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 'raw', {order: 999}, code => {
		let time_difference = Date.now() - timeout
		if (time_difference < 1500) {
			return false
		}
	})
	
}
