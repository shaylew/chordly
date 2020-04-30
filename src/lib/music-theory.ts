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

export type PitchClassOrName = PitchClass | NoteName;

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
export const pitchClasses: PitchClass[] =
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

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

export const intervalNames: IntervalArray<IntervalName> = [
  'third',
  'fifth',
  'seventh',
  'ninth',
];

export const intervalTypes: IntervalType[] = [
  'minor',
  'major',
  'diminished',
  'perfect',
  'augmented',
];

export type IntervalInfo = { semitones?: number; symbol: string };

export type IntervalIndex = 0 | 1 | 2 | 3;
export const I: Record<IntervalName, IntervalIndex> = {
  third: 0,
  fifth: 1,
  seventh: 2,
  ninth: 3,
};

export const N: IntervalArray<IntervalName> = [
  'third',
  'fifth',
  'seventh',
  'ninth',
];

export type IntervalArray<T> = [T, T, T, T];

export const namedIntervals: IntervalArray<Record<'none', IntervalInfo> &
  Partial<Record<IntervalType, IntervalInfo>>> = [
  {
    // thirds
    none: { symbol: 'sus' },
    minor: { semitones: 3, symbol: 'm' },
    major: { semitones: 4, symbol: '' },
  },
  {
    // fifths
    none: { symbol: 'drop5' },
    diminished: { semitones: 6, symbol: 'b5' },
    perfect: { semitones: 7, symbol: '' },
    augmented: { semitones: 8, symbol: '#5' },
  },
  {
    // sevenths
    none: { symbol: '' },
    diminished: { semitones: 9, symbol: 'bb7' },
    minor: { semitones: 10, symbol: 'b7' },
    major: { semitones: 11, symbol: '7' },
  },
  {
    // ninths
    none: { symbol: '' },
    minor: { semitones: 13, symbol: 'b9' },
    major: { semitones: 14, symbol: '9' },
  },
];

// Occasionally you just want less structure than this,
// when you're not being generic over intervals.
export const MINOR_THIRD = 3;
export const MAJOR_THIRD = 4;
export const FIFTH = 7;

export type NamedIntervals = typeof namedIntervals;

export type Quality<A extends IntervalName> = keyof NamedIntervals[typeof I[A]];

export function identifyInterval(
  interval: Interval,
  name: IntervalName,
): IntervalType | undefined {
  const section = namedIntervals[I[name]];
  for (const t of intervalTypes) {
    if (section[t]?.semitones === interval) {
      return t;
    }
  }
}

export type Extension = {
  seventh?: Quality<'seventh'>;
  ninth?: Quality<'ninth'>;
};

export type ChordParts = {
  readonly [K in IntervalName]: Quality<K>;
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
      const part = this.parts[k];
      this.info[k] = namedIntervals[I[k]][part] || namedIntervals[I[k]].none;
      const { semitones, symbol } = this.info[k];
      if (semitones) {
        this.length++;
        this.symbol += symbol;
        mutIntervals.push(semitones);
      }
    }
    this.intervals = mutIntervals;
  }

  static names = {
    major: new ChordType({ third: 'major', fifth: 'perfect' }),
    minor: new ChordType({ third: 'minor', fifth: 'perfect' }),
    diminished: new ChordType({ third: 'minor', fifth: 'diminished' }),
    augmented: new ChordType({ third: 'major', fifth: 'augmented' }),
  };

  altered(parts: Partial<ChordParts>): ChordType {
    return new ChordType({ ...this.parts, ...parts });
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

  static named(name: ChordTypeName, extension?: Extension): ChordType {
    const base = ChordType.names[name];
    return extension ? base.altered(extension) : base;
  }

  static defineNamed(name: ChordTypeName) {
    return function namedChord(extension?: Extension): ChordType {
      return ChordType.named(name, extension);
    };
  }

  static major = ChordType.defineNamed('major');
  static minor = ChordType.defineNamed('minor');
  static diminished = ChordType.defineNamed('diminished');
  static augmented = ChordType.defineNamed('augmented');
}

export type ChordTypeName = keyof typeof ChordType.names;
export type ChordTypeOrName = ChordType | ChordTypeName;

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

  includes(element: PitchClassOrName | Chord): boolean {
    if (typeof element === 'object') {
      return element.pitches.every(pc => this.notes.includes(pc));
    } else {
      return this.notes.includes(toPitchClass(element));
    }
  }
}

export type Voicing = {
  octave: Octave;
  inversion: number;
};

export class Chord {
  readonly root: PitchClass;
  readonly voicing: Voicing;
  readonly type: ChordType;

  readonly pitches: Array<PitchClass>;
  readonly rootNote: Note;
  readonly notes: Array<Note>;

  constructor(
    root: PitchClassOrName,
    type: ChordType | ChordTypeName,
    voicing?: Partial<Voicing>,
  ) {
    this.root = toPitchClass(root);
    this.voicing = { inversion: 0, octave: 4, ...voicing };
    this.type = typeof type === 'object' ? type : ChordType.named(type);

    const intervals = this.type.inversion(this.voicing.inversion);
    this.pitches = intervals.map(interval => transpose(this.root, interval));
    this.rootNote = new Note(this.root, this.voicing.octave);

    const voicedIntervals = this.type.inversion(this.voicing.inversion);
    this.notes = voicedIntervals.map(i => this.rootNote.transpose(i));
  }

  name(accidental: Accidental = 'flat'): string {
    const letter = pcToName(this.root, accidental);
    const symbol = this.type.symbol;
    const intervals = this.type.inversion(this.voicing.inversion);
    const base = transpose(this.root, intervals[0]);
    const slash = base === this.root ? '' : '/' + pcToName(base, accidental);
    return `${letter}${symbol}${slash}`;
  }

  includes(pc: PitchClassOrName): boolean {
    return this.pitches.includes(toPitchClass(pc));
  }

  altered(parts: Partial<ChordParts>): Chord {
    return new Chord(this.root, this.type.altered(parts), this.voicing);
  }

  tertianAltered(parts: Partial<ChordParts>, key?: Key): Chord {
    // all tertian intervals
    const valid = new Set<Interval>();
    intervalNames.forEach(name => {
      intervalTypes.forEach(type => {
        const semitones = namedIntervals[I[name]][type]?.semitones;
        if (semitones) valid.add(semitones);
      });
    });

    // intervals we've chosen to be in the new chord
    const newParts: Partial<Record<IntervalName, IntervalType | 'none'>> = {};

    // all intervals compatible with what we've already chosen
    let reachable = Array.from(valid.keys());

    function choose(name: IntervalName, type: IntervalType | 'none'): void {
      newParts[name] = type;
      const info = namedIntervals[I[name]][type];
      const factor = info && info.semitones;
      if (factor) {
        reachable = reachable.filter(interval => {
          const distance = factor - interval;
          return distance === 0 || valid.has(distance) || valid.has(-distance);
        });
      }
    }

    // include all the required chord factors
    intervalNames.forEach(name => {
      const part = parts[name];
      if (part) {
        choose(name, part);
      }
    });

    const highestFactor = Math.max(
      ...intervalNames.map((n, i) => (this.type.parts[n] !== 'none' ? i : -1)),
    );

    const highestNew = Math.max(
      ...intervalNames.map((n, i) =>
        parts[n] && parts[n] !== 'none' ? i : -1,
      ),
    );

    // reconstruct the rest of the chord, changing as little as possible
    intervalNames.forEach((name, i) => {
      if (newParts[name]) {
        return; // we've already added this
      }

      // build a list of candidate values for this chord position
      const candidates = intervalTypes.filter(type =>
        reachable.includes(namedIntervals[I[name]][type]?.semitones || -1),
      );
      const inKey = candidates.filter(i =>
        key?.includes(
          transpose(this.root, namedIntervals[I[name]][i]?.semitones || -1),
        ),
      );

      if (i <= highestFactor) {
        const currentPart = this.type.parts[name];
        if (currentPart !== 'none') {
          const interval = this.type.info[name].semitones;
          if (interval && reachable.includes(interval)) {
            // the chord has a value in this position, so keep it if we can.
            choose(name, currentPart);
          } else {
            // but if has one that doesn't fit, switch to a value that does
            choose(name, inKey[0] || candidates[0]);
          }
        }
      } else if (i < highestNew) {
        choose(name, inKey[0] || candidates[0]);
      }
    });

    return new Chord(this.root, new ChordType(newParts));
  }

  static defineNamed(name: ChordTypeName) {
    return function namedChord(
      root: PitchClassOrName,
      voicing?: Partial<Voicing>,
    ): Chord {
      return new Chord(root, name, voicing);
    };
  }

  static major = Chord.defineNamed('major');
  static minor = Chord.defineNamed('minor');
  static diminished = Chord.defineNamed('diminished');
  static augmented = Chord.defineNamed('augmented');
}

eval('if (this.alert) this.Chord = Chord');
