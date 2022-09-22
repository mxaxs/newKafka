<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
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
            <div class="col q-mx-lg justify-left">
              <q-input
                input-style="font-size:large;"
                v-model="newProject.project_name"
                label="Nome do Projeto*"
                filled
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 4) || 'Por favor digite algo',
                ]"
              />
              <q-input
                dense
                v-model="newProject.project_contact_name"
                label="Nome do contato*"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 4) || 'Por favor digite algo',
                ]"
              />
              <q-input
                dense
                v-model="newProject.project_contact_email"
                label="Email do Contato*"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.includes('@') && val.includes('.')) ||
                    'Por favor digite um email válido',
                ]"
              />
              <q-input
                dense
                v-model="newProject.project_contact_phone"
                label="Fone do Contato*"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 4) || 'Por favor digite algo',
                ]"
              />
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
              <div class="col q-mx-lg justify-left">
                <q-input
                  v-model="newProject.logo"
                  label="Logomarca*"
                  :disable="itmDisabled"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 4) || 'Por favor digite algo',
                  ]"
                />
                <q-input
                  v-model="newProject.cover"
                  label="Capa dos exames*"
                  :disable="itmDisabled"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 4) || 'Por favor digite algo',
                  ]"
                />
              </div>
            </div>
            <div class="row full-width">
              <div class="text-subtitle1 text-weight-light text-dark q-ml-lg">
                Exames Habilitados
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
                  :disable="itmDisabled"
                  :color="disable ? secondary : primary"
                  label="EEG"
                  v-model="newProject.scope"
                  val="EEG"
                />
                <q-toggle
                  :disable="itmDisabled"
                  color="disable == true ? 'grey' : 'green'"
                  label="ESP"
                  v-model="newProject.scope"
                  val="ESP"
                />
                <q-toggle
                  :disable="itmDisabled"
                  color="green"
                  label="DMD"
                  v-model="newProject.scope"
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
            <div v-if="recentProject.project_name" class="row absolute-center">
              <div class="col text-center">
                <div class="text-h6 text-capitalize">Sucesso!</div>
                <q-icon name="verified_user" size="60px" color="teal" />
                <div class="text-left" style="width: 300px">
                  <div class="row full-width justify-center">
                    Projeto Criado
                  </div>
                  <div class="row full-width justify-center">
                    {{ recentProject?.project_name }}
                  </div>
                  <div class="row full-width justify-center">
                    {{ recentProject?.project_contact_email }}
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
import { useDialogPluginComponent } from "quasar";
import { onMounted, ref, inject, computed } from "vue";
import { useCoreStore } from "src/stores/core";

export default {
  emits: [...useDialogPluginComponent.emits],

  setup() {
    const coreStore = useCoreStore();
    const emitter = inject("emitter");
    const step = ref(1);
    const itmDisabled = ref(true);
    const dlgNewProject = ref(false);
    const errorMessage = ref("");
    const frmNewProject = ref({
      project_name: "",
      project_contact_email: "",
      project_contact_phone: "",
      project_contact_name: "",
      exams_contacts: [],
      logo: "",
      cover: "",
      node: 0,
      scope: ["ECG"],
      userType: 4,
    });
    const newProject = ref({ ...frmNewProject.value });
    const userType = ref(4);
    const node = () =>
      JSON.parse(sessionStorage.getItem("loggedUser"))["nodes"][0];
    const scope = ref(["ECG"]);
    const navigate = async (step, direction) => {
      if (step == 2) {
        newProject.value.scope = scope;
        newProject.value.projects = JSON.parse(
          sessionStorage.getItem("loggedUser")
        )["projects"];
        if (direction == "ff") emitter.emit("insertDBProject", newProject);
      }
    };
    const finish = (mantain) => {
      if (!mantain) {
        onDialogCancel();
      } else {
        step.value = 1;
        Object.assign(newProject.value, frmNewProject.value);
        emitter.emit("projectAdded");
        onDialogOK();
      }
    };
    const recentProject = computed(() => coreStore.$state.newProject);
    // REQUIRED; must be called inside of setup()
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    onMounted(() => {
      newProject.value.node = node();
    });
    return {
      step,
      coreStore,
      dialogRef,
      newProject,
      recentProject,
      dlgNewProject,
      finish,
      userType,
      onDialogHide,
      navigate,
      itmDisabled,
      errorMessage,
      scope,

      onOKClick() {
        // on OK, it is REQUIRED to
        // call onDialogOK (with optional payload)
        onDialogOK();
        // or with payload: onDialogOK({ ... })
        // ...and it will also hide the dialog automatically
      },

      // we can passthrough onDialogCancel directly
      onCancelClick: onDialogCancel,
    };
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
