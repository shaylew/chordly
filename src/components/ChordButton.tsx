import React from 'react';
import { Button, ThemeProvider, withStyles } from '@material-ui/core';

import { Chord, chordName } from '../types';
import { noteTheme } from '../lib/colors';

export type ChordButtonProps = {
  chord: Chord;
} & React.ComponentPropsWithRef<typeof Button>;

const StyledButton = withStyles({
  root: {
    width: '100%',
    flex: '0 1 6em',
  },
})(Button);

export const ChordButton: React.FC<ChordButtonProps> = props => {
  const { chord, ...rest } = props;

  const theme = noteTheme(chord.root);

  return (
    <ThemeProvider theme={theme}>
      <StyledButton variant="contained" color="secondary" {...rest}>
        {chordName(chord)}
      </StyledButton>
    </ThemeProvider>
  );
};
