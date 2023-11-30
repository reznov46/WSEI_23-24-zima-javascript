"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Note;
(function (Note) {
    Note[Note["q"] = 1] = "q";
    Note[Note["w"] = 2] = "w";
    Note[Note["e"] = 3] = "e";
    Note[Note["r"] = 4] = "r";
    Note[Note["t"] = 5] = "t";
    Note[Note["y"] = 6] = "y";
    Note[Note["u"] = 7] = "u";
    Note[Note["i"] = 8] = "i";
    Note[Note["o"] = 9] = "o";
})(Note || (Note = {}));
const notesKeys = Object.keys(Note);
function createTracks(amount) {
    const container = document.querySelector('.tracks--container');
    for (let i = 0; i < amount; i++) {
        const newTrack = createTrack();
        container === null || container === void 0 ? void 0 : container.appendChild(newTrack);
    }
}
const keyPressHandlerFactory = (track, startTime) => {
    return (event) => {
        if (notesKeys.includes(event.key)) {
            const newSound = {
                id: track.sounds.length + 1,
                note: Note[event.key],
                time: new Date().getTime() - startTime,
            };
            track.sounds.push(newSound);
        }
    };
};
function createTrack() {
    const track = { sounds: [] };
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
    const bmpSwitch = document.querySelector('#bpm-switch');
    const bmpAudio = document.querySelector("#met");
    bmpSwitch.innerHTML = "On";
    bmpSwitch.addEventListener('click', () => {
        if (bmpSwitch.innerHTML == "On") {
            bmpSwitch.innerHTML = "Off";
        }
        else {
            bmpSwitch.innerHTML = "On";
        }
    });
};
const init = () => {
    createTracks(2);
};
init();
