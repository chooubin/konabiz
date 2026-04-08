import "/js/common/Toast.js?version=2026020602";
import "/js/common/File.js?version=2025010801";

// 관리자 - 카드 주문 현황 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    pageSortBy: "",
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
         * 리스트 table 생성
         */
        setTable: function () {
            // "주문상태" cell 수령확인 버튼 customRenderer
            class CustomRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;
                    let el;
                    if(props.columnInfo.name === "ordrCnclDttm") {
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
                render(props) {}
            }
            Toast.methods.setGrid({
                scrollX: true,
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
                        width: 140,
                        name: "ordrNo",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        }
                    },
                    {
                        header: "회사명",
                        align: "center",
                        minWidth: 180,
                        name: "entpNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.entpNm);
                        }
                    },
                    {
                        header: "상품 신청 번호",
                        align: "center",
                        width: 160,
                        name: "prdSno"
                    },
                    {
                        header: "상품 코드",
                        align: "center",
                        name: "prdId",
                        minWidth: 200,
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) ? '-' : value
                        }
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
                        //width: 200,
                        minWidth:200,
                        name: "prdNm"
                    },
                    {
                        header: "상품 유형",
                        align: "center",
                        width: 160,
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
                        header: "카드 유형",
                        align: "center",
                        width: 140,
                        name: "wptlPrdCrdTypeNm"
                    },
                    {
                        header: "디자인",
                        align: "center",
                        width: 140,
                        name: "wptlCrdDsgTypeNm"
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
                        width: 140,
                        name: "stlmTotAmtCm",
                        formatter: function ({row, column, value}) {
                            return row.stlmTotAmtCm == "-" ? row.stlmTotAmtCm : row.stlmTotAmtCm + "원";
                        }
                    },
                    {
                        header: "결제방식",
                        align: "center",
                        width: 90,
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
                        name: "wptlCrdOrdrStNm"
                    },
                    {
                        header: "출고일",
                        align: "center",
                        width: 140,
                        name: "dlvRcpDt"
                    },
                    {
                        header: "주문 취소",
                        align: "center",
                        width: 140,
                        name: "ordrCnclDttm",
                        renderer: CustomRenderer
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
                clickEventColumns : ["ordrNo"],
                clickFunction : function (row) {
                    // 카드 주문 관리 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/admin/card/detail", { wptlCrdOrdrNo : row.wptlCrdOrdrNo});
                }
            })
            _this.methods.doGetCardOrderList();
        },
        /**
         * 카드 주문 관리 리스트 (기타정보) - 데이터 조회 (최근 3개월 주문 현황)
         * @returns {Promise<void>}
         */
        doGetCardOrderListProperty: async function () {
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/card/doGetCardOrderListProperty');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));

            if (code === 1) {
                _this.cardOrderListProperty = entity;
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
        },
        /**
         * 카드 주문 내역 리스트 (기타정보) - 내용 페이지 호출 (최근 3개월 주문 현황)
         * @returns {Promise<void>}
         */
        getPageContent: async function () {
            const params = {
                path: "admin/card/list_recent",
                htmlData: {
                    cardOrderListProperty: _this.cardOrderListProperty
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $("#recentOrderWrap").html(html);
        },
        /**
         * 카드 주문 관리 리스트 - 데이터 조회
         * @param type (리스트 : 1, excel 다운: -1)
         * @returns {Promise<void>}
         */
        doGetCardOrderList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/admin/card/doGetCardOrderList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                pageSortBy: _this.pageSortBy,
                searchType: $("#searchType").val(),                          // 검색 타입
                searchText: $("#searchText").val().trim(),                   // 검색어
                searchPaymentType: $("#searchPaymentType").val(),            // 결제 방식
                searchStartDate: $("#searchStartDate").val().trim(),         // 검색 시작일 (주문 기간)
                searchEndDate: $("#searchEndDate").val().trim(),             // 검색 종료일 (주문 기간)
                shippingStartDate: $("#shippingStartDate").val().trim(),     // 검색 시작일 (주문 기간)
                shippingEndDate: $("#shippingEndDate").val().trim(),
                dateSelect: $("input:radio[name=dateSelect]:checked").val(), // 기간 검색 버튼 값
                shippingDateSelect: $("input:radio[name=shippingDateSelect]:checked").val(),
                searchOrderStatus: $("#searchOrderStatus").val()             // 주문 상태
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/card/doGetCardOrderList', _this.params);
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
                await _this.methods.doGetCardOrderListProperty();
                await _this.methods.doGetCardOrderList();
            } else {
                switch (code) {
                    case -4007:
                        alert(message);
                        // 주문 현황 정보 갱신
                        await _this.methods.doGetCardOrderListProperty();
                        await _this.methods.doGetCardOrderList();
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /* ---------------------------------------- 송장 일괄 등록 modal start ---------------------------------------- */
        /**
         * 송장 일괄 등록 modal 열기
         * @param modalType (엑셀: excel)
         * @returns {Promise<boolean>}
         */
        openDeliveryModal: async function (modalType = "excel") {
            let params = { ..._this.params };
            params.searchOrderStatus = ConstCode.CODES_CARD.ORDER_STATUS.MAKING;
            const res = await ServiceExec.post('/api/admin/card/doCardOrderListCount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if(entity < 1) {
                    alert("제작중인 주문 목록이 없습니다.");
                    return false;
                }
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        return false;
                }
            }

            const modalParams = {
                path: "modal/delivery",
                htmlData: {
                    modalType: modalType,
                    entpNm: _this.entpNm
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', modalParams);
            if ($("#deliveryModal").length) $("#deliveryModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#deliveryModal").modal({show: true});
        },

        /**
         * 임직원 일괄 등록 modal - 엑셀 업로드
         * @param saveYn
         * @returns {Promise<boolean>}
         */
        doRegistDeliveryExcel: async function (el, saveYn = "N") {
            const params = {
                saveYn: saveYn,                                     // 실제 저장 여부
                tempFileName: "",                                   // 업로드한 엑셀 파일 이름
            }
            if (saveYn === "N") {
                let $tempFile = $("#deliveryModal #userCardExcelFile");
                let $tempFileName = $("#deliveryModal #tempFileName");
                $tempFileName.val("");
                params.excelFile = $tempFile[0].files[0];    // 사용자 엑셀 파일

                const res = await ServiceExec.formPostAsync('/api/admin/card/doRegistDeliveryExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    if (entity.successCount > 0) $tempFileName.val(entity.tempFileName);
                    // 엑셀 업로드 결과 바인딩 (js/common/File.js)
                    FILE.methods.setExcelUploadResultWithReject(entity);
                } else {
                    switch (code) {
                        // 예외처리 경우
                        // case -2005: // 중복된 부서가 있는경우
                        //     break;
                        default:
                            alert(message);
                            break;
                    }
                }
                $tempFile.val("");
            } else {
                const $deliveryModal = $("#deliveryModal");
                params.tempFileName = $deliveryModal.find("#tempFileName").val() // 임직원 엑셀 파일 이름
                if (Util.isEmpty(params.tempFileName)) {
                    $deliveryModal.modal({show: false});
                    $deliveryModal.remove();
                    return false;
                }
                if (!confirm("송장 일괄 등록 하시겠습니까?")) return false;
                // console.log(params);
                const res = await ServiceExec.formPost('/api/admin/card/doRegistDeliveryExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    alert("송장 일괄 등록하였습니다.");
                    $deliveryModal.modal({show: false});
                    $deliveryModal.remove();
                    // 복지 카드 리스트 갱신
                    _this.page = 1;
                    _this.methods.doGetCardOrderListProperty();
                    _this.methods.doGetCardOrderList();
                } else {
                    switch (code) {
                        // 예외처리 경우
                        // case -2005: // 중복된 부서가 있는경우
                        //     break;
                        default:
                            alert(message);
                            break;
                    }
                }
            }
        },
        doDownMakingOrderExcel: async function () {
            let params = { ..._this.params };
            params.searchOrderStatus = ConstCode.CODES_CARD.ORDER_STATUS.MAKING;
            ServiceExec.downPost('/api/admin/card/doDownMakingOrderExcel', params);
            return;
        }
    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        Util.setDatePicker();
        _this.methods.doGetCardOrderListProperty();
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();