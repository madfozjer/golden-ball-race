<script setup>
const props = defineProps({
  name: String,
  team: String,
  firstStat: Number,
  secondStat: String,
  index: Number,
  firstStatName: String,
  secondStatName: String,
});
</script>
<template>
  <div
    class="w-xl p-4 bg-white border-b border-gray-700 shadow-sm flex hover:bg-gray-100 text-gray-700 justify-center"
  >
    <div class="w-[25px] border-l border-r border-gray-700 flex justify-center">
      {{ props.index }}
    </div>
    <div
      class="inline-block w-[200px] px-2 border-r border-gray-700 text-lg text-black"
    >
      {{ props.name }}
    </div>
    <div class="inline-block w-[200px] px-2 border-r border-gray-700">
      {{ props.team }}
    </div>
    <div class="w-[70px] px-2 border-r border-gray-700 flex justify-center">
      {{ props.firstStat }}
    </div>
    <div class="w-[70px] px-2 border-r border-gray-700 flex justify-center">
      {{ props.secondStat }}
    </div>
  </div>
</template>
