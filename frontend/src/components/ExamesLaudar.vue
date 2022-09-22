<template>
  <div v-if="open"></div>
  <div class="col-fluid text-center">
    <q-card flat class="q-mx-sm otherCard glossy text-white">
      <div class="row-fluid">
        <span class="q-mr-md">{{ minutes }}:{{ seconds }}</span>
        <span class="q-pb-md" @click="resetTimer()">
          <q-btn
            class="text-end self-center q-mb-xs"
            dense
            rounded
            size="sm"
            color="white"
          >
            <q-icon color="primary" name="alarm" />
          </q-btn>
        </span>
      </div>
    </q-card>
  </div>
  <q-card flat class="myCard q-mx-sm">
    <div class="text-center text-subtitle1 text-weight-light q-pt-md">
      Exames para Laudar
    </div>
    <div
      class="text-center text-caption text-grey no-padding q-mb-md relative-position"
      style="top: -8px"
    >
      {{ exams.length ?? 0 }} exames
    </div>
    <q-banner dense rounded v-if="locked == true" class="bg-teal text-white">
      <template v-slot:avatar>
        <q-icon name="fingerprint" color="white" />
      </template>
      Sua sessão de assinaturas expirou.<br />Autentique-se novamente e
      continue.
    </q-banner>
    <q-scroll-area
      style="height: 73vh"
      :bar-style="{
        right: '2px',
        borderRadius: '5px',
        width: '3px',
        opacity: 0.8,
      }"
    >
      <q-list
        v-for="(item, index) in exams"
        :key="index"
        :class="locked == true ? 'light-dimmed' : ''"
      >
        <q-item clickable v-ripple dense @click="setClientXM(item)">
          <q-item-section side top>
            <q-icon
              name="trip_origin"
              :color="item.priority == 1 ? 'orange-2' : 'teal-2'"
              size="xs"
            ></q-icon>
            <q-icon
              name="more_vert"
              :color="item.priority == 1 ? 'orange' : 'primary'"
              size="xs"
            ></q-icon>
            <q-icon
              name="trip_origin"
              :color="item.priority == 1 ? 'orange' : 'primary'"
              size="xs"
            ></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-teal"
              >{{ getDate(item.created) }}
              <q-badge
                v-if="item.priority == 1"
                color="orange-3"
                text-color="black"
                label="urgente"
                class="q-ml-sm"
              />
            </q-item-label>
            <q-item-label lines="2">
              <div v-for="(motivo, index) in item.exam_motive" :key="index">
                <span>{{ motivo }}</span
                ><br />
              </div>
            </q-item-label>
            <q-item-label caption>
              <div>{{ item.nome }}</div>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator spaced inset />
      </q-list>
    </q-scroll-area>
  </q-card>
</template>

<script>
import { ref, inject } from "vue";
import { useCoreStore } from "stores/core";
import { date } from "quasar";
import gql from "graphql-tag";
export default {
  name: "ExamesLaudar",
  data() {
    return {
      exams: [],
    };
  },
  apollo: {
    exams: {
      query: gql`
        query exams($projects: [Int!], $status: Int!, $categories: [String!]) {
          exams: nxm_exams(
            where: {
              project: { _in: $projects }
              status: { _eq: $status }
              category: { _in: $categories }
            }
            order_by: { priority: asc, created: asc }
          ) {
            birthdate
            category
            created
            crm_origin
            exam
            exam_motive
            hd
            id
            medic_name
            nome
            obs
            priority
            sex
          }
        }
      `,
      pollInterval: 10000,
      variables() {
        return {
          status: 1,
          projects: this.examparams["projects"],
          categories: this.examparams["categories"],
        };
      },
      update: (data) => {
        sessionStorage.setItem("allExams", JSON.stringify(data.exams));
        return data.exams;
      },
    },
  },
  setup() {
    const emitter = inject("emitter");
    const lock = ref(false);
    return {
      layout: ref("dense"),
      side: ref("right"),
      coreStore: useCoreStore(),
      emitter,
      minutes: ref("00"),
      seconds: ref("00"),
      open: ref(true),
      lock,
    };
  },
  mounted() {
    this.emitter.on("countDown", (e) => {
      this.minutes = e.minutes;
      this.seconds = e.seconds;
    });
    this.emitter.on("laudando", (e) => {
      this.lock = e.value;
    });
  },
  computed: {
    allExams() {
      return this.coreStore.getAllExams;
    },
    examparams() {
      const json = JSON.parse(sessionStorage.getItem("loggedUser"));
      const arrProj = json.projects;
      const arrCategories = json.scope;
      return { projects: arrProj, categories: arrCategories };
    },
    locked() {
      return !this.coreStore.$state.vidaasON;
    },
  },
  methods: {
    resetTimer() {
      this.emitter.emit("startTimer");
    },
    getDate(itemDate) {
      const formated = date.formatDate(itemDate, "DD-MM HH:mm");
      return formated;
    },
    setClientXM(item) {
      const jsonItem = JSON.stringify(item);
      sessionStorage.setItem("clientXM", jsonItem);
      sessionStorage.setItem("examfile", item.exam);
      console.log("THE ITEM ID >>>>", item.id);
      this.emitter.emit("lockexam", {
        id: item.id,
        lock: true,
        bypass: false,
      });
      this.emitter.emit("setClientXM");
      this.emitter.emit("startTimer");
      this.lock = true;
    },
    lockExam(id, status) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation lockExam($status: Int!, $id: Int!) {
              update_nxm_exams(
                where: { id: { _eq: $id } }
                _set: { status: $status }
              ) {
                affected_rows
              }
            }
          `,
          variables: {
            id: id,
            status: status,
          },
        })
        .then((data) => {
          console.log(data);
        });
    },
  },
};
</script>
<style scoped>
.myCard {
  width: 98%;
  height: "90vh";
  border-radius: 10px;
  position: relative;
  top: -2vh;
}
.otherCard {
  width: 80%;
  height: 56px;
  border-radius: 10px;
  position: relative;
  align-self: center;
  background: teal;
  vertical-align: middle;
  display: inline-block;
  align-content: center;
  font-size: 28px;
}
</style>
