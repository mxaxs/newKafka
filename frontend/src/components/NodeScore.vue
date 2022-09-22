<template>
  <div id="scores" class="row full-width q-pa-sm q-mx-lg q-mb-lg scoreCard">
    <div class="col bg-yellow"></div>
    <div class="col-grow bg-lime"></div>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref, watchEffect, inject } from "vue";
import gql from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";
import { useCoreStore } from "src/stores/core";
export default {
  name: "NodeScore",
  props: { projectid: Number },
  data() {
    return {
      project_num: this.projectid,
    };
  },
  methods: {
    updateChart() {
      console.log("updateChart");
    },
  },
  created() {
    this.emitter.on("updateChart", this.updateChart());
  },
  computed: {
    series: function () {
      return [
        this.coreStore.$state.waiting,
        this.coreStore.$state.appraised,
        this.coreStore.$state.rejected,
      ];
    },
  },
  setup(props) {
    const emitter = inject("emitter");
    const $piechart = ref(null);
    const coreStore = useCoreStore();
    const category = ref("");
    const pi = reactive({ pollInterval: 60000 });
    const variables = reactive({
      project: 1,
      category: "ECG",
    });
    const setupProject = ref(props.projectid);
    const setupCateg = ref("ECG");
    const waiting = computed(() => coreStore.$state.waiting);
    const appraised = computed(() => coreStore.$state.appraised);
    const rejected = computed(() => coreStore.$state.rejected);
    const { result, refetch, error } = useQuery(
      gql`
        query scoreproj($project: Int!, $category: String!) {
          projectscore(args: { proj: $project, cat: $category }) {
            status
            total
          }
        }
      `,
      variables,
      pi
    );
    const reCat = (cat) => {
      category.value = cat;
      const proj = JSON.parse(sessionStorage.getItem("loggedUser"))[
        "projects"
      ][0];
      $piechart.value.updateSeries([0, 1, 0], true);
      refetch({ project: proj, category: cat });
      doUpdate();
    };

    const doUpdate = () => {
      console.log("DO UPDATE!");
      $piechart.value.updateSeries([1, 1, 1]);
      $piechart.value.updateSeries(
        [
          coreStore.$state.waiting,
          coreStore.$state.appraised,
          coreStore.$state.rejected,
        ],
        true
      );
    };
    const chartOptions = ref({
      labels: ["Aguardando", "Laudados", "Rejeitados"],
      dataLabels: {
        distributed: true,
        offsetX: 10,
        offsetY: 10,
      },
      noData: { text: "nada aqui", align: "center" },
      chart: {
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 400,
          },
        },
      },
    });
    watchEffect(() => {
      if (result.value) {
        const resp = result.value;
        console.log("THE NEW RETURN >>>>", resp);
        coreStore.$state.waiting =
          resp.projectscore.find((s) => s.status === 1)?.total ?? 0;
        coreStore.$state.appraised =
          resp.projectscore.find((s) => s.status === 2)?.total ?? 0;
        coreStore.$state.rejected =
          resp.projectscore.find((s) => s.status === 3)?.total ?? 0;

        emitter.emit("reloadChart");
      }
    });
    onMounted(() => {
      variables.projects =
        JSON.parse(sessionStorage.getItem("loggedUser"))?.projects ?? [];
      variables.categories = "ECG";
      category.value = "ECG";
    });

    return {
      emitter,
      setupCateg,
      setupProject,
      result,
      refetch,
      variables,
      coreStore,
      waiting,
      appraised,
      rejected,
      reCat,
      category,
      chartOptions,
      doUpdate,
      $piechart,
    };
  },
};
</script>
