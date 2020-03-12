import { Frequency } from 'tone';
import { Note as _Note } from '../node_modules/tone/build/esm/core/type/Units';

export { Frequency };
// FIXME when eslint supports `export type { Note };`
export type Note = _Note;
export type Interval = number;

export class Chord {
  constructor(readonly intervals: Array<Interval>, readonly name: string) {}

  on(root: Note): Array<Note> {
    return Frequency(root)
      .harmonize(this.intervals)
      .map(f => f.toNote());
  }

  static major = new Chord([0, 4, 7], 'major');
  static minor = new Chord([0, 3, 7], 'minor');
}

// prettier-ignore
export type NoteName =
  'C'|'C#'|'Db'|'D'|'D#'|'Eb'|'E'|'F'|'F#'|'Gb'|'G'|'G#'|'Ab'|'A'|'A#'|'Bb'|'B';

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// prettier-ignore
export const namesSharp: NoteName[] =
  ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
// prettier-ignore
export const namesFlat: NoteName[] =
  ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

export function octave(name: NoteName, octave: Octave): Note {
  return (`${name}${octave}` as unknown) as Note;
}
