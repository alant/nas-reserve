<template>
  <v-app>
    <v-navigation-drawer v-model="sidebar" app>
      <v-list>
        <v-list-tile v-for="item in menuItems" :key="item.title" :to="item.path">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>{{ item.title }}</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar app>
      <span class="hidden-sm-and-up">
        <v-toolbar-side-icon @click="sidebar = !sidebar">
        </v-toolbar-side-icon>
      </span>
      <v-toolbar-title>
        <router-link to="/" tag="span" style="cursor: pointer">
          {{ $t("message.appTitle") }}
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat to="/buy">
          {{ $t('message.purchaseNRT') }}
        </v-btn>
        <v-btn flat to="/exchange">
          {{ $t('message.exchange') }}
        </v-btn>
        <v-btn flat to="/about">
          {{ $t('message.about') }}
        </v-btn>
        <v-btn v-on:click="switchLocale">
          {{ lang }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <router-view></router-view>
    </v-content>

    <v-footer app>
      <v-layout row wrap justify-center>
        <span>NAS Reserve 2018</span>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  components: {},
  data() {
    return {
      appTitle: 'NAS Reserve',
      sidebar: false,
      lang: 'English'
    };
  },
  methods: {
    beforeMount() {
      // eslint-disable-next-line
      console.log('==> beforeMount');
    },
    switchLocale() {
      if (this.lang === 'English') {
        this.$i18n.locale = 'en';
        this.lang = '中文';
      } else {
        this.$i18n.locale = 'zh';
        this.lang = 'English';
      }
    }
  }
};
</script>

<style>
.btn__content {
  text-transform: none;
}
</style>
