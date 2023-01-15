<template>
  <div class="modal fade" id="registrationModal" tabindex="-1" aria-labelledby="registrationModalLabel"
       aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="registrationModalLabel">Inserire i dati richiesti per la registrazione</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"/>
        </div>
        <div class="modal-body">
          <form class="row g-3" novalidate>
            <div class="col-12">
              <div class="form-floating mb-3">
                <input type="text" id="inputUsername" placeholder="mariorossi" required
                       v-model="newUser.username" :class="registrationUsernameClass"
                       @input="isRegistrationUsernameNotEmpty"/>
                <label for="inputUsername">Username utente</label>
                <div class="valid-feedback">Username valido!</div>
                <div class="invalid-feedback">{{ registrationUsernameErrorMessage }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="text" id="inputName" placeholder="Mario" required
                       v-model="newUser.name" :class="registrationNameClass" @input="isRegistrationNameNotEmpty"/>
                <label for="inputName">Nome utente</label>
                <div class="valid-feedback">Nome utente valido!</div>
                <div class="invalid-feedback">Campo obbligatorio!</div>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="text" id="inputSurname" placeholder="Rossi" required
                       v-model="newUser.surname" :class="registrationSurnameClass"
                       @input="isRegistrationSurnameNotEmpty"/>
                <label for="inputSurname">Cognome utente</label>
                <div class="valid-feedback">Congome utente valido!</div>
                <div class="invalid-feedback">Campo obbligatorio!</div>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="password" id="inputPassword" placeholder="Password" required
                       v-model="newUser.password" :class="registrationPasswordClass"
                       @input="registrationPasswordsMatchAndNotEmpty"/>
                <label for="inputPassword">Password</label>
                <div class="valid-feedback">Password valida!</div>
                <div class="invalid-feedback">Le password non coincidono!</div>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating mb-3">
                <input type="password" id="inputPasswordConfirm" placeholder="Confirm password" required
                       v-model="newUser.confirmPassword" :class="registrationPasswordConfirmClass"
                       @input="registrationPasswordsMatchAndNotEmpty"/>
                <label for="inputPasswordConfirm">Conferma password</label>
              </div>
            </div>
            <div class="col-12">
              <div class="form-floating mb-3">
                <input type="text" id="inputBio" class="form-control" placeholder="Bio" required
                       v-model="newUser.bio" :class="registrationBioClass" @input="isRegistrationBioNotEmpty"/>
                <label for="inputBio">Inserire bio descrittiva</label>
                <div class="valid-feedback">Bio valida!</div>
                <div class="invalid-feedback">Campo obbligatorio!</div>
              </div>
            </div>
            <div class="col-12">
              <div class="form-check">
                <input type="checkbox" id="privacyCheck" required
                       v-model="privacyAgreementChecked" :class="registrationPrivacyAgreementCLass"
                       @change="isPrivacyAgreementChecked"/>
                <label class="form-check-label" for="privacyCheck">Acconsento al trattamento dei miei dati
                  personali</label>
                <div class="invalid-feedback">Consenso obbligatorio!</div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
          <button type="submit" class="btn btn-primary" @click.prevent="submitRegistrationForm">Registrazione</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import {serverURL} from "@/js/main";
import {useIsUserAuthenticatedStore} from "@/js/stores/useIsUserAuthenticatedStore";

export default {
  name: 'RegistrationModalDialog',
  data() {
    return {
      registrationUsernameClass: 'form-control',
      registrationPasswordClass: 'form-control',
      registrationPasswordConfirmClass: 'form-control',
      registrationNameClass: 'form-control',
      registrationSurnameClass: 'form-control',
      registrationBioClass: 'form-control',
      registrationPrivacyAgreementCLass: 'form-check-input',
      privacyAgreementChecked: false,
      registrationUsernameErrorMessage: '',
      newUser: {
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        surname: '',
        bio: ''
      },
    }
  },
  setup() {
    const store = useIsUserAuthenticatedStore();
    return {
      store
    }
  },
  methods: {
    submitRegistrationForm() {
      if (!this.isRegistrationUsernameNotEmpty()
          || !this.isRegistrationNameNotEmpty()
          || !this.isRegistrationSurnameNotEmpty()
          || !this.registrationPasswordsMatchAndNotEmpty()
          || !this.isRegistrationBioNotEmpty()
          || !this.isPrivacyAgreementChecked()) {
        return;
      }
      axios.post(serverURL + "/api/auth/signup", {
        name: this.newUser.name,
        surname: this.newUser.surname,
        bio: this.newUser.bio,
        username: this.newUser.username,
        password: this.newUser.password
      }, {
        headers: {"Accept": "application/json", "Content-Type": "application/json"}
      }).then(response => {
        const modal = bootstrap.Modal.getInstance(document.getElementById("registrationModal"));
        modal.hide();
        document.cookie = `token=${response.data.token}`;
        this.store.setUserAuthenticated(true);
        this.store.setAuthenticatedUsername(this.newUser.username);
        document.getElementById("registrationModal").addEventListener("hidden.bs.modal", () => {
          this.$router.replace({name: "UserProfile", params: {userId: "myaccount"}});
        });
      }).catch(error => {
        this.registrationUsernameClass = "form-control is-invalid";
        if (error.response) {
          if (error.response.status === 400) {
            this.registrationUsernameErrorMessage = "Username non disponibile!";
          } else {
            this.registrationUsernameErrorMessage = "Errore durante l'autenticazione, riprovare";
          }
        } else if (error.request) {
          this.registrationUsernameErrorMessage = "Server non raggiungibile!";
        } else {
          this.registrationUsernameErrorMessage = "Errore lato client, riprovare";
        }
        console.log(error.config);
      });
    },
    isRegistrationUsernameNotEmpty() {
      if (this.newUser.username !== '') {
        this.registrationUsernameClass = 'form-control is-valid';
        return true;
      } else {
        this.registrationUsernameClass = 'form-control is-invalid';
        this.registrationUsernameErrorMessage = "Campo obbligatorio!";
        return false;
      }
    },
    registrationPasswordsMatchAndNotEmpty() {
      if (this.newUser.password === this.newUser.confirmPassword && this.newUser.password !== '') {
        this.registrationPasswordClass = 'form-control is-valid';
        this.registrationPasswordConfirmClass = 'form-control is-valid';
        return true;
      } else {
        this.registrationPasswordClass = 'form-control is-invalid';
        this.registrationPasswordConfirmClass = 'form-control is-invalid';
        return false;
      }
    },
    isRegistrationNameNotEmpty() {
      if (this.newUser.name !== '') {
        this.registrationNameClass = 'form-control is-valid';
        return true;
      } else {
        this.registrationNameClass = 'form-control is-invalid';
        return false;
      }
    },
    isRegistrationSurnameNotEmpty() {
      if (this.newUser.surname !== '') {
        this.registrationSurnameClass = 'form-control is-valid';
        return true;
      } else {
        this.registrationSurnameClass = 'form-control is-invalid';
        return false;
      }
    },
    isRegistrationBioNotEmpty() {
      if (this.newUser.bio !== '') {
        this.registrationBioClass = 'form-control is-valid';
        return true;
      } else {
        this.registrationBioClass = 'form-control is-invalid';
        return false;
      }
    },
    isPrivacyAgreementChecked() {
      if (this.privacyAgreementChecked) {
        this.registrationPrivacyAgreementCLass = 'form-check-input is-valid';
        return true;
      } else {
        this.registrationPrivacyAgreementCLass = 'form-check-input is-invalid';
        return false;
      }
    }
  }
}
</script>
