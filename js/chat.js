// data.message.match(/(?:https?:\/\/)?(?:www.)?(?:youtube.com|youtu.be)\/(?:watch\?v=)?([^\s]+)/);
// data.message.match(/(<style([\s\S]+?)<\/style>)/);
// data.message.match(/(<iframe([\s\S]+?)<\/iframe>)/);
// frame.innerHTML = '<iframe class="frame" width="500px" height="315" src="http://www.youtube.com/embed/' + data.link[1] + '?&amp;volume=1&amp;rel=0&amp;controls=1&amp;showinfo=0" frameborder="0" allowfullscreen=""></iframe>';
/** @namespace document.hidden */

let debug = false;
let settings = {
    sounds: {
        ping: "assets/sound/normal/notification.mp3",
        ping_unfocused: "assets/sound/normal/notification_unfocused.mp3"
    }
};
document.addEventListener("DOMContentLoaded", function () {
    let temp_data = {
        timed_out: false,
        connected_once: false,
        typing: false,
        typing_timer: 0,
        missed_messages: 0,
        missed_notified: false
    };
    let last_message = {
        id: undefined,
        element: undefined
    };
    let socket = io('http://bledder.brandonvdongen.nl:9000');
    const preloader = document.getElementById("preloader");
    const block_input = document.querySelector("#block_input");
    const input = block_input.querySelector("input");
    const block_chatscreen = document.getElementById("block_chatscreen");
    const block_clientlist = document.getElementById("block_clientlist");
    const room_id = document.getElementById("room_id");
    const usercount = document.getElementById("usercount");
    let client = {
            util: {
                clean_css: function () {
                    console.log("clean");
                },
                create_notice: function (data) {
                    const isScrolledToBottom = block_chatscreen.scrollHeight - block_chatscreen.clientHeight <= block_chatscreen.scrollTop + 1;
                    let span = document.createElement("span");
                    span.classList.add("content");
                    span.innerHTML = data.message;

                    if (last_message.id !== data.userdata.id) {
                        let container = document.createElement("section");
                        container.classList.add("notice");

                        container.appendChild(span);

                        last_message.id = data.userdata.id;
                        last_message.element = container;
                        block_chatscreen.appendChild(container);
                    } else {
                        last_message.element.appendChild(span);
                    }
                    if (isScrolledToBottom) {
                        block_chatscreen.scrollTop = block_chatscreen.scrollHeight - block_chatscreen.clientHeight;
                    }
                },
                create_message: function (data) {

                    const isScrolledToBottom = block_chatscreen.scrollHeight - block_chatscreen.clientHeight <= block_chatscreen.scrollTop + 1;
                    let content = document.createElement("span");
                    content.classList.add("content");
                    content.innerHTML = data.message;
                    if (data.type === "frame") {
                        content.classList.add("code");
                    }
                    if (last_message.id !== data.userdata.id) {
                        let container = document.createElement("section");
                        container.classList.add("message");
                        if (data.self) container.classList.add("sent");

                        let name = document.createElement("span");
                        name.classList.add("name");
                        name.innerHTML = data.userdata.username;

                        container.appendChild(name);
                        container.appendChild(content);

                        last_message.id = data.userdata.id;
                        last_message.element = container;
                        block_chatscreen.appendChild(container);
                    } else {
                        last_message.element.appendChild(content);
                    }
                    if (isScrolledToBottom) {
                        block_chatscreen.scrollTop = block_chatscreen.scrollHeight - block_chatscreen.clientHeight;
                    }
                },
                notify: function (data) {
                    let name = data.userdata.username;
                    let message = data.message;
                    if (Notification) {
                        if (Notification.permission !== "granted") Notification.requestPermission();
                        else {
                            let notification = new Notification(name, {
                                icon: '/favicon.png',
                                body: message,
                            });
                        }
                    }
                },
                parse_youtube_url: function (data) {
                    if (debug) console.log(data);
                    for (let url of data.urls) {
                        let link = url.match(/(?:https?:\/\/)?(?:www.)?(?:youtube.com|youtu.be)\/(?:watch\?v=)?([^\s]+)/);
                        if (link) {
                            data.message = '<iframe class="frame" width="500px" height="315" src="http://www.youtube.com/embed/' + link[1] + '?&amp;volume=1&amp;rel=0&amp;controls=1&amp;showinfo=0" frameborder="0" allowfullscreen=""></iframe>';
                            data.type = "frame";
                            client.util.create_message(data);
                        }
                    }
                },

            },
            send: function (cmd, data) {
                socket.emit(cmd, data);
            },
        }
    ;

    document.addEventListener("keypress", function (e) {
        if (e.keyCode === 13) {
            input.focus();
        }
    });

    block_input.addEventListener("submit", function (event) {
        event.preventDefault();
        if (input.value !== "") {
            input.disabled = true;
            client.send("message_to_server", {message: input.value});
            temp_data.typing_timer = 0;
            temp_data.typing = false;
            client.send("user_typing", {typing: temp_data.typing});
        }
    });

    socket.on("request_userdata", function () {
        temp_data.connected_once = true;
        let userdata = JSON.parse(localStorage.getItem("userdata"));
        if (debug) console.log("got userdata > ", userdata);
        client.send("respond_userdata", userdata);
        preloader.classList.add("hide");
    });
    socket.on("update_userdata", function (data) {
        localStorage.setItem("userdata", JSON.stringify(data.userdata));
        if (debug) console.log("updating client info > ", data.userdata);
    });
    socket.on("message_to_client", function (data) {
        if (debug) console.log("message received > ", data);
        if (data.type === "notice") {
            client.util.create_notice(data);
        }
        if (data.type === "message") {
            client.util.create_message(data);
            if (data.urls) {
                client.util.parse_youtube_url(data);
            }
            if (document.hidden) {
                bgm.once("bgm", {source: settings.sounds.ping_unfocused, volume: 0.3});
                if (temp_data.missed_notified === false) {
                    if (temp_data.missed_messages !== 0) {
                        data.message += "\n(missed " + temp_data.missed_messages + " more messages)";
                    }
                    client.util.notify(data);
                    temp_data.missed_notified = true;
                    setTimeout(function () {
                        temp_data.missed_notified = false;
                    }, 60000);
                }
                temp_data.missed_messages++;

            } else {
                temp_data.missed_messages = 0;
                bgm.once("bgm", {source: settings.sounds.ping, volume: 0.3});
            }
        }

    });
    socket.on("message_confirm", function () {
        input.value = "";
        input.disabled = false;
        input.focus();
    });
    socket.on('connect_timeout', function () {
        if (debug) console.log(socket.connected);
        if (!temp_data.timed_out) {
            let message;
            if (temp_data.connected_once) {
                message = "Your connection with the server has timed out";
            } else {
                message = "Failed to connect with Bledder.net server";
            }
            preloader.querySelector("p").innerHTML = message;
            preloader.classList.remove("hide");
            preloader.focus();
            temp_data.timed_out = true;
        }
    });
    socket.on('reconnect_attempt', function (attempt) {
        let message;
        if (temp_data.connected_once) {
            message = "Reconnecting...";
        } else {
            message = "Connecting...";
        }
        if (debug) console.log(socket.connected);
        preloader.querySelector("p").innerHTML = message + " <br>attempt:" + attempt;
        preloader.focus();
    });
    socket.on('reconnect', function () {
        preloader.querySelector("p").innerHTML = "Reconnected succesfully<br>joining channel:" + localStorage.getItem("userdata").room;
        input.focus();
        setTimeout(function () {
            preloader.classList.add("hide");
            temp_data.timed_out = false;
            preloader.querySelector("p").innerHTML = "";
        }, 1000);
    });
    socket.on("update_clientlist", function (userlist) {

        let clients = [];
        for (let user of userlist.clients) {
            let container = document.createElement("span");
            container.classList.add("user");
            if (user.typing) {
                container.classList.add("typing");
                container.innerHTML = user.username + " is typing...";
            } else {
                container.innerHTML = user.username;
            }
            clients.push(container);
        }
        let old_users = block_clientlist.querySelectorAll(".user");
        for (let user of old_users) {
            user.parentNode.removeChild(user);
        }
        for (let user of clients) {
            block_clientlist.appendChild(user);
        }
        usercount.innerHTML = 'Users in room: ' + userlist.count;
    });
    socket.on("update_room", function (data) {
        room_id.innerHTML = 'Current room: ' + data.room;
    });
    socket.on("change_theme", function (data) {
        change_style(data.theme);
    });
    socket.on("clean_css", function () {
        client.util.clean_css();
    });
    input.addEventListener("keypress", function () {
        if (input.value !== "" && input.value.charAt(0) !== "/") {
            temp_data.typing_timer = 3;
            if (!temp_data.typing) {
                temp_data.typing = true;
                client.send("user_typing", {typing: temp_data.typing});
            }
        } else {
            temp_data.typing_timer = 0;
            temp_data.typing = false;
            client.send("user_typing", {typing: temp_data.typing});
        }
    });
    input.onfocus = function () {
        block_input.classList.add("selected");
        block_chatscreen.classList.add("chatting");
        setTimeout(function () {
            window.scroll({
                bottom: 0,
                left: 0,
                behavior: 'smooth'
            });
        }, 550);

    };
    input.onblur = function () {
        block_input.classList.remove("selected");
        block_chatscreen.classList.remove("chatting");
    };
    block_chatscreen.addEventListener("wheel", function (evt) {
        block_chatscreen.scrollBy(0, evt.deltaY);
    });

    if (Notification) {
        if (Notification.permission !== "granted") Notification.requestPermission();
    }


    setInterval(function () {
        if (temp_data.typing_timer > 0) temp_data.typing_timer--;
        if (!temp_data.typing_timer && temp_data.typing === true) {
            temp_data.typing = false;
            client.send("user_typing", {typing: temp_data.typing});
        } else if (temp_data.typing && temp_data.typing === false) {
            temp_data.typing = true;
            client.send("user_typing", {typing: temp_data.typing});
        }
    }, 1000);
});