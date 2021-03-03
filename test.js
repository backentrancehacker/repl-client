require("dotenv").config()
const client = new require("./")()

client.login(process.env.username, process.env.password)

client.on("ready", (details) => {
    console.log(details)
})