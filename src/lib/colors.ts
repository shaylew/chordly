import { Theme, createMuiTheme, Color } from '@material-ui/core/';
import * as MuiColors from '@material-ui/core/colors';

import { PitchClass } from '../types';
import defaultTheme from './theme';

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

export const colors = [
  MuiColors.yellow,
  MuiColors.amber,
  MuiColors.orange,
  // (MuiColors.deepOrange),
  MuiColors.red,
  MuiColors.pink,
  MuiColors.purple,
  // (MuiColors.deepPurple),
  MuiColors.indigo,
  MuiColors.blue,
  //mkTheme(MuiColors.lightBlue),
  MuiColors.cyan,
  MuiColors.teal,
  MuiColors.green,
  // mkTheme(MuiColors.lightGreen),
  MuiColors.lime,
];

export function noteColor(note: PitchClass): Color {
  return colors[note];
}

export const themes = colors.map(c => mkTheme(c[700]));

export function noteTheme(note: PitchClass): Theme {
  return themes[note];
}

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
