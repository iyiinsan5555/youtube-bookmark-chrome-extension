const data = {}; //Whole data for extension
let lastVideoId = null;

function main() {
    console.log("Content script loaded");

    // Listen for background messages
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.type === "new-video") {
            newPageLoaded(msg.videoId);
        } else if (msg.type === "getTime") {
            const video = document.querySelector("video");
            sendResponse({ currentTime: video ? video.currentTime : 0 });
        } else if (msg.type === "play") {
            const video = document.querySelector("video");
            if (video) {
                video.currentTime = msg.time;
                video.play();
            }
        }
    });

    // SPA navigation detection
    const observer = new MutationObserver(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get("v");
        if (videoId && videoId !== lastVideoId) {
            lastVideoId = videoId;
            console.log("Detected video change:", videoId);
            newPageLoaded(videoId);
        }
    });

    observer.observe(document, { subtree: true, childList: true });
}

function newPageLoaded(videoId) {
    console.log("new page loaded, creating a bookmark button", videoId);
    setBookmarkButton(videoId);
}

function setBookmarkButton(videoId) {
    if (document.querySelector(".bookmark-btn")) return; //Prevent duplicates

    const bookmarkButton = document.createElement("img");
    bookmarkButton.src = chrome.runtime.getURL("assets/bookmark.png");
    bookmarkButton.classList.add("ytp-button", "bookmark-btn");
    bookmarkButton.title = "Click to set bookmark!";

    const youtubeLeftControls = document.querySelector(".ytp-left-controls");
    const videoStream = document.querySelector("video");

    if (!youtubeLeftControls || !videoStream) return;

    youtubeLeftControls.appendChild(bookmarkButton);

    bookmarkButton.addEventListener("click", () => {
        addNewBookmark(videoId, videoStream.currentTime);
    });
}

// Store bookmarks without duplicates
function addNewBookmark(videoId, time) {
  chrome.storage.sync.get({ [videoId]: [] }, (result) => { //Also it loads data from storage
    const bookmarks = result[videoId];

    if (!bookmarks.includes(time)) {
      bookmarks.push(time);
      chrome.storage.sync.set({ [videoId]: bookmarks });
      console.log("Bookmark added:", { videoId, bookmarks });
    } else {
      console.log("Bookmark already exists for this time:", time);
    }
  }); //Creates list for each videoId and stores time in that list
}

main();
