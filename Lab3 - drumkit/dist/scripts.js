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
class Player {
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
            this.audioContext.resume();
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundKey];
            source.connect(this.audioContext.destination);
            source.start(this.audioContext.currentTime + offset);
        }
    }
    stop() {
        this.audioContext.suspend();
    }
}
class TrackRecorder {
    constructor(soundUrl) {
        this.track = [];
        this.drumKit = new Player(soundUrl);
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
        recordButton.addEventListener('click', this.recordHandler.bind(this));
        const playButton = document.createElement('button');
        playButton.innerText = 'Play';
        recordButton.setAttribute('playing', 'false');
        playButton.addEventListener('click', this.playHandler.bind(this));
        const resetButton = document.createElement('button');
        resetButton.innerText = 'Reset';
        resetButton.addEventListener('click', this.reset.bind(this));
        document.body.appendChild(recordButton);
        document.body.appendChild(playButton);
    }
    recordHandler({ target }) {
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }
        if (target.getAttribute('recording') === 'false') {
            target.setAttribute('recording', 'true');
            target.innerText = 'Stop';
            this.record();
        }
        else {
            target.setAttribute('recording', 'false');
            target.innerText = 'Record';
            this.stopRecording();
        }
    }
    playHandler({ target }) {
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }
        console.log(target.getAttribute('playing'));
        if (target.getAttribute('playing') === 'false') {
            target.setAttribute('playing', 'true');
            target.innerText = 'Stop';
            this.track.forEach((sound) => {
                this.drumKit.playSound(sound.key, sound.offsetTime / 1000);
            });
        }
        else {
            target.setAttribute('playing', 'false');
            target.innerText = 'Play';
            this.drumKit.stop();
        }
    }
    reset() {
        this.drumKit.stop();
        this.track = [];
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
const drumKit = new Player(soundUrls);
const trackRecorder = new TrackRecorder(soundUrls);
trackRecorder.initTrackGuid();
const trackRecorder2 = new TrackRecorder(soundUrls);
trackRecorder2.initTrackGuid();
