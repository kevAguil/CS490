import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import TicTacToeGame from './TicTacToeGame';

/**
 * A TicTacToeGameArea is a GameArea that hosts a TicTacToeGame.
 * @see TicTacToeGame
 * @see GameArea
 */
export default class TicTacToeGameArea extends GameArea<TicTacToeGame> {
  protected getType(): InteractableType {
    return 'TicTacToeArea';
  }

  // Push into history if leave causes game end
  private _updateLeaveStatus(): void {
    if (this._game?.id && this._occupants[0].id === this._game.state.winner) {
      this._history.push({
        gameID: this._game.id,
        scores: {
          [this._occupants[0].userName]: 1,
          [this._occupants[1].userName]: 0,
        },
      });
    } else if (this._game?.id && this._occupants[1].id === this._game.state.winner) {
      this._history.push({
        gameID: this._game.id,
        scores: {
          [this._occupants[0].userName]: 0,
          [this._occupants[1].userName]: 1,
        },
      });
    }
  }

  // Push into history if it is a game ending move
  private _updateApplyMoveWinStatus(): void {
    if (this._game?.state.winner && this._occupants[0].id === this._game.state.winner) {
      this._history.push({
        gameID: this._game.id,
        scores: {
          [this._occupants[0].userName]: 1,
          [this._occupants[1].userName]: 0,
        },
      });
    } else if (this._game?.state.winner && this._occupants[1].id === this._game.state.winner) {
      this._history.push({
        gameID: this._game.id,
        scores: {
          [this._occupants[0].userName]: 0,
          [this._occupants[1].userName]: 1,
        },
      });
    } else if (this._game) {
      this._history.push({
        gameID: this._game.id,
        scores: {
          [this._occupants[0].userName]: 0,
          [this._occupants[1].userName]: 0,
        },
      });
    }
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // Command type 'JoinGame'
    if (command.type === 'JoinGame') {
      if (this._game) {
        this._game.join(player);
      } else {
        this._game = new TicTacToeGame();
      }
      this._emitAreaChanged();
      return { gameID: this._game?.id } as InteractableCommandReturnType<CommandType>;
    }
    // Command type 'LeaveGame'
    if (command.type === 'LeaveGame') {
      if (this._game?.id && this._game?.id === command.gameID) {
        this._game.leave(player);
        this._emitAreaChanged();
        this._updateLeaveStatus();
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      if (this._game?.id && this.game?.id !== command.gameID) {
        throw new Error(GAME_ID_MISSMATCH_MESSAGE);
      } else if (!this._game?.id) {
        throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
    }
    // Command type 'GameMove'
    if (command.type === 'GameMove') {
      if (this._game?.id && this._game.id === command.gameID) {
        this._game.applyMove({
          playerID: player.id,
          gameID: command.gameID,
          move: command.move,
        });
        this._emitAreaChanged();
        // If move ended the game
        if (this._game.state.status === 'OVER') {
          this._updateApplyMoveWinStatus();
        }
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      if (this._game?.id && this.game?.id !== command.gameID) {
        throw new Error(GAME_ID_MISSMATCH_MESSAGE);
      } else if (!this._game?.id) {
        throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
    }
    throw new Error(INVALID_COMMAND_MESSAGE);
  }
}
