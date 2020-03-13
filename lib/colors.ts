import { PitchClass } from './types';

export type Color = string;

export const colors: Color[] = [
  '#ffdf00', // yellow
  '#ff9f00', // orange peel
  '#fe3700', // vermilion
  '#fd497f', // rose
  '#fe74dd', // magenta
  '#ac03ff', // purple
  '#6103ff', // violet
  '#0403ff', // blue
  '#0374ff', // cornflower
  '#03dbff', // arctic blue
  '#00ef59', // spring green
  '#b0ed11', // lime
];

export function noteColor(note: PitchClass): Color {
  return colors[note];
}

export function chromaticColor(note: PitchClass): Color {
  return colors[note];
}

export function fifthsColor(note: PitchClass): Color {
  return colors[note % 2 === 0 ? note : (note + 6) % 12];
}
