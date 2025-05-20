<template>
  <q-page padding :class="[`bg-${backgroundColor}`]">
    <div class="rv-container">
      <div class="flex justify-center q-pt-lg">
        <q-avatar size="5rem">
          <q-img
            v-if="currentUser"
            :src="currentUser.photo || imgURL"
            alt="User profile image"
          />
        </q-avatar>
      </div>

      <h2
        v-if="currentUser"
        class="text-center q-ma-none q-py-lg"
        :class="[{ [`text-${headerColour}`]: true, isAuth: isAuthenticated }]"
      >
        Welcome back {{ currentUser.firstName }}!
      </h2>
      <q-item
        v-if="isAuthenticated"
        clickable
        class="q-pa-sm q-ma-sm rv-container__sign-out underline"
        :class="`text-${textColour}`"
        role="button"
        @click="handleLogOut"
      >
        Not you? Sign Out
      </q-item>

      <q-tabs
        v-model="tab"
        no-caps
        indicator-color="white"
        :class="`bg-${textColour} text-${backgroundColor}`"
        class="v-full-w"
      >
        <q-route-tab
          to="/user/profile"
          name="profile"
          label="My Profile"
          class="heading-h2 q-mx-sm"
          @click="dataLayerLabel('My Profile')"
        />
        <q-route-tab
          v-if="eventsEnabled"
          to="/user/events"
          name="events"
          label="My Events"
          class="heading-h2 q-mx-sm"
          @click="dataLayerLabel('My Events')"
        />

        <q-route-tab
          to="/user/favourites"
          name="favourites"
          label="My Favourites"
          class="heading-h2 q-mx-sm"
          @click="dataLayerLabel('My Favourites')"
        />
      </q-tabs>

      <q-tab-panels
        v-model="tab"
        animated
        transition-prev="jump-up"
        transition-next="jump-up"
        :class="`bg-${backgroundColor}`"
        class="v-full-w"
      >
        <q-tab-panel name="profile" aria-label="profile">
          <div class="q-pa-lg">
            <ProfileForm
              :key="currentUser"
              :is-profile-page="true"
              class="rv-profile q-mx-auto"
              :settings="settings"
            />

            <div class="flex full-width justify-center text-xs user-buttons">
              <q-item
                dense
                clickable
                class="underline"
                :class="`text-${styles.headingColor}`"
                role="button"
                @click="resetPwdClick"
              >
                <q-item-section> Reset password? </q-item-section>
              </q-item>

              <q-item
                dense
                clickable
                class="underline"
                :class="`text-${styles.headingColor}`"
                role="button"
                @click="deleteUserClick"
              >
                <q-item-section> Forget me? </q-item-section>
              </q-item>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel v-if="eventsEnabled" name="events" aria-label="my events">
          <MyAgenda class="q-pa-lg"></MyAgenda>
        </q-tab-panel>

        <q-tab-panel name="favourites" aria-label="my favourites">
          <Favourites />
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <DeleteUserModal :user="currentUser" />
  </q-page>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useAuthStore } from 'stores/auth'
import { useMainStore } from 'stores/main'

import ProfileForm from 'components/forms/ProfileForm.vue'
import MyAgenda from 'components/events/MyAgenda.vue'
import Favourites from 'components/ui/Favourites.vue'

const DeleteUserModal = defineAsyncComponent(
  () => import('components/modal/DeleteUserModal.vue')
)

export default {
  name: 'ProfilePage',

  components: {
    DeleteUserModal,
    MyAgenda,
    ProfileForm,
    Favourites
  },

  inject: ['settings'],

  data() {
    return {
      tab: this.$route.params.profile_id,
      imgURL: new URL('../assets/default-user.png', import.meta.url).href
    }
  },

  computed: {
    ...mapState(useAuthStore, [
      'currentUser',
      'isAuthenticated',
      'LOGOUT_USER'
    ]),

    eventsEnabled() {
      return this.settings.eventsSettings.enableEvents
    },

    styles() {
      return this.settings.home.styles
    },

    backgroundColor() {
      const { elements } = this.settings || {}
      const { filtersModal } = elements || {}
      const { backgroundColor } = filtersModal || {}

      return backgroundColor || 'light'
    },

    backgroundColorDarkCheck() {
      return this.$colorIsDark(this.backgroundColor)
    },

    headerColour() {
      const { elements } = this.settings || {}
      const { filtersModal } = elements || {}
      const { homeHeadingColor } = filtersModal || {}

      return homeHeadingColor || 'black'
    },

    textColour() {
      const { elements } = this.settings || {}
      const { filtersModal } = elements || {}
      const { homeParagraphColor } = filtersModal || {}

      return homeParagraphColor || 'black'
    }
  },

  methods: {
    ...mapActions(useAuthStore, ['DELETE_USER']),
    ...mapActions(useMainStore, [
      'TOGGLE_PWD_MODAL',
      'TOGGLE_DELETE_USER_MODAL'
    ]),

    resetPwdClick() {
      this.TOGGLE_PWD_MODAL(true)
    },

    deleteUserClick() {
      this.TOGGLE_DELETE_USER_MODAL(true)
    },

    handleDataLayer(payload) {
      this.$pushToDataLayer({
        event: 'profileInteraction',
        activeTab: this.tab,
        ...payload
      })
    },

    dataLayerLabel(label) {
      /* Data Layer - My Profile, My Events, My Favourites */
      this.$pushToDataLayer({
        pageTitle: label
      })
    },

    handleLogOut() {
      this.handleDataLayer({ name: 'logoutClick', copy: 'Not you? Sign Out' })
      this.LOGOUT_USER()
    }
  },

  mounted() {
    this.dataLayerLabel('My Profile')
  }
}
</script>

<style lang="scss" scoped>
.rv-profile {
  @media (min-width: $breakpoint-md-min) {
    width: 70%;
  }
}
.q-tab-panels {
  background: transparent;
}
.q-tab-panel {
  padding: 0;
}

.q-tab__label {
  font-size: 1.2rem;
}

.q-tab__indicator {
  height: 3px;
}

.rv-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  &__sign-out {
    display: flex;
    width: fit-content;
    align-items: center;
  }
  .isAuth {
    padding-bottom: 0;
  }
  .user-buttons .q-item {
    height: 44px;
  }
}
</style>
