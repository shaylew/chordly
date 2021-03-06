import React, { useCallback, useMemo } from 'react';
import { useMachine, useService } from '@xstate/react';
import * as Tone from 'tone';

import {
  makeStyles,
  Grid,
  Container,
  Typography,
  Theme,
} from '@material-ui/core';

import { Song, Chord, Key } from '../types';
import usePlayer from './PlayerContext';
import appMachine from '../machines/main';
import { KeyboardInterpreter } from '../machines/keyboard';
import Sidebar from './Sidebar';
import SongCard from './SongCard';
import Timeline from './Timeline';
import KeySelect from './KeySelect';

const defaultSong: Song = {
  bpm: 240,
  measures: [
    Chord.major('A'),
    Chord.major('E'),
    Chord.minor('F#'),
    Chord.minor('C#'),
    Chord.major('D'),
    Chord.major('A'),
    Chord.major('D'),
    Chord.major('E'),
  ].map(chord => ({ chord })),
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'stretch',
    position: 'relative',
  },
  content: {
    flex: '1 1 0',
    background: theme.palette.background.default,
  },
  footer: {
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    textAlign: 'right',
  },
}));

export const App: React.FC = () => {
  const player = usePlayer();

  const [current, send, mainService] = useMachine(appMachine, {
    context: {
      keySignature: Key.major('C', 'sharp'),
      song: defaultSong,
      player: player,
    },
    activities: {
      playingChord: ({ playingChord }, _activity) => {
        if (playingChord) {
          player?.triggerChordStart(playingChord);
          return () => player?.triggerChordEnd(playingChord);
        }
      },
      playingSong: ({ song }, _activity) => {
        if (song) {
          player?.playSong(song, {
            onMeasure: index => send({ type: 'PLAY.PROGRESS', index }),
            onFinish: () => send('PLAY.FINISH'),
          });
          return () => player?.stopSong();
        }
      },
    },
  });

  const child = mainService.children.get('keyboard') as KeyboardInterpreter;
  const [keyboardState, sendKeyboard] = useService(child);
  const keyboardContext = keyboardState.context;
  const sendButton = send;

  const playingSong = current.matches('playingSong');
  const playingButtonChord = current.matches('playingChord');
  const { keySignature, selectedChord, playingIndex, song } = current.context;

  const onChordAdd = (): void => {
    if (selectedChord) {
      send({ type: 'SONG.ADD_CHORD', chord: selectedChord });
    }
  };

  const onChordDelete = useCallback(
    (_chord: Chord, index: number): void => {
      send({ type: 'SONG.REMOVE_CHORD', index });
    },
    [send],
  );

  const onTogglePlay = (): void => {
    // It has to be here, or the indirection will make the browser forget
    // the sound playing was initiated by a user action!
    Tone.start();
    !playingSong ? send('PLAY.START') : send('PLAY.STOP');
  };

  const classes = useStyles();
  const chordProps = useMemo(() => ({ keySignature }), [keySignature]);

  return (
    <div className={classes.root}>
      {sendKeyboard && (
        <Sidebar
          sendButton={sendButton}
          sendKeyboard={sendKeyboard}
          keyboardContext={keyboardContext}
          keyboardDisabled={playingButtonChord || playingSong}
        />
      )}
      <div className={classes.content}>
        <Container>
          <Typography variant="h1">Chordly</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <KeySelect
                sendKey={send}
                sendButton={sendButton}
                keySignature={keySignature}
              />
            </Grid>

            <Grid item xs={12}>
              <SongCard playing={playingSong} onTogglePlay={onTogglePlay}>
                <Timeline
                  song={song}
                  send={sendButton}
                  onDelete={onChordDelete}
                  onAdd={onChordAdd}
                  selectedChord={selectedChord}
                  playingIndex={playingIndex}
                  chordProps={chordProps}
                />
              </SongCard>
            </Grid>
          </Grid>
        </Container>
      </div>
      <div className={classes.footer}>
        <Typography variant="caption">
          by <a href="https://github.com/shaylew">Shay Lewis</a> / code on{' '}
          <a href="https://github.com/shaylew/chordly">github</a>
        </Typography>
      </div>
    </div>
  );
};

export default App;
