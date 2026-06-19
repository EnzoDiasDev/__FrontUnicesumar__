import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Modal,
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
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  autoConnect: false,
});

function App() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [currentTurn, setCurrentTurn] = useState("white");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState("playing");
  const [playerColor, setPlayerColor] = useState(null);
  const [connected, setConnected] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [inputGameId, setInputGameId] = useState("");
  const [lastMove, setLastMove] = useState(null);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setOpponentConnected(false);
    });

    socket.on("game_joined", ({ gameId: newGameId, color }) => {
      setGameId(newGameId);
      setPlayerColor(color);
      setShowModal(false);
    });

    socket.on("opponent_joined", () => {
      setOpponentConnected(true);
    });

    socket.on("opponent_disconnected", () => {
      setOpponentConnected(false);
    });

    socket.on(
      "move_made",
      ({ fromRow, fromCol, toRow, toCol, newTurn, captured }) => {
        setBoard((prevBoard) =>
          makeMove(prevBoard, fromRow, fromCol, toRow, toCol),
        );
        setCurrentTurn(newTurn);
        setSelectedSquare(null);
        setValidMoves([]);
        setLastMove({ fromRow, fromCol, toRow, toCol, captured });
        if (captured) {
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 1000);
        }
      },
    );

    socket.on("game_over", ({ result }) => {
      setGameStatus(result);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateGame = () => {
    socket.emit("create_game");
  };

  const handleJoinGame = () => {
    if (inputGameId.trim()) {
      socket.emit("join_game", { gameId: inputGameId.trim() });
    }
  };

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
        socket.emit("game_over", {
          gameId,
          result:
            gameOver === "checkmate"
              ? isWhite
                ? "black_wins"
                : "white_wins"
              : "draw",
        });
      } else {
        const newTurn = currentTurn === "white" ? "black" : "white";
        setCurrentTurn(newTurn);
        socket.emit("make_move", {
          gameId,
          fromRow,
          fromCol,
          toRow,
          toCol,
          newTurn,
          captured,
        });
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
    socket.emit("reset_game", { gameId });
  };

  const getStatusMessage = () => {
    if (gameStatus === "playing") {
      if (!opponentConnected) {
        return "Aguardando oponente...";
      }
      return currentTurn === "white" ? "Vez das Brancas" : "Vez das Pretas";
    }
    if (gameStatus === "white_wins") return "Brancas Venceram!";
    if (gameStatus === "black_wins") return "Pretas Venceram!";
    if (gameStatus === "draw") return "Empate!";
    return "";
  };

  const canPlay = () => {
    return (
      gameStatus === "playing" &&
      opponentConnected &&
      playerColor === currentTurn
    );
  };

  return (
    <div className="min-vh-100 py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-gradient text-black text-center py-3">
                <h1 className="mb-0">♔ Chess Online ♚</h1>
              </Card.Header>
              <Card.Body className="p-4">
                {/* Connection Status */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Badge bg={connected ? "success" : "danger"}>
                    {connected ? "Conectado" : "Desconectado"}
                  </Badge>
                  {gameId && <Badge bg="info">Sala: {gameId}</Badge>}
                  {playerColor && (
                    <Badge
                      bg={playerColor === "white" ? "light" : "dark"}
                      className="text-dark"
                    >
                      Você: {playerColor === "white" ? "Brancas" : "Pretas"}
                    </Badge>
                  )}
                </div>

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
                  {gameId && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigator.clipboard.writeText(gameId)}
                    >
                      Copiar ID da Sala
                    </Button>
                  )}
                </div>

                {!canPlay() && gameStatus === "playing" && (
                  <Alert variant="warning" className="mt-3 text-center">
                    Aguarde sua vez...
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Game Join Modal */}
      <Modal show={showModal} centered backdrop="static">
        <Modal.Header className="bg-gradient text-white">
          <Modal.Title>Entrar no Jogo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center mb-4">Escolha uma opção para começar:</p>
          <div className="d-grid gap-3">
            <Button variant="primary" size="lg" onClick={handleCreateGame}>
              Criar Nova Sala
            </Button>
            <div className="text-center text-muted">ou</div>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Digite o ID da sala"
                value={inputGameId}
                onChange={(e) => setInputGameId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinGame()}
              />
              <Button variant="success" onClick={handleJoinGame}>
                Entrar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
