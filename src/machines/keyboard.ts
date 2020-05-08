import {
  Machine,
  MachineConfig,
  assign as coreAssign,
  StateSchema,
  Assigner,
  PropertyAssigner,
  AssignAction,
  sendParent,
  Interpreter,
  EventObject,
} from 'xstate';

import { Chord, Key, ChordType, PitchClass } from '../types';
import { UpdateEvent } from './types';
import { KeyboardCell, KeyboardLayout } from '../lib/keyboard-layout';
import { FactorName, IntervalType } from '../lib/music-theory';

export type KeyboardEvent =
  | { type: 'KEYBOARD.CELL.CLICK'; cell: KeyboardCell }
  | { type: 'KEYBOARD.LAYOUT.SET'; layout: KeyboardLayout }
  | UpdateEvent;

export interface KeyboardContext {
  layout: KeyboardLayout;
  root?: KeyboardCell;
  chord?: Chord;
  lastChordType?: ChordType;
  keySignature?: Key;
}

export interface KeyboardSchema extends StateSchema<KeyboardContext> {
  states: {
    unselected: {};
    selected: {};
  };
}

function assign<TEvent extends KeyboardEvent = KeyboardEvent>(
  assignment:
    | Assigner<KeyboardContext, TEvent>
    | PropertyAssigner<KeyboardContext, TEvent>,
): AssignAction<KeyboardContext, TEvent> {
  return coreAssign(assignment);
}

function findChordForRoot(
  root: PitchClass,
  keySignature?: Key,
  lastChordType?: ChordType,
): Chord {
  const options = [
    ...(lastChordType ? [new Chord(root, lastChordType)] : []),
    Chord.major(root),
    Chord.minor(root),
    Chord.diminished(root),
    Chord.augmented(root),
  ];
  const bestFit = keySignature
    ? options.find(c =>
        c.pitches.slice(1).every(pc => keySignature.includes(pc)),
      )
    : undefined;
  return bestFit || options[0];
}

function makeAlteredChord(
  chord: Chord,
  name: FactorName,
  type: IntervalType,
  key?: Key,
): Chord {
  if (chord.type.parts[name] === type) {
    return chord.altered({ [name]: 'none' });
  } else {
    return chord.tertianAltered({ [name]: type }, key);
  }
}

type ClickEvent = { type: 'KEYBOARD.CELL.CLICK'; cell: KeyboardCell };
const chooseRoot = assign<ClickEvent>((c, e) => {
  if (!e.cell) return {};
  const chord = findChordForRoot(
    e.cell.pitchClass,
    c.keySignature,
    c.lastChordType,
  );
  const root = c.layout.lookupRoot(e.cell.pitchClass);
  return { chord, root, lastChordType: chord.type };
});

const chooseFactor = assign<ClickEvent>((c, e) => {
  if (!c.chord || !c.root) return {};
  const relationship = c.layout.relationship(c.root, e.cell);
  if (!relationship) return {};
  const { factorName, intervalType } = relationship;
  const chord = makeAlteredChord(c.chord, factorName, intervalType);
  return { chord, lastChordType: chord.type };
});

export const keyboardConfig: MachineConfig<
  KeyboardContext,
  KeyboardSchema,
  KeyboardEvent
> = {
  initial: 'unselected',

  on: {
    'KEYBOARD.LAYOUT.SET': {
      actions: assign({
        layout: (_c, e) => e.layout,
        root: (c, e) =>
          !c.root ? undefined : e.layout.lookupRoot(c.root.pitchClass),
      }),
    },
    'UPDATE.KEY': {
      actions: assign({
        keySignature: (_c, e) => e.keySignature,
      }),
    },
    'UPDATE.CHORD.CLEAR': {
      target: 'unselected',
      actions: assign({ chord: undefined, root: undefined }),
    },
    'UPDATE.CHORD': {
      target: 'selected',
      actions: [
        assign({
          root: (c, e) =>
            e.chord.root !== c.root?.pitchClass
              ? c.layout.lookupRoot(e.chord.root)
              : c.root,
          chord: (_c, e) => e.chord,
          lastChordType: (_c, e) => e.chord.type,
        }),
      ],
    },
  },

  states: {
    unselected: {
      onEntry: assign({
        chord: undefined,
        root: undefined,
      }),
      on: {
        'KEYBOARD.CELL.CLICK': {
          cond: (_c, e) => e.cell.isRoot,
          target: 'selected',
          actions: [chooseRoot, 'notifyParent'],
        },
      },
    },
    selected: {
      on: {
        'KEYBOARD.CELL.CLICK': [
          {
            cond: (c, e) => !!c.root && c.layout.isReachable(c.root, e.cell),
            target: 'selected',
            actions: [chooseFactor, 'notifyParent'],
          },
          {
            target: 'unselected',
          },
        ],
      },
    },
  },
};

export const keyboardMachine = Machine(keyboardConfig, {
  actions: {
    notifyParent: sendParent((c: KeyboardContext) => ({
      type: 'SET.CHORD',
      chord: c.chord,
    })),
  },
});

export type KeyboardInterpreter<
  T extends EventObject = KeyboardEvent
> = Interpreter<KeyboardContext, KeyboardSchema, T | KeyboardEvent>;

export default keyboardMachine;
