import { Machine, MachineConfig, assign } from 'xstate';
import { Song } from '../types';

export type PlayerEvent =
  | { type: 'PLAYER.START' }
  | { type: 'PLAYER.STOP' }
  | { type: 'PLAYER.FINISH' }
  | { type: 'PLAYER.TOOGLE_LOOP' }
  | { type: 'SET_SONG'; value: Song };
// | 'SELECT_MEASURE'

export interface PlayerContext {
  song: Song;
  loop: boolean;
}

export interface PlayerSchema {
  states: {
    idle: {};
    playing: {};
    finished: {};
  };
}

export type PlayerStates = keyof PlayerSchema['states'];

export const playerConfig: MachineConfig<
  PlayerContext,
  PlayerSchema,
  PlayerEvent
> = {
  initial: 'idle',

  context: {
    song: { measures: [] },
    loop: false,
  },

  on: {
    'PLAYER.TOOGLE_LOOP': {
      actions: [
        assign({
          loop: context => !context.loop,
        }),
      ],
    },
  },

  states: {
    idle: {
      on: {
        'PLAYER.START': { target: 'playing' },
        SET_SONG: {
          actions: assign({
            song: (_context, event) => event.value,
          }),
        },
      },
    },
    playing: {
      onEntry: 'startSong',
      onExit: 'stopSong',
      on: {
        'PLAYER.STOP': { target: 'idle' },
        'PLAYER.FINISH': { target: 'finished' },
      },
    },
    finished: {
      after: {
        750: { target: 'idle' },
      },
    },
  },
};

export const playerMachine = Machine(playerConfig);

export default playerMachine;
