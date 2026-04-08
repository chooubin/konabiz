import "/js/common/Auth.js?version=2025010801";

// 로그인 js
let _this;
const FH = {
    scrollWrap: $(".member-content"),
    validEl: $("#loginValid"),
    wptlUserNo: "",
    termsDetail: null,
    termsFlag: false,
    events: {
        /**
         * key 입력 이벤트
         */
        keyEvent: function () {
            // 로그인 form 영역 - 아이디 입력시
            $("#userLoginId").keyup(function (e) {
                if (e.keyCode === 13) {
                    if (!Util.isEmpty($("#userPswd").val().trim())) {
                        _this.methods.doLogin();
                    } else {
                        $("#userPswd").focus();
                    }
                }
            });
            // 로그인 form 영역 - 비밀번호 입력시
            $("#userPswd").keyup(function (e) {
                if (e.keyCode === 13) {
                    if (!Util.isEmpty($("#userLoginId").val().trim())) {
                        _this.methods.doLogin();
                    } else {
                        $("#userLoginId").focus();
                    }
                }
            });
            $("#authCode").keyup(function (e) {
                if( AUTH.expired ) {
                    return;
                }
                Util.inputNumberOnly(this);
                if( $(this).val().length === 4 ) {
                    $("#btnLogin").attr( "disabled", false );
                } else if( $("#btnLogin").is(":disabled") === false ) {
                    $("#btnLogin").attr( "disabled", true );
                }
                if ( $(this).val().length >= 3 && e.keyCode === 13 && !AUTH.expired) {
                    _this.methods.doLogin( true );
                }
            });
        },
        // /**
        //  * click 이벤트
        //  */
        // clickEvent: function () {
        // },
        // /**
        //  * change 이벤트
        //  */
        // changeEvent: function () {
        // }
    },
    methods: {
        /**
         * 로그인
         * @returns {Promise<void>}
         */
        doLogin: async function ( hasAuth ) {
            // 신규 약관이 둘다 있는 flag 초기화
            _this.termsFlag = false;

            const params = {
                userLoginId: $("#userLoginId").val().trim(), // 회원 ID
                userPswd: $("#userPswd").val().trim()        // 비밀번호
            }
            if( hasAuth ) {
                params.authToken = AUTH.authToken;
                params.authCode = $("#authCode").val().trim();
                params.hasAuth = hasAuth;
            }
            if (!_this.methods.loginValid(params)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doLogin', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if ($("#rememberId").is(":checked")) {
                    Util.setCookie("loginInfo", encodeURIComponent(JSON.stringify({userLoginId: params.userLoginId})));
                } else {
                    Util.deleteCookie("loginInfo");
                }
                Util.replace("/main/dashboard");
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1001 : 아이디, 비밀번호 불일치
                    // -1002 : 비밀번호 5회 이상 불일치
                    case -1001: case -1002: case -1008: case -1021:
                        Util.validCheck(_this.scrollWrap, _this.validEl, message, "p");
                        break;
                    // -1007 : 비밀번호 90일 경과한 경우
                    // -1015 : 임시비밀번호로 로그인한 경우
                    case -1007: case -1015:
                        await _this.methods.openChangePswdModal(entity);
                        break;
                    // -1009: 운영자 정보 등록 화면에서 계성생성 한 경우 (개인정보 수집 및 이용약관 동의 레이어 노출, 동의후 로그인시 미노출)
                    // -1012 : 신규 개인정보 수집 및 이용 동의 약관이 있는 경우
                    // -1010 : 신규 약관이 둘다 있는 경우 (서비스, 개인정보)
                    case -1009:
                    case -1010:
                    case -1012:
                        _this.termsFlag = true;
                        _this.methods.openTermsModal("svc", entity);
                        break;
                    // -1011 : 신규 서비스 이용 약관이 있는 경우
                    case -1011:
                        _this.methods.openTermsModal("svc", entity);
                        break;
                    case -1013:
                    case -1020:
                        Util.validCheck(_this.scrollWrap, _this.validEl, message, "p");
                        $("#auth-box").hide();
                        $("#login-box").show();
                        break;
                    case -1100:
                        const hpnmNo = entity;
                        AUTH.authPhoneNumber = hpnmNo;
                        await FH.methods.sendAuthCode( false );
                        $("#auth-box").show();
                        $("#login-box").hide();
                        $("#authCode").focus();
                        break;
                    default:
                        alert(message);
                        $("#auth-box").hide();
                        $("#login-box").show();
                        break;
                }
            }
        },
        /**
         * 인증번호 전송
         */
        sendAuthCode: async function( resend ) {
            AUTH.resend = resend;
            await AUTH.methods.doSendAuthCode(ConstCode.CODES_AUTH_TYPE.LOGIN, _this);
            if( resend && !Util.isEmpty(AUTH.authToken)) {
                $("#btnResend").attr( "disabled", true );
            }
            $("#btnLogin").attr( "disabled", true );
        },
        /**
         * 재전송 버튼 활성화
         */
        enableResend: function() {
            $("#btnResend").attr( "disabled", false );
        },
        /**
         * 인증시간 만료
         */
        authExpire: function() {
            Util.validCheck(_this.scrollWrap, _this.validEl, "인증번호 유효시간이 만료되었습니다.<br>재전송 버튼을 눌러주세요.", "p");
            $("#btnLogin").attr( "disabled", true );
        },
        /**
         * 로그인 유효성 체크
         * @param params
         * @returns {boolean}
         */
        loginValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.userLoginId)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "아이디를 입력해 주세요.", "p");
                return false;
            }
            if (Util.isEmpty(params.userPswd)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "비밀번호를 입력해 주세요.", "p");
                return false;
            }
            if (params.hasAuth) {
                if( params.authCode.length < 1 ) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "인증번호를 입력해 주세요.", "p");
                    return false;
                }
                if( params.authCode.length !== 4 ) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "인증번호를 정확히 입력해 주세요.", "p");
                    return false;
                }
            }

            return true;
        },

        /* ---------------------------------------- 비밀번호 변경 start ---------------------------------------- */
        /**
         * 비밀번호 변경 modal 열기
         * @param entity (계정 정보)
         * @returns {Promise<void>}
         */
        openChangePswdModal: async function (entity) {
            _this.wptlUserNo = entity.wptlUserNo;
            let params = {
                path: "modal/pswd",
                htmlData: {
                    userLoginId: entity.userLoginId
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#pswdModal").length) $("#pswdModal").remove();
            $("body").children("script").first().before(html);
            $("#pswdModal").modal({show: true});
        },
        /**
         * 비밀번호 변경 modal - 비밀번호 변경
         * @returns {Promise<void>}
         */
        doChangePwd: async function () {
            const params = {
                wptlUserNo: _this.wptlUserNo,                     // 회원 시퀀스
                newUserPswd: $("#newUserPswd").val().trim(),      // 비밀번호
                newUserPswdChk: $("#newUserPswdChk").val().trim() // 비밀번호 확인
            }
            let $scrollWrap = $("#pswdModal");
            let $validEl = $("#pswdValid");
            if (!_this.methods.changePwdValid($scrollWrap, $validEl, params)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doChangePwd', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("비밀번호를 변경했습니다.");
                // $("#pswdModal").modal({show: false}).remove();
                // $("#userPswd").val("").focus();
                Util.replace("/account/login");
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1014 : 최근 설정했던 5개 비밀번호와 동일한 경우
                    case -1014:
                        Util.validCheck($scrollWrap, $validEl, message);
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 비밀번호 변경 modal - 비밀번호 변경 유효성 체크
         * @param $scrollWrap
         * @param $validEl
         * @param params
         * @returns {boolean}
         */
        changePwdValid: function ($scrollWrap, $validEl, params) {
            $validEl.html("");
            if (Util.isEmpty(params.newUserPswd)) {
                Util.validCheck($scrollWrap, $validEl, "비밀번호를 입력해 주세요.");
                return false;
            }
            if (!Util.validPassword(params.newUserPswd)) {
                Util.validCheck($scrollWrap, $validEl, "비밀번호가 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (Util.isEmpty(params.newUserPswdChk)) {
                Util.validCheck($scrollWrap, $validEl, "비밀번호를 확인해 주세요.");
                return false;
            }
            if (params.newUserPswd !== params.newUserPswdChk) {
                Util.validCheck($scrollWrap, $validEl, "비밀번호가 일치하지 않습니다.");
                return false;
            }
            return true;
        },
        /* ---------------------------------------- 비밀번호 변경 end ---------------------------------------- */

        /* ---------------------------------------- 약관 start ---------------------------------------- */
        /**
         * 약관 modal 열기
         * @param modalType (서비스: svc, 개인정보: psnl)
         * @param entity (약관 정보)
         * @returns {Promise<void>}
         */
        openTermsModal: async function (modalType = "svc", entity) {
            if (!Util.isEmpty(entity)) {
                _this.wptlUserNo = entity.wptlUserNo;
                _this.termsDetail = entity.termsLatestRes;
            }
            let params = {
                path: "modal/terms",
                htmlData: {
                    pageType: 'login',
                    modalType: modalType,
                    termsDetail: _this.termsDetail
                }
            };
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#termsModal").length) $("#termsModal").remove();
            $("body").children("script").first().before(html);
            $("#termsModal").modal({show: true});
        },
        /**
         * 약관 modal - 약관 동의
         * @returns {Promise<void>}
         */
        doAgree: async function () {
            // 신규 약관이 둘다 있는 경우 다음 약관 노출
            if (_this.termsFlag) {
                _this.termsFlag = false;
                _this.methods.openTermsModal("psnl");
                return;
            }
            const params = {
                wptlUserNo: _this.wptlUserNo,                          // 회원 시퀀스 
                svcUAgrmPrvVerNo: _this.termsDetail.service.wptlPrvNo, // 서비스 약관 시퀀스 
                psnlUAgrmPrvVerNo: _this.termsDetail.privacy.wptlPrvNo // 개인정보 약관 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doAgreeTerms', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity))
            if (code === 1) {
                $("#termsModal").modal({show: false}).remove();
                _this.methods.doLogin( true );
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
        }
        /* ---------------------------------------- 약관 end ---------------------------------------- */
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        // 아이디 저장 여부 확인
        let loginInfoCookie = Util.getCookie("loginInfo");
        if (Util.isEmpty(loginInfoCookie)) {
            $("#userLoginId").focus();
        } else {
            loginInfoCookie = decodeURIComponent(loginInfoCookie);
            if( loginInfoCookie.indexOf("userLoginId") > -1 ) {
                let loginInfo = JSON.parse(decodeURIComponent(loginInfoCookie));
                $("#userLoginId").val(loginInfo.userLoginId);
                $("#rememberId").prop("checked", true);
                $("#userPswd").focus();
            }
        }
        $("#login-box").show();
        $("#auth-box").hide();

        stopLoading();
    }
}

window.FH = FH;
FH.init();