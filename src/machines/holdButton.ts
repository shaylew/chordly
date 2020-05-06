import { Machine, MachineConfig, EventObject } from 'xstate';

const holdTime = 500;

export type EventId = 'CLICK' | 'PRESS' | 'RELEASE';

export interface HoldButtonEvent extends EventObject {
  type: EventId;
}

export interface HoldButtonSchema {
  states: {
    unpressed: {};
    pressing: {};
    holding: {};
    releasingFast: {};
    releasingSlow: {};
    done: {};
  };
}

export type HoldButtonStates = keyof HoldButtonSchema['states'];

export const holdButtonConfig: MachineConfig<
  {},
  HoldButtonSchema,
  HoldButtonEvent
> = {
  initial: 'unpressed',

  states: {
    unpressed: {
      on: {
        CLICK: { target: 'releasingSlow' },
        PRESS: { target: 'pressing' },
      },
    },
    pressing: {
      after: { [holdTime]: { target: 'holding' } },
      on: {
        RELEASE: { target: 'releasingSlow' },
      },
    },
    holding: {
      on: {
        RELEASE: { target: 'releasingFast' },
      },
    },
    releasingSlow: {
      after: { [holdTime]: { target: 'done' } },
    },
    releasingFast: {
      after: { [holdTime / 4]: { target: 'done' } },
    },
    done: {
      type: 'final',
    },
  },
};

export const holdButtonMachine = Machine(holdButtonConfig);

export default holdButtonMachine;
