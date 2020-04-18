import React from 'react';
import { makeStyles, Theme, Color, ButtonBase, fade } from '@material-ui/core';

import { Chord, Key } from '../types';
import { noteColor } from '../lib/colors';

export type ChordButtonProps = {
  chord: Chord;
  keySignature?: Key;
} & React.ComponentPropsWithRef<'div'>;

type StyleProps = {
  color: Color;
  keyColor: 'black' | 'white';
};

const borderSize = 4;

function borderColor(props: StyleProps): string {
  return props.color[700];
}

function textColor(props: StyleProps): string {
  if (props.keyColor === 'white') {
    return 'rgba(0, 0, 0, 0.9)';
  } else {
    return 'rgba(255, 255, 255, 0.9)';
  }
}

function overlayColor(props: StyleProps): string {
  return props.color[700];
}

function rippleColor(props: StyleProps): string {
  if (props.keyColor === 'white') {
    return fade(props.color[900], 0.9);
  } else {
    return fade(props.color[50], 0.9);
  }
}

const useStyles = makeStyles<Theme, StyleProps, string>({
  root: {
    position: 'relative',
    zIndex: 100,
    width: '100%',
    userSelect: 'none',
    flex: '0 1 6em',
    borderRadius: '50%',
    border: props => `solid ${borderSize}px ${borderColor(props)}`,
    backgroundColor: props => props.keyColor,
    '&::before': {
      content: '""',
      display: 'block',
      paddingBottom: '100%',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: overlayColor,
      opacity: 0.3,
      borderRadius: 'inherit',
    },
  },
  buttonBase: {
    position: 'absolute',
    borderRadius: 'inherit',
    zIndex: 5,
    top: -borderSize,
    left: -borderSize,
    bottom: -borderSize,
    right: -borderSize,
    color: rippleColor,
  },
  content: {
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '150%',
    fontWeight: 'bold',
    color: textColor,
  },
});

export const ChordButton: React.FC<ChordButtonProps> = props => {
  const { chord, keySignature, ...rest } = props;

  const inKey = !keySignature || keySignature.includes(chord.root);
  const keyColor = inKey ? 'white' : 'black';
  const name = chord.name(keySignature?.accidentals);

  const color = noteColor(chord.root);
  const classes = useStyles({ color, keyColor });

  return (
    <div className={classes.root} {...rest}>
      <ButtonBase component="div" className={classes.buttonBase} />
      <div className={classes.content}>{name}</div>
    </div>
  );
};
