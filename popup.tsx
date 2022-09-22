import { Checkbox } from "@mantine/core"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage"

function IndexPopup() {
  const [markAllChecked, setMarkAllChecked] = useStorage(
    { key: "markAll", area: "local" },
    "false"
  )
  const clearStorage = () => {
    chrome.storage.local.clear()
    console.log("cleared storage")
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>Welcome to cedula</h1>
      <Checkbox
        label="Everyone is verified"
        radius="xl"
        size="md"
        checked={markAllChecked === "true"}
        onChange={(event) => {
          setMarkAllChecked(event.currentTarget.checked ? "true" : "false")
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.update(tabs[0].id, { url: tabs[0].url })
            }
          )
        }}
      />
      <button
        onClick={() => {
          clearStorage()
        }}>
        Clear storage
      </button>
    </div>
  )
}

export default IndexPopup
