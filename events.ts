export interface EventFeaturedImage {
  node: {
    altText: string
    sourceUrl: string
  }
}

export interface FormattedDate {
  startMonth?: string
  endMonth?: string
  startDay?: string | number
  endDay?: string | number
  start?: string
  end?: string
  zone?: string
}

export type EventStatus = 'upcoming' | 'live' | 'ended'

// Added QaObject interface for use across components
export interface QaObject {
  src?: string | null
  html?: string | null
  js?: string | null
  [key: string]: any
}

export interface EventDetails {
  isLive: boolean
  isSoon?: boolean
  isOver?: boolean
  onLocation?: boolean
  eventType: 'on-demand' | 'scheduled' | string
  isLiked: boolean
  eventShortDescription?: string
  eventDescription?: string
  formattedDate?: FormattedDate
  displayName?: string
  startDate?: string
  endDate?: string
  eventStart: string
  eventEnd: string
  eventPriority?: number
  eventProgress?: any
  launchEventButtonCopy?: string
  presenterInformation?: Array<{
    name: string
    image?: {
      altText: string
      sourceUrl: string
    } | null
    [key: string]: any
  }> | null
  address?: string
  mediaQuestion?: string | null
  zoomIntegration?: any | null
  mediaSrc?: string | null
  zoomOptions?: {
    meetingId?: string | null
    meetingPasscode?: string | null
    joinLink?: string | null
    [key: string]: any
  }
  externalPlatformLink?: string | null
  qaQuestion?: string | null
  qaPlatformQuestion?: string | null
  qaAndEmbedWidth?: string | null
  qaWidth?: string | null
  slidoQa?: QaObject
  chatifyQa?: QaObject
  customQa?: QaObject
  additionalLink?: Array<{
    linkText: string
    linkUrl: string
    [key: string]: any
  }>
}

export interface LocationSettings {
  location: boolean
  markerIcon: string
  coords: {
    latitude: number
    longitude: number
  }
}

export interface AuthCheck {
  authRequired: boolean
}

export interface Event {
  id?: string
  databaseId?: number
  title: string
  slug: string
  featuredImage: EventFeaturedImage
  eventDetails: EventDetails
  eventType?: string
  eventStart?: string
  authCheck?: AuthCheck
  locationSettings?: LocationSettings
  assignments?: {
    edges: Array<any>
  }
}

export interface EventNode {
  node: Event
  cursor?: string
}

export interface EventsSettings {
  colors: {
    textColor: { name: string; light: boolean }
    contextTextColour: { name: string; light: boolean }
    primaryColor: { name: string; light: boolean }
    secondary2Color: { name: string; light: boolean }
    [key: string]: { name: string; light: boolean }
  }
  [key: string]: any
}

export interface SortOption {
  label: string
  value: string
}

export interface NavigationRequest {
  path: string
  data: Event | null
}

export interface ComputedButtons {
  primaryStyle: {
    buttonClass: string
    [key: string]: any
  }
  secondaryStyle: {
    buttonClass: string
    [key: string]: any
  }
  [key: string]: any
}

export interface EventContext {
  isLive: boolean
  isOnDemand: boolean
  isOnLocation: boolean
  isScheduled: boolean
  showTime?: boolean
  startTime?: string
  endTime?: string
}

export interface EventsResponse {
  cursor: string
  node: Event
}

export interface MapSettings {
  markerBgColor?: string
  markerTextColor?: string
}

export interface WindowWithPubble extends Window {
  pubbleLoader?: {
    tearDownLQA?: () => void
  }
  pubcore?: unknown
  pubble_coreapp?: unknown
  pubbleLoader_init?: unknown
}
