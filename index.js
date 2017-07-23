// module for tera-proxy
module.exports = function noMoreNocteniumLag(dispatch) {
	
	// Variables
	let timeout = 0,
	cid = null,
	enabled = false
	
	// S_LOGIN
	dispatch.hook('S_LOGIN', 2, event => {
		cid = event.cid
		enabled = false
	})
	
	// S_ABNORMALITY_BEGIN
	dispatch.hook('S_ABNORMALITY_BEGIN', 2, {order: -100}, event => {
		if (event.target.equals(cid) && [902, 910, 911, 912, 913, 916].includes(event.id)) {
			enabled = true
		}
	})
	
	// S_ABNORMALITY_END
	dispatch.hook('S_ABNORMALITY_END', 1, {order: -100}, event => {
		if (event.target.equals(cid) && [902, 910, 911, 912, 913, 916].includes(event.id)) {
			enabled = false
		}
	})
	
	// S_ACTION_STAGE
	dispatch.hook('S_ACTION_STAGE', 1, {order: -100}, event => {
		if (enabled) {
			timeout = Date.now()
		}
	})
	
	// S_INVEN
	dispatch.hook('S_INVEN', 'raw', {order: -100}, code => {
		let time_difference = Date.now() - timeout
		if (time_difference < 100) {
			return false
		}
	})
	
	// S_INVEN_CHANGEDSLOT
	dispatch.hook('S_INVEN_CHANGEDSLOT', 'raw', {order: -100}, code => {
		let time_difference = Date.now() - timeout
		if (time_difference < 100) {
			return false
		}
	})
	
	// S_UPDATE_ACHIEVEMENT_PROGRESS
	dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 'raw', {order: -100}, code => {
		let time_difference = Date.now() - timeout
		if (time_difference < 1500) {
			return false
		}
	})
	
}