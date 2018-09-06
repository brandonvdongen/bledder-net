/** @namespace io.sockets */
const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');
const command_module = require('./modules/commands.js');
const default_room = 'public';
const default_theme = 'default';
app.listen(9000);

function handler(req, res) {
    fs.readFile(__dirname + '/acces_denied.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

let rooms = {};
let pawns = {};


io.on('connection', function socket_handler(socket) {
    socket.join(default_room);
    let message_template = {
        type: 'message',
        message: '',
        color: '',
        self: false
    };
    let server = {
        util: {
            generate_guest: function () {
                let text = '';
                const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                for (let i = 0; i < 5; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return 'Guest_' + text;
            },
            parse_url_to_link: function (message) {
                let parts = message.split(' ');
                let links = [];
                message = undefined;

                if (parts) {
                    for (let i in parts) {
                        if (parts[i].match(/[ ]?(ftp:\/\/|https?:\/\/){1}[a-zA-Z0-9u00a1-\uffff0-]{2,}\.[a-zA-Z0-9u00a1-\uffff0-]{2,}(\S*)/i)) {
                            links.push(parts[i]);
                            parts[i] = "[<a target='_blank' href='" + parts[i] + "'>" + parts[i] + "</a>]";
                        }

                    }
                    message = parts.join(' ');
                }
                return {message: message, links: links};
            },
            parse_css_inject: function (data) {
                data.style = data.message.match(/(<style([\s\S]+?)<\/style>)/);
                if (data.style) {
                    data.message = data.message.replace(data.style[0], "");
                    server.send.notice.client('<span class="code">' + " you have injected some CSS <span style=\"visibility: hidden\">" + data.message + '</span></span>');
                    server.send.notice.server('<span class="code">' + userdata.username + " has injected some CSS <span style=\"visibility: hidden\">" + data.message + '</span></span>');
                } else {
                    data.style = data.message.match(/(<style)/);
                    if (data.style) {

                        server.send.notice.client('<span class="code">' + " you have injected some CSS <span style=\"visibility: hidden\">" + data.message + '</span></span>');
                        server.send.notice.server('<span class="code">' + userdata.username + " has injected some CSS <span style=\"visibility: hidden\">" + data.message + '</span></span>');
                        data.message = "";
                    }


                }
                return data.message;
            },
            update_userdata: function () {
                let data = {userdata: userdata};
                server.send.client('update_userdata', data);
            },
            update_clientlist: function () {
                let output = {};
                output.clients=[];
                let usercount = 0;
                for (let user_id in rooms[userdata.room]) {
                    output.clients.push(rooms[userdata.room][user_id]);
                    usercount++;
                }
                output.count = usercount;
                server.send.client("update_clientlist", output);
                server.send.broadcast("update_clientlist", output);
            },
        },
        send: {//send commands to clients
            client: function (cmd, data = {}) {//send message to own client
                data.self = true;
                socket.emit(cmd, data);
                //console.log(socket.id, ' > client > ', cmd, ' > ', JSON.stringify(data));
            },
            broadcast: function (cmd, data) {//send messages to other clients
                data.self = false;
                socket.broadcast.to(userdata.room).emit(cmd, data);
                //console.log(socket.id, ' > broadcast >', userdata.room, ' > ', cmd, ' > ', JSON.stringify(data));
            },
            notice: {//send notices to clients
                client: function (message) {//send notice to current client
                    server.send.client('message_to_client', Object.assign({}, message_template, {
                        message: message,
                        type: 'notice',
                        userdata: {id: "server"}
                    }));
                },
                server: function (message) {//send notice to other clients
                    server.send.broadcast('message_to_client', Object.assign({}, message_template, {
                        message: message,
                        type: 'notice',
                        userdata: {id: "server"}
                    }));
                }
            },
            message: function (data) {
                let urls = server.util.parse_url_to_link(data.message);
                data.message = urls.message;
                data.message = server.util.parse_css_inject(data);
                data.urls = urls.links;
                console.log(userdata.username, ' > message > ', userdata.room, ' > ', data.message);
                data = Object.assign({}, message_template, data);
                data.userdata = userdata;
                data.userdata.id = socket.id;
                if (data.message !== "") {
                    server.send.broadcast('message_to_client', data);
                    server.send.client('message_to_client', data);

                }
                server.send.client('message_confirm');
            }
        },
        room: {//room commands
            join: function (room) {//join room command
                socket.leave(userdata.room, function (err) {
                        server.room.leave(function () {
                            console.log(userdata.username + ' left channel > ' + userdata.room);
                            server.send.notice.server(userdata.username + ' has left the channel');
                            room = room.toString();
                            socket.join(room);
                            if (!(room in rooms)) rooms[room] = {};
                            if (!(socket.id in rooms[room])) {
                                rooms[room][socket.id] = userdata;
                                console.log(userdata.username + ' joined channel > ' + room);
                            }

                            userdata.room = room;
                            server.send.notice.server(userdata.username + ' has joined the channel');
                            server.send.notice.client('You joined ' + userdata.room);
                            server.util.update_userdata();
                            server.util.update_clientlist();
                            server.send.client("update_room",{room:userdata.room});
                        });
                    }
                );
            },
            leave: function (callback) {
                if (userdata.room in rooms) {
                    if (socket.id in rooms[userdata.room]) {
                        delete rooms[userdata.room][socket.id];
                        if (Object.keys(rooms[userdata.room]).length === 0) {
                            delete rooms[userdata.room];
                            console.log("room " + userdata.room + " empty, removing");
                        }
                    }
                    server.util.update_clientlist();
                }
                if (typeof callback === "function") {
                    callback();
                }
            }
        }
    };

    let userdata = {//generate basic userdata
        username: server.util.generate_guest(),
        color: 'n/a',
        room: default_room,
        theme: default_theme,
        typing: false
    };
    /** command handler
     * @type object
     */
    const command = new command_module(socket, server, userdata);
    //announce client connecting
    //console.log('Incomming connection: ' + socket.id);

    //request local client data
    server.send.client('request_userdata', {});

    //handle userdata request respondse
    socket.on('respond_userdata', function (data) {
        userdata = Object.assign(userdata, data);//merge default object with received data to ensure no missing entries
        //console.log(userdata.username, ' > received userdata');
        server.room.join(userdata.room);//join the last room the client was in according to local data
        command.theme([userdata.theme]);
        server.send.notice.client("use /help for commands");
    });
    socket.on('message_to_server', function (data) {
        if (data.message.charAt(0) === "/") {
            let args = data.message.split(' ');
            let cmd = args[0].substr(1);
            args = args.splice(1);
            cmd = cmd.toString().toLowerCase();
            //console.log("CMD > ", cmd, JSON.stringify(args));

            if (cmd === "nick") command.nick(args);
            else if (cmd === "join") command.join(args);
            else if (cmd === "leave") {
                args = ["public"];
                command.join(args);
            }
            else if (cmd === "rooms") command.users(rooms);
            else if (cmd === "theme") command.theme(args);
            else if (cmd === "cleanup") command.clean_css();
            else if (cmd === "help") command.help();
            else server.send.notice.client("Unkown command");
            server.send.client('message_confirm');

        } else {
            server.send.message(data);
        }

    });
    socket.on('disconnect', function (data) {
        server.send.notice.server(userdata.username + ' has left the server');
        server.room.leave();
    });
    socket.on('request_clients', function () {
        server.util.update_clientlist();
    });
    socket.on('user_typing', function (data) {
        if (userdata.room in rooms) {
            if (socket.id in rooms[userdata.room]) {
                userdata.typing = data.typing;
                rooms[userdata.room][socket.id] = userdata;
                server.util.update_clientlist();
            }
        }
    });
})
;

console.log('server started');