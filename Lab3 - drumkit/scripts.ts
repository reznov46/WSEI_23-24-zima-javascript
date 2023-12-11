class DrumKit {
	private audioContext: AudioContext;
	private sounds: { [key: string]: AudioBuffer };
	private keyMap: { [key: string]: string };

	constructor(soundsUrls: sound[]) {
		this.audioContext = new AudioContext();
		this.sounds = {};
		this.keyMap = {};

		this.loadSounds(soundsUrls.map((sound) => sound.url));
		soundUrls.forEach((sound) => {
			this.mapKeyToSound(
				sound.key,
				sound.url.substring(
					sound.url.lastIndexOf('/') + 1,
					sound.url.lastIndexOf('.')
				)
			);
		});

		document.addEventListener('keydown', (event) => {
			const key = event.key.toLowerCase();
			drumKit.playSound(key);
		});
	}

	public async loadSounds(soundUrls: string[]): Promise<void> {
		const bufferPromises = soundUrls.map((url) => this.loadSound(url));
		await Promise.all(bufferPromises);
	}

	private async loadSound(url: string): Promise<void> {
		const response = await fetch(url);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
		const key = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
		this.sounds[key] = audioBuffer;
	}

	mapKeyToSound(key: string, soundKey: string): void {
		this.keyMap[key] = soundKey;
	}

	public playSound(key: string, offset: number = 0): void {
		const soundKey = this.keyMap[key];
		if (soundKey) {
			const source = this.audioContext.createBufferSource();
			source.buffer = this.sounds[soundKey];
			source.connect(this.audioContext.destination);
			source.start(this.audioContext.currentTime + offset);
		}
	}
}

type sound = { url: string; key: string };

type Track = { key: string; offsetTime: number };
class TrackRecorder {
	private track: Track[];
	private startTime!: number;
	private drumKit: DrumKit;

	constructor(drumKit: DrumKit) {
		this.track = [];
		this.drumKit = drumKit;
	}

	public record(): void {
		this.track = [];
		this.startTime = new Date().getTime();
		console.log(this.track);
		document.addEventListener('keyup', this.recordSound.bind(this));
	}

	private recordSound(event: KeyboardEvent): void {
		const currentTime = new Date().getTime();
		const offsetTime = currentTime - this.startTime;
		this.track.push({
			key: event.key.toLocaleLowerCase(),
			offsetTime: offsetTime,
		});
	}
	public stopRecording(): void {
		document.removeEventListener('keyup', this.recordSound.bind(this));
	}

	public initTrackGuid(): void {
		const recordButton = document.createElement('button');
		recordButton.innerText = 'Record';
		recordButton.setAttribute('recording', 'false');
		recordButton.addEventListener('click', () => {
			if (recordButton.getAttribute('recording') === 'false') {
				recordButton.setAttribute('recording', 'true');
				recordButton.innerText = 'Stop';
				this.record();
			} else {
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

const soundUrls: sound[] = [
	{ url: './sounds/clap.wav', key: 'q' },
	{ url: './sounds/hihat.wav', key: 'w' },
	{ url: './sounds/kick.wav', key: 'e' },
	{ url: './sounds/openhat.wav', key: 'r' },
	{ url: './sounds/ride.wav', key: 't' },
	{ url: './sounds/snare.wav', key: 'y' },
	{ url: './sounds/tink.wav', key: 'u' },
	{ url: './sounds/tom.wav', key: 'i' },
];

const drumKit = new DrumKit(soundUrls);
const trackRecorder = new TrackRecorder(drumKit);
trackRecorder.initTrackGuid();
const trackRecorder2 = new TrackRecorder(drumKit);
trackRecorder2.initTrackGuid();
