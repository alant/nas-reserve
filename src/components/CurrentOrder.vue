<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="350px">
    <v-card>
      <v-card-title class="headline">{{ $t("message.exchange") }}</v-card-title>
      <v-layout row>
        <v-flex offset-xs2 xs4>
          <v-subheader>
            {{ $t("message.quantity") }}
          </v-subheader>
        </v-flex>
        <v-flex xs6>
          <v-subheader>
            <v-text-field v-model="orderInfo.amount" type="number" placeholder="1" />
          </v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex offset-xs2 xs4>
          <v-subheader>{{ $t("message.price") }} (NAS):
          </v-subheader>
        </v-flex>
        <v-flex xs6>
          <v-subheader>
            <v-text-field disabled v-model="orderInfo.price" type="number" placeholder="1" />
          </v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex offset-xs2 xs4>
          <v-subheader>{{ $t("message.total") }} (NAS):
          </v-subheader>
        </v-flex>
        <v-flex xs6>
          <v-subheader>
            <v-text-field disabled v-model="totalNASCurOrder" type="number" />
          </v-subheader>
        </v-flex>
      </v-layout>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click.native="$emit('input')">
          {{ $t("message.cancelBtn") }}
        </v-btn>
        <v-btn v-on:click="confirmTake">{{ $t("message.okBtn") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import EventBus from '../event-bus';

export default {
  name: 'CurOrderDialog',
  props: ['value', 'OrderInfo'],
  watch: {
    // disable lint here because arrow function doesn't get this context
    /* eslint-disable */
    OrderInfo: function(newVal, oldVal) {
      this.orderInfo = newVal;
      console.log('Prop changed: ', newVal, ' | was: ', oldVal);
    }
  },
  computed: {
    totalNASCurOrder: function() {
      return this.orderInfo.amount * this.orderInfo.price;
    }
    /* eslint-eanble */
  },
  data() {
    return {
      orderInfo: {
        playId: 'Play #511',
        playerAddr: 'n1b...',
        orderId: 0,
        amount: 200,
        price: 0.11,
        time: '6/18/2018, 5:00:00 PM',
        type: ''
      }
    };
  },
  methods: {
    confirmTake() {
      EventBus.$emit('confirmTake', this.orderInfo);
    }
  }
};
</script>
