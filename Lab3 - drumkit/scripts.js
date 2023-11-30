"use strict";
function createTracks(amount) {
    const container = document.querySelector(".tracks--container");
    for (let i = 0; i < amount; i++) {
        const newTrack = createTrack();
        container.appendChild(newTrack);
    }
}
function createTrack() {
}
createTracks(1);
