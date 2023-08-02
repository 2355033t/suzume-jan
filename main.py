import random
import pprint

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
        self.next()

    def emit(self):
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
                self.hands[i][self.emit()] += 1

    def next(self):
        self.turn = (self.turn + 1) % PLAYER_N
        self.hands[self.turn][self.emit()] += 1

    def play(self, i):
        self.hands[self.turn][i] -= 1
        self.rivers[self.turn].append(i)
        self.next()

if __name__ == "__main__":
    game = Game()
    pprint.pprint(game.hands)
