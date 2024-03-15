import { getFormatedTime, getPercentage } from "./utils.js";

class Model {
  constructor() {
    this.tracks = [
      {
        author: "Cosmo Sheldrake",
        coverUrl: "./images/cover-1.png",
        trackUrl: "tracks/lost-in-city-lights-145038.mp3",
        title: "Lost in the City Lights",
      },
      {
        author: "Lesfm",
        coverUrl: "./images/cover-2.png",
        trackUrl: "./tracks/forest-lullaby-110624.mp3",
        title: "Forest Lullaby",
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
    this.onTrackChanged();
  }

  previousTrack() {
    this.currentTrackIndex =
      this.currentTrackIndex === 0
        ? this.tracks.length - 1
        : this.currentTrackIndex - 1;
    this.setCurrentTrack(this.currentTrackIndex);
    this.onTrackChanged();
  }
}

class View {
  constructor() {
    // UI state
    this.trackIsPlayed = false;
    this.enableProgressResize = false;
    this.intervalId = null;

    // HTML Elements
    this.coverImageElement = this.getElement("#cover");
    this.titleElement = this.getElement("#title");
    this.authorElement = this.getElement("#author");
    this.playButton = this.getElement("#play");
    this.nextButton = this.getElement("#next");
    this.previousButton = this.getElement("#previous");
    this.timerElement = this.getElement("#timer");
    this.durationElement = this.getElement("#duration");
    this.playIconElement = this.getElement("#play-icon");
    this.stopIconElement = this.getElement("#stop-icon");

    // Progress HTML Element
    this.progressElement = this.getElement("#progress");
    this.progressInnerElement = this.getElement("#progress-inner");
    this.progressTrack = this.getElement("#progress-track");

    this.bindProgress();
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
    this.setCurrentTrackAudioElement(track.trackUrl);
    this.coverImageElement.src = track.coverUrl;
    this.timerElement.textContent = "00:00";

    if (this.trackIsPlayed) {
      this.audioElement.play();
    } else {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.progressInnerElement.style.width = "0%";
    }
  }

  setCurrentTrackAudioElement(trackUrl) {
    this.audioElement = new Audio(trackUrl);
    this.audioElement.addEventListener("loadeddata", () => {
      this.durationElement.textContent = getFormatedTime(
        Math.floor(this.audioElement.duration)
      );
    });
  }

  setTrackCurrentTimer() {
    this.timerElement.textContent = getFormatedTime(
      Math.floor(this.audioElement.currentTime) + 1
    );
  }

  setCurrentTrackTimer() {
    this.setTrackCurrentTimer();
    this.progressInnerElement.style.width =
      Math.floor(
        (this.audioElement.currentTime / this.audioElement.duration) * 100
      ) + "%";
  }

  onPlayTrackHandler() {
    this.stopIconElement.classList.toggle("active");
    this.playIconElement.classList.toggle("active");
    this.audioElement.play();
    this.trackIsPlayed = true;
  }

  onStopTrackHandler() {
    this.stopIconElement.classList.toggle("active");
    this.playIconElement.classList.toggle("active");
    this.audioElement.pause();
    this.trackIsPlayed = false;
  }

  handlePlayTrack = (handler) => {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.setCurrentTrackTimer();
        if (this.audioElement.currentTime === this.audioElement.duration) {
          handler();
        }
      }, 1000);
    }
  };

  bindPlayTrack = (handler) => {
    this.playButton.addEventListener("click", () => {
      if (this.audioElement.paused) {
        this.onPlayTrackHandler();
      } else {
        this.onStopTrackHandler();
      }
      this.handlePlayTrack(handler);
    });
  };

  bindNext(handler) {
    this.nextButton.addEventListener("click", () => {
      this.audioElement.pause();
      handler();
    });
  }

  bindPrevious(handler) {
    this.previousButton.addEventListener("click", () => {
      this.audioElement.pause();
      handler();
    });
  }

  updateProgress = (percentage) => {
    this.progressInnerElement.style.width = percentage + "%";
    this.audioElement.currentTime =
      this.audioElement.duration * (percentage / 100);
    this.setTrackCurrentTimer();
  };

  onProgressClickHandler = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = getPercentage(x, rect.width);
    this.updateProgress(percentage);
  };

  bindProgress = () => {
    this.progressElement.addEventListener("click", this.onProgressClickHandler);

    this.progressTrack.addEventListener("mousedown", () => {
      this.enableProgressResize = true;
    });

    document.addEventListener("mouseup", () => {
      this.enableProgressResize = false;
    });

    document.addEventListener("mousemove", (e) => {
      if (this.enableProgressResize) {
        const rect = this.progressElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = getPercentage(x, rect.width);
        this.updateProgress(percentage);
      }
    });

    this.progressTrack.addEventListener("touchstart", () => {
      this.enableProgressResize = true;
    });

    this.progressTrack.addEventListener("touchend", () => {
      this.enableProgressResize = false;
    });

    document.addEventListener("touchmove", (e) => {
      if (this.enableProgressResize) {
        const rect = this.progressElement.getBoundingClientRect();
        const clientX = e.touches[0].clientX;
        const x = clientX - rect.left;
        const percentage = getPercentage(x, rect.width);
        this.updateProgress(percentage);
      }
    });
  };
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindTrackChanged(this.onTrackChanged);
    this.view.bindPlayTrack(this.handleNext);
    this.view.bindNext(this.handleNext);
    this.view.bindPrevious(this.handlePrevious);
    this.model.init();
  }

  onTrackChanged = () => {
    this.view.displayTrack(this.model.currentTrack);
  };

  handleNext = () => {
    this.model.nextTrack();
  };

  handlePrevious = () => {
    this.model.previousTrack();
  };

  handleStopClick() {
    this.view.playButton.textContent = "Play";
    this.view.audioElement.pause();
  }
}

const app = new Controller(new Model(), new View());
