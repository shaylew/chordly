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
  public song?: Song;

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

  setSong(song: Song): void {
    this.song = song;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = song.bpm || 120;
    Tone.Transport.position = 0;
    song.measures.forEach((measure, i) => {
      const chord = measure.chord;
      this.songSynth.triggerAttackRelease(toNotes(chord), '1m', `${i}m`);
    });
  }

  startSong(onFinish?: () => void): void {
    if (!this.song) {
      return;
    }

    if (onFinish) {
      const songEnd = `${this.song.measures.length + 1}m`;
      Tone.Transport.scheduleOnce(onFinish, songEnd);
    }

    Tone.Transport.start();
  }

  stopSong(): void {
    this.songSynth.releaseAll();
    Tone.Transport.stop();
  }

  setLoop(loop: boolean): void {
    if (!this.song) {
      return;
    }

    if (loop) {
      const songEnd = `${this.song.measures.length}:0:1`;
      Tone.Transport.setLoopPoints(0, songEnd);
    }

    Tone.Transport.loop = loop;
  }

  dispose(): void {
    this.songSynth.dispose();
    this.buttonSynth.dispose();
  }
}
