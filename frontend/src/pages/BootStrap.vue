<template>
  <q-page padding>
    <div class="row-grow">
      <div class="col-grow">
        <q-img
          src="~assets/nexar-avatar-logo.png"
          class="fixed-top q-ma-lg"
          width="56px"
          @click="window.location.href = '/'"
        />
        <q-form>
          <q-card
            class="myCard fixed-center"
            style="max-width: 640px; overflow: scroll"
          >
            <q-btn flat to="/" label="voltar" size="sm" />
            <q-card-section class="q-ml-md q-mr-md">
              <div class="text-h4 text-weight-light">Termos de Uso</div>
              <div class="row full-width">
                <div class="col">
                  <div class="text-subtitle1 no-padding">
                    Acesso ao Sistema, Senha e Segurança
                  </div>
                  <q-scroll-area
                    style="height: 25vh; width: 90%"
                    class="q-mt-md"
                  >
                    <div>
                      <q-list class="q-px-md">
                        <q-item>
                          <q-item-section
                            side
                            top
                            class="q-mr-sm subtitle2 text-weight-bold"
                            >1.</q-item-section
                          >
                          As informações Gerenciadas pelo NexarXM são protegidas
                          por lei. E segue as determinações orientadas pela
                          LGPD. Tendo como finalidade viabilizar o transito de
                          informações de exames eletrônicos. O usuário CONCORDA
                          EM NÃO DIVULGAR quaisquer informações transitadas,
                          online ou impressas, que possa ter acesso através do
                          NexarXM.
                        </q-item>
                        <q-item>
                          <q-item-section
                            side
                            top
                            class="q-mr-sm subtitle2 text-weight-bold"
                            >2.</q-item-section
                          >
                          Ao realizar o Cadastro, o Usuário deverá informar seu
                          próprio endereço eletrônico, que será utilizado para
                          sua identiﬁcação na Plataforma NexarXM e para o
                          recebimento de mensagens advindas de seu cadastro na
                          mesma.<br />O Usuário deverá também criar uma senha,
                          sendo inteiramente responsável pela conﬁdencialidade e
                          segurança da sua senha, bem como de qualquer atividade
                          que ocorra no âmbito de seu Cadastro. O Usuário poderá
                          alterar sua senha a qualquer momento. Tanto o endereço
                          eletrônico informado pelo Usuário quanto a senha por
                          ele criada SERÃO UTILIZADAS SOMENTE para a sua
                          identiﬁcação e permissão de acesso ã Plataforma
                          NexarXM, estando excluídos quais outros usos que não
                          estes.
                        </q-item>
                      </q-list>
                    </div>
                  </q-scroll-area>
                  <div class="q-mt-lg row full-width q-ml-xl q-pl-lg text-red">
                    <q-checkbox
                      size="lg"
                      dense
                      v-model="agree"
                      class="frosted"
                      label="Li e Concordo com os Termos de Uso do Sistema"
                      checked-icon="task_alt"
                      unchecked-icon="radio_button_unchecked"
                    />
                  </div>
                </div>
              </div>
              <div
                v-if="agree"
                class="row full-width justify-center q-px-xl q-gutter-sm q-my-md"
              >
                <div class="col">
                  <q-input
                    placeholder="Digite seu email"
                    autocomplete
                    dense
                    v-model="email"
                    outlined
                    type="email"
                    hint="Será usado para seus logins"
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="password"
                    outlined
                    :autocomplete="false"
                    dense
                    :type="isPwd ? 'password' : 'text'"
                    hint="Senha maior que 6 caracteres"
                    :class="isPwd ? 'pass-input' : ''"
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>
            <q-card-actions class="">
              <div class="row justify-center full-width" v-if="agree">
                <q-btn outline rounded @click="insertFB()"
                  >CRIAR USUÁRIO E LOGAR</q-btn
                >
              </div>
            </q-card-actions>
          </q-card>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { Notify } from "quasar";
import { useRouter } from "vue-router";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
export default {
  name: "FirstAccess",
  setup() {
    const auth = getAuth();
    const router = useRouter();
    const agree = ref(false);
    const email = ref("");
    const password = ref("");
    const isPwd = ref(true);
    const insertFB = async () => {
      createUserWithEmailAndPassword(auth, email.value, password.value)
        .then((result) => {
          router.push({ path: "/" });
        })
        .catch((error) => {
          Notify.create({
            position: "center",
            message: "Erro ao criar Credencial do Usuário!",
            caption: error.message,
            color: "accent",
          });
          console.error("FB ERROR >>>>", error);
        });
    };

    return {
      agree,
      email,
      password,
      isPwd,
      insertFB,
    };
  },
};
</script>
<style lang="css" scoped>
.bg-wt {
  background-color: rgba(255, 255, 255, 0.7);
  filter: blur(0.8);
}
.myCard {
  width: 50vw;
  min-width: 450px;
  height: 70vh;
  min-height: 380px;
  border-radius: 10px;
  border: 1px solid #ffffff;
  background-color: rgba(255, 255, 255, 1.5);
}

.frosted {
  background-color: transparent;
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
  box-shadow: inset 0 0 3500px rgba(255, 255, 255, 1.5);
  filter: blur(10px);
}
.pass-input {
  font-size: 32px;
}
</style>
