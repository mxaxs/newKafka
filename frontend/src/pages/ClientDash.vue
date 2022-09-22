<template>
  <q-page padding>
    <div
      class="full-width row inline wrap justify-start items-start content-start"
    >
      <div v-if="showDiv" class="backdiv"></div>
      <div class="absolute-top">
        <q-icon
          style="cursor: pointer"
          size="md"
          :name="showDiv ? 'toggle_on' : 'toggle_off'"
          class="float-left q-mx-lg q-my-xs"
          @click="toggleDiv()"
        />
      </div>
      <div
        :class="$q.platform.is.desktop ? 'col-3' : 'col'"
        class="text-center"
      >
        <upload-files class="q-mx-auto q-my-auto" :key="upcount" />
        <exames-laudados
          class="q-mx-auto center q-mx-auto q-mt-md"
          v-if="$q.platform.is.mobile"
        />
        <exames-enviados class="center q-mx-auto q-mt-md" />
      </div>
      <div
        class="col-grow q-mr-xl q-mt-lg text-center"
        style="height: 80vh"
        v-if="$q.platform.is.desktop"
      >
        <div
          :class="showDiv ? 'text-white' : 'text-dark'"
          class="text-h4 no-padding absolute-right text-weight-light"
          style="margin-right: 10vw; margin-top: 32px"
        >
          {{ today }}
        </div>
        <div class="row q-mt-xl">
          <div class="col q-mx-auto text-center">
            <exames-repetir class="q-mx-auto" />
          </div>
          <div class="col"><exames-laudados class="q-mx-auto" /></div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { inject, ref } from "vue";
import moment from "moment";
import DataService from "src/common/services/DataService";
import UploadFiles from "src/components/UploadFiles.vue";
import ExamesEnviados from "../components/ExamesEnviados.vue";
import ExamesRepetir from "../components/ExamesRepetir.vue";
import ExamesLaudados from "../components/ExamesLaudados.vue";
import Swal from "sweetalert2";
export default {
  components: {
    UploadFiles,
    ExamesEnviados,
    ExamesRepetir,
    ExamesLaudados,
  },
  computed: {
    today: function () {
      moment.locale("pt-br");
      return moment().format("LL");
    },
  },
  methods: {
    async arquive(id) {
      Swal.fire({
        title: "Remover exame da lista",
        text: "Esta ação não é reversível",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim! Remover.",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          const data = { id: id, status: 4 };
          DataService.lockexam(data).then((_) => {
            this.emitter.emit("reloadUI");
          });
        }
      });
    },
  },
  created() {
    this.emitter.on("arquive", (e) => this.arquive(e));

    this.emitter.on("changeExamType", () => {
      this.upcount++;
    });
  },
  setup() {
    const emitter = inject("emitter");
    const upcount = ref(0);
    const showDiv = ref(true);
    const optExams = [
      { label: "ECG", value: "ECG" },
      { label: "EEG", value: "EEG" },
      { label: "DMD", value: "DMD" },
    ];
    const sendExamType = function () {
      localStorage.setItem("sendExamType", this.sendExam);
    };

    const getExamType = function () {
      const se = localStorage.getItem("sendExamType");
      this.sendExam = se;
    };

    return {
      upcount,
      showDiv,
      optExams,
      toggleDiv() {
        showDiv.value = !showDiv.value;
      },
      sendExamType,
      getExamType,
    };
  },
};
</script>
<style lang="css" scoped>
.backdiv {
  z-index: -1;
  position: absolute;
  top: 0;
  background-image: url("~assets/bg-top.jpeg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  height: 320px;
  width: 96%;
  border-radius: 20px;
  background-color: primary;
}
.my-custom-toggle {
  border: 1px solid teal;
}
</style>
