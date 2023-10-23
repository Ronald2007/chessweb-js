import { Board, PieceMove, Position } from "../types/index.js";
import {
  convertIndexToRowCol,
  convertTargetToIdx,
  isIndexValid,
} from "./helpers.js";
import { playMove } from "./utils.js";

export function findMoves(position: Position, index: number) {
  const uncheckedMoves = getUncheckedMoves(position, index);
  const checkedMoves = uncheckedMoves.filter((move) => {
    const { board } = playMove(position.board, move);
    return !isKingInCheck(board, position.turn);
  });

  return checkedMoves;
}

export function getUncheckedMoves(position: Position, index: number) {
  const moves: PieceMove[] = [];
  const square = position.board[index];
  if (!square || position.turn !== square.color) return moves;

  const piece = square.piece.toLowerCase();
  if (piece === "n") moves.push(...getKnightMoves(position.board, index));
  else if (piece === "b") moves.push(...getBishopMoves(position.board, index));
  else if (piece === "r") moves.push(...getRookMoves(position.board, index));
  else if (piece === "q") moves.push(...getQueenMoves(position.board, index));
  else if (piece === "k")
    moves.push(...getKingMoves(position.board, index, position.castleRights));
  else if (piece === "p")
    moves.push(
      ...getPawnMoves(position.board, index, position.enpassantTarget)
    );

  return moves;
}

export function getAllUncheckedMoves(position: Position) {
  const moves: PieceMove[] = [];

  for (const index in position.board) {
    const square = position.board[index];
    if (square.color === position.turn) {
      moves.push(...getUncheckedMoves(position, square.index));
    }
  }
  return moves;
}

export function getKnightMoves(board: Board, index: number) {
  const moves: PieceMove[] = [];
  const square = board[index];
  if (!square) return moves;
  const rawMoves = [-12, -21, -19, -8, 12, 21, 19, 8];
  for (const moveIdx of rawMoves) {
    const newIdx = index + moveIdx;
    if (!isIndexValid(newIdx)) continue;
    const newSquare = board[newIdx];
    if (newSquare && square.color === newSquare.color) continue;
    moves.push({ from: index, to: newIdx, type: "normal" });
  }
  return moves;
}
export function getBishopMoves(board: Board, index: number) {
  const moves: PieceMove[] = [];
  const square = board[index];
  if (!square) return moves;
  const directions = [-11, -9, 11, 9];
  for (const direction of directions) {
    let newIdx = index + direction;
    while (isIndexValid(newIdx)) {
      const newSquare = board[newIdx];
      if (newSquare && square.color === newSquare.color) break;
      moves.push({ from: index, to: newIdx, type: "normal" });
      if (newSquare && square.color !== newSquare.color) break;
      newIdx += direction;
    }
  }
  return moves;
}
export function getRookMoves(board: Board, index: number) {
  const moves: PieceMove[] = [];
  const square = board[index];
  if (!square) return moves;
  const directions = [-1, -10, 1, 10];
  for (const direction of directions) {
    let newIdx = index + direction;
    while (isIndexValid(newIdx)) {
      const newSquare = board[newIdx];
      if (newSquare && square.color === newSquare.color) break;
      moves.push({ from: index, to: newIdx, type: "normal" });
      if (newSquare && square.color !== newSquare.color) break;
      newIdx += direction;
    }
  }
  return moves;
}
export function getQueenMoves(board: Board, index: number) {
  return [...getRookMoves(board, index), ...getBishopMoves(board, index)];
}
export function getKingMoves(
  board: Board,
  index: number,
  castleRights: string | null = null
) {
  const moves: PieceMove[] = [];
  const square = board[index];
  if (!square) return moves;
  // normal
  const rawMoves = [-1, -11, -10, -9, 1, 11, 10, 9];
  for (const moveIdx of rawMoves) {
    const newIdx = index + moveIdx;
    if (!isIndexValid(newIdx)) continue;
    const newSquare = board[newIdx];
    if (newSquare && square.color === newSquare.color) continue;
    moves.push({ from: index, to: newIdx, type: "normal" });
  }
  // castle
  if (square.color && index === 74) {
    if (castleRights?.includes("K") && !board[75] && !board[76])
      moves.push({ from: index, to: 76, type: "castle" });
    if (castleRights?.includes("Q") && !board[73] && !board[72] && !board[71])
      moves.push({ from: index, to: 72, type: "castle" });
  } else if (!square.color && index === 4) {
    if (castleRights?.includes("k") && !board[5] && !board[6])
      moves.push({ from: index, to: 6, type: "castle" });
    if (castleRights?.includes("q") && !board[3] && !board[2] && !board[1])
      moves.push({ from: index, to: 2, type: "castle" });
  }
  return moves;
}
export function getPawnMoves(
  board: Board,
  index: number,
  enpassantTarget: string | null = null
) {
  const moves: PieceMove[] = [];
  const square = board[index];
  if (!square) return moves;
  const [row] = convertIndexToRowCol(index);
  const colorValue = square.color ? -1 : 1;
  if ((square.color && row === 0) || (!square.color && row === 7)) return moves;
  // normal
  const frontIdx = index + colorValue * 10;
  const frontSquare = board[frontIdx];
  if (!frontSquare) {
    moves.push({ from: index, to: frontIdx, type: "normal" });
    if ((square.color && row === 6) || (!square.color && row === 1)) {
      const secondFrontIdx = frontIdx + colorValue * 10;
      const secondFrontSquare = board[secondFrontIdx];
      if (!secondFrontSquare)
        moves.push({ from: index, to: secondFrontIdx, type: "normal" });
    }
  }
  // captures
  const enpassantTargetIdx = enpassantTarget
    ? convertTargetToIdx(enpassantTarget)
    : null;
  for (const dir of [1, -1]) {
    const captureIdx = frontIdx + dir;
    if (captureIdx === enpassantTargetIdx) {
      moves.push({ from: index, to: captureIdx, type: "enpassant" });
      continue;
    }
    const captureSquare = board[captureIdx];
    if (captureSquare && captureSquare.color !== square.color)
      moves.push({ from: index, to: captureIdx, type: "normal" });
  }
  moves.forEach((move) => {
    if (Math.floor(move.to / 10) === 3.5 + colorValue * 3.5)
      move.type = "promotion";
  });
  return moves;
}

export function isKingInCheck(board: Board, kingColor: boolean) {
  const dummyPosition: Position = {
    board,
    castleRights: null,
    enpassantTarget: null,
    fen: "",
    fullmoves: 0,
    halfmoves: 0,
    turn: !kingColor,
  };
  let kingPosIdx = -1;
  for (const index in board) {
    const square = board[index];
    if (square.piece === "k" && square.color === kingColor) {
      kingPosIdx = square.index;
      break;
    }
  }
  const uncheckedMoves = getAllUncheckedMoves(dummyPosition);
  if (uncheckedMoves.find((move) => move.to === kingPosIdx)) return true;
  return false;
}

export function findAllMoves(position: Position) {
  const moves: PieceMove[] = [];

  for (const index in position.board) {
    const square = position.board[index];
    if (square.color === position.turn) {
      moves.push(...findMoves(position, square.index));
    }
  }
  return moves;
}
