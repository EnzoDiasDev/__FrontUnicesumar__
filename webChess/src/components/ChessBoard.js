import React from 'react';
import { getValidMoves, makeMove, PIECE_SYMBOLS, isWhitePiece, isBlackPiece } from '../utils/chessLogic';

const ChessBoard = ({ board, onMove, currentTurn, selectedSquare, validMoves, lastMove }) => {
  const handleSquareClick = (row, col) => {
    const piece = board[row][col];
    
    // If a piece is selected and clicking on a valid move
    if (selectedSquare && validMoves.some(([r, c]) => r === row && c === col)) {
      onMove(selectedSquare.row, selectedSquare.col, row, col);
      return;
    }
    
    // If clicking on own piece, select it
    if (piece) {
      const isWhite = isWhitePiece(piece);
      if ((currentTurn === 'white' && isWhite) || (currentTurn === 'black' && isBlackPiece(piece))) {
        onMove(row, col, null, null); // Select piece
      }
    }
  };

  const isSelected = (row, col) => 
    selectedSquare && selectedSquare.row === row && selectedSquare.col === col;

  const isValidMove = (row, col) => 
    validMoves.some(([r, c]) => r === row && c === col);

  const isLastMove = (row, col) => 
    lastMove && ((lastMove.fromRow === row && lastMove.fromCol === col) || 
                 (lastMove.toRow === row && lastMove.toCol === col));

  const isCapture = (row, col) => 
    lastMove && lastMove.toRow === row && lastMove.toCol === col && lastMove.captured;

  const getSquareColor = (row, col) => {
    const isLight = (row + col) % 2 === 0;
    return isLight ? 'light-square' : 'dark-square';
  };

  return (
    <div className="chess-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="chess-row">
          {row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`chess-square ${getSquareColor(rowIndex, colIndex)} ${
                isSelected(rowIndex, colIndex) ? 'selected' : ''
              } ${isValidMove(rowIndex, colIndex) ? 'valid-move' : ''} ${
                isLastMove(rowIndex, colIndex) ? 'last-move' : ''
              } ${isCapture(rowIndex, colIndex) ? 'capture' : ''}`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <span className="chess-piece" style={{
                  animationDelay: `${(rowIndex + colIndex) * 0.1}s`
                }}>
                  {PIECE_SYMBOLS[piece]}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ChessBoard;
