import "/js/common/Toast.js?version=2025052101";

// 카드 주문 관리 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetCardOrderList();
    },
    cardOrderListProperty: null,
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
         * 카드 주문 내역 리스트 (기타정보) - 데이터 조회 (최근 3개월 주문 현황)
         * @returns {Promise<void>}
         */
        doGetCardOrderListProperty: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doGetCardOrderListProperty', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            const wptlPrdNo = !Util.isEmpty(_this.params.searchProductNo) ? Number(_this.params.searchProductNo) : "";
            let html = '<option value="" ' + (wptlPrdNo === "" ? "selected" : "")+ '>전체</option>';
            if (code === 1) {
                _this.cardOrderListProperty = entity;
                if (!Util.isEmpty(_this.cardOrderListProperty) && !Util.isEmpty(_this.cardOrderListProperty.filterOrderProductList)) {
                    for (let i = 0; i < _this.cardOrderListProperty.filterOrderProductList.length; i++)
                        html += '<option value="' + _this.cardOrderListProperty.filterOrderProductList[i].wptlPrdNo + '" ' +
                            (_this.cardOrderListProperty.filterOrderProductList[i].wptlPrdNo === wptlPrdNo ? "selected" : "") + '>' +
                            _this.cardOrderListProperty.filterOrderProductList[i].prdNm + '</option>';
                }
                _this.methods.getPageContent();
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
            $("#searchProductNo").html(html);
        },
        /**
         * 카드 주문 내역 리스트 (기타정보) - 내용 페이지 호출 (최근 3개월 주문 현황)
         * @returns {Promise<void>}
         */
        getPageContent: async function () {
            const params = {
                path: "card/order/list_recent",
                htmlData: {
                    cardOrderListProperty: _this.cardOrderListProperty
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $("#recentOrderWrap").html(html);
        },
        /**
         * swiper 생성 - 디자인 완료 리스트 (제작 요청)
         */
        setSwiper: function () {
            $(".card-choice-list").each(function (index, item) {
                new Swiper($(item).find(".swiper-container"), {
                    navigation: {
                        nextEl: $(item).find(".swiper-button-next"),
                        prevEl: $(item).find(".swiper-button-prev"),
                    },
                    slidesPerView: "auto",
                    spaceBetween: 25,
                });
            })
        },
        /**
         * 리스트 table 생성
         */
        setTable: function () {
            // "주문상태" cell 수령확인 버튼 customRenderer
            class CustomRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;
                    let el;
                    if(props.columnInfo.name === "wptlCrdOrdrStCd") {
                        if (props.value === ConstCode.CODES_CARD.ORDER_STATUS.SHIPPING) {
                            el = document.createElement("a");
                            el.className = "label";
                            el.style.cursor = "pointer";
                            el.appendChild(document.createTextNode("수령 확인"))

                            el.addEventListener("click", (ev) => {
                                ev.preventDefault();
                                FH.methods.doConfirmDelivery(rowKey);
                            })
                        } else {
                            el = document.createElement("div");
                            el.className = "tui-grid-cell-content";
                            el.appendChild(document.createTextNode(grid.getValue(rowKey, "wptlCrdOrdrStNm")));

                        }
                    } else if(props.columnInfo.name === "ordrCnclDttm") {
                        let status = props.grid.getValue(props.rowKey, "wptlCrdOrdrStCd");

                        if (status === ConstCode.CODES_CARD.ORDER_STATUS.APPLY_COMPLETE || status === ConstCode.CODES_CARD.ORDER_STATUS.PAYMENT_COMPLETE) {
                            el = document.createElement("a");
                            el.className = "label";
                            el.style.cursor = "pointer";
                            el.appendChild(document.createTextNode("주문 취소"))

                            el.addEventListener("click", (ev) => {
                                ev.preventDefault();
                                FH.methods.doCancelOrderCard(props.grid.getValue(props.rowKey, "wptlCrdOrdrNo"));
                            });
                        } else {
                            let value = Util.isEmpty(props.value) ? "-" : props.value;
                            el = document.createElement("div");
                            el.className = "tui-grid-cell-content";
                            el.appendChild(document.createTextNode(String(value)));
                        }
                    }
                    this.el = el;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                    if (props.columnInfo.name === "wptlCrdOrdrStCd" && props.value !== ConstCode.CODES_CARD.ORDER_STATUS.SHIPPING) {
                        let el;
                        el = document.createElement("div");
                        el.className = "tui-grid-cell-content";
                        el.appendChild(document.createTextNode(props.grid.getValue(props.rowKey, "wptlCrdOrdrStNm")));
                        this.el.replaceWith(el);
                    }
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
                        header: "주문번호",
                        align: "center",
                        width: 150,
                        name: "ordrNo",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        },
                    },
                    {
                        header: "주문일시",
                        align: "center",
                        width: 120,
                        name: "sysCreDttm"
                    },
                    {
                        header: "상품명",
                        align: "center",
                        minWidth: 240,
                        name: "prdNm"
                    },
                    {
                        header: "상품 유형",
                        align: "center",
                        width: 140,
                        name: "wptlPrdTypeNm"
                    },
                    {
                        header: "발급 유형",
                        align: "center",
                        width: 140,
                        name: "mbRltgCrdDvNm"
                    },
                    {
                        header: "카드 이름 표기",
                        align: "center",
                        width: 180,
                        name: "wlpoCrdNmWrteTypeNm"
                    },
                    {
                        header: "카드 수",
                        align: "center",
                        width: 80,
                        name: "aplQtyCm"
                    },
                    {
                        header: "결제금액",
                        align: "center",
                        width: 160,
                        name: "stlmTotAmtCm"
                    },
                    {
                        header: "결제 방식",
                        align: "center",
                        width: 100,
                        name: "stlmMthdNm"
                    },
                    {
                        header: "주문자명",
                        align: "center",
                        width: 120,
                        name: "userNm"
                    },
                    {
                        header: "주문 상태",
                        align: "center",
                        width: 120,
                        name: "wptlCrdOrdrStCd",
                        renderer: CustomRenderer
                    },
                    {
                        header: "예상수령일",
                        align: "center",
                        width: 140,
                        name: "crdDlvPreaDttm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.crdDlvPreaDttm);
                        }
                    },
                    {
                        header: "주문 취소",
                        align: "center",
                        width: 140,
                        name: "ordrCnclDttm",
                        renderer: CustomRenderer
                    }
                ],
                clickEventColumns : ["ordrNo"],
                clickFunction : function (row) {
                    // 카드 주문 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/card/order/detail", { wptlCrdOrdrNo : row.wptlCrdOrdrNo});
                }
            })
            _this.methods.doGetCardOrderList();
        },
        /**
         * 카드 주문 내역 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetCardOrderList: async function () {
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                            // 기업 시퀀스
                searchText: $("#searchText").val().trim(),                   // 검색어
                searchPaymentType: $("#searchPaymentType").val(),            // 결제 방식
                searchStartDate: $("#searchStartDate").val().trim(),         // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim(),             // 검색 종료일
                dateSelect: $("input:radio[name=dateSelect]:checked").val(), // 기간 검색 버튼 값
                searchOrderStatus: $("#searchOrderStatus").val(),            // 주문 상태
                searchProductNo: $("#searchProductNo").val(),                // 상품 시퀀스
                searchProductType: $("#searchProductType").val()             // 상품 유형
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/card/doGetCardOrderList', _this.params);
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
         * 제작 요청 (디자인 확인)
         * @param el (제작 요청 button)
         * @param wptlCrdOrdrNo (카드 주문 시퀀스)
         * @returns {Promise<void>}
         */
        doConfirmDesign: async function (el, wptlCrdOrdrNo) {
            const params = {
                wptlCrdOrdrNo: Number(wptlCrdOrdrNo) // 카드 주문 시퀀스
            }
            if (!confirm("카드 제작을 요청 하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doConfirmDesign', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("카드 제작을 요청하였습니다.");
                // 주문 현황 정보 갱신
                _this.methods.doGetCardOrderListProperty();
                // 카드 주문 리스트 갱신
                _this.methods.doGetCardOrderList();
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
         * 카드 수령 확인
         * @param rowKey (테이블 row key)
         * @returns {Promise<boolean>}
         */
        doConfirmDelivery: async function (rowKey) {
            let wptlCrdOrdrNo = Toast.grid.getValue(rowKey, "wptlCrdOrdrNo");
            const params = {
                wptlCrdOrdrNo: Number(wptlCrdOrdrNo) // 카드 주문 시퀀스
            }
            if (!confirm("카드 수령 완료 상태로 변경하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/card/doConfirmDelivery', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("카드 수령 완료 상태로 변경하였습니다.");
                Toast.grid.setValue(rowKey, "wptlCrdOrdrStNm", "수령 완료");
                Toast.grid.setValue(rowKey, "wptlCrdOrdrStCd", ConstCode.CODES_CARD.ORDER_STATUS.RECEIPT_COMPLETE);
                // 주문 현황 정보 갱신
                await _this.methods.doGetCardOrderListProperty();
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
         * 주문 취소
         * (신청완료, 결제완료 상태일 경우만 취소)
         * @returns {Promise<void>}
         */
        doCancelOrderCard: async function (wptlCrdOrdrNo) {
            let params = {
                wptlCrdOrdrNo: Number(wptlCrdOrdrNo) // 상품 시퀀스
            }
            if (!confirm("주문 취소하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doCancelOrderCard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("주문이 취소되었습니다.");
                // 주문 현황 정보 갱신
                await _this.methods.doGetCardOrderListProperty();
                // 카드 주문 리스트 갱신
                await _this.methods.doGetCardOrderList();
            } else {
                switch (code) {
                    case -4007:
                        alert(message);
                        // 주문 현황 정보 갱신
                        await _this.methods.doGetCardOrderListProperty();
                        // 카드 주문 리스트 갱신
                        await _this.methods.doGetCardOrderList();
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        }
    },
    init: async function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        Util.setDatePicker();
        await _this.methods.doGetCardOrderListProperty();
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();