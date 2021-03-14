require("dotenv").config()
const ReplClient = require("./")

const client = new ReplClient()

client.login(process.env.connect_sid)
client.create({
    title: "test",
    body: "example post with repl client",
    board: "share"
})