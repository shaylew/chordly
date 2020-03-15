import {
  Machine,
  MachineConfig,
  assign as baseAssign,
  Assigner,
  PropertyAssigner,
  AssignAction,
  EventObject,
} from 'xstate';
import { Song, Chord } from '../types';

export type TimelineEvent =
  | { type: 'MEASURE.NEW' }
  | { type: 'CLEAR_ALL' }
  | { type: 'DESELECT' }
  | { type: 'MEASURE.SELECT'; id: number }
  | { type: 'MEASURE.DELETE'; id: number }
  | { type: 'PICK_CHORD'; value: Chord };

export interface TimelineContext {
  selectedMeasure?: number;
  song: Song;
}

export interface TimelineSchema {
  states: {
    initializing: {};
    idle: {};
    editing: {};
    adding: {};
  };
}

function setChordAtPosition(song: Song, position: number, chord: Chord): Song {
  return {
    ...song,
    measures: song.measures.map((measure, i) => {
      return i !== position ? measure : { chord };
    }),
  };
}

function addChordAtEnd(song: Song, chord: Chord): Song {
  return {
    ...song,
    measures: [...song.measures, { chord }],
  };
}

function deleteChordAtPosition(song: Song, position: number): Song {
  return {
    ...song,
    measures: song.measures.filter((measure, i) => i !== position),
  };
}

// Give me real sum types or give me death!
//
// Typescript can infer the event subtype if it already knows the context type,
// but it can't infer both at once in our case. So we fix the context type and
// leave just the event type to be inferred.
function assign<E extends EventObject = TimelineEvent>(
  arg: Assigner<TimelineContext, E> | PropertyAssigner<TimelineContext, E>,
): AssignAction<TimelineContext, E> {
  return baseAssign<TimelineContext, E>(arg);
}

export const timelineConfig: MachineConfig<
  TimelineContext,
  TimelineSchema,
  TimelineEvent
> = {
  id: 'timeline',
  initial: 'initializing',
  context: {
    song: { measures: [] },
    selectedMeasure: undefined,
  },

  on: {
    CLEAR_ALL: {
      actions: assign({
        selectedMeasure: undefined,
        song: { measures: [] },
      }),
      target: 'idle',
    },
    DESELECT: {
      actions: assign({
        selectedMeasure: undefined,
      }),
      target: 'idle',
    },
    'MEASURE.DELETE': {
      actions: assign({
        selectedMeasure: (context, event) =>
          context.selectedMeasure === event.id
            ? undefined
            : context.selectedMeasure,
        song: (context, event) => deleteChordAtPosition(context.song, event.id),
      }),
    },
    'MEASURE.SELECT': {
      actions: assign({
        selectedMeasure: (_context, event) => event.id,
      }),
      target: 'editing',
    },
    'MEASURE.NEW': {
      actions: assign({
        selectedMeasure: undefined,
      }),
      target: 'adding',
    },
  },

  states: {
    initializing: {
      on: {
        // workaround -- services don't have an accurate state until the
        // machine has transitioned at least once.
        '': 'idle',
      },
    },
    idle: {},
    editing: {
      on: {
        PICK_CHORD: {
          actions: assign({
            song: (context, event) =>
              setChordAtPosition(
                context.song,
                context.selectedMeasure as number,
                event.value,
              ),
          }),
        },
      },
    },
    adding: {
      on: {
        PICK_CHORD: {
          actions: assign({
            song: (context, event) => addChordAtEnd(context.song, event.value),
          }),
        },
      },
    },
  },
};

export const timelineMachine = Machine(timelineConfig);

export default timelineMachine;
