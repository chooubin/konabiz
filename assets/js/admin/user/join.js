import "/js/common/Toast.js?version=2025052101";

// 관리자 - 회원 가입 현황 js
let _this;
const FH = {
    params: {},
    userDetail: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetJoinList();
    },
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
            $(".table-box #searchType").on("change", function () {
                const type = $(this).val();
                FH.methods.changeSearchType(type);
                $(".table-box #searchText").val("");
                $(".table-box #searchText").data("realValue", "");
            });
        }
    },
    methods: {
        /**
         * 리스트 table 생성
         */
        setTable: function () {
            Toast.methods.setGrid({
                columns: [
                    {
                        header: "NO",
                        align: "center",
                        width: 100,
                        name: "rowKey",
                        formatter: function ({row, column, value}) {
                            return ((FH.page - 1) * FH.limit) + (row.rowKey + 1);
                            // 번호 역순으로 바인딩시
                            // return FH.virtualNum - row.rowKey;
                        }
                    },
                    {
                        header: "이름",
                        align: "center",
                        width: 100,
                        name: "userNm",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                            }
                        },
                        formatter: function({value}) {
                            if (value && value !== '-') {
                                return `<span style="text-decoration: underline;">${value}</span>`;
                            }
                            return value || '';
                        }
                    },
                    {
                        header: "아이디",
                        align: "center",
                        minWidth: 100,
                        name: "userLoginId",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        },
                    },
                    {
                        header: "휴대폰 번호",
                        align: "center",
                        width: 170,
                        name: "hpnmNo"
                    },
                    {
                        header: "이메일",
                        align: "center",
                        width: 170,
                        name: "userEmail"
                    },
                    {
                        header: "등록일시",
                        align: "center",
                        width: 120,
                        name: "sysCreDttm"
                    },
                    {
                        header: "마지막 로그인",
                        align: "center",
                        width: 120,
                        name: "fnlLginDttm"
                    },
                    {
                        header: "회사명",
                        align: "center",
                        minWidth: 100,
                        name: "entpNm"
                    },
                    {
                        header: "계약 상태",
                        align: "center",
                        width: 100,
                        name: "wptlEntpStNm"
                    },
                    {
                        header: "권한",
                        align: "center",
                        width: 100,
                        name: "wptlUserRoleNm"
                    },
                    {
                        header: "계정 상태",
                        align: "center",
                        width: 100,
                        name: "wptlUserStNm"
                    }

                ],
                clickEventColumns: ["userNm", "userLoginId"],
                clickFunction: function (row) {
                    // 회원정보 modal 열기 (js/common/index.js)
                    _this.methods.openUserModal("info", row.wptlUserNo);
                }
            })
            _this.methods.doGetJoinList();
        },
        /**
         * 회원 가입 현황 리스트 - 데이터 조회
         * @param type (리스트: 1, excel 다운: -1)
         * @returns {Promise<void>}
         */
        doGetJoinList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = {..._this.params};
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/admin/user/doGetJoinList', params);
                return;
            }
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(),                  // 검색 분류
                searchContStat: $("#searchContStat").val(),          // 계약 상태
                searchDateType: $("#searchDateType").val(),          // 검색 기간 분류
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim()      // 검색 종료일   
            }
            if (_this.params.searchType === "3") {
                _this.params.searchText = $("#searchText").data("realValue");
            } else {
                _this.params.searchText = $("#searchText").val().trim();
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/admin/user/doGetJoinList', _this.params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount
                $("#totalCount").text(_this.totalCount);
                _this.virtualNum = entity.virtualNum;

                Toast.grid.resetData(entity.list);
                Toast.methods.setPagination();
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
         * 회원 상세 modal 열기
         * @param modalType (상세: info, 수정: mod)
         * @param wptlUserNo (회원 시퀀스)
         * @returns {Promise<boolean>}
         */
        openUserModal: async function (modalType = "info", wptlUserNo, maskingType = "mask") {
            const params = {
                path: "modal/user",
                htmlData: {
                    modalType: modalType,
                    pageType: "all"
                }
            };
            switch (modalType) {
                case "info":
                    if (Util.isEmpty(wptlUserNo)) return;
                    let apiParams = {
                        targetWptlUserNo: Number(wptlUserNo),
                        unmaskYn: maskingType === "unmask" ? "Y" : "N"
                    }
                    const res = await ServiceExec.post('/api/account/doGetAcctInfo', apiParams);
                    _this.userDetail = res.entity;
                    params.htmlData.userDetail = _this.userDetail;
                    break;
                case "mod":
                    params.htmlData.userDetail = _this.userDetail;
                    break;
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#userModal").length) $("#userModal").remove();
            $("body").children("script").first().before(html);
            $("#userModal").modal({show: true});
            addEventListenerByElements($("#userModal .masking-input").get());
            $("#userModal .masking-input").each(function (idx, item) {
                item.dispatchEvent(new Event('input'));
            });
            inputUnmaskYn = "N";
        },
        /**
         * 정보 수정
         * @returns {Promise<boolean>}
         */
        doRedifyUser: async function () {
            const params = {
                targetWptlUserNo: _this.userDetail.wptlUserNo,                                                      // 회원 시퀀스
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
            const res = await ServiceExec.post('/api/account/doRedifyAcctInfo', params);
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
        changeSearchType: function (searchType) {
            if (searchType === "3") {
                $(".table-box #searchText").attr("maxlength", "11");
                $(".table-box #searchText").attr("data-masking-type", "PHONE_NUMBER_ONLY");
            } else {
                $(".table-box #searchText").removeAttr("maxlength");
                $(".table-box #searchText").removeAttr("data-masking-type");
            }
        },
        doRemoveUser: async function (wptlUserNo = "") {
            if (Util.isEmpty(wptlUserNo)) return;
            const targetWptlUserNo = Number(wptlUserNo); // 회원 시퀀스

            if (!confirm("계정의 아이디,이름,이메일,휴대폰 번호가 초기화되며 계정은 다시 활성화활 수 없습니다. 계속 진행하시겠습니까?")) return;
            // console.log(params);
            const params = {};
            const res = await ServiceExec.post(`/common/user-remove/${targetWptlUserNo}`);
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));

            $("#userModal").modal({show: false}).remove();
            _this.methods.doGetJoinList();

        }
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker();
        Toast.methods.getListInfo(FH.methods.setTable);

        const searchType = $("#searchType").val();
        FH.methods.changeSearchType(searchType);
    }
}

window.FH = FH;
FH.init();