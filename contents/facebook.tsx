import iconImage from "data-base64:~assets/ph.png"
import type { PlasmoContentScript } from "plasmo"
import type { PlasmoGetShadowHostId } from "plasmo"
import type { PlasmoMountShadowHost } from "plasmo"
import { useEffect, useState } from "react"
import ReactTooltip, { Place } from "react-tooltip"

// import Asd from "./asd"
import { FacebookAddCedulas } from "./cedula"
import { getRandomInt, isMarked } from "./misc/utils"

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

const sayHello = () => {
  console.log("Hello")
}

const ReactComp = ({ anchor }) => {
  // const [globalCoords, setGlobalCoords] = useState({ x: 0, y: 0 })
  const [dynamicPlacement, setDynamicPlacement] = useState<Place>("top")
  const appendId = getRandomInt(1000000)

  const spanStyle = {
    cursor: "pointer"
  }

  useEffect(() => {
    // 👇️ get global mouse coordinates
    const handleWindowMouseMove = (event) => {
      const vh = document.documentElement.clientHeight

      // setGlobalCoords({
      //   x: event.clientX,
      //   y: event.clientY / vh
      // })

      setDynamicPlacement(event.clientY / vh < 0.3 ? "top" : "bottom")
    }
    window.addEventListener("mousemove", handleWindowMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove)
    }
  }, [])
  return (
    <>
      <span
        data-tip
        data-for={`cedula-tooltip-${appendId}`}
        data-event="click"
        style={spanStyle}>
        <img src={iconImage} width="14" height="14" />
      </span>

      <ReactTooltip
        id={`cedula-tooltip-${appendId}`}
        type="dark"
        place={dynamicPlacement}
        effect="solid"
        clickable={true}
        globalEventOff="click">
        {/* <input type="text" placeholder="Type something..." /> */}
        Hide for:
        <div>
          <button onClick={sayHello}>24 hours</button>
          <button onClick={sayHello}>Forever</button>
        </div>
      </ReactTooltip>
    </>
  )
}

export default ReactComp
