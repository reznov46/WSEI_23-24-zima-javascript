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
        this.loadSounds(soundsUrls.map((sound) => sound.url));
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
    playSound(soundName, offset = 0) {
        if (Object.keys(this.sounds).includes(soundName)) {
            this.audioContext.resume();
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundName];
            source.connect(this.audioContext.destination);
            source.start(this.audioContext.currentTime + offset);
        }
    }
    stop() {
        this.audioContext.suspend();
    }
    restart() {
        this.audioContext.close();
    }
}
class DrumKit extends Player {
    constructor(sounds) {
        super(sounds);
        this.keyMap = {};
        sounds.forEach((sound) => {
            this.mapKeyToSound(sound.key, sound.url.substring(sound.url.lastIndexOf('/') + 1, sound.url.lastIndexOf('.')));
        });
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            this.playSound(this.keyMap[key]);
        });
    }
    mapKeyToSound(key, soundKey) {
        this.keyMap[key] = soundKey;
    }
    playRecordedSound(key, offset) {
        this.playSound(this.keyMap[key], offset);
    }
}
class TrackRecorder {
    constructor(soundUrl) {
        this.track = [];
        this.drumKit = new DrumKit(soundUrl);
        this.initTrackGui();
    }
    record() {
        this.track = [];
        this.startTime = new Date().getTime();
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
    initTrackGui() {
        this.recordButton = this.createButton('Record', this.recordHandler, 'recording');
        this.playButton = this.createButton('Play', this.playHandler, 'playing');
        this.drumKitContainer = document.createElement('div');
        this.drumKitContainer.classList.add('track');
        this.removeTrackButton = this.createButton('Remove track', this.removeHandler);
        this.drumKitContainer.appendChild(this.recordButton);
        this.drumKitContainer.appendChild(this.playButton);
        this.drumKitContainer.appendChild(this.removeTrackButton);
        document.body.appendChild(this.drumKitContainer);
    }
    deleteTrack() {
        this.drumKit.stop();
        this.drumKitContainer.remove();
    }
    createButton(buttonText, handler, attributeName) {
        const button = document.createElement('button');
        button.innerText = buttonText;
        if (attributeName) {
            button.setAttribute(attributeName, 'false');
        }
        button.addEventListener('click', handler.bind(this));
        return button;
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
        if (target.getAttribute('playing') === 'false') {
            target.setAttribute('playing', 'true');
            target.innerText = 'Stop';
            this.track.forEach((sound) => {
                this.drumKit.playRecordedSound(sound.key, sound.offsetTime / 1000);
            });
        }
        else {
            target.setAttribute('playing', 'false');
            target.innerText = 'Play';
            this.drumKit.stop();
        }
    }
    removeHandler({ target }) {
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }
        this.drumKit.stop();
        this.deleteTrack();
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
const init = () => {
    const addNewTrackButton = document.createElement('button');
    addNewTrackButton.innerText = 'Add new track';
    addNewTrackButton.addEventListener('click', () => {
        new TrackRecorder(soundUrls);
    });
    document.body.appendChild(addNewTrackButton);
    for (let i = 0; i < 4; i++) {
        new TrackRecorder(soundUrls);
    }
};
init();
