import "/js/common/Toast.js?version=2025052101";

// 관리자 - 상품 신청 관리 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetApplyProductList();
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
            // "충전포인트", "사용포인트" cell 조회 확인 버튼 customRenderer
            class CustomRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                    let status = props.grid.getValue(props.rowKey, "wptlPrdStCd");
                    let el;
                    if (status === ConstCode.CODES_PRODUCT.PRD_ST_TYPE.APPROVAL_REQUEST || status === ConstCode.CODES_PRODUCT.PRD_ST_TYPE.UNDER_DESIGN) {
                        el = document.createElement("a");
                        el.className = "label";
                        el.style.cursor = "pointer";
                        el.appendChild(document.createTextNode("삭제"))

                        el.addEventListener("click", (ev) => {
                            ev.preventDefault();
                            FH.methods.doRemoveProduct(props.grid.getValue(props.rowKey, "wptlPrdNo"));
                        });
                    } else {
                        let value = Util.isEmpty(props.value) ? "-" : props.value;
                        el = document.createElement("div");
                        el.className = "tui-grid-cell-content";
                        el.appendChild(document.createTextNode(String(value)));
                    }
                    this.el = el;
                }
            }
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
                        header: "상품 신청 번호",
                        align: "center",
                        width: 160,
                        name: "prdSno",
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
                        name: "entpNm",
                        minWidth: 180
                    },
                    {
                        header: "상품 코드",
                        align: "center",
                        name: "prdId",
                        minWidth: 200,
                        formatter: function ({row, column, value}) {
                            return ["사용중", "승인완료", "디자인 확정"].includes(row.wptlPrdStNm) ? value : '-';
                        }
                    },
                    {
                        header: "신청 상품명",
                        align: "center",
                        name: "prdNm",
                        minWidth: 200
                    },
                    {
                        header: "상품유형",
                        align: "center",
                        width: 170,
                        name: "wptlPrdTypeNm"
                    },
                    {
                        header: "발급유형",
                        align: "center",
                        width: 140,
                        name: "mbRltgCrdDvNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(value);
                        }
                    },
                    {
                        header: "카드유형",
                        align: "center",
                        width: 100,
                        name: "wptlPrdCrdTypeNm"
                    },
                    {
                        header: "카드 이름 표기",
                        align: "center",
                        width: 160,
                        name: "wlpoCrdNmWrteTypeNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(value);
                        }
                    },
                    {
                        header: "디자인",
                        align: "center",
                        width: 120,
                        name: "wptlCrdDsgTypeNm"
                    },
                    {
                        header: "신청자명",
                        align: "center",
                        width: 120,
                        name: "userNm"
                    },
                    {
                        header: "상태",
                        align: "center",
                        width: 100,
                        name: "wptlPrdStNm"
                    },
                    {
                        header: "상품 신청일",
                        align: "center",
                        width: 140,
                        name: "sysCreDttm"
                    },
                    {
                        header: "사용 시작일",
                        align: "center",
                        width: 140,
                        name: "dsgFileCfmDttm"
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
                    },
                    {
                        header: "삭제",
                        align: "center",
                        width: 140,
                        name: "delDttm",
                        renderer: CustomRenderer
                    }
                ],
                clickEventColumns : ["prdSno"],
                clickFunction : function (row) {
                    // 상품 신청 관리 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/admin/product/request/detail", { wptlPrdNo : row.wptlPrdNo});
                }
            })
            _this.methods.doGetApplyProductList();
        },
        /**
         * 상품 신청 관리 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetApplyProductList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/admin/product/doGetApplyProductList', params);
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
                searchEndDate: $("#searchEndDate").val().trim(),     // 검색 종료일
                searchStatus: $("#searchStatus").val()               // 상품 신청 상태   
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/admin/product/doGetApplyProductList', _this.params);
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
        },
        /**
         * 상품 삭제
         * (디자인중 상태의 상품일 경우만 삭제)
         * @returns {Promise<void>}
         */
        doRemoveProduct: async function (wptlPrdNo) {
            let params = {
                wptlPrdNo: Number(wptlPrdNo) // 상품 시퀀스
            }
            if (!confirm("상품을 삭제하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/product/doRemoveProduct', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("상품이 삭제되었습니다.");
                await _this.methods.doGetApplyProductList();
            } else {
                switch (code) {
                    case -6001:
                        alert(message);
                        await _this.methods.doGetApplyProductList();
                        break;
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