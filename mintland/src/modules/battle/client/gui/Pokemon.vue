<template>
    <div :class="wrapper">
        <div :class="imageWrapper">
            <div :class="boxClass">
                <div v-if="attackEffect" class="battle-effectiveness">
                    {{attackEffect}}
                </div>
                <div class="pokemon-image-wrapper">
                    <img :id="pokemonImageId" v-if="alive" :src="pokemon.originalImage" :class="imageClass"/>
                </div>
            </div>
        </div>
        <div :class="barWrapper">
            <div :class="hpBoxClass">
                <div class="box-words">
                    <span class="name">{{pokemon.name}}</span>
                    <span class="level">Lvl. {{pokemon.stats.level}}</span>
                </div>
                <div class="hp-bar">
                    <div :style="hpBarStyle" class="hp-bar-fill"></div>
                </div>
                <div class="hp-bar mp-bar">
                    <div :style="mpBarStyle" class="hp-bar-fill"></div>
                </div>
                <div class="box-words">
                    <span class="hp-text spacer">HP: {{pokemon.hp}}/{{pokemon.stats.hp}}</span>
                    <span class="hp-text">MP: {{pokemon.mp}}/{{pokemon.stats.mp}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import 'velocity-animate'
    import 'velocity-animate/velocity.ui'
    export default {
        props: ['pokemon', 'position', 'type'],
        data(){
            const effectTypeClass = this.type + '-effect';

            return {
                // Inverse pokemon type
                otherPokemon: this.type == 'player' ? 'opponent' : 'player',
                // Pokemon image id (handy if needed in the future for applying effects)
                pokemonImageId: this.type + '-pokemon',
                // The HP box's class, based on the position
                hpBoxClass: {
                    'bar-box': true,
                    'box-top-left': this.position == 'top',
                    'box-bottom-right': this.position == 'bottom',
                },
                // The main box's class, based on the position
                boxClass: {
                    'box-top-right': this.position == 'top',
                    'box-bottom-left': this.position == 'bottom',
                },
                // The HP bar's class, based on the position
                hpBarClass: {
                    'hp-bar-top': this.position == 'top',
                    'hp-bar-bottom': this.position == 'bottom',
                },
                barWrapper: {
                    'bar-wrapper': true,
                    'left': this.position == 'top',
                    'right': this.position == 'bottom',
                },
                imageWrapper: {
                    'image-wrapper': true,
                    'left': this.position == 'bottom',
                    'right': this.position == 'top',
                },
                wrapper: {
                    'wrapper': true,
                    'wrapper-bottom': this.position == 'bottom',
                    'wrapper-top': this.position == 'top',
                },
                attackEffect: false,
                attackEffectQueue: []
            };
        },
        computed: {
            hpBarStyle(){
                // Show red
                let color = '#FF0061';

                let percent = (this.pokemon.hp / this.pokemon.stats.hp) * 100

                // Show green if HP >= 70%
                if(percent >= 70)
                {
                    color = '#1CB06F';
                }
                // Show yellow if HP >= 30%
                else if(percent >= 30)
                {
                    color = '#FF8800';
                }


                // Return the style binding
                return {
                    width: String(percent) + '%',
                    background: color
                }
            },
            mpBarStyle(){
                const totalMp = this.pokemon.stats.mp || 100
                let percent = (this.pokemon.mp / totalMp) * 100

                // Return the style binding
                return {
                    width: String(percent) + '%',
                    background: 'blue'
                }
            },
            imageClass() {
                const imageClass = { 'pokemon-img': true };
                imageClass[this.pokemon.type] = true;
                return imageClass;
            },
            alive() {
                return this.pokemon.hp > 0;
            }
        },
        watch: {
            attackEffect(value, oldValue)
            {
                // If the battleEffect has been reset and we've got another one waiting in our queue
                if(value === false && this.attackEffectQueue.length > 0)
                {
                    // Show the effect from the queue
                    this.showAttackEffect(this.attackEffectQueue[0]);

                    // Remove the effect from the queue
                    this.attackEffectQueue.splice(0,1);
                }
            }
        },        
        methods: {
            /**
             * Return the name of random attack
             */
            pickRandomAttack() {
                // Retrieve all attack names
                const attacks = Object.keys(this.pokemon.attacks);

                // Pick a random one
                const attackKey = Math.floor(Math.random() * attacks.length);

                // Return the attack name
                return attacks[attackKey];
            },
            showAttackEffect(effect) {
                // If there's already an attack effect, queue it
                if(this.attackEffect != false)
                {
                    this.attackEffectQueue.push(effect);
                    return;
                }

                // Show attack effect
                this.attackEffect = effect;

                // Reset the attack effect
                setTimeout(() => {
                    this.attackEffect = false;
                }, 800)
            }            
        }
    }
</script>

<style lang="scss" scoped>
.wrapper {
    display: flex;
    height: 100%;
}

.wrapper-top {
    flex-direction: row-reverse;
}

.wrapper-bottom {
    flex-direction: row;
}

.left {
    height: 100%;
}

.right {
    height: 100%;
}

.image-wrapper {
    width: 60%;
    position: relative;
}

.bar-wrapper {
    width: 40%;
    position: relative;
}

.bar-box {
    display: flex;
    flex-direction: column;
    padding: 10px;
}

.box-words {
    display: flex;
    padding: 6px 0;
    align-items: center;
}

.name {
    opacity: 0.7;
    font-size: 12px;
    font-family: 'PRESS START 2P';
    flex-grow: 1;
}

.level {
    opacity: 0.7;
    font-size: 14px;
    font-family: 'Inconsolata';
    font-weight: 600;
}

.spacer {
    flex-grow: 1;
}

.hp-text {
    opacity: 0.7;
    font-size: 12px;
    font-family: 'Inconsolata';
    font-weight: 600;
}

.hp-bar {
    border-radius: 20px;
    background: grey;
    opacity: 0.5;
    height: 6px;

    &.mp-bar {
        margin-top: 2px;
    }
}

.hp-bar-fill {
    height: 6px;
    border-radius: 20px;
    background: #FF8800;
    -webkit-transition: width 1s ease-in-out;
    -moz-transition: width 1s ease-in-out;
    -o-transition: width 1s ease-in-out;
    transition: width 1s ease-in-out;
}

.pokemon-image-wrapper {
    width: 40%;
    position: absolute;
    bottom: 50%;
    left: 50%;
    transform: translateX(-50%);
}

.pokemon-img {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    @mixin border-shadow($color) {
        border: 12px solid $color;
        box-shadow: rgba($color, 0.4) 5px -5px,
            rgba($color, 0.3) 10px -10px,
            rgba($color, 0.2) 15px -15px,
            rgba($color, 0.1) 20px -20px,
            rgba($color, 0.05) 25px -25px;
    }

    &.fire {
        @include border-shadow(red);
    }

    &.grass {
        @include border-shadow(green);
    }

    &.water {
        @include border-shadow(blue);
    }

     &.electric {
        @include border-shadow(yellow);
    } 

     &.normal {
        @include border-shadow(white);
    }         
}

#opponent-pokemon {
    border-width: 10px;
}

@media screen and (max-width: 600px) {
    .wrapper {
        flex-direction: column;

        &.wrapper-top {
            flex-direction: column-reverse;
        }
    }

    .image-wrapper {
        width: 100%;
        flex-grow: 1;
    }

    .bar-wrapper {
        width: 100%;
    }

    .box-bottom-left {
        min-height: 40px;
        height: 20%;
        left: -80px;
        right: 100px;
        border-width: 20px;
    }

    .box-top-left {
        left: 20px;
        right: 80px;
    }

    .box-bottom-right {
        left: 80px;
        right: 20px;
    }

    .box-top-right {
        left: 160px;
        right: -40px;
        border-width: 15px;
        height: 15%;
        min-height: 30px;
    }

    .bar-box {
        padding: 5px 10px;
    }

    #player-pokemon {
        border-width: 8px;
    }

    #opponent-pokemon {
        border-width: 6px;
    }

    .pokemon-image-wrapper {
        width: 33%;
    }
}
</style>
