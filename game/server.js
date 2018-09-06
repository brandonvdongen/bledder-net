const app = require('http').createServer(handler);
let io = require('socket.io')(app);
const fs = require('fs');

app.listen(80);

///http handler
function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
}
////

io.on('connection', function (socket) {
    socket.emit('create_self', {msg: 'hallo client'});
    socket.broadcast.emit('create_user', {name:socket});
    socket.on('disconnect', function (data) {
       socket.broadcast.emit("destroy_user");
    });
});

console.log("started");