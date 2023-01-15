<template>
  <div class="container-fluid" v-if="loading">
    <div class="row">
      <div class="col-12">
        <div class="card" aria-hidden="true">
          <div class="card-header placeholder-glow"><span class="placeholder col-4"></span></div>
          <div class="card-body">
            <h5 class="card-title placeholder-glow"><span class="placeholder col-5"></span></h5>
            <p class="card-text placeholder-glow"><span class="placeholder col-12"></span></p>
            <a href="#" tabindex="-1" class="btn btn-primary placeholder disabled col-2"></a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="container-fluid" v-if="error">
    <h3 class="mb-4">Messaggi non disponibili!</h3>
    <div class="d-flex align-items-center">
      <div class="flex-shrink-0 me-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="auto" height="auto" fill="currentColor"
             class="bi bi-envelope-exclamation-fill" viewBox="0 0 16 16">
          <path
              d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586l-1.239-.757ZM16 4.697v4.974A4.491 4.491 0 0 0 12.5 8a4.49 4.49 0 0 0-1.965.45l-.338-.207L16 4.697Z"/>
          <path
              d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1.5a.5.5 0 0 1-1 0V11a.5.5 0 0 1 1 0Zm0 3a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
        </svg>
      </div>
      <div class="d-flex">
        <div class="vr" style="height: 300px;"></div>
      </div>
      <div class="flex-grow-1 ms-3">
        <span class="fs-1">{{ error.status }}</span>
        <h5 class="fs-4">{{ error.statusText }}</h5>
        <p class="fs-5">{{ error.data.message }}</p>
      </div>
    </div>
  </div>
  <div class="container-fluid" v-if="messages">
    <h3 class="mb-4" v-if="messages.length > 0">I miei messaggi</h3>
    <h3 class="mb-4" v-if="messages.length === 0">Nessun messaggio da mostrare</h3>
    <div class="row mb-4" v-for="message in messages">
      <div class="col-12">
        <div class="card">
          <div class="card-header">Messaggio</div>
          <div class="card-body">
            <h5 class="card-title">@{{ user.username }}</h5>
            <p class="card-text">{{ message.text }}</p>
            <button type="button" class="btn btn-primary position-relative" @click.prevent="toggleLike(message)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   class="bi bi-hand-thumbs-up" viewBox="0 0 16 16" v-if="!isMessageLiked(message)">
                <path
                    d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16" v-else>
                <path
                    d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
              </svg>
              Like
              <span class="position-absolute translate-middle top-0 start-100 badge rounded-pill bg-danger">
                      {{ message.likes.length }}
                      <span class="visually-hidden">Number of likes</span>
                    </span>
            </button>
          </div>
          <div class="card-footer text-muted">{{ (new Date(message.date)).toLocaleDateString() }} -
            {{ (new Date(message.date)).toLocaleTimeString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import {serverURL} from "@/js/main";
import {useMessagePostedStore} from "@/js/stores/useMessagePostedStore";
import {useIsUserAuthenticatedStore} from "@/js/stores/useIsUserAuthenticatedStore";

export default {
  name: 'UserMessages',
  data() {
    return {
      loading: null,
      error: null,
      messages: null
    }
  },
  props: {
    user: {}
  },
  computed: {
    messagePostedAlertToggled() {
      return this.store.newMessagePosted;
    }
  },
  setup() {
    const store = useMessagePostedStore();
    const authStore = useIsUserAuthenticatedStore();
    return {
      store, authStore
    }
  },
  created() {
    this.$watch(
        () => this.user,
        () => {
          this.fetchMessages();
        },
        {immediate: true}
    )
  },
  watch: {
    messagePostedAlertToggled: {
      handler() {
        this.fetchMessages();
      },
      immediate: true
    }
  },
  methods: {
    fetchMessages() {
      this.error = null;
      this.messages = null;
      this.loading = true;
      axios.get(serverURL + "/api/social/messages/" + this.user._id).then(response => {
        this.loading = false;
        if (response.data) {
          this.messages = response.data;
          this.messages.sort((firstMessage, secondMessage) => {
            const firstMessageDate = new Date(firstMessage.date);
            const secondMessageDate = new Date(secondMessage.date);
            if (firstMessageDate.getTime() > secondMessageDate.getTime()) {
              return -1;
            } else if (firstMessageDate.getTime() < secondMessageDate.getTime()) {
              return 1;
            } else {
              return 0;
            }
          });
        } else {
          this.messages = [];
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
    },
    isMessageLiked(message) {
      return !!message.likes.includes(this.authStore.getAuthenticatedUsername);
    },
    toggleLike(message) {
      if (this.authStore.isUserAuthenticated) {
        if (this.isMessageLiked(message)) {
          axios.delete(serverURL + "/api/social/like/" + message._id).then(() => {
            const indexToRemove = message.likes.indexOf(this.authStore.getAuthenticatedUsername);
            message.likes.splice(indexToRemove, 1);
          }).catch(error => {
            console.log(error);
          });
        } else {
          axios.post(serverURL + "/api/social/like/" + message._id).then(() => {
            message.likes.push(this.authStore.getAuthenticatedUsername);
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
