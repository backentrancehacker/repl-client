const fetch = require('node-fetch')
const ReplException = require('./repl-exception.js')

const parse = res => res.json()

const query = async body => {
	let headers = require('./headers')
	try {
		headers.Cookie = global.cookies
		let res = await fetch('https://repl.it/graphql', {
			method: 'POST',
			headers,
			body: JSON.stringify(body)
		}).then(parse)
		return res.data || res.errors || {}
	}
	catch(e) {
		throw new ReplException(e)
	}
}

module.exports = {
	parse,
	query
}