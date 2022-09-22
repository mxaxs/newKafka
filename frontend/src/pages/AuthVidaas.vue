<template>
  <q-page padding>
    <div class="row fit text-center justify-center">
      <div class="container myCard absolute-center">
        <q-list bordered style="max-width: 350px" class="absolute-center">
          <q-item v-if="(vCode = !null)">
            <q-item-section avatar>
              <q-icon color="black" name="lock" />
            </q-item-section>
            <q-item-section>Autorização Recebida</q-item-section>
          </q-item>
          <q-item v-if="vCode != null">
            <q-item-section avatar>
              <q-icon color="black" name="lock" />
            </q-item-section>
            <q-item-section>Token Solicitado</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { computed } from "vue";
import DataService from "src/common/services/DataService";
import { useCoreStore } from "stores/core";

export default {
  data() {
    return {
      vCode: this.$route?.query.code,
      cpf: localStorage.getItem("current_cpf"),
      token: "",
    };
  },
  mounted() {
    this.vCode = this.$route?.query.code;
    this.cpf = localStorage.getItem("current_cpf");
    this.getToken();
  },
  methods: {
    async getToken() {
      const params = {
        cpf: this.cpf,
        code: this.vCode,
      };
      DataService.getTokenVidaas(params)
        .then((result) => {
          this.token = result.data.access_token;
          window.parent.postMessage("VidaaS-Authorized", "*");
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  setup() {
    const cpf = computed(() => localStorage.getItem("current_cpf"));
    const coreStore = useCoreStore();
    const newCPF = computed(() => coreStore.$state.user.cpf);
    const goMedic = () => $router.push("/medic");
    return { newCPF };
  },
};
</script>
<style lang="css" scoped>
.bg-btn {
  background-color: rgba(255, 255, 255, 0.4);
  filter: blur(0.5);
}
.myCard {
  width: 30vw;
  min-width: 350px;
  height: 35vh;
  min-height: 300px;
  border-radius: 10px;
  border: 1px solid #ffffff;
}
.container {
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.1);
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
  box-shadow: inset 0 0 2000px rgba(255, 255, 255, 0.3);
  filter: blur(10px);
}
.pass-input {
  font-size: 2em;
}
</style>
