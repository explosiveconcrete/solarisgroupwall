const express = require('express')
const fs = require("fs")
const gen = require("./gen")
const port = 3000
let fetchedPosts = []
try {
    fetchedPosts = JSON.parse(fs.readFileSync("fetchedPosts.json", {encoding: "utf-8"}))
} catch (error) {
    console.warn(`Couldnt load fetched posts: ${error}`)
    process.exit(1)
}

let posts = []
try { 
    posts = JSON.parse(fs.readFileSync("groupWall.json", {encoding: "utf-8"}))
} catch (error) {
    console.warn(`Couldnt load previous posts: ${error}`)
}

let server = express()
server.use(express.static(__dirname + '/web'))
server.disable("etag")

server.get("/posts", (req, res) => {
    res.type("json").send({posts: posts})
})

function a() {
    for (let newPost of gen(fetchedPosts,1)) posts.unshift(newPost)
    setTimeout(a,15000)
}

a()
server.listen(port)
console.log(`Listening on port ${port}`)