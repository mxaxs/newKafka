<template>
  <q-card class="fit q-pl-md">
    <q-avatar
      size="50px"
      font-size="40px"
      text-color="white"
      class="absolute-right q-mt-md q-mr-xl"
    >
      <q-img src="~assets/PDF_Icon_96.png" />
    </q-avatar>
    <q-card-section>
      <div class="text-h6 text-dark">{{ message.paciente[1].value }}</div>
      <div class="text-secondary">
        {{ message.paciente[0].label }} {{ message.paciente[0].value }}
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div
        class="text-caption text-dark text-weight-thin q-ml-md q-mr-lg q-mb-sm"
      >
        Dados do Paciente
      </div>
      <div class="b-box text-dark q-mr-md">
        <div
          class="full-width row no-wrap justify-start items-start content-start"
          v-for="(item, index) in message.detalhes"
          :key="index"
        >
          <div class="col-3 self-start q-ml-md">{{ item.label }}:</div>
          <div class="col-grow self-start">{{ item.value }}</div>
        </div>
      </div>
    </q-card-section>
    <q-separator class="q-mb-sm" />
    <q-card-section>
      <div
        class="text-subtitle1 text-weight-thin q-mb-md q-ml-md text-dark"
        style="line-height: 96%"
      >
        Motivo(s) para o exame<br />
        <span class="text-weight-light text-caption no-padding"
          >Por favor, informe o(s) motivo(s) para o exame.</span
        >
      </div>
      <div class="row-grow" style="height: 100px">
        <div class="col"></div>
        <div class="col">
          <q-select
            class="text-dark s-box"
            outlined
            dense
            v-model="model"
            use-input
            use-chips
            multiple
            input-debounce="0"
            @new-value="createValue"
            :options="filterOptions"
            @filter="filterFn"
            style="width: 80%"
          />
        </div>
        <div class="col"></div>
      </div>
    </q-card-section>
    <q-separator />
    <!-- buttons example -->
    <q-card-actions align="right" class="q-mr-md">
      <q-btn flat color="primary" label="Enviar" @click="onOKClick" />
      <q-btn flat color="primary" label="Cancelar" @click="onCancelClick" />
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref } from "vue";
const stringOptions = [
  "Taquicardia",
  "Dispnéia",
  "Palpitações",
  "Desmaios",
  "Formigamento MS",
  "Formigamento MI",
];
export default {
  name: "dialogComp",
  props: ["message"],
  data() {
    return {
      objExam: {},
    };
  },
  mounted() {
    //this.objExam = JSON.parse(this.message);
    //console.log(this.message.paciente[1].label);
    //console.log(this.message.paciente[1].value);
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
  },
  setup() {
    const filterOptions = ref(stringOptions);

    return {
      model: ref(null),
      filterOptions,
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
    };
  },
};
</script>
<style>
.myCard {
  width: 80%;
  max-width: 80%;
  height: 50vh;
  border-radius: 20px;
  border: 1px solid primary;
  background-color: white;
  position: relative;
  background-size: 40%;
  background-repeat: no-repeat;
  background-position: center;
}
.q-dialog__backdrop {
  backdrop-filter: blur(5px);
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
  border-radius: 10px;
  position: relative;
  margin: auto;
}
</style>
