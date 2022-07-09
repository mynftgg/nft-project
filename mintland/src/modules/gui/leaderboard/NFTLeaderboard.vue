<template>
  <Leaderboard :users="users" />
</template>

<script>
import Leaderboard from "./components/Leaderboard.vue";

export default {
  name: "NFTLeaderboard",
  components: {
    Leaderboard: Leaderboard,
  },
  data() {
    return {
      users: [
          { "id": 1, "name": "Emma", "score": 0 },
          { "id": 2, "name": "Noah", "score": 0 },
          { "id": 3, "name": "James", "score": 0 },
          { "id": 4, "name": "William", "score": 0 },
          { "id": 5, "name": "Olivia", "score": 0 }
        ]
    };
  },
  mounted() {
    // fetch("./users.json")
    //   .then((res) => res.json())
    //   .then((res) => (this.users = res.users))
    //   .catch((err) => console.error("Error:", err));

    // this.users = {
    //     "users": [
    //       { "id": 1, "name": "Emma", "score": 0 },
    //       { "id": 2, "name": "Noah", "score": 0 },
    //       { "id": 3, "name": "James", "score": 0 },
    //       { "id": 4, "name": "William", "score": 0 },
    //       { "id": 5, "name": "Olivia", "score": 0 }
    //     ]
    // }
  },
};
</script>

<style>
/* We're using BEM methodology http://getbem.com */
.message {
  text-align: center;
}
.leaderboard {
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
  list-style: none;
  margin: 5rem auto 0;
  padding: 2rem;
  width: 15rem;
  height: 20rem;
  background: white;
  position: relative;
  top: -5%;
  right: -40%;
  overflow-y: auto;
}
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
  height: 2rem;
  line-height: 1;
  margin: 0 0.1rem;
  width: 2rem;
}
.leaderboard__button--disabled {
  background: #eee;
  border: 1px solid #ccc;
  color: #ccc;
}
</style>
