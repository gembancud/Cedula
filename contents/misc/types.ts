// This is the type that is crawled from the webpage
export type CedulaPoint = {
  link: string // query string to include in request
  appendPoint: Element // element to append image to
  markPoint: Element // element to mark arbitrarily eg cedula_marked
}

// Type result from API
export type ResLink = {
  link: string
  orgs: OrgBadge[]
}

export type OrgBadge = {
  org: string
  link: string
}

export type Me = {
  name: string
  email: string
  links: {
    link: string
    site: string
  }[]
  contact_number: string
  orgs: {
    name: string
    active_badge: string
    badges: {
      name: string
      link: string
    }[]
  }[]
}

// Used inside React Component to define anchor dataset link
export type InfoType = {
  link: string
  orgBadges: OrgBadge[]
}
