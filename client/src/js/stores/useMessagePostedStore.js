import {defineStore} from "pinia";

export const useMessagePostedStore = defineStore("messagePostedStore", {
    state: () => ({
        messagePosted: false
    }),
    actions: {
        toggleMessagePosted() {
            this.messagePosted = !this.messagePosted;
        }
    },
    getters: {
        newMessagePosted: (state) => state.messagePosted
    }
});