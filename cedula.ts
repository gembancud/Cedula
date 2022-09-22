import axios from "axios"
import { stringifyUrl } from "query-string"

import { Storage } from "@plasmohq/storage"

import { all_tags } from "./constants"
import { constructImageElement, isMarked, mark } from "./utils"

export const storage = new Storage({ area: "local" })

interface CedulaPoint {
  link: string // query string to include in request
  toAppend: Element // element to append image to
  markPoint: Element // element to mark arbitrarily eg cedula_marked
}

interface ResLink {
  link: string
  verified: boolean
}

interface AddCedulasOpts {
  markAll?: boolean
}
export const AddCedulas = async (opts?: AddCedulasOpts) => {
  mark("cedula_marked", document.head)
  // Get all cedula points inside the page
  const cedulaPoints = getCedulaPoints(all_tags.fb)
  if (cedulaPoints.length === 0) return

  if (opts && opts.markAll === true) {
    applyCedulaPoints(cedulaPoints)
    return
  }

  // foreach cedulaPoint, if link is in localstorage, apply cedulaPoint
  // else, add to list of cedulaPoints to ask in api
  // TODO storage value should be expiration date
  const cedulasToRequest: CedulaPoint[] = []
  for (const cedulaPoint of cedulaPoints) {
    const { link } = cedulaPoint
    if (!link) continue
    const linkres = await storage.get(link)

    if (!linkres) {
      cedulasToRequest.push(cedulaPoint)
    } else if (linkres === "true") {
      applyCedulaPoint(cedulaPoint)
    }
  }
  if (cedulasToRequest.length === 0) {
    return
  }

  const uniqLinks = getUniqueLinks(cedulasToRequest)
  const url = stringifyUrl({
    url: "http://localhost:4000/ask/",
    query: { links: uniqLinks }
  })
  const cedulas = await axios.get(url)
  const { links } = cedulas.data
  const linkMap = getLinkMap(links)

  for (const cedulaPoint of cedulasToRequest) {
    const { link } = cedulaPoint
    const verified = linkMap.get(link)
    if (verified) {
      applyCedulaPoint(cedulaPoint)
    }
    await storage.set(link, verified ? "true" : "false")
  }
}

const getCedulaPoints = (query: object) => {
  const cedulaPoints: CedulaPoint[] = []
  Object.values(query).forEach((tagList) => {
    const elements = document.querySelectorAll(tagList)
    for (const markPoint of elements) {
      const link = findLink(markPoint.parentElement)
      let toAppend = markPoint.parentElement
      if (
        !isMarked("flagged_once", markPoint) &&
        toAppend &&
        toAppend.getElementsByTagName("img").length == 0
      ) {
        const tmpCedulaPoint: CedulaPoint = {
          link,
          toAppend,
          markPoint
        }
        mark("flagged_once", markPoint)
        cedulaPoints.push(tmpCedulaPoint)
      }
    }
  })
  return cedulaPoints
}

const applyCedulaPoints = (cedulaPoints: CedulaPoint[]) => {
  cedulaPoints.forEach((cedulaPoint) => {
    applyCedulaPoint(cedulaPoint)
  })
}

const applyCedulaPoint = (cedulaPoint: CedulaPoint) => {
  const { toAppend, markPoint } = cedulaPoint
  if (toAppend.getElementsByTagName("img").length == 0) {
    const imageElement = constructImageElement()
    mark("cedula_marked", markPoint)
    toAppend.append(imageElement)
  }
}

const findLink = (element: Element): string => {
  if (element) {
    let link = null
    while (!link && element) {
      link = element.getAttribute("href")
      element = element.parentElement
    }
    if (!link) return null

    link = link.substring(25, link.indexOf("?"))
    return link
  }
  return null
}

const getLinkMap = (links: ResLink[]) => {
  const linkMap = new Map<string, boolean>()
  for (const tmpLink of links) {
    const { link, verified } = tmpLink
    linkMap.set(link, verified)
  }
  return linkMap
}

const getUniqueLinks = (cedulaPoints: CedulaPoint[]) => {
  const links: string[] = []
  for (const cedulaPoint of cedulaPoints) {
    const { link } = cedulaPoint
    links.push(link)
  }
  const setLink = new Set(links)
  return Array.from(setLink)
}
