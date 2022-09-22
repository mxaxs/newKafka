<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <div class="q-pa-md row dlgUpload justify-center">
      <iframe
        :src="vidaasLocation"
        frameborder="0"
        height="550px"
        width="420px"
        @load="loadFrame()"
        ref="frame"
      ></iframe>
    </div>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent } from "quasar";
import { onMounted, onBeforeUnmount, computed, inject, ref } from "vue";
import { useCoreStore } from "src/stores/core";

export default {
  emits: [...useDialogPluginComponent.emits],
  setup() {
    const frame = ref(null);
    const emitter = inject("emitter");
    const coreStore = useCoreStore();
    const onOKClick = () => onDialogOK();
    const onCancelClick = () => onDialogCancel();
    const receiveMessage = (event) => {
      const message = event.data;
      console.log("THE MESSAGE >>>>> ", message);
      if (message == "VidaaS-Authorized") {
        emitter.emit("startDsTimer");
        onOKClick();
      } else {
        console.log("THE MESSAGE CANCEL >>>>> ", message);
        onCancelClick();
      }
    };
    const loadFrame = () => {
      coreStore.$state.iframeCount++;
      if (coreStore.$state.iframeCount == 3) {
        frame.value.src = "about:blank";
        coreStore.$state.iframeCount = 0;
        console.log("<<<<< LOAD-FRAME CANCEL >>>>>");
        onCancelClick();
      }
    };
    const vidaasLocation = computed(() => coreStore.$state.vidaasLocalization);
    // REQUIRED; must be called inside of setup()
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();

    onMounted(() => {
      window.addEventListener("message", receiveMessage);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("message", receiveMessage);
    });
    return {
      coreStore,
      dialogRef,
      vidaasLocation,
      onDialogHide,
      onOKClick,
      onCancelClick,
      frame,
      loadFrame,
    };
  },
};
</script>
<style scoped>
.btn-grad {
  background-image: linear-gradient(
    to right,
    #ece9e6 0%,
    #ffffff 51%,
    #ece9e6 100%
  );
  transition: 0.5s;
  background-size: 200% auto;
  border-radius: 10px;
  border: 1px solid rgb(203, 199, 199);
}
.btn-grad:hover {
  background-position: right center; /* change the direction of the change here */
  color: rgb(85, 82, 82);
  text-decoration: none;
}
.btn-grad:hover {
  background-position: right center; /* change the direction of the change here */
  color: rgb(85, 82, 82);
  text-decoration: none;
}
.btn-grad:hover {
  background-position: right center; /* change the direction of the change here */
  color: rgb(85, 82, 82);
  text-decoration: none;
}
.addCards {
  border-radius: 10px;
  height: 120px;
  width: 100px;
  box-shadow: 0px 0px 5px #eee;
  cursor: pointer;
}
.addCardTitle {
  font-size: 14px;
  line-height: 0.9;
}
.scoreCard {
  border-radius: 10px;
  background-color: white;
  cursor: pointer;
  max-width: 750px;
}
.scoreItem {
  font-size: 10px;
}
.teamCard {
  border-radius: 10px;
  border: 1px solid #eee;
  background-color: white;
  cursor: pointer;
}

.dlgUpload {
  min-width: 480px;
  border-radius: 20px;
  border: 2px solid #ffffff;
}
.myCard {
  width: 55%;
  max-width: 80%;
  height: 30vh;
  border-radius: 20px;
  border: 2px solid #ffffff;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
}
.stepH {
  min-height: 268px;
}
.myType {
  border: 1px solid primary;
}
</style>
