<template>
  <div class="row-grow">
    <div bordered class="col gradBG text-white teamCard" style="height: 50vh">
      <q-scroll-area class="full-height">
        <q-list bordered>
          <q-expansion-item
            dark
            v-for="(project, index) in projectList"
            @show="setProject(project.id)"
            :key="project.id"
            :default-opened="index == 0"
            group="projects"
            icon="contact_mail"
            :label="project.project_name"
            :caption="`Responsável:  ${project.project_contact_name}`"
          >
            <q-card class="teamCard q-pa-md container text-dark q-ma-sm">
              <div class="text-subtitle1 text-dark cardTitle q-px-md">
                Tempo de espera: {{ ellapsed }} minutos
              </div>
              <q-card-section>
                <q-tabs
                  v-model="tab"
                  narrow-indicator
                  dense
                  align="justify"
                  class="text-dark"
                >
                  <q-tab
                    :ripple="false"
                    name="ecg"
                    icon="favorite_border"
                    label="ECG"
                    @click="rescore('ECG')"
                  />
                  <q-tab
                    :ripple="false"
                    name="eeg"
                    icon="psychology"
                    label="EEG"
                    @click="rescore('EEG')"
                  />
                  <q-tab
                    :ripple="false"
                    name="esp"
                    icon="record_voice_over"
                    label="ESP"
                    @click="rescore('ESP')"
                  />
                  <q-tab
                    :ripple="false"
                    name="dmd"
                    icon="soap"
                    label="DMD"
                    @click="rescore('DMD')"
                  />
                </q-tabs>
                <div class="row full-width text-center">
                  <div class="col">
                    <div class="row-grow scoreCounter">
                      {{ waiting.toString().padStart(2, "0") }}
                    </div>
                    <div class="row-grow relative-position" style="top: -15px">
                      aguardando
                    </div>
                  </div>
                  <div class="col">
                    <div class="row-grow scoreCounter">
                      {{ appraised.toString().padStart(2, "0") }}
                    </div>
                    <div class="row-grow relative-position" style="top: -15px">
                      laudado
                    </div>
                  </div>
                  <div class="col">
                    <div class="row-grow scoreCounter">
                      {{ rejected.toString().padStart(2, "0") }}
                    </div>
                    <div class="row-grow relative-position" style="top: -15px">
                      rejeitado
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </div>
  </div>
  <div class="row-grow">
    <div class="col q-pa-sm teamCard">
      <div class="row full-width bg-white">
        <div class="col-4">Projeto:</div>
        <div class="col-grow q-ml-md">{{ currentProject.project_name }}</div>
      </div>
      <div class="row full-width bg-white">
        <div class="col-4">Responsável:</div>
        <div class="col-grow q-ml-md">
          {{ currentProject.project_contact_name }}
        </div>
      </div>
      <div class="row full-width bg-white">
        <div class="col-4">Email:</div>
        <div class="col-grow q-ml-md">
          {{ currentProject.project_contact_email }}
        </div>
      </div>
      <div class="row full-width bg-white">
        <div class="col-4">Telefone:</div>
        <div class="col-grow q-ml-md">
          {{ currentProject.project_contact_phone }}
        </div>
      </div>
      <div class="row q-mt-md full-width text-center justify-center">
        <div class="text-subtitle1 text-weight-light">Exames Habilitados</div>

        <q-option-group
          inline
          :options="optExams"
          type="toggle"
          v-model="scope"
        />
      </div>
    </div>
    <div class="col q-mt-md text-center justify-center">
      <q-btn-group spread>
        <q-btn color="primary" glossy icon="person" @click="newMedic()" />
        <q-btn
          color="primary"
          glossy
          icon="medical_services"
          @click="newProject()"
        />
      </q-btn-group>
    </div>
  </div>
</template>

<script>
import { computed, ref, inject } from "vue";
import { useCoreStore } from "src/stores/core";

export default {
  name: "ProjectList",
  data() {
    return {};
  },

  setup() {
    const emitter = inject("emitter");
    const tab = ref("ecg");
    const active = ref(false);
    const currentProjectID = ref(0);
    const ellapsed = computed(() => coreStore.$state.ellapsed);
    const optExams = ref([
      { label: "ECG", value: "ECG" },
      { label: "EEG", value: "EEG" },
      { label: "ESP", value: "ESP" },
      { label: "DMD", value: "DMD" },
    ]);
    const coreStore = useCoreStore();
    const projectList = computed(() => coreStore.$state.nodeProjects);
    const currentProject = computed(() => coreStore.$state.currentProject);
    const scope = computed(() => coreStore.$state.currentProject.scope);
    const score = computed(() => {
      const scor =
        coreStore.$state.score.length == 0
          ? [
              { status: 0, total: 0 },
              { status: 1, total: 0 },
              { status: 2, total: 0 },
            ]
          : coreStore.$state.score;
      return scor;
    });
    const waiting = computed(() => coreStore.$state.waiting);
    const appraised = computed(() => coreStore.$state.appraised);
    const rejected = computed(() => coreStore.$state.rejected);

    const setProject = (id) => {
      emitter.emit("refetch", id);
      const curProject = projectList.value.find((e) => e.id == id);
      currentProjectID.value = id;
      coreStore.$state.currentProject = curProject;
      scope.value = curProject.scope;
    };
    const rescore = (category) => {
      const id = coreStore.$state.currentProject.id;
      const params = { id: id, category: category };
      emitter.emit("rescore", params);
    };

    const newProject = () => {
      emitter.emit("newProject");
    };
    const newMedic = () => {
      emitter.emit("newUser");
    };

    return {
      coreStore,
      projectList,
      tab,
      active,
      setProject,
      currentProject,
      newProject,
      newMedic,
      scope,
      score,
      rescore,
      optExams,
      ellapsed,
      waiting,
      appraised,
      rejected,
    };
  },
};
</script>

<style scoped>
.container {
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 1;
  background: inherit;
  overflow: hidden;
}

.container:before {
  content: "";
  position: absolute;
  background: inherit;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: inset 0 0 2000px rgba(255, 255, 255, 0.8);
  filter: blur(10px);
}

.scoreCounter {
  font-size: 2.5rem;
}
.gradBG {
  background-color: #0093e9;
  background-image: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
}
</style>
