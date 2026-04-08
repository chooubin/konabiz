import "/js/common/Toast.js?version=2025052101";

// 관리자 - 상품 관리 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetProductList();
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
                        header: "회사명",
                        align: "center",
                        minWidth: 180,
                        name: "entpNm"
                    },
                    {
                        header: "상품 코드",
                        align: "center",
                        width: 210,
                        name: "prdId",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        },
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) ? '-' : value
                        }
                    },
                    {
                        header: "상품명",
                        align: "center",
                        minWidth: 100,
                        name: "prdNm",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        }
                    },
                    {
                        header: "상품 유형",
                        align: "center",
                        width: 190,
                        name: "wptlPrdTypeNm"
                    },
                    {
                        header: "상품 가격",
                        align: "center",
                        width: 100,
                        name: "prdSllUprcCm"
                    },
                    {
                        header: "주문 단위",
                        align: "center",
                        width: 100,
                        name: "prdOrdUntCm"
                    },
                    {
                        header: "약관여부",
                        align: "center",
                        width: 100,
                        name: "tcYn"
                    },
                    {
                        header: "KB변환코드",
                        align: "center",
                        width: 130,
                        name: "kbSvcCd"
                    },
                    {
                        header: "경비 관리",
                        align: "center",
                        width: 100,
                        name: "xpnPrcsLnkYn"
                    },
                    {
                        header: "카드 유형",
                        align: "center",
                        width: 100,
                        name: "wptlPrdCrdTypeNm"
                    },
                    {
                        header: "주문제한",
                        align: "center",
                        width: 100,
                        name: "crdOrdRstYn"
                    },
                    {
                        header: "카드 속성",
                        align: "center",
                        width: 100,
                        name: "prdCrdPrpt"
                    },
                    {
                        header: "운영 회사 수",
                        align: "center",
                        width: 120,
                        name: "prdEntpCnt"
                    },
                    {
                        header: "등록 일시",
                        align: "center",
                        width: 120,
                        name: "sysCreDttm"
                    },
                    {
                        header: "업데이트 일시",
                        align: "center",
                        width: 120,
                        name: "sysUpdDttm"
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
                        }
                    }
                ],
                clickEventColumns : ["prdId", "prdNm"],
                clickFunction : function (row) {
                    // 상품 관리 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/admin/product/detail", { wptlPrdNo : row.wptlPrdNo});
                }
            })
            _this.methods.doGetProductList();
        },
        /**
         * 상품 관리 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                ServiceExec.downPost('/api/admin/product/doGetProductList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(),                  // 검색 분류
                searchText: $("#searchText").val().trim(),           // 검색어
                searchProductType: $("#searchProductType").val(),    // 상품 유형
                searchDateType: $("#searchDateType").val(),          // 검색 기간 분류
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim()      // 검색 종료일
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/admin/product/doGetProductList', _this.params);
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