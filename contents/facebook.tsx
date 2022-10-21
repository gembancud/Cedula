import type { PlasmoContentScript } from "plasmo"
import type { PlasmoGetShadowHostId } from "plasmo"
import type { PlasmoMountShadowHost } from "plasmo"

// import Asd from "./asd"
import { FacebookAddCedulas } from "./cedula"
import BadgeComp from "./components/badge-tooltipmenu"
import { isMarked } from "./misc/utils"

export const config: PlasmoContentScript = {
  matches: ["https://www.facebook.com/*", "https://facebook.com/*"],
  all_frames: true
}

export const getInlineAnchorList = async () => {
  if (!isMarked("cedula_marked", document.head))
    window.addEventListener("click", async () => {
      await FacebookAddCedulas()
    })
  await strictSingleOp(FacebookAddCedulas)
  // await AddCedulas()
  return document.querySelectorAll("span[data-link]")
}

export const getShadowHostId: PlasmoGetShadowHostId = () => "custom-shadow-host"

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
