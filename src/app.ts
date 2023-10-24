import { chessboard } from "./board.js";
import { INITIAL_FEN, SAMPLE_FEN } from "./lib/constants.js";
import { convertFENtoPosition } from "./lib/fen.js";
import { convertMoveToNotation } from "./lib/notation.js";

function onWindowLoad() {
  const boardDiv = document.querySelector<HTMLDivElement>(".board");
  if (!boardDiv) return;
  const controller = chessboard(boardDiv, INITIAL_FEN, (position) =>
    console.log(position.prevMove?.notation)
  );

  document
    .querySelector<HTMLButtonElement>(".flip-btn")
    ?.addEventListener("click", () => controller.flip());

  const notation = convertMoveToNotation(
    { to: 44, from: 64, type: "normal" },
    convertFENtoPosition(INITIAL_FEN).board
  );
  console.log(notation);
}

window.addEventListener("DOMContentLoaded", onWindowLoad);
