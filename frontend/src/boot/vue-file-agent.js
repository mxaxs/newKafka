import { boot } from "quasar/wrappers";

import DropZone from "dropzone-vue";
// optionally import default styles
import "dropzone-vue/dist/dropzone-vue.common.css";

export default boot(async ({ app }) => {
  app.config.globalProperties.DropZone = DropZone;
  app.use(DropZone);
});
export { DropZone };
