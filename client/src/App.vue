<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand">My social network app</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
              aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation bar">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-if="!store.isUserAuthenticated">
            <router-link class="nav-link" to="/login">Accedi</router-link>
          </li>
          <li class="nav-item dropdown" v-else>
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{store.getAuthenticatedUsername}}
            </a>
            <ul class="dropdown-menu">
              <li><router-link to="/users/myaccount" class="dropdown-item">Il mio account</router-link></li>
              <li><router-link to="#" @click.prevent="goToLoginPage" class="dropdown-item">Logout</router-link></li>
            </ul>
          </li>
        </ul>
        <form class="d-flex col-lg-4" role="search">
          <input class="form-control me-2" type="search" placeholder="Cerca utenti" aria-label="Cerca utenti"
                 v-model="searchString"/>
          <button class="btn btn-outline-success" type="submit" @click.prevent="searchForUsers">Cerca</button>
        </form>
      </div>
    </div>
  </nav>
  <router-view/>
</template>

<script>
import {useIsUserAuthenticatedStore} from "@/js/stores/useIsUserAuthenticatedStore";

export default {
  name: "App",
  data() {
    return {
      searchString: ""
    }
  },
  setup() {
    const store = useIsUserAuthenticatedStore();
    return {
      store
    }
  },
  methods: {
    goToLoginPage() {
      this.store.setUserAuthenticated(false);
      this.store.setAuthenticatedUsername(null);
      document.cookie = "token=;";
      this.$router.push("/login");
    },
    searchForUsers() {
      this.$router.push({path: "/users", query: {q: this.searchString}});
    }
  }
}
</script>

<style scoped>
</style>
