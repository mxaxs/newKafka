<template>
  <div class="myCard dropzone text-dark" id="dropzone">
    <div class="dz-message absolute-centers">
      <q-icon name="cloud_upload" color="primary" size="96px" />
      <div class="text-caption text-primary" style="line-height: 96%">
        Clique ou arraste seu<br />exame aqui para enviar!
      </div>
      <q-dialog
        v-model="dlgExam"
        persistent
        transition-show="scale"
        transition-hide="scale"
        :maximized="$q.platform.is.mobile ? true : false"
      >
        <q-card
          v-if="sendExamType == 'ECG'"
          :class="$q.platform.is.desktop ? 'frmDlg' : ''"
          class="dlgUpload"
        >
          <q-card-section>
            <div class="text-h5 text-dark text-weight-light text-center">
              Dados do Paciente
              <div class="float-right">
                <q-icon
                  :class="readOnlyInfo ? 'text-primary' : 'text-dark'"
                  :name="readOnlyInfo ? 'lock' : 'lock_open'"
                  @click="readOnlyInfo = !readOnlyInfo"
                  style="cursor: pointer"
                  title="Editar informações"
                ></q-icon>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="text-dark q-mx-sm">
              <q-input
                :readonly="readOnlyInfo"
                outlined
                dense
                v-model="newExam.nome"
                label="Nome do Paciente *"
                class="text-uppercase"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Por favor digite algo',
                ]"
              >
              </q-input>
              <div class="row full-width q-gutter-md wrap">
                <div class="col">
                  <q-input
                    outlined
                    dense
                    v-model="newExam.register"
                    label="Registro do Paciente"
                  >
                  </q-input>
                </div>
                <div class="col">
                  <q-input
                    :readonly="readOnlyInfo"
                    outlined
                    dense
                    unmasked-value
                    v-model="newExam.cpf"
                    label="CPF do Paciente"
                    lazy-rules
                    mask="###.###.###-##"
                    :rules="[(val) => testarCPF(val) || 'CPF inválido']"
                  >
                  </q-input>
                </div>
              </div>
              <div
                class="fit row wrap justify-start items-start content-start q-gutter-sm"
              >
                <div class="col-4 justify-left">
                  <q-input
                    :readonly="readOnlyInfo"
                    outlined
                    dense
                    type="number"
                    v-model="newExam.age"
                    label="Idade"
                    lazy-rules
                    :rules="[
                      (val) =>
                        (val !== null && val !== '') ||
                        'Por favor digite a idade',
                      (val) =>
                        (val > 0 && val < 100) ||
                        'Por favor digite uma idade factível.',
                    ]"
                  >
                    <template v-slot:append v-if="$q.platform.is.desktop">
                      <div class="text-subtitle2 text-dark">anos</div>
                    </template>
                  </q-input>
                </div>
                <div class="col-shrink justify-left q-my-auto">OU</div>
                <div class="col-5">
                  <q-input
                    :readonly="readOnlyInfo"
                    outlined
                    dense
                    v-model="newExam.nascimento"
                    label="Data de Nascimento"
                    mask="##-##-####"
                  />
                </div>
                <div class="row full-width justify-around q-mb-md">
                  <q-option-group
                    inline
                    size="xs"
                    :disable="readOnlyInfo"
                    v-model="newExam.sexo"
                    :options="sexOptions"
                    color="primary"
                    dense
                  />
                </div>
              </div>

              <div class="row full-width q-gutter-sm">
                <div class="col">
                  <q-input
                    outlined
                    dense
                    v-model="newExam.email"
                    label="Email do Paciente"
                  >
                  </q-input>
                </div>
                <div class="col text-center justify-center">
                  <div class="col">
                    <q-input
                      outlined
                      dense
                      v-model="newExam.phone"
                      label="Telefone do Paciente"
                    >
                    </q-input>
                  </div>
                </div>
              </div>

              <div
                class="row full-width text-subtitle1 text-weight-light text-dark q-mt-md"
                style="line-height: 96%"
              >
                <div class="offset-1">
                  Motivo(s) para o exame<br />
                  <span class="text-weight-light text-caption no-padding"
                    >Por favor, informe o(s) motivo(s) para o exame.</span
                  >
                </div>
              </div>

              <q-select
                class="text-dark s-box full-width"
                outlined
                dense
                v-model="newExam.exam_motive"
                use-input
                use-chips
                multiple
                input-debounce="0"
                @new-value="createValue"
                :options="filterOptions"
                @filter="filterFn"
                style="width: 80%"
              />
              <q-input
                class="q-mt-md text-dark"
                outlined
                dense
                v-model="newExam.obs"
                label="Observações"
              >
              </q-input>
            </q-form>
          </q-card-section>
          <q-separator />
          <!-- buttons example -->
          <q-card-actions align="center" class="q-mr-lg" style="top: -5px">
            <q-toggle
              v-model="newExam.urgente"
              label="Exame Urgente"
              class="float-left q-mr-lg text-dark"
              :color="newExam.urgente ? 'red' : 'dark'"
              :class="newExam.urgente ? 'text-red' : 'text-dark'"
            />
            <q-btn
              flat
              color="primary"
              label="Cancelar"
              @click="cancelExam()"
            />
            <q-btn
              :disable="
                newExam.exam_motive.length == 0 || newExam.nome.length == 0
              "
              flat
              :color="
                newExam.exam_motive.length == 0 || newExam.nome.length == 0
                  ? 'secondary'
                  : 'primary'
              "
              label="Enviar"
              @click="sendExam()"
            />
          </q-card-actions>
        </q-card>
        <q-card
          v-if="sendExamType == 'EEG'"
          :class="$q.platform.is.desktop ? 'frmDlg' : ''"
        >
          <q-card-section>
            <div class="text-h5 text-dark text-weight-light text-center">
              Dados do Paciente
              <div class="float-right">
                <q-icon
                  :class="readOnlyInfo ? 'text-primary' : 'text-dark'"
                  :name="readOnlyInfo ? 'lock' : 'lock_open'"
                  @click="readOnlyInfo = !readOnlyInfo"
                  style="cursor: pointer"
                  title="Editar informações"
                ></q-icon>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-h5 justify-center text-center">
              FORMULÁRIO DO EEG
            </div>
          </q-card-section>
          <q-separator />
          <!-- buttons example -->
          <q-card-actions align="center" class="q-mr-lg" style="top: -5px">
            <q-toggle
              v-model="newExam.urgente"
              label="Exame Urgente"
              class="float-left q-mr-lg text-dark"
              :color="newExam.urgente ? 'red' : 'dark'"
              :class="newExam.urgente ? 'text-red' : 'text-dark'"
            />
            <q-btn
              flat
              color="primary"
              label="Cancelar"
              @click="cancelExam()"
            />
            <q-btn
              :disable="
                newExam.exam_motive.length == 0 || newExam.nome.length == 0
              "
              flat
              :color="
                newExam.exam_motive.length == 0 || newExam.nome.length == 0
                  ? 'secondary'
                  : 'primary'
              "
              label="Enviar"
              @click="sendExam()"
            />
          </q-card-actions>
        </q-card>
        <q-card
          v-if="sendExamType == 'DMD'"
          :class="$q.platform.is.desktop ? 'frmDlg' : ''"
        >
          <q-card-section>
            <div class="text-h5 text-dark text-weight-light text-center">
              Dados do Paciente
              <div class="float-right">
                <q-icon
                  :class="readOnlyInfo ? 'text-primary' : 'text-dark'"
                  :name="readOnlyInfo ? 'lock' : 'lock_open'"
                  @click="readOnlyInfo = !readOnlyInfo"
                  style="cursor: pointer"
                  title="Editar informações"
                ></q-icon>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-h5 justify-center text-center">
              FORMULÁRIO DE DERMATOSCOPIA DIGITAL
            </div>
          </q-card-section>
          <q-separator />
          <!-- buttons example -->
          <q-card-actions align="center" class="q-mr-lg" style="top: -5px">
            <q-toggle
              v-model="newExam.urgente"
              label="Exame Urgente"
              class="float-left q-mr-lg text-dark"
              :color="newExam.urgente ? 'red' : 'dark'"
              :class="newExam.urgente ? 'text-red' : 'text-dark'"
            />
            <q-btn
              flat
              color="primary"
              label="Cancelar"
              @click="cancelExam()"
            />
            <q-btn
              :disable="
                newExam.exam_motive.length == 0 || newExam.nome.length == 0
              "
              flat
              :color="
                newExam.exam_motive.length == 0 || newExam.nome.length == 0
                  ? 'secondary'
                  : 'primary'
              "
              label="Enviar"
              @click="sendExam()"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import { Dropzone } from "dropzone";
import { onMounted, ref, inject, computed } from "vue";
import { uid, useQuasar } from "quasar";
import Swal from "sweetalert2";
import moment from "moment";
import DataService from "src/common/services/DataService";
import gql from "graphql-tag";
import { useCoreStore } from "src/stores/core";
import { platform } from "os";
const stringOptions = [
  "Taquicardia",
  "Dor Torácica",
  "Dispnéia",
  "Palpitações",
  "Desmaios",
  "Formigamento MS",
  "Formigamento MI",
];

export default {
  name: "UplodFiles",
  data() {
    return {
      objExam: {},
      isPDF: true,
    };
  },
  methods: {
    addTag(newTag) {
      const tag = {
        name: newTag,
        code: newTag.substring(0, 2) + Math.floor(Math.random() * 10000000),
      };
      this.options.push(tag);
      this.value.push(tag);
    },
    addExam ( newExam ) {

      axios.post( 'http://localhost:3000/api/exams', newExam ).then( ( response ) => {
        console.log( response.data );
      } );

      console.warn(
        "birthdate",
        newExam.value.nascimento ?? "1970-01-01",
        "age",
        newExam.value.age ?? 0,
        "category",
        this.getCategory(),
        "cpf",
        newExam.value.cpf ?? "",
        "email",
        newExam.value.email ?? "",
        "exam",
        newExam.value.exam,
        "exam_motive",
        newExam.value.exam_motive ?? "",
        "nome",
        newExam.value.nome,
        "obs",
        newExam.value.obs ?? "",
        "phone",
        newExam.value.phone,
        "priority",
        newExam.value.urgente ? 1 : 3,
        "project",
        this.getProject(),
        "register",
        newExam.value.register ?? "",
        "senderid",
        newExam.value.senderid,
        "sex",
        newExam.value.sexo ?? "",
        "uuid",
        newExam.value.uuid ?? ""
      );

      this.$apollo
        .mutate({
          mutation: gql`
            mutation newexam(
              $birthdate: String!
              $age: Int!
              $category: String!
              $cpf: String!
              $email: String!
              $exam: String!
              $exam_motive: jsonb!
              $nome: String!
              $obs: String!
              $phone: String!
              $priority: Int!
              $project: Int!
              $register: String!
              $senderid: Int!
              $sex: String!
              $status: Int!
              $uuid: uuid!
              $examhash: String!
            ) {
              newexam: insert_nxm_exams_one(
                object: {
                  birthdate: $birthdate
                  age: $age
                  category: $category
                  cpf: $cpf
                  created: "now()"
                  email: $email
                  exam: $exam
                  exam_motive: $exam_motive
                  lastupdate: "now()"
                  nome: $nome
                  obs: $obs
                  phone: $phone
                  priority: $priority
                  project: $project
                  register: $register
                  senderid: $senderid
                  sex: $sex
                  status: $status
                  uuid: $uuid
                  examhash: $examhash
                }
              ) {
                condition
                id
                lastupdate
              }
            }
          `,
          variables: {
            birthdate: newExam.value.nascimento,
            age: newExam.value.age ?? 0,
            category: this.getCategory(),
            cpf: newExam.value.cpf ?? "",
            email: newExam.value.email ?? "",
            exam: newExam.value.exam,
            exam_motive: newExam.value.exam_motive ?? "",
            nome: newExam.value.nome,
            obs: newExam.value.obs ?? "",
            phone: newExam.value.phone,
            priority: newExam.value.urgente ? 1 : 3,
            project: this.getProject(),
            register: newExam.value.register ?? "",
            senderid: newExam.value.senderid,
            sex: newExam.value.sexo ?? "",
            status: 1,
            uuid: newExam.value.uuid ?? "",
            examhash: newExam.value.examhash ?? "",
          },
        })
        .then((result) => {
          console.log("INSERT RESULT:", result);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    insertExam(response) {
      //VERIFY IS IS PDF
      if (this.isPDF) {
        const hasText = response.textexam
          .toLowerCase()
          .match(/"nome" || "paciente" || "id"/);

        //SE HOUVER UM NOME NO TEXTO
        if (hasText) {
          const isMicromed = response.textexam.toLowerCase().match(/micromed/);
          const isECG = response.textexam.toLowerCase().match(/ecg/);
          const isBionet = response.textexam.toLowerCase().match(/bionet/);
          const isCardioline = response.textexam
            .toLowerCase()
            .match(/cardioline/);
          if (isMicromed) {
            const _textExam = response.textexam;
            let micromedType = "";
            //verifica qual modelo é
            if (_textExam.toLowerCase().match(/idade/)) {
              micromedType = "micromed3l";
            } else {
              const fragment = _textExam
                .toLowerCase()
                .match(/nome:([\s\S]*?)reg[\s\S]*?/);
              if (fragment != null) {
                if (fragment[1].includes("nasc")) {
                  micromedType = "micromed4l";
                } else {
                  micromedType = "micromed6l";
                }
              }

              //micromed6l is the same
            }
            this.getDataFromText(response.textexam, micromedType);
          } else if (isBionet) {
            this.getDataFromText(response.textexam, "bionet");
          } else if (isCardioline) {
            this.getDataFromText(response.textexam, "cardioline");
          } else {
            this.getDataFromText(response.textexam, "teb");
          }
          //scanPDF(arrText, response);
        } else {
          console.info("*********THERE'S NO TEXT********");
        }
        this.showDlg(1);
      } else {
        this.showDlg(null);
      }
    },

    async checkDup(exam) {
      const examhash = exam.hash;

      this.$apollo
        .query({
          query: gql`
            query checkDup($hash: String!) {
              dupe: nxm_exams(where: { examhash: { _eq: $hash } }) {
                nome
                status
                created
                exam_motive
                obs
                senderid
              }
            }
          `,
          variables: {
            hash: examhash,
          },
          fetchPolicy: "no-cache",
        })
        .then((response) => {
          const data = response.data;
          console.log("THE DUPPE data >>>>", data);
          console.log("THE DUPPE response >>>>", response);
          if (data.dupe.length > 0) {
            Swal.fire(
              "Arquivo duplicado",
              `Este arquivo já foi enviado como pertencente a <br/> ${
                data.dupe[0].nome
              } <br/> enviado em ${this.formatDate(data.dupe[0].created)}`,
              "warning"
            ).then((res) => {
              this.cancelExam();
            });
          } else {
            this.insertExam(exam);
          }
        });
    },
    formatDate(date) {
      return moment(date).format("DD-MM-YYYY HH:mm:ss");
    },

    async scaleImageBeforeUpload(file, dimensions) {
      // ensure the file is an image
      if (!file.type.match(/image.*/)) return null;

      const image = new Image();
      image.src = URL.createObjectURL(file);

      (await new Promise()) < Event > ((res) => (image.onload = res));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: true });

      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      if (image.height <= image.width) {
        const scaleProportions = canvas.height / image.height;
        const scaledWidth = scaleProportions * image.width;
        context.drawImage(
          image,
          (canvas.width - scaledWidth) / 2,
          0,
          scaledWidth,
          canvas.height
        );
      } else {
        const scaleProportions = canvas.width / image.width;
        const scaledHeight = scaleProportions * image.height;
        context.drawImage(
          image,
          0,
          (canvas.height - scaledHeight) / 2,
          canvas.width,
          scaledHeight
        );
      }

      return new Promise((res) => canvas.toBlob(res));
    },
  },
  setup() {
    const $q = useQuasar();
    let myDZ;
    const coreStore = useCoreStore();
    const readOnlyInfo = ref(true);
    const sendExamType = ref("");
    let newExam = ref({
      exam: "",
      nome: "",
      sobrenome: "",
      email: "",
      phone: "",
      register: "",
      sexo: "",
      nascimento: "",
      age: 0,
      cpf: "",
      exam_motive: [],
      obs: "",
      urgente: false,
      category: "",
    });
    const emitter = inject("emitter");
    const dlgExam = ref(false);
    const theMsg = ref({});
    const filterOptions = ref(stringOptions);
    const showDlg = function (msg) {
      //readOnlyInfo.value = msg == null ? false : true;
      theMsg.value = msg;
      dlgExam.value = true;
    };

    const getExamPath = () => {
      const exampath = sessionStorage.getItem("examfile");
      return exampath;
    };

    const getUserID = () => {
      const user = sessionStorage.getItem("loggedUser");
      const jsonUser = JSON.parse(user);
      if (jsonUser["id"] == null) return null;
      return jsonUser["id"];
    };

    const getCategory = () => {
      return sessionStorage.getItem("sendExamType");
    };
    const getProject = () => {
      return JSON.parse(sessionStorage.getItem("loggedUser")).projects[0];
    };

    const resetForm = () => {
      newExam.value.exam = "";
      newExam.value.nome = "";
      newExam.value.sobrenome = "";
      newExam.value.email = "";
      newExam.value.phone = "";
      newExam.value.register = "";
      newExam.value.sexo = "";
      newExam.value.nascimento = "";
      newExam.value.age = 0;
      newExam.value.cpf = "";
      newExam.value.exam_motive = [];
      newExam.value.obs = "";
      newExam.value.urgente = false;
    };
    const createRegExp = (params) => {
      const regx = String.raw`${params.start}([\s\S]*?)${params.end}[\s\S]*?`;
      return regx;
    };
    const getDataFromText = (examtext, type) => {
      examtext = examtext.toUpperCase();

      const findNome =
        examtext.toLowerCase().match(/nome/) ||
        examtext.toLowerCase().match(/name/) ||
        examtext.toLowerCase().match(/paciente/) ||
        type == "cardioline";
      if (!findNome) {
        readOnlyInfo.value = false;
        return;
      }
      let isMasc;
      let cardiolineSex;
      if (type == "cardioline") {
        isMasc = examtext.includes("MASCULINO");
        cardiolineSex = isMasc ? "MASCULINO" : "FEMININO";
      }
      let nomeRx = {
        teb: { start: "PACIENTE:", end: "IDADE" },
        bionet: { start: "NAME :", end: "AGE" },
        cardioline: { start: "ID:", end: cardiolineSex },
        micromed: { start: "NOME:", end: "REG" },
        micromed3l: { start: "NOME:", end: "RG" },
        micromed4l: { start: "NOME:", end: "NASC" },
        micromed6l: { start: "NOME:", end: "REG" },
      };
      let sexoRx = {
        teb: { start: "SEXO:", end: "SEXO" },
        bionet: { start: "SEX :", end: "H" },
        micromed: { start: "NOME:", end: "RG" },
        cardioline: { start: cardiolineSex, end: cardiolineSex },
        micromed3l: { start: "SEXO:", end: "PESO" },
        micromed4l: { start: "NOME:", end: "NASC" },
        micromed6l: { start: "NOME:", end: "REG" },
      };
      let nascimentoRx = {
        teb: { start: "IDADE:", end: "ANOS" },
        bionet: { start: "AGE :", end: "YRS" },
        micromed: { start: "NOME:", end: "RG" },
        cardioline: { start: cardiolineSex, end: "\\(" },
        micromed3l: { start: "NASC:", end: "IDADE" },
        micromed4l: { start: "NASC.:", end: "REG" },
        micromed6l: { start: "NASC.:", end: "RG" },
      };
      let cpfRx = {
        teb: { start: "PACIENTE:", end: "IDADE" },
        micromed: { start: "NOME:", end: "RG" },
        cardioline: { start: "ID:\n", end: "\n" },
        micromed3l: { start: "CPF:", end: "NASC" },
        micromed4l: { start: "CPF:", end: "FC" },
        micromed6l: { start: "CPF:", end: "FC" },
      };

      //NOME
      let params = nomeRx[type] ?? "";
      let queryReg = new RegExp(createRegExp(params), "g");
      const nome = queryReg.exec(examtext);
      queryReg = null;
      console.warn("THE NOME >>>>>>", nome);
      if (nome[0] == "NAME : \nSURNAME : \nAGE" || nome[0] == "NOME:\n \nRG") {
        readOnlyInfo.value = false;
      }
      newExam.value.nome = nome[1]
        .toUpperCase()
        .replace("SURNAME : ", "")
        .replace(/\n/g, " ")
        .trim(); //caso bionet

      //SEXO
      if (type == "cardioline") {
        newExam.value.sexo = isMasc ? "masculino" : "feminino";
      } else if (type == "micromed4l" || type == "micromed6l") {
        newExam.value.sexo = null;
      } else {
        params = sexoRx[type] ?? "";
        queryReg = new RegExp(createRegExp(params), "g");
        const sexo = queryReg.exec(examtext);
        queryReg = null;
        newExam.value.sexo =
          sexo == null
            ? null
            : sexo[1]
                .replace("M\n", "masculino")
                .replace("F\n", "feminino")
                .toLowerCase()
                .trim(); //caso bionet
      }

      //NASCIMENTO
      params = nascimentoRx[type] ?? "";

      if (type == "cardioline") {
        //const sexType = isMasc ? "MASCULINO" : "FEMININO";
        //queryReg = new RegExp(String.raw`${sexType}([\s\S]*?)\([\s\S]*?`);
        queryReg = new RegExp(createRegExp(params), "g");
        const nascimento = queryReg.exec(examtext);
        newExam.value.nascimento = nascimento[1].trim();
        const [day, month, year] = nascimento[1].trim().split("/");
        const bDate = new Date(+year, month - 1, +day);
        newExam.value.age = moment().diff(bDate, "years", false);
      } else if (type == "bionet" || type == "teb") {
        queryReg = new RegExp(createRegExp(params), "g");
        const nascimento = queryReg.exec(examtext);
        console.warn("THE NASCIMENTO >>>>", nascimento);
        if (nascimento != null) {
          newExam.value.nascimento = nascimento[1].trim() ?? null;
          if (isNaN(nascimento[1])) {
            newExam.value.nascimento = nascimento[1].trim();
          } else {
            newExam.value.age = nascimento[1].trim();
            newExam.value.nascimento = null;
          }
        }
      } else if (
        type == "micromed6l" ||
        type == "micromed4l" ||
        type == "micromed3l"
      ) {
        queryReg = new RegExp(createRegExp(params), "g");
        const nascimento = queryReg.exec(examtext);
        if (nascimento != null) {
          newExam.value.nascimento = nascimento[1].trim();

          const [day, month, year] = nascimento[1].trim().split("/");
          const bDate = new Date(+year, month - 1, +day);
          newExam.value.age = moment().diff(bDate, "years", false);
        } else {
          newExam.value.nascimento = null;
        }
      }

      // CPF
      if (
        type == "micromed6l" ||
        type == "micromed4l" ||
        type == "micromed3l"
      ) {
        params = cpfRx[type] ?? "";
        queryReg = new RegExp(createRegExp(params), "g");
        const cpf = examtext.match(queryReg);
        newExam.value.cpf = cpf[1] ?? null;
      }
    };
    const removeOrfan = () => {
      const id = sessionStorage.getItem("examID");
      const exam = sessionStorage.getItem("examfile");
      const fileExtension = exam.slice(((exam.lastIndexOf(".") - 1) >>> 0) + 2);

      const params = { id: id, extension: fileExtension };
      DataService.removeorfan(params).then((result) => {
        sessionStorage.removeItem("examID");
        sessionStorage.removeItem("examfile");
        sessionStorage.removeItem("exam-dump");
      });
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
    const getSendExamType = () => {
      sendExamType.value = sessionStorage.getItem("sendExamType");
    };

    const sendExam = async () => {
      //CAMPOS COMPLEMENTARES ANTES DO ENVIO

      const nasc = moment(new Date(newExam.value.nascimento)).isValid()
        ? moment(newExam.value.nascimento).format("YYYY-MM-DD")
        : "";
      newExam.value.nascimento = nasc;
      newExam.value.uuid = uid();
      newExam.value.hd = null;
      newExam.value.cid = null;
      newExam.value.crm = null;
      newExam.value.medicname = null;
      newExam.value.project = getProject();
      newExam.value.senderid = getUserID();
      newExam.value.status = 1;
      newExam.value.priority = newExam.value.urgente ? 1 : 3;
      newExam.value.category =
        sendExamType.value == undefined || sendExamType.value == ""
          ? "ECG"
          : sendExamType.value;

      /* DataService.requestmedicalreport(newExam.value).then((result) => {
        myDZ.removeAllFiles();
        dlgExam.value = false;
        resetForm();
        emitter.emit("reloadUI");
      }); */

      emitter.emit("addExam", newExam);
      emitter.emit("reloadUI");
      readOnlyInfo.value = true;
      setTimeout(() => {
        myDZ.removeAllFiles();
        dlgExam.value = false;
        resetForm();
      }, 500);
    };

    onMounted(() => {
      getSendExamType();
      myDZ = new Dropzone("#dropzone", {
        autoDiscover: false,
        //url: "https://api-rest.in/api/exam/upload",
        url: "http://localhost/api/multi",
        paramName: "sampleFile",
        message: "Arraste seu exame aqui!",
        maxFiles: 1,
        acceptedFiles: "image/*,application/pdf",
        resizeWidth: 1024,
        disabled:
          sendExamType.value == undefined || sendExamType.value == ""
            ? true
            : false,
        thumbnailHeight: 96,
        thumbnailWidth: 96,
        maxFilesize: 100, // MB
        addRemoveLinks: false,
        headers: {
          Authorization:
            "Basic ZFc1cGJXVmtjbTl1Wkc5dWIzQnZiR2x6OllUTm1OREpoTVdRdE1XVXhZeTAwWldaaUxUZzJaRGd0TVRNNU16RTBNamc1Wmprdw==",
        },
        accept: async function (file, done) {
          this.isPDF = file.type == "application/pdf" ? true : false;
          if (!this.isPDF) {
            console.log("THE FILE WIDTH", file);
          }
          readOnlyInfo.value = true;
          resetForm();
          done();
        },
        success: function (file, response) {
          console.warn("THE RESULT OF UPLOAD >>>>>", response);
          newExam.value.exam = response.exampath;
          newExam.value.examhash = response.hash;
          sessionStorage.setItem("examID", response.id);
          sessionStorage.setItem("examType", file.type);
          sessionStorage.setItem("examfile", response.exampath);
          emitter.emit("checkDup", response);
        },
        init: function () {
          this.on("resetFiles", () => {
            this.removeAllFiles();
          });
        },
      });
      myDZ.autoDiscover = false;
      myDZ.on("addedfile", (file) => {
        if (!file.type.match(/image/)) {
          // This is not an image, so Dropzone doesn't create a thumbnail.
          // Set a default thumbnail:
          myDZ.emit("thumbnail", file, "pdf96.png");
          file.previewElement.style.backgroundColor = "transparent";
          file.previewElement.style.top = "10px";
          file.previewElement.style.width = "96px";

          // You could of course generate another image yourself here,
          // and set it as a data url.
        }
      });
    });
    return {
      myDZ,
      coreStore,
      removeOrfan,
      newExam,
      dlgExam,
      theMsg,
      exam_motive: ref(null),
      sexo: ref(""),
      sexOptions: [
        { label: "Masculino", value: "masculino" },
        { label: "Feminino", value: "feminino" },
      ],
      readOnlyInfo,
      filterOptions,
      emitter,
      sendExam,
      getProject,
      getCategory,
      getDataFromText,
      sendExamType,
      testarCPF,
      showDlg,
      createValue(val, done) {
        if (val.length > 0) {
          if (!stringOptions.includes(val)) {
            stringOptions.push(val);
          }
          done(val, "toggle");
        }
      },
      filterFn(val, update) {
        update(() => {
          if (val === "") {
            filterOptions.value = stringOptions;
          } else {
            const needle = val.toLowerCase();
            filterOptions.value = stringOptions.filter(
              (v) => v.toLowerCase().indexOf(needle) > -1
            );
          }
        });
      },
      cancelExam() {
        removeOrfan();
        myDZ.removeAllFiles();
        dlgExam.value = false;
      },
    };
  },
  created() {
    this.emitter.on("addExam", (e) => {
      this.addExam(e);
    });
    this.emitter.on("checkDup", (hash) => this.checkDup(hash));
  },
};
</script>
<style scoped>
.myCard {
  width: 80%;
  max-width: 80%;
  height: 30vh;
  border-radius: 20px;
  border: 2px solid #ffffff;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
}
.dropzone .dz-previewTemplate {
  background-color: transparent !important;
}
.q-chip {
  background-color: #64d8cb;
}
.myItem {
  background-color: lightblue;
  border: solid 1px grey;
  border-radius: 20px;
  padding: 4px;
}
.b-box {
  border-left: 4px solid #b2dfdb;
  border-right: 4px solid #b2dfdb;
  border-radius: 10px;
}
.s-box {
  border-radius: 15px;
}
.myDlg {
  width: 40vw;
  max-width: 40vw;
  height: 60vh;
  border-radius: 20px;
  border: 1px solid primary;
  background-color: white;
  position: relative;
  background-size: 40%;
  background-repeat: no-repeat;
  background-position: center;
}

.frmDlg {
  width: 40vw;
  max-width: 30vw;
  border-radius: 20px;
  border: 1px solid primary;
  background-color: white;
  position: relative;
  background-size: 40%;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
