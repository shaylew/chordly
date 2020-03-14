import React, { useState, useEffect } from 'react';

import { Player } from '../lib/core';

export const PlayerContext: React.Context<Player | null> = React.createContext<Player | null>(
  null,
);

export function usePlayer(): Player | null {
  return React.useContext(PlayerContext);
}

export const PlayerProvider: React.FC = props => {
  const [player, setPlayer] = useState<Player | null>(null);
  useEffect(() => {
    const p = new Player();
    setPlayer(p);
    return (): void => p.dispose();
  }, []);

  return (
    <PlayerContext.Provider value={player}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default usePlayer;
