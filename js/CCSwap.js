function load_css(files){
    let head = document.querySelector("head");
    for (let file of files) {
        let link = document.createElement("link");
        link.classList.add("theme");
        link.rel = "stylesheet";
        link.href = file;
        head.appendChild(link);
    }
}

function change_style(name, style) {
    let themes = document.querySelectorAll(".theme");
    for (let theme of themes) {
        theme.parentNode.removeChild(theme);
    }
    let files = [
        "assets/theme/"+name+"/css/style.css",
        "assets/theme/"+name+"/css/animations.css"];
    load_css(files);
    settings.sounds.ping = "assets/theme/"+name+"/sound/notification.mp3";
    settings.sounds.ping_unfocused = "assets/theme/"+name+"/sound/notification_unfocused.mp3";
}