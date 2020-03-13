import React from 'react';

import { PitchClass } from '../lib/types';
import { chromaticColor as noteColor } from '../lib/colors';

export type ChordButtonProps = {
  label: string;
  root: PitchClass;
  onClick?: () => void;
};

export const ChordButton: React.FC<ChordButtonProps> = props => {
  const { label, root, onClick } = props;
  const color = noteColor(root);

  return (
    <button onClick={onClick}>
      {label}
      <style jsx>{`
        button {
          color: black;
          background-color: ${color};
        }
      `}</style>
      <style jsx>{`
        button {
          flex-grow: 1;
          padding: 1em;
          margin: 0.25em;
          border-radius: 0.5em;
          text-decoration: none;
          border: none;
          font-weight: bold;
        }
      `}</style>
    </button>
  );
};
