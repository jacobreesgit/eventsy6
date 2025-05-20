const homeLayout = () => import('layouts/HomeLayout.vue')
const mainLayout = () => import('layouts/MainLayout.vue')
const homePage = () => import('pages/HomePage/HomePage.vue')
const mainPage = () => import('pages/MainPage.vue')
const contentPage = () => import('pages/ContentPage.vue')
const legalPage = () => import('pages/LegalPage.vue')
const eventsPage = () => import('pages/EventsPage.vue')
const profilePage = () => import('pages/ProfilePage.vue')
const mapPage = () => import('pages/MapPage.vue')

const routes = [
  {
    path: '/',
    component: homeLayout,
    children: [
      {
        path: '',
        component: homePage,
        children: [
          {
            name: 'welcome',
            component: homePage,
            path: '/',
            meta: { isHome: true, showBackground: true, analyticsGroup: 'home', showPreview: false, showFiltersView: false }
          },
          {
            name: 'preview',
            component: homePage,
            path: '/preview',
            meta: { isHome: true, showBackground: true, analyticsGroup: 'home', showPreview: true, showFiltersView: false}
          },
          {
            name: 'filtersView',
            component: homePage,
            path: '/personalise',
            meta: { isHome: true, showBackground: true, analyticsGroup: 'home', showPreview: false, showFiltersView: true}
          },
          {
            path: '/welcome',
            redirect: '/'
          },
          {
            path: '/login',
            redirect: '/'
          }
        ]
      }
    ]
  },
  {
    path: '/explore',
    component: mainLayout,
    redirect: '/',
    children: [
      {
        name: 'section',
        path: ':section_id',
        component: mainPage,
        meta: { back: 'welcome', isExplore: true, showBackground: true }
      },
      {
        name: 'group',
        path: ':section_id/:group_id',
        component: contentPage,
        meta: {
          back: 'section',
          isExplore: 'true',
          isPost: true
        }
      },
      // Redundant - left for legacy deep links
      {
        name: 'post',
        path: ':section_id/:group_id/:post_id',
        component: contentPage,
        meta: { back: 'section', isExplore: true, isPost: true }
      }
      //
    ]
  },

  {
    path: '/map',
    component: mainLayout,
    redirect: '/',
    children: [
      {
        path: '',
        name: 'map',
        component: mapPage,
        meta: {
          back: 'welcome',
          isMap: true,
          requiresMapEnabled: true,
          analyticsGroup: 'map'
        },

        children: [
          {
            name: 'location',
            path: ':location_id',
            components: {
              content: contentPage,
              event: eventsPage
            },

            meta: {
              back: 'map',
              requiresMapEnabled: true,
              analyticsGroup: 'map'
            }
          },

          {
            name: 'locationContent',
            path: ':location_id/content',
            component: contentPage,
            meta: {
              back: 'location',
              isMap: true,
              isPost: true,
              requiresMapEnabled: true,
              analyticsGroup: 'map'
            }
          },

          {
            name: 'locationEvent',
            path: ':location_id/event',
            component: eventsPage,
            meta: {
              back: 'location',
              isMap: true,
              isEvent: true,
              requiresMapEnabled: true,
              analyticsGroup: 'map'
            }
          }
        ]
      }
    ]
  },

  {
    path: '/events',
    component: mainLayout,
    redirect: '/',
    meta: { requiresEventsEnabled: true },
    children: [
      {
        name: 'events',
        path: ':events_id',
        component: eventsPage,
        meta: {
          back: 'welcome',
          showBackground: true,
          requiresEventsEnabled: true,
          isEvents: true,
          analyticsGroup: 'events'
        }
      },
      {
        name: 'session',
        path: 'session/:session_id',
        component: eventsPage,
        meta: {
          recordBack: true,
          showBackground: true,
          requiresEventsEnabled: true,
          isEvents: true,
          analyticsGroup: 'events'
        }
      }
    ]
  },
  {
    path: '/legal',
    component: mainLayout,
    redirect: '/',
    children: [
      {
        name: 'legal',
        path: ':page_id',
        component: legalPage,
        meta: { recordBack: true, analyticsGroup: 'legal' }
      }
    ]
  },
  {
    path: '/user',
    component: mainLayout,
    redirect: '/',
    children: [
      {
        name: 'profile',
        // Could be 'profile', 'events' or 'favourites' currently
        path: ':profile_id',
        component: profilePage,
        meta: {
          recordBack: true,
          requiresAuth: true,
          showBackground: true,
          requiresAuthEnabled: true,
          isProfile: true,
          analyticsGroup: 'profile'
        }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes