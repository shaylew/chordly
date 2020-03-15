import { Machine, MachineConfig, EventObject } from 'xstate';

const holdTime = 500;

export type EventId = 'CLICK' | 'PRESS' | 'RELEASE';

export interface HoldButtonEvent extends EventObject {
  type: EventId;
}

export interface HoldButtonSchema {
  states: {
    idle: {};
    pressing: {};
    holding: {};
    releasingFast: {};
    releasingSlow: {};
  };
}

export type HoldButtonStates = keyof HoldButtonSchema['states'];

export const holdButtonConfig: MachineConfig<
  {},
  HoldButtonSchema,
  HoldButtonEvent
> = {
  initial: 'idle',

  states: {
    idle: {
      on: {
        CLICK: {
          actions: 'pressEffect',
          target: 'releasingSlow',
        },
        PRESS: { target: 'pressing' },
      },
    },
    pressing: {
      entry: 'pressEffect',
      on: {
        RELEASE: { target: 'releasingSlow' },
      },
      after: {
        [holdTime]: { target: 'holding' },
      },
    },
    holding: {
      on: {
        RELEASE: { target: 'releasingFast' },
      },
    },
    releasingSlow: {
      after: {
        [holdTime]: {
          actions: 'releaseEffect',
          target: 'idle',
        },
      },
    },
    releasingFast: {
      after: {
        [holdTime / 4]: {
          actions: 'releaseEffect',
          target: 'idle',
        },
      },
    },
  },
};

export const holdButtonMachine = Machine(holdButtonConfig);

export default holdButtonMachine;
