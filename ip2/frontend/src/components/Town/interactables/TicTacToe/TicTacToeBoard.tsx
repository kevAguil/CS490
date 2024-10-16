import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import TicTacToeAreaController from '../../../../classes/interactable/TicTacToeAreaController';
import { TicTacToeGridPosition } from '../../../../types/CoveyTownSocket';

export type TicTacToeGameProps = {
  gameAreaController: TicTacToeAreaController;
};

/**
 * A component that will render a single cell in the TicTacToe board, styled
 */
const StyledTicTacToeSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    border: '1px solid black',
    height: '33%',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
  },
});
/**
 * A component that will render the TicTacToe board, styled
 */
const StyledTicTacToeBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

/**
 * A component that renders the TicTacToe board
 *
 * Renders the TicTacToe board as a "StyledTicTacToeBoard", which consists of 9 "StyledTicTacToeSquare"s
 * (one for each cell in the board, starting from the top left and going left to right, top to bottom).
 * Each StyledTicTacToeSquare has an aria-label property that describes the cell's position in the board,
 * formatted as `Cell ${rowIndex},${colIndex}`.
 *
 * The board is re-rendered whenever the board changes, and each cell is re-rendered whenever the value
 * of that cell changes.
 *
 * If the current player is in the game, then each StyledTicTacToeSquare is clickable, and clicking
 * on it will make a move in that cell. If there is an error making the move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the StyledTicTacToeSquare will be disabled.
 *
 * @param gameAreaController the controller for the TicTacToe game
 */
export default function TicTacToeBoard({ gameAreaController }: TicTacToeGameProps): JSX.Element {
  //TODO - implement this component (delete what's here first)
  const [board, setBoard] = useState(gameAreaController.board);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const toast = useToast();

  useEffect(() => {
    const updateBoard = () => {
      setBoard(gameAreaController.board);
      setIsOurTurn(gameAreaController.isOurTurn);
    };

    // Listen for board updates
    gameAreaController.addListener('boardChanged', updateBoard);
    gameAreaController.addListener('gameUpdated', updateBoard);
    gameAreaController.addListener('turnChanged', updateBoard);
    // Cleanup listeners on component unmount
    return () => {
      gameAreaController.removeListener('boardChanged', updateBoard);
      gameAreaController.removeListener('gameUpdated', updateBoard);
      gameAreaController.addListener('turnChanged', updateBoard);
    };
  }, [gameAreaController]);

  const handleMove = async (row: number, col: number) => {
    try {
      await gameAreaController.makeMove(row as TicTacToeGridPosition, col as TicTacToeGridPosition);
    } catch (error) {
      toast({
        description: '' + error,
        status: 'error',
      });
    }
  };

  return (
    <StyledTicTacToeBoard aria-label='Tic-Tac-Toe Board'>
      {board.map((row, rowIndex) =>
        row.map((_, colIndex) => (
          <StyledTicTacToeSquare
            key={`cell-${rowIndex}-${colIndex}`}
            aria-label={`Cell ${rowIndex},${colIndex}`}
            isDisabled={!isOurTurn}
            onClick={() => handleMove(rowIndex, colIndex)}>
            {board[rowIndex][colIndex]}
          </StyledTicTacToeSquare>
        )),
      )}
    </StyledTicTacToeBoard>
  );
}
