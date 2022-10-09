import type { PlasmoContentScript } from "plasmo"
import React from "react"

import { TwitterAddCedulas } from "../cedula"
import { isMarked } from "../utils"

export const config: PlasmoContentScript = {
  matches: ["https://www.twitter.com/*"],
  all_frames: true
}

export const getMountPoint = async () => {
  if (!isMarked("cedula_marked", document.head))
    window.addEventListener("click", async () => {
      await TwitterAddCedulas()
    })
  await strictSingleOp(TwitterAddCedulas)
  // await AddCedulas()
  return document.querySelector("div")
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
