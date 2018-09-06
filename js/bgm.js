const bgm = {
    create: function (target, settings, callback) {
        const audio = document.createElement("audio");
        if (settings !== undefined && typeof settings === "object") {
            const defaults = {
                source: ""
                , autoplay: 0
                , loop: 0
                , volume: 1
                , muted: 0
            };
            for (let i in defaults) {
                if (settings[i] === undefined) {
                    settings[i] = defaults[i];
                }
            }
            audio.src = settings.source;
            audio.autoplay = settings.autoplay;
            if (settings.autoplay) {
                audio.dataset.playing = 1;
            }
            else {
                audio.dataset.playing = 0;
            }
            audio.volume = settings.volume;
            audio.loop = settings.loop;
            audio.id = target;
            //                audio.controls=true;
            //                audio.style.top=0;
            //                audio.style.position = "absolute";
            audio.dataset.volume = settings.volume;
            audio.dataset.muted = settings.muted;
            document.querySelector("body").appendChild(audio);
            if (typeof callback === "function") {
                callback();
            }
        }
        else {
            console.error(".create not configured properly");
        }
    }
    , once: function (target, settings, callback) {
        if (settings !== undefined && typeof settings === "object") {
            const defaults = {
                source: ""
                , volume: 1
                , buffer: 0
            };
            for (let i in defaults) {
                if (settings[i] === undefined) {
                    settings[i] = defaults[i];
                }
            }
            let audio = document.createElement("audio");
            audio.src = settings.source;
            audio.classList.add(target);
            audio.autoplay = 1;
            audio.volume = settings.volume;
            //                audio.controls=true;
            //                audio.style.top="25px";
            //                audio.style.position = "absolute";
            document.querySelector("body").appendChild(audio);
            if (settings.buffer > 0) {
                audio.dataset.buffered = "1";
                audio.addEventListener("timeupdate", function (e) {
                    if (audio.currentTime > audio.duration - settings.buffer) {
                        if (audio.dataset.buffered === "1") {
                            audio.dataset.buffered = "0";
                            (function (callback, e) {
                                if (typeof callback === "function") {
                                    callback(e);
                                }
                            })(callback, e);
                        }
                    }
                });
            }
            audio.addEventListener("ended", function (e) {
                (function (callback, e) {
                    if (typeof callback === "function") {
                        if (settings.buffer == 0) callback(e);
                    }
                    audio.parentElement.removeChild(audio);
                })(callback, e);
            });
        }
        else {
            console.error(".once not configured properly");
        }
    }
    , start: function (target, callback) {
        let audio = document.querySelector("#" + target);
        audio.play();
        audio.volume = audio.dataset.volume;
        audio.dataset.playing = 1;
        if (typeof callback === "function") {
            callback();
        }
    }
    , stop: function (target, callback) {
        const audio = document.querySelector("#" + target);
        audio.pause();
        audio.currentTime = 0;
        audio.dataset.playing = 0;
        if (typeof callback === "function") {
            callback();
        }
    }
    , pause: function (target, callback) {
        const audio = document.querySelector("#" + target);
        audio.pause();
        audio.dataset.playing = 0;
        if (typeof callback === "function") {
            callback();
        }
    }
    , fade_out: function (target, callback) {
        const audio = document.querySelector("#" + target);
        const max_vol = audio.dataset.volume;
        const muted = audio.dataset.muted;
        if (muted === "0") {
            for (let loop = 0; loop <= 100; loop++) {
                if (loop >= 100) {
                    setTimeout(function () {
                        (function (callback) {
                            audio.volume = 0;
                            audio.dataset.muted = 1;
                            if (typeof callback === "function") {
                                callback();
                            }
                        })(callback);
                    }, 10 * loop);
                }
                else {
                    setTimeout(function () {
                        audio.volume = (100 - loop) * (max_vol / 100);
                    }, 10 * loop);
                }
            }
        }
    }
    , fade_in: function (target, callback) {
        const audio = document.querySelector("#" + target);
        const max_vol = audio.dataset.volume;
        const muted = audio.dataset.muted;
        if (muted === "1") {
            for (let loop = 0; loop <= 100; loop++) {
                if (loop >= 100) {
                    setTimeout(function () {
                        (function (callback) {
                            audio.volume = max_vol;
                            audio.dataset.muted = 0;
                            if (typeof callback === "function") {
                                callback();
                            }
                        })(callback);
                    }, 10 * loop);
                }
                else {
                    setTimeout(function () {
                        audio.volume = loop * (max_vol / 100);
                    }, 10 * loop);
                }
            }
        }
    }
    , set_vol: function (target, volume, callback) {
        const audio = document.querySelector("#" + target);
        audio.dataset.volume = volume;
        audio.volume = volume;
        if (typeof callback === "function") {
            callback();
        }
    }
    , set_src: function (target, source, callback) {
        const audio = document.querySelector("#" + target);
        audio.src = source;
        if (typeof callback === "function") {
            callback();
        }
    }
    , status: function (target, callback) {
        const audio = document.querySelector("#" + target);
        data = {
            playing: audio.dataset.playing
            , muted: audio.dataset.muted
            , src: audio.src
            , volume: audio.volume
        };
        if (typeof callback === "function") {
            callback(data);
        }
        return data;
    }
    ,
}