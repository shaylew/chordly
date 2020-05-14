import React, { useMemo } from 'react';
import clsx from 'clsx';
import {
  makeStyles,
  ButtonBase,
  ButtonBaseProps,
  Paper,
  PaperProps,
} from '@material-ui/core';

import { Chord, Key, transpose } from '../types';
import { ChordButtonEvent, Send } from '../machines/types';
import { useNoteColors } from '../lib/colors';

type ButtonProps = ButtonBaseProps<'div', { component?: 'div' }>;

export type ChordButtonProps = {
  chord: Chord;
  keySignature?: Key;
  send?: Send<ChordButtonEvent>;
  highlight?: boolean;
  minimumParts?: number;
  top?: 'name' | 'notes' | 'roman';
  bottom?: 'name' | 'notes' | 'roman' | 'none';
  className?: string;
  buttonProps?: ButtonProps;
  paperProps?: PaperProps;
};

type ChordSectionProps = {
  chord: Chord;
  rootName: string;
  triad?: string;
  triadColor?: string;
  roman: string;
  minimumParts: number;
  split: boolean;
  parts: Array<{ name?: string; symbol: string; color: string }>;
  className?: string;
};

const useChordStyles = makeStyles({
  paper: {
    display: 'flex',
    alignItems: 'stretch',
  },
  root: {
    flex: '1 1 auto',
    display: 'grid',
    gridAutoColumns: 'minmax(1.6em, 1fr)',
    gridTemplateRows: '4fr',
    gridAutoRows: '3fr',
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
  symbol: {},
  highlighted: {
    '&::after': { opacity: 1 },
  },
  top: {
    gridRow: '1',
    textAlign: 'center',
    padding: '0.125em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: 'var(--note-color-900)',
  },
  soloTop: {
    justifyContent: 'center',
  },
  bottom: {
    gridRow: '2',
    fontSize: '80%',
    width: '100%',
    background: 'var(--note-color-200)',
    color: 'var(--note-color-700)',
    borderTop: 'solid var(--note-color-700) 0.5em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootSymbol: {
    fontSize: '125%',
    justifyContent: 'flex-end',
  },
  triad: {
    gridColumn: 'span 2',
  },
  roman: {},
  '$roman:not($soloTop)': {
    gridColumn: 'span 3',
  },
});

const ChordName: React.FC<ChordSectionProps> = props => {
  const {
    rootName,
    parts,
    triad,
    triadColor,
    minimumParts,
    className,
    split,
  } = props;
  const classes = useChordStyles();

  if (!split) {
    return (
      <>
        <div className={clsx(className, classes.symbol)}>
          {rootName} {triad ? triad : parts.slice(1, 3).map(p => p.name)}{' '}
          {parts
            .slice(3)
            .map(p => p.name)
            .join(' ')}
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className={clsx(className, classes.symbol, classes.rootSymbol)}>
          {rootName}
        </div>
        {!triad ? null : (
          <div
            className={clsx(
              className,
              classes.symbol,
              classes.triad,
              triadColor,
            )}
          >
            {triad}
          </div>
        )}
        {parts.map(({ name, symbol, color }, i) => {
          if (i >= minimumParts && symbol === '' && !name) return null;
          return (
            <React.Fragment key={i}>
              {triad && i < 2 ? null : (
                <div className={clsx(className, classes.symbol, color)}>
                  {symbol}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  }
};

const ChordNotes: React.FC<ChordSectionProps> = props => {
  const { rootName, parts, minimumParts, className } = props;

  return (
    <>
      <div className={className}>{rootName}</div>
      {parts.map(({ name, symbol, color }, i) => {
        if (i >= minimumParts && symbol === '' && name === undefined)
          return null;
        return (
          <div key={i} className={clsx(className, color)}>
            {name}
          </div>
        );
      })}
    </>
  );
};

const ChordRoman: React.FC<ChordSectionProps> = props => {
  const { roman, className } = props;
  const classes = useChordStyles();
  return <div className={clsx(classes.roman, className)}>{roman}</div>;
};

export const ChordButtonRaw: React.FC<ChordButtonProps> = props => {
  const {
    send,
    chord,
    top = 'name',
    bottom = 'notes',
    className,
    highlight = false,
    keySignature = Key.major('C'),
    minimumParts = 0,
    buttonProps = {},
    paperProps = {},
  } = props;

  const events = useMemo(() => {
    const click = (): void => {
      send && send({ type: 'CHORD.CLICK', chord });
    };
    const sendPress = (): void => {
      send && send({ type: 'CHORD.PRESS', chord });
    };
    const release = (): void => {
      send && send({ type: 'CHORD.RELEASE', chord });
    };

    return {
      onClick: click,
      onMouseDown: sendPress,
      onMouseUp: release,
      onMouseLeave: release,
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        sendPress();
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        release();
      },
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
      },
    };
  }, [send, chord]);

  const colors = useNoteColors();
  const classes = useChordStyles();

  const root = chord.root;
  const rootName = keySignature.noteName(root);
  const triad = chord.type.triad;
  const triadColor = !triad
    ? undefined
    : chord.type.parts.fifth === 'perfect'
    ? colors[`note-${chord.pitches[1]}`]
    : colors[`note-${chord.pitches[2]}`];
  const roman = keySignature.chordNumeral(chord);
  const parts = chord.type.info.map(({ symbol, semitones }) => {
    const pc = semitones ? transpose(chord.root, semitones) : undefined;
    const name = pc !== undefined ? keySignature.noteName(pc) : undefined;
    const color = colors[`note-${pc !== undefined ? pc : 'none'}`];
    return { symbol, name, color };
  });

  const split = top !== 'roman' && bottom !== 'roman';
  const sectionProps: ChordSectionProps = {
    chord,
    roman,
    triad,
    triadColor,
    minimumParts,
    split,
    rootName,
    parts,
  };

  const topClass =
    bottom === 'none' ? clsx(classes.soloTop, classes.top) : classes.top;
  let topStuff = null;
  if (top === 'name') {
    topStuff = <ChordName {...sectionProps} className={topClass} />;
  } else if (top === 'roman') {
    topStuff = <ChordRoman {...sectionProps} className={topClass} />;
  } else if (top === 'notes') {
    topStuff = <ChordNotes {...sectionProps} className={topClass} />;
  }

  let bottomStuff = null;
  if (bottom === 'name') {
    bottomStuff = <ChordName {...sectionProps} className={classes.bottom} />;
  } else if (bottom === 'roman') {
    bottomStuff = <ChordRoman {...sectionProps} className={classes.bottom} />;
  } else if (bottom === 'notes') {
    bottomStuff = <ChordNotes {...sectionProps} className={classes.bottom} />;
  }

  return (
    <Paper
      elevation={2}
      className={clsx(classes.paper, className)}
      {...paperProps}
    >
      <ButtonBase
        component="div"
        focusRipple
        className={clsx(classes.root, colors[`note-${root}`], {
          [classes.highlighted]: highlight,
        })}
        {...events}
        {...buttonProps}
      >
        {topStuff}
        {bottomStuff}
      </ButtonBase>
    </Paper>
  );
};

export const ChordButton = React.memo(ChordButtonRaw);

export default ChordButton;
