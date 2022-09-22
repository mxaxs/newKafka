<template>
  <q-card flat class="q-ma-xs q-pa-sm full-height hidde-overflow block myCard">
    <q-input
      outlined
      v-model="searchQuery"
      dense
      label="Filtrar..."
      class="q-mb-sm"
    />
    <q-scroll-area
      style="min-height: 100px; height: 25vh"
      :bar-style="{
        right: '2px',
        borderRadius: '5px',
        width: '3px',
        opacity: 0.8,
      }"
    >
      <q-list v-for="(item, index) in filteredList" :key="index">
        <q-item clickable v-ripple @click="setTM(item)">
          <q-item-section side top>
            <q-icon name="trip_origin" color="primary" size="xs"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ item.sigla }}
            </q-item-label>
            <q-item-label class="text-grey-7">
              {{ item.conclusoes }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator spaced inset />
      </q-list>
    </q-scroll-area>
  </q-card>
</template>

<script>
import { useCoreStore } from "stores/core";
import { inject, ref } from "vue";
import { watchEffect } from "vue";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

export default {
  name: "ListaDeLaudos",
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    filteredList() {
      let self = this;
      return self.cardio.filter(function (item) {
        var searchRegex = new RegExp(self.searchQuery, "i");
        return (
          searchRegex.test(item.sigla) ||
          searchRegex.test(item.ritmo_fq) ||
          searchRegex.test(item.ativacao_atrial) ||
          searchRegex.test(item.ativacao_ventricular) ||
          searchRegex.test(item.conducao_av) ||
          searchRegex.test(item.observacoes) ||
          searchRegex.test(item.conclusoes)
        );
      });
    },
    cardio() {
      return this.coreStore.$state.cardio; //JSON.parse(sessionStorage.getItem("cardio")) ?? [];
    },
  },
  setup() {
    const coreStore = useCoreStore();
    const emitter = inject("emitter");
    const { result } = useQuery(gql`
      query cardio {
        template: nxm_ecg_laudos_templates(where: { default: { _eq: true } }) {
          laudos: json_template
        }
      }
    `);

    let self = this;
    watchEffect(() => {
      if (result.value) {
        const resp = result.value;
        coreStore.$state.cardio = resp.template[0].laudos;
        sessionStorage.setItem(
          "cardio",
          JSON.stringify(resp.template[0].laudos)
        );
      }
    });

    return {
      dataText: "",
      coreStore,
      emitter,
    };
  },

  methods: {
    setTM(item) {
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
      localStorage.setItem("laudo", html);
      this.emitter.emit("setLaudo", html);
      this.searchQuery = "";
    },
  },
};
</script>
<style scoped>
.myCard {
  border-radius: 10px;
  margin-top: 20px;
  width: 98%;
}
</style>
