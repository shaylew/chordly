import React, { useEffect, useState } from 'react';
import { useMachine } from '@xstate/react';
import * as Tone from 'tone';

import { Grid, Card, CardContent } from '@material-ui/core';

import { Song, Chord, Key } from '../types';
// import ChordGrid from './ChordGrid';
import Keyboard from './Keyboard';
import SelectedChord from './SelectedChord';
import SongCard from './SongCard';
import usePlayer from './PlayerContext';
import appMachine from '../machines/main';
import Timeline from './Timeline';

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

  // We have to keep track of this ourselves, because the state machine
  // has already forgotten it by the time we get the action back.
  const [lastPlayed, setLastPlayed] = useState<Chord | undefined>(undefined);

  const [current, send, interpreter] = useMachine(appMachine, {
    context: {
      keySignature: Key.major('C', 'sharp'),
    },
    actions: {
      chordStart: context => {
        const chord = context.playingChord;
        if (chord) {
          setLastPlayed(chord);
          player?.triggerChordStart(chord);
        }
      },
      chordStop: _context => {
        if (lastPlayed) {
          player?.triggerChordEnd(lastPlayed);
          setLastPlayed(undefined);
        }
      },
    },
  });

  useEffect(() => {
    // interpreter.onEvent(e => console.log(e));
    send({ type: 'SONG.SET', song: defaultSong });
  }, [interpreter]);

  const playing = current.matches('playing');
  const {
    keySignature,
    selectedChord,
    previousChord,
    playingChord,
    playingIndex,
    song,
  } = current.context;

  const onSelectChord = (chord: Chord): void => {
    send({ type: 'CHORD.SELECT', chord });
  };

  const onChordAdd = (): void => {
    if (selectedChord) {
      send({ type: 'SONG.ADD_CHORD', chord: selectedChord });
    }
  };

  const onChordDelete = (_chord: Chord, index: number): void => {
    send({ type: 'SONG.REMOVE_CHORD', index });
  };

  const onTogglePlay = (): void => {
    // unfortunately if we let the machine do this the browser forgets
    // that the action was user-initiated and prevents the sound.
    // Tone.start();
    // playing ? send('SONG.STOP') : send('SONG.START');
  };

  const chordButtonEvents = {
    onClick: (chord: Chord) => send({ type: 'CHORD.CLICK', chord }),
    onMouseDown: (chord: Chord) => send({ type: 'CHORD.PRESS', chord }),
    onMouseUp: (chord: Chord) => send({ type: 'CHORD.RELEASE', chord }),
    onMouseLeave: (chord: Chord) => send({ type: 'CHORD.RELEASE', chord }),
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <SongCard
          {...{
            playing,
            looping: false,
            onTogglePlay,
            // onToggleLoop,
            // timelineMachine,
          }}
        >
          <Timeline
            {...{
              song,
              onDelete: onChordDelete,
              playingIndex: playingIndex || undefined,
              chordProps: {
                keySignature,
              },
              chordEvents: chordButtonEvents,
            }}
          />
        </SongCard>
      </Grid>
      <Grid item xs={12}>
        <Card raised>
          <CardContent>
            <SelectedChord
              chord={selectedChord || undefined}
              keySignature={keySignature}
              onChordAdd={onChordAdd}
              chordEvents={chordButtonEvents}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card raised>
          <CardContent>
            <Keyboard
              keySignature={keySignature}
              selectedChord={playingChord || selectedChord || undefined}
              resonatingChord={previousChord || undefined}
              onSelectChord={onSelectChord}
              disabled={!!playingChord}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default App;
