<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import mitt from "mitt";
export default defineComponent({
  name: "App",
  setup() {
    const emitter = mitt();
    return { emitter };
  },
});
</script>
