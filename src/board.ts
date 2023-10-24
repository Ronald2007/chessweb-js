import { convertFENtoPosition, convertPositionToFen } from "./lib/fen.js";
import { COLOR_PIECES } from "./lib/constants.js";
import {
  convertIndexToPoint,
  clamp,
  convertPointToIndex,
  createElement,
  translatePoint,
} from "./lib/helpers.js";
import {
  Board,
  BoardDifference,
  GameController,
  PieceMove,
  Point,
  Position,
} from "./types/index.js";
import { findAllMoves, isKingInCheck } from "./lib/moves.js";
import { findDifferences, playMove } from "./lib/utils.js";
import { convertMoveToNotation } from "./lib/notation.js";

// root element, start position, callback with new position(newPosition)
export function chessboard(
  boardDiv: HTMLDivElement,
  startPosition: Position | string,
  onMove?: (position: Position) => void
) {
  let boardRect = boardDiv.getBoundingClientRect();
  const overDiv = createElement("div", "square", "over", "hidden");
  const selectedDiv = createElement("div", "square", "selected", "hidden");
  const ghostDiv = createElement("div", "ghost", "piece", "hidden");

  let BOARD_SIZE = boardRect.height;
  let SQUARE_SIZE = BOARD_SIZE / 8;
  let CENTER = SQUARE_SIZE / 2;

  const position =
    typeof startPosition === "string"
      ? convertFENtoPosition(startPosition)
      : startPosition;

  let possibleMoves: PieceMove[] = findAllMoves(position);
  let flip = false;

  function initialize(): GameController {
    // create board size & add update on every resize
    setBoardSize();
    let timeout: NodeJS.Timeout; // holder for timeout id
    const delay = 250;
    window.addEventListener("resize", () => {
      clearTimeout(timeout);
      timeout = setTimeout(setBoardSize, delay);
    });

    boardDiv.append(overDiv, selectedDiv, ghostDiv);
    boardDiv.addEventListener("pointerdown", onDragStart);
    displayBoard(position.board);

    return createBoardController();
  }

  function createBoardController(): GameController {
    return {
      flip: flipBoard,
      changePosition,
      clearBoard,
      getOrientation: () => flip,
      destroy: () => (boardDiv.innerHTML = ""),
    };
  }

  function setBoardSize() {
    const rootElement = document.querySelector<HTMLHtmlElement>(":root");
    if (!rootElement) return;
    const parentElement = boardDiv.parentElement;
    let size: number;
    if (!parentElement) {
      const { height, width } = rootElement.getBoundingClientRect();
      size = clamp(height, width);
    } else {
      const { height, width } = parentElement.getBoundingClientRect();
      size = clamp(height, width);
    }
    const padding = size % 8;
    size = Math.floor(size / 8) * 8;

    rootElement.style.setProperty("--board-size", `${size}px`);
    boardDiv.style.margin = `${padding / 2}px ${padding / 2}px`;
    boardRect = boardDiv.getBoundingClientRect();
    BOARD_SIZE = boardRect.height;
    SQUARE_SIZE = BOARD_SIZE / 8;
    CENTER = SQUARE_SIZE / 2;
  }

  function flipBoard(direction?: boolean) {
    flip = direction !== undefined ? direction : !flip;
    document
      .querySelector<HTMLHtmlElement>(":root")
      ?.style.setProperty("--flip-rotation", `${flip ? 180 : 0}deg`);
    return flip;
  }

  function clearBoardIndicators() {
    boardDiv.querySelector(".piece.selected")?.classList.remove("selected");
    boardDiv.querySelector(".piece.dragged")?.classList.remove("dragged");
    boardDiv.querySelector(".piece.ghost")?.classList.remove(...COLOR_PIECES);
    boardDiv.querySelector(".piece.ghost")?.classList.add("hidden");
    boardDiv.querySelector(".square.selected")?.classList.remove("selected");
    boardDiv.querySelector(".square.over")?.classList.add("hidden");
    createPossibleMoves([]);
  }

  function clearBoard() {
    clearBoardIndicators();
    displayBoard([]);
  }

  function changePosition(fenOrPosition: Position | string) {
    const newPosition =
      typeof fenOrPosition === "string"
        ? convertFENtoPosition(fenOrPosition)
        : fenOrPosition;
    const differences = findDifferences(position.board, newPosition.board);
    updateBoard(differences);
    Object.assign(position, newPosition);
    possibleMoves = findAllMoves(position);
  }

  function displayBoard(board: Board) {
    clearBoardIndicators();
    boardDiv
      .querySelectorAll(".piece:not(.ghost)")
      .forEach((el) => el.remove());
    for (const index in board) {
      const square = board[index];
      const point = convertIndexToPoint(square.index, SQUARE_SIZE);
      createPiece(
        point,
        `${square.color ? "w" : "b"}${square.piece}`,
        square.index
      );
    }
  }

  function updateBoard(differences: BoardDifference[]) {
    clearBoardIndicators();
    console.log(differences);
    for (const difference of differences) {
      let pieceDiv: HTMLDivElement | null = null;
      if (difference.from === -1) {
        pieceDiv = createElement(
          "div",
          "piece",
          `${difference.color ? "w" : "b"}${difference.piece}`
        );
      } else {
        pieceDiv = boardDiv.querySelector<HTMLDivElement>(
          `.piece.${difference.color ? "w" : "b"}${
            difference.piece
          }[data-index="${difference.from}"]`
        );
      }
      if (!pieceDiv) continue;
      if (difference.to === -1) {
        pieceDiv.remove();
        continue;
      }
      const point = convertIndexToPoint(difference.to, SQUARE_SIZE);
      pieceDiv.style.transform = translatePoint(point, SQUARE_SIZE);
      pieceDiv.dataset.index = difference.to.toString();
    }
  }

  function createPiece(point: Point, name: string, index: number) {
    const newPieceDiv = createElement("div", "piece", name);
    newPieceDiv.dataset.index = index.toString();
    newPieceDiv.style.transform = translatePoint(point, SQUARE_SIZE);
    newPieceDiv.addEventListener("transitionrun", function () {
      newPieceDiv.style.zIndex = "11";
    });
    newPieceDiv.addEventListener("transitionend", function () {
      newPieceDiv.style.zIndex = "";
    });

    boardDiv.append(newPieceDiv);
  }

  function createPossibleMoves(moves: PieceMove[]) {
    boardDiv
      .querySelectorAll(".square.possible-move")
      .forEach((el) => el.remove());
    for (const move of moves) {
      if (move.type === "castle" && (move.to % 10 === 7 || move.to % 7 == 0))
        continue;
      const possibleMoveDiv = createElement("div", "possible-move", "square");
      if (position.board[move.to]) possibleMoveDiv.classList.add("capture");
      else possibleMoveDiv.classList.add("empty");
      const point = convertIndexToPoint(move.to, SQUARE_SIZE);
      possibleMoveDiv.style.transform = translatePoint(point, SQUARE_SIZE);
      boardDiv.append(possibleMoveDiv);
    }
  }

  function makeMove(move: PieceMove) {
    let notation = convertMoveToNotation(move, position.board);
    const changes = playMove(position.board, move);
    if (
      move.type !== "promotion" &&
      isKingInCheck(changes.board, !position.turn)
    ) {
      notation += "+";
    }

    const differences = findDifferences(position.board, changes.board);

    // update position
    position.halfmoves++;
    if (
      position.board[move.from]?.piece === "p" ||
      position.board[move.to]?.piece === "p"
    )
      position.halfmoves = 0;
    position.board = changes.board;
    if (position.castleRights && changes.castleRightUsed) {
      position.castleRights = position.castleRights.replace(
        changes.castleRightUsed,
        ""
      );
    }
    position.enpassantTarget = changes.enpassantTarget;
    if (!position.turn) position.fullmoves++;
    position.turn = !position.turn;
    position.prevMove = { ...move, notation };
    position.fen = convertPositionToFen(position);

    updateBoard(differences);
    if (move.type === "promotion") {
      return displayPromotionOptions(move);
    }

    possibleMoves = findAllMoves(position);
    onMove?.(position);
    // displayBoard(position.board);
  }

  function displayPromotionOptions(move: PieceMove) {
    const square = position.board[move.to];
    if (!square) return;
    boardDiv.removeEventListener("pointerdown", onDragStart);
    // show promotion options
    const point = convertIndexToPoint(move.to, SQUARE_SIZE);
    point.y = point.y / 4 / (square.color ? 1 : 1.75);
    const dialog = createElement("div", "promotion-dialog");
    dialog.style.transform = translatePoint(point, SQUARE_SIZE);
    dialog.style.flexDirection = "column-reverse";
    for (const piece of ["q", "r", "b", "n"]) {
      const pieceDiv = createElement(
        "div",
        "piece",
        `${square.color ? "w" : "b"}${piece}`
      );
      pieceDiv.addEventListener("click", () => pickPromotionPiece(move, piece));
      dialog.append(pieceDiv);
    }
    boardDiv.append(dialog);
  }

  function pickPromotionPiece(move: PieceMove, piece: string) {
    boardDiv.querySelector(".promotion-dialog")?.remove();
    boardDiv.addEventListener("pointerdown", onDragStart);
    const square = position.board[move.to];
    if (square) {
      position.board[move.to].piece = piece;
      if (position.prevMove) {
        position.prevMove.notation += `=${piece.toUpperCase()}`;
        if (isKingInCheck(position.board, position.turn)) {
          position.prevMove.notation += "+";
        }
      }
      const code = (square.color ? "w" : "b") + "p";
      boardDiv
        .querySelector<HTMLDivElement>(
          `.piece.${code}[data-index="${move.to}"]`
        )
        ?.classList.replace(code, code[0] + piece);
    }
    possibleMoves = findAllMoves(position);
    onMove?.(position);
  }

  function onDragStart(e: MouseEvent) {
    // pointer position relative to board
    const point = {
      x: clamp(e.clientX - boardRect.left, BOARD_SIZE, 0),
      y: clamp(e.clientY - boardRect.top, BOARD_SIZE, 0),
    };
    const dragIndex = convertPointToIndex(point, SQUARE_SIZE, flip);
    const dragTarget = boardDiv.querySelector<HTMLDivElement>(
      `.piece[data-index="${dragIndex}"]`
    );
    const square = position.board[dragIndex];
    const selectedPieceDiv =
      boardDiv.querySelector<HTMLDivElement>(".piece.selected");

    // if piece was already selected of either color
    if (selectedPieceDiv) {
      const selectedSquare =
        position.board[parseInt(selectedPieceDiv.dataset.index ?? "")];
      // if new square is empty or has piece of opposite color
      if (!square || square.color !== selectedSquare?.color)
        return onDragEnd(e);
    }
    if (!dragTarget || !square || square.color !== position.turn) return;

    selectedPieceDiv?.classList.remove("selected");
    dragTarget.classList.add("selected");
    createPossibleMoves(
      possibleMoves.filter((move) => move.from === dragIndex)
    );
    document.addEventListener("pointermove", onDragMove);
    document.addEventListener("pointerup", onDragEnd);
    const selectedPoint = convertIndexToPoint(dragIndex, SQUARE_SIZE);
    // show indicator on square that the piece was selected
    if (selectedDiv) {
      selectedDiv.style.transform = translatePoint(selectedPoint, SQUARE_SIZE);
      selectedDiv.classList.remove("hidden");
    }
    // show faded image of piece on initial square
    if (ghostDiv) {
      ghostDiv.style.transform = translatePoint(selectedPoint, SQUARE_SIZE);
      ghostDiv.classList.add(`${square.color ? "w" : "b"}${square.piece}`);
      ghostDiv.classList.remove("hidden");
    }
  }

  function onDragMove(e: MouseEvent) {
    const dragTarget =
      boardDiv.querySelector<HTMLDivElement>(".piece.selected");
    if (!dragTarget) return selectedDiv?.classList.add("hidden");

    dragTarget.classList.add("dragged");

    // pointer position relative to board
    const point = {
      x: clamp(e.clientX - boardRect.left, BOARD_SIZE, 0),
      y: clamp(e.clientY - boardRect.top, BOARD_SIZE, 0),
    };

    dragTarget.style.transform =
      translatePoint(
        {
          x: point.x - CENTER,
          y: point.y - CENTER,
        },
        SQUARE_SIZE,
        flip
      ) + " scale(1.5)";

    // show indicator on the square the piece is over
    const dropIndex = convertPointToIndex(point, SQUARE_SIZE, flip);
    const dropPoint = convertIndexToPoint(dropIndex, SQUARE_SIZE);
    if (!overDiv) return;
    // multiply SQUARE_SIZE by 2 to account for border size
    overDiv.style.transform = translatePoint(dropPoint, SQUARE_SIZE * 2);
    overDiv.classList.remove("hidden");
  }

  function onDragEnd(e: MouseEvent) {
    overDiv?.classList.add("hidden"); // remove over indicator
    ghostDiv?.classList.add("hidden"); // remove faded piece
    ghostDiv?.classList.remove(...COLOR_PIECES); // remove the piece used

    boardDiv.querySelector(".piece.dragged")?.classList.remove("dragged");
    document.removeEventListener("pointermove", onDragMove);
    document.removeEventListener("pointerup", onDragEnd);

    const dragTarget =
      boardDiv.querySelector<HTMLDivElement>(".piece.selected");
    if (!dragTarget) return selectedDiv?.classList.add("hidden");

    const dragIndex = parseInt(dragTarget.dataset.index ?? "0");
    const dragPoint = convertIndexToPoint(dragIndex, SQUARE_SIZE);
    dragTarget.style.transform = translatePoint(dragPoint, SQUARE_SIZE);
    const dragSquare = position.board[dragIndex];

    // pointer position relative to board
    const point = {
      x: clamp(e.clientX - boardRect.left, BOARD_SIZE, 0),
      y: clamp(e.clientY - boardRect.top, BOARD_SIZE, 0),
    };

    const dropIndex = convertPointToIndex(point, SQUARE_SIZE, flip);
    if (dropIndex === dragIndex) return; // return if dropped in same square
    if (dragSquare && dragSquare.color === position.board[dropIndex]?.color)
      return; // return if dropped on piece of same color

    boardDiv
      .querySelectorAll(".square.possible-move")
      .forEach((el) => el.remove());
    dragTarget.classList.remove("selected");
    selectedDiv?.classList.add("hidden");

    const move = possibleMoves.find(
      (move) => move.from === dragIndex && move.to === dropIndex
    );
    if (!move) return;

    // update board
    makeMove(move);
  }

  return initialize();

  // for testing
  function displayNumbers() {
    for (let i = 0; i < 64; i++) {
      const number = Math.floor(i / 8) * 10 + (i % 8);
      const numberDiv = createElement("div", "number");
      numberDiv.textContent = number.toString();
      const point = convertIndexToPoint(number, SQUARE_SIZE);
      numberDiv.style.transform = translatePoint(point, SQUARE_SIZE);
      boardDiv.append(numberDiv);
    }
  }
}
