<template>
  <q-scroll-area style="height: 30vh">
    <q-list>
      <q-item v-for="user in users" :key="user.id" clickable>
        <q-item-section top avatar>
          <q-avatar color="teal" text-color="white">
            <q-badge
              :color="user.type == 2 ? 'green' : 'orange'"
              rounded
              class="absolute-top-left shadow-1"
              >{{ user.type == 2 ? "E" : "M" }}</q-badge
            >
            <img v-if="user.avatar != null" :src="user.avatar" />
            {{ getInitials(user.name) }}
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
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
import { toRef } from "vue";
export default {
  name: "OnlineUsersList",
  props: {
    users: null,
    height: Number,
  },
  setup(props) {
    const usersOnline = toRef(props.users);
    const boxSize = toRef(props.height);
    const getInitials = (name) => {
      return name
        .match(/(\b\S)?/g)
        .join("")
        .match(/(^\S|\S$)?/g)
        .join("")
        .toUpperCase();
    };
    const avatarColors = [
      "teal",
      "teal-1",
      "teal-2",
      "teal-3",
      "teal-4",
      "teal-5",
      "teal-6",
      "teal-7",
      "teal-8",
      "teal-9",
      "teal-10",
      "teal-11",
      "teal-12",
      "teal-13",
      "teal-14",
      "green",
      "green-1",
      "green-2",
      "green-3",
      "green-4",
      "green-5",
      "green-6",
      "green-7",
      "green-8",
      "green-9",
      "green-10",
      "green-11",
      "green-12",
      "green-13",
      "green-14",
      "cyan",
      "cyan-1",
      "cyan-2",
      "cyan-3",
      "cyan-4",
      "cyan-5",
      "cyan-6",
      "cyan-7",
      "cyan-8",
      "cyan-9",
      "cyan-10",
      "cyan-11",
      "cyan-12",
      "cyan-13",
      "cyan-14",
    ];
    const rndColor = () => {
      let color = avatarColors.sort(() => 0.5 - Math.random())[0];
      return color;
    };
    return { usersOnline, boxSize, getInitials, rndColor, avatarColors };
  },
};
</script>
