import { getFormatedTime } from "./utils.js";

class Model {
  constructor() {
    this.tracks = [
      {
        author: "Lesfm",
        url: "./tracks/forest-lullaby-110624.mp3",
        title: "Forest Lullaby",
      },
      {
        author: "Cosmo Sheldrake",
        url: "tracks/lost-in-city-lights-145038.mp3",
        title: "Lost in the City Lights",
      },
    ];

    this.currentTrackIndex = 0;
  }

  bindTrackChanged = (callback) => {
    this.onTrackChanged = callback;
  };

  init() {
    this.currentTrack = this.tracks[this.currentTrackIndex];
    this.timer = getFormatedTime(0);
    this.onTrackChanged();
  }

  setCurrentTrack(index) {
    this.currentTrack = this.tracks[index];
  }

  nextTrack() {
    this.currentTrackIndex =
      this.currentTrackIndex === this.tracks.length - 1
        ? 0
        : this.currentTrackIndex + 1;
    this.setCurrentTrack(this.currentTrackIndex);
    this.timer = getFormatedTime(0);
    this.onTrackChanged();
  }
}

class View {
  constructor() {
    this.app = this.getElement("#root");

    this.titleElement = this.createElement("div", "title");
    this.titleElement.textContent = "";

    this.authorElement = this.createElement("div", "artist");
    this.authorElement.textContent = "";

    // Play Button
    this.playButton = this.createElement("button", "play-button");
    this.playButton.textContent = "Play";

    // Next Button
    this.nextButton = this.createElement("button", "next-button");
    this.nextButton.textContent = "Next";

    // Timer Element
    this.timerElement = this.createElement("div", "timer");
    this.timerElement.textContent = "00:00";

    // Duration Element
    this.durationElement = this.createElement("div", "duration");
    this.durationElement.textContent = "00:00";

    this.app.append(
      this.titleElement,
      this.authorElement,
      this.timerElement,
      this.durationElement,
      this.playButton,
      this.nextButton
    );
  }

  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  setTextContentElement(element, textContent) {
    element.textContent = textContent;
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);

    return element;
  }

  displayTrack(track) {
    this.setTextContentElement(this.titleElement, track.title);
    this.setTextContentElement(this.authorElement, track.author);
    this.setCurrentTrackAudioElement(track.url);
    this.timerElement.textContent = "00:00";
  }

  setCurrentTrackAudioElement(trackUrl) {
    this.audioElement = new Audio(trackUrl);
  }

  setCurrentTrackTimer(currentTime) {
    this.timerElement.textContent = currentTime;
  }

  bindPlayTrack(handler) {
    this.playButton.addEventListener("click", () => {
      handler();
    });
  }

  bindNext(handler) {
    this.nextButton.addEventListener("click", () => {
      handler();
    });
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.intervalId = null;

    this.model.bindTrackChanged(this.onTrackChanged);

    this.view.bindPlayTrack(this.handlePlayTrack);
    this.view.bindNext(this.handleNext);
    this.model.init();
  }

  onTrackChanged = () => {
    this.view.displayTrack(this.model.currentTrack);
  };

  handleNext = () => {
    this.view.audioElement.pause();
    this.view.playButton.textContent = "Play";
    this.model.nextTrack();
    clearInterval(this.intervalId);
    this.intervalId = null;
  };

  handlePlayClick() {
    this.view.playButton.textContent = "Stop";
    this.view.audioElement.play();
  }

  handleStopClick() {
    this.view.playButton.textContent = "Play";
    this.view.audioElement.pause();
  }

  handlePlayTrack = () => {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.view.setCurrentTrackTimer(
          getFormatedTime(Math.floor(this.view.audioElement.currentTime) + 1)
        );
      }, 1000);
    }
    if (this.view.audioElement.paused) {
      this.handlePlayClick();
    } else {
      this.handleStopClick();
    }
  };
}

const app = new Controller(new Model(), new View());
