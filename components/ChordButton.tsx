import React from 'react';
import { Button, ThemeProvider, withStyles } from '@material-ui/core';

import { PitchClass } from '../lib/types';
import { noteTheme } from '../lib/colors';

export type ChordButtonProps = {
  label: string;
  root: PitchClass;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
};

const StyledButton = withStyles({
  root: {
    width: '100%',
  },
})(Button);

export const ChordButton: React.FC<ChordButtonProps> = props => {
  const { label, root, ...handlers } = props;
  const theme = noteTheme(root);

  return (
    <ThemeProvider theme={theme}>
      <StyledButton variant="contained" color="secondary" {...handlers}>
        {label}
      </StyledButton>
    </ThemeProvider>
  );
};
