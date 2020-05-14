import * as Tone from 'tone';
import {
  Accidental,
  ChordType,
  Chord,
  Key,
  pcToName,
} from './lib/music-theory';

export * from './lib/music-theory';

export type Song = { bpm?: number; measures: Measure[] };
export type Measure = { chord: Chord };
export type Volume = number;

// re-exports from Tone
export type ToneNote = string;
export type ToneSynth = Tone.PolySynth;
export type ToneTime = string | number | Tone.Unit.TimeObject;

export function toKey(chord: Chord): Key | undefined {
  // quick and dirty and wrong -- just check for major third
  const root = chord.root;
  const accidentals: Accidental = 'GDAEB'.includes(pcToName(root))
    ? 'sharp'
    : 'flat';
  if (chord.type.intervals.includes(4)) {
    return Key.major(root, accidentals);
  } else if (chord.type.intervals.includes(3)) {
    return Key.minor(root, accidentals);
  }
}

export function keyToChord(key: Key): Chord {
  return new Chord(
    key.tonic,
    key.type === 'minor' ? ChordType.minor() : ChordType.major(),
  );
}
