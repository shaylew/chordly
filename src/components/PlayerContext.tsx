import React, { useState, useEffect } from 'react';

import { Player } from '../lib/player';

export const PlayerContext: React.Context<Player | null> = React.createContext<Player | null>(
  null,
);

export function usePlayer(): Player | null {
  return React.useContext(PlayerContext);
}

export const PlayerProvider: React.FC = props => {
  // On the server there's no AudioContext -- nor any point to
  // creating the player -- so the SSR pass just gets null here.
  const [player, _setPlayer] = useState<Player | null>(
    typeof window === 'undefined' ? null : new Player(),
  );
  useEffect(() => {
    return (): void => player?.dispose();
  }, []);

  return (
    <PlayerContext.Provider value={player}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default usePlayer;
