// Chess game logic

// Initial board setup
export const INITIAL_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

// Piece symbols for display
export const PIECE_SYMBOLS = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Check if a piece belongs to white
export const isWhitePiece = (piece) => piece && piece === piece.toUpperCase();

// Check if a piece belongs to black
export const isBlackPiece = (piece) => piece && piece === piece.toLowerCase();

// Get valid moves for a piece
export const getValidMoves = (board, row, col) => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  const isWhite = isWhitePiece(piece);
  const pieceType = piece.toLowerCase();

  switch (pieceType) {
    case 'p':
      getPawnMoves(board, row, col, isWhite, moves);
      break;
    case 'r':
      getRookMoves(board, row, col, isWhite, moves);
      break;
    case 'n':
      getKnightMoves(board, row, col, isWhite, moves);
      break;
    case 'b':
      getBishopMoves(board, row, col, isWhite, moves);
      break;
    case 'q':
      getRookMoves(board, row, col, isWhite, moves);
      getBishopMoves(board, row, col, isWhite, moves);
      break;
    case 'k':
      getKingMoves(board, row, col, isWhite, moves);
      break;
  }

  return moves;
};

// Pawn moves
const getPawnMoves = (board, row, col, isWhite, moves) => {
  const direction = isWhite ? -1 : 1;
  const startRow = isWhite ? 6 : 1;

  // Forward move
  if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
    moves.push([row + direction, col]);
    
    // Double move from starting position
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push([row + 2 * direction, col]);
    }
  }

  // Captures
  for (const dc of [-1, 1]) {
    const newRow = row + direction;
    const newCol = col + dc;
    if (isValidPosition(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (target && (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
        moves.push([newRow, newCol]);
      }
    }
  }
};

// Rook moves
const getRookMoves = (board, row, col, isWhite, moves) => {
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const [dr, dc] of directions) {
    let newRow = row + dr;
    let newCol = col + dc;
    while (isValidPosition(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target) {
        moves.push([newRow, newCol]);
      } else {
        if (isWhite ? isBlackPiece(target) : isWhitePiece(target)) {
          moves.push([newRow, newCol]);
        }
        break;
      }
      newRow += dr;
      newCol += dc;
    }
  }
};

// Knight moves
const getKnightMoves = (board, row, col, isWhite, moves) => {
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of offsets) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (isValidPosition(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target || (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
        moves.push([newRow, newCol]);
      }
    }
  }
};

// Bishop moves
const getBishopMoves = (board, row, col, isWhite, moves) => {
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [dr, dc] of directions) {
    let newRow = row + dr;
    let newCol = col + dc;
    while (isValidPosition(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target) {
        moves.push([newRow, newCol]);
      } else {
        if (isWhite ? isBlackPiece(target) : isWhitePiece(target)) {
          moves.push([newRow, newCol]);
        }
        break;
      }
      newRow += dr;
      newCol += dc;
    }
  }
};

// King moves
const getKingMoves = (board, row, col, isWhite, moves) => {
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  for (const [dr, dc] of offsets) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (isValidPosition(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target || (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
        moves.push([newRow, newCol]);
      }
    }
  }
};

// Check if position is valid
const isValidPosition = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;

// Make a move on the board
export const makeMove = (board, fromRow, fromCol, toRow, toCol) => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[fromRow][fromCol];
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;
  
  // Pawn promotion
  if (piece === 'P' && toRow === 0) {
    newBoard[toRow][toCol] = 'Q';
  } else if (piece === 'p' && toRow === 7) {
    newBoard[toRow][toCol] = 'q';
  }
  
  return newBoard;
};

// Check if king is in check
export const isKingInCheck = (board, isWhite) => {
  let kingRow, kingCol;
  const kingPiece = isWhite ? 'K' : 'k';
  
  // Find king position
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === kingPiece) {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
  }
  
  // Check if any enemy piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && (isWhite ? isBlackPiece(piece) : isWhitePiece(piece))) {
        const moves = getValidMoves(board, row, col);
        if (moves.some(([r, c]) => r === kingRow && c === kingCol)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// Check for checkmate or stalemate
export const isGameOver = (board, isWhite) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && (isWhite ? isWhitePiece(piece) : isBlackPiece(piece))) {
        const moves = getValidMoves(board, row, col);
        for (const [toRow, toCol] of moves) {
          const newBoard = makeMove(board, row, col, toRow, toCol);
          if (!isKingInCheck(newBoard, isWhite)) {
            return false; // At least one valid move exists
          }
        }
      }
    }
  }
  
  return isKingInCheck(board, isWhite) ? 'checkmate' : 'stalemate';
};
