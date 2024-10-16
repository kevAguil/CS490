import {
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, TicTacToeGameState, TicTacToeMove } from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A TicTacToeGame is a Game that implements the rules of Tic Tac Toe.
 * @see https://en.wikipedia.org/wiki/Tic-tac-toe
 */
export default class TicTacToeGame extends Game<TicTacToeGameState, TicTacToeMove> {
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
    });
  }

  // Checks through previous moves to make sure space has not been occupied yet
  private _spaceNotOccuppied(move: GameMove<TicTacToeMove>): boolean {
    let flag: boolean;
    flag = true;
    this.state.moves.forEach(madeMove => {
      if (madeMove.col === move.move.col && madeMove.row === move.move.row) {
        flag = false;
      }
    });
    return flag;
  }

  // Checks if it is the correct player's turn
  private _correctPlayerTurn(move: GameMove<TicTacToeMove>): boolean {
    let flag = false;
    let turns = this.state.moves.length;
    turns %= 2;
    // If there are an even amount of turns made, that means it is player x's turn
    if (turns === 0 && move.playerID === this.state.x) {
      flag = true;
    }
    // If there are an odd amount of turns made, it is player o's turn
    if (turns === 1 && move.playerID === this.state.o) {
      flag = true;
    }
    return flag;
  }

  // Checks if the game is in progress
  private _gameInProgress(): boolean {
    let flag: boolean;
    if (this.state.status === 'IN_PROGRESS') {
      flag = true;
    } else {
      flag = false;
    }
    return flag;
  }

  private _checkForWin(player: 'X' | 'O'): boolean {
    // Create a 3x3 grid to track the player's moves
    const grid: ('X' | 'O' | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    // Fill the grid based on the moves
    this.state.moves.forEach(move => {
      if (move.gamePiece === player) {
        grid[move.row][move.col] = player;
      }
    });
    // Check rows for a win
    for (let i = 0; i < 3; i++) {
      if (grid[i][0] === player && grid[i][1] === player && grid[i][2] === player) {
        return true;
      }
    }
    // Check columns for a win
    for (let i = 0; i < 3; i++) {
      if (grid[0][i] === player && grid[1][i] === player && grid[2][i] === player) {
        return true;
      }
    }
    // Check diagonal (top-left to bottom-right)
    if (grid[0][0] === player && grid[1][1] === player && grid[2][2] === player) {
      return true;
    }
    // Check diagonal (top-right to bottom-left)
    if (grid[0][2] === player && grid[1][1] === player && grid[2][0] === player) {
      return true;
    }
    // No win found
    return false;
  }

  /*
   * Applies a player's move to the game.
   * Uses the player's ID to determine which game piece they are using (ignores move.gamePiece)
   * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
   * the error message specified below.
   * A move is invalid if:
   *    - The move is on a space that is already occupied (use BOARD_POSITION_NOT_EMPTY_MESSAGE)
   *    - The move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   *    - The game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   *
   * If the move is valid, applies the move to the game and updates the game state.
   *
   * If the move ends the game, updates the game's state.
   * If the move results in a tie, updates the game's state to set the status to OVER and sets winner to undefined.
   * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move.
   * A player wins if they have 3 in a row (horizontally, vertically, or diagonally).
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid (with specific message noted above)
   */
  public applyMove(move: GameMove<TicTacToeMove>): void {
    // Check that all conditions of an applied move are satisfied
    if (this._spaceNotOccuppied(move) && this._correctPlayerTurn(move) && this._gameInProgress()) {
      this.state.moves = [
        ...this.state.moves,
        {
          row: move.move.row,
          col: move.move.col,
          gamePiece: move.move.gamePiece, // X or O
        },
      ];
      // Check if player won in this move
      if (this._checkForWin(move.move.gamePiece)) {
        this.state.status = 'OVER';
        this.state.winner = move.playerID;
      }
      // else, check if 9 moves have been made and if it has, then there is a tie since there were no winner
      else if (this.state.moves.length === 9) {
        this.state.status = 'OVER';
        this.state.winner = undefined;
      }
    }
    // Throw errors based on invalid conditions
    else if (!this._gameInProgress()) {
      throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
    } else if (!this._correctPlayerTurn(move)) {
      throw new Error(MOVE_NOT_YOUR_TURN_MESSAGE);
    } else if (!this._spaceNotOccuppied(move)) {
      throw new Error(BOARD_POSITION_NOT_EMPTY_MESSAGE);
    }
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  public _join(player: Player): void {
    // If the joining player is already in the game, we throw an InvalidParametersError
    if (this.state.x === player.id || this.state.o === player.id) {
      throw new Error(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    // If the player is joining a game that is already full, throw an InvalidParametersError
    else if (this.state.x && this.state.o) {
      throw new Error(GAME_FULL_MESSAGE);
    }
    // If the game is empty (no player x or o)
    else if (!this.state.x && !this.state.o) {
      this.state.x = player.id;
    }
    // Player 1 has joined (x) and player 2 (o) is open
    else if (this.state.x && !this.state.o) {
      this.state.o = player.id;
    }
    // Player 1 has joined (o) and player 2 (x) is open
    else if (!this.state.x && this.state.o) {
      this.state.x = player.id;
    }
    // Now we must update status
    if (this.state.x && this.state.o) {
      this.state.status = 'IN_PROGRESS';
    } else {
      this.state.status = 'WAITING_TO_START';
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has two players in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other player.
   * If the game does not yet have two players in it at the time of call to this method,
   *   updates the game's status to WAITING_TO_START.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    // First, check to make sure the player leaving is one of the players in the game; either x or o
    if (this.state.x === player.id || this.state.o === player.id) {
      // If the game has two players in it at the time of call to this method
      if (this.state.x && this.state.o) {
        // Player x is the one to leave
        if (this.state.x === player.id) {
          this.state.winner = this.state.o;
        }
        // else, it must be Player o that is leaving
        else {
          this.state.winner = this.state.x;
        }
        this.state.status = 'OVER';
      }
      // If the game does not yet have two players in it at the time of call to this method
      else {
        // Player x is the one to leave
        if (this.state.x === player.id) {
          this.state.x = undefined;
        }
        // else, it must be Player o that is leaving
        else {
          this.state.o = undefined;
        }
        this.state.status = 'WAITING_TO_START';
      }
    } else {
      throw new Error(PLAYER_NOT_IN_GAME_MESSAGE);
    }
  }
}
