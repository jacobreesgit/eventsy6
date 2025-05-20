const eventsQuery = (variables, taxArray) => {
  return `
    query EVENTS_QUERY(
      ${variables}
      $language: LanguageCodeFilterEnum
      $dateNow: String!
      $eventType: String!
      $order: OrderEnum!
      $orderField: PostObjectsConnectionOrderbyEnum!
      $search: String
      $startsBefore: String
    ) {
      events(
        first: 1000
        where: {
          orderby: { field: $orderField, order: $order }
          endsAfter: $dateNow
          startsBefore: $startsBefore
          language: $language
          eventType: $eventType
          search: $search
          taxQuery: {
            relation: AND
            taxArray: [
              ${taxArray}
            ]
          }
        }
      ) {
        edges {
          cursor
          node {
            id
            slug
            title
            databaseId
            eventDetails {
              launchEventButtonCopy
              displayName
              eventPriority
              eventDescription
              eventShortDescription
              eventEnd
              eventStart
              eventType
              onLocation
              presenterInformation {
                name
                image {
                altText
                sourceUrl(size: LARGE)
                }
              }
            }
            featuredImage {
              node {
                altText
                sourceUrl(size: LARGE)
              }
            }
          }
        }
        pageInfo {
          offsetPagination {
            hasMore
            hasPrevious
            total
          }
        }
      }
    }
  `
}

const relevantEventsQuery = (variables, taxArray) => {
  return `
    query EVENTS_RELEVANT_QUERY(
      ${variables}
      $eventType: String!
      $language: LanguageCodeFilterEnum
      $dateNow: String!
      $size: Int!
      $startsBefore: String
      $orderField: PostObjectsConnectionOrderbyEnum!
    ) {
      events(
        first: $size
        where: {
          orderby: {field: $orderField, order: ASC}
          endsAfter: $dateNow
          startsBefore: $startsBefore
          language: $language
          eventType: $eventType
          taxQuery: {
            relation: AND
            taxArray: [
              ${taxArray}
            ]
          }
        }
      ) {
        nodes {
          id
          databaseId
          slug
          title
          eventDetails {
            launchEventButtonCopy
            displayName
            eventPriority
            eventDescription
            eventShortDescription
            eventEnd
            eventStart
            eventType
            onLocation
            presenterInformation {
              name
              image {
              altText
              sourceUrl(size: LARGE)
              }
            }
          }
          locationSettings {
            location
            markerIcon
            coords {
              latitude
              longitude
            }
          }
          featuredImage {
            node {
              altText
              sourceUrl(size: LARGE)
            }
          }
        }
      }
    }
  `
}

const eventQuery = `
  query EVENT_QUERY($event: String!) {
    events(where: { name: $event }) {
      nodes {
        id
        databaseId
        authCheck {
          authRequired
        }
        slug
        title
        locationSettings {
            location
            markerIcon
            coords {
              latitude
              longitude
            }
        }
        eventDetails {
          launchEventButtonCopy
          displayName
          eventDescription
          eventShortDescription
          eventEnd
          eventStart
          eventType
          onLocation
          address
          mediaQuestion
          zoomIntegration
          mediaSrc
          zoomOptions {
            meetingId
            meetingPasscode
            joinLink
          }
          externalPlatformLink
          qaQuestion
          qaPlatformQuestion
          qaAndEmbedWidth
          qaWidth
          slidoQa {
            src
          }
          chatifyQa {
            html
            js
          }
          customQa {
            html
            js
          }
          additionalLink {
            linkText
            linkUrl
          }
          presenterInformation {
            name
            image {
              altText
              sourceUrl(size: LARGE)
            }
          }
        }
        featuredImage {
          node {
            altText
            sourceUrl(size: LARGE)
          }
        }
        assignments {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
      }
    }
  }
`

const myAgendaQuery = `
  query EVENTS_AGENDA_QUERY(
    $language: LanguageCodeFilterEnum
    $dateNow: String!
    $idArray: [ID]
  ) {
    events(
      first: 1000
      where: { in: $idArray, endsAfter: $dateNow, language: $language }
    ) {
      edges {
        cursor
        node {
          id
          slug
          title
          databaseId
          eventDetails {
            launchEventButtonCopy
            displayName
            eventPriority
            eventDescription
            eventShortDescription
            eventEnd
            eventStart
            eventType
            onLocation
            presenterInformation {
              name
              image {
              altText
              sourceUrl(size: LARGE)
              }
            }
          }
          locationSettings {
            location
            markerIcon
            coords {
              latitude
              longitude
            }
          }
          featuredImage {
            node {
              altText
              sourceUrl(size: LARGE)
            }
          }
        }
      }
      pageInfo {
        offsetPagination {
          hasMore
          hasPrevious
          total
        }
      }
    }
  }
`

export { eventsQuery, eventQuery, relevantEventsQuery, myAgendaQuery }
