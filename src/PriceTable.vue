<script setup lang="ts">

import { groupBy, mapValues } from "lodash-es";

const props = defineProps<{ railPrice: number, clothPrice: Array<{ cloth: string, price: number }> | null }>()
const emits = defineEmits<{ change: [value: number | undefined] }>();
const groupByPrice = computed(() => mapValues(groupBy(props.clothPrice, it => it.price), it => it.map(cloth => cloth.cloth)))

const considerPrice = ref<number>();

function onClothRowClick(price: string | number) {
  const numberPrice = +price;
  considerPrice.value = considerPrice.value === numberPrice ? undefined : numberPrice;
  emits("change", considerPrice.value)
}

</script>

<template>
  <div class="price-table">
    <span class="font-bold">軌道：</span>
    <span>{{ railPrice }}</span>
    <template v-for="(clothes, price) in groupByPrice">
      <span :class="{'bg-primary-200': price === `${considerPrice}`}" @click="onClothRowClick(price)"
            class="cursor-pointer hover:bg-primary-100">{{ clothes.join("、") }}</span>
      <span :class="{'bg-primary-200': price === `${considerPrice}`}">{{ price }}</span>
    </template>
    <template v-if="considerPrice !== undefined">
      <span class="font-bold">價格：</span>
      <span>{{ railPrice + considerPrice }}</span>
    </template>
  </div>
</template>

<style lang="scss">

.price-table {
  display: grid;
  grid-template-columns: 1fr  min-content;

  > span {
    padding: 8px;
    outline: 1px solid #f1f0f0;
  }
}
</style>