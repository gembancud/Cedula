import type { PlasmoContentScript } from "plasmo"

import { getStored } from "~contents/cedula"

import { cedebug, isMarked, mark, processMeInfo } from "./misc/utils"

export const config: PlasmoContentScript = {
  matches: ["https://cedula.ink/*", "http://localhost:3000/*"]
}

export const getInlineAnchorList = async () => {
  if (!isMarked("cedula_marked", document.head)) {
    mark("cedula_marked", document.head)
    window.addEventListener("click", async () => {
      await ClickEvent()
    })
    window.addEventListener("scroll", async () => {
      await ClickEvent()
    })
  }

  return document.querySelector("div")
}

const ClickEvent = async () => {
  const meElement = document.querySelector("div[data-link]")
  if (meElement) {
    processMeInfo(meElement)
  }
  const stored = await getStored("me")
  if (stored) {
    cedebug(stored, "Data from cedula.ink storedData from cedula.ink stored")
  }
}

const HomePage = () => {
  return <div></div>
}

export default HomePage
