import { boot } from "quasar/wrappers";

import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";

export default boot(async ({ app }) => {
  app.component(Splitpanes);
  app.component(Pane);

  // something to do
});
