import {
  PitchClass,
  pitchClasses,
  FactorName,
  IntervalType,
  Interval,
  transpose,
  factorNames,
  identifyInterval,
  intervalBySemitones,
  MINOR_THIRD,
  MAJOR_THIRD,
  PERFECT_FIFTH,
  circleOfFifths,
  positiveModulo,
} from './music-theory';

export interface KeyboardCell {
  // the column in display space
  col: number;
  // the row in display space (may be fractional -- it's a hex grid remember)
  row: number;
  // a display-space-independent representation of the cell's position
  index: number;
  // the pitch class this key represents
  pitchClass: PitchClass;
  // whether or not this key can be the root of a chord
  isRoot: boolean;
}

export interface RelativeFactor {
  factorName: FactorName;
  intervalType: IntervalType;
  semitones: Interval;
}

export abstract class KeyboardLayout {
  abstract relationship(
    root: KeyboardCell,
    cell: KeyboardCell,
  ): RelativeFactor | undefined;

  readonly rootTable: KeyboardCell[];

  constructor(
    readonly rows: number,
    readonly cols: number,
    readonly cells: ReadonlyArray<KeyboardCell>,
    readonly hasSeparateRoots = true,
  ) {
    const rootTable: (KeyboardCell | undefined)[] = pitchClasses.map(
      () => undefined,
    );

    cells.forEach(cell => {
      const { pitchClass, isRoot } = cell;
      if (isRoot) {
        if (rootTable[pitchClass]) {
          throw new Error(
            'a keyboard layout must not define more than one root key for one pitch class',
          );
        }
        rootTable[pitchClass] = cell;
      }
    });

    this.rootTable = rootTable.map(root => {
      if (root) {
        return root;
      } else {
        throw new Error(
          'a keyboard layout must define a root key for each pitch class',
        );
      }
    });
  }

  lookupRoot(pc: PitchClass): KeyboardCell {
    return this.rootTable[pc];
  }

  isReachable(root: KeyboardCell, cell: KeyboardCell): boolean {
    return root === cell || this.relationship(root, cell) !== undefined;
  }
}

function thirdsOf(pcs: PitchClass[]): PitchClass[] {
  return [transpose(pcs[0], 3), ...pcs.map(pc => transpose(pc, 4))];
}

export class ChromaticLayout extends KeyboardLayout {
  constructor(factors = 4, bottomRoot: PitchClass = 0) {
    const roots = pitchClasses.map(pc => transpose(pc, bottomRoot));
    const thirds = thirdsOf(roots);
    const fifths = thirdsOf(thirds);
    const sevenths = thirdsOf(fifths);
    const ninths = thirdsOf(sevenths);
    const elevenths = thirdsOf(ninths);
    const levels = [roots, thirds, fifths, sevenths, ninths, elevenths];

    // Number of pitch classes at the [start, end] of each column
    // not reachable as a factor in any chord.
    const unreachable = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 1],
      [1, 2],
      [2, 3],
    ];

    const columns = levels.slice(0, factors + 1);

    const width = columns.length;
    const height = Math.max(
      ...columns.map(
        (c, i) =>
          (i % 2) / 2 + c.length - unreachable[i][0] - unreachable[i][1],
      ),
    );
    const offsets = columns.map((_, i) => (height - levels[i].length) / 2);
    const cells = columns.flatMap((pcs, col) => {
      const [min, max] = unreachable[col];
      return pcs
        .map((pc, i) => {
          return {
            index: min <= i && i < pcs.length - max ? i : -1,
            col: col,
            row: pcs.length - 1 - i + offsets[col],
            isRoot: col === 0,
            pitchClass: pc,
          };
        })
        .filter(cell => cell.index !== -1);
    });

    super(height, width, cells);
  }

  relationship(
    root: KeyboardCell,
    cell: KeyboardCell,
  ): RelativeFactor | undefined {
    if (!root.isRoot || cell.col === 0) {
      return undefined;
    }

    const factorName = factorNames[cell.col - 1];
    const semitones = cell.col * 3 + cell.index - root.index;
    const intervalType = identifyInterval(semitones, factorName);
    if (intervalType) {
      return {
        factorName,
        semitones,
        intervalType,
      };
    } else {
      return undefined;
    }
  }
}

export class FifthsLayout extends KeyboardLayout {
  constructor(factors = 4, bottomRoot: PitchClass = 0) {
    const roots = circleOfFifths.map(pc => transpose(pc, bottomRoot));
    const sideColumns = Math.ceil(factors / 2);

    // center column
    const columns = [roots];
    // left columns, each up by a minor third
    for (let i = 0; i < sideColumns; i++) {
      columns.unshift(columns[0].map(pc => transpose(pc, 3)));
    }
    // right columns, each up by a major third
    for (let i = 0; i < sideColumns; i++) {
      columns.push(columns[columns.length - 1].map(pc => transpose(pc, 4)));
    }

    const cells = columns.flatMap((pcs, col) => {
      return pcs.map((pc, i) => {
        return {
          index: i,
          col: col,
          row: 12 - (i + Math.abs(sideColumns - col) / 2),
          pitchClass: pc,
          isRoot: col === sideColumns,
        };
      });
    });

    super(12, columns.length, cells, false);
  }

  relationship(
    root: KeyboardCell,
    cell: KeyboardCell,
  ): RelativeFactor | undefined {
    const colInterval =
      root.col > cell.col
        ? MINOR_THIRD * (root.col - cell.col)
        : MAJOR_THIRD * (cell.col - root.col);
    const indexInterval =
      PERFECT_FIFTH * positiveModulo(cell.index - root.index, 12);
    const semitones = colInterval + indexInterval;
    const info = intervalBySemitones[semitones];
    if (info && info.name !== 'none') {
      const { factor, name } = info;
      return {
        factorName: factor,
        intervalType: name,
        semitones,
      };
    } else {
      return undefined;
    }
  }
}
