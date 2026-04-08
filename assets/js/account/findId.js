import "/js/common/Auth.js?version=2025010801";

// 아이디 찾기 js
let _this;
const FH = {
    scrollWrap: $(".member-content"),
    validEl: $("#findIdValid"),
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
         * 아이디 찾기
         * @returns {Promise<void>}
         */
        doFindId: async function () {
            const params = {
                authToken: AUTH.authToken,             // 인증 토큰
                authCode: $("#authCode").val().trim(), // 인증 코드
                userNm: $("#userNm").val().trim(),     // 회원 이름
                hpnmNo: $("#hpnmNo").data("realValue")      // 휴대폰 번호
            }
            if (!_this.methods.findIdValid(params)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doFindId', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                AUTH.methods.stopCountDown();
                if( !Util.isEmpty(entity) ) {
                    for( let v = 0; v < entity.length; v++ ) {
                        $("#userLoginId").append(entity[v].userLoginId)
                        if( v < entity.length - 1 ) {
                            $("#userLoginId").append( "<br/>" );
                        }
                    }
                }

                $(".findIdWrap").css("display", "none");
                $(".resultWrap").css("display", "block");
                _this.scrollWrap.scrollTop(0);
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1008 : 인증번호 불일치
                    case -1008:
                        Util.validCheck(_this.scrollWrap, _this.validEl, message, "p");
                        break;
                    // -1003: 이름과 휴대폰번호 불일치
                    // -1013: 인증 세션 만료
                    case -1003: case -1013:
                        Util.validCheck(_this.scrollWrap, _this.validEl, message, "p");
                        AUTH.methods.resetAuth();
                        break;
                    default:
                        alert(message);
                        AUTH.methods.resetAuth();
                        break;
                }
            }
        },
        /**
         * 아이디 찾기 유효성 체크
         * @param params
         * @returns {boolean}
         */
        findIdValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.userNm)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "이름을 입력해 주세요.", "p");
                return false;
            }
            if (Util.isEmpty(params.hpnmNo)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "휴대폰 번호를 입력해 주세요.", "p");
                return false;
            }
            if (!AUTH.isSendAuth) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "인증 요청을 진행해 주세요.", "p");
                return false;
            }
            if (AUTH.isSendAuth && Util.isEmpty(params.authCode)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "인증 번호를 입력해 주세요.", "p");
                return false;
            }
            if (AUTH.isSendAuth && AUTH.expired) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "인증 번호 입력 시간을 초과하였습니다.", "p");
                return false;
            }
            return true;
        }
    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        $("#userNm").focus();

        stopLoading();
    }
}

window.FH = FH;
FH.init();