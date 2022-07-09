<template>
  <div class="leaderboard">
    <button class = "closeButton" v-on:click="close()">X</button>
    <h3>Collection Leaderboard </h3>
    <transition-group
      move-class="leaderboard__item--move"
      v-if="users.length > 0"
    >
      <LeaderboardItem
        v-for="user in sortedUsers"
        :key="user.id"
        :user="user"
        @step="handleStep"
      />
    </transition-group>
    <p class="message" v-else>Nothing to show</p>
  </div>
</template>

<script>
import LeaderboardItem from "./LeaderboardItem.vue";

export default {
  name: "Leaderboard",
  components: {
    LeaderboardItem: LeaderboardItem,
  },
  inject: [ 'rpgGuiClose'],
  data() {
    return {
      users: [          
          { "id": 1, "name": "Thug Birdz", "score": 100, "image": "https://brfjvuahljvc4peetfx7oqhrrhebfbasgryok65iicf3oqejqheq.arweave.net/DEqa0Adaai48hJlv90DxicgShBI0cOV7qECLt0CJgck/?ext=png", "boost": "+5 HP" },
          { "id": 2, "name": "Solana Monkey Business", "score": 96, "image": "https://zbg6647bp5fb4h6gevyg7zai3n5mrofn5h6gmq66dqn3wc23vbka.arweave.net/yE3vc-F_Sh4fxiVwb-QI23rIuK3p_GZD3hwbuwtbqFQ","boost": "+5 Fire Attacks" },
          { "id": 3, "name": "Galactic Geckos", "score": 60, "image": "https://www.arweave.net/-Ni4cocb4LYfQaD5-5sSQt216esbr_HKAMC4PdIpmrI?ext=jpeg", "boost": "+2 HP"  },
          { "id": 4, "name": "Degen Ape Academy", "score": 77, "image": "https://hkgwtdvfyh.medianetwork.cloud/unsafe/1069x1069/filters:format(webp)/data.solanart.io/img/degenape/7225.jpg", "boost": "+5 Water Attacks"  },
          { "id": 5, "name": "SolPunks", "score": 50, "image": "https://arweave.net/0K7Tn3VEox0Flt5HvtMGqOXza3vuf74McCWylqpNQ1w", "boost": "+1 HP" }
          ],
    };
  },
  mounted() {
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
  methods: {
    handleStep(event) {
      const { userId, step } = event;
      let user = this.users.find((user) => user.id === userId);
      user.score += step;
      user.score = user.score < 0 ? 0 : user.score;
      this.users = [...this.users];
    },
    close(){
      this.rpgGuiClose('NFTLeaderboard');
    }
  },
  computed: {
    sortedUsers() {
      return [...this.users].sort((a, b) =>
        a.score === b.score
          ? a.name.localeCompare(b.name)
          : a.score > b.score
          ? -1
          : 1
      );
    },
  },
};
</script>

<style>
.leaderboard {
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
  font-family: Arial, Helvetica, sans-serif;
  list-style: none;
  margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
  background: white;
  background-color: white;
}
.leaderboard__item--move {
  transition: transform 0.2s;
}
.message {
  text-align: center;
}
</style>