class Player {
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

	private mapKeyToSound(key: string, soundKey: string): void {
		this.keyMap[key] = soundKey;
	}

	public playSound(key: string, offset: number = 0): void {
		const soundKey = this.keyMap[key];
		if (soundKey) {
			this.audioContext.resume();
			const source = this.audioContext.createBufferSource();
			source.buffer = this.sounds[soundKey];
			source.connect(this.audioContext.destination);
			source.start(this.audioContext.currentTime + offset);
		}
	}
	public stop(): void {
		this.audioContext.suspend();
	}
}

type sound = { url: string; key: string };

type Track = { key: string; offsetTime: number };

class TrackRecorder {
	private track: Track[];
	private startTime!: number;
	private drumKit: Player;

	private playButton!: HTMLButtonElement;
	private recordButton!: HTMLButtonElement;
	private resetButton!: HTMLButtonElement;

	constructor(soundUrl: sound[]) {
		this.track = [];
		this.drumKit = new Player(soundUrl);
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
	private recordHandler({ target }: MouseEvent): void {
		if (!(target instanceof HTMLButtonElement)) {
			return;
		}
		if (target.getAttribute('recording') === 'false') {
			target.setAttribute('recording', 'true');
			target.innerText = 'Stop';
			this.record();
		} else {
			target.setAttribute('recording', 'false');
			target.innerText = 'Record';
			this.stopRecording();
		}
	}

	private playHandler({ target }: MouseEvent): void {
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
		} else {
			target.setAttribute('playing', 'false');
			target.innerText = 'Play';
			this.drumKit.stop();
		}
	}

	private reset(): void {
		this.drumKit.stop();
		this.track = [];
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

const drumKit = new Player(soundUrls);
const trackRecorder = new TrackRecorder(soundUrls);
trackRecorder.initTrackGuid();
const trackRecorder2 = new TrackRecorder(soundUrls);
trackRecorder2.initTrackGuid();
