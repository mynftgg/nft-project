<template>
    <div class="timer">{{ timerCount }}</div>
</template>

<script>
    export default {
        props: [
            "seconds"
        ],
        data() {
            return {
                timerCount: this.seconds
            }
        },
        watch: {
            timerCount: {
                handler(value) {
                    if (value > 0) {
                        setTimeout(() => {
                            this.timerCount--;
                        }, 1000);
                    }
                },
                immediate: true // This ensures the watcher is triggered upon creation
            }
        }
    }
</script>

<style lang="scss" scoped>
.timer {
    color: black;
    position: absolute;
    top: 20px;
    right: 20px;
    height: 40px;
    width: 40px;
    background-color: white;
    border-radius: 100%;
    text-align: center;
    font-family: 'Inconsolata';
    line-height: 40px;
    font-size: 18px;
}
</style>