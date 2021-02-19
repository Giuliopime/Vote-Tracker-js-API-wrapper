# Vote Tracker js API wrapper
## Info
An unofficial wrapper for the [Vote Tracker Discord bot](https://discord.com/oauth2/authorize?client_id=479688142908162059&scope=bot&permissions=268561472) API.

**To use the Vote Tracker API you must request an API token to [Xavinlol](https://github.com/Xavinlol) (the creator of Vote Tracker and all its related content).**  
You can do that by joining [Vote Tracker's Support Server](https://discord.gg/4WzJWuq).

## Installation
```
npm i vote-tracker-js-api-wrapper
```

## IMPORTANT
**If you need support with the wrapper join the [Vote Tracker's Support Server](https://discord.gg/4WzJWuq) and ask for help in the related API channel.  
**Do not ask Xavin for support!**

## Module usage examples
Disclaimer: I haven't put awaited methods in actual async functions just to make the examples look simpler, just remember most of the examples need to go inside async functions.

### Vote events
**In order to listen to vote events you will need to run a few commands with the Vote Tracker Discord bot.**  
For example, if you are tracking votes for your bot, and you set up those bot lists:  
![Example](https://i.ibb.co/x8CxSWX/votetrackerexample.png)  
You will need to use the following commands to make Vote Tracker forward all the webhooks to your server:  
```
dbl?bot setforwardurl 1 http://serverIP:3000/topggRoute
dbl?bot setforwardurl 2 http://serverIP:3000/dbl
dbl?bot setforwardurl 3 http://serverIP:3000/dboats
dbl?bot setforwardurl 4 http://serverIP:3000/bfd
```
(3000 is just a random port, just make sure to match it in the API wrapper configs like I do in the example below, also, if it's not working, make sure you opened that port in the firewall)

Once you set that up, you can listen to vote events like this:  
```js
const VoteTrackerAPIWrapper = require("vote-tracker-js-api-wrapper")

const botID = "the ID of your bot"
const apiToken = "your apiToken"
// Make sure to match the various routes to the ones you have set with the dbl?bot setforwardurl command
const options = {
    webhooks: {
        port: 3000,
        topgg: "/topggRoute",
        dbl: "/dbl",
        dboats: "/dboats",
        bfd: "/bfd"
    }
}
const VoteTracker = new VoteTrackerAPIWrapper(botID, null, apiToken, options)

VoteTracker.once("ready", message => {
    console.log(message);
})

/*
Every voteData object contains the userID property with the ID of the user who voted.
It has a few other properties which you can see in the index.js file or by console logging them.
It also always contain the full webhook data at voteData.fullWebhook
 */
VoteTracker.on("topgg", voteData => {
    console.log(voteData)
})

VoteTracker.on("dbl", voteData => {
    console.log(voteData)
})

VoteTracker.on("dboats", voteData => {
    console.log(voteData)
})

VoteTracker.on("bfd", voteData => {
    console.log(voteData)
})
```  

### Check the last time a user has voted for your bot on top.gg
```js
const VoteTrackerAPIWrapper = require("vote-tracker-js-api-wrapper")

const botID = "the ID of your bot"
const apiToken = "your apiToken"
const VoteTracker = new VoteTrackerAPIWrapper(botID, null, apiToken)

const userID = "ID of the user for which you want to check the last vote"
try {
    const lastVote = await VoteTracker.lastVote(userID)
} catch (e) {
    console.log(e)
}
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
try {
    const hasVoted12Hours = await VoteTracker.hasVoted12Hours(userID)
    console.log(hasVoted12Hours) // true | false
} catch (e) {
    console.log(e)
}

// You can also set a different time instead of 12 hours by specifing it via milliseconds, example:
const milliseconds = 3600000 // equals 1 hour
try {
    const hasVoted1Hour = await VoteTracker.hasVoted12Hours(userID, milliseconds)
    console.log(hasVoted1Hour) // true | false
} catch (e) {
    console.log(e)
}
```  


### Check if a user has voted in the last 12 hours for your server on top.gg
```js
const VoteTrackerAPIWrapper = require("vote-tracker-js-api-wrapper")

const serverID = "the ID of your server"
const apiToken = "your apiToken"

const VoteTracker = new VoteTrackerAPIWrapper(null, serverID, apiToken)

const userID = "ID of the user for which you want to check the last vote"
try {
    const hasVoted12Hours = await VoteTracker.hasVoted12Hours(userID)
    console.log(hasVoted12Hours) // true | false
} catch (e) {
    console.log(e)
}
```  


### Other examples
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
try {
    const lastVote = await VoteTracker.hasVoted12Hours(userID)
    console.log(lastVote) // true | false (has voted in the past 12 hours for your server on top.gg)
} catch (e) {
    console.log(e)
}

let type = "bot"
try {
    const lastVote = await VoteTracker.hasVoted12Hours(userID, null, type)
    console.log(lastVote) // true | false (has voted in the past 12 hours for your bot on top.gg)
} catch (e) {
    console.log(e)
}

const source = "bfb"
type = "bot"
try {
    const lastVote = await VoteTracker.hasVoted12Hours(userID, source, type)
    console.log(lastVote) // true | false (has voted in the past 12 hours for your bot on botsfordiscord.com)
} catch (e) {
    console.log(e)
}
// For more info you can dive into the index.js file, it's pretty easy to understand its comments
```
