import iconImage from "data-base64:~assets/ph.png"
import { useEffect, useState } from "react"
import ReactTooltip, { Place } from "react-tooltip"

import { setStored } from "~contents/cedula"
import { getRandomInt } from "~contents/misc/utils"

const ReactComp = ({ anchor }) => {
  const [dynamicPlacement, setDynamicPlacement] = useState<Place>("top")
  const appendId = getRandomInt(1000000)

  const spanStyle = {
    cursor: "pointer"
  }

  useEffect(() => {
    const handleWindowMouseMove = (event: any) => {
      const vh = document.documentElement.clientHeight
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
        Hide for:
        <div>
          <button
            onClick={async () => {
              await setStored(`${anchor.element.dataset.link}_hide`, {}, true)
            }}>
            24 hours
          </button>
          <button
            onClick={async () => {
              await setStored(`${anchor.element.dataset.link}_hide`, {})
            }}>
            Forever
          </button>
        </div>
      </ReactTooltip>
    </>
  )
}

export default ReactComp
