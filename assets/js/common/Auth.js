// 휴대폰 인증 관련 js
const AUTH = {
    authToken: "",
    isSendAuth: false,
    expired: false,
    countTime: 180,
    countTimer: null,
    authPhoneNumber: "",
    resend: false,
    methods: {
        /**
         * 휴대폰 인증번호 발송
         * @param authType (인증 타입)
         * @returns {Promise<void>}
         */
        doSendAuthCode: async function (authType, obj) {
            const params = {
                authType: authType,                                      // 인증 타입 (아이디찾기, 비밀번호찾기, 회원가입)
                authPhone: $("#hpnmNo").data("realValue")                            // 휴대폰 번호
            }

            switch (authType) {
                case ConstCode.CODES_AUTH_TYPE.FINDID:
                    params.userNm = $("#userNm").val().trim();           // 회원 이름
                    break;
                case ConstCode.CODES_AUTH_TYPE.FINDPWD:
                    params.userLoginId = $("#userLoginId").val().trim(); // 회원 ID
                    params.userNm = $("#userNm").val().trim();           // 회원 이름
                    break;
                case ConstCode.CODES_AUTH_TYPE.LOGIN:
                    params.authPhone = AUTH.authPhoneNumber;
                    break;
            }
            params.authPhone = params.authPhone.trim();
            if (!AUTH.methods.sendAuthValid(authType, params)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doSendAuthCode', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if( ConstCode.CODES_AUTH_TYPE.LOGIN === authType ) {
                    if( AUTH.resend ) {
                        alert("인증번호를 다시 전송하였습니다.\n인증번호가 계속 수신되지 않거나 휴대폰 번호를 변경했다면 고객센터(1600-1726)로 연락해주세요.");
                    }
                    Util.validCheck(FH.scrollWrap, FH.validEl, "휴대폰으로 인증번호를 전송했습니다.", "p");
                } else {
                    alert("휴대폰으로 인증번호를 전송했습니다.");
                }
                // 테스트시 사용
                // alert("휴대폰으로 인증번호를 발송했습니다. (인증번호 : " + entity.authCode + ")");

                AUTH.authToken = entity.authToken;
                AUTH.isSendAuth = true;
                AUTH.expired = false;
                AUTH.countTime = 180;

                $("#authTimer").text("03:00");
                $("#authCode").val("");
                $("#authCode").focus();

                AUTH.methods.countDown( obj );
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1003: 이름과 휴대폰번호 불일치 (아이디 찾기)
                    case -1003:
                        Util.validCheck(FH.scrollWrap, FH.validEl, message, "p");
                        AUTH.methods.resetAuth();
                        break;
                    // -1004: 아이디, 이름, 휴대폰번호 불일치 (비밀번호 찾기)
                    case -1004:
                        Util.validCheck(FH.scrollWrap, FH.validEl, message, "p");
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
         * 휴대폰 인증번호 발송 유효성 체크
         * @param params
         * @returns {boolean}
         */
        sendAuthValid: function (authType, params) {
            FH.validEl.html("");
            if (Util.isEmpty(params.authPhone)) {
                Util.validCheck(FH.scrollWrap, FH.validEl, "휴대폰 번호를 입력해 주세요.", "p");
                return false;
            }
            if (!Util.validPhone(params.authPhone.replaceAll("-", ""))) {
                Util.validCheck(FH.scrollWrap, FH.validEl, "올바른 휴대폰 번호를 입력해 주세요.", "p");
                return false;
            }
            if (authType === ConstCode.CODES_AUTH_TYPE.FINDID || authType === ConstCode.CODES_AUTH_TYPE.FINDPWD) {
                if (authType === ConstCode.CODES_AUTH_TYPE.FINDPWD) {
                    if (Util.isEmpty(params.userLoginId)) {
                        Util.validCheck(FH.scrollWrap, FH.validEl, "아이디를 입력해 주세요.", "p");
                        return false;
                    }
                }
                if (Util.isEmpty(params.userNm)) {
                    Util.validCheck(FH.scrollWrap, FH.validEl, "이름을 입력해 주세요.", "p");
                    return false;
                }
            }
            return true;
        },
        /**
         * 휴대폰 인증 초기화
         */
        resetAuth: function () {
            AUTH.methods.stopCountDown();
            AUTH.authToken = ""
            AUTH.isSendAuth = false
            AUTH.expired = false;
            AUTH.countTime = 180;

            $("#authTimer").text("");
            $("#authCode").val("");
        },
        /**
         * 휴대폰 인증 시간 카운트
         */
        countDown: function ( obj ) {
            AUTH.methods.stopCountDown();
            const totalCountTime = AUTH.countTime;
            AUTH.countTimer = setInterval(function () {
                if(AUTH.countTime > 0) {
                    AUTH.countTime--;
                    let minutes = parseInt(AUTH.countTime / 60);
                    minutes = minutes < 10 ? "0" + minutes : minutes
                    let seconds = Math.round(((AUTH.countTime / 60) - minutes) * 60);
                    seconds = seconds < 10 ? "0" + seconds : seconds
                    $("#authTimer").text(minutes + ":" + seconds);

                    if( totalCountTime - AUTH.countTime === 10 ) {
                        if( !Util.isEmpty(obj) && typeof obj.methods.enableResend === "function" ) {
                            obj.methods.enableResend();
                        }
                    }
                } else {
                    AUTH.methods.stopCountDown();

                    AUTH.expired = true;
                    $("#authTimer").text("00:00");
                    if( !Util.isEmpty(obj) && typeof obj.methods.authExpire === "function" ) {
                        obj.methods.authExpire();
                    }
                }
            }, 1000);
        },
        /**
         * 휴대폰 인증 시간 카운트 초기화
         */
        stopCountDown: function () {
            if(AUTH.countTimer !== null) clearInterval(AUTH.countTimer);
        },
    }
}

window.AUTH = AUTH;