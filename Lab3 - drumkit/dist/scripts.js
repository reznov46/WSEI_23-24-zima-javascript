"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class DrumKit {
    constructor(soundsUrls) {
        this.audioContext = new AudioContext();
        this.sounds = {};
        this.keyMap = {};
        this.loadSounds(soundsUrls.map((sound) => sound.url));
        soundUrls.forEach((sound) => {
            this.mapKeyToSound(sound.key, sound.url.substring(sound.url.lastIndexOf('/') + 1, sound.url.lastIndexOf('.')));
        });
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            drumKit.playSound(key);
        });
    }
    loadSounds(soundUrls) {
        return __awaiter(this, void 0, void 0, function* () {
            const bufferPromises = soundUrls.map((url) => this.loadSound(url));
            yield Promise.all(bufferPromises);
        });
    }
    loadSound(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            const arrayBuffer = yield response.arrayBuffer();
            const audioBuffer = yield this.audioContext.decodeAudioData(arrayBuffer);
            const key = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
            this.sounds[key] = audioBuffer;
        });
    }
    mapKeyToSound(key, soundKey) {
        this.keyMap[key] = soundKey;
    }
    playSound(key, offset = 0) {
        const soundKey = this.keyMap[key];
        if (soundKey) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundKey];
            source.connect(this.audioContext.destination);
            source.start(this.audioContext.currentTime + offset);
        }
    }
}
const soundUrls = [
    { url: './sounds/clap.wav', key: 'q' },
    { url: './sounds/hihat.wav', key: 'w' },
    { url: './sounds/kick.wav', key: 'e' },
    { url: './sounds/openhat.wav', key: 'r' },
    { url: './sounds/ride.wav', key: 't' },
    { url: './sounds/snare.wav', key: 'y' },
    { url: './sounds/tink.wav', key: 'u' },
    { url: './sounds/tom.wav', key: 'i' },
];
class TrackRecorder {
    constructor(drumKit) {
        this.track = [];
        this.drumKit = drumKit;
    }
    record() {
        this.track = [];
        this.startTime = new Date().getTime();
        console.log(this.track);
        document.addEventListener('keyup', this.recordSound.bind(this));
    }
    recordSound(event) {
        const currentTime = new Date().getTime();
        const offsetTime = currentTime - this.startTime;
        this.track.push({
            key: event.key.toLocaleLowerCase(),
            offsetTime: offsetTime,
        });
    }
    stopRecording() {
        document.removeEventListener('keyup', this.recordSound.bind(this));
    }
    initTrackGuid() {
        const recordButton = document.createElement('button');
        recordButton.innerText = 'Record';
        recordButton.setAttribute('recording', 'false');
        recordButton.addEventListener('click', () => {
            if (recordButton.getAttribute('recording') === 'false') {
                recordButton.setAttribute('recording', 'true');
                recordButton.innerText = 'Stop';
                this.record();
            }
            else {
                recordButton.setAttribute('recording', 'false');
                recordButton.innerText = 'Record';
                this.stopRecording();
            }
        });
        document.body.appendChild(recordButton);
        const playButton = document.createElement('button');
        playButton.innerText = 'Play';
        playButton.addEventListener('click', () => {
            this.track.forEach((sound) => {
                this.drumKit.playSound(sound.key, sound.offsetTime / 1000);
            });
        });
        document.body.appendChild(playButton);
    }
}
const drumKit = new DrumKit(soundUrls);
const trackRecorder = new TrackRecorder(drumKit);
trackRecorder.initTrackGuid();
const trackRecorder2 = new TrackRecorder(drumKit);
trackRecorder2.initTrackGuid();
