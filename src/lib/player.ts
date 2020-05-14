import * as Tone from 'tone';
import { Monophonic } from 'tone/build/esm/instrument/Monophonic';

import { ToneTime, ToneSynth, Song, Chord } from '../types';
import { Voicing, voiceShepard, normalizeGroups } from './voicing';

function toGroups(chord: Chord): Voicing[] {
  const v = normalizeGroups(voiceShepard(chord));
  return v;
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

  triggerChordStart(chord: Chord, time?: ToneTime): this {
    this.silenceSynth(this.buttonSynth);

    const timeScale = 0;
    const baseTime = Tone.Time(time);
    const groups = toGroups(chord);
    groups.forEach((voicing, i) => {
      const startTime =
        baseTime.valueOf() + Tone.Time('16n').valueOf() * i * timeScale;
      voicing.forEach(([note, velocity]) => {
        this.buttonSynth.triggerAttack([note.toString()], startTime, velocity);
      });
    });
    return this;
  }

  triggerChordEnd(_chord: Chord, _time?: ToneTime): this {
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
      const voicing = toGroups(chord).flat();
      Tone.Transport.scheduleOnce(time => {
        voicing.forEach(([note, velocity]) => {
          const name = note.toString();
          this.songSynth.triggerAttackRelease([name], '1m', time, velocity);
        });

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
