import * as Tone from 'tone';

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Interval = number;
export type Chord = {
  root: PitchClass;
  intervals: Interval[];
  symbol?: string;
};

export type Note = Tone.Unit.Note;
export type Synth = Tone.PolySynth;
export type Time = string | number | Tone.Unit.TimeObject;

export type Song = { bpm?: number; measures: Measure[] };
export type Measure = { chord: Chord };

export type NotationOptions = {
  pretty?: boolean;
  key?: 'sharp' | 'flat';
};

// prettier-ignore
export type NoteName =
  'C'|'C#'|'Db'|'D'|'D#'|'Eb'|'E'|'F'|'F#'|'Gb'|'G'|'G#'|'Ab'|'A'|'A#'|'Bb'|'B';

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// prettier-ignore
export const namesSharp: NoteName[] =
  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// prettier-ignore
export const namesFlat: NoteName[] =
  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
// prettier-ignore
export const keyNames: NoteName[] =
  ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export const pitchClassOf = {} as Record<NoteName, PitchClass>;
namesSharp.forEach((name, i) => {
  pitchClassOf[name] = i as PitchClass;
});
namesFlat.forEach((name, i) => {
  pitchClassOf[name] = i as PitchClass;
});

export function noteName(pc: PitchClass, options?: NotationOptions): string {
  const { pretty = true, key = 'flat' } = options || {};
  const base = (key === 'sharp' ? namesSharp : namesFlat)[pc];
  return !pretty ? base : base.replace('s', '♯').replace('b', '♭');
}

export function chordName(chord: Chord, options?: NotationOptions): string {
  return noteName(chord.root, options) + (chord.symbol || '');
}

export function toNote(pc: PitchClass, octave: Octave = 4): Note {
  return `${namesSharp[pc]}${octave}` as Note;
}

export function toNotes(chord: Chord): Note[] {
  const { root, intervals } = chord;
  return Tone.Frequency(toNote(root))
    .harmonize(intervals)
    .map(f => f.toNote());
}
