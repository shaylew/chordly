import React, { useCallback } from 'react';
import { useMachine } from '@xstate/react';
import * as Tone from 'tone';

import {
  makeStyles,
  Grid,
  Card,
  CardContent,
  Container,
  Typography,
  Theme,
} from '@material-ui/core';

import { Song, Chord, Key, pitchClasses } from '../types';
import usePlayer from './PlayerContext';
import appMachine, { AppContext, AppEvent } from '../machines/main';
import { KeyboardInterpreter } from '../machines/keyboard';
import Sidebar from './Sidebar';
import SongCard from './SongCard';
import Timeline from './Timeline';
import KeySelect from './KeySelect';
import { ChordButtonInterpreter } from '../machines/types';

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
}));

export const App: React.FC = () => {
  const player = usePlayer();

  const [current, send, mainService] = useMachine(appMachine, {
    context: {
      keySignature: Key.chromatic('C', 'sharp'),
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

  const child = mainService.children.get('keyboard');
  const keyboardService = (child as unknown) as KeyboardInterpreter;
  const buttonService = (mainService as unknown) as ChordButtonInterpreter;

  const playingSong = current.matches('playingSong');
  const playingButtonChord = current.matches('playingChord');
  const {
    keySignature,
    selectedChord,
    playingIndex,
    playingChord,
    song,
  } = current.context;

  const onSelectChord = useCallback(
    (chord: Chord) => {
      send({ type: 'SET.CHORD', chord });
    },
    [send],
  );

  const onChordAdd = (): void => {
    if (selectedChord) {
      send({ type: 'SONG.ADD_CHORD', chord: selectedChord });
    }
  };

  const onChordDelete = (_chord: Chord, index: number): void => {
    send({ type: 'SONG.REMOVE_CHORD', index });
  };

  const onTogglePlay = (): void => {
    // It has to be here, or the indirection will make the browser forget
    // the sound playing was initiated by a user action!
    Tone.start();
    !playingSong ? send('PLAY.START') : send('PLAY.STOP');
  };

  const classes = useStyles();

  return (
    <div className={classes.root}>
      {keyboardService && (
        <Sidebar
          keyboardService={keyboardService}
          buttonService={buttonService}
          keyboardDisabled={playingButtonChord || playingSong}
        />
      )}
      <div className={classes.content}>
        <Container>
          <Typography variant="h1">Chord ily</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <KeySelect service={mainService} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <SongCard playing={playingSong} onTogglePlay={onTogglePlay}>
                <Timeline
                  {...{
                    song,
                    service: buttonService,
                    onDelete: onChordDelete,
                    playingIndex:
                      typeof playingIndex === 'number'
                        ? playingIndex
                        : undefined,
                    chordProps: {
                      keySignature,
                    },
                  }}
                />
              </SongCard>
            </Grid>
          </Grid>
        </Container>
      </div>
    </div>
  );
};

export default App;
