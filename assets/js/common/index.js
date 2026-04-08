import ServiceExec from "./ServiceExec.js";
import ConstCode from "./ConstCode.js";
// tutorial removed;

// 공통 js
// let _this;
const CM = {
    loginCountInterval: null,
    userDetail: null,
    searchEnptList: [{
        entpNm: "",
        wptlEntpNo: "",
        wptlUserNo: ""
    }],
    events: {
        // /**
        //  * key 이벤트
        //  */
        // keyEvent: function () {
        // },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            // 우측 하단 - Top 버튼 클릭시
            $(".btn-top").on("click", function (){
                $(".admin .content").animate({
                    scrollTop:0
                },300);
                return false;
            })
            // 관리자 로그인시 - 상단 기업 검색, 선택 클릭시
            $(".admin .header .left .top-search .box > a").on("click", function (){
                $(this).parent().addClass("active").siblings().removeClass("active");
                return false;
            })
            // modal 닫을때 modal element 제거
            $(document).on("click", '.modal [data-dismiss="modal"]', function() {
                $(this).closest(".modal").remove();
                return false;
            })
        },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            // 관리자 로그인시 - 상단 기업 검색 - 자동완성기능
            $(".admin .header .left .top-search .box .srch-box .inp").autoComplete({
                minChars: 1,
                autoFocus: true,
                cache: false,
                delay: 300,
                source: function (term, suggest) {
                    term = term.toLowerCase();
                    let suggestions = [];
                    for (let i = 0; i < CM.searchEnptList.length; i++) {
                        if (~CM.searchEnptList[i].entpNm.toLowerCase().indexOf(term)) {
                            suggestions.push({
                                entpNm: CM.searchEnptList[i].entpNm,
                                wptlEntpNo: CM.searchEnptList[i].wptlEntpNo
                            });
                        }
                    }
                    suggest(suggestions);
                },
                renderItem: function (item, search){
                    // escape special characters
                    search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
                    return '<div class="autocomplete-suggestion" data-val="' + item.entpNm + '">' + item.entpNm.replace(re, "<b>$1</b>") + '</div>';
                },
                onSelect: function (e, term, item) {
                }
            })
        }
    },
    methods: {
        /* ---------------------------------------- 로그인 계정 관련 start ---------------------------------------- */
        /**
         * 로그인 만료 시간 카운트
         * @returns {boolean}
         */
        expireCount: function () {
            if (CM.loginCountInterval !== null) clearInterval(CM.loginCountInterval);
            let expiredTime = 30 * 60;
            const sessionCount = () => {
                // let expiredTime = Math.floor((new Date(KSM.sessionExpiredTime).getTime() - new Date().getTime()) / 1000);
                if (expiredTime > 0) {
                    let minutes = parseInt(expiredTime / 60);
                    minutes = minutes < 10 ? "0" + minutes : minutes
                    let seconds = Math.round(((expiredTime / 60) - minutes) * 60);
                    seconds = seconds < 10 ? "0" + seconds : seconds
                    $("#expireTime").text(minutes + ":" + seconds);
                    $("#expireTime").closest(".time").css("visibility", "visible");
                    expiredTime--;
                } else {
                    CM.methods.doLogout();
                }
            }
            sessionCount();
            CM.loginCountInterval = setInterval(sessionCount, 1000);
        },
        /**
         * 로그인 세션 연장
         * @returns {Promise<void>}
         */
        doExtendSessionExpiredTime: async function () {
            const res = await ServiceExec.post('/api/account/doExtendSessionExpiredTime');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                KSM = entity;
                CM.methods.expireCount();
                // window.location.reload();
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
         * 계정 로그아웃
         * @returns {Promise<boolean>}
         */
        doLogout: async function () {
            const res = await ServiceExec.post('/api/account/doLogout');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                Util.replace("/account/login");
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
        /* ---------------------------------------- 로그인 계정 관련 end ---------------------------------------- */

        /* ---------------------------------------- my 정보, 회원 상세 관련 start ---------------------------------------- */
        /**
         * my 정보, 회원 상세 modal 열기
         * @param modalType (상세: info, 수정: mod)
         * @param wptlUserNo (회원 시퀀스)
         * @returns {Promise<boolean>}
         */
        openUserModal: async function (modalType = "info", wptlUserNo = KSM.wptlUserNo, maskingType="mask") {
            const params = {
                path: "modal/user",
                htmlData: {
                    modalType: modalType,
                    pageType: "myself"
                }
            };
            switch (modalType) {
                case "info":
                    if (Util.isEmpty(wptlUserNo)) return;
                    let apiParams = {
                        targetWptlUserNo : Number(wptlUserNo),
                        unmaskYn: maskingType === "unmask" ? "Y" : "N"
                    }
                    const res = await ServiceExec.post('/api/account/doGetAcctSelfInfo', apiParams);
                    CM.userDetail = res.entity;
                    params.htmlData.userDetail = CM.userDetail;
                    break;
                case "mod":
                    params.htmlData.userDetail = CM.userDetail;
                    break;
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#userModal").length) $("#userModal").remove();
            $("body").children("script").first().before(html);
            $("#userModal").modal({show: true});
            addEventListenerByElements( $("#userModal .masking-input").get() );
            $("#userModal .masking-input").each( function(idx, item) {
                item.dispatchEvent( new Event('input') );
            });
            inputUnmaskYn = "N";
        },
        /**
         * my 정보 수정
         * @returns {Promise<boolean>}
         */
        doRedifyUser: async function () {
            const params = {
                targetWptlUserNo: KSM.wptlUserNo,                                                      // 회원 시퀀스
                userNm: $("#userModal #userNm").val().trim(),                                          // 회원 이름
                userEmail: $("#userModal #userEmail").val().trim(),                                    // 사용자 이메일
                hpnmNo: $("#userModal #hpnmNo").data("realValue"),                                     // 휴대폰 번호
                userPswd: $("#userModal #userPswd").val().trim(),                                      // 비밀번호
                userPswdChk: $("#userModal #userPswdChk").val().trim(),                                // 비밀번호 확인
            }
            if (KSM.wptlUserRoleCd === ConstCode.CODES_MEMBER_ACCOUNT.ROLE.MANAGEMENT ||
                 KSM.wptlUserRoleCd === ConstCode.CODES_MEMBER_ACCOUNT.ROLE.SYSTEM) {
                params.wptlUserRoleCd = $("#userModal [name=wptlUserRoleCd]:checked").val();           // 권한 (운영자, 관리자)
                params.wptlUserStCd = $("#userModal [name=wptlUserStCd]:checked").val();               // 계정 상태
                params.psnlInfoRdngPsnblYn = $("#userModal [name=psnlInfoRdngPsnblYn]:checked").val(); // 개인정보 조회
            }
            const $scrollWrap = $("#userModal .modal-body");
            const $validEl = $("#userModal .modal-body .modal-title1 small");
            if (!CM.methods.userValid($scrollWrap, $validEl, params)) return false;
            if (!confirm("회원 정보를 수정하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.post('/api/account/doRedifyAcctSelfInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("회원 정보를 수정했습니다.");
                $("#userModal").modal({show: false}).remove();
                window.location.reload();
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1016: 이미 등록된 휴대폰 번호인 경우
                    case -1016:
                        Util.validCheck($scrollWrap, $validEl, message);
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * my 정보 수정 유효성 체크
         * @param $scrollWrap
         * @param $validEl
         * @param params
         * @returns {boolean}
         */
        userValid: function ($scrollWrap, $validEl, params) {
            $validEl.html("");
            if (Util.isEmpty(params.userNm)) {
                Util.validCheck($scrollWrap, $validEl, "이름을 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.userEmail)) {
                Util.validCheck($scrollWrap, $validEl, "이메일을 입력해 주세요.");
                return false;
            }
            if (!Util.validEmail(params.userEmail)) {
                Util.validCheck($scrollWrap, $validEl, "이메일 형식이 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (Util.isEmpty(params.hpnmNo)) {
                Util.validCheck($scrollWrap, $validEl, "휴대폰 번호를 입력해 주세요.");
                return false;
            }
            // if (!Util.validPhone(params.hpnmNo.replaceAll("-", ""))) {
            //     Util.validCheck($scrollWrap, $validEl, "올바른 휴대폰 번호를 입력해 주세요.");
            //     return false;
            // }
            if (Util.isEmpty(params.userPswd) && !Util.isEmpty(params.userPswdChk)) {
                Util.validCheck($scrollWrap, $validEl, "비밀번호를 입력해 주세요.");
                return false;
            }
            if (!Util.isEmpty(params.userPswd) && !Util.validPassword(params.userPswd)) {
                Util.validCheck($scrollWrap, $validEl, "비밀번호가 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (!Util.isEmpty(params.userPswd) && Util.isEmpty(params.userPswdChk)) {
                Util.validCheck($scrollWrap, $validEl, "비밀번호를 확인해 주세요.");
                return false;
            }
            if (params.userPswd !== params.userPswdChk) {
                Util.validCheck($scrollWrap, $validEl, "비밀번호가 일치하지 않습니다.");
                return false;
            }
            return true;
        },
        /**
         * 회원, 기업 운영자, 관리자 비밀번호 초기화
         * @param modalType (회원: user, 기업 운영자: sysUser, 관리자: admin)
         * @param wptlUserNo (회원 시퀀스)
         * @returns {Promise<void>}
         */
        doResetUserPswd: async function (modalType, wptlUserNo = "") {
            if (Util.isEmpty(wptlUserNo)) return;
            const params = {
                targetWptlUserNo: Number(wptlUserNo) // 회원 시퀀스
            }
            if (!confirm("비밀번호를 초기화 하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/account/doResetUserPswd', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if (modalType === "user") {
                    alert("회원 이메일로 임시 비밀번호를 발송하였습니다.");
                } else {
                    alert("임시 비밀번호를 이메일로 발송하였습니다.");
                    if (modalType === "sysUser") $("#sysUserModal").modal({show: false}).remove();
                    if (modalType === "admin") $("#adminModal").modal({show: false}).remove();
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
        unmaskingPage: function() {
            inputUnmaskYn = "Y";
            $(".masking-input").each( function(idx, item) {
                $(item).val( $(item).data("realValue") );
            });
        },
        /* ---------------------------------------- my 정보, 회원 상세 관련 end ---------------------------------------- */

        /* ---------------------------------------- 관리자 기업정보 관련 start ---------------------------------------- */
        /**
         * 기업 리스트 - 데이터 조회
         * (관지자 상단 검색용)
         * @returns {Promise<boolean>}
         */
        doGetEntpList: async function () {
            const params = {
                prdId: "",
                searchText: ""
            }
            // console.log(params);
            const res = await ServiceExec.post('/common/doGetEntpList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                CM.searchEnptList = entity;
                const $topEntpSelect = $("#topEntpSelect");
                let isSession = !Util.isEmpty(KSM.targetWptlEntpNo);
                $topEntpSelect.css("color", isSession? "#4c5970" : "#adb2be");
                let html = '<option value="">' + "회사명을 선택해 주세요." + '</option>';
                for (let i = 0; i < CM.searchEnptList.length; i++) {
                    html += '<option value="' + CM.searchEnptList[i].wptlEntpNo + '" ' + (KSM.targetWptlEntpNo === CM.searchEnptList[i].wptlEntpNo ? "selected" : "") + '>' + CM.searchEnptList[i].entpNm + '</option>'
                }
                $topEntpSelect.html(html);
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
         * 관리자 검색용 - 기업 회원 세션 생성
         * @param type (검색창: search, 셀렉트박스: select)
         * @returns {Promise<void>}
         */
        doMakeTargetSession: async function (type) {
            const params = {
                targetEntpNm: "",
                targetWptlEntpNo: "",
                targetWptlUserNo: ""
            }
            let entpItem = null;
            switch (type) {
                case "search":
                    let entpNm = $("#topEntpSearch").val();
                    entpItem = CM.searchEnptList.find(item => item.entpNm === entpNm)
                    if (Util.isEmpty(entpItem)) {
                        alert("존재하지 않는 회사명입니다.\n다시 입력해 주세요.");
                        return false;
                    }
                    break;
                case "select":
                    const $topEntpSelect = $("#topEntpSelect");
                    let isEmpty = Util.isEmpty($topEntpSelect.val());
                    let entpNo = isEmpty ? "" : Number($topEntpSelect.val());
                    $topEntpSelect.css("color", isEmpty ? "#adb2be" : "#4c5970");
                    entpItem = CM.searchEnptList.find(item => item.wptlEntpNo === entpNo)
                    break;
            }
            if (!Util.isEmpty(entpItem)) {
                params.targetEntpNm = entpItem.entpNm;
                params.targetWptlEntpNo = entpItem.wptlEntpNo;
                params.targetWptlUserNo = entpItem.wptlUserNo;
            }
            // console.log(params);
            const res = await ServiceExec.post('/common/doMakeTargetSession', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                Util.deleteCookie("listInfo");
                if (Util.isEmpty(params.targetWptlEntpNo)) {
                    Util.replace("/main/dashboard")
                } else {
                    window.location.reload();
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
        /* ---------------------------------------- 관리자 기업정보 관련 end ---------------------------------------- */
    },
    init: function () {
        // _this = this;
        for (let eventFunc in CM.events) {
            CM.events[eventFunc]();
        }
        if (KSM.wptlUserDvCd === ConstCode.CODES_MEMBER_ACCOUNT.TYPE.ADMIN) CM.methods.doGetEntpList();
        inputUnmaskYn = "N";
    }
}

export default CM
CM.init();
