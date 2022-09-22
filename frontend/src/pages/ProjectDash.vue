<template>
  <q-page padding>
    <div
      id="container"
      class="fit row wrap justify-start items-start content-start"
    >
      <div class="col q-pa-md">
        <div id="line1" class="row wrap">
          <div class="col-12">
            <div class="row">
              <project-score :projectid="projectid" />
            </div>
          </div>
          <div class="col q-ml-md q-my-auto">
            <div class="row">
              <div
                class="btn-grad addCards text-center q-ma-xs"
                @click="showNewUser()"
              >
                <q-avatar
                  size="50px"
                  font-size="52px"
                  color="white"
                  text-color="white"
                  class="q-mt-sm"
                >
                  <img src="~assets/users.png" />
                </q-avatar>
                <div class="addCardTitle text-dart q-my-sm">
                  Adicionar<br />Usuário
                </div>
              </div>
              <div class="btn-grad addCards text-center q-ma-xs">
                <q-avatar
                  size="50px"
                  font-size="52px"
                  color="white"
                  text-color="white"
                  class="q-mt-sm"
                >
                  <img src="~assets/cover2.webp" />
                </q-avatar>
                <div class="addCardTitle text-dark q-my-sm">
                  Adicionar<br />Capa
                </div>
              </div>
              <div class="btn-grad addCards text-center q-ma-xs">
                <q-avatar
                  size="50px"
                  font-size="52px"
                  color="white"
                  text-color="white"
                  class="q-mt-sm"
                >
                  <img src="~assets/messages.jpeg" />
                </q-avatar>
                <div class="addCardTitle text-dark q-my-sm">Preferências</div>
              </div>
            </div>
          </div>
        </div>
        <div id="team" class="col teamCard q-mt-md">
          <div class="text-dark q-mb-sm" dense>
            <div class="text-h6 text-center">Expediente Ativo</div>
          </div>
          <online-users-list :users="onlineUsers" :height="30" />
        </div>
      </div>
      <div class="col-4 q-pa-md">
        <div id="team" class="col teamCard">
          <div class="text-dark q-mb-sm" dense>
            <div class="text-h6 text-center">Time Técnico</div>
          </div>
          <lista-usuarios boxsize="64" />
        </div>
      </div>
    </div>
  </q-page>
  <q-dialog
    v-model="dlgNewUser"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <div class="q-pa-md dlgUpload">
      <q-form greedy autofocus>
        <q-stepper
          v-model="step"
          ref="stepper"
          alternative-labels
          color="primary"
          animated
        >
          <q-step
            :name="1"
            title="Credenciamento"
            caption="Segurança e Acesso"
            icon="settings"
            :done="step > 1"
            class="stepH"
          >
            <div class="row full-width text-center justify-center q-mb-lg">
              <div class="q-gutter-sm text-dark">
                <q-radio
                  size="lg"
                  v-model="newUser.userType"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="2"
                  label="Enfermagem"
                />
                <q-radio
                  size="lg"
                  v-model="newUser.userType"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="3"
                  label="Médico"
                />
              </div>
            </div>
            <div class="row full-width">
              <div class="col"></div>
              <div class="col-7 justify-center">
                <q-input
                  dense
                  v-model="newUser.email"
                  label="Email*"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.includes('@') && val.includes('.')) ||
                      'Por favor digite um email válido',
                  ]"
                />

                <q-input
                  dense
                  v-model="newUser.phone"
                  label="Fone*"
                  lazy-rules
                  mask="(##) #####-####"
                  :rules="[
                    (val) =>
                      (val && val.length > 2) || 'Por favor digite o telefone',
                  ]"
                />
              </div>
              <div class="col"></div>
            </div>
          </q-step>

          <q-step
            :name="2"
            title="Detalhes"
            caption="Dados operacionais"
            icon="create_new_folder"
            :done="step > 2"
            class="stepH"
          >
            <div class="row full-width text-center justify-center q-gutter-md">
              <div class="col">
                <q-input
                  dense
                  v-model="newUser.name"
                  label="Nome*"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 2) || 'Por favor o nome',
                  ]"
                />
              </div>
              <div class="col">
                <q-input
                  dense
                  v-model="newUser.surname"
                  label="Sobrenome*"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.length > 2) || 'Por favor digite o sobrenome',
                  ]"
                />
              </div>
            </div>
            <div class="row full-width q-gutter-md">
              <div class="col-5">
                <q-input
                  dense
                  v-model="newUser.doc_id"
                  label="Documento"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.length > 2) || 'Por favor digite o telefone',
                  ]"
                />
              </div>
              <div class="col-grow text-center">
                <q-option-group
                  v-model="newUser.doc_type"
                  :options="docOptions"
                  primary
                  inline
                />
              </div>
            </div>
            <div class="row full-width">
              <div class="text-subtitle1 text-weight-light text-dark q-ml-lg">
                Exames atribuídos
              </div>
            </div>
            <div class="row full-width justify-center">
              <div class="q-pa-md q-gutter-sm text-center">
                <q-toggle
                  color="primary"
                  label="ECG"
                  v-model="scope"
                  val="ECG"
                />
                <q-toggle
                  disable
                  :color="disable ? secondary : primary"
                  label="EEG"
                  v-model="newUser.scope"
                  val="EEG"
                />
                <q-toggle
                  disable
                  color="disable == true ? 'grey' : 'green'"
                  label="ESP"
                  v-model="newUser.scope"
                  val="ESP"
                />
                <q-toggle
                  disable
                  color="green"
                  label="DMD"
                  v-model="newUser.scope"
                  val="DMD"
                />
              </div>
            </div>
          </q-step>

          <q-step
            :name="3"
            title="Confirmação"
            icon="add_comment"
            class="stepH"
          >
            <div v-if="errorMessage" class="row absolute-center">
              <div class="col text-center">
                <div class="text-h6 text-capitalize">Houve um erro</div>
                <q-icon name="error_outline" size="40px" color="red" />
                <div style="width: 180px">
                  {{ errorMessage }}
                </div>
              </div>
            </div>
            <div v-if="res" class="row absolute-center">
              <div class="col text-center">
                <div class="text-h6 text-capitalize">Sucesso!</div>
                <q-icon name="verified_user" size="60px" color="teal" />
                <div class="text-left" style="width: 300px">
                  <div class="row full-width justify-center">
                    Usuário Criado
                  </div>
                  <div class="row full-width justify-center">
                    {{ res.data?.insert_nxm_users.returning[0]?.name }}
                    {{ res.data?.insert_nxm_users.returning[0]?.surname }}
                  </div>
                  <div class="row full-width justify-center">
                    {{ res.data?.insert_nxm_users.returning[0].email }}
                  </div>
                  <div
                    class="row full-width justify-center text-center text-caption"
                  >
                    *Este usuário deverá acessar o sistema usando este email, na
                    a opção 'Primeiro Acesso'.
                  </div>
                </div>
              </div>
            </div>
          </q-step>

          <template v-slot:navigation>
            <q-stepper-navigation>
              <q-btn
                outline
                rounded
                @click="
                  () => {
                    navigate(step, 'ff');
                    if (step == 3) {
                      this.finish(false);
                    } else {
                      $refs.stepper.next();
                    }
                  }
                "
                color="primary"
                :label="step === 3 ? 'Fechar' : 'Continuar'"
              />
              <q-btn
                v-if="step > 1 && errorMessage.value != ''"
                flat
                color="primary"
                @click="
                  () => {
                    navigate(step, 'rw');
                    if (step == 3) {
                      this.finish(true);
                    } else {
                      $refs.stepper.previous();
                    }
                  }
                "
                :label="step === 3 ? 'Novo' : 'Voltar'"
                class="q-ml-sm"
              />
              <div class="float-right q-mt-sm">
                <q-btn
                  size="sm"
                  color="primary"
                  label="cancelar"
                  flat
                  @click="finish(false)"
                />
              </div>
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-form>
    </div>
  </q-dialog>
</template>

<script>
import { inject, onMounted, ref, computed } from "vue";
import { getAuth } from "firebase/auth";
import { useCoreStore } from "src/stores/core";
import { Notify } from "quasar";
import gql from "graphql-tag";
import ListaUsuarios from "src/components/ListaUsuarios.vue";
import OnlineUsersList from "src/components/OnlineUsersList.vue";
import ProjectScore from "src/components/ProjectScore.vue";
export default {
  name: "ProjectPage",
  components: { ListaUsuarios, OnlineUsersList, ProjectScore },
  data() {
    return {};
  },
  setup() {
    const coreStore = useCoreStore();
    const emitter = inject("emitter");
    const res = ref("");
    const errorMessage = ref("");
    const step = ref(1);
    const auth = getAuth();
    const frmNewUser = ref({
      access_level: "1",
      active: true,
      doc_id: "",
      doc_type: "",
      doc_uf: "SP",
      email: "",
      name: "",
      phone: "",
      projects: [],
      scope: ["ECG"],
      surname: "",
      userType: 1,
    });
    const newUser = ref({ ...frmNewUser.value });
    const dlgNewUser = ref(false);
    const userType = ref(2);
    const searchQuery = ref("");
    const scope = ref(["ECG"]);
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
    const onlineUsers = computed(() =>
      coreStore.$state.onlineUsers.filter((e) => e.type < 4)
    );
    const projectid = computed(
      () => JSON.parse(sessionStorage.getItem("loggedUser"))["projects"][0]
    );
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
    return {
      emitter,
      searchQuery,
      dlgNewUser,
      showNewUser,
      docOptions,
      doc_type,
      scope,
      userType,
      newUser,
      frmNewUser,
      step,
      navigate,
      res,
      errorMessage,
      onlineUsers,
      finish,
      projectid,
      coreStore,
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
                $scope: jsonb!
                $surname: String!
                $type: Int!
              ) {
                insert_nxm_users(
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
              scope: newUser.value.scope,
              surname: newUser.value.surname,
              type: newUser.value.userType,
            },
          })
          .then((result) => {
            this.errorMessage = "";
            this.res = result;
          })
          .catch((error) => {
            this.errorMessage = error;
            console.log(error);
          });
      } catch (error) {
        this.errorMessage = error;
      }
    },
  },
  created() {
    this.emitter.on("insertDBUser", (newUser) => this.insertDBUser(newUser));
  },
};
</script>
<style scoped>
.btn-grad {
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
  border-radius: 10px;
  border: 1px solid #eee;
  background-color: white;
  cursor: pointer;
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
