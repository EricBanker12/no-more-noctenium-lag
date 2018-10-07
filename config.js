// Edit these variables for different methods.
module.exports = {
    inventoryMethod: 'Combat',      // Choose a method for preventing inventory packet lag.
                                    
                                    // "Skill" method blocks the next inventory packets
                                    // after using a skill with noctenium.
                                    
                                    // "Combat" method is same as "Skill" method, but it 
                                    // only while in-combat
                                    
                                    // "None" does not block inventory packets
                                    
    achievementMethod: 'Combat',    // Choose a method for preventing achievement packet lag.
                                    
                                    // "Skill" method blocks the next achievement packet
                                    // after using a skill with noctenium.
                                    
                                    // "Combat" method is same as "Skill" method, but it 
                                    // only while in-combat
                                    
                                    // "None" does not block achievement packets
                                    
    timeout: 3000,                  // Failsafe timeout length in ms. If something messes up,
                                    // stop blocking packets after this much time from using
                                    // a skill. If too low, packets may fail to be blocked.
    
    debug: false                    // print debug info to proxy/cmd console
}
