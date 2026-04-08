import "/js/common/Toast.js?version=2025052101";

// 관리자 - 개인정보 사용 내역 js
let _this;
const FH = {
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetPnslInfoInquiryList();
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
                        header: "사용일시",
                        align: "center",
                        width: 120,
                        name: "sysCreDttm"
                    },
                    {
                        header: "사용자명",
                        align: "center",
                        width: 100,
                        name: "userNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.userNm);
                        }
                    },
                    {
                        header: "아이디",
                        align: "center",
                        minWidth: 100,
                        name: "userLoginId",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.userLoginId);
                        }
                    },
                    {
                        header: "권한",
                        align: "center",
                        width: 140,
                        name: "wptlUserRoleNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.wptlUserRoleNm);
                        }
                    },
                    {
                        header: "회사명",
                        align: "center",
                        minWidth: 100,
                        name: "entpNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.entpNm);
                        }
                    },
                    {
                        header: "사용 분류",
                        align: "center",
                        width: 100,
                        name: "inqTypeNm"
                    },
                    {
                        header: "서비스 화면",
                        align: "center",
                        width: 170,
                        name: "scrnNm"
                    },
                    {
                        header: "접속 IP",
                        align: "center",
                        width: 180,
                        name: "cnntIpAddr",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.cnntIpAddr);
                        }
                    }
                ],
            })
            _this.methods.doGetPnslInfoInquiryList();
        },
        /**
         * 개인정보 사용 내역 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetPnslInfoInquiryList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/admin/personal/doGetPnslInfoInquiryList', params);
                return;
            }
            const params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(),                  // 검색 분류
                searchText: $("#searchText").val().trim(),           // 검색어
                wptlUserRoleCd: $("#wptlUserRoleCd").val(),          // 관리자 권한
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일 (활동 기간)
                searchEndDate: $("#searchEndDate").val().trim()      // 검색 종료일 (활동 기간)
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/personal/doGetPnslInfoInquiryList', params);
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