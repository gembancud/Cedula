import { UnstyledButton } from "@mantine/core"
import iconImage from "data-base64:~assets/ph.png"
import { useEffect, useRef, useState } from "react"
import reactDom from "react-dom"
import ReactTooltip, { Place } from "react-tooltip"

import { setStored } from "~contents/cedula"
import { getRandomInt } from "~contents/misc/utils"

const ReactComp = ({ anchor }) => {
  const appendId = getRandomInt(1000000)
  const { link, org, badge_link } = JSON.parse(anchor.element.dataset.link)
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
          <img src={badge_link ?? iconImage} width="14" height="14" />
        </UnstyledButton>
      </div>
    )
  }

  const menu = () => {
    return (
      <>
        <p style={pStyle}>Hide for:</p>
        <span>
          <button
            onClick={async () => {
              await setStored(`${link}_hide`, {}, true)
            }}>
            24 hours
          </button>
          <button
            onClick={async () => {
              await setStored(`${link}_hide`, {})
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
