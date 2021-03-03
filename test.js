require("dotenv").config()
const ReplClient = require("./")

const client = new ReplClient()

client.on("ready", (details) => {
    console.log(details)
})

client.login(process.env.username, process.env.password)