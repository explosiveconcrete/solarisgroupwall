const { MarkovData, Markov } = require("kurwov")
const fs = require("fs")

module.exports = function(fetchedPosts, postGenCount) {
    let sentences = []
    for (let post of fetchedPosts) {
        sentences.push(`${post.author}: ${post.content.trim()}`)
    }
    const data = new MarkovData(sentences)
    let what = []
    for (let postNum = 0; postNum < postGenCount; postNum++) {
        let post = Markov.generate({data})
        what.push({ author: post.split(":")[0], content: post.substring(post.split(":")[0].length+1).trim() })
    }
    return what
}