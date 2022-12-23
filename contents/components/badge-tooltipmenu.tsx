import { Tooltip } from "@mantine/core"
import iconImage from "data-base64:~assets/cedula_logo_clear_128.png"
import { useEffect, useRef, useState } from "react"
import reactDom from "react-dom"
import ReactTooltip, { Place } from "react-tooltip"

import { setStored } from "~contents/cedula"
import type { InfoType, OrgBadge } from "~contents/misc/types"
import { getRandomInt } from "~contents/misc/utils"

const ReactComp = ({ anchor }) => {
  const tooltipComponent = useRef()
  const info: InfoType = JSON.parse(anchor.element.dataset.link)

  const [globalCoords, setGlobalCoords] = useState({ x: 0, y: 0 })
  const [dynamicPlacement, setDynamicPlacement] = useState<Place>("top")
  const appendId = getRandomInt(1000000)

  const spanStyle = {
    cursor: "pointer"
  }

  useEffect(() => {
    const handleWindowMouseMove = (event: any) => {
      const vh = document.documentElement.clientHeight

      setGlobalCoords({
        x: event.clientX,
        y: event.clientY
      })

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
        {info.orgBadges.length > 0 && (
          <img
            src={info.orgBadges![0].link ?? iconImage}
            width="14"
            height="14"
          />
        )}
      </span>

      <ReactTooltip
        id={`cedula-tooltip-${appendId}`}
        type="dark"
        place={dynamicPlacement}
        effect="solid"
        clickable={true}
        globalEventOff="click"
        ref={tooltipComponent}>
        <div>
          {info.orgBadges.length > 1 && (
            <div>
              Other badges:
              <br />
              {info.orgBadges.slice(1).map((orgBadge: OrgBadge) => {
                return (
                  <Tooltip label={orgBadge!.org} closeDelay={1000}>
                    <img
                      src={orgBadge.link ?? iconImage}
                      width="14"
                      height="14"
                    />
                  </Tooltip>
                )
              })}
            </div>
          )}
          Hide for:
          <div>
            <button
              onClick={async () => {
                await setStored(`${info.link}_hide`, {}, true)
              }}>
              24 hours
            </button>
            <button
              onClick={async () => {
                await setStored(`${info.link}_hide`, {})
              }}>
              Forever
            </button>
          </div>
        </div>
      </ReactTooltip>
    </>
  )
}

export default ReactComp
