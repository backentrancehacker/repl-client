const fetch = require("node-fetch")
const Exception = require("./exception")

const parse = res => res.json()

const query = async ({ body, ...options }) => {
	let headers = require("./headers")
	try {
		if(globals.cookies) {
			headers.Cookie = global.cookies
		}

		const res = await fetch("https://repl.it/graphql", {
			method: "POST",
			headers,
			body: JSON.stringify(body),
			...options
		}).then(parse)
		return res.data || res.errors || {}
	}
	catch(e) {
		throw new Exception(e)
	}
}

module.exports = query