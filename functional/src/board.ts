export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type Board<T> = {
  data: (T | undefined)[][];
  generator: Generator<T>;
  matches: Match<T>[];
  width: number;
  height: number;
};

export type Effect<T> = {};

export type MoveResult<T> = {};

export function create<T>(
  generator: Generator<T>,
  width: number,
  height: number
): Board<T> {
  const board: Board<T> = {
    data: [],
    generator: generator,
    matches: [],
    width: width,
    height: height,
  };

  for (let row = 0; row < height; row++) {
    board.data[row] = new Array(width);
    for (let col = 0; col < width; col++) {
      board.data[row][col] = generator.next();
    }
  }

  return board;
}

export function positions<T>(board: Board<T>): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      positions.push({ row, col });
    }
  }
  return positions;
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
  const { row, col } = p;

  if (row >= 0 && row < board.height && col >= 0 && col < board.width) {
    return board.data[row][col];
  }

  return undefined;
}

export function canMove<T>(
  board: Board<T>,
  first: Position,
  second: Position
): boolean {
  const firstPiece = piece(board, first);
  const secondPiece = piece(board, second);

  if (
    firstPiece === undefined ||
    secondPiece === undefined ||
    firstPiece === secondPiece
  ) {
    return false;
  }

  if (first.row === second.row || first.col === second.col) {
    swap(board, first, second);

    const check1 = checkColumnMatch(board, first, secondPiece);
    const check2 = checkColumnMatch(board, second, firstPiece);
    const check3 = checkRowMatch(board, first, secondPiece);
    const check4 = checkRowMatch(board, second, firstPiece);

    swap(board, first, second);

    if (check1 || check2 || check3 || check4) {
      return true;
    }
  }

  return false;
}

function swap<T>(board: Board<T>, first: Position, second: Position): void {
  const firstPiece = piece(board, first);
  const secondPiece = piece(board, second);

  board.data[first.row][first.col] = secondPiece;
  board.data[second.row][second.col] = firstPiece;
}

function checkColumnMatch<T>(
  board: Board<T>,
  position: Position,
  testPiece: T
): boolean {
  const col = position.col;
  const row = position.row;

  for (let i = col - 2; i <= col + 2; i++) {
    if (i >= 0 && i + 2 < board.width) {
      const position1: Position = { row, col: i };
      const position2: Position = { row, col: i + 1 };
      const position3: Position = { row, col: i + 2 };

      const piece1 = piece(board, position1);
      const piece2 = piece(board, position2);
      const piece3 = piece(board, position3);

      if (
        piece1 === testPiece &&
        piece2 === testPiece &&
        piece3 === testPiece
      ) {
        return true;
      }
    }
  }

  return false;
}

function checkRowMatch<T>(
  board: Board<T>,
  position: Position,
  testPiece: T
): boolean {
  const col = position.col;
  const row = position.row;

  for (let i = row - 2; i <= row + 2; i++) {
    if (i >= 0 && i + 2 < board.height) {
      const position1: Position = { row: i, col };
      const position2: Position = { row: i + 1, col };
      const position3: Position = { row: i + 2, col };

      const piece1 = piece(board, position1);
      const piece2 = piece(board, position2);
      const piece3 = piece(board, position3);

      if (
        piece1 === testPiece &&
        piece2 === testPiece &&
        piece3 === testPiece
      ) {
        return true;
      }
    }
  }

  return false;
}

export function move<T>(
  generator: Generator<T>,
  board: Board<T>,
  first: Position,
  second: Position
): MoveResult<T> {
  if (!this.canMove(first, second)) {
    return false;
  }
}
