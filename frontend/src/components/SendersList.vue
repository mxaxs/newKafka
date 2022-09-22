<template>
  <div class="q-pa-md q-gutter-md" style="max-width: 350px">
    <div class="text-subtitle1">Enviando neste Projeto</div>
    <q-list bordered separator>
      <q-item
        clickable
        v-ripple
        :active="isOnline(user.doc_id)"
        v-for="user in senders"
        :key="user.id"
      >
        <q-item-section avatar>
          <q-icon name="signal_wifi_off" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ user.name + " " + user.surname }}
          </q-item-label>
        </q-item-section>
        <q-item-section thumbnail>
          <div class="row">
            <q-badge
              class="q-mr-xs"
              v-for="(item, index) in user.scope"
              outline
              :key="index"
              color="grey"
            >
              <div style="font-size: 9px">{{ item }}</div>
            </q-badge>
          </div>
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
  name: "SendersList",
  setup() {
    const active = ref(false);
    const coreStore = useCoreStore();
    const onlineUsers = computed(() =>
      coreStore.$state.onlineUsers.filter((e) => e.type == 2)
    );
    const isOnline = (id) => onlineUsers.value.some((e) => e.id == id);
    const senders = computed(() => {
      const user = coreStore.$state.projectUsers.filter((e) => e.type == 2);
      console.log("THE SENDERS >>>>", user);
      return user;
    });

    return { active, senders, coreStore, onlineUsers, isOnline };
  },
};
</script>
