let curPosts = []
let notifsEnabled = false

function loadPosts() {
    $.ajax("/posts").done(function(json) {
        let posts = json.posts
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
            if (posts[0] && !document.hasFocus() && notifsEnabled && Notification.permission == "granted") {
                let notif = new Notification(`New post from ${posts[0].author}`, { body: posts[0].content })
            }
        }
        if (posts.length == 0) $("#what").css("color", "#fff").text(`It's quiet in here...`).css("display", "")
        setTimeout(loadPosts, 10000)
    }).fail(function(req) {
        $("#what").css("color", "#f77").text(`Failed to load posts: ${req.statusText}`).css("display", "")
    })
}

function setnotifs(enabled) {
    notifsEnabled = enabled
    localStorage["notifsEnabled"] = notifsEnabled ? "yeah sure why not" : ""
    $("#notifBtn").text(`${notifsEnabled ? "Disable" : "Enable"} notifications`)
}

$("#notifBtn").on("click", function() {
    if (!("Notification" in window)) {
        alert("Your browser does not support notifications.")
        return
    }
    if (!notifsEnabled) {
        if (Notification.permission != "granted") {
            Notification.requestPermission().then((result) => {
                if (result == "granted") setnotifs(true)
                else alert("Notification permissions denied")
            });
        } else setnotifs(true)
    } else setnotifs(false)
})

loadPosts()
setnotifs(Boolean(localStorage["notifsEnabled"]))