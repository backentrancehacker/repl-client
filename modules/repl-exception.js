;(() => {
	module.exports = class ReplException extends Error {
		constructor(message) {
			super(message)
			this.name = 'repl-client exception'
		}
	}
}).call(this)