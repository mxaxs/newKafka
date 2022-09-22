/* eslint-disable vue/multi-word-component-names */
import { boot } from "quasar/wrappers";

//import Vue from "vue";
import tinymce from "vue-tinymce-editor";
//Vue.component("tinymce", tinymce);

export default boot(async ({ app }) => {
  app.use(tinymce);
  app.component("tinymce", tinymce);
});
