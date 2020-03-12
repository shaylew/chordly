import React from 'react';
import * as Tone from 'tone';

import { Note, Chord, namesSharp, octave } from '../lib/music';

export function boop(synth: Tone.PolySynth, harmony: Note[]): void {
  synth.triggerAttackRelease(harmony, '4n');
}

function useSynth(): Tone.PolySynth {
  return new Tone.PolySynth(Tone.Synth).toDestination();
}

type BoopButtonProps = {
  synth: Tone.PolySynth;
  note: Note;
  chord: Chord;
};

const BoopButton: React.FC<BoopButtonProps> = props => {
  const { chord, note, synth } = props;
  const harmony = chord.on(note);
  return (
    <button onClick={(): void => boop(synth, harmony)}>
      {note} {chord.name}
    </button>
  );
};

const Boop: React.FC<{}> = () => {
  const synth = useSynth();
  const flavors = [Chord.major, Chord.minor];
  const notes = namesSharp.map(pc => octave(pc, 5));
  return (
    <div>
      {flavors.map(chord => (
        <div key={chord.name}>
          {notes.map(note => (
            <BoopButton key={note} {...{ chord, note, synth }} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Boop;
