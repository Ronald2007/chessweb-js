import { chessgame } from "../dist/index.esm.js";

const board = document.querySelector(".board");
if (board) {
  const controller = chessgame(
    board,
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    { animationDuration: 0 }
  );
}
