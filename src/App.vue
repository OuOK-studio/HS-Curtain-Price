<script setup lang="ts">
import { Limitation } from "./types.ts";
import { DataTableProps } from "primevue/datatable";
import PriceTable from "./PriceTable.vue";
import { get, set, sum } from "lodash-es";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const params = useSessionStorage("search params", { width: 0, height: 0 });
const debounced = refDebounced(params, 1000);
const { clothGroup, railPrices, standardDimension, isFetching } = usePrice(debounced);
const toast = useToast();
const datatableConfig: DataTableProps = {
  scrollable: true,
  scrollHeight: "flex",
  groupRowsBy: ["rail_type"],
  rowGroupMode: "rowspan",
  showGridlines: true,
  rowClass: data => {
    if (data.method !== "日夜簾") return ["not-daynignt-curtain"]
  },
  dt: {
    header: {
      background: "{primary.700}"
    }
  }
};

function isOutOfRange(range: Limitation, value: number | undefined) {
  if (value === undefined) return true;
  return !(range[0] <= value && value <= range[1])
}

const daynightCurtainPriceCache = ref<Record<string, Record<string, Record<string, number>>>>({});

function onDayNightPriceChange(rail: string, method: string, clothType: string, price: number | undefined) {
  const target = get(daynightCurtainPriceCache.value, [rail, method], {} as Record<string, number>);
  if (price !== undefined && !(clothType in target) && Object.keys(target).length >= 2) return toast.add({
    severity: "warn",
    summary: "已選兩種布料",
    life: 5000
  });
  if (price === undefined) delete target[clothType];
  else set(daynightCurtainPriceCache.value, [rail, method, clothType], price);
}

function getDayNightPrice(rail: string, method: string) {
  const target = get(daynightCurtainPriceCache.value, [rail, method], {} as Record<string, number>);
  return sum(Object.values(target))
}


</script>

<template>
  <Toast position="bottom-center"/>
  <DataTable class="h-full" :value="railPrices" v-bind="datatableConfig" :loading="isFetching">
    <template #header>
      <div class="flex md:flex-row gap-2 flex-col">
        <InputGroup>
          <InputGroupAddon>寬度</InputGroupAddon>
          <InputNumber v-model="params.width"/>
          <InputGroupAddon>標準：{{ standardDimension.width }}</InputGroupAddon>
          <InputGroupAddon>cm</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>高度</InputGroupAddon>
          <InputNumber v-model="params.height"/>
          <InputGroupAddon>標準：{{ standardDimension.height }}</InputGroupAddon>
          <InputGroupAddon>cm</InputGroupAddon>
        </InputGroup>
      </div>
    </template>
    <Column field="rail_type" frozen header="軌道"/>
    <Column field="method" frozen header="型式"/>
    <Column v-for="(clothPrice, clothType) in clothGroup" :header="clothType" body-class="align-baseline">
      <template #body="{data}">
        <template v-if="'price' in data">
          <PriceTable
              :cloth-price="clothPrice"
              :rail-price="data.price"
              @change="data.method === '日夜簾' && onDayNightPriceChange(data.rail_type, data.method,clothType, $event)"/>
        </template>
        <div class="text-red-600 font-bold" v-else>
          <div>此軌道型式無法提供目前尺寸</div>
          <div v-if="isOutOfRange(data.width, standardDimension.width)">寬：{{ data.width[0] }}~{{ data.width[1] }}</div>
          <div v-if="isOutOfRange(data.height, standardDimension.height)">高：{{ data.height[0] }}~{{ data.height[1] }}</div>
        </div>
      </template>
    </Column>
    <Column header="日夜簾價格" class="w-32 not-daynignt-curtain-cell">
      <template #body="{data}">
        <template v-if="'price' in data && data.method === '日夜簾'">
          <span>{{ getDayNightPrice(data.rail_type, data.method) + data.price }}</span>
        </template>
      </template>

    </Column>
  </DataTable>
</template>

<style lang="scss">
.not-daynignt-curtain .not-daynignt-curtain-cell {
  @apply bg-gray-50
}

</style>
