<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div id="alertToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header text-bg-warning">
        <img src="/node_modules/bootstrap-icons/icons/exclamation-diamond-fill.svg" class="rounded bg-warning me-2" alt="Warning icon"/>
        <strong class="me-auto">{{errorType}}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">{{errorDescription}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AlertToast",
  props: {
    errorType: "",
    errorDescription: ""
  }
}
</script>

<style scoped>

</style>