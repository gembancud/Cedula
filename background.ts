export {}

// console.log("hello from background")
//
//
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log("update called")
  if (tab.url.includes("facebook.com")) {
    if (changeInfo.status == "loading") {
      console.log("loadcomplete")
    }
  }
})
