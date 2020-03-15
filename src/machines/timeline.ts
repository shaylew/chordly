import { Machine, MachineConfig, assign } from 'xstate';
import { Song } from '../types';

type TimelineEvent =
  | { type: 'START_PLAYING' }
  | { type: 'STOP_PLAYING' }
  | { type: 'FINISHED_PLAYING' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_SONG'; value: Song };
// | 'SELECT_MEASURE'

export interface TimelineContext {
  song: Song;
  loop: boolean;
  selectedMeasure: number | null;
}

export interface TimelineSchema {
  states: {
    idle: {};
    playing: {};
    finished: {};
  };
}

export type TimelineStates = keyof TimelineSchema['states'];

export const timelineConfig: MachineConfig<
  TimelineContext,
  TimelineSchema,
  TimelineEvent
> = {
  initial: 'idle',

  context: {
    song: { measures: [] },
    loop: false,
    selectedMeasure: null,
  },

  on: {
    TOGGLE_REPEAT: {
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
        START_PLAYING: { target: 'playing' },
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
        STOP_PLAYING: { target: 'idle' },
        FINISHED_PLAYING: { target: 'finished' },
      },
    },
    finished: {
      after: {
        1000: { target: 'idle' },
      },
    },
  },
};

export const timelineMachine = Machine(timelineConfig);

export default timelineMachine;
