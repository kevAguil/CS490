import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import TicTacToeAreaController from '../../../../classes/interactable/TicTacToeAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import Leaderboard from '../Leaderboard';

/**
 * The TicTacToeArea component renders the TicTacToe game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicTacToeAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A leaderboard (@see Leaderboard.tsx), which is passed the game history as a prop
 * - A list of observers' usernames (in a list with the aria-label 'list of observers in the game', one username per-listitem)
 * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for X and one for O)
 *    - If there is no player in the game, the username is '(No player yet!)'
 *    - List the players as (exactly) `X: ${username}` and `O: ${username}`
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, {moveCount} moves in, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, {moveCount} moves in, currently your turn'
 *    - Otherwise the message is 'Game {not yet started | over}.'
 * - If the game is in status WAITING_TO_START or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 * - The TicTacToeBoard component, which is passed the current gameAreaController as a prop (@see TicTacToeBoard.tsx)
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Tie: description 'Game ended in a tie'
 *    - Our player won: description 'You won!'
 *    - Our player lost: description 'You lost :('
 *
 */
function TicTacToeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<TicTacToeAreaController>(interactableID);
  const townController = useTownController();
  // TODO - implement this component
  const [gameStatus, setGameStatus] = useState(gameAreaController.status);
  const [isLoading, setIsLoading] = useState(false);
  const [playerO, setPlayerO] = useState(gameAreaController.o);
  const [playerX, setPlayerX] = useState(gameAreaController.x);
  const [moveCount, setMoveCount] = useState(gameAreaController.moveCount);
  const [whoseTurn, setWhoseTurn] = useState(gameAreaController.whoseTurn);
  const [observers, setObservers] = useState(gameAreaController.observers);
  const [history, setHistory] = useState(gameAreaController.history);
  const toast = useToast();
  //return <>{gameAreaController.status}</>;

  useEffect(() => {
    const updateGame = () => {
      setMoveCount(gameAreaController.moveCount);
      setGameStatus(gameAreaController.status);
      setWhoseTurn(gameAreaController.whoseTurn);
      setPlayerO(gameAreaController.o);
      setPlayerX(gameAreaController.x);
      setObservers(gameAreaController.observers);
      setHistory(gameAreaController.history);
    };

    const handleGameEnd = () => {
      const winner = gameAreaController.winner;
      if (winner === undefined) {
        toast({ description: 'Game ended in a tie' });
      } else if (winner.id === townController.ourPlayer.id) {
        toast({ description: 'You won!' });
      } else {
        toast({ description: 'You lost :(' });
      }
      setGameStatus('OVER');
    };

    gameAreaController.addListener('gameUpdated', updateGame);
    gameAreaController.addListener('gameEnd', handleGameEnd);

    return () => {
      gameAreaController.removeListener('gameUpdated', updateGame);
      gameAreaController.removeListener('gameEnd', handleGameEnd);
    };
  }, [gameAreaController, toast, townController]);

  // Function to handle joining the game
  const joinGame = async () => {
    setIsLoading(true);
    try {
      await gameAreaController.joinGame();
      toast({ description: 'Successfully joined the game!', status: 'success' });
    } catch (error) {
      toast({
        description: '' + error,
        status: 'error',
      });
    }
    setIsLoading(false);
  };

  // Player and observer lists
  const playersList = (
    <ul aria-label='list of players in the game'>
      <li>X: {playerX?.userName || '(No player yet!)'}</li>
      <li>O: {playerO?.userName || '(No player yet!)'}</li>
    </ul>
  );

  const observersList = (
    <ul aria-label='list of observers in the game'>
      {observers.map(observer => (
        <li key={observer.id}>{observer.userName}</li>
      ))}
    </ul>
  );

  // Status message based on game state
  const statusMessage =
    gameStatus === 'IN_PROGRESS'
      ? `Game in progress, ${moveCount} moves in, currently ${
          whoseTurn === townController.ourPlayer ? 'your turn' : whoseTurn?.userName
        }'s turn`
      : `Game ${gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}.`;

  return (
    <div>
      <Leaderboard results={history || []} />
      {statusMessage}
      Observers: {observersList}
      {playersList}
      {(gameStatus === 'WAITING_TO_START' || gameStatus === 'OVER') &&
        playerX?.id !== townController.ourPlayer.id && (
          <Button onClick={joinGame} isLoading={isLoading} isDisabled={isLoading}>
            Join New Game
          </Button>
        )}
    </div>
  );
}

// Do not edit below this line
/**
 * A wrapper component for the TicTacToeArea component.
 * Determines if the player is currently in a tic tac toe area on the map, and if so,
 * renders the TicTacToeArea component in a modal.
 *
 */
export default function TicTacToeAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'TicTacToe') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <TicTacToeArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
