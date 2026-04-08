// 대시보드 js
let _this;
const FH = {
    dashboardData: null,
    topNoticeCount: 0,
    noticeList: null,
    events: {
        /**
         * key 입력 이벤트
         */
        keyEvent: function () {
        },
        /**
         * click 이벤트
         */
        clickEvent: function () {
        },
        /**
         * change 이벤트
         */
        changeEvent: function () {
        }
    },
    methods: {
        /**
         * 대시보드 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetDashBoardData: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/dashboard/doGetDashBoardData', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.dashboardData = entity;
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 대시보드 공지사항 리스트 - 데이터 조회
         * (상단고정 포함 10개)
         * @returns {Promise<void>}
         */
        doGetNoticeList: async function () {
            const res = await ServiceExec.post('/api/dashboard/doGetNoticeList');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.topNoticeCount = 0;
                _this.noticeList = entity;
                if (!Util.isEmpty(entity)) {
                    _this.topNoticeCount = entity.filter((item) => item.topExpsYn === "Y").length;
                }
                _this.methods.getPageContent();
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 대시보드 - 내용 페이지 호출
         * @returns {Promise<void>}
         */
        getPageContent: async function () {
            const params = {
                path: "dashboard/index_content",
                htmlData: {
                    dashboardData: _this.dashboardData,
                    topNoticeCount: _this.topNoticeCount,
                    noticeList: _this.noticeList
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
        },
        /**
         * 공지사항 팝업 조회
         * @returns {Promise<void>}
         */
        doGetNoticePopup: async function () {
            const res = await ServiceExec.post('/api/dashboard/doGetNoticePopup');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if (!Util.isEmpty(entity)) {
                    // 팝업 내용 입력
                    let wptlBlbdNo = entity.wptlBlbdNo;
                    let titNm = entity.titNm;
                    let content = entity.blbdCn;
                    let hasAttachFile = !Util.isEmpty(entity.atchFileNm);

                    $("#popupSubject").text(titNm);
                    $("#popupContent").html(content);
                    if(hasAttachFile) {
                        $("#popupLink").css('display', 'block');
                        $("#popupLink").find('a').attr('href', '/board/notice/detail?wptlBlbdNo=' + wptlBlbdNo);
                    }

                    $("#noticePopup").css('display', 'block');
                }
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        doGetConfirmReceiptPopup: async function () {
            if(_this.dashboardData && _this.dashboardData.isExistShippedOrder) {
                const params = {
                    path: "modal/confirmReceiptPopup"
                };
                const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
                if ($("#confirmReceiptPopup").length) $("#confirmReceiptPopup").remove();
                $("body").children("a.btn-top").after(html);
                $("#confirmReceiptPopup").modal({show: true});
            }
        },
        closeConfirmReceiptPopup: function() {
            $("#confirmReceiptPopup").modal({show: false}).remove();
        },
        /**
         * 계좌 번호 복사
         * @param text
         */
        accountCopy: function (text) {
            if (window.isSecureContext && navigator.clipboard) {
                navigator.clipboard.writeText(text)
                    .then(()=> {
                        alert("계좌번호를 복사했습니다.");
                    })
                    .catch(err => {
                        console.log(err);
                    })
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand("copy")
                    alert("계좌번호를 복사했습니다.");
                } catch (err) {
                    console.log(err)
                }
                document.body.removeChild(textArea);
            }
        },
        /**
         * swiper 생성
         * (운영상품 리스트)
         */
        setSwiper: function () {
            new Swiper(".main-card .swiper-container", {
                navigation: {
                    nextEl: ".main-card .swiper-button-next",
                    prevEl: ".main-card .swiper-button-prev",
                },
                pagination: {
                    el: ".main-card .swiper-pagination",
                    type: "fraction",
                },
            });
        },
        checkAndClosePopup: function() {
            this.setCookie('popup1', "done", 1);
            $("#noticePopup").hide();
        },
        closePopup: function() {
            $("#noticePopup").hide();
        },
        getCookie: function( name ) {
            let nameOfCookie = KSM.wptlUserNo + name + "=";
            let x = 0;
            while (x <= document.cookie.length) {
                let y = (x + nameOfCookie.length);
                if (document.cookie.substring(x, y) == nameOfCookie) {
                    let endOfCookie = document.cookie.indexOf(";", y);
                    if (endOfCookie == -1)
                        endOfCookie = document.cookie.length;
                    return unescape(document.cookie.substring(y, endOfCookie));
                }

                x = document.cookie.indexOf(" ", x) + 1;

                if (x == 0) break;
            }

            return "";
        },
        setCookie: function( name, value, expiredays ) {
            let todayDate = new Date();
            todayDate = new Date(parseInt(todayDate.getTime() / 86400000) * 86400000 + 54000000);

            if (todayDate > new Date()) {
                expiredays = expiredays - 1;
            }

            todayDate.setDate(todayDate.getDate() + expiredays);

            document.cookie = KSM.wptlUserNo + name + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";";
        }
    },
    init: async function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        Util.deleteCookie("listInfo");
        await _this.methods.doGetDashBoardData();
        _this.methods.doGetNoticeList();

        // 60.0 off
        if( KSM.role !== "ROLE_ADMIN" ) {
            // 팝업창에 주어진 이름을 변수로 던져 저장된 쿠키가 있는지 확인
            let hasPopup = _this.methods.getCookie('popup1');

            // 변수가 없을경우 팝업 출력
            if (!hasPopup) {
                // 팝업 조회
                _this.methods.doGetNoticePopup();

                //$(".popWrap").css("display", "block");
                //$(".popLayer").css("display", "flex");
            }
        }
        _this.methods.doGetConfirmReceiptPopup();
    }
}

window.FH = FH;
FH.init();