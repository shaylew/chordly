import React from 'react';
import clsx from 'clsx';
import { ButtonBase, makeStyles, ButtonBaseProps } from '@material-ui/core';

import { useNoteColors } from '../lib/colors';
import { Chord } from '../types';
import { transpose, Key } from '../lib/music-theory';

export type ChordButtonEvent<T = undefined, E = any> = (
  chord: Chord,
  value: T,
  event: E,
) => void;

export type ChordButtonEvents<T> = {
  onMouseDown?: ChordButtonEvent<T>;
  onMouseUp?: ChordButtonEvent<T>;
  onMouseLeave?: ChordButtonEvent<T>;
  onClick?: ChordButtonEvent<T>;
};

type ButtonProps = ButtonBaseProps<'div', { component?: 'div' }>;

function mkEvent<T, E>(
  chord: Chord,
  value: T,
  h?: ChordButtonEvent<T, E>,
): ((e: E) => void) | undefined {
  return h ? (e: E) => h(chord, value, e) : undefined;
}

export function mkChordEvents<T>(
  events: ChordButtonEvents<T>,
  chord: Chord,
  value: T,
): Pick<ButtonProps, keyof ChordButtonEvents<undefined>> {
  return {
    onMouseDown: mkEvent(chord, value, events.onMouseDown),
    onMouseUp: mkEvent(chord, value, events.onMouseUp),
    onClick: mkEvent(chord, value, events.onClick),
    onMouseLeave: mkEvent(chord, value, events.onMouseLeave),
  };
}

export type ChordDisplayProps = {
  chord: Chord;
  keySignature?: Key;
  highlight?: boolean;
} & ButtonProps;

const useChordStyles = makeStyles({
  root: {
    display: 'grid',
    minWidth: '8em',
    gridAutoColumns: 'minmax(1.6em, 1fr)',
    gridTemplateRows: '[row1] 4fr [row2] 3fr',
    background: 'transparent', // 'var(--note-color-100)',
    // border: 'solid var(--note-color-500) 2px',
    alignItems: 'stretch',
    lineHeight: 'normal',
    color: 'var(--note-color-700)',
    fontSize: 'min(2em, 3vw)',
    position: 'relative',
    zIndex: 100,
    '&::after': {
      opacity: 0.25,
      content: '""',
      position: 'absolute',
      zIndex: -1,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--note-color-200)',
      transition: 'opacity 0.25s ease-out',
    },
  },
  highlighted: {
    '&::after': { opacity: 1 },
  },
  symbol: {
    textAlign: 'center',
    padding: '0.125em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: 'var(--note-color-900)',
  },
  rootSymbol: {
    gridRow: 'row1',
    fontSize: '125%',
    justifyContent: 'flex-end',
  },
  factorSymbol: {
    gridRow: 'row1',
    // fontSize: '200%',
  },
  triadSymbol: {
    gridRow: 'row1',
    gridColumn: 'span 2',
    // alignItems: 'flex-start',
    // fontSize: '200%',
  },
  factorNote: {
    gridRow: 'row2',
    fontSize: '80%',
    background: 'var(--note-color-200)',
    color: 'var(--note-color-700)',
    // position: 'absolute',
    width: '100%',

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // borderBottom: 'solid var(--note-color-700) 0.5em',

    // borderRadius: '50%',
    borderTop: 'solid var(--note-color-700) 0.5em',

    // '&::after': {
    //   content: '""',
    //   paddingTop: '100%',
    // },
  },
});

export const ChordDisplay: React.FC<ChordDisplayProps> = props => {
  const {
    chord,
    className,
    highlight = false,
    keySignature = Key.major('C'),
    ...buttonProps
  } = props;
  const root = chord.root;

  const colors = useNoteColors();
  const classes = useChordStyles();

  const rootName = keySignature.noteName(root);
  const triad = chord.type.triad;
  const triadColor = !triad ? null : colors[`note-${chord.pitches[1]}`];

  const parts = chord.type.info.map(({ symbol, semitones }) => {
    const pc = semitones ? transpose(chord.root, semitones) : null;
    const name = pc !== null ? keySignature.noteName(pc) : null;
    const color = colors[`note-${pc !== null ? pc : 'none'}`];
    return { symbol, name, color };
  });

  return (
    <ButtonBase
      component="div"
      focusRipple
      className={clsx(
        classes.root,
        colors[`note-${root}`],
        {
          [classes.highlighted]: highlight,
        },
        className,
      )}
      {...buttonProps}
    >
      <div className={clsx(classes.symbol, classes.rootSymbol)}>{rootName}</div>
      <div className={classes.factorNote}>{rootName}</div>
      {!triad ? null : (
        <div className={clsx(classes.symbol, classes.triadSymbol, triadColor)}>
          {triad}
        </div>
      )}
      {parts.map(({ name, symbol, color }, i) => {
        if (symbol === '' && name === null) return null;
        return (
          <React.Fragment key={i}>
            <div className={clsx(classes.factorNote, color)}>{name || '∅'}</div>
            {triad && i < 2 ? null : (
              <div
                className={clsx(classes.symbol, classes.factorSymbol, color)}
              >
                {symbol}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </ButtonBase>
  );
};

export default ChordDisplay;
