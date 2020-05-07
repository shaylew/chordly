import { Machine, MachineConfig, assign, send, StateSchema } from 'xstate';

import { Song, Chord, Key } from '../types';
import buttonMachine from './holdButton';

export type AppEvent =
  | { type: 'KEY.SELECT'; key: Key }
  | { type: 'CHORD.SELECT'; chord: Chord | null }
  | { type: 'CHORD.PRESS'; chord: Chord }
  | { type: 'CHORD.RELEASE'; chord: Chord }
  | { type: 'CHORD.CLICK'; chord: Chord }
  | { type: 'SONG.SET'; song: Song }
  | { type: 'SONG.ADD_CHORD'; chord: Chord }
  | { type: 'SONG.REMOVE_CHORD'; index: number }
  | { type: 'PLAY.START' }
  | { type: 'PLAY.STOP' }
  | { type: 'PLAY.FINISH' }
  | { type: 'PLAY.PROGRESS'; index: number };

export type AppAction = 'playbackStart' | 'playbackStop';

export interface AppContext {
  song: Song;
  keySignature: Key;
  selectedChord: Chord | null;
  previousChord: Chord | null;
  playingChord: Chord | null;
  playingIndex: number | null;
}

export interface AppSchema extends StateSchema<AppContext> {
  states: {
    idle: {};
    playingSong: {};
    playingChord: {};
  };
}

function addChord(song: Song, chord: Chord): Song {
  return {
    measures: [...song.measures, { chord }],
  };
}

function removeChord(song: Song, index: number): Song {
  return {
    measures: song.measures.filter((_, i) => i !== index),
  };
}

export const appConfig: MachineConfig<AppContext, AppSchema, AppEvent> = {
  id: 'main',
  initial: 'idle',
  context: {
    song: { measures: [] },
    keySignature: Key.chromatic('C'),
    selectedChord: null,
    previousChord: null,
    playingChord: null,
    playingIndex: null,
  },
  states: {
    idle: {
      on: {
        'KEY.SELECT': {
          actions: assign({
            keySignature: (_context, event) => event.key,
          }),
        },
        'CHORD.SELECT': {
          actions: assign({
            selectedChord: (_context, event) => event.chord,
          }),
        },
        'SONG.ADD_CHORD': {
          actions: assign({
            song: (context, event) => addChord(context.song, event.chord),
          }),
          target: 'idle',
        },
        'SONG.REMOVE_CHORD': {
          actions: assign({
            song: (context, event) => removeChord(context.song, event.index),
          }),
          target: 'idle',
        },
        'CHORD.PRESS': {
          target: 'playingChord',
          actions: assign({
            playingChord: (_context, event) => event.chord,
          }),
        },
        'SONG.SET': {
          actions: assign({ song: (_context, event) => event.song }),
        },
        'PLAY.START': {
          target: 'playingSong',
        },
      },
    },
    playingChord: {
      invoke: {
        id: 'button',
        src: buttonMachine,
        onDone: 'idle',
        autoForward: false,
      },
      activities: ['playingChord'],
      onEntry: [send('PRESS', { to: 'button' })],
      onExit: [
        assign({
          playingChord: (_context, _event) => null,
          previousChord: (context, _event) => {
            if (context.playingChord !== context.selectedChord) {
              return context.playingChord;
            } else {
              return context.previousChord;
            }
          },
        }),
      ],
      on: {
        'CHORD.RELEASE': {
          actions: send('RELEASE', { to: 'button' }),
        },
        'CHORD.CLICK': {
          actions: send('CLICK', { to: 'button' }),
        },
        'CHORD.PRESS': {
          target: 'playingChord',
          actions: assign({
            playingChord: (_context, event) => event.chord,
          }),
        },
      },
    },
    playingSong: {
      activities: ['playingSong'],
      onEntry: [
        assign({
          playingIndex: (_context, _event) => 0,
          previousChord: (_context, _event) => null,
          playingChord: (context, _event) =>
            context.song.measures[0]?.chord || null,
        }),
      ],
      onExit: [
        assign({
          playingIndex: (_context, _event) => null,
          playingChord: (_context, _event) => null,
        }),
      ],
      on: {
        'PLAY.STOP': { target: 'idle' },
        'PLAY.FINISH': { target: 'idle' },
        'PLAY.PROGRESS': {
          actions: assign({
            playingIndex: (_context, event) => event.index,
            playingChord: (context, event) =>
              context.song.measures[event.index]?.chord || null,
            previousChord: (context, event) =>
              context.song.measures[event.index - 1]?.chord || null,
          }),
        },
      },
    },
  },
};

const appMachine = Machine(appConfig);

export default appMachine;
