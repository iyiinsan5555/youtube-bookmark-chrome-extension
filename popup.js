import { getCurrentTab } from "./utils.js";

const addNewBookmark = (videoId, time) => {
    chrome.storage.sync.get({ [videoId]: [] }, (data) => {
        const currentVideoBookmarks = data[videoId];
        if (!currentVideoBookmarks.includes(time)) currentVideoBookmarks.push(time);
        chrome.storage.sync.set({ [videoId]: currentVideoBookmarks }, () => {
            viewBookmarks(videoId);
        });
    });
};

const viewBookmarks = (videoId) => {
    chrome.storage.sync.get({ [videoId]: [] }, (data) => {
        const currentVideoBookmarks = data[videoId];
        let html = "";
        currentVideoBookmarks.forEach((time, index) => {
            html += `<div class="bookmark">
                        Time: ${time.toFixed(1)}s
                        <button data-index="${index}" class="play-btn">Play</button>
                        <button data-index="${index}" class="delete-btn">Delete</button>
                     </div>`;
        });
        const container = document.querySelector(".container");
        container.innerHTML = html;

        container.querySelectorAll(".play-btn").forEach(btn => btn.addEventListener("click", onPlay.bind(null, videoId)));
        container.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", onDelete.bind(null, videoId)));
    });
};

const onPlay = (videoId, e) => {
    const index = e.target.dataset.index;
    chrome.storage.sync.get({ [videoId]: [] }, (data) => {
        const time = data[videoId][index];
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: "play", time });
        });
    });
};

const onDelete = (videoId, e) => {
    const index = e.target.dataset.index;
    chrome.storage.sync.get({ [videoId]: [] }, (data) => {
        const bookmarks = data[videoId];
        bookmarks.splice(index, 1);
        chrome.storage.sync.set({ [videoId]: bookmarks }, () => {
            viewBookmarks(videoId);
        });
    });
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getCurrentTab();
    if (!activeTab.url.includes("youtube.com/watch")) {
        document.querySelector(".container").innerHTML = `<div class="title">This is not a YouTube page. URL: ${activeTab.url}</div>`;
        return;
    }

    const urlParams = new URLSearchParams(activeTab.url.split("?")[1]);
    const videoId = urlParams.get("v");

    if (!videoId) return;

    viewBookmarks(videoId);

    document.querySelector("#addBookmark").addEventListener("click", () => {
        chrome.tabs.sendMessage(activeTab.id, { type: "getTime" }, (response) => {
            if (response && response.currentTime !== undefined) {
                addNewBookmark(videoId, response.currentTime);
            }
        });
    });
});
