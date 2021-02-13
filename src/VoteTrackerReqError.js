module.exports = class VoteTrackerReqError extends Error {
    /**
     * Vote Tracker API error
     * @param {any} message - the error message
     */
    constructor(message) {
        if (typeof message !== "string") {
            if (typeof message === "object")
                message = JSON.stringify(message);
            if (message instanceof Buffer || message instanceof Function)
                message = message.toString();
        }

        super(message);
    }
}
