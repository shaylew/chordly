import { Interval, ChordType, Chord, transpose } from './music-theory';

export type SuggestionPart = { degree: Interval; type: ChordType };
export type Suggestion = {
  name: string;
  parts: SuggestionPart[];
};

function fromRoman(roman: string): SuggestionPart {
  const info = ChordType.fromRoman(roman);
  if (!info) {
    throw new Error('invalid suggestion chord!');
  }
  const [degree, type] = info;
  return { degree, type };
}

function fromShorthand(shorthand: string): Suggestion {
  const romans = shorthand.split(/[- ]+/g);
  return { name: shorthand, parts: romans.map(fromRoman) };
}

export const suggestions = {
  major: [
    'I IV V I',
    'I vi IV V',
    'I ii I V',
    'I IV vii0 iii vi ii V I',
    'I bVII bVI bVII',
  ].map(fromShorthand),
  minor: [].map(fromShorthand),
};

export default suggestions;
