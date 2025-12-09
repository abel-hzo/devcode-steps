const openMenu = document.getElementById("open-menu");
const cards = document.querySelector(".cards");
const contentMenu = document.querySelector(".content-menu");
const contentPost = document.querySelector(".content-post");

const baseUrl = new URL("/devcode-steps", "https://abel-hzo.github.io");

window.onload = function() {

    /* LOAD CARDS */
    fetch(baseUrl + "/data/cards.json")
    .then(response => response.json())
    .then(data => {

        let html = "";

        data.forEach(element => {
        html += `
            <div class="card" onclick="loadMenu('${element.url}');">
                <img src="${baseUrl}${element.image}" alt="spring-boot">
                <div class="text-card">
                    <h4>${element.title}</h4>
                    <p>${element.description}</p>
                </div>
            </div>
        `;
        });
    
        cards.innerHTML = html;

    });

    /* LOAD MENU */
    fetch(baseUrl + "/data/menu.json")
    .then(response => response.json())
    .then(data => { 
        let html = "";

        data.forEach(element => {
            html += `<li onclick="loadMenu('${element.url}')">${element.topic}</li>`;
        });

        contentMenu.innerHTML = html;

    });

}

function loadMenu(url) {

    let firstPostPath = "";

    fetch(baseUrl + url)
    .then(response => response.json())
    .then(data => {

        contentMenu.innerHTML = "";
        let html = "";

        firstPostPath = data[0].path;

        data.forEach(post => {
            // console.log(post);
            html += `<li onclick="loadPost('${post.path}');">${post.topic}</li>`;
        });

        contentMenu.innerHTML = html;

        // console.log(firstPostPath);
        loadPost(firstPostPath);

    });

}

function loadPost(url) {

    fetch(baseUrl + url)
    .then(response => response.json())
    .then(data => {

        cards.style.display = "none";

        let html = ""

        html += `
        <div class="header">
            <img src="${baseUrl}${data.generic_image}" alt="spring-boot">
            <p>${data.generic_title}</p>
        </div>
        <div class="body">
            <h2 class="title-post">${data.title}</h2>
            <p class="author">🖥️ Por ${data.author}</p>
        `;

        data.content.forEach(section => {
            
            Object.keys(section).forEach(key => {

                switch(key) {
                    case "subtitle":
                        html += `<h3 class="subtitle-post">${section[key]}</h3>`;
                        break;
                    case "text":
                        html += `<p class="text">${loadTextAndCode(section[key])}</p>`;
                        break;
                    case "code":
                        html += `<pre class="code-block line-numbers"><code class="language-${section[key].lang}">`;
                        html += loadTextAndCode(section[key].path);      
                        html += `</code></pre>`;
                        break;
                    case "image":
                        html += `<img style="max-width: ${section[key].maxwidth};" src="${baseUrl}${section[key].src}" alt="image1" ></img>`;
                        break;
                    case "list":
                        html += `
                            <ul class="steps-list">
                                ${loadTextAndCode(section[key])}
                            </ul>
                        `;
                        break;              
                }    
                        
            });

        });

        html += "</div>";

        contentPost.innerHTML = html;

        openMenu.checked = false;
        
        Prism.highlightAll();
    });

}

function loadTextAndCode(url) {
    let content = "";
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
            content = xhr.responseText;
        }
    }

    xhr.open("GET", baseUrl + url, false);
    xhr.send();

    return content;
}