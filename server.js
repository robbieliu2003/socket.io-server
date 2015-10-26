var io = require('socket.io')();

io.on('connection', function(socket) {
	console.log('need nickname')
	socket.emit('need_nickname');

	socket.on('disconnect', function () {
		console.log(socket.nickname + '退出聊天室');
		if (socket.nickname !== null && socket.nickname !== "") {
			socket.broadcast.emit('user_quit', socket.nickname);
		}
	});

	socket.on('set_nickname', function (nickname) {
		nickname = nickname.trim();

		socket.nickname = nickname;
		console.log(socket.nickname + '加入聊天室');

		socket.emit('user_welcome', nickname);
		socket.broadcast.emit('user_join', nickname);
	});

	socket.on('say', function (content) {
        if (undefined == socket.nickname || "" == socket.nickname || null == socket.nickname) {
            return socket.emit('need_nickname');
        }
		content = content.trim();
        console.log(socket.nickname + ': say(' + content + ')');

		socket.emit('user_say', socket.nickname, content);
		socket.broadcast.emit('user_say', socket.nickname, content);
	});
});

exports.listen = function (server) {
    return io.listen(server);
};