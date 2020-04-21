import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Theme,
  Button,
  Color,
  ButtonBase,
  makeStyles,
  withStyles,
  createStyles,
  WithStyles,
} from '@material-ui/core';

import { useNoteColors } from '../lib/colors';
import {
  PitchClass,
  Chord,
  Key,
  intervalNames,
  pitchClasses,
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
  Hexagon,
  Circle,
  ShapeClasses,
} from './HexGrid';

export type NoteKeyProps = {
  pitchClass: PitchClass; // the note this key plays
  root?: boolean; // is this key on the bottom tier
  inKey?: boolean; // is this note in the current key (if any)
  selected?: boolean; // is this note a selected chord part
  resonating?: boolean; // is this note the same pitch class as a chord part
  showAs?: 'ghost' | 'collapsed' | 'expanded';
  onClick?: React.MouseEventHandler;
};

const scaleTime = 0.5;
const translucentTime = scaleTime / 2;
const collapsedSize = 0.4;
const standardTransition = `transform ${scaleTime}s ease-out, opacity ${translucentTime}s ease-out`;

const useDotStyles = makeStyles({
  expanded: {},
  ghost: {},
  collapsed: {
    '&$root': {
      opacity: 1,
    },
  },
  resonating: {},
  isRoot: {},
  inKey: {},
  root: {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    opacity: 0,
    transform: `scale(${collapsedSize})`,
    transition: standardTransition,
  },
  shape: {
    fill: 'none',
    stroke: 'none',
    '$inKey &': {
      fill: '#E0E0E0',
    },
    '$resonating &': {
      fill: 'var(--note-color-100)',
    },
  },
  hover: {
    display: 'none',
  },
});

const useHexStyles = makeStyles({
  expanded: {},
  ghost: {
    '&:not($selected) $shapeSvg': {
      opacity: 0.5,
    },
    '&:not($selected):hover $content': {
      opacity: 0.5,
    },
  },
  collapsed: {
    '& $shapeSvg': {
      opacity: 0,
      transform: `scale(${collapsedSize})`,
    },
    '& $content': {
      transform: `scale(0.6)`,
      pointerEvents: 'none',
    },
  },
  inKey: {
    '& $content': {
      opacity: 1,
    },
    '& $shape': {
      fill: '#E8E8E8',
    },
  },
  selected: {
    '& $content': {
      opacity: 1,
    },
    '& $hover': {
      opacity: 1,
      strokeWidth: '8px',
      fill: 'var(--note-color-200)', //(props: { color: Color }) => props.color[200],
      stroke: 'var(--note-color-700)', //(props: { color: Color }) => props.color[700],
    },
  },
  resonating: {
    '& $content': {
      opacity: 1,
    },
    '&:not($selected) $shape': {
      fill: 'var(--note-color-100)', //(props: { color: Color }) => props.color[100],
    },
  },
  isRoot: {
    '&::after': {
      content: '""',
      display: 'block',
      width: '100%',
      position: 'absolute',
      top: 'calc(100% + 3px)',
      opacity: 0,
      transition: standardTransition,
      borderTop: `solid var(--note-color-700) 12px`, //(props: { color: Color }) => `solid ${props.color[700]} 12px`,
    },
    '&$selected::after': {
      opacity: 1,
    },
  },
  shapeSvg: {
    transformOrigin: 'center',
    transition: standardTransition,
    zIndex: 10,
  },
  root: {
    display: 'block',
  },
  shape: {
    strokeWidth: '4px',
    fill: 'none',
    stroke: 'rgba(0, 0, 0, 0.25)',
  },
  hover: {
    transition: standardTransition,
    opacity: 0,
    '$root:not($collapsed):hover &': {
      opacity: 1,
    },
    '$root:not($selected) &': {
      strokeWidth: '4px',
      stroke: '#888',
    },
  },
  content: {
    pointerEvents: 'auto',
    opacity: 0,
    transition: standardTransition,
    zIndex: 100,
  },
  buttonBase: {
    height: '100%',
    width: '100%',
    display: 'block',
    fontSize: 'min(3vw, 2em)',
  },
});

const NoteKey: React.FC<NoteKeyProps> = props => {
  const {
    pitchClass,
    root = false,
    selected = false,
    inKey = true,
    resonating = false,
    showAs = 'expanded',
  } = props;

  const colors = useNoteColors();
  const dot = useDotStyles();
  const hex = useHexStyles();

  const colorClass = colors[`note-${pitchClass}`];
  const dotClasses = {
    root: clsx(colorClass, dot.root, {
      [dot.root]: true,
      [dot.collapsed]: showAs === 'collapsed',
      [dot.expanded]: showAs === 'expanded',
      [dot.ghost]: showAs === 'ghost',
      [dot.inKey]: inKey,
      [dot.resonating]: resonating,
    }),
    shape: dot.shape,
    hover: dot.hover,
  };
  const hexClasses = {
    root: clsx(colorClass, hex.root, {
      [hex.expanded]: showAs === 'expanded',
      [hex.collapsed]: showAs === 'collapsed',
      [hex.ghost]: showAs === 'ghost',
      [hex.selected]: selected,
      [hex.isRoot]: root,
      [hex.inKey]: inKey,
      [hex.resonating]: resonating,
    }),
    shape: hex.shape,
    hover: hex.hover,
    content: hex.content,
    shapeSvg: hex.shapeSvg,
  };

  return (
    <HexGridItem width="calc(100% - 4px)">
      <Circle classes={dotClasses} />
      <Hexagon classes={hexClasses}>
        <ButtonBase classes={{ root: hex.buttonBase }} onClick={props.onClick}>
          {pcToName(pitchClass)}
        </ButtonBase>
      </Hexagon>
    </HexGridItem>
  );
};

// export const NoteKey = withStyles(keyStyles)(NoteKeyRaw);

export type KeyboardKeyProps = KeyboardProps & {
  pitchClass: PitchClass;
  level: number;
  index: number;
  onClick?: (pitchClass: PitchClass, level: number, index: number) => void;
};

export const KeyboardKey: React.FC<KeyboardKeyProps> = props => {
  const { selectedChord, selectedRoot, keySignature } = props;
  const { pitchClass, level, index, onClick } = props;

  const root = level === 0;
  const inKey = !keySignature || keySignature.includes(pitchClass);
  const resonating = !!selectedChord?.includes(pitchClass);

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
      const levelName = intervalNames[level - 1];
      const allowed = Object.values(namedIntervals[levelName])
        .map(info => info?.semitones)
        .find(i => i && transpose(selectedRoot, i) === pitchClass);
      keyProps.selected = selectedChord?.includes(pitchClass);
      keyProps.showAs = !allowed ? 'collapsed' : inKey ? 'expanded' : 'ghost';
    }
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

export type KeyboardProps = {
  selectedRoot?: PitchClass;
  selectedChord?: Chord;
  keySignature?: Key;
  onSelectRoot?: (root: PitchClass) => void;
  onSelectChord?: (chord: Chord) => void;
};

export const Keyboard: React.FC<KeyboardProps> = props => {
  const levels = [roots, thirds, fifths, sevenths, ninths];
  const { selectedChord, onSelectRoot, onSelectChord } = props;

  function keyClick(pc: PitchClass, level: number, index: number): void {
    if (level === 0) {
      onSelectRoot && onSelectRoot(pc);
    } else {
      if (onSelectChord === undefined || selectedChord === undefined) return;

      const intervalName = intervalNames[level - 1];
      if (selectedChord.includes(pc)) {
        onSelectChord(selectedChord.altered({ [intervalName]: 'none' }));
      } else {
        const semitones = level * MINOR_THIRD + index - selectedChord.root;
        const quality = identifyInterval(semitones, intervalName);
        if (quality) {
          onSelectChord(selectedChord.altered({ [intervalName]: quality }));
        }
      }
    }
  }

  return (
    <HexGrid style={{ flexDirection: 'column-reverse' }}>
      {levels.map((pcs, level) => (
        <HexGridRow key={level}>
          <HexGridSpacer count={(levels.length - level - 1) / 2} />
          {pcs.map((pitchClass, index) => {
            const keyProps = { ...props, pitchClass, level, index };
            return <KeyboardKey key={index} onClick={keyClick} {...keyProps} />;
          })}
          <HexGridSpacer count={(levels.length - level - 1) / 2} />
        </HexGridRow>
      ))}
    </HexGrid>
  );
};

export const KeyboardController: React.FC = props => {
  const [selectedRoot, setRoot] = useState(pitchClasses[0]);
  const [selectedChord, setChord] = useState(Chord.major('C'));
  const keySignature = Key.major('C');

  function onSelectRoot(root: PitchClass): void {
    if (root === selectedRoot) return;

    const chord = [
      Chord.major(root),
      Chord.minor(root),
      Chord.diminished(root),
      Chord.augmented(root),
    ].find(c => c.pitches.slice(1).every(pc => keySignature.includes(pc)));
    setRoot(root);
    setChord(chord || Chord.major(root));
  }

  function onSelectChord(chord: Chord): void {
    setRoot(chord.root);
    setChord(chord);
  }

  return (
    <Keyboard
      {...{
        selectedRoot,
        selectedChord,
        keySignature,
        onSelectRoot,
        onSelectChord,
      }}
    />
  );
};

export default Keyboard;
