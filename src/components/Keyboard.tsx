import React, { useState } from 'react';
import clsx from 'clsx';
import { ButtonBase, makeStyles } from '@material-ui/core';

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
  Shape,
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

const useKeyStyles = makeStyles({
  expanded: {
    '& $circle': {
      opacity: 0,
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
      opacity: 0.66,
    },
  },
  resonating: {
    '& $circle': {
      opacity: 0.66,
      fill: 'var(--note-color-200)',
    },
  },
  isRoot: {
    '& $hexagon': {
      opacity: 0.5,
    },
    '& $circle': {
      transform: 'scale(0.66)',
      fill: 'var(--note-color-200)',
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
      [classes.resonating]: resonating,
    }),
    hexagon: classes.hexagon,
    hexagonOverlay: classes.hexagonOverlay,
    circle: classes.circle,
    circleOverlay: classes.circleOverlay,
    content: classes.content,
    shapeSvg: classes.shapeSvg,
  };

  return (
    <HexGridItem width="calc(100% - 4px)">
      <Shape classes={shapeClasses}>
        <ButtonBase
          classes={{ root: classes.buttonBase }}
          onClick={props.onClick}
        >
          {pcToName(pitchClass)}
        </ButtonBase>
      </Shape>
    </HexGridItem>
  );
};

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
      const allowed = Object.values(namedIntervals[level - 1])
        .map(info => info?.semitones)
        .find(i => i && transpose(selectedRoot, i) === pitchClass);
      keyProps.selected = !!allowed && selectedChord?.includes(pitchClass);
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
// const ninths = thirdsOf(sevenths);

export type KeyboardProps = {
  selectedRoot?: PitchClass;
  selectedChord?: Chord;
  keySignature?: Key;
  onSelectRoot?: (root: PitchClass) => void;
  onSelectChord?: (chord: Chord) => void;
};

export const Keyboard: React.FC<KeyboardProps> = props => {
  const levels = [roots, thirds, fifths, sevenths /*, ninths */];
  const { selectedChord, onSelectRoot, onSelectChord, keySignature } = props;

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

export const KeyboardController: React.FC = () => {
  const [selectedRoot, setRoot] = useState(pitchClasses[0]);
  const [selectedChord, setChord] = useState(Chord.major(selectedRoot));
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
    <div>
      <Keyboard
        {...{
          selectedRoot,
          selectedChord,
          keySignature,
          onSelectRoot,
          onSelectChord,
        }}
      />
      {/* <div>{selectedChord.name()}</div> */}
    </div>
  );
};

export default Keyboard;
