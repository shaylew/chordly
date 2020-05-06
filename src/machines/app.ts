import { Machine, MachineConfig, assign, spawn } from 'xstate';

import { Song, Chord, Key, toKey } from '../types';
import timelineMachine, { TimelineInterpreter } from './timeline';

export type AppEvent =
  | { type: 'KEY_SELECT.START' }
  | { type: 'KEY_SELECT.CANCEL' }
  | { type: 'PICK_CHORD'; chord: Chord }
  | { type: 'SET_SONG'; song: Song }
  | { type: 'LOOP.TOGGLE' }
  | { type: 'SONG.START' }
  | { type: 'SONG.STOP' }
  | { type: 'SONG.FINISH' };

export interface AppContext {
  loop: boolean;
  keySignature?: Key;
  timeline?: TimelineInterpreter;
}

export interface AppSchema {
  states: {
    initializing: {};
    idle: {};
    playing: {};
    finished: {};
    pickingKey: {};
  };
}

export const appConfig: MachineConfig<AppContext, AppSchema, AppEvent> = {
  id: 'app',
  initial: 'initializing',

  context: {
    loop: false,
    keySignature: undefined,
    timeline: undefined,
  },

  on: {
    SET_SONG: {
      actions: (context, event) => context.timeline?.send(event),
    },
    'LOOP.TOGGLE': {
      actions: assign({ loop: context => !context.loop }),
    },
  },

  states: {
    initializing: {
      entry: assign({
        timeline: _context => spawn(timelineMachine, { sync: true }),
      }),
      on: { '': 'idle' },
    },
    idle: {
      on: {
        'KEY_SELECT.START': 'pickingKey',
        'SONG.START': 'playing',
        PICK_CHORD: {
          actions: (context, event): void => {
            context.timeline?.send(event);
          },
        },
      },
    },
    playing: {
      entry: [
        'startSong',
        (context: AppContext): void => {
          context.timeline?.send('DESELECT');
        },
      ],
      exit: 'stopSong',
      on: {
        'SONG.STOP': 'idle',
        'SONG.FINISH': 'finished',
      },
    },
    finished: {
      after: {
        750: { target: 'idle' },
      },
    },
    pickingKey: {
      on: {
        'KEY_SELECT.CANCEL': 'idle',
        PICK_CHORD: {
          actions: assign({
            keySignature: (_context, event) => toKey(event.chord) as Key,
          }),
          target: 'idle',
        },
      },
    },
  },
};

export const appMachine = Machine(appConfig);

export default appMachine;
