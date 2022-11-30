import axios from "axios"
import { stringifyUrl } from "query-string"

import { Storage } from "@plasmohq/storage"

import { all_tags, ph_badge_link } from "./misc/constants"
import { isMarked, mark } from "./misc/utils"

export const storage = new Storage({ area: "local" })

// This is the type that is crawled from the webpage
interface CedulaPoint {
  link: string // query string to include in request
  appendPoint: Element // element to append image to
  markPoint: Element // element to mark arbitrarily eg cedula_marked
}

// Type result from API
interface ResLink {
  link: string
  orgs: OrgBadge[]
}

interface OrgBadge {
  org: string
  badge_link: string
}

interface AddCedulasProps {
  site: string
  orgs: string[]
  appendOffset?: number // offset of append point. eg 1 for parent, 2 for grandparent
}

interface Me {
  name: string
  email: string
  links: {
    link: string
    site: string
  }[]
  contact_number: string
  orgs: {
    org: string
    active_badge: string
    badges: {
      name: string
      link: string
    }[]
  }[]
}

export const FacebookAddCedulas = async () => {
  const orgs = await myOrgs()
  await AddCedulas({ site: "fb", orgs: orgs ?? ["Philippines"] })
}

export const TwitterAddCedulas = async () => {
  await AddCedulas({ site: "twitter", orgs: ["Philippines"] })
}

export const RedditAddCedulas = async () => {
  await AddCedulas({ site: "reddit", orgs: ["Philippines"], appendOffset: 1 })
}

export const AddCedulas = async ({
  site,
  orgs,
  appendOffset
}: AddCedulasProps) => {
  const markAll: boolean = await storage
    .get("markAll")
    .then((res) => res && res === "true")
  const expiry = await storage.get("expiry").then((res) => parseInt(res))
  mark("cedula_marked", document.head)

  // Get cedula tags, use all_tabs.fb to experiment with fixed tags
  const cedulaTags = await getCedulaTags(site)
  // const cedulaTags = all_tags.fb
  // const cedulaTags = all_tags.twitter
  // const cedulaTags = all_tags.reddit

  // Get all cedula points inside the page
  const cedulaPoints = getCedulaPoints(cedulaTags, site, appendOffset)
  // console.log("cedulaPoints", cedulaPoints)
  if (cedulaPoints.length === 0) return

  // Override by adding to all cedulaPoints
  if (markAll) {
    applyCedulaPoints(
      { org: "Philippines", badge_link: ph_badge_link },
      cedulaPoints
    )
    return
  }

  // foreach cedulaPoint, if link is in localstorage and not expired, apply cedulaPoint
  // else, add to list of cedulaPoints to ask in api
  const cedulasToRequest: CedulaPoint[] = []
  for (const cedulaPoint of cedulaPoints) {
    const { link } = cedulaPoint
    const isHidden = await getStored(`${link}_hide`)
    if (!link || isHidden) continue
    const linkres = await storage.get(link)

    if (!linkres) {
      cedulasToRequest.push(cedulaPoint)
    } else {
      const { orgs, expiryDate } = JSON.parse(linkres)
      const orgBadges = orgs as OrgBadge[]
      if (Date.parse(expiryDate) < Date.now()) {
        // Handle expired action here
        await storage.remove(link)
        cedulasToRequest.push(cedulaPoint)
      } else if (orgBadges.length > 0) {
        // Handle verified action here
        // TODO: applyCedulaPoint(org, cedulaPoint)
        for (const orgBadge of orgBadges) {
          applyCedulaPoint(orgBadge, cedulaPoint)
        }
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
    const orgsToMark = linkMap.get(link)
    for (const orgBadge of orgsToMark) {
      // TODO: replace with applyCedulaPoint(org, cedulaPoint)
      applyCedulaPoint(orgBadge, cedulaPoint)
    }
  }
}
/**
 * Using the linkMap, for each link cache verified status and expiry date
 * @param linkMap Map of link to verified status
 * @param expiry How long to before cache is invalidated, in seconds
 **/
const setCacheLinkMap = async (
  linkMap: Map<string, OrgBadge[]>,
  expiry?: number
) => {
  for (const [link, orgBadges] of linkMap) {
    const expiryDate = new Date()

    if (expiry) {
      // For quick testing set to 5 seconds
      expiryDate.setSeconds(expiryDate.getSeconds() + expiry)
    } else {
      expiryDate.setMinutes(expiryDate.getMinutes() + 15)
    }

    const cacheValue = JSON.stringify({
      orgs: orgBadges,
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

const getCedulaPoints = (
  query: object,
  site: string,
  appendOffset?: number
) => {
  const cedulaPoints: CedulaPoint[] = []
  Object.values(query).forEach((tagList) => {
    const elements = document.querySelectorAll(tagList)
    for (const markPoint of elements) {
      const link = findLink(markPoint, site)
      // let appendPoint = markPoint.parentElement
      let appendPoint = findLinkParent(markPoint)
      if (appendOffset) {
        for (let i = 0; i < appendOffset; i++) {
          appendPoint = appendPoint.parentElement
        }
      }

      if (!isMarked("flagged_once", markPoint) && appendPoint) {
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

const applyCedulaPoints = (orgBadge: OrgBadge, cedulaPoints: CedulaPoint[]) => {
  cedulaPoints.forEach((cedulaPoint) => {
    applyCedulaPoint(orgBadge, cedulaPoint)
  })
}

const applyCedulaPoint = (orgBadge: OrgBadge, cedulaPoint: CedulaPoint) => {
  const { appendPoint, markPoint } = cedulaPoint
  const { org, badge_link } = orgBadge
  if (!isMarked("cedula_marked", markPoint)) {
    // const imageElement = constructImageElement()
    // appendPoint.append(tmpElementToAppend)
    const tmpElementToAppend = document.createElement("span")
    tmpElementToAppend.setAttribute(
      "data-link",
      JSON.stringify({ link: cedulaPoint.link, org: org, badge_link })
    )
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
      case "reddit":
        link = link.substring(6).slice(0, -1)
        break
      default:
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

const getLinkMap = (links: ResLink[]): Map<string, OrgBadge[]> => {
  const linkMap = new Map<string, OrgBadge[]>()
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

export const setStored = async (
  query: string,
  value: object,
  expire?: boolean
) => {
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

  if (
    storedObject === null ||
    (storedObjectExpiry && Date.parse(storedObjectExpiry) < Date.now())
  ) {
    // console.log("No stored tags or expired, using default")
    console.log(`${query} not found in storage`)
    return null
  }
  return storedObject
}

const myOrgs = async (): Promise<string[] | null> => {
  const stored: Me | null = (await getStored("me")) as Me
  if (!stored) return null
  return stored.orgs.map((org) => org.org)
}
