import { getFormatedTime } from "./utils.js";

class Model {
  constructor() {
    this.tracks = [
      {
        author: "Lesfm",
        coverUrl: "./images/cover-2.png",
        trackUrl: "./tracks/forest-lullaby-110624.mp3",
        title: "Forest Lullaby",
      },
      {
        author: "Cosmo Sheldrake",
        coverUrl: "./images/cover-1.png",
        trackUrl: "tracks/lost-in-city-lights-145038.mp3",
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
    // this.app = this.getElement("#root");
    this.createRoot("#root");

    /*html*/
    this.renderTemplate(`
      <div class="container">
        <img class="cover" id="cover" src="" />
        <div class="title" id="title"></div>
        <div class="author" id="author"></div>

          <div class="times">
            <div id="timer"></div>
            <div id="duration"></div>
          </div>

        <div class="progress-wrapper">
          <div class="progress" id="progress"></div>
        </div>
        <div class="commands">
          <button class="step" id="previous">
            <img src="./images/svg/previous.svg" />
          </button>
          <button class="play" id="play">
            <img class="active" id="play-icon" src="./images/svg/play.svg" />
            <img id="stop-icon" src="./images/svg/pause.svg" />
          </button>
          <button class="step" id="next">
            <img src="./images/svg/next.svg" />
          </button>
        </div>
      </div>
  `);
    this.coverImageElement = this.getElement("#cover");
    this.titleElement = this.getElement("#title");
    this.authorElement = this.getElement("#author");
    this.playButton = this.getElement("#play");
    this.nextButton = this.getElement("#next");
    this.timerElement = this.getElement("#timer");
    this.durationElement = this.getElement("#duration");
    this.progressElement = this.getElement("#progress");
    this.playIconElement = this.getElement("#play-icon");
    this.stopIconElement = this.getElement("#stop-icon");
  }

  createRoot = (selector) => {
    this.app = this.getElement("#root");
  };

  renderTemplate = (template) => {
    this.app.innerHTML = template;
  };

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
    this.setCurrentTrackAudioElement(track.trackUrl);
    this.coverImageElement.src = track.coverUrl;
    this.timerElement.textContent = "00:00";
    // this.progressElement.textContent = "0%";
  }

  setCurrentTrackAudioElement(trackUrl) {
    this.audioElement = new Audio(trackUrl);
    this.audioElement.addEventListener("loadeddata", () => {
      this.durationElement.textContent = getFormatedTime(
        Math.floor(this.audioElement.duration)
      );
    });
  }

  setCurrentTrackTimer() {
    this.timerElement.textContent = getFormatedTime(
      Math.floor(this.audioElement.currentTime) + 1
    );
    this.progressElement.style.width =
      Math.floor(
        (this.audioElement.currentTime / this.audioElement.duration) * 100
      ) + "%";
  }

  bindPlayTrack(handler) {
    this.playButton.addEventListener("click", () => {
      this.stopIconElement.classList.toggle("active");
      this.playIconElement.classList.toggle("active");
      this.audioElement.paused
        ? this.audioElement.play()
        : this.audioElement.pause();
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
    this.view.stopIconElement.classList.toggle("active");
    this.view.playIconElement.classList.toggle("active");
    this.view.progressElement.style.width = "0%";
    this.model.nextTrack();
    clearInterval(this.intervalId);
    this.intervalId = null;
  };

  handleStopClick() {
    this.view.playButton.textContent = "Play";
    this.view.audioElement.pause();
  }

  handlePlayTrack = () => {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.view.setCurrentTrackTimer();
      }, 1000);
    }
  };
}

const app = new Controller(new Model(), new View());
