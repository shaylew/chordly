import React, { useEffect } from 'react';
import { useMachine } from '@xstate/react';
import * as Tone from 'tone';

import { Grid, Paper } from '@material-ui/core';

import { Song, Chord, Key } from '../types';
import ChordGrid from './ChordGrid';
import SongCard from './SongCard';
import usePlayer from './PlayerContext';
import { TimelineInterpreter } from '../machines/timeline';
import appMachine from '../machines/app';

const defaultSong: Song = {
  bpm: 240,
  measures: [
    Chord.major('A'),
    Chord.major('E'),
    Chord.minor('F#'),
    Chord.minor('C#'),
    Chord.major('D'),
    Chord.major('A', { octave: 3 }),
    Chord.major('D'),
    Chord.major('E'),
  ].map(chord => ({ chord })),
};

export const App: React.FC = () => {
  const player = usePlayer();

  const [current, send, interpreter] = useMachine(appMachine, {
    context: {
      keySignature: Key.major('A'),
    },
    actions: {
      startSong: context => {
        if (!context || !context.timeline) return;
        const song = context.timeline.state.context.song;
        player?.setLoop(context.loop);
        player?.setSong(song);
        player?.startSong(() => send('SONG.FINISH'));
      },
      stopSong: () => {
        player?.stopSong();
      },
    },
  });

  useEffect(() => {
    // interpreter.onEvent(e => console.log(e));
    send({ type: 'SET_SONG', song: defaultSong });
  }, [interpreter]);

  const playing = current.matches('playing');
  const looping = current && current.context.loop;
  const keySignature = current.context.keySignature;

  const timelineMachine = current.context.timeline as TimelineInterpreter;

  const onChordClick = (chord: Chord): void => {
    send({ type: 'PICK_CHORD', chord });
  };

  const onTogglePlay = (): void => {
    // unfortunately if we let the machine do this the browser forgets
    // that the action was user-initiated and prevents the sound.
    Tone.start();
    playing ? send('SONG.STOP') : send('SONG.START');
  };

  const onToggleLoop = (): void => {
    send('LOOP.TOGGLE');
  };

  const onSelectKey = (): void => {
    send('KEY_SELECT.START');
  };

  const onSelectKeyCancel = (): void => {
    send('KEY_SELECT.CANCEL');
  };

  const isSelectingKey = current.matches('pickingKey');

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper elevation={2}>
          <SongCard
            {...{
              playing,
              looping,
              keySignature,
              onSelectKey,
              onSelectKeyCancel,
              isSelectingKey,
              onTogglePlay,
              onToggleLoop,
              timelineMachine,
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <ChordGrid onChordClick={onChordClick} keySignature={keySignature} />
      </Grid>
    </Grid>
  );
};

export default App;
