const express = require('express')
const fs = require("fs")
const gen = require("./gen")
const cors = require("cors")
const port = 3000
const genInterval = 60000
const genCount = 1
const CyclicDB = require("@cyclic.sh/dynamodb")
global.db = CyclicDB("odd-erin-chick-tamCyclicDB")
let collection = global.db.collection("data")
let fetchedPosts = []
try {
   collection.get("fetchedPosts").then(item => {
    fetchedPosts = item.props.data
   })
} catch (error) {
    console.warn(`Couldnt load fetched posts: ${error}`)
}

let lastGen = Date.now()
let posts = []
try { 
    collection.get("genPosts").then(item => {
        if (item) {
            posts = item.props.data ?? posts
            lastGen = item.props.lastGen ?? lastGen
        }
        console.log("gen posts fetched")
    })
} catch (error) {
    console.warn(`Couldnt load previous posts: ${error}`)
}

let server = express()
server.use(cors({origin: "*"}), express.static(__dirname + '/web'))
server.disable("etag")

server.get("/posts", (req, res) => {
    let postGenCount = Math.floor((Date.now()-lastGen)/genInterval)*genCount
    for (let newPost of gen(fetchedPosts,postGenCount)) posts.unshift(newPost)
    if (postGenCount > 0) {
        lastGen = Date.now()
        try {
            collection.set("genPosts", {
                lastGen: lastGen,
                data: posts
            })
        } catch (error) {
            console.warn(`Error saving generated posts: ${error}`)
        }
    }
    res.type("json").send({posts: posts})
})

server.get("/reqdl", (req, res) => {
    try {
        require("./dl")()
        res.sendStatus(200)
    } catch (error) {
        console.warn(`Post download error: ${error}`)
    }
})
server.get("/getdl", (req, res) => {
    collection.get("fetchedPosts").then(item => {
        res.send({ posts: item.props.data })
    }) 
})

// function a() {
//     for (let newPost of gen(fetchedPosts,1)) posts.unshift(newPost)
//     setTimeout(a,15000)
// }

// a()
server.listen(port)
console.log(`Listening on port ${port}`)