import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';

import { useNoteColors } from '../lib/colors';
import {
  PitchClass,
  Chord,
  Key,
  intervalNames,
  pitchClasses,
  prettyName,
  pcToName,
  transpose,
  identifyInterval,
  MINOR_THIRD,
  MAJOR_THIRD,
  namedIntervals,
} from '../types';
import {
  HexGrid,
  HexGridRow,
  HexGridItem,
  HexGridSpacer,
  Shape,
  hexagonHeight,
} from './HexGrid';

export type NoteKeyProps = {
  pitchClass: PitchClass; // the note this key plays
  label?: string; // what the key says
  root?: boolean; // is this key on the bottom tier
  inKey?: boolean; // is this note in the current key (if any)
  selected?: boolean; // is this note a selected chord part
  resonating?: 'previous' | 'current' | false;
  showAs?: 'ghost' | 'collapsed' | 'expanded';
  onClick?: React.MouseEventHandler;
};

const scaleTime = 0.8;
const translucentTime = scaleTime / 2;
const collapsedSize = 0.4;
const standardDelay = 0;
const standardTransition = [
  `transform ${scaleTime}s ease-out ${standardDelay}s`,
  `opacity ${translucentTime}s ease-out ${standardDelay}s`,
].join(', ');
const fastTransition = [
  `transform ${scaleTime}s ease-out 0s`,
  `opacity ${translucentTime}s ease-out 0s`,
].join(', ');

const useKeyStyles = makeStyles({
  expanded: {
    '& $circle': {
      opacity: 0,
      transform: 'scale(0.66)',
    },
    '& $content': {
      opacity: 1,
    },
    '& $hexagon': {
      opacity: 0.1,
    },
    '&:not($selected):hover $hexagon': {
      opacity: 0.75,
    },
  },
  ghost: {
    '&:not($selected) $hexagon': {
      opacity: 0,
    },
    '&:not($selected):hover $content': {
      opacity: 0.4,
    },
    '&:not($selected):hover $hexagon': {
      opacity: 0.4,
    },
  },
  collapsed: {
    '& $hexagon, & $hexagonOverlay': {
      opacity: 0,
      transform: `scale(${collapsedSize})`,
    },
    '& $content': {
      transform: `scale(0.6)`,
      pointerEvents: 'none',
    },
  },
  selected: {
    '& $content': {
      opacity: 1,
    },
    '& $hexagonOverlay': {
      opacity: 1,
      strokeWidth: '8px',
      stroke: 'var(--note-color-700)', //(props: { color: Color }) => props.color[700],
    },
  },
  inKey: {
    '&$collapsed $circle': {
      // opacity: 0.66,
    },
  },
  resonatingCurrent: {
    '& $circle': {
      opacity: 0.66,
      // transform: `scale(0.6)`,
      fill: 'var(--note-color-200)',
    },
  },
  resonatingPrevious: {
    '& $circle': {
      opacity: 0.33,
      // transform: `scale(0.4)`,
      fill: 'var(--note-color-200)',
    },
  },
  isRoot: {
    '& $hexagon': {
      opacity: 0.5,
      transition: fastTransition,
    },
    '& $hexagonOverlay': {
      transition: fastTransition,
    },
    '& $circle': {
      fill: 'var(--note-color-200)',
      transition: fastTransition,
    },
    '& $circleOverlay': {
      transition: fastTransition,
    },
  },
  shapeSvg: {
    zIndex: 10,
  },
  root: {
    display: 'block',
  },
  hexagon: {
    transition: standardTransition,
    strokeWidth: '4px',
    fill: 'none',
    stroke: 'rgba(0, 0, 0, 1)',
  },
  hexagonOverlay: {
    transition: standardTransition,
    opacity: 0,
    fill: 'var(--note-color-200)', //(props: { color: Color }) => props.color[200],
  },
  circle: {
    fill: '#E0E0E0',
    stroke: 'none',
    opacity: 0,
    transform: `scale(${collapsedSize})`,
    transition: standardTransition,
  },
  circleOverlay: {
    display: 'none',
  },
  content: {
    pointerEvents: 'auto',
    opacity: 0,
    transition: standardTransition,
    zIndex: 100,
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: 'min(3vw, 2em)',
  },
  buttonBase: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexItem: {
    width: 'calc(100% - 4px)',
  },
});

const NoteKey: React.FC<NoteKeyProps> = props => {
  const {
    pitchClass,
    root = false,
    selected = false,
    inKey = true,
    resonating,
    showAs = 'expanded',
    label = prettyName(pcToName(pitchClass)),
  } = props;

  const colors = useNoteColors();
  const classes = useKeyStyles();

  const colorClass = colors[`note-${pitchClass}`];
  const shapeClasses = {
    root: clsx(colorClass, classes.root, {
      [classes.expanded]: showAs === 'expanded',
      [classes.collapsed]: showAs === 'collapsed',
      [classes.ghost]: showAs === 'ghost',
      [classes.selected]: selected,
      [classes.isRoot]: root,
      [classes.inKey]: inKey,
      [classes.resonatingCurrent]: resonating === 'current',
      [classes.resonatingPrevious]: resonating === 'previous',
    }),
    hexagon: classes.hexagon,
    hexagonOverlay: classes.hexagonOverlay,
    circle: classes.circle,
    circleOverlay: classes.circleOverlay,
    content: classes.content,
    shapeSvg: classes.shapeSvg,
  };

  return (
    <HexGridItem className={classes.hexItem}>
      <Shape classes={shapeClasses}>
        <div className={classes.buttonBase} onClick={props.onClick}>
          {label}
        </div>
      </Shape>
    </HexGridItem>
  );
};

export type KeyboardKeyProps = KeyboardProps & {
  pitchClass: PitchClass;
  level: number;
  index: number;
  resonating?: 'previous' | 'current' | false;
  disabled?: boolean;
  onClick?: (pitchClass: PitchClass, level: number, index: number) => void;
};

export const KeyboardKey: React.FC<KeyboardKeyProps> = props => {
  const { selectedChord, selectedRoot, keySignature } = props;
  const { pitchClass, level, index, resonating, disabled, onClick } = props;

  const root = level === 0;
  const inKey = !keySignature || keySignature.includes(pitchClass);

  const keyProps: NoteKeyProps = { pitchClass, root, resonating, inKey };
  if (root) {
    keyProps.selected = pitchClass === selectedRoot;
    keyProps.showAs = inKey ? 'expanded' : 'ghost';
  } else if (selectedRoot !== undefined) {
    const offset = selectedRoot !== undefined ? index - selectedRoot : -1;
    const aboveRoot = 0 <= offset && offset <= level;
    if (!aboveRoot) {
      keyProps.selected = false;
      keyProps.showAs = 'collapsed';
    } else {
      const allowed = Object.values(namedIntervals[level - 1])
        .map(info => info?.semitones)
        .find(i => i && transpose(selectedRoot, i) === pitchClass);
      const selected = !!allowed && selectedChord?.includes(pitchClass);
      keyProps.selected = selected;
      keyProps.showAs = selected
        ? 'expanded'
        : allowed && !disabled
        ? inKey
          ? 'expanded'
          : 'ghost'
        : 'collapsed';
    }
  } else {
    keyProps.selected = false;
    keyProps.showAs = 'collapsed';
  }

  const handleClick = onClick && (() => onClick(pitchClass, level, index));
  return <NoteKey {...keyProps} onClick={handleClick} />;
};

function thirdsOf(pcs: PitchClass[]): PitchClass[] {
  return [
    ...pcs.map(pc => transpose(pc, MINOR_THIRD)),
    transpose(pcs[pcs.length - 1], MAJOR_THIRD),
  ];
}

const roots: PitchClass[] = pitchClasses;
const thirds = thirdsOf(roots);
const fifths = thirdsOf(thirds);
const sevenths = thirdsOf(fifths);
const ninths = thirdsOf(sevenths);
const levels = [roots, thirds, fifths, sevenths, ninths];

const keyboardWidth = levels[levels.length - 1].length;
const useKeyboardStyles = makeStyles({
  root: {
    margin: `${(100 / keyboardWidth) * (hexagonHeight - 1)}% 0`,
    flexDirection: 'column-reverse',
  },
});

export type KeyboardProps = {
  selectedRoot?: PitchClass;
  selectedChord?: Chord;
  keySignature?: Key;
  resonatingChord?: Chord;
  disabled?: boolean;
  onSelectRoot?: (root: PitchClass) => void;
  onSelectChord?: (chord: Chord) => void;
};

function findChordForRoot(
  root: PitchClass,
  keySignature?: Key,
  previousChord?: Chord,
): Chord {
  if (root === previousChord?.root) return previousChord;

  const options = [
    ...(previousChord ? [new Chord(root, previousChord.type)] : []),
    Chord.major(root),
    Chord.minor(root),
    Chord.diminished(root),
    Chord.augmented(root),
  ];
  const bestFit = keySignature
    ? options.find(c =>
        c.pitches.slice(1).every(pc => keySignature.includes(pc)),
      )
    : undefined;
  return bestFit || Chord.major(root);
}

export const Keyboard: React.FC<KeyboardProps> = props => {
  const {
    selectedChord,
    selectedRoot = selectedChord?.root,
    resonatingChord,
    onSelectChord,
    keySignature,
    disabled,
  } = props;

  function keyClick(pc: PitchClass, level: number, index: number): void {
    if (!onSelectChord) return;

    if (level === 0) {
      onSelectChord(findChordForRoot(pc, keySignature, selectedChord));
    } else if (selectedChord) {
      const intervalName = intervalNames[level - 1];
      if (selectedChord.includes(pc)) {
        onSelectChord(selectedChord.altered({ [intervalName]: 'none' }));
      } else {
        const semitones = level * MINOR_THIRD + index - selectedChord.root;
        const quality = identifyInterval(semitones, intervalName);
        if (quality) {
          onSelectChord(
            selectedChord.tertianAltered(
              { [intervalName]: quality },
              keySignature,
            ),
          );
        }
      }
    }
  }

  const classes = useKeyboardStyles();

  const keyProps = { keySignature, selectedChord, selectedRoot, disabled };

  return (
    <HexGrid className={classes.root}>
      {levels.map((pcs, level) => (
        <HexGridRow key={level}>
          <HexGridSpacer count={(levels.length - level - 1) / 2} />
          {pcs.map((pitchClass, index) => {
            const previous = !!resonatingChord?.includes(pitchClass);
            const current = !!selectedChord?.includes(pitchClass);
            return (
              <KeyboardKey
                key={index}
                level={level}
                index={index}
                pitchClass={pitchClass}
                onClick={keyClick}
                resonating={(current && 'current') || (previous && 'previous')}
                {...keyProps}
              />
            );
          })}
          <HexGridSpacer count={(levels.length - level - 1) / 2} />
        </HexGridRow>
      ))}
    </HexGrid>
  );
};

export default Keyboard;
