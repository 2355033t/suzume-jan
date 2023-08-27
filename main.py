import random
import numpy as np

PAI_N = 44
PAI_KIND = 20
PLAYER_N = 4
HAND_N = 5
DEFAULT_POINT = 40
RIVER_N = (PAI_N - HAND_N * PLAYER_N - 1) // PLAYER_N + 1

class Game:
    def __init__(self):
        self.yama = [3] * 9 + [1] * 9 + [4] * 2
        self.hands = [[0] * PAI_KIND for _ in range(PLAYER_N)]
        self.rivers = [[] for _ in range(PLAYER_N)]
        self.deal()
        self.turn = -1
        self.round = 0
        self.next()

    def tsumo(self):
        n = random.randint(1, sum(self.yama))
        for i in range(PAI_KIND):
            if n <= self.yama[i]:
                break
            n -= self.yama[i]
        self.yama[i] -= 1
        return i

    def deal(self):
        for i in range(PLAYER_N):
            for _ in range(HAND_N):
                self.hands[i][self.tsumo()] += 1

    def next(self):
        self.turn += 1
        if self.turn == 4:
            self.turn = 0
            self.round += 1
        self.hands[self.turn][self.tsumo()] += 1

    def play(self, i):
        self.hands[self.turn][i] -= 1
        self.rivers[self.turn][self.round] = i
        self.next()

    def display(self, i):
        hand = self.hands[i]
        string = ""
        for i in range(9):
            string += str(i+1) * hand[i]
        if sum(hand[9:18]) > 0:
            string += "r"
        for i in range(9):
            string += str(i+1) * hand[9:18][i]
        if sum(hand[0:18]) > 0:
            string += "s"
        for i in range(2):
            string += str(i+6) * hand[18:20][i]
        if sum(hand[18:20]) > 0:
            string += "z"
        print(string)

    def is_win(self, i):
        hand = self.hands[i]
        hand = [hand[i] + hand[i+9] for i in range(9)] + hand[18:20]
        mentsu = 0
        for i, n in enumerate(hand):
            if n >= 3:
                hand[i] -= 3
                menstu += 1
        for i, _ in range(9-2):
            if hand[i] > 0 and hand[i+1] > 0 and hand[i+2] > 0:
                hand[i] -= 1
                hand[i+1] -= 1
                hand[i+2] -= 1
                mentsu += 1

if __name__ == "__main__":
    game = Game()
<<<<<<< HEAD
=======
    game.is_win(0)
>>>>>>> d29b9604bde15adb2d3c49b9cd2cba55e9f327a3
