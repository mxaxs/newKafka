<template>
  <div
    id="scores"
    class="row full-width q-pa-sm q-mx-lg q-mb-lg shadow-22 scoreCard"
  >
    <div class="col">
      <div class="scoreCard text-center">
        <q-avatar
          size="80px"
          font-size="52px"
          color="white"
          text-color="white"
          class="q-mt-sm"
        >
          <div class="absolute-bottom">
            <q-circular-progress
              indeterminate
              size="20px"
              :thickness="0.4"
              font-size="50px"
              color="teal"
              track-color="grey-4"
              center-color="white"
              class="q-ma-md"
              @click="doUpdate()"
            />
          </div>
          <img src="~assets/score.jpeg" />
        </q-avatar>
        <div class="row-grow text-center">
          <div class="text-h6 text-dark">Agora {{ category }}</div>
          <div class="text-grey relative-position" style="top: -8px">
            plantão em andamento
          </div>
        </div>
        <div class="col justify-center q-mb-md">
          <q-btn-group class="btn-grad text-dark">
            <q-btn glossy label="ECG" @click="reCat('ECG')" />
            <q-btn glossy label="EEG" @click="reCat('EEG')" />
            <q-btn glossy label="ESP" @click="reCat('ESP')" />
            <q-btn glossy label="DMD" @click="reCat('DMD')" />
          </q-btn-group>
        </div>
        <div class="row text-center full-width">
          <div class="col">
            <div class="text-h5 text-dark text-bold">
              {{ waiting.toString().padStart(2, "0") }}
            </div>
            <div
              class="scoreItem text-dark relative-position"
              style="top: -8px"
            >
              aguardando
            </div>
          </div>
          <div class="col">
            <div class="text-h5 text-dark text-bold">
              {{ appraised.toString().padStart(2, "0") }}
            </div>
            <div
              class="scoreItem text-dark relative-position"
              style="top: -8px"
            >
              {{ appraised > 1 ? "laudados" : "laudado" }}
            </div>
          </div>
          <div class="col">
            <div class="text-h5 text-dark text-bold">
              {{ rejected.toString().padStart(2, "0") }}
            </div>
            <div
              class="scoreItem text-dark relative-position"
              style="top: -8px"
            >
              {{ rejected > 1 ? "rejeitados" : "rejeitado" }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-grow">
      <div class="col-grow q-ml-lg relative-position">
        <div class="float-right q-mt-lg">
          <apexchart
            ref="$piechart"
            width="350"
            type="pie"
            :options="chartOptions"
            :series="series"
            color="white"
          ></apexchart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref, watchEffect, inject } from "vue";
import gql from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";
import { useCoreStore } from "src/stores/core";
export default {
  name: "ProjectScore",
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
