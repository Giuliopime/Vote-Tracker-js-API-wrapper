# Vote Tracker js API wrapper
## Info
Unofficial wrapper for Vote Tracker Discord bot API.

**To use Vote Tracker API you must request an API key to [Xavinlol](https://github.com/Xavinlol) (the creator of Vote Tracker Bot and all its related content).**  
You can do that by joining [Vote Tracker's Support Server](https://discord.gg/4WzJWuq).

## Installation
```
npm i vote-tracker-js-api-wrapper
```

## Module usage examples
### Check the last time a user has voted for your bot on top.gg
```js
const VoteTrackerAPIWrapper = require("vote-tracker-js-api-wrapper")

const botID = "the ID of your bot"
const apiToken = "your apiToken"
const VoteTracker = new VoteTrackerAPIWrapper(botID, null, apiToken)

const userID = "ID of the user for which you want to check the last vote"
const lastVote = await VoteTracker.lastVote(userID)
/*
lastVote will be a javascript object with the following properties or it will be null if the user hasn't voted in the last month
 @prop {string} entity_id - the ID of the bot / server
 @prop {string} user_id - the ID of the user who voted
 @prop {string} source - the source ("topgg", "dbl", "dboats", "bfb")
 @prop {string} timestamp - the unix epoch millis timestamp of the last vote of the user
 */
```  


### Check if a user has voted in the last 12 hours for your bot on botsfordiscord.com
```js
const VoteTrackerAPIWrapper = require("vote-tracker-js-api-wrapper")

const botID = "the ID of your bot"
const apiToken = "your apiToken"
// Sets the default website to check votes from (can be "topgg", "bfd", "dbl", "dboats")
const options = {
    defaultSource: "bfd"
}
const VoteTracker = new VoteTrackerAPIWrapper(botID, null, apiToken, options)

const userID = "ID of the user for which you want to check the last vote"
const hasVoted12Hours = await VoteTracker.hasVoted12Hours(userID)
console.log(hasVoted12Hours) // true | false

// You can also set a different time instead of 12 hours by specifing it via milliseconds, example:
const milliseconds = 3600000 // equals 1 hour
const hasVoted1Hour = await VoteTracker.hasVoted12Hours(userID, milliseconds)
console.log(hasVoted1Hour) // true | false
```  


### Check if a user has voted in the last 12 hours for your server on top.gg
```js
const VoteTrackerAPIWrapper = require("vote-tracker-js-api-wrapper")

const serverID = "the ID of your server"
const apiToken = "your apiToken"

const VoteTracker = new VoteTrackerAPIWrapper(null, serverID, apiToken)

const userID = "ID of the user for which you want to check the last vote"
const hasVoted12Hours = await VoteTracker.hasVoted12Hours(userID)
console.log(hasVoted12Hours) // true | false

// You can also set a different time instead of 12 hours by specifing it via milliseconds, example:
const milliseconds = 3600000 // equals 1 hour
const hasVoted1Hour = await VoteTracker.hasVoted12Hours(userID, milliseconds)
console.log(hasVoted1Hour) // true | false
```  


#### Other examples
```js
const VoteTrackerAPIWrapper = require("vote-tracker-js-api-wrapper")

const botID = "the ID of your bot"
const serverID = "the ID of your server"
const apiToken = "your apiToken"
// Sets the default website to check votes from (can be "topgg", "bfd", "dbl", "dboats") and the default type, so if checks for your bot or server by default
const options = {
    defaultSource: "topgg",
    defaultType: "server"
}
const VoteTracker = new VoteTrackerAPIWrapper(botID, serverID, apiToken, options)

const userID = "ID of the user for which you want to check the last vote"
const lastVote = await VoteTracker.hasVoted12Hours(userID)
console.log(lastVote) // true | false (has voted in the past 12 hours for your server on top.gg)

let type = "bot"
const lastVote = await VoteTracker.hasVoted12Hours(userID, null, type)
console.log(lastVote) // true | false (has voted in the past 12 hours for your bot on top.gg)

const source = "bfb"
type = "bot"
const lastVote = await VoteTracker.hasVoted12Hours(userID, source, type)
console.log(lastVote) // true | false (has voted in the past 12 hours for your bot on botsfordiscord.com)

// For more info you can dive into the index.js file, it's pretty easy to understand its comments
```
