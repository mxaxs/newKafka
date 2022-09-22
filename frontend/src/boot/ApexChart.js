import { boot } from "quasar/wrappers";
import VueApexCharts from "vue3-apexcharts";

export default boot(async ({ app }) => {
  app.use(VueApexCharts);
  app.component("ApexCharts", VueApexCharts);
  app.config.globalProperties.$apexcharts = VueApexCharts;
});
