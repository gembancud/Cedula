import { AddCedulas } from "./cedula"

export {}

// console.log("hello from background")
//
//
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url.includes("facebook.com")) {
    AddCedulas()
  }
})
