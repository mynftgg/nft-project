<template>
  <div class="leaderboard__item">
    
    <span class="leaderboard__user"><img style = "width: 50%;" :src = "user.image"/>
    <span class="leaderboard__user">{{ user.name }}</span>
    
    </span>
    <!-- <div class="leaderboard__buttons">
      <button
        @click="$emit('step', { userId: user.id, step: 1 })"
        class="leaderboard__button"
      >
        +
      </button>
      <button
        @click="$emit('step', { userId: user.id, step: -1 })"
        :class="{
          leaderboard__button: true,
          'leaderboard__button--disabled': user.score < 1,
        }"
        :disabled="user.score < 1"
      >
        -
      </button>
    </div> -->
    <span class="leaderboard__score">
      {{ user.score }} {{ user.score === 1 ? "point" : "points" }}
    </span>

    <span class="leaderboard__score">
      {{ user.boost }}
    </span>    
  </div>
</template>

<script>
export default {
  name: "LeaderboardItem",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
.leaderboard__item {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  padding: 0.25rem;
}
.leaderboard__user {
  text-align: left;
  width: 30%;
}
.leaderboard__score {
  text-align: right;
  width: 30%;
}
.leaderboard__buttons {
  display: flex;
  justify-content: center;
  width: 30%;
}
.leaderboard__button {
  background: #007bff;
  border: 1px solid #007bff;
  color: #fff;
  cursor: pointer;
  height: 2rem;
  line-height: 1;
  margin: 0 0.1rem;
  width: 2rem;
}
.leaderboard__button--disabled {
  background: #eee;
  border: 1px solid #ccc;
  color: #ccc;
  cursor: auto;
}
</style>