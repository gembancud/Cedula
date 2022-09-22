import axios from "axios"
import { stringifyUrl } from "query-string"

import { Storage } from "@plasmohq/storage"

import { all_tags } from "./constants"
import { constructImageElement, isMarked, mark } from "./utils"

export const storage = new Storage({ area: "local" })

interface CedulaPoint {
  link: string // query string to include in request
  appendPoint: Element // element to append image to
  markPoint: Element // element to mark arbitrarily eg cedula_marked
}

interface ResLink {
  link: string
  verified: boolean
}

export const AddCedulas = async () => {
  const markAll: boolean = await storage
    .get("markAll")
    .then((res) => res && res === "true")
  const expiry = await storage.get("expiry").then((res) => parseInt(res))
  mark("cedula_marked", document.head)
  // Get all cedula points inside the page
  const cedulaPoints = getCedulaPoints(all_tags.fb)
  if (cedulaPoints.length === 0) return

  if (markAll) {
    applyCedulaPoints(cedulaPoints)
    return
  }

  // foreach cedulaPoint, if link is in localstorage and not expired, apply cedulaPoint
  // else, add to list of cedulaPoints to ask in api
  const cedulasToRequest: CedulaPoint[] = []
  for (const cedulaPoint of cedulaPoints) {
    const { link } = cedulaPoint
    if (!link) continue
    const linkres = await storage.get(link)

    if (!linkres) {
      cedulasToRequest.push(cedulaPoint)
    } else {
      const { verified, expiryDate } = JSON.parse(linkres)
      if (Date.parse(expiryDate) < Date.now()) {
        // Handle expired action here
        await storage.remove(link)
        cedulasToRequest.push(cedulaPoint)
      } else if (verified) {
        // Handle verified action here
        applyCedulaPoint(cedulaPoint)
      } else {
        // Handle actions where link is not verified here
        // console.log(`Link ${link} is not verified`)
      }
    }
  }
  if (cedulasToRequest.length === 0) {
    return
  }

  // Get unique links to request
  const uniqLinks = getUniqueLinks(cedulasToRequest)
  const url = stringifyUrl({
    url: "http://localhost:4000/ask/",
    query: { links: uniqLinks }
  })
  // Response is parsed and cached
  const cedulas = await axios.get(url)
  const { links } = cedulas.data
  const linkMap = getLinkMap(links)
  await setCacheLinkMap(linkMap, expiry)

  for (const cedulaPoint of cedulasToRequest) {
    const { link } = cedulaPoint
    const verified = linkMap.get(link)
    if (verified) {
      applyCedulaPoint(cedulaPoint)
    }
  }
}
/**
 * Using the linkMap, for each link cache verified status and expiry date
 * @param linkMap Map of link to verified status
 * @param expiry How long to before cache is invalidated, in seconds
 **/
const setCacheLinkMap = async (
  linkMap: Map<string, boolean>,
  expiry?: number
) => {
  for (const [link, verified] of linkMap) {
    const expiryDate = new Date()

    if (expiry) {
      // For quick testing set to 5 seconds
      expiryDate.setSeconds(expiryDate.getSeconds() + expiry)
    } else {
      expiryDate.setMinutes(expiryDate.getMinutes() + 15)
    }

    const cacheValue = JSON.stringify({
      verified,
      expiryDate
    })

    await storage.set(link, cacheValue)
  }
}

const getCedulaPoints = (query: object) => {
  const cedulaPoints: CedulaPoint[] = []
  Object.values(query).forEach((tagList) => {
    const elements = document.querySelectorAll(tagList)
    for (const markPoint of elements) {
      const link = findLink(markPoint.parentElement)
      let appendPoint = markPoint.parentElement
      if (
        !isMarked("flagged_once", markPoint) &&
        appendPoint &&
        appendPoint.getElementsByTagName("img").length == 0
      ) {
        const tmpCedulaPoint: CedulaPoint = {
          link,
          appendPoint,
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
  const { appendPoint, markPoint } = cedulaPoint
  if (appendPoint.getElementsByTagName("img").length == 0) {
    const imageElement = constructImageElement()
    mark("cedula_marked", markPoint)
    appendPoint.append(imageElement)
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
