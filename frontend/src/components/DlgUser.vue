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
            <div class="row full-width text-center justify-center q-mb-xs">
              <div class="q-gutter-xs text-dark">
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
                  val="1"
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
                <q-input
                  :readonly="readOnlyInfo"
                  dense
                  unmasked-value
                  v-model="newUser.cpf"
                  label="CPF*"
                  lazy-rules
                  mask="###.###.###-##"
                  :rules="[(val) => testarCPF(val) || 'CPF inválido']"
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
            <div v-if="recentUser.name" class="row absolute-center">
              <div class="col text-center">
                <div class="text-h6 text-capitalize">Sucesso!</div>
                <q-icon name="verified_user" size="60px" color="teal" />
                <div class="text-left" style="width: 300px">
                  <div class="row full-width justify-center">
                    Usuário Criado
                  </div>
                  <div class="row full-width justify-center">
                    {{ recentUser?.name }} {{ recentUser?.surname }}
                  </div>
                  <div class="row full-width justify-center">
                    {{ recentUser?.email }}
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
    const frmNewUser = ref({
      access_level: 1,
      active: true,
      avatar: null,
      cpf: "",
      name: "",
      surname: "",
      email: "",
      phone: "",
      doc_type: "",
      doc_id: "",
      doc_uf: "",
      node: 0,
      scope: ["ECG"],
      type: 1,
      projects: [],
      nodes: [],
    });
    const newUser = ref({ ...frmNewUser.value });
    const userType = ref(1);
    const node = () =>
      JSON.parse(sessionStorage.getItem("loggedUser"))["nodes"][0];
    const scope = ref(["ECG"]);
    const navigate = async (step, direction) => {
      if (step == 2) {
        newUser.value.scope = scope;
        newUser.value.nodes = JSON.parse(sessionStorage.getItem("loggedUser"))[
          "nodes"
        ];
        if (direction == "ff") emitter.emit("insertDBUser", newUser);
      }
    };

    const testarCPF = (strCPF) => {
      var Soma;
      var Resto;
      Soma = 0;
      let i = 0;
      if (strCPF == "00000000000") return false;

      for (i = 1; i <= 9; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
      Resto = (Soma * 10) % 11;

      if (Resto == 10 || Resto == 11) Resto = 0;
      if (Resto != parseInt(strCPF.substring(9, 10))) return false;

      Soma = 0;
      for (i = 1; i <= 10; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
      Resto = (Soma * 10) % 11;

      if (Resto == 10 || Resto == 11) Resto = 0;
      if (Resto != parseInt(strCPF.substring(10, 11))) return false;
      return true;
    };

    const finish = (mantain) => {
      if (!mantain) {
        onDialogCancel();
      } else {
        step.value = 1;
        Object.assign(newUser.value, frmNewUser.value);
        emitter.emit("userAdded");
        onDialogOK();
      }
    };
    const recentUser = computed(() => coreStore.$state.recentUser);
    const docOptions = ref([
      { label: "COREN", value: "COREN" },
      { label: "CRM", value: "CRM" },
    ]);
    // REQUIRED; must be called inside of setup()
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    onMounted(() => {
      newUser.value.node = node();
    });
    return {
      step,
      coreStore,
      dialogRef,
      newUser,
      recentUser,
      dlgNewProject,
      finish,
      userType,
      docOptions,
      onDialogHide,
      navigate,
      itmDisabled,
      errorMessage,
      testarCPF,
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
  min-height: 285px;
}
.myType {
  border: 1px solid primary;
}
</style>
