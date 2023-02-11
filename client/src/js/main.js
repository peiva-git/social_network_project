import { createApp } from 'vue'
import App from '../App.vue'
import LoginPage from "@/components/LoginPage.vue";
import {createRouter, createWebHashHistory} from "vue-router";
import SearchedUsers from "@/components/SearchedUsers.vue";
import UserProfile from "@/components/UserProfile.vue";
import {createPinia} from "pinia";
import {useIsUserAuthenticatedStore} from "@/js/stores/useIsUserAuthenticatedStore";
import NotFound from "@/components/NotFound.vue";

export const serverURL = "http://localhost:8080";
export const userAuthenticatedKey = "userAuth";
export const authenticatedUsernameKey = "usernameAuth";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const routes = [
    {
        path: "/login",
        component: LoginPage,
        name: "LoginPage"
    },
    {
        path: "/",
        component: LoginPage,
        beforeEnter: () => {
            const store = useIsUserAuthenticatedStore(pinia);
            if (store.isUserAuthenticated) {
                return {path: "/users/myaccount"};
            } else {
                return {path: "/login"};
            }
        }
    },
    {
        path: "/users",
        component: SearchedUsers,
        name: "SearchedUsers"
    },
    {
        path: "/users/:userId",
        component: UserProfile,
        name: "UserProfile",
        beforeEnter: (to) => {
            if (to.params.userId === "myaccount") {
                const store = useIsUserAuthenticatedStore(pinia);
                if (!store.isUserAuthenticated) {
                    return {path: "/login"};
                }
            }
        }
    },
    {
        path: "/:pathMatch(.*)*",
        component: NotFound,
        name: "NotFound"
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

app.use(router);
app.mount('#app');
