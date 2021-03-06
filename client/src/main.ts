/* eslint-disable */
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import store from "./store";
import { defineCustomElements as defineIonPhaser } from "@ion-phaser/core/loader";
import VueSocketIO from "vue-socket.io";
import * as SocketIO from "socket.io-client";

Vue.config.productionTip = false;
Vue.config.ignoredElements = [/ion-\w*/];

defineIonPhaser(window);
Vue.prototype.window = window;

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: SocketIO("https://api.trojanhorse.cc/")
  })
);

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
