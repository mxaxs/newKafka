<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin myCard">
      <q-card-section>
        <div class="row full-width text-left">
          <div class="col text-h6 justify-left text-dark text-weight-light">
            <q-icon name="thumb_down" /> Rejeitar Exame
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row full-width">
          <div class="col-grow">
            <q-input
              outlined
              bottom-slots
              v-model="searchQuery"
              label="Buscar"
              dense
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-icon
                  name="close"
                  @click="searchQuery = ''"
                  class="cursor-pointer"
                />
              </template>
            </q-input>
            <q-scroll-area
              style="
                max-height: 500px;
                min-height: 300px;
                height: 40vh;
                border: 1px solid #c0c0c0;
                border-radius: 5px;
              "
            >
              <q-list dense>
                <q-item
                  v-for="item in filteredList"
                  :key="item.id"
                  clickable
                  v-ripple
                  dense
                  :class="item.id == active ? 'bg-secondary' : ''"
                  @click="setOption(item.label, item.id)"
                >
                  <q-item-section>
                    <q-item-label>{{ item.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon size="xs" name="chat_bubble" :color="item.color" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </div>
        </div>
      </q-card-section>
      <!-- buttons example -->
      <q-card-actions align="center">
        <q-btn
          :disable="active == -1"
          outline
          rounded
          size="sm"
          color="primary"
          label="Rejeitar"
          @click="onOKClick"
        />
        <q-btn
          outline
          rounded
          size="sm"
          color="primary"
          label="Cancelar"
          @click="onCancelClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
export default {
  name: "RejectEx",
  props: {},

  emits: [...useDialogPluginComponent.emits],

  data() {
    return {
      msg: "",
      searchQuery: "",
      rejectMain: [
        {
          id: 0,
          label: "Arquivo sem conteúdo/ilegível",
          iconame: "circle",
          color: "red",
        },
        {
          id: 1,
          label: "Troca de eletrodos MSD/MSE",
          iconame: "circle",
          color: "red",
        },
        {
          id: 2,
          label: "Interferência excessiva",
          iconame: "circle",
          color: "red",
        },
        {
          id: 3,
          label: "Troca de eletrodos MSE/MIE",
          iconame: "circle",
          color: "red",
        },
        {
          id: 4,
          label: "Outras trocas de eletrodos",
          iconame: "circle",
          color: "red",
        },
        {
          id: 5,
          label: "Linha de base irregular",
          iconame: "circle",
          color: "red",
        },
        {
          id: 6,
          label: "Mal posicionamento eletrodos pre-cordiais",
          iconame: "circle",
          color: "red",
        },
        {
          id: 7,
          label: "Eletrodo desconectado",
          iconame: "circle",
          color: "red",
        },
        { id: 8, label: "ECG isoelétrico", iconame: "circle", color: "red" },
        {
          id: 9,
          label: "Traçado com amplitude 5 mm/mV",
          iconame: "circle",
          color: "red",
        },
        {
          id: 10,
          label: "Traçado com amplitude 20 mm/mV",
          iconame: "circle",
          color: "red",
        },
        {
          id: 11,
          label: "Traçado com velocidade 12,5 mm/s",
          iconame: "circle",
          color: "red",
        },
        {
          id: 12,
          label: "Traçado com velocidade 50 mm/s",
          iconame: "circle",
          color: "red",
        },
      ],
    };
  },
  setup() {
    const active = ref(-1);
    const message = ref("");
    // REQUIRED; must be called inside of setup()
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    return {
      dialogRef,
      active,
      message,
      onDialogHide,
      onOKClick() {
        // on OK, it is REQUIRED to
        // call onDialogOK (with optional payload)
        onDialogOK({ message: message.value });
        // or with payload: onDialogOK({ ... })
        // ...and it will also hide the dialog automatically
      },
      // we can passthrough onDialogCancel directly
      onCancelClick: onDialogCancel,
      setOption(msg, id) {
        this.active = id;
        this.message = msg;
      },
    };
  },
  computed: {
    filteredList: function () {
      var self = this;
      return self.rejectMain.filter(function (item) {
        var searchRegex = new RegExp(self.searchQuery, "i");
        return searchRegex.test(item.label) || searchRegex.test(item.label);
      });
    },
  },
};
</script>

<style scoped>
.myCard {
  border-radius: 15px;
}
</style>
