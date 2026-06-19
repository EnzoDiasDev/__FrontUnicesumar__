import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
} from "react-bootstrap";
import ChessBoard from "./components/ChessBoard";
import "./components/ChessBoard.css";
import {
  INITIAL_BOARD,
  getValidMoves,
  makeMove,
  isKingInCheck,
  isGameOver,
} from "./utils/chessLogic";

function App() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [currentTurn, setCurrentTurn] = useState("white");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState("playing");
  const [lastMove, setLastMove] = useState(null);
  const [showParticles, setShowParticles] = useState(false);

  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    if (toRow === null && toCol === null) {
      // Select piece
      const moves = getValidMoves(board, fromRow, fromCol);
      setSelectedSquare({ row: fromRow, col: fromCol });
      setValidMoves(moves);
    } else {
      // Make move
      const captured = board[toRow][toCol] !== null;
      const newBoard = makeMove(board, fromRow, fromCol, toRow, toCol);

      // Check if move puts own king in check
      const isWhite = currentTurn === "white";
      if (isKingInCheck(newBoard, isWhite)) {
        alert("Movimento inválido! Seu rei estaria em xeque.");
        return;
      }

      setBoard(newBoard);
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove({ fromRow, fromCol, toRow, toCol, captured });

      if (captured) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1000);
      }

      // Check for game over
      const gameOver = isGameOver(newBoard, isWhite);
      if (gameOver) {
        setGameStatus(
          gameOver === "checkmate"
            ? isWhite
              ? "black_wins"
              : "white_wins"
            : "draw",
        );
      } else {
        const newTurn = currentTurn === "white" ? "black" : "white";
        setCurrentTurn(newTurn);
      }
    }
  };

  const handleResetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentTurn("white");
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus("playing");
    setLastMove(null);
    setShowParticles(false);
  };

  const getStatusMessage = () => {
    if (gameStatus === "playing") {
      return currentTurn === "white" ? "Vez das Brancas" : "Vez das Pretas";
    }
    if (gameStatus === "white_wins") return "Brancas Venceram!";
    if (gameStatus === "black_wins") return "Pretas Venceram!";
    if (gameStatus === "draw") return "Empate!";
    return "";
  };

  const canPlay = () => {
    return gameStatus === "playing";
  };

  return (
    <div className="min-vh-100 py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-gradient text-black text-center py-3">
                <h1 className="mb-0">♔ Chess Local ♚</h1>
              </Card.Header>
              <Card.Body className="p-4">

                {/* Game Status */}
                <Alert
                  variant={gameStatus === "playing" ? "info" : "success"}
                  className="text-center"
                >
                  <h5 className="mb-0">{getStatusMessage()}</h5>
                </Alert>

                {/* Chess Board */}
                <div className="d-flex justify-content-center mb-4 position-relative">
                  {showParticles && (
                    <div className="particle-effect">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="particle"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            background: [
                              "#ff6b6b",
                              "#feca57",
                              "#48dbfb",
                              "#ff9ff3",
                              "#54a0ff",
                            ][Math.floor(Math.random() * 5)],
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <ChessBoard
                    board={board}
                    onMove={handleMove}
                    currentTurn={currentTurn}
                    selectedSquare={selectedSquare}
                    validMoves={validMoves}
                    lastMove={lastMove}
                  />
                </div>

                {/* Controls */}
                <div className="d-flex justify-content-center gap-3">
                  {gameStatus !== "playing" && (
                    <Button variant="primary" onClick={handleResetGame}>
                      Nova Partida
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
