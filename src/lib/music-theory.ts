export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type Interval = number;

export type Accidental = 'sharp' | 'flat';

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export function positiveModulo(x: number, r: number): number {
  return ((x % r) + r) % r;
}

export function transpose(pc: PitchClass, interval: Interval): PitchClass {
  return positiveModulo(pc + interval, 12) as PitchClass;
}

export function stepsAbove(low: PitchClass, high: PitchClass): Interval {
  return positiveModulo(high - low, 12);
}

const prettySymbols: Record<string, string> = {
  '#': '♯',
  b: '♭',
  '+': '⁺',
  '0': '⁰',
};
const prettyRegexp = /[#b0+]/g;
export function prettyNotation(notation: string): string {
  return notation.replace(prettyRegexp, s => prettySymbols[s] || s);
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
export const romanNumerals: string[] =
  ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
// prettier-ignore
export const chordNumerals =
'I bII II bIII III IV bV V bVI VI bVII VII'.split(' ');
// prettier-ignore
export const pitchClasses: PitchClass[] =
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function isPitchClass(pc: unknown): pc is PitchClass {
  return typeof pc === 'number' && 0 <= pc && pc <= 11;
}

export const circleOfFifths: PitchClass[] = pitchClasses.map((_, i) =>
  transpose(0, 7 * i),
);

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

export function prettyName(
  name: PitchClassOrName,
  accidentals: Accidental = 'flat',
): string {
  if (typeof name === 'number') {
    name = pcToName(name, accidentals);
  }
  return prettyNotation(name);
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

export type FactorName = 'third' | 'fifth' | 'seventh' | 'ninth' | 'eleventh';
export type IntervalType =
  //  | 'sus2'
  | 'minor'
  | 'major'
  // | 'sus4'
  | 'diminished'
  | 'perfect'
  | 'augmented';

export const factorNames: FactorArray<FactorName> = [
  'third',
  'fifth',
  'seventh',
  'ninth',
  'eleventh',
];

export const intervalTypes: IntervalType[] = [
  'minor',
  'major',
  'diminished',
  'perfect',
  'augmented',
];

export type IntervalInfo = {
  semitones?: number;
  symbol: string;
  name: IntervalType | 'none';
};

export type FactorIndex = 0 | 1 | 2 | 3 | 4;
export const I: Record<FactorName, FactorIndex> = {
  third: 0,
  fifth: 1,
  seventh: 2,
  ninth: 3,
  eleventh: 4,
};

export const N: FactorArray<FactorName> = [
  'third',
  'fifth',
  'seventh',
  'ninth',
  'eleventh',
];

export type FactorArray<T> = [T, T, T, T, T];

export const namedIntervals: FactorArray<Record<'none', IntervalInfo> &
  Partial<Record<IntervalType, IntervalInfo>>> = [
  {
    // thirds
    none: { name: 'none', symbol: 'sus' },
    minor: { name: 'minor', semitones: 3, symbol: 'm' },
    major: { name: 'major', semitones: 4, symbol: '' },
  },
  {
    // fifths
    none: { symbol: 'no5', name: 'none' },
    diminished: { semitones: 6, symbol: '♭5', name: 'diminished' },
    perfect: { semitones: 7, symbol: '', name: 'perfect' },
    augmented: { semitones: 8, symbol: '♯5', name: 'augmented' },
  },
  {
    // sevenths
    none: { symbol: '', name: 'none' },
    diminished: { semitones: 9, symbol: '𝄫7', name: 'diminished' },
    minor: { semitones: 10, symbol: '♭7', name: 'minor' },
    major: { semitones: 11, symbol: '7', name: 'major' },
  },
  {
    // ninths
    none: { symbol: '', name: 'none' },
    minor: { semitones: 13, symbol: '♭9', name: 'minor' },
    major: { semitones: 14, symbol: '9', name: 'major' },
  },
  {
    // elevenths
    none: { symbol: '', name: 'none' },
    perfect: { semitones: 17, symbol: '11', name: 'perfect' },
  },
];

export const intervalBySemitones: Partial<Record<
  Interval,
  IntervalInfo & { factor: FactorName }
>> = {};
namedIntervals.forEach((infos, i) => {
  const factor = factorNames[i];
  Object.values(infos).forEach(info => {
    if (info?.semitones) {
      intervalBySemitones[info.semitones] = { ...info, factor };
    }
  });
});

export const namedTriads: ReadonlyArray<{ name: string } & Partial<
  Record<FactorName, IntervalType>
>> = [
  { name: 'major', third: 'major', fifth: 'perfect' },
  { name: 'minor', third: 'minor', fifth: 'perfect' },
  // { name: 'augmented', third: 'major', fifth: 'augmented' },
  // { name: 'diminished', third: 'minor', fifth: 'diminished' },
];

// Occasionally you just want less structure than this,
// when you're not being generic over intervals.
export const MINOR_THIRD = 3;
export const MAJOR_THIRD = 4;
export const PERFECT_FIFTH = 7;

export type NamedIntervals = typeof namedIntervals;

export type Quality<A extends FactorName> = keyof NamedIntervals[typeof I[A]];

export function identifyInterval(
  interval: Interval,
  factor: FactorName,
): IntervalType | undefined {
  const section = intervalBySemitones[interval];
  if (section && section.factor === factor && section.name !== 'none') {
    return section.name;
  }
}

export function isLegalFactor(
  root: PitchClass,
  other: PitchClass,
  factor?: FactorIndex | FactorName | number,
): boolean {
  const interval = stepsAbove(root, other);
  if (factor === undefined) {
    return !!intervalBySemitones[interval];
  } else if (typeof factor === 'number') {
    factor = factorNames[factor];
  }

  return (
    intervalBySemitones[interval]?.factor === factor ||
    intervalBySemitones[interval + 12]?.factor === factor
  );
}

export type Extension = {
  seventh?: Quality<'seventh'>;
  ninth?: Quality<'ninth'>;
  eleventh?: Quality<'eleventh'>;
};

export type ChordParts = {
  readonly [K in FactorName]: Quality<K>;
};

export type PartsInfo = FactorArray<IntervalInfo>;

const noParts: ChordParts = {
  third: 'none',
  fifth: 'none',
  seventh: 'none',
  ninth: 'none',
  eleventh: 'none',
};

const noInfo: PartsInfo = [
  namedIntervals[0].none,
  namedIntervals[1].none,
  namedIntervals[2].none,
  namedIntervals[3].none,
  namedIntervals[4].none,
];

export class ChordType {
  readonly info: PartsInfo;
  readonly parts: ChordParts;

  readonly symbols: string[];
  readonly symbol: string;
  readonly length: number;
  readonly intervals: Array<Interval>;

  constructor(parts: Partial<ChordParts>) {
    this.parts = { ...noParts, ...parts };

    this.info = noInfo.slice() as typeof noInfo;

    let length = 0;
    const symbols: string[] = [];
    const intervals = [0];

    factorNames.forEach((name, i) => {
      const part = this.parts[name];
      this.info[i] = namedIntervals[i][part] || namedIntervals[i].none;
      const { semitones, symbol } = this.info[i];
      if (semitones) {
        length++;
        symbols.push(symbol);
        intervals.push(semitones);
      }
    });
    this.length = length;
    this.symbols = symbols;
    this.symbol = symbols.join('');
    this.intervals = intervals;
  }

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

  get triad(): string | undefined {
    const t = namedTriads.find(
      t => t.third === this.parts.third && t.fifth === this.parts.fifth,
    );
    return t ? t.name : undefined;
  }

  static names = {
    major: new ChordType({ third: 'major', fifth: 'perfect' }),
    minor: new ChordType({ third: 'minor', fifth: 'perfect' }),
    diminished: new ChordType({ third: 'minor', fifth: 'diminished' }),
    augmented: new ChordType({ third: 'major', fifth: 'augmented' }),
  };

  static named(name: ChordTypeName, extension?: Extension): ChordType {
    const base = ChordType.names[name];
    return extension ? base.altered(extension) : base;
  }

  static defineNamed(name: ChordTypeName) {
    return function namedChord(extension?: Extension): ChordType {
      return ChordType.named(name, extension);
    };
  }

  static fromRoman(roman: string): [Interval, ChordType] | undefined {
    const parts = roman.match(/^([b#]?)([ivx]+|[IVX]+)([+0]?)$/);
    if (parts) {
      const [accidental, body, modifier] = parts;
      const numeral = body.toUpperCase();
      const third = body === numeral ? 'major' : 'minor';
      const fifth =
        modifier === '0'
          ? 'diminished'
          : modifier === '+'
          ? 'augmented'
          : undefined;
      const degree = chordNumerals.indexOf(`${accidental}${numeral}`);
      return [degree, ChordType.named(fifth || third)];
    } else {
      return undefined;
    }
  }

  static major = ChordType.defineNamed('major');
  static minor = ChordType.defineNamed('minor');
  static diminished = ChordType.defineNamed('diminished');
  static augmented = ChordType.defineNamed('augmented');
}

export type ChordTypeName = keyof typeof ChordType.names;
export type ChordTypeOrName = ChordType | ChordTypeName;

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

  nameParts(accidental: Accidental = 'flat'): string[] {
    const letter = pcToName(this.root, accidental);
    const symbols = this.type.symbols;
    return [letter, ...symbols];
  }

  name(accidental: Accidental = 'flat'): string {
    return this.nameParts(accidental).join('');
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
    factorNames.forEach(name => {
      intervalTypes.forEach(type => {
        const semitones = namedIntervals[I[name]][type]?.semitones;
        if (semitones) valid.add(semitones);
      });
    });

    // intervals we've chosen to be in the new chord
    const newParts: Partial<Record<FactorName, IntervalType | 'none'>> = {};

    // all intervals compatible with what we've already chosen
    let reachable = Array.from(valid.keys());

    function choose(name: FactorName, type: IntervalType | 'none'): void {
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
    factorNames.forEach(name => {
      const part = parts[name];
      if (part) {
        choose(name, part);
      }
    });

    const highestFactor = Math.max(
      ...factorNames.map((n, i) => (this.type.parts[n] !== 'none' ? i : -1)),
    );

    const highestNew = Math.max(
      ...factorNames.map((n, i) => (parts[n] && parts[n] !== 'none' ? i : -1)),
    );

    // reconstruct the rest of the chord, changing as little as possible
    factorNames.forEach((name, i) => {
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
          const interval = this.type.info[i].semitones;
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

export type KeyType = 'major' | 'minor' | 'chromatic';
export const keyTypes: KeyType[] = ['major', 'minor', 'chromatic'];

export function isKeyType(type: unknown): type is KeyType {
  return typeof type === 'string' && keyTypes.includes(type as KeyType);
}

export class Key {
  readonly tonic: PitchClass;

  private constructor(
    readonly type: KeyType,
    tonic: PitchClassOrName,
    readonly notes: Array<PitchClass>,
    readonly accidentals: Accidental = 'flat',
  ) {
    this.tonic = toPitchClass(tonic);
  }

  noteName(pcOrName: PitchClassOrName): string {
    const pc = typeof pcOrName === 'number' ? pcOrName : nameToPC(pcOrName);
    return prettyName(pcToName(pc, this.accidentals));
  }

  chordNumeral(chord: Chord): string {
    const numeral = chordNumerals[stepsAbove(this.tonic, chord.root)];
    const casedNumeral =
      chord.type.parts.third === 'minor' ? numeral.toLowerCase() : numeral;
    const suffix =
      chord.type.parts.fifth === 'diminished'
        ? '0'
        : chord.type.parts.fifth === 'augmented'
        ? '+'
        : '';
    return prettyNotation(`${casedNumeral}${suffix}`);
  }

  naturalChord(degree: number): Chord {
    const firstIx = positiveModulo(degree - 1, this.notes.length);
    const thirdIx = (firstIx + 2) % this.notes.length;
    const fifthIx = (thirdIx + 2) % this.notes.length;
    const [first, third, fifth] = [firstIx, thirdIx, fifthIx].map(
      i => this.notes[i],
    );
    const type = new ChordType({
      third: identifyInterval(stepsAbove(first, third), 'third'),
      fifth: identifyInterval(stepsAbove(first, fifth), 'fifth'),
    });
    return new Chord(first, type);
  }

  static fromScale(
    type: KeyType,
    tonic: PitchClassOrName,
    scale: Array<Interval>,
    accidentals?: Accidental,
  ): Key {
    const pc = toPitchClass(tonic);
    const notes = scale.map(i => transpose(pc, i));
    return new Key(type, tonic, notes, accidentals);
  }

  static named(
    type: 'major' | 'minor' | 'chromatic',
    tonic: PitchClassOrName,
    accidentals?: Accidental,
  ): Key {
    return Key[type](tonic, accidentals);
  }

  static major(tonic: PitchClassOrName, accidentals?: Accidental): Key {
    return Key.fromScale('major', tonic, [0, 2, 4, 5, 7, 9, 11], accidentals);
  }

  static minor(tonic: PitchClassOrName, accidentals?: Accidental): Key {
    return Key.fromScale('minor', tonic, [0, 2, 3, 5, 7, 8, 10], accidentals);
  }

  static chromatic(tonic: PitchClassOrName, accidentals?: Accidental): Key {
    return Key.fromScale('chromatic', tonic, pitchClasses, accidentals);
  }

  includes(element: PitchClassOrName | Chord): boolean {
    if (typeof element === 'object') {
      return element.pitches.every(pc => this.notes.includes(pc));
    } else {
      return this.notes.includes(toPitchClass(element));
    }
  }
}
