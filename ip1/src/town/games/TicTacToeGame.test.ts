import { createPlayerForTesting } from '../../TestUtils';
import {
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { TicTacToeMove } from '../../types/CoveyTownSocket';
import TicTacToeGame from './TicTacToeGame';

describe('TicTacToeGame', () => {
  let game: TicTacToeGame;

  beforeEach(() => {
    game = new TicTacToeGame();
  });

  describe('[T1.1] _join', () => {
    describe('When the player can be added', () => {
      it('makes the first player X and initializes the state with status WAITING_TO_START', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.x).toEqual(player.id);
        expect(game.state.o).toBeUndefined();
        expect(game.state.moves).toHaveLength(0);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
      it('when the second player joins makes the second player O', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        expect(game.state.x).toEqual(player1.id);
        expect(game.state.o).toEqual(player2.id);
        expect(game.state.moves).toHaveLength(0);
      });
      it('when the second player joins set status to IN_PROGRESS', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        expect(game.state.x).toEqual(player1.id);
        expect(game.state.o).toEqual(player2.id);
        expect(game.state.moves).toHaveLength(0);
        expect(game.state.status).toEqual('IN_PROGRESS');
        expect(game.state.winner).toBeUndefined();
      });
    });
    describe('When a player cannot be added', () => {
      it('when a player joins a game that is already full throw GAME_FULL_MESSAGE', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const player3 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
      });
      it('when a player joins a game they are already in, throw PLAYER_ALREADY_IN_GAME_MESSAGE', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      });
    });
  });
  describe('[T1.2] _leave', () => {
    describe('When the player is in the game', () => {
      describe('when the game is in progress, it should set the game status to OVER and declare the other player the winner', () => {
        test('when x leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);

          game.leave(player1);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);
        });
        test('when o leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);

          game.leave(player2);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);
        });
      });
      describe('when the game is waiting to start, it removes the player attempting to leave and set player to undefined', () => {
        test('when x leaves', () => {
          const player1 = createPlayerForTesting();
          game.join(player1);

          expect(game.state.x).toEqual(player1.id);

          game.leave(player1);

          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.x).toEqual(undefined);
        });
      });
    });
    describe('When the player is not in the game, throw PLAYER_NOT_IN_GAME_MESSAGE', () => {
      it('when a player not in the game tries to leave while a game is waiting to start', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();

        game.join(player1);

        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(() => {
          game.leave(player2);
        }).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
      it('when a player not in the game tries to leave a game in progress', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const player3 = createPlayerForTesting();

        game.join(player1);
        game.join(player2);

        expect(game.state.status).toEqual('IN_PROGRESS');
        expect(() => {
          game.leave(player3);
        }).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
    });
  });
  describe('[T2.1] applyMove', () => {
    describe('When given a valid move', () => {
      let player1: Player;
      let player2: Player;
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
      });
      it('should add the move to the game state', () => {
        const move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        expect(game.state.moves).toHaveLength(1);
        expect(game.state.moves[0]).toEqual(move);
        expect(game.state.status).toEqual('IN_PROGRESS');
      });
      it('should add the move to the game state in the middle of a game', () => {
        let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        move = { row: 1, col: 1, gamePiece: 'O' };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        });
        move = { row: 2, col: 2, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        move = { row: 0, col: 1, gamePiece: 'O' };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        });
        expect(game.state.moves).toHaveLength(4);
        expect(game.state.moves[3]).toEqual(move);
        expect(game.state.status).toEqual('IN_PROGRESS');
      });
      describe('When given a valid game ending move', () => {
        it('When player 1 (X) wins horizontally, update game state to OVER and winner to player 1 id (X)', () => {
          let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(5);
          expect(game.state.moves[4]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
        });
        it('When player 1 (X) wins horizontally (another way), update game state to OVER and winner to player 1 id (X)', () => {
          let move: TicTacToeMove = { row: 2, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(5);
          expect(game.state.moves[4]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
        });
        it('When player 1 (X) wins vertically, update game state to OVER and winner to player 1 id (X)', () => {
          let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 0, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(5);
          expect(game.state.moves[4]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
        });
        it('When player 1 (X) wins diagonal (top left - bottom right), update game state to OVER and winner to player 1 id (X)', () => {
          let move: TicTacToeMove = { row: 1, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 0, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(5);
          expect(game.state.moves[4]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
        });
        it('When player 1 (X) wins diagonal (top right - bottom left), update game state to OVER and winner to player 1 id (X)', () => {
          let move: TicTacToeMove = { row: 0, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(5);
          expect(game.state.moves[4]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
        });
        it('When player 2 (O) wins horizontally, update game state to OVER and winner to player 2 id (O)', () => {
          let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 2, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 0, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          expect(game.state.moves).toHaveLength(6);
          expect(game.state.moves[5]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
        });
        it('When player 2 (O) wins vertically, update game state to OVER and winner to player 2 id (O)', () => {
          let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          expect(game.state.moves).toHaveLength(6);
          expect(game.state.moves[5]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
        });
        it('When player 2 (O) wins vertically (another way), update game state to OVER and winner to player 2 id (O)', () => {
          let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 0, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 1, col: 0, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 0, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          expect(game.state.moves).toHaveLength(6);
          expect(game.state.moves[5]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
        });
        it('When player 2 (O) wins diagonol (top right - bottom left), update game state to OVER and winner to player 2 id (O)', () => {
          let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 2, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 0, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          expect(game.state.moves).toHaveLength(6);
          expect(game.state.moves[5]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
        });
        it('When player 2 (O) wins diagonol (top left - bottom right), update game state to OVER and winner to player 2 id (O)', () => {
          let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 0, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 2, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          expect(game.state.moves).toHaveLength(6);
          expect(game.state.moves[5]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
        });
        it('When all the spaces on the board has been taken and ends in a tie, status must be OVER and have winner as undefined', () => {
          let move: TicTacToeMove = { row: 0, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 2, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 1, col: 0, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 2, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(9);
          expect(game.state.moves[8]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toBeUndefined();
        });
        it('When all the spaces on the board has been taken and ends in a win for player 1 (x), status must be OVER and winner set to player 1 id', () => {
          let move: TicTacToeMove = { row: 0, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 0, col: 2, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 0, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 1, col: 2, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 1, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 1, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 1, col: 0, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          move = { row: 2, col: 0, gamePiece: 'O' };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
          move = { row: 2, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(9);
          expect(game.state.moves[8]).toEqual(move);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
        });
      });
    });
    describe('When given an invalid move in a game not in progress', () => {
      it('move trying to be made when a game is not in progress, throw GAME_NOT_IN_PROGRESS_MESSAGE', () => {
        const player1 = createPlayerForTesting();

        game.join(player1);

        expect(game.state.status).toEqual('WAITING_TO_START');

        const move: TicTacToeMove = { row: 0, col: 0, gamePiece: 'X' };

        expect(() => {
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
        }).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
    });
    describe('When given an invalid move in a game in progress', () => {
      let player1: Player;
      let player2: Player;
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
      });
      it('move made when it is not the correct players turn (player 1 goes twice), throw MOVE_NOT_YOUR_TURN_MESSAGE', () => {
        let move: TicTacToeMove = { row: 0, col: 0, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        move = { row: 0, col: 2, gamePiece: 'O' };
        expect(() => {
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
        }).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
      });
      it('move made when it is not the correct players turn (player 2 goes first), throw MOVE_NOT_YOUR_TURN_MESSAGE', () => {
        const move: TicTacToeMove = { row: 0, col: 0, gamePiece: 'X' };
        expect(() => {
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
        }).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
      });
      it('move made when it is not the correct players turn (player 2 goes twice), throw MOVE_NOT_YOUR_TURN_MESSAGE', () => {
        let move: TicTacToeMove = { row: 0, col: 0, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        move = { row: 0, col: 2, gamePiece: 'O' };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        });
        move = { row: 0, col: 1, gamePiece: 'X' };
        expect(() => {
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
        }).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
      });
      it('A player attempts to make a move on a spot already occupied, throw BOARD_POSITION_NOT_EMPTY_MESSAGE', () => {
        let move: TicTacToeMove = { row: 0, col: 0, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        move = { row: 0, col: 0, gamePiece: 'O' };
        expect(() => {
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move,
          });
        }).toThrowError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
      });
      it('When player 2 (O) wins, and a move is trying to be made after the game ends, throw GAME_NOT_IN_PROGRESS_MESSAGE', () => {
        let move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        move = { row: 0, col: 1, gamePiece: 'O' };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        });
        move = { row: 2, col: 0, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        move = { row: 0, col: 2, gamePiece: 'O' };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        });
        move = { row: 1, col: 0, gamePiece: 'X' };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        move = { row: 0, col: 0, gamePiece: 'O' };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        });
        expect(game.state.status).toEqual('OVER');
        expect(game.state.winner).toEqual(player2.id);
        move = { row: 2, col: 2, gamePiece: 'X' };
        expect(() => {
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
        }).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
    });
  });
});
