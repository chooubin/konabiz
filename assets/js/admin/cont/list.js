import "/js/common/Toast.js?version=2025052101";

// 관리자 - 계약 현황 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetContList();
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
                        header: "계약번호",
                        align: "center",
                        width: 150,
                        name: "conSno",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        },
                    },
                    {
                        header: "회사명",
                        align: "center",
                        minWidth: 100,
                        name: "entpNm",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        },
                    },
                    {
                        header: "사업자등록번호",
                        align: "center",
                        width: 140,
                        name: "bzno",
                        formatter: function ({row, column, value}) {
                            return (Util.isEmpty(row.bzno) || row.bzno === "-")
                                    ? '-'
                                    : `${row.bzno.substring(0,3)}-${row.bzno.substring(3,5)}-${row.bzno.substring(5,10)}`;
                        }
                    },
                    {
                        header: "계약 상태",
                        align: "center",
                        width: 100,
                        name: "wptlEntpStNm"
                    },
                    {
                        header: "카드 발급 수",
                        align: "center",
                        width: 100,
                        name: "totalCrdIssue"
                    },
                      {
                        header: "제휴 채널",
                        align: "center",
                        width: 100,
                        name: "afcChnl",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) ? '-' : value
                        }
                    },
                     {
                        header: "도입비",
                        align: "center",
                        width: 100,
                        name: "intdnFee",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) ? '-' : value
                        }
                    },
                     {
                        header: "제작비",
                        align: "center",
                        width: 100,
                        name: "prodctChm",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) ? '-' : value
                        }
                    },
                    {
                        header: "메모",
                        align: "center",
                        width: 200,
                        name: "memoCn",
                        renderer: {
                            styles: {
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis"
                            }
                        },
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) ? '-' : value
                        }
                    },
                    {
                        header: "계약 신청일",
                        align: "center",
                        width: 140,
                        name: "aplyDt"
                    },
                    {
                        header: "계약 승인일",
                        align: "center",
                        width: 140,
                        name: "aprvDt"
                    }
                ],
                clickEventColumns : ["conSno", "entpNm"],
                clickFunction : function (row) {
                    // 계약 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/admin/cont/detail", { wptlEntpNo : row.wptlEntpNo});
                }
            })
            _this.methods.doGetContList();
        },
        /**
         * 계약 현황 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetContList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/admin/cont/doGetContList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(),                  // 검색 분류
                searchText: $("#searchText").val().trim(),           // 검색어
                searchContStat: $("#searchContStat").val(),          // 계약 상태
                searchDateType: $("#searchDateType").val(),          // 검색 기간 분류
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim()      // 검색 종료일
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/admin/cont/doGetContList', _this.params);
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
                Toast.methods.setScroll();
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