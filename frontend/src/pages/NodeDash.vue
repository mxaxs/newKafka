<template>
  <q-page padding>
    <div
      id="container"
      class="fit row wrap justify-start items-start content-start"
    >
      <div class="col-4 q-pa-md q-px-0 q-gutter-sm teamCard">
        <div class="col">
          <div class="row">THIS IS HELLO: {{ hello }}</div>
          <q-btn label="Click Me" @click="sendKfKMsg()" />
        </div>

        <project-list />
      </div>
      <div class="col q-pa-md q-px-0 q-gutter-sm">
        <senders-list />
        <appraisers-list />
      </div>
      <div class="col q-pa-md q-px-0 q-gutter-sm teamCard" style="height: 85vh">
        <team-list />
        <div>
          <q-bt @click="refresh(1)">Users</q-bt>
          <q-bt @click="refresh(2)">All</q-bt>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { inject, onMounted, ref, computed } from "vue";
import { getAuth } from "firebase/auth";
import { useCoreStore } from "src/stores/core";
import { Notify } from "quasar";
import moment from "moment";
import gql from "graphql-tag";
import ProjectList from "src/components/ProjectList.vue";
import SendersList from "../components/SendersList.vue";
import AppraisersList from "src/components/AppraisersList.vue";
import TeamList from "../components/TeamList.vue";
import { useQuasar } from "quasar";
import DlgProject from "../components/DlgProject.vue";
import DlgUser from "../components/DlgUser.vue";
import axios from "axios";

export default {
  name: "NodePage",
  components: { ProjectList, SendersList, AppraisersList, TeamList },
  data() {
    return {
      optExams: [
        { label: "ECG", value: "ECG" },
        { label: "EEG", value: "EEG" },
        { label: "ESP", value: "ESP" },
        { label: "DMD", value: "DMD" },
      ],
      scope: ["ECG"],
    };
  },

  apollo: {
    score: {
      query: gql`
        query score($project: Int!, $category: String!) {
          projectscore(args: { proj: $project, cat: $category }) {
            status
            total
          }
        }
      `,
      variables() {
        return {
          project: this.projectid,
          category: "ECG",
        };
      },
      update(data) {
        console.log("THE SCORE DATA >>>>", data.projectscore);
        const projectScore = data.projectscore;
        this.coreStore.$state.waiting =
          projectScore.filter((e) => e.status == 1)[0]?.total ?? 0;
        this.coreStore.$state.appraised =
          projectScore.filter((e) => e.status == 2)[0]?.total ?? 0;
        this.coreStore.$state.rejected =
          projectScore.filter((e) => e.status == 3)[0]?.total ?? 0;
        this.coreStore.$state.score = projectScore;
        return data;
      },
    },
    nodeProjects: {
      query: gql`
        query getProjects($nodeId: Int!) {
          projects: nxm_projects(where: { node: { _eq: $nodeId } }) {
            id
            cover
            logo
            project_contact_email
            project_contact_name
            project_contact_phone
            project_name
            scope: exams_enabled
          }
        }
      `,
      variables() {
        return {
          nodeId: this.nodeId,
        };
      },
      update(data) {
        this.coreStore.$state.nodeProjects = data.projects;

        const pl = data.projects[0];
        this.initProject(pl.id);

        return data;
      },
    },
    team: {
      query: gql`
        query users($nodeID: jsonb!) {
          users: nxm_users(
            order_by: { name: asc }
            where: {
              active: { _eq: true }
              type: { _lte: 1 }
              nodes: { _contains: $nodeID }
            }
          ) {
            access_level
            avatar
            doc_id
            doc_type
            email
            name
            surname
            scope
            phone
            type
            id
          }
        }
      `,
      variables() {
        return {
          nodeID: this.nodeId,
        };
      },
      update(data) {
        this.coreStore.$state.nodeUsers = data.users;
        return data;
      },
    },
    users: {
      query: gql`
        query users($projectID: jsonb!) {
          users: nxm_users(
            order_by: { name: asc }
            where: {
              projects: { _contains: $projectID }
              active: { _eq: true }
              type: { _lte: 2 }
            }
          ) {
            access_level
            avatar
            doc_id
            doc_type
            email
            name
            projects
            surname
            scope
            phone
            type
            id
          }
        }
      `,
      variables() {
        return {
          projectID: this.projectid,
        };
      },
      update(data) {
        this.coreStore.$state.projectUsers = data.users;
        return data;
      },
    },
    node: {
      query: gql`
        query node($id: Int!) {
          node: nxm_node(where: { id: { _eq: $id }, active: { _eq: true } }) {
            name
          }
        }
      `,
      variables() {
        return {
          id: this.nodeId,
        };
      },
      update(data) {
        this.coreStore.$state.projectName = data.node;
        return data;
      },
    },
    ellapsed: {
      query: gql`
        query ellapsed($id: Int!) {
          ellapsed: nxm_exams(
            where: { project: { _eq: $id }, status: { _eq: 1 } }
            order_by: { created: asc }
            limit: 1
          ) {
            created
          }
        }
      `,
      variables() {
        return { id: this.currentProjectId };
      },
      update(data) {
        if (data.ellapsed[0]?.created != null) {
          const ago = new moment(data.ellapsed[0]?.created ?? moment());
          const ellapsed = moment.duration(moment().diff(ago));
          console.log("THE FROM >>>>", ellapsed);
          const minutes =
            ellapsed.days() * 60 * 60 +
            ellapsed.hours() * 60 +
            ellapsed.minutes();
          console.warn("THE ELLAPSED >>>>>", ellapsed);
          this.coreStore.$state.ellapsed = minutes; //ellapsed;
        } else {
          this.coreStore.$state.ellapsed = "sem fila";
        }

        return data;
      },
      pollInterval: 60000,
    },
  },

  setup() {
    const hello = ref("");
    const coreStore = useCoreStore();
    const emitter = inject("emitter");

    const currentProjectId = computed(() => coreStore.$state.currentProject.id);
    const userType = ref(2);
    const searchQuery = ref("");
    const tab = ref("");
    const active = ref(false);
    const showNewUser = () => (dlgNewUser.value = !dlgNewUser.value);
    const finish = (mantain) => {
      if (!mantain) {
        dlgNewUser.value = false;
      }
      step.value = 1;
      res.value = "";
      Object.assign(newUser.value, frmNewUser.value);
      emitter.emit("userAdded");
    };


    const nodeName = coreStore.$state.projectName.name;
    const onlineUsers = computed(() =>
      coreStore.$state.onlineUsers.filter((e) => e.type < 4)
    );
    const projectid = computed(
      () => JSON.parse(sessionStorage.getItem("loggedUser"))["projects"][0]
    );
    const nodeId = computed(
      () => JSON.parse(sessionStorage.getItem("loggedUser"))["nodes"][0]
    );
    const nodeProjects = computed(() => coreStore.$state.nodeProjects);
    const navigate = async (step, direction) => {
      if (step == 2) {
        newUser.value.scope = scope;
        newUser.value.projects = JSON.parse(
          sessionStorage.getItem("loggedUser")
        )["projects"];
        if (direction == "ff") emitter.emit("insertDBUser", newUser);
      }
    };
    const docOptions = ref([
      { label: "COREN", value: "COREN" },
      { label: "CRM", value: "CRM" },
    ]);
    const doc_type = ref("");
    const initProject = (id) => {
      const curProject = coreStore.$state.nodeProjects[0];
      coreStore.$state.currentProject = curProject;
      coreStore.$state.scope = curProject.scope;
      console.log(curProject);
    };
    onMounted(() => {
      moment.locale("pt-br");
      const api = axios.create({
        baseURL: "http://localhost",
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Headers": "*",
        },
      });
      api.get("/api/user/hello").then((res) => {
        hello.value = res.data;
      });
    });
    const $q = useQuasar();

    const showDlgUser = () => {
      $q.dialog({
        component: DlgUser,
      })
        .onOk(() => {
          console.log("OK");
        })
        .onCancel(() => {
          console.log("Cancel");
        })
        .onDismiss(() => {
          console.log("Called on OK or Cancel");
        });
    };
    const showDlgProject = () => {
      $q.dialog({
        component: DlgProject,
      })
        .onOk(() => {
          console.log("OK");
        })
        .onCancel(() => {
          console.log("Cancel");
        })
        .onDismiss(() => {
          console.log("Called on OK or Cancel");
        });
    };

    return {
      emitter,
      searchQuery,
      showNewUser,
      docOptions,
      doc_type,
      userType,
      active,
      onlineUsers,
      finish,
      projectid,
      coreStore,
      tab,
      nodeName,
      nodeProjects,
      nodeId,
      initProject,
      currentProjectId,
      showDlgProject,
      showDlgUser,
      hello,
    };
  },
  methods: {
    insertDBUser(newUser) {
      try {
        this.$apollo
          .mutate({
            mutation: gql`
              mutation insertuser(
                $access_level: String!
                $active: Boolean!
                $doc_id: String!
                $doc_type: String!
                $doc_uf: String!
                $email: String!
                $name: String!
                $phone: String!
                $projects: jsonb!
                $nodes: jsonb!
                $scope: jsonb!
                $surname: String!
                $type: Int!
              ) {
                newuser: insert_nxm_users(
                  objects: {
                    access_level: $access_level
                    active: $active
                    doc_id: $doc_id
                    doc_type: $doc_type
                    doc_uf: $doc_uf
                    email: $email
                    name: $name
                    phone: $phone
                    projects: $projects
                    nodes: $nodes
                    scope: $scope
                    surname: $surname
                    type: $type
                  }
                ) {
                  returning {
                    id
                    email
                    name
                    surname
                  }
                }
              }
            `,
            variables: {
              access_level: "1",
              active: true,
              doc_id: newUser.value.doc_id,
              doc_type: newUser.value.doc_type,
              doc_uf: "SP",
              email: newUser.value.email,
              name: newUser.value.name,
              phone: newUser.value.phone,
              projects: newUser.value.projects,
              nodes: newUser.value.nodes,
              scope: newUser.value.scope,
              surname: newUser.value.surname,
              type: newUser.value.userType,
            },
          })
          .then((result) => {
            this.errorMessage = "";
            console.warn("THE RESPONSE IN USER >>>>>", result.data);
            this.coreStore.$state.recentUser = result.data.newuser.returning[0];
            this.$apollo.queries.team.refetch();
          })
          .catch((error) => {
            this.errorMessage = error;
            console.log(error);
          });
      } catch (error) {
        this.errorMessage = error;
      }
    },
    insertDBProject(newProject) {
      console.warn("THE NEW PROJECT >>>>", newProject.value);
      try {
        this.$apollo
          .mutate({
            mutation: gql`
              mutation insertProject(
                $company_id: Int!
                $cover: String!
                $exams_contacts: jsonb!
                $exams_enabled: jsonb!
                $logo: String!
                $node: Int!
                $project_contact_email: String!
                $project_contact_name: String!
                $project_contact_phone: String!
                $project_name: String!
              ) {
                newproject: insert_nxm_projects_one(
                  object: {
                    company_id: $company_id
                    cover: $cover
                    created: "now()"
                    active: true
                    exams_contacts: $exams_contacts
                    exams_enabled: $exams_enabled
                    logo: $logo
                    node: $node
                    project_contact_email: $project_contact_email
                    project_contact_name: $project_contact_name
                    project_contact_phone: $project_contact_phone
                    project_name: $project_name
                  }
                ) {
                  company_id
                  id
                  project_name
                  project_contact_email
                }
              }
            `,
            variables: {
              company_id: 0,
              cover: newProject.value.cover,
              exams_contacts: newProject.value.exams_contacts ?? [],
              exams_enabled: newProject.value.scope ?? [],
              logo: newProject.value.logo ?? "",
              node: newProject.value.node,
              project_contact_email: newProject.value.project_contact_email,
              project_contact_name: newProject.value.project_contact_name,
              project_contact_phone: newProject.value.project_contact_phone,
              project_name: newProject.value.project_name,
            },
          })
          .then((result) => {
            this.coreStore.$state.newProject = result.data.newproject;
            this.$apollo.queries.nodeProjects.refetch();
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.error(error);
      }
    },
    removeFromProject(userID, userProjects) {
      const filteredProjects = userProjects.filter(
        (e) => e != this.currentProjectId
      );
      try {
        this.$apollo
          .mutate({
            mutation: gql`
              mutation removeFromProject($id: String!, $projects: jsonb!) {
                update_nxm_users(
                  where: { doc_id: { _eq: $id } }
                  _set: { projects: $projects }
                ) {
                  affected_rows
                  returning {
                    doc_id
                    name
                    projects
                  }
                }
              }
            `,
            variables: {
              id: userID,
              projects: filteredProjects,
            },
          })
          .then(
            this.$apollo.queries.users.refetch({
              projectID: this.coreStore.$state.currentProject.id,
            })
          )
          .catch((error) => console.log(error));
      } catch (error) {
        console.log(error);
      }
    },
    addToProject(userID) {
      const currentProjectId = this.coreStore.$state.currentProject.id;
      try {
        this.$apollo
          .mutate({
            mutation: gql`
              mutation addToProject($id: String!, $projectID: jsonb!) {
                update_nxm_users(
                  where: { doc_id: { _eq: $id } }
                  _append: { projects: $projectID }
                ) {
                  affected_rows
                }
              }
            `,
            variables: {
              id: userID,
              projectID: currentProjectId,
            },
          })
          .then(
            this.$apollo.queries.users.refetch({
              projectID: currentProjectId,
            })
          )
          .catch((error) => console.log(error));
      } catch (error) {
        console.log(error);
      }
    },
    async sendKfKMsg() {
      try {
        axios( {
          "method": "POST",
          "url": "http://localhost/api/channel/user",
          "headers": {
            "Content-Type": "application/json; charset=utf-8"
          },
          "data": {
            "channel": "user.created",
            "message": {
              "user": {
                "name": "Teste",
                "email": " ",
              },
              "exams": [
                {
                  "id": "1",
                  "name": "Teste",
                  "date": "2021-05-01",
                  "time": "10:00",
                  "address": "Rua teste",
                  "city": "São Paulo",
                  "state": "SP",
                  "zip": "00000-000",
                  "country": "Brasil",
                  "status": "Aguardando",
                },
              ],
            }
          }
        } );
      } catch (error) {
        console.log(error);
      }
    },
  },
  created() {
    this.emitter.on("insertDBProject", (newProject) =>
      this.insertDBProject(newProject)
    );
    this.emitter.on("addToProject", (userID) => this.addToProject(userID));
    this.emitter.on("removeFromProject", (params) =>
      this.removeFromProject(params.userID, params.userProjects)
    );
    this.emitter.on("insertDBUser", (newUser) => this.insertDBUser(newUser));
    this.emitter.on("refetch", (id) => {
      this.projectid = id;
      this.$apollo.queries.score.refetch({ project: id, category: "ECG" });
      this.$apollo.queries.users.refetch({ projectID: id });
      this.$apollo.queries.ellapsed.refetch({ id: id });
    });
    this.emitter.on("rescore", (e) => {
      console.warn("THE RESCORE PARAMS >>>", e);
      this.$apollo.queries.score.refetch({
        project: e.id,
        category: e.category,
      });
    });
    this.emitter.on("newProject", () => this.showDlgProject());
    this.emitter.on("newUser", () => this.showDlgUser());
  },
};
</script>
<style scoped>
.container {
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 1;
  background: inherit;
  overflow: hidden;
}

.container:before {
  content: "";
  position: absolute;
  background: inherit;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: inset 0 0 2000px rgba(255, 255, 255, 0.8);
  filter: blur(10px);
}

.scoreCounter {
  font-size: 2.5rem;
}
.gradBG {
  background-color: #0093e9;
  background-image: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
}

.cardS .btn-grad {
  background-image: linear-gradient(
    to right,
    #ece9e6 0%,
    #ffffff 51%,
    #ece9e6 100%
  );
  transition: 0.5s;
  background-size: 200% auto;
  border-radius: 10px;
  border: 1px solid rgb(203, 199, 199);
}
.btn-grad:hover {
  background-position: right center; /* change the direction of the change here */
  color: rgb(85, 82, 82);
  text-decoration: none;
}
.btn-grad:hover {
  background-position: right center; /* change the direction of the change here */
  color: rgb(85, 82, 82);
  text-decoration: none;
}
.btn-grad:hover {
  background-position: right center; /* change the direction of the change here */
  color: rgb(85, 82, 82);
  text-decoration: none;
}
.addCards {
  border-radius: 10px;
  height: 120px;
  width: 100px;
  box-shadow: 0px 0px 5px #eee;
  cursor: pointer;
}
.addCardTitle {
  font-size: 14px;
  line-height: 0.9;
}
.scoreCard {
  border-radius: 10px;
  background-color: white;
  cursor: pointer;
  max-width: 750px;
}
.scoreItem {
  font-size: 10px;
}
.teamCard {
  border-radius: 5px;
  border: 1px solid #eee;
  cursor: pointer;
}

.cardTitle {
  border-bottom: solid 1px rgb(13, 116, 128);
}
.dlgUpload {
  min-width: 480px;
  border-radius: 20px;
  border: 2px solid #ffffff;
}
.myCard {
  width: 55%;
  max-width: 80%;
  height: 30vh;
  border-radius: 20px;
  border: 2px solid #ffffff;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
}
.stepH {
  min-height: 268px;
}
.myType {
  border: 1px solid primary;
}
</style>
