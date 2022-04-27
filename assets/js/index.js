var $messages = $('.messages-content'),
  d, h, m,
  i = 0;

var myName = "";
var autolinker = new Autolinker({
  newWindow: false,
  truncate: 30
});
const openImgInput = function () {
  document.querySelector('.message-input-image').style.display = "block";
  document.querySelector('.message-input-image input').focus()
  document.querySelector('button.message-img i').classList.remove('fa-image')
  document.querySelector('button.message-img i').classList.add('fa-comment-dots')
}
const closeImgInput = function () {
  document.querySelector('.message-input-image').style.display = "none";
  document.querySelector('button.message-img i').classList.add('fa-image');
  document.querySelector('button.message-img i').classList.remove('fa-comment-dots');
  document.querySelector('.message-input-area .message-input').focus()
}
$(window).load(async function () {
  document.querySelector('.message-input-area .message-input').focus()
  $('button.message-img').click(function () {
    if (document.querySelector('.message-input-image').style.display == "block") {
      closeImgInput()
    } else {
      openImgInput()
    }
  })
  $('.message-input-image button').click(async function () {
    if ($('.message-input-image input').val() != "") {
      await sendMessage($('.message-input-image input').val())
      await $('.message-input-image input').val('');
      closeImgInput()

    } else alert('Вы не указали ссылку на изображение!')

  })
  if (!window.localStorage.getItem('login')) { myName = prompt("Введите придуманный никнейм"); } else { myName = window.localStorage.getItem('login') }
  // $messages.mCustomScrollbar();
  if (myName == undefined || myName == '') {
    document.querySelector('textarea#message').style.display = "none";
    document.querySelector('.message-box').innerHTML = "Сначала войдите!"
    document.querySelector('.message-box').classList.add('blocked')
  }

  var LinkRegExp = /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\/])*)?/g;
  var ImgLinkRegExp = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg|webp))/g;
  if (myName != undefined || myName != '') window.localStorage.setItem('login', myName)
  var i = -1;
  var dateArr = [];
  const monthA = 'января,февраля,марта,апреля,мая,июня,июля,августа,сентября,октября,ноября,декабря'.split(',');
  firebase.database().ref("messages").on("child_added", function (snapshot) {
    i = i + 1;
    dateArr.push(new Date(snapshot.val().ts).getDate())

    // let msg = snapshot.val().message.replaceAll(ImgLinkRegExp, '<img src=$&>').replaceAll(LinkRegExp, '<a class="" href="$&">$&</a>')
    let msg = autolinker.link(snapshot.val().message);
    let date = new Date(snapshot.val().ts);
    dateStr = (date.getUTCHours() + 3 == 24 ? 0 : date.getUTCHours() + 3 == 25 ? 1 : date.getUTCHours() + 3 == 26 ? 2 : date.getUTCHours() + 3) + ":" + (date.getUTCMinutes() < 10 ? '0' + date.getUTCMinutes() : date.getUTCMinutes())
    if (snapshot.val().sender == myName) {
      $('<div id="' + snapshot.val().sender + '" class="message message-personal"><button class="btn-copy" onclick="copyToClipboard(`' + snapshot.val().message + '`)"><i class="fas fa-clone"></i></button><button class="btn-delete" data-id="' + snapshot.key + '" onclick="deleteMessage(this);"><i class="fas fa-trash-can"></i></button><div unselectable="on" id="message-' + snapshot.key + '">' + msg + '</div></div>').appendTo($('.messages-content')).addClass('new');
      $('.message-input').val(null);
    } else {
      $('<div id="' + snapshot.val().sender + '"class="message new"><div unselectable="on" id="message-' + snapshot.key + '">' + msg + '</div></div>').appendTo($('.messages-content')).addClass('new');
    }

    setNameDate(snapshot, i, dateArr, monthA);
    // element.scrollTop = element.scrollHeight
    $messages.scrollTop($messages.prop('scrollHeight'));
  })
});
var delta = 0;
var dateX = 0;
function setNameDate(snapshot, i, dateArr, monthA) {
  // $('<div class="name">' + snapshot.val().sender + '</div>').appendTo($('.message:last'));
  // console.log(document.querySelectorAll('.message')[i])
  if (dateArr[i] != dateX) {
    dateX = dateArr[i];
    document.querySelectorAll('.message')[i - 1 < 0 ? 0 : i - 1].style.marginBottom = "30px";
    document.querySelectorAll('.message')[i].style.marginTop = "30px";
    $('<div class="divider hasContent" role="separator" aria-label="' + new Date(snapshot.val().ts).getDate() + ' ' + monthA[new Date(snapshot.val().ts).getMonth()] + ', ' + new Date(snapshot.val().ts).getFullYear() + '"><span class="contentDiv" unselectable="on">' + new Date(snapshot.val().ts).getDate() + ' ' + monthA[new Date(snapshot.val().ts).getMonth()] + ', ' + new Date(snapshot.val().ts).getFullYear() + '</span></div></div>').insertBefore(document.querySelectorAll('.message')[i])
  }
  if (document.querySelectorAll('.message')[i].id != delta) {
    delta = document.querySelectorAll('.message')[i].id
    document.querySelectorAll('.message')[i].style.marginTop = "50px";
    $('<div class="nameAndTs"><div class="name" unselectable="on">' + snapshot.val().sender + '</div><div class="timestamp" unselectable="on">' + dateStr + '</div></div>').appendTo(document.querySelectorAll('.message')[i]);
    // $('<figure class="avatar"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdX6tPX96Zk00S47LcCYAdoFK8INeCElPeJrVDrh8phAGqUZP_g" /></figure>').appendTo(document.querySelectorAll('.message:not(.message-personal)')[i]);
  }
  // console.log(dateArr[i])

}


function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return console.log();
  }

  sendMessage();
}

$('.message-submit').click(function () {
  insertMessage();
});

$(window).on('keydown', function (e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }

  var tabIsPressed = false;

  $(window).keydown(function (event) {
    if (event.keyCode == 9) {
      tabIsPressed = true; event.preventDefault();
    }
  });

  $(window).keyup(function (event) {
    if (event.keyCode == 9) {
      tabIsPressed = false; event.preventDefault();
    }
  });

  $(window).on('keydown', function (e) {
    if (tabIsPressed && event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("tickets_send").onclick();
      return;
    }
  });
});