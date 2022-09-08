import { all_tags } from "./constants"
import { constructImageElement, mark } from "./utils"

export const AddCedulas = () => {
  mark(document.head)
  // TODO ask cedulas
  // const cedulas = await axios.get("http://localhost:3000/")
  // console.log("cedulas", cedulas.data)
  Object.values(all_tags.fb).forEach((tagList) => {
    // const elements = TraceElements(tagList)
    const elements = document.querySelectorAll(tagList)
    for (const mountPoint of elements) {
      const link = findLink(mountPoint.parentElement)
      console.log(link)
      let toAppend = mountPoint.parentElement
      if (toAppend && toAppend.getElementsByTagName("img").length == 0) {
        // console.log(toAppend.innerHTML)
        // const name = toAppend.innerHTML
        const imageElement = constructImageElement()
        toAppend.append(imageElement)
        mark(mountPoint)
        // 1. Check the local storage/cache
        // 2. If not found, make a request to the server
        // 3. Store the response in the local storage/cache
      }
    }
  })
}

const findLink = (element: Element): String => {
  if (element) {
    let link = element.getAttribute("href")
    if (!link) return null
    link = link.substring(25, link.indexOf("?"))
    return link
  }
  return null
}
