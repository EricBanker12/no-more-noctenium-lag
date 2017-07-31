// Edit these variables for different methods.
module.exports = {
	inventoryMethod: 'Skill',		// Choose a method for preventing inventory packet lag.
									// "Skill" method blocks the next inventory packets
									// after using a skill with noctenium.
									// "Combat" method (NOT YET IMPLEMENTED!!!)
									// always blocks inventory packets
									// during combat with noctenium except when openning
									// your inventory.
									// "None" does not block inventory packets
	
	achievementMethod: 'Skill'		// Choose a method for preventing achievement packet lag.
									// "Skill" method blocks the next achievement packet
									// after using a skill with noctenium.
									// "Smart" method made by Pinkie Pie. I can't figure out
									// how it works. >_<
									// "None" does not block achievement packets
}
