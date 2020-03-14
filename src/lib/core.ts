import * as Tone from 'tone';

import { Time, Synth, Song, Chord, toNotes } from '../types';

function mkSynth(voices: number): Synth {
  return new Tone.PolySynth({
    maxPolyphony: voices,
    voice: Tone.Synth,
    options: {},
  }).toDestination();
}

export class Player {
  public songSynth: Synth;
  public buttonSynth: Synth;

  constructor() {
    this.songSynth = mkSynth(8).sync();
    this.buttonSynth = mkSynth(16);
  }

  triggerChord(
    chord: Chord,
    duration: Time,
    time?: Time,
    velocity?: number,
  ): this {
    this.buttonSynth.triggerAttackRelease(
      toNotes(chord),
      duration,
      time,
      velocity,
    );
    return this;
  }

  triggerChordStart(chord: Chord, time?: Time, velocity?: number): this {
    this.buttonSynth.triggerAttack(toNotes(chord), time, velocity);
    return this;
  }

  triggerChordEnd(chord: Chord, time?: Time): this {
    this.buttonSynth.triggerRelease(toNotes(chord), time);
    return this;
  }

  scheduleSong(song: Song): void {
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = song.bpm || 120;
    Tone.Transport.position = 0;
    song.measures.forEach((measure, i) => {
      const chord = measure.chord;
      this.songSynth.triggerAttackRelease(toNotes(chord), '1m', `${i}m`);
    });
  }

  dispose(): void {
    this.songSynth.dispose();
    this.buttonSynth.dispose();
  }
}
