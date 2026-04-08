// 관리자 modal js
// let _this;
const ADMIN = {
    scrollWrap: null,
    validEl: null,
    isCheckId: false,
    adminDetail: {},
    events: {
        /**
         * key 이벤트
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
         * 관리자 modal 열기
         * @param modalType (등록: reg, 수정: mod, 상세: info)
         * @param wptlUserNo (회원 시퀀스)
         * @returns {Promise<void>}
         */
        openAdminModal: async function (modalType = "reg", wptlUserNo = "", maskingType = "mask") {
            let params = {
                path: "modal/admin",
                htmlData: {
                    modalType: modalType
                }
            };
            switch (modalType) {
                case "info":
                    ADMIN.adminDetail = {};
                    if (!Util.isEmpty(wptlUserNo)) {
                        let apiParams = {
                            targetWptlUserNo : Number(wptlUserNo),
                            unmaskYn: maskingType === "unmask" ? "Y" : "N"
                        }
                        const res = await ServiceExec.post('/api/account/doGetAcctInfo', apiParams);
                        ADMIN.adminDetail = res.entity;
                    }
                    params.htmlData.adminDetail = ADMIN.adminDetail;
                    break;
                case "mod":
                    if (Util.isEmpty(ADMIN.adminDetail)) return;
                    params.htmlData.adminDetail = ADMIN.adminDetail;
                    break;
                case "reg":
                    ADMIN.isCheckId = false;
                    break;
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#adminModal").length) $("#adminModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#adminModal").modal({show: true});
            addEventListenerByElements( $("#adminModal .masking-input").get() );
            $("#adminModal .masking-input").each( function(idx, item) {
                item.dispatchEvent( new Event('input') );
            });
        },
        /**
         * 등록시 - 아이디 중복 확인
         * @returns {Promise<void>}
         */
        doChkDuplAdminId: async function () {
            const params = {
                userLoginId : $("#userLoginId").val().trim() // 회원 ID
            }
            if (!ADMIN.methods.duplAdminId(params)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/user/doChkDuplAdminId', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                ADMIN.isCheckId = true;
                ADMIN.validEl.html('<span class="blue2">사용 가능한 아이디입니다.</span>');
                Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl);
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1006 : 이미 등록된 아이디인 경우
                    case -1006:
                        Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, message);
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 등록시 - 아이디 중복 확인 유효성 체크
         * @param params
         * @returns {boolean}
         */
        duplAdminId: function (params) {
            ADMIN.validEl.html("");
            if (Util.isEmpty(params.userLoginId)) {
                Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "아이디를 입력해 주세요.");
                return false;
            }
            const loginIdRegex = /^[A-Za-z0-9]{4,12}$/;
            if( !loginIdRegex.test(params.userLoginId) ) {
                Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "아이디는 영문, 숫자 조합 4자~12자로 입력해 주세요.", "p");
                return false;
            }
            return true;
        },
        /**
         * 관리자 등록/수정
         * @param modalType (등록: reg, 수정: mod)
         * @param wptlUserNo (회원 시퀀스)
         * @returns {Promise<void>}
         */
        doRedifyAdminUser: async function (modalType = "reg", wptlUserNo = "") {
            const params = {
                wptlUserDvCd: ConstCode.CODES_MEMBER_ACCOUNT.TYPE.ADMIN,                       // 회원 타입 (관리자)
                targetWptlUserNo: !Util.isEmpty(wptlUserNo) ? Number(wptlUserNo) : "",         // 회원 시퀀스
                userNm: $("#userNm").val().trim(),                                             // 회원 이름
                userLoginId: $("#userLoginId").val().trim(),                                   // 회원 ID
                userEmail: $("#userEmail").val().trim(),                                       // 이메일 주소
                hpnmNo: $("#hpnmNo").data("realValue"),                                        // 휴대폰 번호
                userPswd: $("#userPswd").val().trim(),                                         // 비밀번호
                userPswdChk: $("#userPswdChk").val().trim(),                                   // 비밀번호 확인
                wptlUserRoleCd: $("#adminModal [name=wptlUserRoleCd]:checked").val(),          // 관리자 권한
                wptlUserStCd: $("#adminModal [name=wptlUserStCd]:checked").val(),              // 계정 상태
                psnlInfoRdngPsnblYn: $("#adminModal [name=psnlInfoRdngPsnblYn]:checked").val() // 개인정보 조회
            }
            if (!ADMIN.methods.adminValid(modalType, params)) return;
            if (!confirm("관리자 정보를 등록하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doRedifyAcctInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("관리자 정보를 등록했습니다.");
                $("#adminModal").modal({show: false}).remove();
                // 관리자 리스트 갱신
                if (modalType === "reg") FH.page = 1;
                FH.getList();
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
         * 등록/수정시 - 관리자 등록/수정 유효성 체크
         * @param modalType (등록: reg, 수정: mod)
         * @param params
         * @returns {boolean}
         */
        adminValid: function (modalType, params) {
            ADMIN.validEl.html("");
            if (Util.isEmpty(params.userNm)) {
                Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "이름을 입력해 주세요.");
                return false;
            }
            // 등록일때 아이디 체크
            if (modalType === "reg") {
                if (Util.isEmpty(params.userLoginId)) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "아이디를 입력해 주세요.");
                    return false;
                }
                if (!ADMIN.isCheckId) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "아이디 중복확인을 클릭해 주세요.");
                    return false;
                }
            }
            if (Util.isEmpty(params.userEmail)) {
                Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "이메일을 입력해 주세요.");
                return false;
            }
            if (!Util.validEmail(params.userEmail)) {
                Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "이메일 형식이 입력 형식에 맞지 않습니다.");
                return false;
            }
            // Phase60.0 삭제예정
            // if (Util.isEmpty(params.admnEmailAddr)) {
            //     Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "이메일을 입력해 주세요.");
            //     return false;
            // }
            // if (!Util.validEmail(params.admnEmailAddr)) {
            //     Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "이메일이 입력 형식에 맞지 않습니다.");
            //     return false;
            // }
            if (Util.isEmpty(params.hpnmNo)) {
                Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "휴대폰 번호를 입력해 주세요.");
                return false;
            }
            // if (!Util.validPhone(params.hpnmNo.replaceAll("-", ""))) {
            //     Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "올바른 휴대폰 번호를 입력해 주세요.");
            //     return false;
            // }
            // 등록일때 비밀번호 체크
            if (modalType === "reg") {
                if (Util.isEmpty(params.userPswd)) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "비밀번호를 입력해 주세요.");
                    return false;
                }
                if (!Util.validPassword(params.userPswd)) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "비밀번호는 8~12자, 특수문자(!,@,#,$,%,* 만 사용 가능), 영문, 숫자를 포함해야 합니다.");
                    return false;
                }
                if (Util.isEmpty(params.userPswdChk)) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "비밀번호를 확인해 주세요.");
                    return false;
                }
                if (params.userPswd !== params.userPswdChk) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "비밀번호가 일치하지 않습니다.");
                    return false;
                }
            }
            // 본인계정 수정일때 비밀번호 체크
            if (modalType === "mod") {
                if (Util.isEmpty(params.userPswd) && !Util.isEmpty(params.userPswdChk)) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "비밀번호를 입력해 주세요.");
                    return false;
                }
                if (!Util.isEmpty(params.userPswd) && !Util.validPassword(params.userPswd)) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "비밀번호는 8~12자, 특수문자(!,@,#,$,%,* 만 사용 가능), 영문, 숫자를 포함해야 합니다.");
                    return false;
                }
                if (!Util.isEmpty(params.userPswd) && Util.isEmpty(params.userPswdChk)) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "비밀번호를 확인해 주세요.");
                    return false;
                }
                if (params.userPswd !== params.userPswdChk) {
                    Util.validCheck(ADMIN.scrollWrap, ADMIN.validEl, "비밀번호가 일치하지 않습니다.");
                    return false;
                }
            }
            return true;
        },
        unmaskingPage: function() {
            $(".masking-input").each( function(idx, item) {
                $(item).val( $(item).data("realValue") );
            });
        }
    },
    init: function () {
        // _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
    }
}

window.ADMIN = ADMIN;
ADMIN.init();