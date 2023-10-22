export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type Refill = {};

export type BoardEvent<T> =
  | {
      kind: "Match";
      match: Match<T>;
    }
  | {
      kind: "Refill";
    };

export type BoardListener<T> = (event: BoardEvent<T>) => void;

export class Board<T> {
  board: (T | undefined)[][];
  listeners: BoardListener<T>[] = [];
  generator: Generator<T>;
  matches: Match<T>[];
  width: number;
  height: number;

  constructor(generator: Generator<T>, width: number, height: number) {
    this.generator = generator;
    this.width = width;
    this.height = height;
    this.board = [];
    this.matches = [];

    // Fill the board with initial values and remove any initial matches
    for (let row = 0; row < height; row++) {
      this.board.push([]);
      for (let col = 0; col < width; col++) {
        this.board[row].push(this.generator.next());
      }
    }

    while (this.findMatches()) {
      this.doMatch();
    }
  }

  // Returns an array of all positions on the board
  positions(): Position[] {
    const positionsTR: Position[] = [];

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        positionsTR.push({ row, col });
      }
    }

    return positionsTR;
  }

  // Add a listener to the board to receive events
  addListener(listener: BoardListener<T>) {
    this.listeners.push(listener);
  }

  // Get the piece at a specific position
  piece(p: Position): T | undefined {
    if (p.row < 0 || p.col < 0 || p.row >= this.height || p.col >= this.width) {
      return undefined;
    }

    return this.board[p.row][p.col];
  }

  // Check if two pieces can be swapped, considering match possibilities
  canMove(positionA: Position, positionB: Position): boolean {
    let pieceA = this.piece(positionA);
    let pieceB = this.piece(positionB);

    if (pieceA === undefined || pieceB === undefined || pieceA === pieceB)
      return false;

    if (positionA.col === positionB.col || positionA.row === positionB.row) {
      this.change(positionA, positionB);

      let isColumnMatch1 = this.evaluateColumnMatch(positionA, pieceB);
      let isColumnMatch2 = this.evaluateColumnMatch(positionB, pieceA);
      let isColumnMatch3 = this.evaluateRowMatch(positionA, pieceB);
      let isColumnMatch4 = this.evaluateRowMatch(positionB, pieceA);

      if (
        isColumnMatch1 ||
        isColumnMatch2 ||
        isColumnMatch3 ||
        isColumnMatch4
      ) {
        this.change(positionA, positionB);
        return true;
      } else {
        this.change(positionA, positionB);
      }
    }

    return false;
  }

  // Evaluate if there is a vertical column match for a given position and target piece.
  private evaluateColumnMatch(position: Position, targetPiece: T): boolean {
    const column = position.col;
    const row = position.row;

    for (let i = column - 2; i <= column + 2; i++) {
      if (i >= 0 && i + 2 < this.width) {
        const position1 = { row, col: i };
        const position2 = { row, col: i + 1 };
        const position3 = { row, col: i + 2 };

        const piece1 = this.piece(position1);
        const piece2 = this.piece(position2);
        const piece3 = this.piece(position3);

        if (
          piece1 === targetPiece &&
          piece2 === targetPiece &&
          piece3 === targetPiece
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // Evaluate if there is a horizontal row match for a given position and target piece.
  private evaluateRowMatch(position: Position, targetPiece: T): boolean {
    const column = position.col;
    const row = position.row;

    for (let i = row - 2; i <= row + 2; i++) {
      if (i >= 0 && i + 2 < this.height) {
        const position1 = { row: i, col: column };
        const position2 = { row: i + 1, col: column };
        const position3 = { row: i + 2, col: column };

        const piece1 = this.piece(position1);
        const piece2 = this.piece(position2);
        const piece3 = this.piece(position3);

        if (
          piece1 === targetPiece &&
          piece2 === targetPiece &&
          piece3 === targetPiece
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // Move a game piece from the first position to the second position on the game board.
  move(first: Position, second: Position) {
    if (this.canMove(first, second)) {
      this.change(first, second);
      while (this.findMatches()) {
        this.doMatch();
      }
    }
  }

  // Swap two pieces on the board
  private change(first: Position, second: Position) {
    let firstPiece = this.piece(first);
    let secondPiece = this.piece(second);

    this.board[first.row][first.col] = secondPiece;
    this.board[second.row][second.col] = firstPiece;
  }

  // Perform the matching process on the board
  private doMatch() {
    this.matches.forEach((match) => {
      let position1 = match.positions[0];
      let position2 = match.positions[1];
      let position3 = match.positions[2];

      this.board[position1.row][position1.col] = undefined;
      this.board[position2.row][position2.col] = undefined;
      this.board[position3.row][position3.col] = undefined;
    });

    this.matches = [];

    this.alert({ kind: "Refill" });
    this.refillBoard();
  }

  // Find and remove matching pieces on the board
  private findMatches(): boolean {
    let columnMatch = false;
    let rowMatch = false;

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width - 2; col++) {
        if (!columnMatch) {
          columnMatch = this.findColumnMatch(row, col);
        }
      }
    }

    for (let row = 0; row < this.height - 2; row++) {
      for (let col = 0; col < this.width; col++) {
        if (!rowMatch) {
          rowMatch = this.findRowMatch(row, col);
        }
      }
    }

    return columnMatch || rowMatch;
  }

  // Check if a column has matching pieces
  private findColumnMatch(row: number, col: number): boolean {
    let position1 = { row, col };
    let position2 = { row, col: col + 1 };
    let position3 = { row, col: col + 2 };

    let piece1 = this.piece(position1);
    let piece2 = this.piece(position2);
    let piece3 = this.piece(position3);

    if (piece1 === piece2 && piece2 === piece3 && piece1 === piece3) {
      let positions = [position1, position2, position3];
      let match = { matched: piece1, positions };

      this.alert({ kind: "Match", match });
      this.matches.push(match);

      return true;
    }

    return false;
  }

  // Check if a row has matching pieces
  private findRowMatch(row: number, col: number): boolean {
    let position1 = { row, col };
    let position2 = { row: row + 1, col };
    let position3 = { row: row + 2, col };

    let piece1 = this.piece(position1);
    let piece2 = this.piece(position2);
    let piece3 = this.piece(position3);

    if (piece1 === piece2 && piece2 === piece3 && piece1 === piece3) {
      let positions = [position1, position2, position3];
      let match = { matched: piece1, positions };

      this.alert({ kind: "Match", match });
      this.matches.push(match);

      return true;
    }

    return false;
  }

  // Notify listeners of a board event
  private alert(event: BoardEvent<T>): void {
    this.listeners.forEach((listener) => listener(event));
  }

  // Refill the board with new pieces and remove matches
  private refillBoard() {
    for (let col = 0; col < this.width; col++) {
      const newColumn: (T | undefined)[] = [];

      for (let row = this.height - 1; row >= 0; row--) {
        if (this.board[row][col] === undefined) {
          let rowAbove = row - 1;
          while (rowAbove >= 0 && this.board[rowAbove][col] === undefined) {
            rowAbove--;
          }

          if (rowAbove >= 0) {
            this.board[row][col] = this.board[rowAbove][col];
            this.board[rowAbove][col] = undefined;
          } else {
            this.board[row][col] = this.generator.next();
          }
        }
        newColumn.unshift(this.board[row][col]);
      }

      for (let row = 0; row < this.height; row++) {
        this.board[row][col] = newColumn[row];
      }
    }

    while (this.findMatches()) {
      this.doMatch();
    }
  }
}
