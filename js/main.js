const openMenu = document.getElementById("open-menu");
const cards = document.querySelector(".cards");
const contentMenu = document.querySelector(".content-menu");
const contentPost = document.querySelector(".content-post");
const backmodal = document.querySelector(".backmodal");
const myBar = document.getElementById("myBar");

const host = window.location.hostname;
let baseUrl;

//if(host == "127.0.0.1") 
//    baseUrl = new URL("", "http://127.0.0.1:5500");
//else
baseUrl = new URL("/devcode-steps", "https://abel-hzo.github.io");

let nosections = 0;
let completed = 0;
let progress = 0;

function progressColor(percent) {
    if (percent < 40) return "#e53935";   // rojo
    if (percent < 70) return "#fbc02d";   // amarillo
    return "#43a047";                     // verde
}

// function calculateWeight(content) {
//     let total = 0;

//     content.forEach(section => {
//         Object.values(section).forEach(value => {
//             if (typeof value === "string") {
//                 total += value.length;
//             } else if (Array.isArray(value)) {
//                 total += value.join("").length;
//             } else if (typeof value === "object") {
//                 total += JSON.stringify(value).length;
//             }
//         });
//     });

//     return total;
// }

let displayedProgress = 0;

function animateProgress(target) {
    return new Promise(resolve => {
        function step() {
            // console.log(displayedProgress);
            if (displayedProgress < target) {
                displayedProgress += 1;
                myBar.style.width = displayedProgress + "%";
                myBar.textContent = displayedProgress + "%";
                myBar.style.backgroundColor = progressColor(displayedProgress);
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        step();
    });
}

window.onload = function () {

    myBar.style.width = "0%";
    myBar.textContent = "0%";
    backmodal.style.display = "flex";
    completed = 0;

    /* LOAD CARDS */
    fetch(baseUrl + "/data/cards.json")
        .then(response => response.json())
        .then(async data => {

            const totalWeight = JSON.stringify(data).length;
            const processedWeight = JSON.stringify(data).length;
            displayedProgress = 0;

            let html = "";

            for (const element of data) {

                html += `
                <div class="card" onclick="loadMenu('${element.url}');">
                    <img src="${baseUrl}${element.image}" alt="spring-boot">
                    <div class="text-card">
                        <h4>${element.title}</h4>
                        <p>${element.description}</p>
                    </div>
                </div>`;

                console.log(processedWeight + " - " + totalWeight);    
                const targetProgress = Math.round(processedWeight * 100 / totalWeight);
                await animateProgress(targetProgress);

            }

            cards.innerHTML = html;
            backmodal.style.display = "none";
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

const postCache = new Map();

async function loadPost(url) {

    if (postCache.has(url)) {
        contentPost.innerHTML = postCache.get(url);
        Prism.highlightAll();
        openMenu.checked = false;
        return;
    }

    myBar.style.width = "0%";
    myBar.textContent = "0%";
    backmodal.style.display = "flex";
    completed = 0;

    const response = await fetch(baseUrl + url);
    const data = await response.json();

    cards.style.display = "none";

    const totalWeight = JSON.stringify(data.content).length;

    let processedWeight = 0;
    displayedProgress = 0;

    let html = `
        <div class="header">
            <img src="${baseUrl}${data.generic_image}" alt="spring-boot">
            <p>${data.generic_title}</p>
        </div>
        <div class="body">
            <h2 class="title-post">${data.title}</h2>
            <p class="author">🖥️ Por ${data.author}</p>
        `;

    for (const section of data.content) {

        Object.keys(section).forEach(key => {

            const value = section[key];

            switch (key) {
                case "subtitle":
                    html += `<h3 class="subtitle-post">${value}</h3>`;
                    break;
                case "text":
                    html += `<p class="text">${loadTextAndCode(value)}</p>`;
                    break;
                case "code":
                    html += `<pre class="code-block line-numbers"><code class="language-${value.lang}">`;
                    html += loadTextAndCode(value.path);
                    html += `</code></pre>`;
                    break;
                case "image":
                    html += `<img style="max-width: ${value.maxwidth};" src="${baseUrl}${value.src}" alt="image1" ></img>`;
                    break;
                case "list":
                    html += `
                            <ul class="steps-list">
                                ${loadTextAndCode(value)}
                            </ul>
                        `;
                    break;
            }

        });  // Object.keys(section)

        processedWeight += JSON.stringify(section).length + 1;

        const targetProgress = Math.ceil(processedWeight * 100 / totalWeight);
        await animateProgress(targetProgress);

        // console.log(totalWeight + " - " + processedWeight);

        openMenu.checked = false;

    }

    html += "</div>";

    contentPost.innerHTML = html;
    postCache.set(url, contentPost.innerHTML);

    backmodal.style.display = "none";

    Prism.highlightAll();
}

function loadTextAndCode(url) {
    let content = "";
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            content = xhr.responseText;
        }
    }

    xhr.open("GET", baseUrl + url, false);
    xhr.send();

    return content;
}