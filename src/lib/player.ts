import * as Tone from 'tone';

import { ToneTime, ToneSynth, Song, Chord } from '../types';
import { Monophonic } from 'tone/build/esm/instrument/Monophonic';

function toNotes(chord: Chord): Array<string> {
  return [...chord.notes.map(n => n.toString())];
}

function mkSynth(): ToneSynth {
  return new Tone.PolySynth({
    voice: Tone.Synth,
    options: {},
  }).toDestination();
}

export class Player {
  public songSynth: ToneSynth;
  public buttonSynth: ToneSynth;
  public song?: Song;

  constructor() {
    this.songSynth = mkSynth();
    this.buttonSynth = mkSynth();
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
    this.silenceSynth(this.buttonSynth);
    const baseTime = Tone.Time(time);
    toNotes(chord).forEach((note, i) => {
      const startTime = baseTime.valueOf() + Tone.Time('16n').valueOf() * i;
      this.buttonSynth.triggerAttack([note], startTime, velocity);
    });
    return this;
  }

  triggerChordEnd(chord: Chord, time?: ToneTime): this {
    this.silenceSynth(this.buttonSynth);
    return this;
  }

  playSong(
    song: Song,
    options?: {
      onMeasure?: (index: number) => void;
      onFinish?: () => void;
    },
  ): void {
    const { onMeasure, onFinish } = options || {};

    Tone.Transport.cancel(0);
    Tone.Transport.bpm.value = 240;

    song.measures.forEach(({ chord }, i) => {
      const notes = toNotes(chord);
      Tone.Transport.scheduleOnce(time => {
        this.songSynth.triggerAttackRelease(notes, '1m', time);
        if (onMeasure) onMeasure(i);
      }, `${i}m`);
    });

    const endTime = `${song.measures.length}m`;
    Tone.Transport.scheduleOnce(() => {
      this.stopSong();
      if (onFinish) {
        onFinish();
      }
    }, endTime);

    Tone.Transport.start();
  }

  silenceSynth(synth: ToneSynth): void {
    // Workaround for a tone.js bug -- .releaseAll doesn't cut it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (synth as any)._voices.forEach((v: Monophonic<any>) => {
      v.triggerRelease();
    });
  }

  stopSong(): void {
    this.silenceSynth(this.songSynth);
    Tone.Transport.stop();
  }

  dispose(): void {
    this.songSynth?.dispose();
    this.buttonSynth.dispose();
  }
}

export default Player;
