type Sound = { url: string; key: string };
type Track = { key: string; offsetTime: number };
class Player {
	private audioContext: AudioContext;
	private sounds: { [key: string]: AudioBuffer };

	constructor(soundsUrls: Sound[]) {
		this.audioContext = new AudioContext();
		this.sounds = {};

		this.loadSounds(soundsUrls.map((sound) => sound.url));
	}

	private async loadSounds(soundUrls: string[]): Promise<void> {
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

	protected playSound(soundName: string, offset: number = 0): void {
		if (Object.keys(this.sounds).includes(soundName)) {
			this.audioContext.resume();
			const source = this.audioContext.createBufferSource();
			source.buffer = this.sounds[soundName];
			source.connect(this.audioContext.destination);
			source.start(this.audioContext.currentTime + offset);
		}
	}
	public stop(): void {
		this.audioContext.suspend();
	}

	public restart(): void {
		this.audioContext.close();
	}
}

class DrumKit extends Player {
	private keyMap: { [key: string]: string } = {};

	constructor(sounds: Sound[]) {
		super(sounds);

		sounds.forEach((sound) => {
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
			this.playSound(this.keyMap[key]);
		});
	}

	private mapKeyToSound(key: string, soundKey: string): void {
		this.keyMap[key] = soundKey;
	}

	public playRecordedSound(key: string, offset: number) {
		this.playSound(this.keyMap[key], offset);
	}
}

class TrackRecorder {
	private track: Track[];
	private startTime!: number;
	private drumKit: DrumKit;
	private drumKitContainer!: HTMLDivElement;
	private playButton!: HTMLButtonElement;
	private recordButton!: HTMLButtonElement;
	private removeTrackButton!: HTMLButtonElement;

	constructor(soundUrl: Sound[]) {
		this.track = [];
		this.drumKit = new DrumKit(soundUrl);
		this.initTrackGui();
	}

	public record(): void {
		this.track = [];
		this.startTime = new Date().getTime();
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

	public initTrackGui(): void {
		this.recordButton = this.createButton(
			'Record',
			this.recordHandler,
			'recording'
		);
		this.playButton = this.createButton('Play', this.playHandler, 'playing');
		this.drumKitContainer = document.createElement('div');
		this.drumKitContainer.classList.add('track');

		this.removeTrackButton = this.createButton(
			'Remove track',
			this.removeHandler
		);
		this.drumKitContainer.appendChild(this.recordButton);
		this.drumKitContainer.appendChild(this.playButton);
		this.drumKitContainer.appendChild(this.removeTrackButton);
		document.body.appendChild(this.drumKitContainer);
	}
	public deleteTrack(): void {
		this.drumKit.stop();
		this.drumKitContainer.remove();
	}

	private createButton(
		buttonText: string,
		handler: Function,
		attributeName?: string
	) {
		const button = document.createElement('button');
		button.innerText = buttonText;
		if (attributeName) {
			button.setAttribute(attributeName, 'false');
		}
		button.addEventListener('click', handler.bind(this));
		return button;
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

		if (target.getAttribute('playing') === 'false') {
			target.setAttribute('playing', 'true');
			target.innerText = 'Stop';
			this.track.forEach((sound) => {
				this.drumKit.playRecordedSound(sound.key, sound.offsetTime / 1000);
			});
		} else {
			target.setAttribute('playing', 'false');
			target.innerText = 'Play';
			this.drumKit.stop();
		}
	}

	private removeHandler({ target }: MouseEvent): void {
		if (!(target instanceof HTMLButtonElement)) {
			return;
		}
		this.drumKit.stop();
		this.deleteTrack();
	}
}

const soundUrls: Sound[] = [
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
