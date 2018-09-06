module.exports = function (socket, server, userdata) {
    let module = {};
    module.nick = function (args) {
        let name = args.join(' ');
        server.send.notice.server(userdata.username + " changed their name to " + name);
        userdata.username = name;
        server.send.notice.client("Name set to: " + name);
        server.util.update_userdata();
        server.util.update_clientlist();

    };
    module.join = function (args) {
        let name = args.join(' ');
        server.room.join(name);
        server.util.update_clientlist();
    };
    module.clean_css = function (args) {
        server.send.client("clean_css");
    };
    module.users = function (rooms) {
        let output = "<table class='help' style='margin: auto'>";
        for (let room in rooms) {
            output += "<tr><th>" + (room + ":" + "<br>") + "</th>";
            for (let user_id in rooms[room]) {
                output += "<td class='cmd'>" + (rooms[room][user_id].username + "<br>") + "</td>";
            }
            output += "</tr>";
        } 
        server.send.notice.client(output);
    };
    module.help = function () {
        let style = "" +
            "<style></style>";
        const commands = [
            {header: "<h1>Command help:</h1>"},
            {header: "Room commands:"},
            {command: "/join", args: "[channel]", info: "join/create a room, anything is allowed as a room name"},
            {command: "/leave", info: "return to the public room"},
            {header: "User commands:"},
            {command: "/nick", args: "[name]", info: "change your chat nickname"},
            {command: "/theme", args: "[name]", info: "used to change the websites theme"},
            {header: "available themes:"},
            {command: "default", info: "The default theme designed by Brandon v Dongen."},
            {command: "hacker", info: "A black/green theme designed by user dqen"}


        ];
        let table = "<table class='help' style='margin: auto'>";
        for (let command of commands) {
            if (command.command) {
                let args = "";
                if (command.args) args = " " + command.args;
                table += "<tr><td class='cmd'>" + command.command + args + "</td><td class='info'>" + command.info + "</td></tr>";
            }
            else if (command.header) {
                table += "<tr><th colspan='2'>" + command.header + "</th></tr>";
            }
        }
        table += "</table>";
        server.send.notice.client(table);
    };
    module.theme = function (args) {
        let theme = args.join(' ');
        if (theme === "hacker" ||
            theme === "default") {
            server.send.client("change_theme", {theme: theme});
            userdata.theme = theme;
            server.util.update_userdata();
        } else {
            server.send.notice.client("No such theme available");
        }
    };
    return module;
};
