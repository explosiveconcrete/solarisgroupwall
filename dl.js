const https = require("https")
const fs = require("fs")

const apiURL = "groups.roproxy.com" //implemented to deal with ratelimit issues of roblox's api endpoints
const groupId = 9486047
const postFetchCount = 1000

let posts = []
if (postFetchCount % 100 != 0) console.warn(`Post fetch count not divisible by 100! Will round up to ${Math.ceil(postDownloadCount/100)*100}`)
const urlRoot = `https://${apiURL}/v2/groups/${groupId}/wall/posts?limit=100&sortOrder=Desc`
let url = urlRoot

let postsCollection = global.db.collection("data")

function fetchPosts() {
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            if (resp.statusCode != 200) {
                console.log(`Request error ${resp.statusCode}: ${JSON.parse(data).errors[0].message}`)
            } else {
                let postData = JSON.parse(data)
                for (let postKey in postData.data) {
                    let p = postData.data[postKey]
                    posts.push({author: p.poster.user.username, content: p.body})
                }
                console.log(`Fetched ${posts.length} posts (next page cursor ${postData.nextPageCursor})`)
                url = urlRoot+"&cursor="+postData.nextPageCursor
                if (posts.length < postFetchCount) fetchPosts()
                else {
                    console.log("Saving post database...")
                    postsCollection.set("fetchedPosts", {
                        data: posts
                    })
                    //fs.writeFileSync("fetchedPosts.json", JSON.stringify(posts))
                }
            }      
        });
    }).on("error", (err) => {
        console.log(`Request error: ${err.message}`);
    });
}

module.exports = fetchPosts