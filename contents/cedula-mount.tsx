import axios from "axios"
import type { PlasmoContentScript } from "plasmo"
import React from "react"

import { AddCedulas } from "../cedula"
import { isMarked } from "../utils"

export const config: PlasmoContentScript = {
  matches: ["https://www.facebook.com/*"],
  all_frames: true
}

export const getMountPoint = async () => {
  if (!isMarked(document.head))
    window.addEventListener("click", async () => {
      AddCedulas()
    })
  AddCedulas()
  return document.querySelector("div")
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
