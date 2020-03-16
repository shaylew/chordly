import * as Tone from 'tone';

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Accidental = 'sharp' | 'flat';

export type Interval = number;

export type Chord = {
  root: PitchClass;
  intervals: Interval[];
  symbol?: string;
  octave?: Octave;
};

export type Song = { bpm?: number; measures: Measure[] };
export type Measure = { chord: Chord };
export type Key = {
  root: PitchClass;
  notes: PitchClass[];
  typeName: string;
  accidentals: Accidental;
};

// re-exports from Tone
export type Note = Tone.Unit.Note;
export type Synth = Tone.PolySynth;
export type Time = string | number | Tone.Unit.TimeObject;

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

export function interval(pc: PitchClass, interval: Interval): PitchClass {
  return ((pc + interval) % 12) as PitchClass;
}

export function noteName(
  pc: PitchClass,
  accidentals: Accidental = 'flat',
): string {
  const base = (accidentals === 'sharp' ? namesSharp : namesFlat)[pc];
  return base.replace('#', '♯').replace('b', '♭');
}

export function chordName(chord: Chord, accidentals?: Accidental): string {
  return noteName(chord.root, accidentals) + (chord.symbol || '');
}

export function toNote(pc: PitchClass, octave: Octave = 4): Note {
  return `${namesSharp[pc]}${octave}` as Note;
}

export function toNotes(chord: Chord): Note[] {
  const { root, intervals } = chord;
  return Tone.Frequency(toNote(root, chord.octave))
    .harmonize(intervals)
    .map(f => f.toNote());
}

const majorScale = [0, 2, 4, 5, 7, 9, 11];
const minorScale = [0, 2, 3, 5, 7, 8, 10];

export function toKey(chord: Chord): Key | undefined {
  // quick and dirty and wrong -- just check for major third
  const root = chord.root;
  const accidentals: Accidental = 'GDAEB'.includes(namesSharp[root])
    ? 'sharp'
    : 'flat';
  const most = { root, accidentals };
  if (chord.intervals.includes(4)) {
    return {
      ...most,
      typeName: 'major',
      notes: majorScale.map(i => interval(root, i)),
    };
  } else {
    return {
      ...most,
      typeName: 'minor',
      notes: minorScale.map(i => interval(root, i)),
    };
  }
}

export function keyToChord(key: Key): Chord {
  const symbol = key.notes.includes(interval(key.root, 4)) ? '' : 'm';
  return {
    root: key.root,
    intervals: [0, key.notes[2], key.notes[4], 12],
    symbol,
  };
}

export function isInKey(pc: PitchClass, key: Key): boolean {
  return key.notes.includes(pc);
}

export function mkMajor(note: NoteName): Chord {
  const root = pitchClassOf[note];
  return { root, intervals: [0, 4, 7, 12] };
}

export function mkMinor(note: NoteName): Chord {
  const root = pitchClassOf[note];
  return { root, intervals: [0, 3, 7, 12], symbol: 'm' };
}
