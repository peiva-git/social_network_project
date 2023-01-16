<template>
  <div class="container-fluid" id="user-profile-container">
    <div class="row pt-4" v-if="loading">
      <div class="col-3">
        <img src="/node_modules/bootstrap-icons/icons/person-circle.svg" class="rounded mx-auto d-block mb-4"
             style="height: 200px; width: 100%;" alt="Default account image"/>
        <p class="fs-1 placeholder-glow text-center"><span class="placeholder col-5"></span></p>
        <p class="fs-4 placeholder-glow text-center">
          <span class="placeholder col-2"></span>
          <span class="placeholder col-2"></span>
        </p>
        <a href="#" tabindex="-1" class="btn btn-primary disabled placeholder col-12"></a>
      </div>
    </div>
    <div class="position-absolute top-50 start-50 translate-middle" v-if="error">
      <div class="d-flex align-items-center">
        <div class="flex-shrink-0 me-3">
          <svg xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" fill="currentColor"
               class="bi bi-exclamation-diamond-fill" viewBox="0 0 16 16">
            <path
                d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098L9.05.435zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
        </div>
        <div class="d-flex" style="height: 300px;">
          <div class="vr"></div>
        </div>
        <div class="flex-grow-1 ms-3 text-wrap" style="width: 300px;">
          <span class="fs-1">{{ error.status }}</span>
          <h5 class="fs-4">{{ error.statusText }}</h5>
          <p class="fs-5">{{ error.data.message }}</p>
        </div>
      </div>
    </div>
    <div class="row vh-100" v-if="user">
      <div class="col-3 pt-4">
        <img src="/node_modules/bootstrap-icons/icons/person-circle.svg" class="rounded mx-auto d-block mb-4"
             style="height: 200px; width: 100%;" alt="Default account image"/>
        <p class="fs-1 text-center">@{{ user.username }}</p>
        <p class="fs-4 text-center">{{ user.name }} {{ user.surname }}</p>
        <button type="button" class="btn btn-primary col-auto mb-3"
                v-if="$route.params.userId !== 'myaccount' && store.isUserAuthenticated"
                @click.prevent="toggleFollow">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus"
               viewBox="0 0 16 16" v-if="!isUserFollowed">
            <path
                d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check"
               viewBox="0 0 16 16" v-else>
            <path
                d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
          </svg>
          Segui
        </button>
        <button type="button" class="btn btn-secondary col-auto mb-3 me-2" data-bs-toggle="modal"
                data-bs-target="#newMessageModal"
                v-if="$route.params.userId === 'myaccount' && store.isUserAuthenticated">Scrivi messaggio
        </button>
        <button type="button" class="btn btn-primary col-auto mb-3"
                v-if="$route.params.userId === 'myaccount' && store.isUserAuthenticated"
                @click.prevent="showFeed = !showFeed">{{ userFeedButtonText }}
        </button>
        <div class="accordion" id="accordion-bio">
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-body"
                      aria-expanded="true" aria-controls="collapse-body">Bio descrittiva
              </button>
            </h2>
            <div id="collapse-body" class="accordion-collapse show" aria-labelledby="heading"
                 data-bs-parent="accordion-bio">
              <div class="accordion-body">{{ user.bio }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6 pt-4">
        <user-messages :user="user" v-if="!showFeed"/>
        <user-feed :user="user" v-if="showFeed"/>
      </div>
      <div class="col-3 pt-4"></div>
    </div>
  </div>

  <!-- New message modal-->
  <new-message-modal-dialog/>
</template>

<script>
import axios from "axios";
import {serverURL} from "@/js/main";
import UserMessages from "@/components/UserMessages.vue";
import {useIsUserAuthenticatedStore} from "@/js/stores/useIsUserAuthenticatedStore";
import NewMessageModalDialog from "@/components/NewMessageModalDialog.vue";
import UserFeed from "@/components/UserFeed.vue";

export default {
  name: "UserProfile",
  components: {UserFeed, NewMessageModalDialog, UserMessages},
  data() {
    return {
      loading: false,
      error: null,
      user: null,
      followers: [],
      showFeed: false
    }
  },
  setup() {
    const store = useIsUserAuthenticatedStore();
    return {
      store
    }
  },
  created() {
    this.$watch(
        () => this.$route.params,
        () => {
          this.fetchData();
        },
        {immediate: true}
    )
  },
  computed: {
    isUserFollowed() {
      console.log(this.followers);
      console.log(this.store.getAuthenticatedUsername);
      return !!this.followers.includes(this.store.getAuthenticatedUsername);
    },
    userFeedButtonText() {
      return this.showFeed ? "I miei messaggi" : "Il mio feed";
    }
  },
  methods: {
    fetchData() {
      this.error = null;
      this.user = null;
      this.loading = true;
      let fetchURL;
      if (this.$route.params.userId !== "myaccount") {
        fetchURL = serverURL + "/api/social/users/" + this.$route.params.userId;
      } else {
        fetchURL = serverURL + "/api/social/whoami";
      }
      axios.get(fetchURL).then(response => {
        this.loading = false;
        if (response.data) {
          this.user = response.data;
        }
        if (response.data.followers) {
          this.followers = response.data.followers;
        }
      }).catch(error => {
        this.loading = false;
        if (error.response) {
          this.error = error.response;
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log(error);
        }
      });
      if (this.$route.params.userId !== "myaccount") {
        axios.get(serverURL + "/api/social/followers/" + this.$route.params.userId).then(response => {
          if (response.data) {
            this.followers = response.data;
          }
        }).catch(error => {
          console.log(error);
        });
      }
    },
    toggleFollow() {
      if (this.store.isUserAuthenticated) {
        if (this.isUserFollowed) {
          axios.delete(serverURL + "/api/social/followers/" + this.$route.params.userId).then(() => {
            const toRemoveIndex = this.followers.indexOf(this.store.getAuthenticatedUsername);
            this.followers.splice(toRemoveIndex, 1);
          }).catch(error => {
            console.log(error);
          });
        } else {
          axios.post(serverURL + "/api/social/followers/" + this.$route.params.userId).then(() => {
            this.followers.push(this.store.getAuthenticatedUsername);
          }).catch(error => {
            console.log(error);
          });
        }
      }
    }
  }

}
</script>

<style scoped>
</style>