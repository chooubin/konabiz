(function () {
    var w = window;
    if (w.ChannelIO) {
        return (window.console.error || window.console.log || function () {
        })('ChannelIO script included twice.');
    }
    var ch = function () {
        ch.c(arguments);
    };
    ch.q = [];
    ch.c = function (args) {
        ch.q.push(args);
    };
    w.ChannelIO = ch;

    function l() {
        if (w.ChannelIOInitialized) {
            return;
        }
        w.ChannelIOInitialized = true;
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
        s.charset = 'UTF-8';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
    }

    if (document.readyState === 'complete') {
        l();
    } else if (window.attachEvent) {
        window.attachEvent('onload', l);
    } else {
        window.addEventListener('DOMContentLoaded', l, false);
        window.addEventListener('load', l, false);
    }
})();
ChannelIO('boot', {
    "pluginKey": "9c5b5d23-e619-4161-af21-bae5d974ae27"
}, function onBoot(error, user) {
    // 채널톡이 정상 로드 되면 실행(겹치는 엘리먼트 position 이동)
    if(user) {
        if($("a.btn-top").length) {
            $("a.btn-top").css("bottom", "95px");
        }
        if($(".overlap").length) {
            $(".overlap").css("margin-right", "60px");
        }
    }
});