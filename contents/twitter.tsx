import type { PlasmoContentScript } from "plasmo"

import { TwitterAddCedulas } from "./cedula"
import BadgeComp from "./components/badge-inlinemenu"
import { isMarked } from "./misc/utils"

export const config: PlasmoContentScript = {
  matches: ["https://www.twitter.com/*", "https://twitter.com/*"]
  // all_frames: true
}

export const getInlineAnchorList = async () => {
  if (!isMarked("cedula_marked", document.head))
    window.addEventListener("click", async () => {
      await TwitterAddCedulas()
    })
  await strictSingleOp(TwitterAddCedulas)
  // await AddCedulas()
  return document.querySelectorAll("span[data-link]")
}

// This is prone to breaking.
// Call using strictSingleOp(AddCedulas)
// No more no less
let strictSingleOpSem = 0
const strictSingleOp = async (callback) => {
  if (strictSingleOpSem === 1) {
    return
  }
  strictSingleOpSem = 1
  await callback()
  strictSingleOpSem = 0
}

export default BadgeComp
