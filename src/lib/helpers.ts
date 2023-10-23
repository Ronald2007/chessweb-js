import { Point } from "../types/index.js";
import { letters } from "./constants.js";

export function convertIndexToPoint(index: number, squareSize: number) {
  const [row, col] = convertIndexToRowCol(index);
  return { x: col * squareSize, y: row * squareSize };
}

export function convertIndexToRowCol(index: number): [number, number] {
  return [Math.floor(index / 10), index % 10];
}

export function clamp(num: number, max: number, min: number = 0) {
  if (num > max) return max;
  else if (num < min) return min;
  else return num;
}

export function convertPointToIndex(point: Point, squareSize: number) {
  const [row, col] = [
    clamp(Math.floor(point.y / squareSize), 7),
    clamp(Math.floor(point.x / squareSize), 7),
  ];
  return row * 10 + col;
}

export function createElement<T extends keyof HTMLElementTagNameMap>(
  type: T,
  ...classNames: string[]
): HTMLElementTagNameMap[T] {
  const el = document.createElement(type);
  el.classList.add(...classNames);
  return el;
}

export function clone<T>(item: T): T {
  return JSON.parse(JSON.stringify(item));
}

export function isIndexValid(index: number) {
  return index >= 0 && index <= 77 && index % 10 <= 7;
}

export function convertTargetToIdx(target: string) {
  const row = 8 - parseInt(target[1]);
  const col = letters.findIndex((l) => l === target[0]);
  return clamp(row, 7) * 10 + clamp(col, 7);
}

export function convertIndexToTarget(index: number) {
  const [row, col] = convertIndexToRowCol(index);
  return `${letters[col]}${8 - row}`;
}

export function translatePoint(point: Point, squareSize: number): string {
  return `translate(${(point.x / squareSize) * 100}%, ${
    (point.y / squareSize) * 100
  }%)`;
}
