import { defineStore } from "pinia";
import { inject } from "vue";
import emitter from "src/boot/emitter";

function getKey(key) {
  return sessionStorage.getItem(key);
}
export const useCoreStore = defineStore("coreStore", {
  state: () => {
    return {
      TTL: 0,
      iframeCount: 0,
      vidaasLocalization: "",
      vidaasON: false,
      dupefile: false,
      projectName: "",
      onlineUsers: [],
      scale: "page-width",
      loggedUser: {},
      laudando: false,
      clientXM: {},
      allExams: [],
      project: [],
      isAuthenticated: false,
      isReady: false,
      cardio: [],
      appraisedExams: [],
      printedExams: [],
      notPrintedExams: [],
      user: {
        name: "",
        surname: "",
        email: "",
        phone: "",
        access_level: 0,
        cpf: "",
        scope: [""],
        password: "",
        doc_type: "",
        doc_id: "",
        doc_uf: "",
        avatar: "",
        bias: "",
        fbuid: "",
        active: true,
        type: 0,
        projects: [],
        nodes: [],
        hubs: [],
      },
      waiting: 1,
      appraised: 1,
      rejected: 1,
      nodeProjects: [],
      projectUsers: [],
      nodeUsers: [],
      currentProject: {},
      newProject: {},
      newUser: {},
      recentUser: {},
      score: [],
    };
  },

  getters: {
    getScale: (state) => state.scale,
    getLoggedUser: (state) => state.loggedUser ?? getKey("loggedUser"),
    getLaudando: (state) => state.laudando ?? getKey("laudando"),
    getClientXM: (state) => state.clientXM ?? getKey("clientXM"),
    getAllExams: (state) => state.allExams ?? getKey("allExams"),
    getCardio: (state) => state.cardio ?? JSON.parse(getKey("cardio")),
    getAppraisedExams: (state) =>
      state.appraisedExams ?? JSON.parse(getKey("appraisedExams")),
    getPrintedExams: (state) =>
      state.printedExams ?? JSON.parse(getKey("printedExams")),
    getNotPrintedExams: (state) =>
      state.notPrintedExams ?? JSON.parse(getKey("notPrintedExams")),
    getProjectUserById: (state) => {
      return (id) => state.projectUsers.find((user) => user.doc_id === id);
    },
  },

  actions: {
    setVidaasON(value) {
      this.state.vidaasON = value;
    },

    setVidaasLocalization(value) {
      console.log("THE LOCATION >>>", value);
      this.state.vidaasLocalization = value;
    },
    setOnlineUsers(data) {
      this.state.onlineUsers = data;
    },
    setCardio(value) {
      this.state.cardio = value;
    },

    setLoggedUser(value) {
      this.state.loggedUser = value;
      //sessionStorage.setItem("loggedUser", JSON.stringify(value));
    },
    setLaudando(value) {
      this.state.laudando = value;
      sessionStorage.setItem("laudando", value.toString());
    },
    setClientXM(value) {
      this.state.clientXM = value;
      sessionStorage.setItem("clientXM", JSON.stringify(value));
    },
    setAllExams(value) {
      this.allExams = value;
      sessionStorage.setItem("allExams", JSON.stringify(value));
    },

    setAppraisedExams(value) {
      const printed = value.filter((e) => e.printed == true);
      const notPrinted = value.filter((e) => e.printed == false);
      this.appraisedExams = value;
      this.printedExams = printed;
      this.notPrintedExams = notPrinted;
      sessionStorage.setItem("appraisedExams", JSON.stringify(value));
      sessionStorage.setItem("printedExams", JSON.stringify(value));
      sessionStorage.setItem("notPrintedExams", JSON.stringify(value));
    },

    async createNewUser($root, data) {
      const $fb = this.$fb;
      const { email, password } = data;
      return $fb.createUserWithEmail(email, password);
    },
    async loginUser($root, data) {
      const $fb = this.$fb;
      const { email, password } = data;
      return $fb.loginWithEmail(email, password);
    },
    async logoutUser() {
      const $fb = this.$fb;
      await $fb.logoutUser();
    },
    routeUserToAuth() {
      this.$router.push({
        path: "/auth/login",
      });
    },
  },

  mutations: {
    setAuthState(state, data) {
      state.isAuthenticated = data.isAuthenticated;
      state.isReady = data.isReady;
    },
    SET_CARDIO(state, data) {
      this.state.cardio = data;
    },
  },
});
