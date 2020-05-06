import {
  PitchClass,
  NoteName,
  IntervalType,
  Chord,
  ChordType,
  nameToPC,
} from './music-theory';

type IT = IntervalType | 'none';
type LetterType = 'note' | 'lower' | 'upper';
type LetterValue = ['note', NoteName] | ['lower' | 'upper', IT, IT];

// Morally this is 2 or 3 separate things, but if we have it in one place
// and split it apart afterwards TypeScript will be able to tell us if
// we accidentally reuse a letter for two different meanings.
const codeLetters: Record<string, LetterValue> = {
  A: ['note', 'A'],
  V: ['note', 'A#'],
  B: ['note', 'B'],
  C: ['note', 'C'],
  W: ['note', 'C#'],
  D: ['note', 'D'],
  X: ['note', 'D#'],
  E: ['note', 'E'],
  F: ['note', 'F'],
  Y: ['note', 'F#'],
  G: ['note', 'G'],
  Z: ['note', 'G#'],

  // full lower parts (major is default) (3 + 1)
  m: ['lower', 'minor', 'perfect'],
  d: ['lower', 'minor', 'diminished'],
  a: ['lower', 'major', 'augmented'],

  // partial lower parts (6)
  u: ['lower', 'none', 'none'],
  3: ['lower', 'major', 'none'],
  n: ['lower', 'minor', 'none'],
  5: ['lower', 'none', 'perfect'],
  t: ['lower', 'none', 'diminished'],
  w: ['lower', 'none', 'augmented'],

  // full upper parts (4)
  o: ['upper', 'diminished', 'minor'],
  p: ['upper', 'minor', 'minor'],
  q: ['upper', 'minor', 'major'],
  r: ['upper', 'major', 'major'],

  // partial upper parts (empty is default) (5 + 1)
  j: ['upper', 'major', 'none'],
  7: ['upper', 'major', 'none'],
  x: ['upper', 'diminished', 'none'],
  9: ['upper', 'none', 'major'],
  g: ['upper', 'none', 'minor'],
};

const lowerDefault: [IT, IT] = ['major', 'perfect'];
const upperDefault: [IT, IT] = ['none', 'none'];

const noteLetters = {} as Record<PitchClass, string>;
const lowerLetters: Record<string, string> = {};
const upperLetters: Record<string, string> = {};

Object.entries(codeLetters).map(([letter, meaning]) => {
  if (meaning[0] === 'note') {
    const [, name] = meaning;
    noteLetters[nameToPC(name)] = letter;
  } else if (meaning[0] === 'lower') {
    const [, third, fifth] = meaning;
    lowerLetters[`${third}-${fifth}`] = letter;
  } else if (meaning[0] === 'upper') {
    const [, seventh, ninth] = meaning;
    upperLetters[`${seventh}-${ninth}`] = letter;
  }
});

function readNote(data: string): [PitchClass | null, string] {
  if (!data.length) {
    return [null, data];
  }

  const c = data[0];
  const entry = codeLetters[c];
  if (!entry || entry[0] !== 'note') {
    return [null, data];
  }
  return [nameToPC(entry[1]), data.slice(1)];
}

function readFactor(def: [IT, IT], data: string): [[IT, IT], string] {
  if (!data.length) {
    return [def, data];
  }

  const c = data[0];
  const entry = codeLetters[c];
  if (!entry || (entry[0] !== 'lower' && entry[0] !== 'upper')) {
    return [def, data];
  }
  return [[entry[1], entry[2]], data.slice(1)];
}

export function readChord(data: string): [Chord | null, string] {
  const [pc, rest1] = readNote(data);
  const [lower, rest2] = readFactor(lowerDefault, rest1);
  const [upper, rest3] = readFactor(upperDefault, rest2);

  if (pc && lower && upper) {
    const [third, fifth] = lower;
    const [seventh, ninth] = upper;
    const chord = new Chord(
      pc,
      new ChordType({ third, fifth, seventh, ninth }),
    );
    return [chord, rest3];
  } else {
    return [null, data];
  }
}

export function readChords(data: string): [Chord[], string] {
  const chords = [];

  let chord = null;
  while (true) {
    [chord, data] = readChord(data);
    if (chord) {
      chords.push(chord);
    } else {
      break;
    }
  }

  return [chords, data];
}

export function encodeChord(chord: Chord): string {
  const note = noteLetters[chord.root];
  const { third, fifth, seventh, ninth } = chord.type.parts;
  const lower = lowerLetters[`${third}-${fifth}`] || '';
  const upper = upperLetters[`${seventh}-${ninth}`] || '';
  return `${note}${lower}${upper}`;
}

export function encodeChords(chords: Chord[]): string {
  return chords.map(encodeChord).join('');
}
