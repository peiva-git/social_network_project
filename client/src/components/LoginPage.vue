<template>
  <form class="position-absolute top-50 start-50 translate-middle" novalidate>
    <div class="form-floating mb-3">
      <input type="text" id="username" placeholder="mariorossi" required
             v-model="user.username"
             class="form-control"
             :class="{'is-valid': isUsernameValid, 'is-invalid': isUsernameInvalid}"
             @input="isLoginUsernameNotEmpty"/>
      <label for="username">Username utente</label>
      <div class="valid-feedback">Username valido!</div>
      <div class="invalid-feedback">{{ loginUsernameErrorMessage }}</div>
    </div>
    <div class="form-floating mb-3">
      <input type="password" id="userPassword" placeholder="Password" required
             v-model="user.password"
             class="form-control"
             :class="{'is-valid': isPasswordValid, 'is-invalid': isPasswordInvalid}"
             @input="isLoginPasswordNotEmpty"/>
      <label for="userPassword">Password</label>
      <div class="valid-feedback">Password valida!</div>
      <div class="invalid-feedback">{{ loginPasswordErrorMessage }}</div>
    </div>
    <div class="d-flex text-center justify-content-between">
      <button type="submit" class="btn btn-primary me-2 mb-3 flex-grow-1" @click.prevent="submitLoginForm">Login</button>
      <button type="button" class="btn btn-secondary mb-3 flex-grow-1" data-bs-toggle="modal" data-bs-target="#registrationModal">
        Registrazione
      </button>
    </div>
  </form>

  <!-- Registration modal-->
  <registration-modal-dialog/>
</template>

<script>
import RegistrationModalDialog from "@/components/RegistrationModalDialog.vue";
import axios from "axios";
import {serverURL} from "@/js/main";
import {useIsUserAuthenticatedStore} from "@/js/stores/useIsUserAuthenticatedStore";

export default {
  name: "LoginPage",
  components: {RegistrationModalDialog},
  data() {
    return {
      isUsernameValid: false,
      isUsernameInvalid: false,
      isPasswordValid: false,
      isPasswordInvalid: false,
      loginUsernameErrorMessage: '',
      loginPasswordErrorMessage: '',
      user: {
        username: '',
        password: ''
      }
    }
  },
  setup() {
    const store = useIsUserAuthenticatedStore();
    return {
      store
    }
  },
  methods: {
    submitLoginForm() {
      if (!this.isLoginUsernameNotEmpty() || !this.isLoginPasswordNotEmpty()) {
        return;
      }
      axios.post(serverURL + "/api/auth/signin", {
        username: this.user.username,
        password: this.user.password
      }).then(response => {
        document.cookie = `token=${response.data.token}`;
        this.store.setUserAuthenticated(true);
        this.store.setAuthenticatedUsername(this.user.username);
        this.$router.replace({name: "UserProfile", params: {userId: "myaccount"}});
      }).catch(error => {
        this.isUsernameValid = false;
        this.isUsernameInvalid = true;
        this.isPasswordValid = false;
        this.isPasswordInvalid = true;
        if (error.response) {
          if (error.response.status === 400) {
            this.loginUsernameErrorMessage = "Credenziali errate!";
            this.loginPasswordErrorMessage = "Credenziali errate!";
          } else {
            this.loginUsernameErrorMessage = "Errore durante l'autenticazione, riprovare";
            this.loginPasswordErrorMessage = "Errore durante l'autenticazione, riprovare";
          }
        } else if (error.request) {
          this.loginUsernameErrorMessage = "Server non raggiungibile!";
          this.loginPasswordErrorMessage = "Server non raggiungibile!";
        } else {
          this.loginUsernameErrorMessage = "Errore lato client, riprovare";
          this.loginPasswordErrorMessage = "Errore lato client, riprovare";
        }
      });
    },
    isLoginUsernameNotEmpty() {
      if (this.user.username !== '') {
        this.isUsernameValid = true;
        this.isUsernameInvalid = !this.isUsernameValid;
        return true;
      } else {
        this.isUsernameInvalid = true;
        this.isUsernameValid = !this.isUsernameInvalid;
        this.loginUsernameErrorMessage = "Campo obbligatorio!";
        return false;
      }
    },
    isLoginPasswordNotEmpty() {
      if (this.user.password !== '') {
        this.isPasswordValid = true;
        this.isPasswordInvalid = !this.isPasswordValid;
        return true;
      } else {
        this.isPasswordInvalid = true;
        this.isPasswordValid = !this.isPasswordInvalid;
        this.loginPasswordErrorMessage = "Campo obbligatorio!";
        return false;
      }
    }
  }
}
</script>

