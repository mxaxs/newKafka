<template>
  <div
    class="myCard full-width row inline wrap justify-start items-start content-start"
  >
    <div class="col-3 full-height q-pt-md q-px-md">
      <div class="text-h6 text-weight-light text-dark">
        Exames Arquivados
        <q-badge color="primary" align="top">{{ sentExams.length }}</q-badge>
      </div>
      <q-input
        v-model="searchQuery"
        outlined
        dense
        type="search"
        placeholder="Digite para filtrar"
        color="text-dark"
        label-color="text-dark"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <div
        class="text-grey text-left q-mt-sm q-mx-sm text-caption"
        style="line-height: 100%"
      >
        Digite algo para filtrar os resultados de sua lista de exames arquivados
      </div>
    </div>
    <div class="col full-grow justify-center">
      <q-scroll-area class="q-mr-sm" style="height: 25vh">
        <div
          class="text-left q-mx-lg"
          color="primary"
          v-for="item in filteredList"
          :key="item.created"
          dense
        >
          <q-list class="rounded-borders text-dark" style="max-width: 80%">
            <q-item>
              <q-item-section top class="col-2">
                <q-item-label class="q-mt-sm">
                  <q-avatar size="42px">
                    <q-img src="~assets/pdf48.png" />
                  </q-avatar>
                </q-item-label>
              </q-item-section>

              <q-item-section top>
                <q-item-label lines="1">
                  <span class="text-weight-medium">{{ item.nome }}</span>
                </q-item-label>
                <q-item-label lines="2" caption class="text-dark">
                  {{ item.category }}<br />
                  Laudado em {{ hour(item.appraised).day }} às
                  {{ hour(item.created).hour }}
                </q-item-label>
              </q-item-section>

              <q-item-section middle side>
                <div class="text-grey-8 q-gutter-xs text-primary">
                  <q-btn
                    class="gt-xs text-dark"
                    size="12px"
                    flat
                    dense
                    round
                    icon="visibility"
                  />
                  <q-btn
                    class="gt-xs text-dark"
                    size="12px"
                    flat
                    dense
                    round
                    icon="email"
                  />
                  <q-btn
                    size="12px"
                    flat
                    dense
                    round
                    icon="folder"
                    class="text-dark"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator spaced="10px" />
          </q-list>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script>
import { inject } from "vue";
import DataService from "src/common/services/DataService";
import moment from "moment";
import Swal from "sweetalert2";
export default {
  name: "ExamesArquivados",
  data() {
    return {
      searchQuery: "",
      sentExams: [],
    };
  },
  created() {
    this.emitter.on("reloadUI", () => this.retrieveExams());
  },
  computed: {
    filteredList: function () {
      var self = this;
      return self.sentExams.filter(function (item) {
        var searchRegex = new RegExp(self.searchQuery, "i");
        return (
          searchRegex.test(item.nome) ||
          searchRegex.test(item.exam) ||
          searchRegex.test(item.created) ||
          searchRegex.test(item.motivoexame) ||
          searchRegex.test(item.nascimento) ||
          searchRegex.test(item.observacoes) ||
          searchRegex.test(item.category) ||
          searchRegex.test(item.appraised) ||
          searchRegex.test(item.crm) ||
          searchRegex.test(item.hd) ||
          searchRegex.test(item.medicname) ||
          searchRegex.test(item.sexo)
        );
      });
    },
  },
  methods: {
    hour: function (date) {
      moment.locale("pt-br");
      const day = moment
        .utc(date, "YYYY-MM-DD[T]HH:mm:SS")
        .local()
        .format("DD/MM");
      const hour = moment
        .utc(date, "YYYY-MM-DD[T]HH:mm:SS")
        .local()
        .format("HH:mm");
      return { day: day, hour: hour };
    },
    getProject() {
      const user = sessionStorage.getItem("loggedUser");
      const jsonUser = JSON.parse(user);
      if (jsonUser["Project"] == null) return null;
      return jsonUser["Project"][0];
    },
    retrieveExams() {
      const project = this.getProject();
      const params = { project: project, status: 4, limit: 100 };
      DataService.allExams(params)
        .then((response) => {
          this.sentExams = response.data.doc;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    deleteExam(id, nome, exam) {
      Swal.fire({
        title: `Apagar o exame de ${nome}?`,
        text: "Você está prestes a apagar este exame e não poderá reverter esta ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, apagar!",
      }).then((result) => {
        if (result.isConfirmed) {
          const params = { id: id, exam: exam };
          DataService.deletexam(params).then((result) => {
            const resp = result.data;
            if (resp.code == 201) {
              this.retrieveExams();
              Swal.fire(
                "Apagado!",
                `Você apagou o exame de \n${nome}`,
                "success"
              );
            } else {
              Swal.fire(
                "Ooops!",
                `Houve um erro apagando o exame de \n${nome}. Tente novamente.`,
                "error"
              );
            }
          });
        }
      });
    },
  },
  mounted() {
    this.retrieveExams();
  },
  setup() {
    //const sentExams = reactive({ listItems: getExams(1, 1) as string[] });
    //return { sentExams };
    const emitter = inject("emitter");
    return { emitter };
  },
};
</script>
<style lang="css" scoped>
.myCard {
  width: 100%;
  max-width: 100%;
  height: 26vh;
  border-radius: 20px;
  border: 1px solid #b2dfdb;
  background-color: white;
  position: relative;
}
</style>
