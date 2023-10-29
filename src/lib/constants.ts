import { BoardConfig } from "../types/index";

export const INITIAL_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const PROMOTION_FEN =
  "rnb1kbnr/pppp2Pp/4pq2/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 5";
export const SAMPLE_FEN =
  "3K3b/np1P2pP/1nrp3P/r1p1BBk1/3QPRb1/2PRPP1q/pPp2pp1/3N2N1 w - - 0 1";

export const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];

// prettier-ignore
export const COLOR_PIECES = [
  "wp", "wk", "wq", "wr", "wb", "wn",
  "bk", "bq", "br", "bb", "bn", "bp",
] as const;

export const WIKIMEDIA_PIECES: {
  [key in (typeof COLOR_PIECES)[number]]: string;
} = {
  // white pieces
  wp: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
  wk: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
  wq: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
  wr: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
  wb: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
  wn: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
  // black pieces
  bp: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
  bk: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
  bq: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
  br: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
  bb: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
  bn: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
};

export const DEFAULT_BOARD_CONFIG: BoardConfig = {
  showCoordinates: false,
  animationDuration: 150,
  draggable: true,
  playable: true,
  flipped: false,
  onChange: undefined,
  pieceTheme: WIKIMEDIA_PIECES,
  boardTheme: "green",
};
