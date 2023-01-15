import {defineStore} from "pinia";
import {authenticatedUsernameKey, userAuthenticatedKey} from "@/js/main";

export const useIsUserAuthenticatedStore = defineStore("isUserAuthenticatedStore", {
    state: () => ({
        userAuthenticated: localStorage.getItem(userAuthenticatedKey) === "true",
        authenticatedUsername: localStorage.getItem(authenticatedUsernameKey)
    }),
    actions: {
        setUserAuthenticated(authenticated) {
            if (authenticated === true) {
                this.userAuthenticated = true;
                localStorage.setItem(userAuthenticatedKey, "true");
            } else {
                this.userAuthenticated = false;
                localStorage.setItem(userAuthenticatedKey, "false");
            }
        },
        setAuthenticatedUsername(username) {
            this.authenticatedUsername = username;
            if (username === null) {
                localStorage.removeItem(authenticatedUsernameKey);
            } else {
                localStorage.setItem(authenticatedUsernameKey, username);
            }
        }
    },
    getters: {
        isUserAuthenticated: (state) => state.userAuthenticated,
        getAuthenticatedUsername: (state) => state.authenticatedUsername
    }
});