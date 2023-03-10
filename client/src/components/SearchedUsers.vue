<template>
  <div class="container-fluid pt-4" id="users-container">
    <transition name="fade" mode="out-in">
      <div class="row row-cols-2 row-cols-sm-3 row-cols-lg-4 row-cols-xl-5 row-cols-xxl-6 g-3" v-if="loading">
        <div class="col" v-for="index in 6" :key="index">
          <div class="card" id="userCard" aria-hidden="true">
            <img src="/node_modules/bootstrap-icons/icons/person-circle.svg" class="p-3" alt="Account default image"/>
            <div class="card-body">
              <h5 class="card-title placeholder-glow">
                <span class="placeholder col-6"></span>
              </h5>
              <p class="card-text placeholder-glow">
                <span class="placeholder col-7"></span>
                <span class="placeholder col-4"></span>
                <span class="placeholder col-4"></span>
                <span class="placeholder col-6"></span>
                <span class="placeholder col-8"></span>
              </p>
              <a href="#" tabindex="-1" class="btn btn-primary disabled placeholder col-6"></a>
            </div>
          </div>
        </div>
      </div>
      <div class="position-absolute top-50 start-50 translate-middle" v-else-if="error">
        <div class="d-flex align-items-center flex-wrap">
          <div class="flex-shrink-1 me-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor"
                 class="bi bi-exclamation-diamond-fill" viewBox="0 0 16 16">
              <path
                  d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098L9.05.435zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
          </div>
          <div class="flex-grow-1 ms-3 text-wrap">
            <span class="fs-1">{{ error.status }}</span>
            <h5 class="fs-4">{{ error.statusText }}</h5>
            <p class="fs-5">{{ error.data.message }}</p>
          </div>
        </div>
      </div>
      <div class="row row-cols-2 row-cols-sm-3 row-cols-lg-4 row-cols-xl-5 row-cols-xxl-6 g-3" v-else-if="users">
        <div class="col" v-for="user in users">
          <div class="card" id="userCard">
            <img src="/node_modules/bootstrap-icons/icons/person-circle.svg" class="p-3" alt="Account default image"/>
            <div class="card-body">
              <h5 class="card-title">@{{ user.username }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">{{ user.name }} {{ user.surname }}</h6>
            </div>
            <div class="card-footer">
              <router-link :to="{name: 'UserProfile', params: {userId: user._id}}" tabindex="-1"
                           class="btn btn-primary stretched-link col-12">Visita profilo
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import {serverURL} from "@/js/main";
import {useIsUserAuthenticatedStore} from "@/js/stores/useIsUserAuthenticatedStore";

export default {
  name: "SearchedUsers",
  data() {
    return {
      loading: false,
      error: null,
      users: null
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
        () => this.$route.query,
        () => {
          this.fetchUsers()
        },
        {immediate: true}
    )
  },
  methods: {
    fetchUsers() {
      this.error = null;
      this.users = null;
      this.loading = true;
      axios.get(serverURL + "/api/social/search", {
        params: this.$route.query
      }).then(response => {
        this.loading = false;
        if (response.data) {
          // don't show currently logged-in user in the results
          if (this.store.isUserAuthenticated) {
            for (let i = 0; i < response.data.length; i++) {
              if (response.data[i].username === this.store.getAuthenticatedUsername) {
                response.data.splice(i, 1);
                break;
              }
            }
          }
          this.users = response.data;
        } else {
          this.users = [];
        }
      }).catch(error => {
        this.loading = false;
        if (error.response) {
          this.error = error.response;
        } else if (error.request) {
          this.error = {};
          this.error.status = "Errore lato server";
          this.error.statusText = "Server non raggiungibile";
          this.error.data = {};
          this.error.data.message = "Server al momento non raggiungibile, riprovare pi?? tardi";
        } else {
          this.error = {};
          this.error.status = "Errore lato client";
          this.error.statusText = "Richiesta non inviata";
          this.error.data = {};
          this.error.data.message = "Errore durante l'invio della richiesta, riprovare";
        }
      });
    }
  }
}
</script>

<style scoped>
#userCard {
  height: auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>