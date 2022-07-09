import { RpgPlayer } from "@rpgjs/server";

export function isMobile() {
    return !!('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
}

export function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export function getRandomEntry(arr) {
    return arr[getRandomInt(arr.length)]
}

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleep(ms: number) {
    await timeout(ms);
}

export function waitForIo(player: RpgPlayer, key: string) {
    return new Promise(resolve => {
        player.on(key, (data) => {
            resolve(data)
        })
    })
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function runWithTimeout(func: CallableFunction, ms: number) {
    return new Promise<any>(resolve => {
        let resolved = false

        setTimeout(() => {
            resolved = true
            resolve(null)
        }, ms)

        func().then(result => {
            if (!resolved) {
                resolve(result)
            }
        })
    })
}

export function any(func1: CallableFunction, func2: CallableFunction) {
    return new Promise<any>(resolve => {
        let resolved = false

        func1().then(result => {
            if (!resolved) {
                resolved = true
                resolve(result)
            }
        })

        func2().then(result => {
            if (!resolved) {
                resolved = true
                resolve(result)
            }
        })
    })
}

export function getGridIndex(
   currentIdx: number,
   direction: string,
   numItems: number,
   gridSize: number = 2
) {
    let newIdx = currentIdx

    switch (direction) {
        case "up":
            newIdx -= gridSize
            break
        case "down":
            newIdx += gridSize
            break
        case "left":
            newIdx -= 1
            break
        case "right":
            newIdx += 1
            break
        default:
            break
    }

    if (newIdx < 0 || newIdx >= numItems) {
        return currentIdx
    } else {
        return newIdx
    }
}
