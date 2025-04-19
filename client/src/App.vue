<script setup>
import { getCurrentInstance } from "vue";
import TableCell from "./components/TableCell.vue";
const data = getCurrentInstance().appContext.config.globalProperties.$data.data;

function calculateWinProbabilities(players, alpha = 0.0212) {
  const playerArray = Object.entries(players).map(([name, data]) => ({
    name,
    score: data.score,
    team: data.team,
  }));

  const expScores = playerArray.map((p) => ({
    ...p,
    expScore: Math.exp(alpha * p.score),
  }));

  const totalExp = expScores.reduce((sum, p) => sum + p.expScore, 0);

  return expScores.map((p) => ({
    name: p.name,
    team: p.team,
    score: p.score,
    probability: ((p.expScore / totalExp) * 100).toFixed(1),
  }));
}

const winProbability = calculateWinProbabilities(data);
console.log(winProbability);
</script>

<template>
  <span class="text-4xl flex justify-center mt-24 -mb-24">UCL MVP RACE</span>
  <div class="mt-24 w-full flex justify-center">
    <div class="flex flex-col items-center">
      <TableCell
        v-for="(player, name, index) in data"
        :name="name"
        :index="index + 1"
        :team="player.team"
        :first-stat="player.score"
        :second-stat="winProbability[index].probability + '%'"
      ></TableCell>
    </div>
  </div>
</template>
