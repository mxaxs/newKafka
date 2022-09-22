<template>
  <div class="myCard q-py-md">
    <div class="text-h6 text-weight-light q-mb-md text-dark">
      Exames para Repetir
      <q-badge color="primary" align="top">{{ repeat.length }}</q-badge>
    </div>
    <q-scroll-area style="height: 65vh">
      <div
        class="text-left q-mx-lg"
        color="primary"
        v-for="item in repeat"
        :key="item.created"
        dense
      >
        <q-list class="rounded-borders text-dark" style="max-width: 600px">
          <q-item>
            <q-item-section top class="col-2">
              <q-item-label class="q-mt-sm">
                <q-icon name="heart_broken" color="warning" size="34px" />
              </q-item-label>
            </q-item-section>

            <q-item-section top>
              <q-item-label lines="1">
                <span class="text-weight-light" style="font-size: 16px">{{
                  item.nome
                }}</span>
              </q-item-label>
              <q-item-label
                lines="3"
                caption
                class="text-dark text-weight-light"
              >
                * {{ item.rejected }}<br />
                Enviado em
                <span class="text-red-8"
                  >{{ hour(item.created).day }} às
                  {{ hour(item.created).hour }}
                </span>
              </q-item-label>
              <q-item-label
                lines="1"
                class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase"
                @click="openExam(item.exam)"
              >
                <span class="cursor-pointer text-weight-medium"
                  >Ver o exame original</span
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
                  icon="remove_circle_outline"
                  @click="deleteExam(item.id, item.nome, item.exam)"
                />
                <q-btn
                  class="gt-xs text-dark"
                  size="12px"
                  flat
                  dense
                  round
                  icon="done"
                  @click="arquive(item.id)"
                />
                <q-btn
                  size="12px"
                  class="text-dark"
                  flat
                  dense
                  round
                  icon="more_vert"
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
import { inject } from "vue";
import DataService from "src/common/services/DataService";
import moment from "moment";
import Swal from "sweetalert2";
import { openURL } from "quasar";
import gql from "graphql-tag";
export default {
  name: "ExamesEnviados",
  data() {
    return {
      sentExams: [],
      repeat: [],
    };
  },
  apollo: {
    repeat: {
      query: gql`
        query exams($projects: [Int!], $status: Int!, $categories: [String!]) {
          exams: nxm_exams(
            where: {
              project: { _in: $projects }
              status: { _eq: $status }
              category: { _in: $categories }
            }
            order_by: { created: asc }
          ) {
            birthdate
            category
            created
            crm_origin
            exam
            exam_motive
            hd
            id
            medic_name
            nome
            obs
            priority
            sex
            rejected
          }
        }
      `,
      pollInterval: 60000,
      variables() {
        return {
          status: 3,
          projects: this.examparams["projects"],
          categories: this.examparams["categories"],
        };
      },
      update: (data) => {
        sessionStorage.setItem("allExams", JSON.stringify(data.exams));
        console.warn("THE SENT EXAMS >>>>", data);
        return data.exams;
      },
    },
  },

  created() {
    this.emitter.on("reloadUI", () => this.$apollo.queries.repeat.refetch());
    this.emitter.on("changeExamType", () => {
      const categorie = sessionStorage.getItem("sendExamType");
      this.$apollo.queries.repeat.refetch({ categories: categorie });
    });
  },
  methods: {
    arquive: function (id) {
      this.emitter.emit("arquive", id);
    },
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

    getType() {
      const type = localStorage.getItem("sendExamType");
      const sendExamType = type == undefined ? "ECG" : type;
      return sendExamType;
    },

    deleteExam(id, nome, exam) {
      Swal.fire({
        title: `Apagar o exame de \n ${nome}?`,
        text: "Você está prestes a apagar este exame e não poderá reverter esta ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, apagar!",
        cancelButtonText: "Cancelar!",
      }).then((result) => {
        if (result.isConfirmed) {
          const params = { id: id, exam: exam };
          const examcode = exam
            .replace("https://api-rest.in/exams/", "")
            .replace(".pdf", "");
          DataService.deletepg({ exam: examcode })
            .then((result) => {
              console.log("DELETE FILE >>>", result);
              this.$apollo.queries.repeat.refetch();
            })
            .catch((error) => {
              console.error("DELETE FILE ERROR", error);
            });
          this.$apollo
            .mutate({
              mutation: gql`
                mutation delete($id: Int!) {
                  exam: delete_nxm_exams_by_pk(id: $id) {
                    id
                  }
                }
              `,
              variables: {
                id: id,
              },
            })
            .then((result) => {
              Swal.fire(
                "Apagado!",
                `Você apagou o exame de \n${nome}`,
                "success"
              );
              console.warn("THE DELETED EXAM >>>>", result);
              this.$apollo.queries.repeat.refetch();
            })
            .catch((error) => {
              console.error(error);
              Swal.fire(
                "Ooops!",
                `Houve um erro apagando o exame de \n${nome}. Tente novamente.`,
                "error"
              );
            });
        }
      });
    },

    openExam(url) {
      openURL(url);
    },
  },
  mounted() {
    //this.retrieveExams();
  },
  setup() {
    //const sentExams = reactive({ listItems: getExams(1, 1) as string[] });
    //return { sentExams };
    const emitter = inject("emitter");
    return { emitter };
  },
  computed: {
    examparams() {
      const json = JSON.parse(sessionStorage.getItem("loggedUser"));
      const arrProj = json.projects;
      const arrCategories = json.scope;
      const examparams = { projects: arrProj, categories: arrCategories };
      console.log("THE EXAM-PARAMS >>>>", examparams);
      return examparams;
    },
  },
};
</script>
<style lang="css" scoped>
.myCard {
  width: 90%;
  max-width: 90%;
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
.text-oclusive {
  color: #00a697;
}
</style>
