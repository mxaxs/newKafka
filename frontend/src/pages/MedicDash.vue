<template>
  <q-page class="flex overflow-hidden">
    <div
      class="full-width row inline wrap justify-start items-start content-start bg-grey-2"
    >
      <transition
        appear
        enter-active-class="animated slideInLeft"
        leave-active-class="animated slideOutLeft"
      >
        <div class="col-2 bg-grey-2 full-height q-mt-md" v-show="showLaudar">
          <exames-laudar />
        </div>
      </transition>
      <div class="col-grow" style="height: 89vh">
        <div
          class="row inline full-width wrap justify-start items-start content-start"
        >
          <splitpanes class="default-theme">
            <pane :min-size="40">
              <!-- Bloco do exame -->
              <div
                class="col rounded q-ml-sm q-mr-sm q-pa-sm bg-white"
                style="
                  border: 1px solid #d7dedd;
                  border-radius: 10px;
                  height: 90vh;
                "
              >
                <q-linear-progress
                  v-show="laudando"
                  :color="progressColor"
                  :value="progress"
                  class="q-mt-md"
                />
                <q-scroll-area
                  v-show="laudando"
                  style="height: 98%"
                  :bar-style="{
                    right: '2px',
                    borderRadius: '5px',
                    width: '3px',
                    opacity: 0.8,
                  }"
                >
                  <div id="viewer" style="height: 84vh"></div>
                </q-scroll-area>
                <q-scroll-area
                  v-if="!laudando"
                  style="height: 98%"
                  :bar-style="{
                    right: '2px',
                    borderRadius: '5px',
                    width: '3px',
                    opacity: 0.8,
                  }"
                >
                  <q-img
                    no-native-menu
                    :src="imgExam"
                    class="fit rounded-borders"
                    v-viewer
                  >
                    <div
                      v-if="!laudando"
                      class="absolute-bottom row-grow text-subtitle1 rounded-borders"
                    >
                      <div class="row-grow text-caption no-padding text-center">
                        Ola {{ logged_name }}! Selecione um exame e podemos
                        prosseguir!
                      </div>
                      <div class="row">
                        <div class="col-4 text-center">
                          <div class="row-grow text-h3">
                            {{ scorer.total }}
                          </div>
                          <div class="row-grow">laudados hoje</div>
                        </div>
                        <div class="col-4 text-center q-mt-sm">
                          <div class="row-grow text-h5">
                            <q-icon name="fingerprint"></q-icon>
                            {{ remainingTime }}
                          </div>
                          <div class="row-grow">{{ remainingLabel }}</div>
                        </div>
                        <div
                          class="col-4 text-left q-pl-lg"
                          style="border-left: 2px white solid"
                        >
                          <div class="row-grow no-padding">
                            <q-icon name="favorite" />&nbsp;&nbsp;{{
                              scorer.normal
                            }}
                            exames normais
                          </div>
                          <div class="row-grow">
                            <q-icon name="heart_broken" />&nbsp;&nbsp;{{
                              scorer.altered
                            }}
                            exames alterados
                          </div>
                          <div class="row-grow text-white">
                            <q-icon
                              name="heart_broken"
                              color="red"
                            />&nbsp;&nbsp;{{ scorer.critic }}
                            exames críticos
                          </div>
                          <div class="row-grow text-yellow">
                            <q-icon name="swipe_left" />&nbsp;&nbsp;{{
                              scorer.rejected
                            }}
                            exames rejeitados
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-img>
                </q-scroll-area>
              </div>
            </pane>
            <pane
              :size="30"
              :min-size="30"
              class="bg-white"
              style="border-radius: 10px"
            >
              <!-- BLOCO DE LAUDO -->
              <div class="full-height bg-white">
                <personal-info class="q-mt-md" />
                <q-card
                  flat
                  class="q-ma-sm q-pa-sm"
                  style="border: 1px solid #ebebeb"
                >
                  <editor
                    :disabled="!laudando"
                    ref="tm"
                    id="d1"
                    v-model="content"
                    :init="init"
                  ></editor>
                  <q-card-actions class="justify-center q-gutter-sm">
                    <div class="row full-width no-wrap q-mb-sm justify-center">
                      <q-option-group
                        :disable="!laudando"
                        v-model="condition"
                        dense
                        inline
                        :options="optCondition"
                      />
                    </div>
                    <q-btn
                      class="q-ml-lg"
                      :disable="
                        !laudando || content.length < 15 || condition == null
                      "
                      unelevated
                      rounded
                      size="sm"
                      color="primary"
                      label="Enviar Laudo"
                      @click="sendExam()"
                    />
                    <q-space />
                    <q-btn
                      :disable="!laudando"
                      size="sm"
                      unelevated
                      rounded
                      color="red"
                      label="Rejeitar"
                      @click="showRejectExam()"
                    />
                    <q-btn
                      :disable="!laudando"
                      size="sm"
                      unelevated
                      rounded
                      color="warning"
                      label="Cancelar"
                      @click="
                        emitter.emit('closeAppraisal', {
                          lock: false,
                          bypass: false,
                        })
                      "
                    />
                  </q-card-actions>
                </q-card>

                <lista-de-laudos />
              </div>
            </pane>
          </splitpanes>
        </div>
      </div>
    </div>
  </q-page>
  <q-page-sticky position="bottom-left" :offset="[3, 18]">
    <q-fab
      glossy
      color="primary"
      icon="keyboard_arrow_left"
      direction="right"
      padding="xs"
      @click="toggleLaudar()"
    >
      <template v-slot:active-icon="{ opened }">
        <q-icon
          :class="{ 'example-fab-animate': opened === true }"
          name="keyboard_arrow_right"
        />
      </template>
    </q-fab>
  </q-page-sticky>
</template>

<script>
import { ref, inject, computed } from "vue";
import { Loading, uid, openURL, useQuasar } from "quasar";
import { useCoreStore } from "stores/core";
import PDFJSExpress from "@pdftron/pdfjs-express-viewer";
import { getInstance } from "@pdftron/pdfjs-express-viewer";
import Editor from "@tinymce/tinymce-vue";
import ExamesLaudar from "../components/ExamesLaudar.vue";
import RejectEx from "../components/RejectEx.vue";
import DataService from "../common/services/DataService";
import ListaDeLaudos from "../components/ListaDeLaudos.vue";
import PersonalInfo from "../components/personalInfo.vue";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import DlgVidaasVue from "src/components/DlgVidaas.vue";

import gql from "graphql-tag";
import moment from "moment";
import timer from "moment-timer";
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);

import Swal from "sweetalert2";
import { from } from "@apollo/client/core";

export default {
  name: "MedicDash",
  components: {
    editor: Editor,
    ExamesLaudar,
    ListaDeLaudos,
    PersonalInfo,
    Splitpanes,
    Pane,
  },
  data() {
    return {
      src: "https://api-rest.in/exams/initial.pdf",
      pageNum: null,
      currentNum: 1,
      content: "",
      condition: null,
      optCondition: [
        { label: "Normal", value: "normal" },
        { label: "Alterado", value: "alterado" },
        { label: "Crítico", value: "critico" },
      ],
      rejectMain: [
        {
          id: 0,
          label: "Arquivo sem conteúdo/ilegível",
          iconame: "circle",
          color: "red",
        },
        {
          id: 1,
          label: "Troca de eletrodos MSD/MSE",
          iconame: "circle",
          color: "red",
        },
        {
          id: 2,
          label: "Interferência excessiva",
          iconame: "circle",
          color: "red",
        },
        {
          id: 3,
          label: "Troca de eletrodos MSE/MIE",
          iconame: "circle",
          color: "red",
        },
        {
          id: 4,
          label: "Outras trocas de eletrodos",
          iconame: "circle",
          color: "red",
        },
        {
          id: 5,
          label: "Linha de base irregular",
          iconame: "circle",
          color: "red",
        },
        {
          id: 6,
          label: "Mal posicionamento eletrodos pre-cordiais",
          iconame: "circle",
          color: "red",
        },
        {
          id: 7,
          label: "Eletrodo desconectado",
          iconame: "circle",
          color: "red",
        },
        { id: 8, label: "ECG isoelétrico", iconame: "circle", color: "red" },
        {
          id: 9,
          label: "Traçado com amplitude 5 mm/mV",
          iconame: "circle",
          color: "red",
        },
        {
          id: 10,
          label: "Traçado com amplitude 20 mm/mV",
          iconame: "circle",
          color: "red",
        },
        {
          id: 11,
          label: "Traçado com velocidade 12,5 mm/s",
          iconame: "circle",
          color: "red",
        },
        {
          id: 12,
          label: "Traçado com velocidade 50 mm/s",
          iconame: "circle",
          color: "red",
        },
      ],
      init: {
        language: "pt_BR",
        toolbar_mode: "scrolling",
        skin: false,
        statusbar: false,
        language_url: "lib/pt_BR.js",
        branding: false,
        paste_block_drop: false,
        toolbar_location: "bottom",
        content_style: "body { font-family: Arial; font-size: 10pt}",
        content_css: false,
        height: "22vh",
        width: "editorW",
        menubar: false,
        plugins: "autosave, paste",
        toolbar:
          "fontsizeselect | undo redo | bold italic | forecolor copy paste pastetext",
      },
      imgExam: "https://api-rest.in/exams/templates/basic/doc_2.gif",
      isImage: false,
      laudando: false,
      intervalID: 0,
      minutes: "00",
      seconds: "00",
      progress: 1,
      progressColor: "primary",
      showLaudar: true,
      scorer: {},
    };
  },
  apollo: {
    scorer: {
      query: gql`
        query score($stat: Int!, $crm: Int!, $appraise: date!) {
          scorer(args: { appraise: $appraise, stat: $stat, crm: $crm }) {
            id
            condition
            lastupdate
            created
            rejected
          }
        }
      `,
      variables() {
        moment.locale("pt-br");
        return {
          crm: this.crm,
          appraise: moment().utc().format("YYYY-MM-DD"), //tem que usar a data de hoje
          stat: 2, //para conter os laudados e rejeitados use 2
        };
      },
      update: (data) => {
        const gqlNormal = data.scorer.filter((e) => e.condition == "normal");
        const gqlAltered = data.scorer.filter((e) => e.condition == "alterado");
        const gqlCritic = data.scorer.filter((e) => e.condition == "critico");
        const gqlRejected = data.scorer.filter((e) => e.rejected != null);

        const scorer = {
          total: data.scorer.length.toString().padStart(2, "0"),
          normal: gqlNormal.length.toString().padStart(2, "0"),
          altered: gqlAltered.length.toString().padStart(2, "0"),
          critic: gqlCritic.length.toString().padStart(2, "0"),
          rejected: gqlRejected.length.toString().padStart(2, "0"),
        };
        return scorer;
      },
    },
  },
  computed: {
    crm() {
      const user = sessionStorage.getItem("loggedUser");
      const jsonUser = JSON.parse(user);
      return jsonUser["doc_id"];
    },
    logged_name() {
      const user = sessionStorage.getItem("loggedUser");
      const jsonUser = JSON.parse(user);
      return `${jsonUser["name"]} ${jsonUser["surname"]}`;
    },

    scale() {
      return this.coreStore;
    },
    allExams() {
      return this.coreStore.allExams;
    },

    examID() {
      const jsonXM = sessionStorage.getItem("clientXM");
      const client = JSON.parse(jsonXM);
      const id = client?.id ?? 0;
      return id;
    },
  },
  methods: {
    getExamID() {
      const jsonXM = sessionStorage.getItem("clientXM");
      const client = JSON.parse(jsonXM);
      const id = client?.id ?? 0;
      return id;
    },
    loadDoc(e) {
      const viewer = document.getElementById("viewer");
      const jsonClient = sessionStorage.getItem("clientXM");
      const ClientXM = JSON.parse(jsonClient);
      const instance = getInstance(viewer);
      instance.setFitMode(instance.FitMode.FitWidth);
      instance.UI.loadDocument(e, { filename: ClientXM.nome });
    },

    toggleLaudar(open = false) {
      if (open) {
        this.showLaudar = true;
      } else {
        this.showLaudar = !this.showLaudar;
      }
    },

    async lockExam(id, lock = true, bypass = false) {
      if (bypass) return;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation lockExamGQL($status: Int!, $id: Int!) {
              update_nxm_exams(
                where: { id: { _eq: $id } }
                _set: { status: $status, lastupdate: "now()" }
              ) {
                affected_rows
                returning {
                  id
                  status
                }
              }
            }
          `,
          variables: {
            id: id,
            status: lock == true ? 99 : 1,
          },
        })
        .then((data) => {
          console.log("LOCKED AT >>>>", data);
        });
    },

    async rejectExam(motive) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation rejectExam($status: Int!, $id: Int!, $reject: String!) {
              reject: update_nxm_exams(
                where: { id: { _eq: $id } }
                _set: {
                  status: $status
                  appraised: "now()"
                  lastupdate: "now()"
                  rejected: $reject
                }
              ) {
                affected_rows
                returning {
                  id
                  status
                }
              }
            }
          `,
          variables: {
            id: this.getExamID(),
            status: 3,
            reject: motive.message,
          },
        })
        .then((data) => {
          this.emitter.emit("closeAppraisal", { lock: false, bypass: true });
          //this.closeAppraisal(false, true);
          console.log("THE REJECTION >>> ", data);
        });
    },

    async changeExamStatus(data) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation changeExamStatus(
              $id: Int!
              $appraisal: String!
              $condition: String!
              $crm_appraise: Int!
              $medic_name: String!
              $examfile: String!
            ) {
              update_nxm_exams(
                _set: {
                  status: 2
                  hd: $appraisal
                  condition: $condition
                  crm_appraise: $crm_appraise
                  medic_name: $medic_name
                  exam: $examfile
                  lastupdate: "now()"
                  appraised: "now()"
                }
                where: { id: { _eq: $id } }
              ) {
                affected_rows
                returning {
                  appraised
                  id
                }
              }
            }
          `,
          variables: {
            id: data.id,
            appraisal: data.appraisal,
            condition: data.condition,
            crm_appraise: data.crm_appraise,
            medic_name: data.medic_name,
            examfile: data.examfile,
          },
        })
        .then((resp) => {
          console.log(resp.data);
          this.emitter.emit("closeAppraisal", { lock: false, bypass: true });
        });
    },

    getProject() {
      const user = sessionStorage.getItem("loggedUser");
      const jsonUser = JSON.parse(user);
      if (jsonUser["projects"] == null) return null;
      return jsonUser["projects"];
    },

    getCategory() {
      const user = sessionStorage.getItem("loggedUser");
      const jsonUser = JSON.parse(user);
      if (jsonUser["scope"] == null) return null;
      return Object.values(jsonUser["scope"]);
    },

    hour(date) {
      moment.locale("pt-br");
      return moment.utc(date, "YYYY-MM-DD[T]HH:mm:SS").local().format("HH:mm");
    },

    async sendExam() {
      Loading.show();
      const strUser = sessionStorage.getItem("loggedUser");
      const medic = JSON.parse(strUser);
      const jsonClient = sessionStorage.getItem("clientXM");
      const ClientXM = JSON.parse(jsonClient);
      const examfile = ClientXM.exam;
      const id = ClientXM.id;
      //const uuid = uid().toString();
      const appraisal = this.content.trim();
      const condition = this.condition;
      const logo = "https://nexar.systems/flow/images/home/flow03.png";
      const exam = examfile?.replace(
        "https://api-rest.in/exams",
        "/usr/share/exams"
      );
      const data = {
        appraisal: appraisal,
        exampath: exam,
        logopath: logo,
        medic: medic["name"] + " " + medic["surname"],
        medic_email: medic["email"],
        crm: medic["doc_id"],
        cpf: medic["cpf"],
        patient: ClientXM["nome"],
        patient_id: id,
      };

      DataService.appraise(data).then((resp) => {
        let signedExam = resp.data.docSigned.doc;
        signedExam = signedExam.replace(
          /\/usr\/share\/exams/,
          "https://api-rest.in/exams"
        );
        console.warn("RESULT OF APPRAISE >>>>>", signedExam);
        const sec_data = {
          id: id,
          status: 2,
          //uuid: uuid,
          appraisal: appraisal,
          condition: condition,
          crm_appraise: medic["doc_id"],
          medic_name: medic["name"],
          examfile: signedExam, // examfile.slice(0, examfile.lastIndexOf(".")) + ".pdf",
        };

        if (resp) {
          this.changeExamStatus(sec_data);

          /* DataService.changestatus(sec_data).then((ret) => {
            this.emitter.emit("closeAppraisal", true);
          }); */
        }
        Loading.hide();
      });
    },

    async closeAppraisal(lock = true, bypass = false) {
      const examID = this.getExamID();
      this.stopTimer();
      if (bypass != true) this.lockExam(examID, lock, bypass);
      this.emitter.emit("laudando", "false");
      this.laudando = false;
      this.imgExam = "https://api-rest.in/exams/templates/basic/doc_2.gif";
      this.isImage = true;
      this.content = "";
      this.condition = null;
      sessionStorage.removeItem("clientXM");
      sessionStorage.removeItem("examfile");
      sessionStorage.removeItem("laudo");
      sessionStorage.setItem("laudando", false);
      this.$apollo.queries.scorer.refetch();
    },

    setExam() {
      let tempFile = sessionStorage.getItem("examfile");
      //this.isImage = !this.isPDF(tempFile);
      this.laudando = true;
      sessionStorage.setItem("laudando", "true");
      this.src = encodeURI(tempFile);
      this.emitter.emit("loadExam", this.src);
    },

    startTimer(duration) {
      this.progressColor = "primary";
      var timer = duration,
        minutes,
        seconds;
      this.intervalId = setInterval(() => {
        this.minutes = parseInt(timer / 60, 10);
        this.seconds = parseInt(timer % 60, 10);
        if (this.minutes < 1) this.progressColor = "red";
        this.progress = timer / duration;
        this.minutes = this.minutes < 10 ? "0" + this.minutes : this.minutes;
        this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;
        this.emitter.emit("countDown", {
          minutes: this.minutes,
          seconds: this.seconds,
        });
        if (--timer < 0) {
          timer = 0;
          clearInterval(this.intervalId);
          this.emitter.emit("timerGameOver");
          this.closeAppraisal();
          this.toggleLaudar(true);
        }
      }, 1000);
    },

    stopTimer() {
      clearInterval(this.intervalId);
      this.progressColor = "primary";
      this.progress = 1;
      this.minutes = "00";
      this.seconds = "00";
      this.emitter.emit("countDown", {
        minutes: "00",
        seconds: "00",
      });
    },

    setColor() {
      this.progressColor = "red";
    },
    async showTTL() {
      const cpf = localStorage.getItem("current_cpf");
      const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      DataService.getTtl({ cpf: cpf }).then((result) => {
        let duration = result.data?.duration ?? 0;
        this.coreStore.$state.TTL = duration;
        let past = moment
          .duration(duration, "seconds")
          .format("HH:mm:ss", { trim: false });

        Toast.fire({
          html: `<div style="margin-top:20px;text-align:center;padding:10px;">
            Autenticação deverá ser renovada em
            </div>
            <div style="background-color: #4158d0; background-image: linear-gradient(43deg,#4158d0 0%,#c850c0 46%,#ffcc70 100%);font-size:30px; margin:auto; max-width:300px; padding:10px;border:1 solid grey;border-radius:10px; text-align:center;color:white">
            ${past}
            </div>`,
        });
      });
    },
    showRejectExam() {
      this.q
        .dialog({
          component: RejectEx,
          persistent: true,
          componentProps: {
            text: "something",
            // ...more..props...
          },
        })
        .onOk((msg) => {
          this.rejectExam(msg);
        })
        .onCancel(() => {})
        .onDismiss(() => {});
    },
    async goVidaas(duration) {
      Loading.show();
      this.dsValidationTime = duration;
      const cpf = localStorage.getItem("current_cpf");
      const data = { cpf: cpf, ttl: duration };
      const site = await DataService.getVidaas(data);
      Loading.hide();
      this.coreStore.$state.vidaasLocalization = site.data.location;
      this.showDlgVidaas();
    },
  },
  mounted() {
    window.addEventListener(
      "beforeunload",
      async (event) => {
        const laudando = sessionStorage.getItem("laudando");
        if (laudando == "true") {
          await this.closeAppraisal(false, false);
          event.preventDefault();
          event.returnValue = "";
        }
      },
      false
    );
    PDFJSExpress(
      {
        path: "pdfjsexpress",
        initialDoc: "",
        licenseKey: "RXlSM6xo1qlBuhfX8Qw3",
      },
      document.getElementById("viewer")
    ).then((instance) => {
      const { Core, UI } = instance;
      //UI.setLanguage("pt_br");
      instance.UI.setLanguage("pt_br");
      var FitMode = instance.UI.FitMode;
      instance.UI.setFitMode(FitMode.FitWidth);
      instance.UI.disableElements([
        "leftPanel",
        "leftPanelButton",
        "selectToolButton",
        "contextMenuPopup",
      ]);

      Core.documentViewer.addEventListener("documentLoaded", () => {
        UI.setFitMode(FitMode.FitWidth);
      });
      Core.documentViewer.addEventListener(
        "pageNumberUpdated",
        (pageNumber) => {
          // console.log(`Page number is: ${pageNumber}`);
        }
      );
    });
  },

  created() {
    this.emitter.on("setClientXM", (e) => this.setExam());
    this.emitter.on("lockexam", (e) => this.lockExam(e.id, e.lock, e.bypass));
    this.emitter.on("getVidaas", (e) => this.goVidaas(e));
    this.emitter.on("showTTL", () => this.showTTL());
    this.emitter.on("finishedVidas", (e) => this.endVidaas(e));
    this.emitter.on("startDsTimer", () => this.startDSTimer());
    this.emitter.on("stopDsTimer", () => this.stopDSTimer());
    this.emitter.on("closeAppraisal", (e) =>
      this.closeAppraisal(e.lock, e.bypass)
    );
    this.emitter.on("startTimer", () => {
      clearInterval(this.intervalId);
      this.startTimer(60 * 5);
    });
    this.emitter.on("stopTimer", () => this.stopTimer());
    this.emitter.on("setLaudo", (value) => {
      this.content = value;
    });
    this.emitter.on("loadExam", (e) => this.loadDoc(e));
  },
  setup() {
    const emitter = inject("emitter");
    const coreStore = useCoreStore();
    const setTM = (item) => {
      const html = `
      <h3 style="font-weight:bold; border-bottom:solid 1px #c0c0c0">Laudo Descritivo</h3>
      <p>
        <span style="font-weight:bold;">Ritmo e Frequência</span><br/>
        ${item["ritmo_fq"]}
      </p>
      <p>
        <span style="font-weight:bold;">Ativação Atrial</span><br/>
        ${item["ativacao_atrial"]}
      </p>
      <p>
        <span style="font-weight:bold;">Condução AV</span><br/>
        ${item["conducao_av"]}
      </p>
      <p>
        <span style="font-weight:bold;">Ativação Ventricular</span><br/>
        ${item["ativacao_ventricular"]}
      </p>
      <p>
        <span style="font-weight:bold;">Repolarização Ventricular</span><br/>
        ${item["repolarizacao_ventricular"]}
      </p>
      <h3 style="font-weight:bold; border-bottom:solid 1px #c0c0c0">Laudo Conclusivo</h3>
      <p><span style="font-weight:bold;">${item["conclusoes"]}</span></p>
      <p></p>
      <p>
        <span style="font-weight:bold;">OBSERVAÇÕES</span><br/>
        ${item["observacoes"]}
      </p>`;
      this.content = html;
    };
    const q = useQuasar();
    const showDlgVidaas = () => {
      q.dialog({
        component: DlgVidaasVue,
      })
        .onOk(() => {
          console.log("OK");
        })
        .onCancel(() => {
          console.log("Cancel");
          coreStore.$state.vidaasLocalization = "";
        })
        .onDismiss(() => {
          console.log("Called on OK or Cancel");
          coreStore.$state.vidaasLocalization = "";
        });
    };
    const dsValidationTime = ref(0);
    const dsPast = ref(0);
    const remainingTime = ref("00");
    const remainingLabel = ref("Autentique sua sessão");
    const dsTimer = new moment.duration(1, "seconds").timer(
      { loop: true },
      function () {
        if (dsPast.value == dsValidationTime.value) {
          dsTimer.stop();
          dsPast.value = "00";
        } else {
          dsPast.value++;
          remainingTime.value = moment
            .duration(dsValidationTime.value - dsPast.value, "seconds")
            .format("hh:mm:ss");
        }
      }
    );
    const startDSTimer = () => {
      if (dsTimer.isStarted() == false) {
        const cpf = localStorage.getItem("current_cpf");
        DataService.getTtl({ cpf: cpf }).then((result) => {
          dsValidationTime.value = result.data.duration;
          dsPast.value = 0;
          dsTimer.start();
          remainingLabel.value = "Expiração da Autenticação";
        });
      }
    };
    const stopDSTimer = () => {
      dsPast.value = 0;
      remainingTime.value = "00";
      remainingLabel.value = "Autentique sua sessão";
      dsTimer.stop();
    };
    return {
      dsTimer,
      startDSTimer,
      stopDSTimer,
      dsValidationTime,
      remainingTime,
      remainingLabel,
      coreStore,
      showDlgVidaas,
      setTM,
      emitter,
      dialog: ref(false),
      maximizedToggle: ref(true),
      q,
    };
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
    this.dsTimer.stop();
  },
};
</script>
<style scoped>
.editorW {
  width: 100%;
}
.nsContainer {
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}
.nsContainer::-webkit-scrollbar {
  /* WebKit */
  width: 0 !important;
  height: 0 !important;
}
.pbTeal {
  color: aqua;
  background-color: aqua;
}
</style>
