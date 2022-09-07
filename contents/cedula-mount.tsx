import iconImage from "data-base64:~assets/ph.png"
import type { PlasmoContentScript } from "plasmo"
import React from "react"

import { all_tags } from "../constants"

export const config: PlasmoContentScript = {
  matches: [
    "https://www.plasmo.com/*",
    "https://www.facebook.com/*"
    // "https://www.github.com/*",
    // "https://www.w3schools.com/*"
  ]
}
const ConstructImageElement = () => {
  const para = document.createElement("div")
  para.style.float = "left"
  const img = document.createElement("img")
  img.src = iconImage
  img.width = 16
  img.height = 16
  return para.appendChild(img)
}

// TODO: Fix to dynamically trace queue from a given list
function TraceElements(tagList) {
  let crawler
  if (tagList.query[0] === 0) {
    crawler = document.querySelectorAll(tagList.path[0])
  } else {
    crawler = document.querySelector(tagList.path[0])
  }

  for (let i = 1; i < tagList.path.length; i++) {
    if (tagList.query[i] == 0) {
      crawler = crawler.querySelectorAll(tagList.path[i])
    } else {
      if (crawler) {
        crawler = crawler.querySelector(tagList.path[i])
      }
    }
  }
  return crawler
}

export const getMountPoint = async () => {
  await AddCedulas()
  return document.querySelector(all_tags.plasmo.feature_title)
}

const AddCedulas = async () => {
  const imageElement = ConstructImageElement()
  Object.values(all_tags.fb).forEach((tagList) => {
    // const elements = TraceElements(tagList)
    const elements = document.querySelectorAll(tagList.path[0])
    // const textNode = document.createTextNode("Cedula")

    for (const mountPoint of elements) {
      const toAppend = mountPoint.querySelector(":scope span")
      if (!toAppend) {
        continue
      }
      // Use this to debug where the mount is being placed
      // if (toAppend && !toAppend.lastChild?.textContent?.includes("Cedula")) {
      //   toAppend.appendChild(textNode)
      // }
      //
      if (toAppend && toAppend.getElementsByTagName("img").length == 0) {
        toAppend.appendChild(imageElement)
        console.log(toAppend.firstChild.textContent)
      }
    }
  })
}

// TODO: Switch to React Components when Issue #22 is resolved
// REACT COMPONENT TO MOUNT
const PlasmoPricingExtra = () => {
  return (
    <span
      style={{
        background: "white",
        padding: 0,
        blockSize: 0
      }}>
    </span>
  )
}

export default PlasmoPricingExtra
