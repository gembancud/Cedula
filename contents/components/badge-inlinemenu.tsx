import { Tooltip, UnstyledButton } from "@mantine/core"
import iconImage from "data-base64:~assets/ph.png"
import { useEffect, useRef, useState } from "react"
import reactDom from "react-dom"
import ReactTooltip, { Place } from "react-tooltip"

import { setStored } from "~contents/cedula"
import type { InfoType, OrgBadge } from "~contents/misc/types"
import { getRandomInt } from "~contents/misc/utils"

const ReactComp = ({ anchor }) => {
  const appendId = getRandomInt(1000000)
  const info: InfoType = JSON.parse(anchor.element.dataset.link)
  const [clicked, setClicked] = useState(false)

  const pStyle = {
    //font color
    color: "white"
  }

  const spanStyle = {
    cursor: "pointer"
  }

  const buttonStyle = {
    backgroundColor: "transparent",
    backgroundRepeat: "no-repeat",
    border: "none",
    cursor: "pointer",
    overflow: "hidden",
    outline: "none",
    zIndex: 1000000
  }

  const handleOnClick = () => {
    setClicked(!clicked)
  }

  const badge = () => {
    return (
      <div style={spanStyle}>
        <UnstyledButton
          role="button"
          style={buttonStyle}
          onClick={handleOnClick}>
          {info.orgBadges.length > 0 && (
            <img
              src={info.orgBadges![0].link ?? iconImage}
              width="14"
              height="14"
            />
          )}
        </UnstyledButton>
      </div>
    )
  }

  const menu = () => {
    return (
      <>
        {info.orgBadges.length > 1 && (
          <div>
            <p style={pStyle}>Other Badges</p>
            <br />
            {info.orgBadges.slice(1).map((orgBadge: OrgBadge) => {
              return (
                <span>
                  <p style={pStyle}>{orgBadge.org}</p>
                  <img
                    src={orgBadge.link ?? iconImage}
                    width="14"
                    height="14"
                  />
                </span>
              )
            })}
          </div>
        )}
        <p style={pStyle}>Hide for:</p>
        <span>
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
        </span>
      </>
    )
  }

  return !clicked ? badge() : menu()
}

export default ReactComp
