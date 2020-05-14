import { Theme, createMuiTheme, Color, makeStyles } from '@material-ui/core/';
import * as MuiColors from '@material-ui/core/colors';

import { PitchClass } from '../types';
import defaultTheme from './theme';
import { StyleRules, CSSProperties } from '@material-ui/core/styles/withStyles';

function mkTheme(color: string): Theme {
  return createMuiTheme({
    ...defaultTheme,
    palette: {
      secondary: { main: color },
    },
    typography: {
      button: {
        textTransform: 'none',
        fontWeight: 'bold',
      },
    },
  });
}

export const rainbow = [
  MuiColors.yellow,
  MuiColors.amber,
  // MuiColors.orange,
  MuiColors.deepOrange,
  MuiColors.red,
  // MuiColors.pink,
  MuiColors.purple,
  MuiColors.deepPurple,
  MuiColors.indigo,
  // MuiColors.blue,
  MuiColors.lightBlue,
  MuiColors.cyan,
  // MuiColors.teal,
  MuiColors.green,
  MuiColors.lightGreen,
  MuiColors.lime,
];

const prime = 5;
export const colors = rainbow.map((_, i) => {
  return rainbow[(i * prime) % rainbow.length];
});

export function noteColor(note: PitchClass): Color {
  return colors[note];
}

export const themes = colors.map(c => mkTheme(c[700]));

export function noteTheme(note: PitchClass): Theme {
  return themes[note];
}

export function colorFor(note?: number): string {
  const name = note === undefined ? 'none' : note;
  return `note-${name}`;
}

const colorStyles: StyleRules = {};
function defineColorStyles(color: Color, pc: number | undefined): void {
  const style: CSSProperties = {};
  Object.entries(color).forEach(([weight, c]) => {
    style[`--note-color-${weight}`] = c;
  });
  colorStyles[colorFor(pc)] = style;
}
colors.forEach(defineColorStyles);
defineColorStyles(MuiColors.grey, undefined);
export const useNoteColors = makeStyles(colorStyles);

// export const altColors: string[] = [
//   '#ffdf00', // yellow
//   '#ff9f00', // orange peel
//   '#fe3700', // vermilion
//   '#fd497f', // rose
//   '#fe74dd', // magenta
//   '#ac03ff', // purple
//   '#6103ff', // violet
//   '#0403ff', // blue
//   '#0374ff', // cornflower
//   '#03dbff', // arctic blue
//   '#00ef59', // spring green
//   '#b0ed11', // lime
// ];

// export const themes = colors.map(mkTheme);

// export function noteColor(note: PitchClass): string {
//   return colors[note];
// }

// export function chromaticColor(note: PitchClass): string {
//   return colors[note];
// }

// export function fifthsColor(note: PitchClass): string {
//   return colors[note % 2 === 0 ? note : (note + 6) % 12];
// }
