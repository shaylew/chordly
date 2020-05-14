import {
  Machine,
  MachineConfig,
  StateSchema,
  Assigner,
  PropertyAssigner,
  AssignAction,
  send,
  assign as coreAssign,
} from 'xstate';

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
  player?: Player;
  selectedChord?: Chord;
  playingChord?: Chord;
  playingIndex?: number;
}

export interface AppSchema extends StateSchema<AppContext> {
  states: {
    default: {
      states: {
        idle: {};
        playingChordButton: {};
        playingChordShort: {};
      };
    };
    playingSong: {};
  };
}

function assign<TEvent extends AppEvent = AppEvent>(
  assignment:
    | Assigner<AppContext, TEvent>
    | PropertyAssigner<AppContext, TEvent>,
): AssignAction<AppContext, TEvent> {
  return coreAssign(assignment);
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
  initial: 'default',
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
  },

  states: {
    default: {
      initial: 'idle',
      states: {
        idle: {},

        playingChordShort: {
          activities: ['playingChord'],
          onEntry: [
            assign({
              playingChord: (c, _e) => c.selectedChord,
            }),
          ],
          onExit: assign({
            playingChord: undefined,
          }),
          after: {
            [CHORD_PLAY_TIME]: { target: 'idle' },
          },
        },

        playingChordButton: {
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
          onEntry: [
            assign({ playingChord: (c, _e) => c.selectedChord }),
            send('PRESS', { to: 'button' }),
          ],
          onExit: assign({ playingChord: undefined }),
          on: {
            'CHORD.RELEASE': {
              actions: send('RELEASE', { to: 'button' }),
            },
            'CHORD.CLICK': {
              actions: send('CLICK', { to: 'button' }),
            },
            'CHORD.PRESS': {
              target: 'playingChordButton',
              actions: [
                assign({
                  selectedChord: (_c, e) => e.chord,
                }),
                'sendUpdateChord',
              ],
            },
          },
        },
      },

      on: {
        'SET.KEY': {
          actions: [
            assign({
              keySignature: (_c, e) => e.keySignature,
            }),
            'sendUpdateKey',
          ],
        },
        'SET.CHORD': {
          actions: assign({
            selectedChord: (_c, e) => e.chord,
          }),
          target: 'default.playingChordShort',
        },
        'SONG.ADD_CHORD': {
          actions: assign({
            song: (c, e) => addChord(c.song, e.chord),
          }),
        },
        'SONG.REMOVE_CHORD': {
          actions: assign({
            song: (c, e) => removeChord(c.song, e.index),
          }),
        },
        'CHORD.PRESS': {
          target: 'default.playingChordButton',
          actions: [
            assign({
              selectedChord: (_c, e) => e.chord,
            }),
            'sendUpdateChord',
          ],
        },
        'SONG.SET': {
          actions: assign({ song: (_c, e) => e.song }),
        },
        'PLAY.START': {
          target: 'playingSong',
        },
      },
    },

    playingSong: {
      activities: ['playingSong'],
      onEntry: [
        assign({
          playingIndex: 0,
          playingChord: (c, _e) => c.song.measures[0]?.chord,
        }),
        'sendUpdateChord',
      ],
      onExit: [
        assign({
          selectedChord: (c, _e) => c.playingChord,
          playingIndex: undefined,
          playingChord: undefined,
        }),
      ],
      on: {
        'PLAY.STOP': { target: 'default' },
        'PLAY.FINISH': { target: 'default' },
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
