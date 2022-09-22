<template>
  <div class="q-ma-xs">
    <q-input outlined v-model="searchQuery" label="Buscar" dense>
      <template v-slot:append>
        <q-icon
          size="xs"
          color="secondary"
          name="backspace"
          @click="searchQuery = ''"
          class="cursor-pointer"
        />
      </template>
    </q-input>
  </div>
  <q-scroll-area :style="{ height: boxsize + 'vh' }">
    <q-list>
      <q-item v-for="user in filteredList" :key="user.id" clickable>
        <q-item-section top avatar>
          <q-avatar color="teal-2" class="text-dark">
            <q-badge
              :color="user.type == 2 ? 'green' : 'orange'"
              rounded
              class="absolute-top-left shadow-1"
              >{{ user.type == 2 ? "E" : "M" }}</q-badge
            >
            <img v-if="user.avatar != null" :src="user.avatar" />
            {{ getInitials(user.name, user.surname) }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ user.name }} {{ user.surname }}</q-item-label>
          <q-item-label caption>
            <div class="row">
              <div class="" v-for="item in user.scope" :key="item">
                <q-badge color="secondary" class="q-mr-sm text-dark">{{
                  item
                }}</q-badge>
              </div>
            </div>
          </q-item-label>
          <q-item-label caption>{{ user.phone }}</q-item-label>
          <q-item-label caption>{{ user.email }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script>
import gql from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";
import {
  inject,
  onMounted,
  reactive,
  watchEffect,
  ref,
  toRef,
  computed,
} from "vue";
import { useCoreStore } from "src/stores/core";
import toIntegerOrInfinity from "core-js/internals/to-integer-or-infinity";
import { preFetch } from "quasar/wrappers";
export default {
  name: "ListaUsuario",
  props: {
    boxsize: String,
  },
  created() {
    this.emitter.on("userAdded", () => {
      this.refetch({
        project: 1,
        active: true,
        type: [2, 3],
      });
    });
  },
  setup(props) {
    const emitter = inject("emitter");
    const getInitials = (name, surname) => {
      const fullname = name + " " + surname;
      return fullname
        .match(/(\b\S)?/g)
        .join("")
        .match(/(^\S|\S$)?/g)
        .join("")
        .toUpperCase();
    };
    const rndColor = () => {
      let color = avatarColors.sort(() => 0.5 - Math.random())[0];
      return color;
    };
    const boxsize = toRef(props);
    const searchQuery = ref("");
    const defaultAvatar = "https://i.pravatar.cc/300";
    const users = ref(null);
    const coreStore = useCoreStore();
    const filteredList = computed(() => {
      if (!users.value) return [];
      return users.value.filter(function (item) {
        var searchRegex = new RegExp(searchQuery.value, "i");
        return (
          searchRegex.test(item.name) ||
          searchRegex.test(item.surname) ||
          searchRegex.test(item.scope) ||
          searchRegex.test(item.email) ||
          searchRegex.test(item.phone)
        );
      });
    });

    const variables = reactive({
      project: 1,
      active: true,
      type: [2, 3],
    });

    const { result, refetch, error } = useQuery(
      gql`
        query users($project: jsonb!, $active: Boolean!, $type: [Int!]) {
          users: nxm_users(
            where: {
              projects: { _contains: $project }
              active: { _eq: $active }
              type: { _in: $type }
            }
            order_by: { name: asc }
          ) {
            id
            name
            surname
            phone
            email
            doc_id
            type
            avatar
            scope
          }
        }
      `,
      variables
    );

    watchEffect(() => {
      if (result.value) {
        const resp = result.value;
        coreStore.$state.users = resp.users;
        users.value = resp.users;
      }
    });
    onMounted(() => {
      variables.active = true;
      variables.project = JSON.parse(sessionStorage.getItem("loggedUser"))[
        "projects"
      ];
      variables.type = [2, 3];
    });
    return {
      users,
      defaultAvatar,
      filteredList,
      searchQuery,
      getInitials,
      emitter,
      refetch,
    };
  },
};
</script>
<style scoped>
.teamCard {
  border-radius: 10px;
  border: 1px solid #eee;
  background-color: white;
  cursor: pointer;
}
</style>
