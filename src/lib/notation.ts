import { Board, PieceMove } from "../types/index.js";
import { letters } from "./constants.js";
import {
  convertIndexToRowCol,
  convertIndexToTarget,
  emptyPosition,
} from "./helpers.js";
import { findMoves, findOccurencesOfPiece } from "./moves.js";

export function convertMoveToNotation(
  move: PieceMove,
  board: Board,
  type: "algebraic" = "algebraic"
) {
  return moveToAlgebraic(move, board);
}

function moveToAlgebraic(move: PieceMove, board: Board): string {
  let notation = "";

  const square = board[move.from];
  if (!square) return notation;

  if (move.type === "castle") {
    if (move.to % 10 === 6) return "O-O";
    else if (move.to % 10 === 2) return "O-O-O";
    return "";
  }

  notation += square.piece !== "p" ? square.piece.toUpperCase() : "";

  if (square.piece === "n" || square.piece === "r") {
    const otherMoves: PieceMove[] = [];
    const occurences = findOccurencesOfPiece(
      board,
      square.piece,
      square.color,
      [square.index]
    );
    for (const occurIdx of occurences) {
      otherMoves.push(
        ...findMoves(
          { ...emptyPosition(), board, turn: square.color },
          occurIdx
        )
      );
    }
    const sameMove = otherMoves.find(
      (m) => m.from !== move.from && m.to === move.to
    );
    if (sameMove) {
      if (sameMove.from % 10 !== move.from % 10) {
        notation += letters[move.from % 10];
      } else {
        notation += Math.abs(8 - Math.floor(move.from / 10));
      }
    }
  }

  const toSquare = board[move.to];
  if (toSquare) {
    if (square.piece === "p") notation += letters[move.from % 10];
    notation += "x";
  }

  notation += convertIndexToTarget(move.to);

  return notation;
}
