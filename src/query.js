const fetch = require("node-fetch")
const Exception = require("./exception")

const parse = res => res.json()

const query = async (body) => {
	let headers = require("./headers")
	try {
		if(global.cookies) {
			headers.Cookie = global.cookies
		}

		const res = await fetch("https://repl.it/graphql", {
			method: "POST",
			headers,
			body: JSON.stringify(body)
		}).then(parse)

		return res.data || res.errors || {}
	}
	catch(e) {
		throw new Exception(e.message.startsWith("invalid json")
			? "blocked by cloudfare"
			: e.message
		)
	}
}

module.exports = query