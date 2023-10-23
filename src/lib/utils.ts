import {
  Board,
  BoardChange,
  BoardDifference,
  PieceMove,
} from "../types/index.js";
import { clone, convertIndexToTarget } from "./helpers.js";

export function playMove(actualBoard: Board, move: PieceMove): BoardChange {
  const board = clone(actualBoard);

  const fromSquare = actualBoard[move.from];
  // const toSquare = actualBoard[move.to];

  if (move.from === move.to || !fromSquare)
    return { board, castleRightUsed: null, enpassantTarget: null };
  const colorValue = fromSquare.color ? -1 : 1;

  board[move.to] = { ...board[move.from], index: move.to };
  delete board[move.from];

  if (move.type === "enpassant") {
    delete board[move.to - 10 * colorValue];
    return { board, castleRightUsed: null, enpassantTarget: null };
  }

  let castleRightUsed: string | null = null;
  if (fromSquare.piece === "k") {
    castleRightUsed = fromSquare.color ? "kq".toUpperCase() : "kq";
    if (move.type === "castle") {
      if (move.to % 10 === 6) {
        board[move.to - 1] = { ...board[move.to + 1], index: move.to - 1 };
        delete board[move.to + 1];
      } else if (move.to % 10 === 2) {
        board[move.to + 1] = { ...board[move.to - 2], index: move.to + 1 };
        delete board[move.to - 2];
      }
    }
  } else if (fromSquare.piece === "r") {
    if (fromSquare.color && move.from === 77) castleRightUsed = "K";
    else if (fromSquare.color && move.from === 70) castleRightUsed = "Q";
    else if (!fromSquare.color && move.from === 7) castleRightUsed = "k";
    else if (!fromSquare.color && move.from === 0) castleRightUsed = "q";
  }
  let enpassantTarget: string | null = null;
  if (fromSquare.piece === "p" && Math.abs(move.to - move.from) === 20) {
    enpassantTarget = convertIndexToTarget(move.from + 10 * colorValue);
  }

  return { board, castleRightUsed, enpassantTarget };
}

export function findDifferences(oldBoard: Board, newBoard: Board) {
  const differences: BoardDifference[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const index = i * 10 + j;
      const oldSquare = oldBoard[index];
      const newSquare = newBoard[index];
      if (
        oldSquare &&
        newSquare &&
        oldSquare.color === newSquare.color &&
        oldSquare.piece === newSquare.piece
      )
        continue;
      if (oldSquare) {
        const diff1 = differences.find(
          (diff) =>
            diff.from === -1 &&
            diff.piece === oldSquare.piece &&
            diff.color === oldSquare.color
        );
        if (diff1) diff1.from = oldSquare.index;
        else
          differences.push({
            piece: oldSquare.piece,
            color: oldSquare.color,
            from: oldSquare.index,
            to: -1,
          });
      }
      if (newSquare) {
        const diff2 = differences.find(
          (diff) =>
            diff.to === -1 &&
            diff.piece === newSquare.piece &&
            diff.color === newSquare.color
        );
        if (diff2) diff2.to = newSquare.index;
        else
          differences.push({
            piece: newSquare.piece,
            color: newSquare.color,
            from: -1,
            to: newSquare.index,
          });
      }
    }
  }
  return differences;
}
