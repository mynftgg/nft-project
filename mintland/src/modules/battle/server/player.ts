import { RpgPlayer, RpgPlayerHooks } from '@rpgjs/server'
import { BattleManager } from './battle-manager';
import { Choice } from '@rpgjs/server/lib/Gui/DialogGui'
import { runWithTimeout } from '../../../utils/utils'
import { NpcPlayer } from './npc'

function getPropsForComponent(battleData) {
    return {
        party: battleData.party,
        name: battleData.rpgPlayer.name,
        address: battleData.rpgPlayer.data.address
    }
}

function exitBattle(player) {
    player.gui('BattleApp').close();
    player.data.inBattle = false;
    player.data.battleManager = undefined;
    player.data.battlePlayerType = undefined;
}

function createBattleManager(player, otherPlayer) {
    const battleManager = new BattleManager(player, otherPlayer)

    player.data.battleManager = battleManager
    player.data.battlePlayerType = "p1"
    player.data.inBattle = true

    otherPlayer.data.battleManager = battleManager
    otherPlayer.data.battlePlayerType = "p2"
    otherPlayer.data.inBattle = true

    return battleManager
}

export function startNpcBattle(player: RpgPlayer, nfts: object[]) {
    const npc = new NpcPlayer(nfts)
    const battleManager = createBattleManager(player, npc)

    player.gui('BattleApp').open({
        p1: getPropsForComponent(battleManager.p1),
        p2: getPropsForComponent(battleManager.p2),
        playerType: "p1"
    });

    npc.emit("battle__reset", null)
}

async function challengeToBattle(player: RpgPlayer, otherPlayer: RpgPlayer) {
    if (player.data.pendingBattle) {
        player.showNotification(`You currently have a pending battle request, please wait a moment.`, { time: 3000 })
        return
    }

    if (otherPlayer.data.pendingBattle) {
        player.showNotification(`${otherPlayer.name} already has a pending battle request, please wait a moment.`, { time: 3000 })
        return
    }

    if (otherPlayer.data.inBattle)  {
        player.showNotification(`${otherPlayer.name} is currently in a battle!`, { time: 3000 })
        return
    }

    if (otherPlayer.data.inGame)  {
        player.showNotification(`${otherPlayer.name} is currently playing a minigame!`, { time: 3000 })
        return
    }

    const choice1 = await player.showChoices(`Challenge ${otherPlayer.name} to a battle?`, [
        { text: 'Yes', value: 'Yes' },
        { text: 'No', value: 'No' },
    ]);

    if (!choice1 || choice1.value != 'Yes') {
        return
    }

    player.data.pendingBattle = true
    otherPlayer.data.pendingBattle = true

    const choice2: Choice | null = await runWithTimeout(() => {
        return otherPlayer.showChoices(`${player.name} has challenged you to a battle. Do you accept?`, [
            { text: 'Yes', value: 'Yes' },
            { text: 'No', value: 'No' },
        ])
    }, 10000)

    player.data.pendingBattle = false
    otherPlayer.data.pendingBattle = false

    if (!choice2) {
        player.showNotification(`${otherPlayer.name} didn't respond to your battle request.`, { time: 3000 })
        otherPlayer.showNotification(`Battle request from ${player.name} expired.`, { time: 3000 })
        otherPlayer.gui("rpg-dialog").close()
        return
    }

    if (choice2.value == "No") {
        player.showNotification(`${otherPlayer.name} declined your battle request.`, { time: 3000 })
        return
    }

    var party1 = player.data.party
    var party2 = otherPlayer.data.party

    if (party1.length == 0 || party2.length == 0) {
        player.showNotification('One of the battlers does not have enough NFTs to battle', { time: 3000 })
        otherPlayer.showNotification('One of the battlers does not have enough NFTs to battle', { time: 3000 })
        return
    }

    const battleManager = createBattleManager(player, otherPlayer)

    player.showNotification(`${otherPlayer.name} accepted your battle request!`, { time: 3000 })

    player.gui('BattleApp').open({
        p1: getPropsForComponent(battleManager.p1),
        p2: getPropsForComponent(battleManager.p2),
        playerType: "p1"
    });

    otherPlayer.gui('BattleApp').open({
        p1: getPropsForComponent(battleManager.p1),
        p2: getPropsForComponent(battleManager.p2),
        playerType: "p2"
    });
}

export const player: RpgPlayerHooks = {
    async onJoinMap(player, map) {
        player.data.inBattle = false;

        player.on("battle__move", function(data) {
            if (player.data.battleManager) {
                player.data.battleManager.addMove(data);
            }
        })

        player.on("battle__run", async function(data) {
            var runChoice = await player.showChoices(`Do you want to run from this battle?`, [
                { text: 'Yes', value: 'Yes' },
                { text: 'No', value: 'No' },
            ])

            if (runChoice != null && runChoice.value == "Yes" && player.data.battleManager) {
                player.data.battleManager.run(data)
                exitBattle(player)
                player.showNotification(`You ran from the battle!`, {
                    time: 7000,
                    sound: undefined
                })
            }
        })

        player.on("battle__close", () => exitBattle(player))
    },
    async onInput(player: RpgPlayer, data) {
        if (data.input == 'action') {
            for (var i = 0; i < player.collisionWith.length; i++) {
                var other = player.collisionWith[i];
                if (other.type == 'player' && player.id != other.id) {
                    await challengeToBattle(player, other)
                    break
                }
            }
        }
    },
    onDisconnected(player) {
        if (player.data.inBattle) {
            player.data.battleManager.run({ player: player.data.battlePlayerType })
        }
    }
}