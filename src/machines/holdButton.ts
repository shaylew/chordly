import { Machine, MachineConfig, EventObject, assign } from 'xstate';

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

export interface HoldButtonContext {
  delay: number;
  timeReleased?: number;
}

export type HoldButtonStates = keyof HoldButtonSchema['states'];

export const holdButtonConfig: MachineConfig<
  HoldButtonContext,
  HoldButtonSchema,
  HoldButtonEvent
> = {
  initial: 'unpressed',

  context: {
    delay: 700,
  },

  states: {
    unpressed: {
      on: {
        CLICK: { target: 'releasingSlow' },
        PRESS: { target: 'pressing' },
      },
    },
    pressing: {
      after: {
        MINIMUM_HOLD_TIME: { target: 'holding' },
      },
      on: {
        RELEASE: {
          actions: assign({
            timeReleased: (_context, _event) => Date.now(),
          }),
          target: 'releasingSlow',
        },
      },
    },
    holding: {
      on: {
        RELEASE: { target: 'releasingFast' },
      },
    },
    releasingSlow: {
      after: {
        REMAINING_HOLD_TIME: { target: 'done' },
      },
    },
    releasingFast: {
      after: {
        QUICK_RELEASE_TIME: { target: 'done' },
      },
    },
    done: {
      type: 'final',
    },
  },
};

export const holdButtonMachine = Machine(holdButtonConfig, {
  delays: {
    MINIMUM_HOLD_TIME: (context, _event) => context.delay,
    REMAINING_HOLD_TIME: (context, _event) => {
      if (context.timeReleased) {
        return context.delay - (Date.now() - context.timeReleased);
      } else {
        return context.delay;
      }
    },
    QUICK_RELEASE_TIME: 0,
  },
});

export default holdButtonMachine;
