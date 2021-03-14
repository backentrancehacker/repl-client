let cookies = ""

const headers = () => ({
	"X-Requested-With": "repl-post",
	"Referrer": "https://repl.it/@phamn23",
	"Origin": "https://repl.it",
	"Content-Type": "application/json",
	"Accept": "application/json",
	"Accept-Encoding": "gzip, deflate, br",
	"Connection": "keep-alive",
	"Cookie": cookies || ""
})

const setCookie = (connect_sid) => {
	cookies = `connect.sid=${connect_sid};`
}


module.exports = {
	setCookie,
	headers
}