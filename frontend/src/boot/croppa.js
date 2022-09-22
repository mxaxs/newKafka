import { boot } from "quasar/wrappers";
import Croppa from "df-croppa";
import "df-croppa/dist/vue-croppa.css";
export default boot(async ({ app }) => {
  app.use(Croppa);
  // eslint-disable-next-line vue/multi-word-component-names
  app.component({ croppa: Croppa.component });
});
