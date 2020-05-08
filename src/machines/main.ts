import { Machine, MachineConfig, assign, send, StateSchema } from 'xstate';

import { Song, Chord, Key } from '../types';
import {
  UpdateEvent,
  SetEvent,
  KeySignatureContext,
  ChordButtonEvent,
} from './types';
import buttonMachine from './holdButton';
import keyboardMachine from './keyboard';
import Player from '../lib/player';
import { ChromaticLayout } from '../lib/keyboard-layout';

export const CHORD_PLAY_TIME = 750;

export type AppEvent =
  | { type: 'SONG.SET'; song: Song }
  | { type: 'SONG.ADD_CHORD'; chord: Chord }
  | { type: 'SONG.REMOVE_CHORD'; index: number }
  | { type: 'PLAY.START' }
  | { type: 'PLAY.STOP' }
  | { type: 'PLAY.FINISH' }
  | { type: 'PLAY.PROGRESS'; index: number }
  | SetEvent
  | ChordButtonEvent;

export type AppAction = 'playbackStart' | 'playbackStop';

export interface AppContext extends KeySignatureContext {
  song: Song;
  player: Player | null;
  selectedChord: Chord | null;
  previousChord: Chord | null;
  playingChord: Chord | null;
  playingIndex: number | null;
}

export interface AppSchema extends StateSchema<AppContext> {
  states: {
    idle: {
      states: {
        idle: {};
        playingSelectedChord: {};
      };
    };
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
  invoke: {
    src: keyboardMachine,
    id: 'keyboard',
    autoForward: false,
    data: {
      keySignature: (c: AppContext) => c.keySignature,
      layout: () => new ChromaticLayout(4),
    },
  },

  context: {
    song: { measures: [] },
    keySignature: Key.chromatic('C'),
    player: null,
    selectedChord: null,
    previousChord: null,
    playingChord: null,
    playingIndex: null,
  },

  states: {
    idle: {
      initial: 'idle',
      states: {
        idle: {},
        playingSelectedChord: {
          activities: ['playingChord'],
          onEntry: assign({
            playingChord: (context, _event) => context.selectedChord,
          }),
          onExit: assign({
            playingChord: (_context, _event) => null,
          }),
          after: {
            [CHORD_PLAY_TIME]: { target: 'idle' },
          },
        },
      },
      on: {
        'SET.KEY': {
          actions: [
            assign({
              keySignature: (_context, event) => event.keySignature,
            }),
            'sendUpdateKey',
          ],
        },
        'SET.CHORD': {
          actions: assign({
            selectedChord: (_context, event) => event.chord,
          }),
          target: 'idle.playingSelectedChord',
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
          actions: [
            assign({
              playingChord: (_context, event) => event.chord,
            }),
            'sendUpdateChord',
          ],
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
        context: {
          delay: CHORD_PLAY_TIME,
        },
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
          actions: [
            assign({
              playingChord: (_context, event) => event.chord,
            }),
            'sendUpdateChord',
          ],
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
        'sendUpdateChord',
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
          actions: [
            assign((c, e) => ({
              playingIndex: e.index,
              playingChord: c.song.measures[e.index]?.chord || null,
              previousChord: c.song.measures[e.index - 1]?.chord || null,
            })),
            'sendUpdateChord',
          ],
        },
      },
    },
  },
};

const appMachine = Machine(appConfig, {
  actions: {
    sendUpdateChord: send<AppContext, AppEvent | UpdateEvent>(
      (c, _e) => {
        const chord = c.playingChord || c.selectedChord;
        return chord
          ? { type: 'UPDATE.CHORD', chord }
          : { type: 'UPDATE.CHORD.CLEAR' };
      },
      { to: 'keyboard' },
    ),
    sendUpdateKey: send<AppContext, AppEvent | UpdateEvent>(
      (c, _e) => ({
        type: 'UPDATE.KEY',
        keySignature: c.keySignature,
      }),
      { to: 'keyboard' },
    ),
  },
});

export default appMachine;
