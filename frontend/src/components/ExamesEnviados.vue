<template>
  <div class="myCard q-py-md">
    <div
      class="text-subtitle1 text-weight-light q-mb-md text-dark"
      style="cursor: pointer"
      @click="reloadList()"
    >
      Exames aguardando Laudo
      <q-badge color="primary" align="top">{{ exams.length }}</q-badge>
    </div>
    <q-scroll-area style="height: 45vh">
      <div
        class="text-left q-mx-lg"
        color="primary"
        v-for="item in exams"
        :key="item.created"
        dense
      >
        <div class="tlContainer">
          <div class="tlLine row full-width">
            <q-icon
              name="remove_circle_outline"
              color="red"
              size="20px"
              class="q-mr-xs"
              style="cursor: pointer"
              @click="deleteExam(item.id, item.nome, item.exam)"
            />
            <q-icon
              name="visibility"
              color="primary"
              size="22px"
              class="q-mr-sm aicon"
              clickable
              tag="a"
              target="_blank"
              :href="item.exam"
              style="cursor: pointer"
            />
            <div class="criado text-dark q-py-xs" style="line-height: 98%">
              <span> {{ hour(item.created).day }}</span>
              <br />
              <span>{{ hour(item.created).hour }}</span>
            </div>
            <div class="tlSeparator">
              <span
                :class="item.priority == 1 ? 'dot-urgent' : 'dot-normal'"
                class="dot"
                :title="
                  item.priority == 1
                    ? 'Enviado com urgencia'
                    : 'Prioridade Normal'
                "
              ></span>
            </div>
            <div class="col nome text-caption text-weight-light text-dark">
              {{ item.nome.toUpperCase() }}
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { inject } from "vue";
import DataService from "src/common/services/DataService";
import moment from "moment";
import Swal from "sweetalert2";
import gql from "graphql-tag";
export default {
  name: "ExamesEnviados",
  data() {
    return {
      sentExams: [],
      exams: [],
    };
  },
  apollo: {
    exams: {
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
          }
        }
      `,
      pollInterval: 60000,
      variables() {
        return {
          status: 1,
          projects: this.examparams["projects"],
          categories: this.examparams["categories"],
        };
      },
      update: (data) => {
        sessionStorage.setItem("allExams", JSON.stringify(data.exams));
        return data.exams;
      },
    },
  },

  created() {
    this.emitter.on("reloadUI", () => {
      const categ = sessionStorage.getItem("sendExamType");
      this.$apollo.queries.exams.refetch({ categories: categ });
    });
    this.emitter.on("changeExamType", () => {
      const categ = sessionStorage.getItem("sendExamType");
      this.$apollo.queries.exams.refetch({ categories: categ });
    });
  },
  methods: {
    reloadList: function () {
      const categ = sessionStorage.getItem("sendExamType");
      this.$apollo.queries.exams.refetch({ categories: categ });
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
        title: `Apagar o exame de\n${nome}?`,
        text: "Você está prestes a apagar este exame e não poderá reverter esta ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, apagar!",
      }).then((result) => {
        if (result.isConfirmed) {
          const examcode = exam
            .replace("https://api-rest.in/exams/", "")
            .replace(".pdf", "");
          DataService.deletepg({ exam: examcode })
            .then((result) => {
              this.$apollo.queries.exams.refetch();
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
              this.$apollo.queries.exams.refetch();
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
  },
  computed: {
    examparams() {
      const json = JSON.parse(sessionStorage.getItem("loggedUser"));
      const arrProj = json.projects;
      const arrCategories = json.scope;
      const examparams = { projects: arrProj, categories: arrCategories };
      return examparams;
    },
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
  width: 80%;
  max-width: 80%;
  height: 52vh;
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
  height: 40px;
}
.tlContainer {
  display: inline-block;
}
.dot {
  height: 15px;
  width: 16px;
  border-radius: 50%;
  display: inline-block;
  left: -9px;
  vertical-align: middle;
  position: relative;
}

.dot-urgent {
  border: red 2px solid;
  background-color: white;
}
.dot-normal {
  border: #00c1c1 2px solid;
  background-color: #ffffff;
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
.nome {
  line-height: 98%;
}
</style>

