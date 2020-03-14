import { Theme, createMuiTheme } from '@material-ui/core/';
import * as MuiColors from '@material-ui/core/colors';

import { PitchClass } from './types';
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

/* */
const w = 700;
export const themes = [
  mkTheme(MuiColors.yellow[w]),
  mkTheme(MuiColors.amber[w]),
  mkTheme(MuiColors.orange[w]),
  // mkTheme(MuiColors.deepOrange),
  mkTheme(MuiColors.red[w]),
  mkTheme(MuiColors.pink[w]),
  mkTheme(MuiColors.purple[w]),
  // mkTheme(MuiColors.deepPurple),
  mkTheme(MuiColors.indigo[w]),
  mkTheme(MuiColors.blue[w]),
  //mkTheme(MuiColors.lightBlue),
  mkTheme(MuiColors.cyan[w]),
  mkTheme(MuiColors.teal[w]),
  mkTheme(MuiColors.green[w]),
  // mkTheme(MuiColors.lightGreen),
  mkTheme(MuiColors.lime[w]),
];
/* */

export const colors: string[] = [
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

// export const themes = colors.map(mkTheme);

export function noteTheme(note: PitchClass): Theme {
  return themes[note];
}

export function noteColor(note: PitchClass): string {
  return colors[note];
}

export function chromaticColor(note: PitchClass): string {
  return colors[note];
}

export function fifthsColor(note: PitchClass): string {
  return colors[note % 2 === 0 ? note : (note + 6) % 12];
}
