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
                       :class="inputMessageClass"/>
                <label for="inputNewMessage">Scrivi il tuo nuovo messaggio qui</label>
                <div class="invalid-feedback">Campo obbligatorio!</div>
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
import {useMessagePostedStore} from "@/js/stores/useMessagePostedStore";

export default {
  name: "NewMessageModalDialog",
  data() {
    return {
      text: "",
      inputMessageClass: "form-control"
    }
  },
  setup() {
    const store = useMessagePostedStore();
    return {
      store
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
        this.store.toggleMessagePosted();
        const modal = bootstrap.Modal.getInstance(document.getElementById("newMessageModal"));
        modal.hide();
        this.text = "";
        this.inputMessageClass = "form-control";
      }).catch(error => {
        if (error.response) {
          console.log(error.response);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log(error);
        }
      });
    },
    isMessageNotEmpty() {
      if (this.text !== "") {
        this.inputMessageClass = "form-control is-valid";
        return true;
      } else {
        this.inputMessageClass = "form-control is-invalid";
        return false;
      }
    }
  }
}
</script>

<style scoped>

</style>