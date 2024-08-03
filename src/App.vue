<script setup lang="ts">
import { Limitation, SearchParams } from "./types.ts";
import { set, sumBy } from "lodash-es";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { DataViewProps } from "primevue/dataview";
import SearchForm from "./SearchForm.vue";

const params = useSessionStorage("search params", { width: 0, height: 0 });
const criteria = ref<Pick<SearchParams, "curtain" | "railType">>();
const railInfo = computed(() =>
    railPrices.value.find(it => it.rail_type === criteria.value?.railType && it.method === criteria.value?.curtain.curtainType)
    ?? ({ rail_type: criteria.value?.railType, method: criteria.value?.curtain.curtainType, price: 0 })
);
const { clothGroup, railPrices, standardDimension, isFetching } = usePrice(params);
const toast = useToast();
const datatableConfig: DataViewProps = {
  dataKey: "rail_type",
  layout: "grid",
  dt: {
    header: {
      background: "{primary.700}"
    }
  },
  pt: {
    root: { class: ["flex", "flex-col"] },
    content: { class: ["flex-1", "min-h-0", "overflow-auto"] }
  }
};

function isOutOfRange(range: Limitation, value: number | undefined) {
  if (value === undefined) return true;
  return !(range[0] <= value && value <= range[1])
}

function onSubmit(value: SearchParams) {
  params.value = { width: value.width, height: value.height };
  criteria.value = { curtain: value.curtain, railType: value.railType }
}

const selectedClothes = ref<Record<string, string>>({});
const selectedCount = computed(() => Object.keys(selectedClothes.value).length);
const clothTotalPrice = computed(() => sumBy(Object.values(selectedClothes.value), it => +it));

function onRowClick(clothType: string, price: string) {
  const target = selectedClothes.value[clothType];
  if (target === price) return delete selectedClothes.value[clothType];
  if (target === undefined && criteria.value?.curtain.clothCount === Object.keys(selectedClothes.value).length)
    toast.add({
      severity: "warn",
      life: 5000,
      summary: `${criteria.value?.curtain.curtainType} 只能選擇 ${criteria.value?.curtain.clothCount} 種布料，請先取消選擇`
    });
  else set(selectedClothes.value, [clothType], price);
}

</script>

<template>
  <Toast position="bottom-center" class="max-w-[80vw]"/>
  <DataView class="h-full" :value="railPrices" v-bind="datatableConfig">
    <template #empty>請點擊搜尋輸入條件</template>
    <template v-if="criteria" #footer>
      <span v-if="'price' in railInfo && selectedCount === criteria?.curtain.clothCount">
        軌道價格 {{ railInfo.price }} + {{
          Object.values(selectedClothes).map((it, index) => `布料 ${index + 1} ${it}`).join(" + ")
        }} = {{ clothTotalPrice + railInfo.price }} 元
      </span>
      <span v-else>選擇 {{ criteria?.curtain.clothCount }} 種布料以計算價格</span>
    </template>
    <template #header>
      <div class="flex text-white items-center font-bold">
        <span v-if="criteria" class="flex flex-wrap gap-2">
          <span>當前搜尋條件：</span>
          <span>寬 {{ params.width }}（{{ standardDimension.width }}）cm</span>
          <span>高 {{ params.height }}（{{ standardDimension.height}}）cm</span>
          <span>{{ criteria.railType }}</span>
          <span>{{ criteria.curtain.curtainType }}</span>
        </span>
        <span v-else>請點擊搜尋輸入條件</span>
        <SearchForm class="ml-auto" @submit="onSubmit"/>
      </div>
    </template>
    <template v-if="railInfo && criteria" #grid>
      <BlockUI :blocked="isFetching">
        <table v-if="'price' in railInfo" class="cloth-price-table relative">
          <tbody>
          <template v-for="(priceGroup, clothType) in clothGroup">
            <tr>
              <td colspan="2" class=" bg-white text-lg font-bold col-span-2 sticky top-0">{{ clothType }}</td>
            </tr>
            <tr v-for="(cloths, price) in priceGroup"
                class="hover:bg-primary-400"
                :class="{'bg-primary-200' : selectedClothes[clothType] === price}"
                @click="onRowClick(clothType, price)"
            >
              <td class="font-bold">{{ cloths.join("、") }}</td>
              <td>{{ price }}</td>
            </tr>
          </template>
          </tbody>
        </table>
        <div class="text-red-600 h-full text-2xl flex items-center justify-center font-bold" v-else>
          <div>
            <div>此軌道型式無法提供目前尺寸</div>
            <div v-if="isOutOfRange(railInfo.width, standardDimension.width)">寬度：{{ railInfo.width[0] }}~{{ railInfo.width[1] }}</div>
            <div v-if="isOutOfRange(railInfo.height, standardDimension.height)">高度：{{ railInfo.height[0] }}~{{ railInfo.height[1] }}</div>
          </div>
        </div>
      </BlockUI>
    </template>
  </DataView>
</template>

<style lang="scss">

.cloth-price-table {
  @apply w-full h-full;
  border-collapse: collapse;
  border: 1px solid #c4c4c4;

  td {
    padding: 8px 16px;
    border: 1px solid #c4c4c4;
  }

}
</style>
