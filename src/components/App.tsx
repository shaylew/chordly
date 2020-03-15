import React from 'react';
import { useMachine } from '@xstate/react';

import { Grid, Paper } from '@material-ui/core';

import { Song, Chord } from '../types';
import ChordGrid from './ChordGrid';
import SongCard from './SongCard';
import usePlayer from './PlayerContext';
import playerMachine from '../machines/player';
import timelineMachine from '../machines/timeline';

const defaultSong: Song = {
  measures: [
    { chord: { root: 2, intervals: [0, 3, 7], symbol: 'm' } },
    { chord: { root: 5, intervals: [0, 4, 7] } },
    { chord: { root: 7, intervals: [0, 4, 7] } },
    { chord: { root: 0, intervals: [0, 4, 7, 12] } },
  ],
};

export const App: React.FC = () => {
  const player = usePlayer();

  const [tCurrent, tSend, tInterpreter] = useMachine(timelineMachine, {
    context: { song: defaultSong },
  });

  const [pCurrent, pSend, pInterpreter] = useMachine(playerMachine, {
    actions: {
      startSong: () => {
        const song = tCurrent ? tCurrent.context.song : defaultSong;
        player?.setSong(song);
        player?.startSong(() => pSend('PLAYER.FINISH'));
      },
      stopSong: () => {
        player?.stopSong();
      },
    },
  });
  player?.setLoop(pCurrent.context.loop);

  const onChordClick = (chord: Chord): void => {
    tSend({ type: 'PICK_CHORD', value: chord });
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper elevation={2}>
          <SongCard
            playerMachine={pInterpreter}
            timelineMachine={tInterpreter}
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <ChordGrid onChordClick={onChordClick} />
      </Grid>
    </Grid>
  );
};

export default App;
