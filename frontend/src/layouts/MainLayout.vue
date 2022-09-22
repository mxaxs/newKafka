<template>
  <q-layout view="lHh Lpr lFf" class="overflow-hidden no-scroll">
    <q-header>
      <q-toolbar :class="isMedic ? 'bg-grey-2' : 'bg-white'" class="text-dark">
        <q-toolbar-title>
          <span v-if="isMedic">Central de Laudos</span>
          <span v-else>
            <div
              v-if="currentPath != '/project' && currentPath != '/node'"
              class="row full-width justify-center text-caption"
            >
              <q-btn-toggle
                size="sm"
                v-model="sendExam"
                class="my-custom-toggle relative-position"
                no-caps
                unelevated
                rounded
                toggle-color="primary"
                color="white"
                text-color="text-dark"
                :options="optExams"
                @click="sendExamType()"
              />
              <div class="q-ml-sm" v-if="$q.platform.is.mobile">
                <q-btn
                  outline
                  rounded
                  color="primary"
                  icon="logout"
                  @click="logout()"
                />
              </div>
            </div>

            <div v-else>
              <div class="text-h5 q-ml-md">Projeto {{ projectName }}</div>
            </div>
          </span>
        </q-toolbar-title>
        <div>NexarXM v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      mini
      class="q-px-sm q-mt-md"
      :mini-width="80"
    >
      <img src="~assets/nexar-avatar-logo.png" alt="NexarXM" />
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>

      <div class="fixed-bottom q-mb-xl text-center" v-if="isMedic">
        <q-avatar
          v-if="vidaasON"
          class="q-my-lg"
          style="cursor: pointer"
          title="VidaaS"
          @click="showTTL()"
        >
          <q-img src="~assets/vidaas_logo_120.png" />
        </q-avatar>
        <q-avatar v-else class="q-my-lg" style="cursor: pointer" title="VidaaS">
          <q-img src="~assets/vidaas_logo_120_off.png" />
          <q-menu
            touch-position
            transition-show="flip-right"
            transition-hide="flip-left"
            clear-fix
          >
            <q-list padding style="max-width: 200px" class="q-ml-sm">
              <q-item>
                <q-item-section>
                  <div class="text-h6 text-teal">Duração</div>
                  <q-item-label caption
                    >Defina a duração da ativação da sessão de assinaturas.
                  </q-item-label>
                </q-item-section>
                <q-separator color="teal" inset />
              </q-item>
              <q-item clickable v-ripple v-close-popup @click="getVidaas(7200)">
                <q-item-section avatar class="q-pt-xs">
                  <q-icon name="alarm" size="xs" class="q-mr-xs" />
                </q-item-section>
                <q-item-section> 02 horas </q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                v-close-popup
                @click="getVidaas(14400)"
              >
                <q-item-section avatar class="q-pt-xs">
                  <q-icon name="alarm" size="xs" class="q-mr-xs" />
                </q-item-section>
                <q-item-section> 04 horas </q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                v-close-popup
                @click="getVidaas(21600)"
              >
                <q-item-section avatar class="q-pt-xs">
                  <q-icon name="alarm" size="xs" class="q-mr-xs" />
                </q-item-section>
                <q-item-section> 06 horas </q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                v-close-popup
                @click="getVidaas(28800)"
              >
                <q-item-section avatar class="q-pt-xs">
                  <q-icon name="alarm" size="xs" class="q-mr-xs" />
                </q-item-section>
                <q-item-section> 08 horas </q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                v-close-popup
                @click="getVidaas(36000)"
              >
                <q-item-section avatar class="q-pt-xs">
                  <q-icon name="alarm" size="xs" class="q-mr-xs" />
                </q-item-section>
                <q-item-section> 10 horas </q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                v-close-popup
                @click="getVidaas(43200)"
              >
                <q-item-section avatar class="q-pt-xs">
                  <q-icon name="alarm" size="xs" class="q-mr-xs" />
                </q-item-section>
                <q-item-section> 12 horas </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-avatar>
      </div>
      <div class="fixed-bottom q-mb-md text-center">
        <q-btn
          outline
          rounded
          color="primary"
          icon="logout"
          @click="logout()"
        />
      </div>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import {
  defineComponent,
  onMounted,
  computed,
  ref,
  inject,
  onUnmounted,
} from "vue";
import { useQuasar } from "quasar";
import EssentialLink from "components/EssentialLink.vue";
import { sha256, sha224 } from "js-sha256";
import { useRouter } from "vue-router";
import gql from "graphql-tag";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useCoreStore } from "src/stores/core";
import DlgVidaasVue from "src/components/DlgVidaas.vue";
import DataService from "src/common/services/DataService";
import Swal from "sweetalert2";

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "code",
    link: "#",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },
  methods: {
    /*getCodeChallenge() {
      const code_verifier = "2333333";
      //const code_challenge = btoa(sha256(code_verifier));
      //console.warn("THE CODE CHALLENGE >>>", code_challenge);
    },*/
  },
  data() {
    return {};
  },
  mounted() {},
  setup() {
    const polling = ref();
    const vidaasON = ref(false);
    const coreStore = useCoreStore();
    const currentPath = ref("");
    const sendExam = ref("");
    const isMedic = ref(false);
    const auth = getAuth();
    const router = useRouter();
    const emitter = inject("emitter");
    const optExams = [
      { label: "ECG", value: "ECG" },
      { label: "EEG", value: "EEG" },
      { label: "DMD", value: "DMD" },
    ];
    const changeExamType = () => {
      emitter.emit("changeExamType");
    };

    const showTTL = () => emitter.emit("showTTL");

    const getVidaas = (duration) => {
      coreStore.$state.TTL = duration;
      emitter.emit("getVidaas", duration);
    };

    const setIntervalAsync = (fn, ms) => {
      fn().then(() => {
        polling.value = setTimeout(() => setIntervalAsync(fn, ms), ms);
      });
    };
    const leftDrawerOpen = ref(false);
    const q = useQuasar();
    const sendExamType = function () {
      sessionStorage.setItem("sendExamType", sendExam.value);
      changeExamType();
    };
    const getExamType = function () {
      const se = sessionStorage.getItem("sendExamType") ?? "ECG";
      sendExam.value = se;
    };
    const logout = () => auth.signOut();
    onMounted(() => {
      currentPath.value = router.currentRoute.value.path;
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // ...
        } else {
          sessionStorage.clear();
          router.replace({ path: "/" });
          // User is signed out
          // ...
        }
      });

      const loggedUser = sessionStorage.getItem("loggedUser");
      //if (!loggedUser) this.$router.push("/");
      const jsonUser = JSON.parse(loggedUser);
      localStorage.setItem("current_cpf", jsonUser["cpf"]);
      isMedic.value = jsonUser["type"] == 1;

      console.warn("IS THIS MEDIS? >>>>>", isMedic.value);
      console.warn("THE ROUTE >>>>>", router.currentRoute.value.path);
      if (!isMedic.value) getExamType();
      if (isMedic.value) {
        const data = { cpf: jsonUser.cpf };
        setIntervalAsync(async () => {
          try {
            DataService.heartbeat(data).then((result) => {
              vidaasON.value = result.data.status;
              if (vidaasON.value == true) {
                emitter.emit("startDsTimer");
              } else {
                emitter.emit("stopDsTimer");
              }
              coreStore.$state.vidaasON = vidaasON.value;
              sessionStorage.setItem("vidaasON", vidaasON.value);
            });
          } catch (error) {
            emitter.emit("stopDsTimer");
            Swal.fire("Erro checando validade do Certificado", error);
          }
        }, 3000);
      }
    });
    onUnmounted(() => clearTimeout(polling.value));
    const projectName = computed(
      () => coreStore.$state.projectName[0]?.name ?? ""
    );

    return {
      emitter,
      minutes: ref("00"),
      seconds: ref("00"),
      sendExam,
      isMedic,
      changeExamType,
      getVidaas,
      essentialLinks: linksList,
      sendExamType,
      getExamType,
      leftDrawerOpen,
      optExams,
      currentPath,
      projectName,
      showTTL,
      polling,
      vidaasON,
      q,
      coreStore,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      logout,
    };
  },
});
</script>
<style scoped>
.my-custom-toggle {
  border: 1px solid teal;
}
</style>
