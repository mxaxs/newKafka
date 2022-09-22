import { boot } from "quasar/wrappers";
import Swal from "sweetalert2";
export default boot(({ app }) => {
  // something to do
  app.component({ Swal });
  app.config.globalProperties.Swal = Swal;
});
