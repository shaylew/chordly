import { Chord, Key } from '../types';
import { Interpreter, EventObject, StateSchema } from 'xstate';

// Xstate, for all its fancy typings, is still more or less stringly-
// typed when it comes to event names and payloads. So here we define
// all the events that may be used by multiple machines.

// We have a couple of bits of state that are not just top-level but
// pretty much global: the current active chord and the selected key
// signature. The relevant events are defined here so they don't have
// to be duplicated.

// Values are duplicated across state machines, but there's still a
// single source of truth. The parent machine keeps the master copy
// and sends UpdateEvents to children when it changes; the children
// send SetEvents up the tree to ask to change the value.

export type UpdateEvent =
  | { type: 'UPDATE.CHORD'; chord: Chord }
  | { type: 'UPDATE.CHORD.CLEAR' }
  | { type: 'UPDATE.KEY'; keySignature: Key };

export type SetEvent =
  | { type: 'SET.CHORD'; chord: Chord }
  | { type: 'SET.CHORD.CLEAR' }
  | { type: 'SET.KEY'; keySignature: Key };

export type KeySignatureContext = {
  keySignature: Key;
};

export type ChordContext = {
  activeChord: Chord;
};

export type ChordButtonEvent =
  | { type: 'CHORD.PRESS'; chord: Chord }
  | { type: 'CHORD.RELEASE'; chord: Chord }
  | { type: 'CHORD.CLICK'; chord: Chord };

export type ChordButtonInterpreter<
  T extends EventObject = ChordButtonEvent
> = Interpreter<any, StateSchema<any>, T | ChordButtonEvent>;

export type KeySignatureInterpreter<
  C extends KeySignatureContext,
  E extends EventObject
> = Interpreter<C, StateSchema<any>, E>;
