import { chessboard } from "./board.js";
import { INITIAL_FEN } from "./lib/constants.js";
import { Move } from "./types/index.js";

function onWindowLoad() {
  const boardDiv = document.querySelector<HTMLDivElement>(".board");
  if (!boardDiv) return;
  const moves: Move[] = [];

  const controller = chessboard(boardDiv, INITIAL_FEN, {
    animationDuration: 0,
    onChange: (position) => moves.push(position),
  });

  document
    .querySelector<HTMLButtonElement>(".flip-btn")
    ?.addEventListener("click", () => controller.flip());
}

window.addEventListener("DOMContentLoaded", onWindowLoad);
