## No More Noctenium Lag
Tera-Proxy module for Tera Online. Blocks packets which caused client lag when using Noctenium.
### Known Issues
* Client side Noctenium amount will not update in-combat until you open your inventory or you run out of Noctenium.
* Projectile skills (especially gunner's Arcane Barrage and Mana Missiles) are lagged server side when noctenium is active. Having more noctenium in your inventory makes this worse. Because this is server-side, there is no fix. :(
* Getting the last hit on an achievement mob/boss while using Noctenium may delay achievement unlock client-side. Consuming any consumable in your inventory, advancing a different type of achievement, or relogging your character should fix this.
### Requirements
[Tera-Proxy](https://github.com/meishuu/tera-proxy) and dependencies

The following opcodes must be mapped in your `tera-proxy/node_modules/tera-data/map/protocol.{version}.map` file:
* C_SHOW_INVEN
* S_ABNORMALITY_BEGIN
* S_ABNORMALITY_END
* S_ACTION_STAGE
* S_INVEN_CHANGEDSLOT
* S_INVEN
* S_LOGIN
* S_USER_STATUS
* S_UPDATE_ACHIEVEMENT_PROGRESS
