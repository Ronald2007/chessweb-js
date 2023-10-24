export interface Position {
  fen: string;
  board: Board;
  turn: boolean;
  castleRights: string | null;
  enpassantTarget: string | null;
  halfmoves: number;
  fullmoves: number;
  prevMove?: PieceMove & { notation: string };
}
export type Board = Record<number, Square>;
export interface Square {
  index: number;
  color: boolean;
  piece: string;
}
export interface PieceMove {
  from: number;
  to: number;
  capturedPiece?: string;
  type: "normal" | "castle" | "enpassant" | "promotion";
}
export interface BoardChange {
  board: Board;
  castleRightUsed: string | null;
  enpassantTarget: string | null;
}
export interface BoardDifference {
  from: number;
  to: number;
  color: boolean;
  piece: string;
}
export type Point = { x: number; y: number };

export interface GameController {
  flip: (direction?: boolean) => boolean;
  changePosition: (position: string | Position) => void;
  clearBoard: () => void;
  getOrientation: () => boolean;
  destroy: () => void;
}
