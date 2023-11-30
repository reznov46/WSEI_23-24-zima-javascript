import { isInterfaceDeclaration } from "typescript";

interface Sound {
	id: number;
	note: number;
	time: EpochTimeStamp;
}
interface Track {
	sounds: Sound[];
}

enum Note {
	q = 1,
	w = 2,
	e = 3,
	r = 4,
	t = 5,
	y = 6,
	u = 7,
	i = 8,
	o = 9,
}
const notesKeys = Object.keys(Note);

function createTracks(amount: number) {
	const container = document.querySelector('.tracks--container');
	for (let i = 0; i < amount; i++) {
		const newTrack = createTrack();
		container?.appendChild(newTrack);
	}
}

const keyPressHandlerFactory = (track: Track, startTime: number) => {
	return (event: KeyboardEvent) => {
		if (notesKeys.includes(event.key)) {
			const newSound = {
				id: track.sounds.length + 1,
				note: Note[event.key as keyof typeof Note],
				time: new Date().getTime() - startTime,
			};
			track.sounds.push(newSound);
		}
	};
};

function createTrack(): any {
	const track: Track = { sounds: [] };

	const trackContainer = document.createElement('div');
	const stopSavingButton = document.createElement('button');
	stopSavingButton.innerText = 'Stop saving';
	const startSavingButton = document.createElement('button');
	startSavingButton.innerText = 'Start saving';

	startSavingButton.addEventListener('click', () => {
		track.sounds = [];
		const startTime = new Date().getTime();
		const keyPressHandler = keyPressHandlerFactory(track, startTime);
		document.addEventListener('keypress', keyPressHandler);
		stopSavingButton.addEventListener('click', () => {
			document.removeEventListener('keypress', keyPressHandler);
		});
	});

	const playButton = document.createElement('button');

	playButton.innerText = 'Play';
	playButton.addEventListener('click', () => {
		console.log(track.sounds);
	});
	const resetButton = document.createElement('button');
	resetButton.innerText = 'Reset';

	trackContainer.appendChild(startSavingButton);
	trackContainer.appendChild(stopSavingButton);
	trackContainer.appendChild(playButton);
	return trackContainer;
}

const createBpm = () => {
    const bmpSwitch = document.querySelector('#bpm-switch')!;
    const bmpAudio = document.querySelector("#met")
    bmpSwitch.innerHTML = "On";
    bmpSwitch.addEventListener('click', () => {
        if (bmpSwitch.innerHTML == "On") {
            bmpSwitch.innerHTML = "Off";

        } else {
            bmpSwitch.innerHTML = "On";
        }
    }

}

const init = () => {
    createTracks(2);    
}

init();