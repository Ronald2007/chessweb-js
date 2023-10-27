export interface Move extends Position {}
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
  changePosition: (position: string | Position, animate?: boolean) => void;
  clearBoard: (animate?: boolean) => void;
  getOrientation: () => boolean;
  destroy: () => void;
  toggleCoordinates: (show?: boolean) => void;
  getFen: () => string;
  getPosition: () => Position;
  makeMove?: (moves: PieceMove[], validate?: boolean) => Position;
}

export interface BoardConfig {
  animationDuration?: number; // 150; done
  flipped?: boolean; // false; done
  draggable?: boolean; // true; done
  playable?: boolean; // true; done
  showCoordinates?: boolean; // false; done
  onChange?: (position: Position, type: "newmove" | "changed") => void; // done
}
