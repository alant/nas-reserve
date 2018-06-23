<template>
  <v-container grid-list-md text-xs-center>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap align-center justify-center>
        <v-flex xs3>
          <v-card justify-center height="200px">
            <v-card-text class="px-0">
              {{ $t('message.myAccountBalance') }} {{nrtBalance}} NRT
              {{ $t('message.myAccountBalance') }} {{rmbBalance}} NRT
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
export default {
  name: 'MyInfo',
  data() {
    return {
      nrtBalance: 0,
      rmbBalance: 0,
      buyDoneOrderList: [],
      sellDoneOrderList: [],
      buyPendingOrderList: [],
      sellPendingOrderList: []
    };
  },
  methods: {
    getNRTBalance() {
      this.balance = 0;
    },
    getRMBBalance() {
      this.balance = 0;
    },
    beforeMount() {
      this.getNRTBalance();
      this.getRMBBalance();
    }
  }
};
</script>
