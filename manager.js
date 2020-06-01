const errors = {
	100: () => `Cannot initialize ReplClient with missing credentials`,
	101: () => `Cannot create a post without a title, body, and board`,
	102: details => `Invalid board "${details}"`,
	'custom': (e) => `${e}`,
	103: () => 'Cannot find a post without an id',
	104: () => 'Insufficient Repl.it permissions',
	105: () => 'Cannot comment on a post without a body',
	106: () => 'Cannot find a user without an id'
}
class Custom extends Error {
	constructor(message) {
		super(message)
		this.name = 'Custom Exception'
	}
}
class ReplClientError extends Custom {
	constructor(num, details) {
		super(errors[num](details) || 'Unknown error encountered')
		this.name = 'ReplClient Exception'
	}
}

(() => {
	module.exports = ReplClientError
}).call(this)