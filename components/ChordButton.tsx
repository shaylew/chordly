import React from 'react';
import { Button, ThemeProvider, withStyles } from '@material-ui/core';

import { Chord, chordName } from '../lib/types';
import { Player } from '../lib/core';
import { noteTheme } from '../lib/colors';
import usePlayer from '../components/PlayerContext';

export type ChordButtonProps = {
  chord: Chord;
} & React.ComponentPropsWithRef<typeof Button>;

const StyledButton = withStyles({
  root: {
    width: '100%',
  },
})(Button);

const makeHandlers = (player: Player | null, chord: Chord) => {
  let held = false;
  let playing = false;

  const start = () => {
    if (player && !playing) {
      held = false;
      playing = true;

      player.triggerChordStart(chord);
      setTimeout(() => {
        held = true;
      }, 500);
    }
  };

  const end = () => {
    if (player) {
      if (held) {
        player.triggerChordEnd(chord);
      } else {
        player.triggerChordEnd(chord, '+8n');
      }
      playing = false;
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: end,
  };
};

export const ChordButton: React.FC<ChordButtonProps> = props => {
  const { chord, ...rest } = props;
  const player = usePlayer();

  const theme = noteTheme(chord.root);
  const handlers = makeHandlers(player, chord);

  return (
    <ThemeProvider theme={theme}>
      <StyledButton
        variant="contained"
        color="secondary"
        {...{ ...handlers, ...rest }}
      >
        {chordName(chord)}
      </StyledButton>
    </ThemeProvider>
  );
};
