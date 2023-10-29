let curPosts = []

function loadPosts() {
    $.ajax("/posts").done(function(json) {
        let posts = json.posts
        console.log(posts)
        if (curPosts.length == 0 || posts[0].content != curPosts[0].content) {
            curPosts = posts
            console.log("they are not the same")
            $("#actualPosts").text("")
            for (let post of posts) {
                let div = document.createElement("div")
                div.classList.add("post")
                let author = document.createElement("a"); $(author).addClass("author").text(post.author); div.appendChild(author)
                let content = document.createElement("a"); $(content).addClass("content").text(post.content); div.appendChild(content)
                $("#actualPosts").append(div)
            }
            $("#what").css("display", "none")
        }
        if (posts.length == 0) $("#what").css("color", "#fff").text(`It's quiet in here...`).css("display", "")
        setTimeout(loadPosts, 10000)
    }).fail(function(req) {
        $("#what").css("color", "#f77").text(`Failed to load posts: ${req.statusText}`).css("display", "")
    })
}

loadPosts()