import * as Tone from 'tone';

import { ToneTime, ToneSynth, Song, Chord } from '../types';

function toNotes(chord: Chord): Array<string> {
  return chord.notes.map(n => n.toString());
}

function mkSynth(voices: number): ToneSynth {
  return new Tone.PolySynth({
    maxPolyphony: voices,
    voice: Tone.Synth,
    options: {},
  }).toDestination();
}

export class Player {
  public songSynth: ToneSynth;
  public buttonSynth: ToneSynth;
  public song?: Song;

  constructor() {
    this.songSynth = mkSynth(16).sync();
    this.buttonSynth = mkSynth(16);
  }

  triggerChord(
    chord: Chord,
    duration: ToneTime,
    time?: ToneTime,
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

  triggerChordStart(chord: Chord, time?: ToneTime, velocity?: number): this {
    this.buttonSynth.triggerAttack(toNotes(chord), time, velocity);
    return this;
  }

  triggerChordEnd(chord: Chord, time?: ToneTime): this {
    this.buttonSynth.triggerRelease(toNotes(chord), time);
    return this;
  }

  setSong(song: Song): void {
    this.song = song;
  }

  startSong(onFinish?: () => void): void {
    if (!this.song) {
      return;
    }

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = this.song.bpm || 120;
    Tone.Transport.position = 0;
    this.songSynth.releaseAll();

    this.song.measures.forEach((measure, i) => {
      const chord = measure.chord;
      this.songSynth.triggerAttackRelease(toNotes(chord), '1m', `${i}m`);
    });

    const songEnd = `${this.song.measures.length + 1}m`;
    Tone.Transport.scheduleOnce(() => {
      this.songSynth.releaseAll();
      onFinish && onFinish();
    }, songEnd);

    Tone.Transport.start();
  }

  stopSong(): void {
    this.songSynth.releaseAll();
    // avoid a race condition where the synth doesn't release because
    // the transport is already stopped. poorly.
    setTimeout(() => {
      Tone.Transport.cancel();
      Tone.Transport.stop();
    }, 100);
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
