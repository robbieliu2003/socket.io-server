var server = 'http://10.10.16.184:3000'
var socket = io.connect(server)

socket.on('need_nickname', function () {
	$('#login-modal').modal('show')
});

socket.on('user_welcome', function (nickname) {
	$('#login-modal').modal('hide')
	$('#my-nickname').html('[' + nickname + ']')

    addServerMessage(getLocalHMS(), '[' + nickname + '] 欢迎你进入聊天室。')
})

socket.on('user_join', function (nickname) {
    addServerMessage(getLocalHMS(), '[' + nickname + '] 进入了聊天室。')
})

socket.on('user_quit', function (nick_name) {
    addServerMessage(getLocalHMS(), '[' + nick_name + '] 离开了聊天室。')
})

socket.on('user_say', function (_nick_name, _content) {
    addMessage(_nick_name, getLocalHMS(), _content)
    if ("hidden" == document[GetVisibilityKey()]) {
        Notify.show({icon:'',
            'title':'聊天室',
            'message':_nick_name + '：' + _content,
            'autoclose':3,
            'onclick': function () {
                window.focus();
                if (undefined !== typeof this.close){
                    this.close();
                } else if(undefined !== typeof this.cancel) {
                    this.cancel();
                }
            }})
    }
})

function getLocalHMS() {
    var time = (new Date()).getTime()
    var d = new Date()
    return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
}

function GetVisibilityKey() {
    var state
    if (typeof document.hidden !== "undefined") {
        state = "visibilityState"
    } else if (typeof document.mozHidden !== "undefined") {
        state = "mozVisibilityState"
    } else if (typeof document.msHidden !== "undefined") {
        state = "msVisibilityState"
    } else if (typeof document.webkitHidden !== "undefined") {
        state = "webkitVisibilityState"
    }
    return state
}

function chatBodyToBottom() {
    var chat_body = $('.chat-body')
    var height = chat_body.prop("scrollHeight")
    chat_body.prop('scrollTop', height)
}

function addMessage(_name, _time, _content) {
    var msg_list = $(".msg-list-body")
    msg_list.append(
            '<div class="clearfix msg-wrap"><div class="msg-head">' +
            '<span class="msg-name label label-primary pull-left">' +
            '<span class="glyphicon glyphicon-user"></span>&nbsp;&nbsp;' + _name + '</span>' +
            '<span class="msg-time label label-default pull-left">' +
            '<span class="glyphicon glyphicon-time"></span>&nbsp;&nbsp;' + _time + '</span>' +
            '</div><div class="msg-content">&nbsp;&nbsp;' + _content + '</div></div>'
    )
    chatBodyToBottom()
}

function addServerMessage(_time, _content) {
    var msg_list = $(".msg-list-body")
    msg_list.append(
            '<div class="clearfix msg-wrap"><div class="msg-head">' +
            '<span class="msg-name label label-danger pull-left">' +
            '<span class="glyphicon glyphicon-info-sign"></span>&nbsp;&nbsp;系统消息</span>' +
            '<span class="msg-time label label-default pull-left">' +
            '<span class="glyphicon glyphicon-time"></span>&nbsp;&nbsp;' + _time + '</span>' +
            '</div><div class="msg-content">&nbsp;&nbsp;' + _content + '</div></div>'
    )
    chatBodyToBottom()
}

//各种元素响应---------------------------------------------------------
function onClickSendMessage() {
    var edit = $("#input-edit")
    var content = edit.val()
    if ("" == content) {
        return
    }
    socket.emit('say', content)
    edit.val("")
}

function onClickApplyNickname() {
	var nickname_edit = $('#nickname-edit')
	var nickname_error = $("#nickname-error")
    var name = nickname_edit.val()
    if ("" == name) {
	    nickname_error.text("请填写昵称。")
	    nickname_error.show()
	    nickname_edit.focus()
        return
    }
    socket.emit('set_nickname', name)
    Notify.request()
}

$(function(){
    $('.chat-body').height(document.documentElement.clientHeight-230);
})

//各种事件响应----------------------------------------------------------
$("div[role='dialog']").on("show.bs.modal", function () {
    // 具体css样式调整
    $(this).css({
        "display": "block"
    })
})

$("#login-modal").on("show.bs.modal", function (_event) {
    $('#nickname-edit').val("")
    $("#nickname-error").hide()
})

$("#login-modal").on("shown.bs.modal", function (_event) {
    $('#nickname-edit').focus()
})

$('#input-edit').keydown(function(_event) {
   if(13 == _event.keyCode) {
       onClickSendMessage()
   }
})

$('#nickname-edit').keydown(function(_event) {
    if(13 == _event.keyCode) {
        onClickApplyNickname()
    }
})