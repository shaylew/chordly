import { Chord, Key } from '../types';
import { EventObject } from 'xstate';

// XState, for all its fancy typings, is still more or less stringly-
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

// One would hope that XState services would enjoy a usable sort of
// subtyping, where a function could request a service having "at least
// these context properties" or responding to "at least these events".

// It turns out it's not quite that simple. But if we don't need any
// advanced features in a component, it's easy enough to pass the send
// function and the state context separately.

export type Send<T extends EventObject> = (event: T | T['type']) => unknown;
