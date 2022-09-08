import iconImage from "data-base64:~assets/ph.png"

// Done only once per document.
// Used to check if the document has been already processed atleast once
// This filters so eventListeners are not added multiple times
export const mark = (element) => {
  const marked = element.getAttribute("cedula_marked")
  if (!marked) {
    element.setAttribute("cedula_marked", "true")
  }
}

export const isMarked = (element) => element.getAttribute("cedula_marked")

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
