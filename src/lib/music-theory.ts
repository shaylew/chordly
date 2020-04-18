export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type Interval = number;

export type Accidental = 'sharp' | 'flat';

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

function positiveModulo(x: number, r: number): number {
  return ((x % r) + r) % r;
}

export function transpose(pc: PitchClass, interval: Interval): PitchClass {
  return positiveModulo(pc + interval, 12) as PitchClass;
}

// prettier-ignore
export type NoteName =
  'C'|'C#'|'Db'|'D'|'D#'|'Eb'|'E'|'F'|'F#'|'Gb'|'G'|'G#'|'Ab'|'A'|'A#'|'Bb'|'B';

export type PitchClassOrName = NoteName | PitchClass;

// prettier-ignore
export const namesSharp: NoteName[] =
  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// prettier-ignore
export const namesFlat: NoteName[] =
  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
// prettier-ignore
export const keyNames: NoteName[] =
  ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

// prettier-ignore
const _nameToPC: Record<NoteName, PitchClass> = {
  'C'  : 0,
  'C#' : 1,
  'Db' : 1,
  'D'  : 2,
  'D#' : 3,
  'Eb' : 3,
  'E'  : 4,
  'F'  : 5,
  'F#' : 6,
  'Gb' : 6,
  'G'  : 7,
  'G#' : 8,
  'Ab' : 8,
  'A'  : 9,
  'A#' : 10,
  'Bb' : 10,
  'B'  : 11,
}

export function pcToName(
  pc: PitchClass,
  accidentals: Accidental = 'flat',
): NoteName {
  return (accidentals === 'sharp' ? namesSharp : namesFlat)[pc];
}

export function nameToPC(name: NoteName): PitchClass {
  return _nameToPC[name];
}

export function prettyName(name: NoteName): string {
  return name.replace('#', '♯').replace('b', '♭');
}

export function toPitchClass(pcOrName: PitchClassOrName): PitchClass {
  return typeof pcOrName === 'number' ? pcOrName : nameToPC(pcOrName);
}

export class Note {
  constructor(readonly pc: PitchClass, readonly octave: Octave) {}

  transpose(interval: Interval): Note {
    const pc = transpose(this.pc, interval);
    const notional = this.pc + interval;
    const octave = (this.octave + Math.floor(notional / 12)) as Octave;
    return new Note(pc, octave);
  }

  toString(): string {
    return `${pcToName(this.pc)}${this.octave}`;
  }
}

export type IntervalName = 'third' | 'fifth' | 'seventh' | 'ninth';
export type IntervalType =
  //  | 'sus2'
  | 'minor'
  | 'major'
  // | 'sus4'
  | 'diminished'
  | 'perfect'
  | 'augmented';

export const intervalNames: IntervalName[] = [
  'third',
  'fifth',
  'seventh',
  'ninth',
];

export type IntervalInfo = { semitones: number | null; symbol: string };

export const namedIntervals = {
  third: {
    none: { semitones: null, symbol: 'sus' },
    minor: { semitones: 3, symbol: 'm' },
    major: { semitones: 4, symbol: '' },
  },
  fifth: {
    none: { semitones: null, symbol: 'drop5' },
    diminished: { semitones: 6, symbol: 'b5' },
    perfect: { semitones: 7, symbol: '' },
    augmented: { semitones: 8, symbol: '#5' },
  },
  seventh: {
    none: { semitones: null, symbol: '' },
    minor: { semitones: 10, symbol: 'b7' },
    major: { semitones: 11, symbol: '7' },
  },
  ninth: {
    none: { semitones: null, symbol: '' },
    minor: { semitones: 13, symbol: 'b9' },
    major: { semitones: 14, symbol: '9' },
  },
};

export type NamedIntervals = typeof namedIntervals;

export type Quality<A extends keyof NamedIntervals> = keyof NamedIntervals[A];
export type Extension = {
  seventh?: Quality<'seventh'>;
  ninth?: Quality<'ninth'>;
};

export type ChordParts = {
  readonly [K in keyof NamedIntervals]: Quality<K>;
};

export type PartsInfo = Record<IntervalName, IntervalInfo>;

const noParts: ChordParts = {
  third: 'none',
  fifth: 'none',
  seventh: 'none',
  ninth: 'none',
};

export class ChordType {
  readonly info: PartsInfo;
  readonly parts: ChordParts;

  readonly symbol: string;
  readonly length: number;
  readonly intervals: Array<Interval>;

  constructor(parts: Partial<ChordParts>) {
    this.parts = { ...noParts, ...parts };

    this.info = {} as PartsInfo;
    this.length = 0;
    this.symbol = '';
    const mutIntervals = [0];

    for (const k of intervalNames) {
      const part = this.parts[k] as Quality<typeof k>;
      this.info[k] = namedIntervals[k][part];
      const { semitones, symbol } = this.info[k];
      if (semitones) {
        this.length++;
        this.symbol += symbol;
        mutIntervals.push(semitones);
      }
    }
    this.intervals = mutIntervals;
  }

  inversion(n: number): Array<Interval> {
    n = positiveModulo(n, this.length);
    if (n === 0) {
      return this.intervals.slice();
    } else {
      const below = this.intervals.slice(n);
      const above = this.intervals.slice(0, n);
      return [...below.map(i => i - 12), ...above];
    }
  }

  static major(extension: Extension = {}): ChordType {
    return new ChordType({ third: 'major', fifth: 'perfect', ...extension });
  }

  static minor(extension: Extension = {}): ChordType {
    return new ChordType({ third: 'minor', fifth: 'perfect', ...extension });
  }

  static augmented(extension: Extension = {}): ChordType {
    return new ChordType({ third: 'major', fifth: 'augmented', ...extension });
  }

  static diminished(extension: Extension = {}): ChordType {
    return new ChordType({ third: 'minor', fifth: 'diminished', ...extension });
  }
}

export class Key {
  readonly tonic: PitchClass;

  private constructor(
    readonly name: string,
    tonic: PitchClassOrName,
    readonly notes: Array<PitchClass>,
    readonly accidentals: Accidental = 'flat',
  ) {
    this.tonic = toPitchClass(tonic);
  }

  static fromScale(
    name: string,
    tonic: PitchClassOrName,
    scale: Array<Interval>,
    accidentals?: Accidental,
  ): Key {
    const pc = toPitchClass(tonic);
    const notes = scale.map(i => transpose(pc, i));
    return new Key(name, tonic, notes, accidentals);
  }

  static major(tonic: PitchClassOrName, accidentals?: Accidental): Key {
    return Key.fromScale('major', tonic, [0, 2, 4, 5, 7, 9, 11], accidentals);
  }

  static minor(tonic: PitchClassOrName, accidentals?: Accidental): Key {
    return Key.fromScale('minor', tonic, [0, 2, 3, 5, 7, 9, 11], accidentals);
  }

  includes(pc: PitchClassOrName): boolean {
    return this.notes.includes(toPitchClass(pc));
  }
}

export type Voicing = {
  octave: Octave;
  inversion: number;
};

export class Chord {
  readonly root: PitchClass;
  readonly inversion: number;
  readonly octave: Octave;

  readonly pitches: Array<PitchClass>;
  readonly rootNote: Note;
  readonly voicing: Array<Note>;

  constructor(
    root: PitchClassOrName,
    readonly type: ChordType,
    voicing?: Partial<Voicing>,
  ) {
    this.root = toPitchClass(root);
    this.inversion = voicing?.inversion || 0;
    this.octave = voicing?.octave || 4;

    const intervals = this.type.inversion(this.inversion);
    this.pitches = intervals.map(interval => transpose(this.root, interval));
    this.rootNote = new Note(this.root, this.octave);
    this.voicing = intervals.map(interval => this.rootNote.transpose(interval));
  }

  name(accidental: Accidental = 'flat'): string {
    const letter = pcToName(this.root, accidental);
    const symbol = this.type.symbol;
    const intervals = this.type.inversion(this.inversion);
    const base = transpose(this.root, intervals[0]);
    const slash = base === this.root ? '' : '/' + pcToName(base, accidental);
    return `${letter}${symbol}${slash}`;
  }

  static major(root: PitchClassOrName, voicing?: Partial<Voicing>): Chord {
    return new Chord(root, ChordType.major(), voicing);
  }

  static minor(root: PitchClassOrName, voicing?: Partial<Voicing>): Chord {
    return new Chord(root, ChordType.minor(), voicing);
  }
}
