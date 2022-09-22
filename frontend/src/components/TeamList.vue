<template>
  <div class="q-pa-md q-gutter-md" style="max-width: 350px">
    <div class="text-subtitle1">Time Médico</div>
    <q-list bordered separator>
      <q-item
        v-ripple
        :active="isOnline(user.doc_id)"
        v-for="user in medics"
        :key="user.id"
      >
        <q-item-section avatar>
          <q-icon name="person" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ user.name + " " + user.surname }}
          </q-item-label>
          <q-item-label caption lines="2">
            <q-badge
              class="q-mr-xs"
              v-for="(item, index) in user.scope"
              outline
              :key="index"
              color="grey"
            >
              <div style="font-size: 9px">{{ item }}</div>
            </q-badge>
          </q-item-label>
        </q-item-section>
        <q-item-section thumbnail>
          <q-icon
            color="primary"
            class="q-ma-xs"
            name="add_circle_outline"
            title="Adicionar ao projeto"
            @click="addToProject(user.doc_id)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted } from "vue";
import { useCoreStore } from "src/stores/core";
import moment from "moment";
export default {
  name: "TeamList",
  setup() {
    const emitter = inject("emitter");
    const active = ref(false);
    const coreStore = useCoreStore();
    const onlineUsers = computed(() =>
      coreStore.$state.onlineUsers.filter((e) => e.type == 2)
    );
    const addToProject = (userID) => {
      emitter.emit("addToProject", userID);
      const id = coreStore.$state.currentProject.id;
      emitter.emit("refetch", id);
    };
    const isOnline = (id) => onlineUsers.value.some((e) => e.id == id);
    const medics = computed(() => {
      const user = coreStore.$state.nodeUsers.filter((e) => e.type == 1);
      return user;
    });

    return { active, medics, coreStore, onlineUsers, isOnline, addToProject };
  },
};
</script>
