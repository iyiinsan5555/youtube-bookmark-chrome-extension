chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "new-video",
      videoId: urlParameters.get("v")
    })
    
    console.log("✅ Sent message to content script");
  }
});

  //All background works and API works gonna happen here!

