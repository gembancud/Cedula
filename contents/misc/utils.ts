import iconImage from "data-base64:~assets/ph.png"

import { setStored } from "~contents/cedula"

// Done only once per document.
// Used to check if the document has been already processed atleast once
// This filters so eventListeners are not added multiple times
export const mark = (mark: string, element: Element) => {
  const marked = element.getAttribute(mark)
  if (!marked) {
    element.setAttribute(mark, "true")
  }
}

export const isMarked = (mark: string, element: any) => {
  const marked = element.getAttribute(mark)
  return marked && marked === "true"
}

export const constructImageElement = () => {
  const para = document.createElement("div")
  para.style.float = "left"
  const img = document.createElement("img")
  img.src = iconImage
  img.width = 14
  img.height = 14
  img.style.display = "inline-block"
  return para.appendChild(img)
}

export const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max)
}

export const processMeInfo = (element: Element) => {
  console.log("Processing Me Info")
  const attr = element.getAttribute("data-link")
  setStored("me", JSON.parse(attr))
}
