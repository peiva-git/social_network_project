<template>
  <div class="modal fade" id="newMessageModal" tabindex="-1" aria-labelledby="newMessageModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="newMessageModalLabel">Nuovo messaggio</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"/>
        </div>
        <div class="modal-body">
          <form class="row g-3" novalidate>
            <div class="col-12">
              <div class="form-floating mb-3">
                <input type="text" id="inputNewMessage" placeholder="Nuovo messaggio" required
                       @input="isMessageNotEmpty"
                       v-model="text"
                       class="form-control"
                       :class="{'is-valid': isValid, 'is-invalid': isInvalid}"/>
                <label for="inputNewMessage">Scrivi il tuo nuovo messaggio qui</label>
                <div class="invalid-feedback">{{errorMessage}}</div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
          <button type="submit" class="btn btn-primary" @click.prevent="postMessage">Pubblica</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {serverURL} from "@/js/main";
import bootstrap from "/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";

export default {
  name: "NewMessageModalDialog",
  data() {
    return {
      text: "",
      isValid: false,
      isInvalid: false,
      errorMessage: ""
    }
  },
  emits: {
    newMessagePosted(message) {
      if (!message) {
        return false;
      }
      return !(!message.text || !message.likes || !message.date);
    }
  },
  methods: {
    postMessage() {
      if (!this.isMessageNotEmpty()) {
        return;
      }
      axios.post(serverURL + "/api/social/messages", {
        text: this.text
      }).then(() => {
        this.$emit("newMessagePosted", {
          text: this.text,
          likes: [],
          date: new Date()
        });
        const modal = bootstrap.Modal.getInstance(document.getElementById("newMessageModal"));
        modal.hide();
        this.text = "";
        this.isValid = false;
        this.isInvalid = false;
      }).catch(error => {
        if (error.response) {
          this.errorMessage = "Errore lato server, riprovare";
        } else if (error.request) {
          this.errorMessage = "Server non raggiungibile, riprovare";
        } else {
          this.errorMessage = "Errore lato client, riprovare";
        }
      });
    },
    isMessageNotEmpty() {
      if (this.text !== "") {
        this.isValid = true;
        this.isInvalid = !this.isValid;
        return true;
      } else {
        this.errorMessage = "Campo obbligatorio!";
        this.isValid = false;
        this.isInvalid = !this.isValid;
        return false;
      }
    }
  }
}
</script>

<style scoped>
</style>