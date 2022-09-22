<template>
  <div class="myCard q-py-md">
    <div class="text-h6 text-weight-light text-dark">
      Exames Laudados <span v-if="showPrinted">e Impressos</span
      ><q-badge color="primary" align="top">{{ outputExams.length }}</q-badge>
    </div>
    <div
      class="row full-width"
      style="border-bottom: 1px dashed #b4ede5"
      v-if="$q.platform.is.desktop"
    >
      <div class="col-2 text-right q-pr-md">
        <q-btn
          v-if="!showPrinted"
          :color="allHeartsSelected ? 'dark' : 'secondary'"
          flat
          icon="favorite"
          title="Selecionar todos"
          @click="selectAllHearts()"
        />
      </div>
      <div class="col inline justify-end">
        <div class="row justify-end q-mr-lg">
          <q-btn
            v-if="toPrint.length > 0"
            color="dark"
            flat
            icon="local_printshop"
            title="Imprimir exames selecionados"
            @click="bulkPrint()"
          />
          <q-expansion-item
            class="text-primary"
            header-class="text-dark"
            dense
            dense-toggle
            expand-separator
            icon="search"
            @click="focusInput()"
          >
            <q-input
              v-model="searchQuery"
              ref="searchInput"
              autofocus
              :input-style="{ width: '300px' }"
              outlined
              dense
              type="search"
              placeholder="Digite para localizar"
              color="primary"
              label-color="text-dark"
            />
          </q-expansion-item>
          <q-toggle
            title="Examos impressos"
            size="xs"
            color="primary"
            icon="print"
            v-model="showPrinted"
          />
        </div>
      </div>
    </div>
    <q-scroll-area style="height: 65vh">
      <div
        class="text-left q-mx-lg"
        color="primary"
        v-for="(item, index) in filteredList"
        :key="index"
        dense
      >
        <q-list class="rounded-borders text-dark" style="max-width: 600px">
          <q-item>
            <q-item-section top class="col-1" v-show="$q.platform.is.desktop">
              <q-item-label>
                <q-icon
                  name="volunteer_activism"
                  :color="item.priority == 1 ? 'red' : 'teal-1'"
                  size="24px"
                  :title="item.priority == 1 ? 'EXAME URGENTE' : ''"
                  style="cursor: pointer"
                  @click="toggleHeart(index, item.exam, item.id)"
                />
              </q-item-label>
              <q-item-label class="q-mt-sm">
                <q-icon
                  :name="
                    toPrint.includes(item.exam.split(/[\\\/]/).pop())
                      ? 'local_printshop'
                      : 'favorite_border'
                  "
                  :color="getHeartColor(item.condition)"
                  size="24px"
                  style="cursor: pointer"
                  @click="toggleHeart(index, item.exam, item._id)"
                />
              </q-item-label>
            </q-item-section>
            <q-item-section
              top
              @click="gotoExam(item.exam)"
              style="cursor: pointer"
            >
              <q-item-label lines="1">
                <span class="text-weight-medium">{{ item.nome }}</span>
              </q-item-label>
              <q-item-label lines="2" caption class="text-dark">
                {{ item.category }}<br />
                Laudado em {{ hour(item.appraised).day }} às
                {{ hour(item.appraised).hour }}
              </q-item-label>
              <q-item-label
                lines="1"
                class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase"
              >
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
                  @click="gotoExam(item.exam)"
                />
                <q-btn
                  v-if="$q.platform.is.desktop"
                  class="gt-xs text-dark"
                  size="12px"
                  flat
                  dense
                  round
                  icon="email"
                />
                <q-btn
                  v-if="$q.platform.is.desktop"
                  size="12px"
                  flat
                  dense
                  round
                  icon="local_printshop"
                  class="text-dark"
                  @click="printExam(item.exam, item.nome)"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-separator spaced="10px" />
        </q-list>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { openURL } from "quasar";
import printJS from "print-js";
import { inject, onMounted, reactive, watchEffect } from "vue";
import gql from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";
import DataService from "src/common/services/DataService";
import moment from "moment";
import Swal from "sweetalert2";
import { useCoreStore } from "src/stores/core";
export default {
  name: "ExamesEnviados",
  data() {
    return {
      allHeartsSelected: false,
      searchQuery: "",
      iconHeart: -1,
      toPrint: [],
      idPrinted: [],
      sentExams: [],
      printedExams: [],
      notPrintedExams: [],
      showPrinted: false,
    };
  },
  created() {
    //this.emitter.on("reloadUI", () => this.retrieveExams());
    this.emitter.on("changeExamType", () => {
      const categorie = sessionStorage.getItem("sendExamType");
      this.refetch({ categories: categorie });
    });
  },
  methods: {
    mailto() {},
    selectAllHearts() {
      this.allHeartsSelected = !this.allHeartsSelected;
      this.filteredList.forEach((item) => {
        this.toggleHeart(item.index, item.exam, item.id);
      });
    },
    getHeartColor(status) {
      let code_colors = {
        normal: "primary",
        alterado: "orange",
        critico: "red",
        default: "primary",
      };
      return code_colors[status] || code_colors["default"];
    },
    toggleHeart(index, exam, id) {
      const examFile = exam.split(/[\\\/]/).pop();

      if (this.toPrint.includes(examFile)) {
        const i = this.toPrint.indexOf(examFile);
        const f = this.idPrinted.indexOf(id);
        this.toPrint.splice(i, 1);
        this.idPrinted.splice(f, 1);
      } else {
        this.toPrint.push(examFile);
        this.idPrinted.push(id);
      }
    },
    gotoExam(url) {
      openURL(url, "_blank", {
        noopener: true,
        menubar: true,
        toolbar: false,
        noreferrer: true,
      });
    },
    printExam(url, patientName) {
      printJS({
        printable: url,
        type: "pdf",
        showModal: true,
        modalMessage: "Processando arquivo...",
        documentTitle: patientName,
      });
    },
    bulkPrint() {
      if (this.toPrint.length == 0) return;
      const jUser = sessionStorage.getItem("loggedUser");
      const user = JSON.parse(jUser);
      const params = { id: user._id, paths: this.toPrint, ids: this.idPrinted };
      this.$apollo
        .mutate({
          mutation: gql`
            mutation printed($ids: [Int!]) {
              update_nxm_exams(
                where: { id: { _in: $ids } }
                _set: { printed: true }
              ) {
                affected_rows
              }
            }
          `,
          variables: {
            ids: this.idPrinted,
          },
        })
        .then((result) => {
          DataService.bulkPrint(params)
            .then((result) => {
              const url = result.data["url"];
              printJS({
                printable: url,
                type: "pdf",
                showModal: true,
                modalMessage: "Processando arquivo...",
                documentTitle: "Arquivo de lote",
              });
            })
            .catch((error) => {
              console.error("ERRO GERANDO BULK", error);
            });
        })
        .catch((error) => {
          console.error("BULK-PRINT ERROR >>>>", error);
        });
    },
    focusInput() {
      this.$nextTick(() => this.$refs["searchInput"].focus());
    },
    hour: function (date) {
      moment().locale("pt-br");
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
  setup() {
    const coreStore = useCoreStore();
    const pi = reactive({ pollInterval: 60000 });
    const variables = reactive({
      status: 2,
      categories: [],
      projects: [],
    });

    const emitter = inject("emitter");
    const { result, refetch, error } = useQuery(
      gql`
        query exams($projects: [Int!], $status: Int!, $categories: [String!]) {
          appraised: nxm_exams(
            where: {
              project: { _in: $projects }
              status: { _eq: $status }
              category: { _in: $categories }
            }
            order_by: { created: asc }
          ) {
            category
            condition
            created
            exam
            exam_motive
            id
            medic_name
            nome
            priority
            printed
            status
            appraised
          }
        }
      `,
      variables,
      pi
    );

    let self = this;
    watchEffect(() => {
      if (result.value) {
        const resp = result.value;
        coreStore.$state.appraisedExams = resp.appraised;
      }
    });
    onMounted(() => {
      variables.status = 2;
      variables.projects =
        JSON.parse(sessionStorage.getItem("loggedUser"))?.projects ?? [];
      const type = sessionStorage.getItem("sendExamType");
      variables.categories = [type];
    });
    return { emitter, coreStore, refetch, error, result, variables };
  },
  computed: {
    filteredList: function () {
      var self = this;
      return this.outputExams.filter(function (item) {
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
    outputExams() {
      const allAppraised = this.coreStore.$state.appraisedExams;
      const filteredXM = allAppraised.filter(
        (e) => e.printed == this.showPrinted
      );
      return filteredXM;
    },
  },
};
</script>
<style lang="css" scoped>
.myCard {
  width: 100%;
  max-width: 100%;
  height: 75vh;
  border-radius: 20px;
  border: 1px solid #b2dfdb;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  position: relative;
  display: block;
  overflow: hidden;
}
.tlSeparator {
  border-left: solid 3px rgb(212, 212, 212);
  height: 30px;
}
.tlContainer {
  display: inline-block;
}
.dot {
  height: 15px;
  width: 16px;
  background-color: #ffffff;
  border-radius: 50%;
  border: #b2dfdb 2px solid;
  display: inline-block;
  left: -9px;
  vertical-align: middle;
  position: relative;
}
.criado {
  font-size: 11px;
  margin-right: 10px;
  padding: 1px;
}
.aicon {
  text-decoration: none;
  cursor: pointer;
}
</style>
