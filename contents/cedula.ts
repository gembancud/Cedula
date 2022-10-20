import axios from "axios"
import { stringifyUrl } from "query-string"

import { Storage } from "@plasmohq/storage"

import { all_tags } from "./misc/constants"
import { getRandomInt, isMarked, mark } from "./misc/utils"
import type { Place } from "react-tooltip"
import { useEffect, useState } from "react"
import ReactTooltip from "react-tooltip"

export const storage = new Storage({ area: "local" })

interface CedulaPoint {
  link: string // query string to include in request
  appendPoint: Element // element to append image to
  markPoint: Element // element to mark arbitrarily eg cedula_marked
}

interface ResLink {
  link: string
  orgs: string[]
}

export const FacebookAddCedulas = async () => {
  AddCedulas("fb", ["Philippines"])
}

export const TwitterAddCedulas = async () => {
  AddCedulas("twitter", ["Philippines"])
}

export const AddCedulas = async (site: string, orgs: string[]) => {
  const markAll: boolean = await storage
    .get("markAll")
    .then((res) => res && res === "true")
  const expiry = await storage.get("expiry").then((res) => parseInt(res))
  mark("cedula_marked", document.head)

  // Get cedula tags, use all_tabs.fb to experiment with fixed tags
  const cedulaTags = await getCedulaTags(site)
  // const cedulaTags = all_tags.fb
  // const cedulaTags = all_tags.twitter

  // Get all cedula points inside the page
  const cedulaPoints = getCedulaPoints(cedulaTags, site)
  // console.log("cedulaPoints", cedulaPoints)
  if (cedulaPoints.length === 0) return

  // Override by adding to all cedulaPoints
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
      const { orgs, expiryDate } = JSON.parse(linkres)
      if (Date.parse(expiryDate) < Date.now()) {
        // Handle expired action here
        await storage.remove(link)
        cedulasToRequest.push(cedulaPoint)
      } else if (orgs.length > 0) {
        // Handle verified action here
        // TODO: applyCedulaPoint(org, cedulaPoint)
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
    url: `${process.env.PLASMO_PUBLIC_CEDULA_API_URL}/ask`,
    query: {
      site,
      orgs,
      links: uniqLinks
    }
  })
  // Response is parsed and cached
  const cedulas = await axios.get(url)
  const { links } = cedulas.data
  const linkMap = getLinkMap(links)
  await setCacheLinkMap(linkMap, expiry)

  for (const cedulaPoint of cedulasToRequest) {
    const { link } = cedulaPoint
    const tmpOrgs = linkMap.get(link)
    const orgsToMark = orgs.filter((org) => tmpOrgs.includes(org))
    for (const org of orgsToMark) {
      // TODO: replace with applyCedulaPoint(org, cedulaPoint)
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
  linkMap: Map<string, string[]>,
  expiry?: number
) => {
  for (const [link, orgs] of linkMap) {
    const expiryDate = new Date()

    if (expiry) {
      // For quick testing set to 5 seconds
      expiryDate.setSeconds(expiryDate.getSeconds() + expiry)
    } else {
      expiryDate.setMinutes(expiryDate.getMinutes() + 15)
    }

    const cacheValue = JSON.stringify({
      orgs,
      expiryDate
    })

    await storage.set(link, cacheValue)
  }
}

/**
 * Cedula Tags are query strings used to detect cedula points
 * If previously stored in localstorage and not expired, use that instead.
 *
 * @returns Object of cedula tags
 * */
const getCedulaTags = async (site: string) => {
  let storedTags: object | null = await storage
    .get(`${site}_cedula_tags`)
    .then((res) => (res ? JSON.parse(res) : null))
  let storedTagsExpiry: string | null = await storage
    .get(`${site}_cedula_tags_expiry`)
    .then((res) => (res ? JSON.parse(res).expiryDate : null))

  if (storedTags === null || Date.parse(storedTagsExpiry) < Date.now()) {
    // console.log("No stored tags or expired, using default")
    storedTags = {}
    const res = await axios.get(
      `${process.env.PLASMO_PUBLIC_CEDULA_API_URL}/tag/${site}`
    )
    const { tags } = res.data
    for (const tag of tags) {
      storedTags[tag.label] = tag.tag
    }
    await storage.set(`${site}_cedula_tags`, JSON.stringify(storedTags))

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 1)
    // For quick testing set to 5 seconds
    // expiryDate.setSeconds(expiryDate.getSeconds() + 5)
    await storage.set(
      `${site}_cedula_tags_expiry`,
      JSON.stringify({ expiryDate })
    )
  }
  return storedTags
}

const getCedulaPoints = (query: object, site: string) => {
  const cedulaPoints: CedulaPoint[] = []
  Object.values(query).forEach((tagList) => {
    const elements = document.querySelectorAll(tagList)
    for (const markPoint of elements) {
      const link = findLink(markPoint.parentElement, site)
      // let appendPoint = markPoint.parentElement
      let appendPoint = findLinkParent(markPoint)
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
    // const imageElement = constructImageElement()
    // appendPoint.append(tmpElementToAppend)
    const tmpElementToAppend = document.createElement("span")
    tmpElementToAppend.setAttribute("data-link", cedulaPoint.link)
    const appendPointFirsChild = appendPoint.firstChild
    insertAfter(appendPointFirsChild, tmpElementToAppend)
    mark("cedula_marked", markPoint)
  }
}
function insertAfter(referenceNode: Node, newNode: Node) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

const findLink = (element: Element, site: string): string => {
  if (element) {
    let link = null
    while (!link && element) {
      link = element.getAttribute("href")
      element = element.parentElement
    }
    if (!link) return null

    switch (site) {
      case "fb":
        link = link.substring(25, link.indexOf("?"))
        break
      case "twitter":
        link = link.substring(1)
        break
    }
    return link
  }
  return null
}

const findLinkParent = (element: Element): Element => {
  if (element) {
    while (element) {
      if (element.getAttribute("href")) {
        return element.parentElement.parentElement
      }
      element = element.parentElement
    }
  }
}

const getLinkMap = (links: ResLink[]) => {
  const linkMap = new Map<string, string[]>()
  for (const tmpLink of links) {
    const { link, orgs } = tmpLink
    linkMap.set(link, orgs)
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

export const setStored = async (query: string, value: object, expire?: boolean) => {
  await storage.set(query, JSON.stringify(value))

  if (expire) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 1)
    await storage.set(`${query}_expiry`, JSON.stringify({ expiryDate }))
  }
}

export const getStored = async (query: string): Promise<object | null> => {
  let storedObject: object | null = await storage
    .get(query)
    .then((res) => (res ? JSON.parse(res) : null))
  let storedObjectExpiry: string | null = await storage
    .get(`${query}_expiry`)
    .then((res) => (res ? JSON.parse(res).expiryDate : null))

  if (storedObject === null || (storedObjectExpiry && Date.parse(storedObjectExpiry) < Date.now())) {
    // console.log("No stored tags or expired, using default")
    return null
  }
  return storedObject
}
