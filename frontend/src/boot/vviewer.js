import { boot } from "quasar/wrappers";
import "viewerjs/dist/viewer.css";
import VueViewer from "v-viewer";
export default boot(async ({ app }) => {
  app.use(VueViewer);
  app.directive("v-viewer", VueViewer).default;
});
