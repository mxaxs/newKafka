<template>
  <q-page padding>
    <div class="row-grow">
      <div class="col-grow">
        <q-img
          src="~assets/nexar-avatar-logo.png"
          class="fixed-top q-ma-lg"
          width="56px"
        />
        <q-form>
          <q-card class="myCard container fixed-center">
            <q-card-section class="q-ml-md q-mr-md">
              <div class="text-h4 text-weight-light">Nexar-XM</div>
              <div class="text-subtitle2 relative-position" style="top: -10px">
                by Nexar Systems
              </div>
              <q-input
                autocomplete
                dense
                v-model="email"
                outlined
                type="email"
                class="q-mb-md q-mt-md bg-btn"
                @keydown.enter.prevent="login"
              />
              <q-input
                v-model="password"
                outlined
                class="bg-btn"
                :autocomplete="false"
                dense
                :type="isPwd ? 'password' : 'text'"
                :class="isPwd ? 'pass-input' : ''"
                @keydown.enter.prevent="login"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </q-card-section>
            <q-card-section> </q-card-section>
            <q-card-actions class="absolute-bottom">
              <div class="row justify-center full-width q-px-md">
                <q-btn
                  flat
                  class="text-white shadow-2 bg-btn full-width"
                  @click="login()"
                  >Entrar</q-btn
                >
              </div>
              <div class="row justify-evenly full-width">
                <div
                  class="text-caption text-white q-mt-sm"
                  style="cursor: pointer"
                  @click="firstAccess()"
                >
                  Primeiro acesso
                </div>
                <div
                  class="text-caption text-white q-mt-sm"
                  style="cursor: pointer"
                  @click="resetPass(auth)"
                >
                  Esqueci a senha
                </div>
              </div>
            </q-card-actions>
          </q-card>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useQuasar } from "quasar";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuery, provideApolloClient } from "@vue/apollo-composable";
import gql from "graphql-tag";
import Swal from "sweetalert2";
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getDatabase,
  child,
  get,
  push,
  ref as storageRef,
  update,
  onValue,
  onDisconnect,
} from "firebase/database";
import { useCoreStore } from "src/stores/core";
export default {
  name: "LoginPage",
  data() {
    return {
      isPwd: true,
    };
  },
  setup() {
    const router = useRouter();
    const coreStore = useCoreStore();
    const firstAccess = () => {
      router.push({ path: "/fa" });
    };
    const httpLink = createHttpLink({
      uri: "https://nexarxm.top/v1/graphql",
      headers: {
        "x-hasura-admin-secret": "esteehomeusegred0qu3f01descoberto",
      },
    });
    const cache = new InMemoryCache();
    const apolloClient = new ApolloClient({ link: httpLink, cache });
    provideApolloClient(apolloClient);
    const userGQL = gql`
      query user($email: String!) {
        user: nxm_users(where: { email: { _eq: $email } }) {
          projects
          scope
          phone
          email
          surname
          nodes
          hubs
          name
          doc_id
          doc_uf
          doc_type
          cpf
          access_level
          type
          id
        }
      }
    `;
    const auth = getAuth();
    const $q = useQuasar();
    const options = ref({
      fetchPolicy: "cache-network",
      notifyOnNetworkStatusChange: true,
    });

    /*MOCK DATA*********************/
    const password = ref("7code777");
    const email = ref("node1@nexar.systems");
    const uriQuery = router.currentRoute.value.query;
    console.log("THE URI >>>>>", uriQuery);
    //************************** */

    const nologged = function () {
      $q.dialog({
        dark: true,
        title: "Ooops!",
        message: "Usuário ou Senha inválido(s)",
        ok: {
          flat: true,
        },
      })
        .onOk(() => {
          // console.log('OK')
        })
        .onCancel(() => {
          // console.log('Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    };
    const projectID = ref(0);
    const onlineDB = computed(() => `online/${projectID.value}/`);
    const writeOnline = (id, email, name, type, phone, scope) => {
      const db = getDatabase();
      const starCountRef = storageRef(db, onlineDB.value);
      onValue(starCountRef, (snapshot) => {
        console.log("THE SNAPSHOT DATA>>>>>", snapshot.val());
        const users = snapshot.val();
        if (snapshot) {
          const onlineUsers = [];
          for (const key in users) {
            onlineUsers.push({
              id: key,
              type: users[key].type,
              email: users[key].email,
              phone: users[key].phone,
              name: users[key].name,
              scope: users[key].scope,
              loggedAt: users[key].loggedAt,
            });
            console.log(`${key}: ${users[key].email}`);
          }
          sessionStorage.setItem("onlineUsers", JSON.stringify(onlineUsers));
          coreStore.$state.onlineUsers = onlineUsers;
        } else {
          writeOffline(id);
        }
      });

      const postData = {
        email: email,
        phone: phone,
        name: name,
        type: type,
        loggedAt: Date.now(),
        scope: scope,
      };

      const updates = {};
      const updatesDisconect = {};
      updates[onlineDB.value + id] = postData;
      updatesDisconect[onlineDB.value + id] = null;
      onDisconnect(storageRef(db)).update(updatesDisconect);
      return update(storageRef(db), updates)
        .then(() => {
          const starCountRef = ref(db, onlineDB.value);
        })
        .catch((error) => console.error("THE DB ERROR >>>>", error));
    };
    const writeOffline = async (id) => {
      const db = getDatabase();
      // Write the new post's data simultaneously in the posts list and the user's post list.
      const updates = {};
      updates[onlineDB.value + id] = null;

      update(storageRef(db), updates)
        .then((result) => {
          console.warn("THE DB RESULT >>>>", result);
          return result;
        })
        .catch((error) => {
          console.error("THE DB ERROR >>>>", error);
          return error;
        });
    };
    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const { onResult } = useQuery(
            userGQL,
            { email: user.email },
            options
          );
          onResult((queryResult) => {
            const user = queryResult.data.user[0];
            if (user === undefined) {
              $q.dialog({
                dark: true,
                title: "Ooops!",
                message:
                  "Seu usuário já se encontra cadastrado na plataforma, mas ainda não foi liberado. Por favor, entre em contato com o Administrador e solicite sua liberação.",
                ok: {
                  flat: true,
                },
              }).onOk(() => signOut(auth));
            } else {
              projectID.value = queryResult.data.user[0].projects[0];
              const id = queryResult.data.user[0].doc_id;
              const userType = queryResult.data.user[0].type;
              const email = queryResult.data.user[0].email;
              const phone = queryResult.data.user[0].phone;
              const scope = queryResult.data.user[0].scope;
              const name = `${queryResult.data.user[0].name} ${queryResult.data.user[0].surname}`;
              writeOnline(id, email, name, userType, phone, scope);

              sessionStorage.setItem("loggedUser", JSON.stringify(user));
              sessionStorage.setItem("laudando", "false");
              sessionStorage.setItem("sendExamType", "ECG");
              localStorage.setItem("current_cpf", user.cpf);
              const uPath = navigate(userType);
              router.push({
                path: uPath,
              });
            }
          });
        } else {
          const id = sessionStorage.getItem("loggedUser")
            ? JSON.parse(sessionStorage.getItem("loggedUser"))["doc_id"]
            : null;
          if (id) {
            writeOffline(id);
          }
          sessionStorage.removeItem("loggedUser");
          // User is signed out
          // ...
        }
      });
    });

    const navigate = (type) => {
      var user = {
        1: "/medic",
        2: "/client",
        3: "/requester",
        4: "/project",
        5: "/node",
        6: "/hub",
      };
      return user[type];
    };
    const login = () => {
      setPersistence(auth, browserSessionPersistence)
        .then(() => {
          signInWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
              console.log("THE USER CREDENTIALS >>>>", userCredential);
            })
            .catch((error) => {
              nologged();
              //console.error("THE SHIT!>>>>>", error.code);
              //throw error.code;
            });
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(errorMessage);
        });
    };

    const resetPass = async (auth) => {
      const { value: email } = await Swal.fire({
        title: "Recuperar sua senha",
        input: "email",
        inputLabel: "Digite seu email registrado",
        inputPlaceholder: "Enter your email address",
      });

      if (email) {
        sendPasswordResetEmail(auth, email)
          .then(() => {
            Swal.fire(
              "Recuperação de senha",
              `Email de recuperação enviado para ${email}`
            );
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            Swal.fire(
              "Oooops!",
              `Houve um erro na recuperação de senha:<br/>${errorCode}`,
              "error"
            );
          });
      }
    };

    return {
      nologged,
      auth,
      login,
      email,
      password,
      firstAccess,
      coreStore,
      resetPass,
      onlineDB,
      projectID,
    };
  },
  methods: {},
};
</script>
<style lang="css" scoped>
.bg-btn {
  background-color: rgba(255, 255, 255, 0.4);
  filter: blur(0.5);
}
.myCard {
  width: 30vw;
  min-width: 350px;
  height: 35vh;
  min-height: 300px;
  border-radius: 10px;
  border: 1px solid #ffffff;
}
.container {
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.1);
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
  box-shadow: inset 0 0 2000px rgba(255, 255, 255, 0.3);
  filter: blur(10px);
}
.pass-input {
  font-size: 2em;
}
</style>
