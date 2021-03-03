class ReplException extends Error {
	constructor(...message) {
		super(message.join(' '))
		this.name = "repl-client exception"
	}
}

module.exports = ReplException