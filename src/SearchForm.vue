<script setup lang="ts">
import { useMetadata } from "./api/metadata.ts";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { SearchParams } from "./types.ts";
import { breakpointsTailwind } from "@vueuse/core";

const emits = defineEmits<{ submit: [data: SearchParams] }>();
const { metadata, isFetching } = useMetadata();
const show = ref(false);
const { defineField, validate } = useForm({
  validationSchema: toTypedSchema(z.object({
    railType: z.string(),
    curtain: z.object({
      curtainType: z.string(),
      clothCount: z.number()
    }),
    width: z.number(),
    height: z.number()
  }))
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
  emits("submit", result.values as Required<SearchParams>)
  show.value = false;
}

</script>

<template>
  <Button :disabled="isFetching" :loading="isFetching" class="whitespace-nowrap" label="搜尋" @click="show = true" v-bind="$attrs"/>
  <Dialog modal v-if="metadata" class="w-[80vw]" header="輸入搜尋條件" v-model:visible="show">
    <div class="flex flex-col gap-6">
      <div>
        <h2 class="font-bold mb-2">選擇軌道</h2>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center" v-for="value in metadata.railTypes">
            <RadioButton v-model="railType" inputId="railType" name="railType" :value="value"/>
            <label for="railType" class="ml-2">{{ value }}</label>
          </div>
        </div>
      </div>
      <div>
        <h2 class="font-bold mb-2">選擇型式</h2>
        <div class="flex flex-wrap  gap-4">
          <div class="flex items-center" v-for="value in metadata.curtainTypes">
            <RadioButton v-model="curtain" inputId="railType" name="railType" :value="value"/>
            <label for="railType" class="ml-2">
              <span>{{ value.curtainType }}</span>
              <span v-if="value.clothCount > 1">（{{ value.clothCount }} 種布料）</span>
            </label>
          </div>
        </div>
      </div>
      <InputGroup>
        <InputGroupAddon>寬度</InputGroupAddon>
        <InputGroupAddon v-if="greaterThanSmall">{{ metadata.width[0] }} ≤</InputGroupAddon>
        <InputNumber v-model="width" :min="metadata.width[0]" :max="metadata.width[1]"/>
        <InputGroupAddon v-if="greaterThanSmall">≤ {{ metadata.width[1] }}</InputGroupAddon>
        <InputGroupAddon>cm</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>高度</InputGroupAddon>
        <InputGroupAddon v-if="greaterThanSmall">{{ metadata.height[0] }} ≤</InputGroupAddon>
        <InputNumber v-model="height" :min="metadata.height[0]" :max="metadata.height[1]"/>
        <InputGroupAddon v-if="greaterThanSmall">≤ {{ metadata.height[1] }}</InputGroupAddon>
        <InputGroupAddon>cm</InputGroupAddon>
      </InputGroup>
    </div>
    <template #footer>
      <Button label="搜尋" @click="onSubmit"/>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">

</style>