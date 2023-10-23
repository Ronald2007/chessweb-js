import { Board, Position } from "../types/index.js";

export function convertFENtoPosition(fen: string): Position {
  const [
    textPosition,
    turn,
    castleRights,
    enpassantTarget,
    halfmoves,
    fullmoves,
  ] = fen.split(" ");

  const board: Board = {};
  let row = 0;
  let col = 0;
  for (let i = 0; i < textPosition.length; i++) {
    const char = textPosition[i];
    if (char === "/") row++, (col = 0);
    else if (parseInt(char)) col += parseInt(char);
    else {
      board[row * 10 + col] = {
        index: row * 10 + col,
        piece: char.toLowerCase(),
        color: char !== char.toLowerCase(),
      };
      col++;
    }
  }

  return {
    fen,
    board,
    turn: turn === "w",
    castleRights: castleRights !== "-" ? castleRights : null,
    enpassantTarget: enpassantTarget !== "-" ? enpassantTarget : null,
    halfmoves: parseInt(halfmoves) ?? 0,
    fullmoves: parseInt(fullmoves) ?? 0,
  };
}

export function convertBoardToFEN(board: Board): string {
  let fen = "";
  for (let i = 0; i < 8; i++) {
    let count = 0;
    for (let j = 0; j < 8; j++) {
      const square = board[i * 10 + j];
      if (!square) count++;
      else {
        if (count > 0) (fen += count), (count = 0);
        fen += square.color ? square.piece.toUpperCase() : square.piece;
      }
    }
    if (count > 0) fen += count;
    if (i !== 7) fen += "/";
  }

  return fen;
}

export function convertPositionToFen(position: Position): string {
  let fen = "";
  fen += convertBoardToFEN(position.board);
  fen += " " + (position.turn ? "w" : "b");
  fen += " " + (position.castleRights ?? "-");
  fen += " " + (position.enpassantTarget ?? "-");
  fen += " " + position.halfmoves;
  fen += " " + position.fullmoves;
  return fen;
}
