import "/js/common/Toast.js?version=2025052101";
import "/js/modal/admin.js?version=2025010801";

// 관리자 - 관리자 계정 js
let _this;
const FH = {
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetAdminList();
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
                        header: "권한",
                        align: "center",
                        width: 160,
                        name: "wptlUserRoleNm"
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
                        }
                    },
                    {
                        header: "관리자 명",
                        align: "center",
                        width: 140,
                        name: "userNm",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        }
                    },
                    {
                        header: "활동 상태",
                        align: "center",
                        width: 120,
                        name: "wptlUserStNm"
                    },
                    {
                        header: "마지막 로그인",
                        align: "center",
                        width: 220,
                        name: "fnlLginDttm"
                    },
                    {
                        header: "업데이트 일시",
                        align: "center",
                        width: 220,
                        name: "sysUpdDttm"
                    }
                ],
                clickEventColumns : ["userLoginId", "userNm"],
                clickFunction : function (row) {
                    // 관리자 modal 열기 (js/modal/admin.js)
                    ADMIN.methods.openAdminModal("info", row.wptlUserNo);
                }
            })
            _this.methods.doGetAdminList();
        },
        /**
         * 관리자 계정 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetAdminList: async function (type = 1) {

            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/admin/user/doGetAdminList', params);
                return;
            }

            const params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(),                  // 검색 분류
                searchText: $("#searchText").val().trim(),           // 검색어
                searchActvStat: $("#searchActvStat").val(),          // 활동 상태
                searchDateType: $("#searchDateType").val(),          // 검색 기간 분류
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim()      // 검색 종료일
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/user/doGetAdminList', params);
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
        }
    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        Util.setDatePicker();
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();