<template>
  <q-card flat class="myCard q-pa-sm" dense>
    <div
      v-if="nome.length == 0"
      class="col-fluid absolute-left q-ml-sm text-grey-4 vertical-middle text-subtitle1"
    >
      <img src="~assets/skell-1.png" class="on-left" />
    </div>
    <q-list v-if="nome" class="q-ma-sm">
      <q-item-section class="text-grey-8 q-ml-sm q-mt-xs">
        <q-item-label class="text-bold">Nome: {{ nome }}</q-item-label>
        <q-item-label
          >Idade: {{ idade || "N.D" }}
          <span v-if="idade">anos</span></q-item-label
        >
        <q-item-label class="wrap">Quadro: {{ exam_motive }}</q-item-label>
        <q-item-label>Observações: {{ obs }}</q-item-label>
      </q-item-section>
    </q-list>
  </q-card>
</template>

<script>
import moment from "moment";
function getAge(bDay) {
  let age =
    bDay == undefined ? 0 : moment().diff(moment(bDay, "DD/MM/YYYY"), "years");
  return age;
}

export default {
  name: "PersonalInfo",
  data() {
    return {
      nome: "",
      idade: "",
      exam_motive: [],
      obs: "",
    };
  },
  mounted() {
    this.emitter.on("setClientXM", () => {
      let user = sessionStorage.getItem("clientXM") ?? null;
      if (user != null) {
        user = JSON.parse(user);
        this.nome = user.nome;
        const age = !user.age ? 0 : user.age;
        this.idade =
          user.birthdate == undefined || user.birthdate == null
            ? user.age
            : getAge(user.birthdate);
        this.exam_motive = user.exam_motive.join(", ");
        this.obs = user.obs;
      }
    });
    this.emitter.on("closeAppraisal", () => {
      this.nome = "";
      this.idade = "";
      this.exam_motive = [];
      this.obs = "";
    });
  },
};
</script>
<style scoped>
.myCard {
  height: 100px;
  border-radius: 10px;
  width: 98%;
}
</style>
