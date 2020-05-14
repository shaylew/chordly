import { PitchClass, Octave, Chord, Note, Volume } from '../types';
import { stepsAbove, factorNames, transpose, FactorName } from './music-theory';
import { Interval } from 'tone/build/esm/core/type/Units';

export type Voicing = Array<[Note, Volume]>;

export function normalizeVolume(voicing: Voicing, volume = 1): Voicing {
  const sum = voicing.reduce((s, [_, v]) => s + v, 0);
  const k = volume / sum;
  return voicing.map(([n, v]) => [n, k * v]);
}

export function normalizeGroups(groups: Voicing[], volume = 1): Voicing[] {
  const sums = groups.map(g => g.reduce((s, [_, v]) => s + v, 0));
  const sum = sums.reduce((s, x) => s + x, 0);
  return groups.map((g, i) => {
    const k = (volume * sums[i]) / sum;
    return g.map(([n, v]) => [n, k * v]);
  });
}

export function voiceSimple(chord: Chord, octave: Octave = 4): Voicing {
  const root = new Note(chord.root, octave);
  return chord.type.intervals.map(i => [root.transpose(i), 1]);
}

export function shepardTone(
  pc: PitchClass,
  octaves: Octave[] = [3, 4, 5],
  center: PitchClass = 0,
  volume = 1,
): Voicing {
  if (octaves.length === 1) {
    return [[new Note(pc, octaves[0]), 1]];
  }

  const lowOctave = octaves[0];
  const highOctave = octaves[octaves.length - 1];
  const midOctaves = octaves.slice(1, octaves.length - 1);
  const vlow = stepsAbove(center, pc) / 12;
  const vhigh = 1 - vlow;
  return normalizeVolume(
    [
      [new Note(pc, lowOctave), Math.sqrt(vlow)],
      ...midOctaves.map((o: Octave): [Note, number] => [
        new Note(pc, o),
        Math.sqrt(2),
      ]),
      [new Note(pc, highOctave), Math.sqrt(vhigh)],
    ],
    volume,
  );
}

export function voiceShepard(chord: Chord): Voicing[] {
  const partInfo: Record<
    string,
    { octaves: Octave[]; power: number; semitones?: Interval }
  > = {
    root: {
      octaves:
        chord.type.has('seventh') || chord.type.has('ninth')
          ? [-1, 0, 1]
          : [-1, 0, 1],
      power: 2,
      semitones: 0,
    },
    third: {
      octaves:
        chord.type.has('ninth') || chord.type.has('eleventh') ? [0] : [0, 1],
      power: 1.5,
    },
    fifth: { octaves: [-1, 0, 1], power: 1 },
  };
  chord.type.info.map(({ semitones }, i) => {
    const name = factorNames[i];
    partInfo[name] = partInfo[name] || {};
    partInfo[name].semitones = semitones;
  });

  const root = new Note(chord.root, 4);
  const parts: Voicing[] = [];
  ['root', ...factorNames].forEach(name => {
    const { semitones, octaves = [0], power = 1 } = partInfo[name] || {};
    if (semitones !== undefined) {
      const note = root.transpose(semitones);
      parts.push(
        shepardTone(
          note.pc,
          octaves.map(d => d + note.octave),
          transpose(0, semitones),
          power,
        ),
      );
    }
  });
  return parts;
}
