<template>
  <div class="q-pa-md q-gutter-md" style="max-width: 350px">
    <div class="text-subtitle1">Laudando neste Projeto</div>
    <q-list bordered separator>
      <q-item
        clickable
        v-ripple
        :active="isOnline(user.doc_id)"
        v-for="user in appraisers"
        :key="user.id"
      >
        <q-item-section avatar>
          <q-icon name="signal_wifi_off" />
        </q-item-section>
        <q-item-section>
          <q-label>
            {{ user.name + " " + user.surname }}
          </q-label>
          <q-label caption lines="2">
            <q-badge
              class="q-mr-xs"
              v-for="(item, index) in user.scope"
              outline
              :key="index"
              color="grey"
            >
              <div style="font-size: 9px">{{ item }}</div>
            </q-badge>
          </q-label>
        </q-item-section>
        <q-item-section thumbnail>
          <q-icon
            color="primary"
            class="q-ma-xs"
            name="remove_circle_outline"
            title="Adicionar ao projeto"
            @click="removeFromProject(user.doc_id, user.projects)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { ref, computed, inject } from "vue";
import { useCoreStore } from "src/stores/core";
export default {
  name: "AppraisersList",
  setup() {
    const emitter = inject("emitter");
    const active = ref(false);
    const isOnline = (id) => onlineUsers.value.some((e) => e.id == id);
    const coreStore = useCoreStore();
    const removeFromProject = (userID, userProjects) => {
      const id = coreStore.$state.currentProject.id;
      const params = { userID: userID, userProjects: userProjects };
      emitter.emit("removeFromProject", params);
      emitter.emit("refetch", id);
    };
    const appraisers = computed(() => {
      const user = coreStore.$state.projectUsers.filter((e) => e.type == 1);
      console.log("THE USERS 1 >>>>", user);
      return user;
    });
    const onlineUsers = computed(() =>
      coreStore.$state.onlineUsers.filter((e) => e.type == 1)
    );
    return {
      active,
      appraisers,
      coreStore,
      isOnline,
      onlineUsers,
      removeFromProject,
    };
  },
};
</script>
