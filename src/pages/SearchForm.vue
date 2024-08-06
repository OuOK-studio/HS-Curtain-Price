<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { breakpointsTailwind } from "@vueuse/core";
import { useSearchCriteriaStore } from "./useSearchCriteriaStore.ts";
import { Criteria } from "../types.ts";

const router = useRouter();
const { metadata } = useMetadata();
const store = useSearchCriteriaStore();
const { criteria } = storeToRefs(store);
const { defineField, validate, meta, errors } = useForm({
  validationSchema: toTypedSchema(z.object({
    railType: z.string(),
    curtain: z.object({
      curtainType: z.string(),
      clothCount: z.number()
    }),
    width: z.number(),
    height: z.number()
  })),
  initialValues: criteria.value
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const greaterThanSmall = breakpoints.greater("sm");

const [railType] = defineField("railType");
const [curtain] = defineField("curtain");
const [width] = defineField("width");
const [height] = defineField("height");

async function onSubmit() {
  const result = await validate();
  if (!result.valid || !result.values) return;
  const { width, height, curtain, railType } = result.values as Required<Criteria>;
  criteria.value = { width, height, curtain, railType };
  router.replace("/list")
}

</script>

<template>
  <BlockUI :blocked="metadata === undefined">
    <div class="flex flex-col gap-6 h-full p-4">
      <h1 class="font-bold text-3xl">輸入搜尋條件</h1>
      <div>
        <h2 class="font-bold mb-2 text-2xl">選擇軌道</h2>
        <div class="flex flex-wrap gap-4">
          <template v-if="metadata">
            <div class="flex items-center" v-for="value in metadata.railTypes">
              <RadioButton v-model="railType" inputId="railType" name="railType" :value="value"/>
              <label for="railType" class="ml-2">{{ value }}</label>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center" v-for="_ in 4">
              <RadioButton name="railType" disabled/>
              <Skeleton for="railType" class="ml-2" width="5rem" height="1rem"/>
            </div>
          </template>
        </div>
      </div>
      <div>
        <h2 class="font-bold mb-2 text-2xl">選擇型式</h2>
        <div class="flex flex-wrap  gap-4">
          <template v-if="metadata">
            <div class="flex items-center" v-for="value in metadata.curtainTypes">
              <RadioButton v-model="curtain" inputId="railType" name="railType" :value="value"/>
              <label for="railType" class="ml-2">
                <span>{{ value.curtainType }}</span>
                <span v-if="value.clothCount > 1">（{{ value.clothCount }} 種布料）</span>
              </label>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center" v-for="_ in 3">
              <RadioButton name="railType" disabled/>
              <Skeleton for="railType" class="ml-2" width="5rem" height="1rem"/>
            </div>
          </template>
        </div>
      </div>
      <InputGroup>
        <InputGroupAddon>寬度</InputGroupAddon>
        <template v-if="metadata">
          <InputGroupAddon v-if="greaterThanSmall">{{ metadata.width[0] }} ≤</InputGroupAddon>
          <InputNumber :invalid="errors.width !== undefined" v-model="width" :min="metadata.width[0]" :max="metadata.width[1]"/>
          <InputGroupAddon v-if="greaterThanSmall">≤ {{ metadata.width[1] }}</InputGroupAddon>
        </template>
        <template v-else>
          <Skeleton class="flex-1" height="100%"/>
        </template>
        <InputGroupAddon>cm</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>高度</InputGroupAddon>
        <template v-if="metadata">
          <InputGroupAddon v-if="greaterThanSmall">{{ metadata.height[0] }} ≤</InputGroupAddon>
          <InputNumber :invalid="errors.height !== undefined" v-model="height" :min="metadata.height[0]" :max="metadata.height[1]"/>
          <InputGroupAddon v-if="greaterThanSmall">≤ {{ metadata.height[1] }}</InputGroupAddon>
        </template>
        <template v-else>
          <Skeleton class="flex-1" height="100%"/>
        </template>
        <InputGroupAddon>cm</InputGroupAddon>
      </InputGroup>
      <Button @click="onSubmit" label="套用" :disabled="!meta.valid"/>
    </div>
  </BlockUI>

</template>

<style scoped lang="scss">

</style>