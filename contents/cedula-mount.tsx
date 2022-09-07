import axios from "axios"
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
  img.width = 14
  img.height = 14
  img.style.display = "inline-block"
  return para.appendChild(img)
}

export const getMountPoint = async () => {
  await AddCedulas()
  return document.querySelector(all_tags.plasmo.feature_title)
}

const AddCedulas = async () => {
  // TODO ask cedulas
  // const cedulas = await axios.get("http://localhost:3000/")
  // console.log("cedulas", cedulas.data)
  const imageElement = ConstructImageElement()
  Object.values(all_tags.fb).forEach((tagList) => {
    // const elements = TraceElements(tagList)
    const elements = document.querySelectorAll(tagList.path[0])

    for (const mountPoint of elements) {
      // console.log("mount", mountPoint)
      const link = findLink(mountPoint)
      // console.log(link)

      const toAppend = mountPoint.querySelector(":scope span")
      if (toAppend && toAppend.getElementsByTagName("img").length == 0) {
        // console.log(toAppend.innerHTML)
        const name = toAppend.innerHTML
        toAppend.append(imageElement)
        // toAppend.appendChild(imageElement)
        // 1. Check the local storage/cache
        // 2. If not found, make a request to the server
        // 3. Store the response in the local storage/cache
      }
    }
  })
  return
}

const findLink = (element: Element): String => {
  const firstChild = element.firstElementChild
  if (firstChild) {
    let link = firstChild.getAttribute("href")
    if (!link) return null
    link = link.substring(25, link.indexOf("?"))
    return link
  }
  return null
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
      }}></span>
  )
}

export default PlasmoPricingExtra

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
