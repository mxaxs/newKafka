/* eslint-disable vue/multi-word-component-names */
import { boot } from "quasar/wrappers";

import Multiselect from "vue-multiselect";
// register globally

export default boot(async ({ app }) => {
  app.component({ multiselect: Multiselect });
});
