import "/js/common/Auth.js?version=2025010801";

// 회원가입 js
let _this;
const FH = {
    termsDetail: null,
    scrollWrap: $(".member-content"),
    validEl: $("#joinValid"),
    isCheckId: false,
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
         * 최신 약관 조회
         * @returns {Promise<void>}
         */
        getLatestTerms: async function () {
            const res = await ServiceExec.post('/api/terms/doGetLatestTerms');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.termsDetail = entity;
            } else {
                // switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    // default:
                    //     alert(message);
                    //     break;
                // }
            }
        },
        /**
         * 약관 modal 열기
         * @param modalType (서비스: svc, 개인정보: psnl)
         * @returns {Promise<void>}
         */
        openTermsModal: async function (modalType = "svc") {
            let params = {
                path: "modal/terms",
                htmlData: {
                    pageType: 'join',
                    modalType: modalType,
                    termsDetail: _this.termsDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#termsModal").length) $("#termsModal").remove();
            $("body").children("script").first().before(html);
            $("#termsModal").modal({show: true});
        },
        /**
         * 약관 modal - 약관 동의
         * @param type (서비스: svc, 개인정보: psnl)
         */
        doAgree: function (type) {
            $("#termsModal").modal({show: false}).remove();
            $("#" + type + "Prv").prop("checked", true);
        },
        /**
         * 아이디 중복 확인
         * @returns {Promise<void>}
         */
        doCheckDuplicateId: async function () {
            const params = {
                userLoginId: $("#userLoginId").val().trim() // 회원 ID
            }
            if (!_this.methods.duplicateIdValid(params)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doCheckDuplicateId', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.isCheckId = true;
                _this.validEl.html('<p class="blue2">사용 가능한 아이디입니다.</p>');
                Util.validCheck(_this.scrollWrap, _this.validEl);
                $("#userPswd").focus();
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1006 : 이미 등록된 아이디인 경우
                    case -1006:
                        Util.validCheck(_this.scrollWrap, _this.validEl, message, "p");
                        $("#userLoginId").focus();
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 아이디 중복 확인 유효성 체크
         * @param params
         * @returns {boolean}
         */
        duplicateIdValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.userLoginId)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "아이디를 입력해 주세요.", "p");
                return false;
            }
            const loginIdRegex = /^[A-Za-z0-9]{4,12}$/;
            if( !loginIdRegex.test(params.userLoginId) ) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "아이디는 영문, 숫자 조합 4자~12자로 입력해 주세요.", "p");
                return false;
            }

            // if (!Util.validEmail(params.userLoginId)) {
            //     Util.validCheck(_this.scrollWrap, _this.validEl, "아이디는 이메일 형식의 아이디를 입력해 주세요.", "p");
            //     return false;
            // }
            return true;
        },
        /**
         * 회원가입
         * @returns {Promise<void>}
         */
        doJoin: async function () {
            const params = {
                authToken: AUTH.authToken,                                                                 // 인증 토큰
                authCode: $("#authCode").val().trim(),                                                     // 인증 코드
                userLoginId: $("#userLoginId").val().trim(),                                               // 회원 ID
                userPswd: $("#userPswd").val().trim(),                                                     // 비밀번호
                userPswdChk: $("#userPswdChk").val().trim(),                                               // 비밀번호 확인
                userNm: $("#userNm").val().trim(),                                                         // 회원 이름
                userEmail: $("#userEmail").val().trim(),                                                   // 회원 이메일
                hpnmNo: $("#hpnmNo").data("realValue"),                                                    // 휴대폰 번호
                svcUAgrmPrvVerNo: !$("#svcPrv").is(":checked")                                             // 서비스 동의 여부
                                   ? ""
                                   : !Util.isEmpty(_this.termsDetail)
                                      ? _this.termsDetail.service.wptlPrvNo
                                      : "1", // 약관 데이터 조회 오류시 임의로 설정 (향후 로그인시 약관 동의 modal 노출)
                psnlUAgrmPrvVerNo: !$("#psnlPrv").is(":checked")                                           // 개인정보 동의 여부
                                    ? ""
                                    : !Util.isEmpty(_this.termsDetail)
                                       ? _this.termsDetail.privacy.wptlPrvNo
                                       : "1" // 약관 데이터 조회 오류시 임의로 설정 (향후 로그인시 약관 동의 modal 노출)
            }
            if (!_this.methods.joinValid(params)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doJoin', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                AUTH.methods.stopCountDown();
                $(".joinWrap").css("display", "none");
                $(".resultWrap").css("display", "block");
                _this.scrollWrap.scrollTop(0);
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1008 : 인증번호 불일치
                    case -1008:
                        Util.validCheck(_this.scrollWrap, _this.validEl, message, "p");
                        break;
                    // -1013 : 인증 세션 만료
                    // -1016 : 휴대폰 번호 중복
                    case -1013: case -1016:
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
         * 회원가입 유효성 체크
         * @param params
         * @returns {boolean}
         */
        joinValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.userLoginId)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "아이디를 입력해 주세요.", "p");
                return false;
            }
            const loginIdRegex = /^[A-Za-z0-9]{4,12}$/;
            if( !loginIdRegex.test(params.userLoginId) ) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "아이디는 영문, 숫자 조합 4자~12자로 입력해 주세요.", "p");
                return false;
            }
            if (!_this.isCheckId) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "아이디 중복확인을 클릭해 주세요.", "p");
                return false;
            }
            if (Util.isEmpty(params.userPswd)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "비밀번호를 입력해 주세요.", "p");
                return false;
            }
            if (!Util.validPassword(params.userPswd)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "비밀번호는 8~12자, 특수문자(!,@,#,$,%,* 만 사용 가능), 영문, 숫자를 포함해야 합니다.", "p");
                return false;
            }
            if (Util.isEmpty(params.userPswdChk)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "비밀번호를 확인해 주세요.", "p");
                return false;
            }
            if (params.userPswd !== params.userPswdChk) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "비밀번호가 일치하지 않습니다.", "p");
                return false;
            }
            if (Util.isEmpty(params.userNm)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "이름을 입력해 주세요.", "p");
                return false;
            }
            if (Util.isEmpty(params.userEmail)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "이메일을 입력해 주세요.", "p");
                return false;
            }
            if (!Util.validEmail(params.userEmail)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "이메일 형식이 입력 형식에 맞지 않습니다.", "p");
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
            if (Util.isEmpty(params.svcUAgrmPrvVerNo)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "서비스 이용 약관 동의 후 가입 가능합니다.", "p");
                return false;
            }
            if (Util.isEmpty(params.psnlUAgrmPrvVerNo)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "개인정보 수집 및 이용 동의 후 가입 가능합니다.", "p");
                return false;
            }
            if (AUTH.isSendAuth && AUTH.expired) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "인증번호 입력 시간을 초과하였습니다.", "p");
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
        _this.methods.getLatestTerms();
        $("#userLoginId").focus();
        stopLoading();
        alert("고객사 관리자 추가 계정 등록은 관리포탈의 [기업정보 > 운영자 등록] 메뉴를 통해 가능합니다.");
    }
}

window.FH = FH;
FH.init();