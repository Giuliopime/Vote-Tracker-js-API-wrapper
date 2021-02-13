const express = require('express')
const bodyParser = require('body-parser')
const eventEmitter = require('event-emitter');
const axios = require("axios").default
const VoteTrackerReqError = require("./VoteTrackerReqError")

const version = "v1"
const baseURL = `https://api.votetracker.bot/${version}`

const sources = ["topgg", "dbl", "dboats", "bfd"]
const types = ["bot", "server"]

module.exports = class VoteTrackerAPI {
    /**
     * Class constructor (either a botID or a serverID must be provided, or both)
     * @param {string} botID - the ID of the bot you need to track votes for
     * @param {string} [serverID] - the ID of the server you need to track votes for
     * @param {string} apiToken - your Vote Tracker API key
     *
     * @param {object} [options] - Options for the API wrapper
     * @param {string} options.defaultSource - The default source for all the methods that check for votes. Available sources are: "topgg", "dbl", "dboats", "bfd"
     * @param {string} options.defaultType - The default type ("bot" or "server") for all the methods that check for votes
     *
     * @param {object} options.webhooks - webhook settings
     * @param {string} options.webhooks.port - webhook port
     * @param {string} options.webhook.topgg - topgg route
     * @param {string} options.webhook.dbl - dbl route
     * @param {string} options.webhook.dboats - dboats route
     * @param {string} options.webhook.bfd - bfd route
     * @throws {TypeError} check the error message
     */
    constructor(botID, serverID, apiToken, options = { defaultSource: "topgg", defaultType: "bot" }) {
        if(!botID && !serverID)
            throw new TypeError("You need to either pass an ID of a bot or an ID of a server")
        if(!apiToken)
            throw new TypeError("Missing API token");
        if(typeof options !== "object")
            throw new TypeError("The options parameter needs to be an object")

        if(!options.defaultSource)
            options.defaultSource = "topgg"
        else if(!sources.includes(options.defaultSource))
            throw new TypeError(`Illegal options defaultSource, must be one of ${sources}`)

        if(!options.defaultType)
            options.defaultType = botID ? "bot" : "server"
        else if(!types.includes(options.defaultType))
            throw new TypeError(`Illegal options defaultType, must be one of ${types}`)

        this._axiosInstance = axios.create({
            baseURL: baseURL,
            headers: {
                authorization: apiToken,
                "Content-Type": "application/json"
            }
        })

        if(options.webhooks)
            this._configureWebhooks(options.webhooks)
        this._events = {};

        this._botID = botID
        this._serverID = serverID
        this._apiToken = apiToken
        this._options = options
    }

    /**
     * Checks for the last vote of a specific user (returns null if he never voted in the last month)
     * @param userID - the ID of the user
     * @param [source] - The source to check from ("topgg", "dbl", "dboats", "bfb")
     * @param [type] - Either "bot" or "server"
     * @returns {Promise<LastVote|null>}
     * @throws {TypeError|VoteTrackerReqError} check the error message
     */
    async lastVote(userID, source = this.options.defaultSource, type = this.options.defaultType) {
        this._checkVoteMethodsParams(userID, source, type)

        const path = type === "bot" ? `/bot/${this._botID}/votes/${source}/${userID}` : `/guild/${this._serverID}/votes/${source}/${userID}`
        return await this._sendRequest(path)
    }

    /**
     * Checks if the user has voted in the last 12 hours
     * @param userID - the ID of the user
     * @param [milliseconds] - can replace the default 12 hours with a new time
     * @param [source] - The source to check from ("topgg", "dbl", "dboats", "bfb")
     * @param [type] - Either "bot" or "server"
     * @returns {Promise<boolean>}
     * @throws {TypeError|VoteTrackerReqError} check the error message
     */
    async hasVoted12Hours(userID, milliseconds = 43200000, source = this.options.defaultSource, type = this.options.defaultType) {
        this._checkVoteMethodsParams(userID, source, type)

        if (milliseconds <= 0)
            throw new TypeError("Mate I can't predict the future I'm sorry")

        const path = type === "bot" ? `/bot/${this._botID}/votes/${source}/${userID}` : `/guild/${this._serverID}/votes/${source}/${userID}`

        const data = await this._sendRequest(path);
        if(!data)
            return false

        return (Date.now() - data.timestamp) <= milliseconds
    }

    /**
     * Don't use this
     */
    async _sendRequest(path) {
        try {
            const res = await this._axiosInstance.get(path)
            return res.data
        } catch (err) {
            if(err.response && err.response.status) {
                const status = err.response.status

                if(status >= 500) {
                    throw new VoteTrackerReqError({
                        statusCode: status,
                        data: err.response.data,
                        type: "Server error :monkaX:",
                        message: "Can't do much about that, it's an issue with Vote Tracker servers, not on your end"
                    })
                } else {
                    switch (err.response.status) {
                        case 400: {
                            throw new VoteTrackerReqError({
                                statusCode: status,
                                data: err.response.data,
                                type: "Bad request",
                                message: "Error probably related to an invalid ID"
                            })
                        }
                        case 401: {
                            throw new VoteTrackerReqError({
                                statusCode: status,
                                data: err.response.data,
                                type: "Unauthorized",
                                message: "Invalid API token"
                            })
                        }
                        case 404: {
                            return null
                        }
                        case 429: {
                            throw new VoteTrackerReqError({
                                statusCode: status,
                                data: err.response.data,
                                type: "Rate Limited",
                                message: "You are getting rate limited :monkaS:"
                            })
                        }
                        default: {
                            throw new VoteTrackerReqError({
                                statusCode: status,
                                data: err.response.data,
                                type: "¯\\_(ツ)_/¯",
                                message: "¯\\_(ツ)_/¯"
                            })
                        }
                    }
                }
            }
        }
    }

    /**
     * Don't use this
     */
    _checkVoteMethodsParams(userID, source, type) {
        if(!userID)
            throw new TypeError("Missing user ID")
        if(!sources.includes(source))
            throw new TypeError(`Illegal source, must be one of ${sources}`)
        if(!types.includes(type))
            throw new TypeError(`Illegal type, must be one of ${types}`)

        if(type === "bot" && !this._botID)
            throw new TypeError("No bot ID has been provided")
        if(type === "server" && !this._serverID)
            throw new TypeError("No server ID has been provided")
    }

    /**
     * Don't use this
     */
    _configureWebhooks(webhooks) {
        if (!webhooks.port)
            throw new TypeError("Provide a valid port for the webhook")

        if (!webhooks.topgg && !webhooks.dbl && !webhooks.dboats && !webhooks.bfd)
            throw new TypeError("You must provide at least a source route")

        const app = express()
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())

        if(webhooks.topgg) {
            if(!webhooks.topgg.startsWith("/"))
                webhooks.topgg = "/" + webhooks.topgg;

            app.post(webhooks.topgg, (req, res) => {
                const voteData = {
                    userID: req.body.user,
                    botID: req.body.bot,
                    type: req.body.type,
                    isWeekend: req.body.isWeekend,
                    fullWebhook: req.body
                }
                if(req.body.guild) {
                    voteData.serverID = req.body.guild
                    delete voteData.botID
                }

                this.emit("topgg", voteData)

                res.status(200)
            });
        }

        if(webhooks.dbl) {
            if(!webhooks.dbl.startsWith("/"))
                webhooks.dbl = "/" + webhooks.dbl;

            app.post(webhooks.dbl, (req, res) => {
                const voteData = {
                    userID: req.body.id,
                    admin: req.body.admin,
                    avatar: req.body.avatar,
                    username: req.body.username,
                    fullWebhook: req.body
                }

                this.emit("dbl", voteData)

                res.status(200)
            });
        }

        if(webhooks.dboats) {
            if(!webhooks.dboats.startsWith("/"))
                webhooks.dboats = "/" + webhooks.dboats;

            app.post(webhooks.dboats, (req, res) => {
                const voteData = {
                    userID: req.body.user.id,
                    username: req.body.user.username,
                    discriminator: req.body.user.discriminator,
                    fullWebhook: req.body
                }

                this.emit("dboats", voteData)

                res.status(200)
            });
        }

        if(webhooks.bfd) {
            if(!webhooks.bfd.startsWith("/"))
                webhooks.bfd = "/" + webhooks.bfd;

            app.post(webhooks.bfd, (req, res) => {
                const voteData = {
                    userID: req.body.user,
                    votes: req.body.votes,
                    fullWebhook: req.body
                }

                this.emit("bfd", voteData)

                res.status(200)
            });
        }

        app.listen(webhooks.port, () =>
            this.emit("ready", `Listening to vote webhooks at http://localhost:${webhooks.port}`)
        )
    }

    // Getters
    get botID() {
        return this._botID
    }
    get serverID() {
        return this._serverID
    }
    get apiToken() {
        return this._apiToken
    }
    get options() {
        return this._options
    }
}

eventEmitter(this.VoteTrackerAPI.prototype);

/**
 * @typedef {object} LastVote
 * @prop {string} entity_id - the ID of the bot / server
 * @prop {string} user_id - the ID of the user who voted
 * @prop {string} source - the source ("topgg", "dbl", "dboats", "bfb")
 * @prop {string} timestamp - the unix epoch millis timestamp of the last vote of the user
 */

/**
 * @typedef {string} VoteTrackerReqError
 */
