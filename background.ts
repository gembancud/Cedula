import { AddCedulas, FaceBookAddCedulas } from "./cedula"

export {}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url.includes("facebook.com")) {
    // AddCedulas("fb", "Philippines")
    console.log("hello from background")
    FaceBookAddCedulas()
  }
})
