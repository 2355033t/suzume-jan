const PLAYER = 4;
const TYPE = 20;
const HAND = 5;
const yama = [
    3, 3, 3, 3, 3, 3, 3, 3, 3,
    1, 1, 1, 1, 1, 1, 1, 1, 1,
    4, 4
];

const names = Array(9).fill().map((_, i) => String(i + 1) + "s").concat(
    Array(9).fill().map((_, i) => "r" + String(i + 1) + "s"),
    ["發", "中"]
); 

let turn = 0;
const hands = Array(PLAYER).fill().map(_ => Array(TYPE).fill(0));
const rivers = Array(PLAYER).fill().map(_ => []);

// 自摸
const draw = () => {
    const total = yama.reduce((a, b) => a + b);
    const r = Math.floor(Math.random() * total) + 1;
    let n = 0;
    const index = yama.findIndex(v => r <= (n += v));
    yama[index]--;
    return index;
}

// 打牌
const play = index => {
    console.log(`player${turn} played ${names[index]}`);
    hands[turn][index]--;
    rivers[turn].push(index);
}

// 索子の赤牌を統合する
const unifyHand = hand => {
    return Array(9).fill().map((_, i) => hand[i] + hand[i + 9]).concat(
        Array(2).fill().map((_, i) => hand[i + 18])
    );
}

// 手牌の評価
const calcShanten = hand => {
    let shanten = 3;
    // const effectives = [];
    const unified = unifyHand(hand);
    // 刻子
    const kotsuIndex = unified.findIndex(v => v >= 3);
    if (kotsuIndex !== -1) {
        unified[kotsuIndex] -= 3;
        shanten -= 2;
    }
    // 順子
    const sliced7 = unified.slice(0, 7);
    const shuntsuIndex = sliced7.findIndex(
        (_, i) => unified[i] * unified[i + 1] * unified[i + 2] > 0
    );
    if (shuntsuIndex !== -1) {
        unified[shuntsuIndex]--;
        unified[shuntsuIndex + 1]--;
        unified[shuntsuIndex + 2]--;
        shanten -= 2;
    }
    // 対子と塔子
    for (let i = 0; i < 2; i++) {
        // 対子
        let toitsuIndex = unified.findIndex(v => v >= 2);
        if (toitsuIndex !== -1) {
            unified[toitsuIndex] -= 2;
            shanten--;
            /*
            if (toitsuIndex < 9) {
                effectives.push(toitsuIndex);
                effectives.push(toitsuIndex + 9);
            } else {
                effectives.push(toitsuIndex + 18);
            }
            */
        }
        // 塔子
        let sliced8 = unified.slice(0, 8);
        let tatsuIndex = sliced8.findIndex(
            (_, i) => unified[i] * unified[i + 1]
        );
        if (tatsuIndex !== -1) {
            unified[tatsuIndex]--;
            unified[tatsuIndex + 1]--;
            shanten--;
            /*
            if (toitsuIndex !== 0) {
                effectives.push(tatsuIndex - 1);
                effectives.push(tatsuIndex - 1 + 9);
            }
            if (toitsuIndex !== 7) {
                effectives.push(tatsuIndex + 2);
                effectives.push(tatsuIndex + 2 + 9);
            }
            */
        }
    }
    return shanten;
}

// 役
const judgeYaku = hand => {
    const yaku = [];
    let isTannyao = true;
    let isChanta = true;

    // 刻子と順子
    let kotsu = 0;
    let shuntsu = 0;
    let unified = unifyHand(hand);
    for (let i = 0; i < 2; i++) {
        // 刻子
        let kotsuIndex = unified.findIndex(v => v >= 3);
        if (kotsuIndex !== -1) {
            unified[kotsuIndex] -= 3;
            kotsu++;
            if ([0, 8, 9, 10].includes(kotsuIndex)) {
                isTannyao = false;
            } else {
                isChanta = false;
            }
        }
        // 順子
        let sliced7 = unified.slice(0, 7);
        let shuntsuIndex = sliced7.findIndex(
            (_, i) => unified[i] * unified[i + 1] * unified[i + 2] > 0
        );
        if (shuntsuIndex !== -1) {
            unified[shuntsuIndex]--;
            unified[shuntsuIndex + 1]--;
            unified[shuntsuIndex + 2]--;
            shuntsu++;
            if ([0, 6].includes(shuntsuIndex)) {
                isTannyao = false;
            } else {
                isChanta = false;
            }
        }
    }
    if (kotsu + shuntsu !== 2) return yaku;
    if (kotsu > 0) yaku.push(["刻子", kotsu * 2]);
    if (shuntsu > 0) yaku.push(["順子", shuntsu]);

    unified = unifyHand(hand);

    // 役満
    // オールグリーン
    if (hand[1] + hand[2] + hand[3] + hand[5] + hand[7] + hand[18] === 6) {
        yaku.push(["オールグリーン", 10]);
        return yaku;
    }
    // チンヤオ
    if (unified[0] + unified[8] + unified[9] + unified[10] === 6) {
        yaku.push(["チンヤオ", 15]);
        return yaku;
    }
    // スーパーレッド
    const red = hand.slice(9, 18).reduce((a, b) => a + b) + hand[19];
    if (red === 6) {
        yaku.push(["スーパーレッド", 20]);
        return yaku;
    }

    if (red > 0) yaku.push(["赤牌", red]);
    if (unified[doraIndex] > 0) yaku.push(["ドラ", unified[doraIndex]]);
    if (isTannyao) yaku.push(["タンヤオ", 1]);
    if (isChanta) yaku.push(["チャンタ", 2]);

    return yaku;
}

const guess = hand => {
    const candidates = [];
    hand.forEach((v, i) => { if (v > 0) candidates.push(i); });
    const shantens = candidates.map(index => {
        const postHand = [...hand];
        postHand[index]--;
        return calcShanten(postHand);
    });
    const minShanten = Math.min(...shantens);
    const bestChoices = candidates.filter(
        (_, i) => shantens[i] == minShanten
    );
    const r = Math.floor(Math.random() * bestChoices.length);
    return bestChoices[r];
}

const display = () => {
    console.log("-");
    console.log(`dora: ${names[doraIndex]}`)
    hands.forEach((hand, i) => {
        const line = [];
        hand.forEach((v, j) => {
            for (let k = 0; k < v; k++) {
                line.push(names[j]);
            }
        });
        console.log(`player${i}'s hand: ${line}`);
    });
    console.log("-");
}

// 配牌
for (let i = 0; i < PLAYER; i++) {
    for (let j = 0; j < HAND; j++) {
        hands[i][draw()]++;
    }
}
const doraIndex = draw();

let isOnGame = true;
while (yama.some(v => v > 0)) {
    display();
    hands[turn][draw()]++;
    let yaku = judgeYaku(hands[turn]);
    if (yaku.length !== 0) {
        let score = yaku.map(v => v[1]).reduce((a, b) => a + b);
        if (score >= 1) {
            console.log(`player${i} won`);
            isOnGame = false;
        }
    }
    let index = guess(hands[turn]);
    play(index);
    for (let i = 0; i < PLAYER; i++) {
        if (i === turn) continue;
        let virtualHand = [...hands[i]];
        virtualHand[index]++;
        let yaku = judgeYaku(virtualHand);
        if (yaku.length === 0) continue;
        let score = yaku.map(v => v[1]).reduce((a, b) => a + b);
        if (score >= 1) {
            console.log(`player${i} won`);
            isOnGame = false;
        }
    }
    if (!isOnGame) break;
    turn++;
    turn %= 4;
}