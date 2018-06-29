<template>
  <v-app>
    <v-navigation-drawer v-model="sidebar" app>
      <v-list>
        <v-list-tile to="/buy">
          <v-list-tile-content>{{ $t('message.purchaseNRT') }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/exchange">
          <v-list-tile-content>{{ $t('message.exchange') }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/myaccount">
          <v-list-tile-content>{{ $t('message.myAccount') }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/about">
          <v-list-tile-content>{{ $t('message.about') }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-on:click="switchLocale">
          <v-list-tile-content>
            <div v-if="lang === 'en'">
              中文
            </div>
            <div v-else-if="lang === 'zh'">
              English
            </div>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar app>
      <span class="hidden-sm-and-up">
        <v-toolbar-side-icon @click="sidebar = !sidebar">
        </v-toolbar-side-icon>
      </span>
      <v-toolbar-title>
        <img src="./assets/logoxs.png" />
        <router-link to="/" tag="span" style="cursor: pointer">
          {{ $t("message.appTitle") }}
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat to="/">
          {{ $t('message.exchange') }}
        </v-btn>
        <v-btn flat to="/buy">
          {{ $t('message.purchaseNRT') }}
        </v-btn>
        <v-btn flat to="/myaccount">
          {{ $t('message.myAccount') }}
        </v-btn>
        <v-btn flat to="/about">
          {{ $t('message.about') }}
        </v-btn>
        <v-btn v-on:click="switchLocale">
          <div v-if="lang === 'en'">
            中文
          </div>
          <div v-else-if="lang === 'zh'">
            English
          </div>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <router-view></router-view>
    </v-content>

    <v-footer app>
      <v-layout row wrap justify-center>
        <span>{{ $t("message.appTitle") }} 2018</span>
      </v-layout>
    </v-footer>

    <v-snackbar :timeout="5000" :top="true" :vertical="true" v-model="sbSnackbar">
      {{ $t("message.weChatSB") }}
      <v-btn flat color="pink" @click.native="sbSnackbar = false">Close</v-btn>
    </v-snackbar>

  </v-app>
</template>

<script>
import EventBus from './event-bus';

export default {
  name: 'App',
  components: {},
  data() {
    return {
      sidebar: false,
      lang: this.$i18n.locale,
      sbSnackbar: navigator.userAgent.match(/MicroMessenger/ig)
    };
  },
  methods: {
    beforeMount() {
      // eslint-disable-next-line
    },
    switchLocale() {
      if (this.lang === 'en') {
        this.$i18n.locale = 'zh';
        this.lang = 'zh';
      } else {
        this.$i18n.locale = 'en';
        this.lang = 'en';
      }
      EventBus.$emit('locale', this.$i18n.locale);
    }
  }
};
</script>

<style>
.btn__content {
  text-transform: none;
}
</style>
