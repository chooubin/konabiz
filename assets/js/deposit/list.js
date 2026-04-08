// Toast loaded via script tag;

// 예치금 내역 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetDepositList();
    },
    events: {
        // /**
        //  * key 이벤트
        //  */
        // keyEvent: function () {
        // },
        // /**
        //  * click 이벤트
        //  */
        // clickEvent: function () {
        // },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            // 상품명 영역 - 상품 선택 변경시
            $("#wptlPrdNo").on("change", function () {
                _this.methods.changeProduct();
            })
        }
    },
    methods: {
        changeProduct: async function() {
            let wptlPrdTypeCd = $("#wptlPrdNo option:selected").attr("_wptlPrdTypeCd");
            // 상품타입이 없는 경우, 계좌번호 선택영역 초기화
            if (Util.isEmpty(wptlPrdTypeCd)) {
                $("#searchAccount").val("");
                $("#searchAccount").html('<option value="">카드포인트/잔액명을 선택해 주세요.</option>');
                $("#searchAccount").attr("disabled", true);

                return;
            }
            await _this.methods.doGetCashBalaDepositList();

            $("#searchAccount").attr("disabled", false);
        },
        /**
         * 기업 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                useYn: "Y"                        // 사용중 여부 (사용중인 카드만 조회)
            }
            // console.log(params);
            const res = await ServiceExec.jsonPost('/common/doGetProductList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let html = '<option value="" _wptlPrdTypeCd="">상품명을 선택해주세요.</option>';
            if (code === 1) {
                for (let i = 0; i < entity.length; i++) {
                    html += '<option value="' + entity[i].wptlPrdNo + '" _wptlPrdTypeCd="' + entity[i].wptlPrdTypeCd + '" _crdPntUsePsblYn="' + entity[i].crdPntUsePsblYn +'" _balaUsePsblYn="' + entity[i].balaUsePsblYn + '" >' + entity[i].prdNm + '</option>';
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
            $("#wptlPrdNo").html(html);
            await _this.methods.changeProduct();
         },
        /**
         * 카드 캐시/잔액명 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetCashBalaDepositList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                wptlPrdNo: $("#wptlPrdNo").val()  // 상품 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/common/doGetCashBalaDepositList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let html = '<option value="">카드포인트/잔액명을 선택해 주세요.</option>';
            if (code === 1) {
                for (let i = 0; i < entity.length; i++) {
                    if( entity[i].depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.RECHARGER ) {
                        html += '<option value="' + entity[i].rcgId + '" _depositType="' + entity[i].depositType + '" _vtlAcno="' + entity[i].unmaskVtlAcno + '" >' + entity[i].balaNm + '</option>';
                    } else {
                        html += '<option value="' + entity[i].crdCashId + '" _depositType="' + entity[i].depositType + '" _vtlAcno="' + entity[i].vtlAcno + '">' + entity[i].crdCashNm + '</option>';
                    }
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
            $("#searchAccount").html(html);
        },
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
                        header: "일자",
                        align: "center",
                        width: 340,
                        name: "transDt"
                    },
                    {
                        header: "입금",
                        align: "center",
                        minWidth: 100,
                        name: "depsAmount"
                    },
                    {
                        header: "지급·충전취소",
                        align: "center",
                        minWidth: 100,
                        name: "cancelAmount"
                    },
                    {
                        header: "소멸",
                        align: "center",
                        minWidth: 100,
                        name: "pntExtnAmount"
                    },
                    {
                        header: "회수",
                        align: "center",
                        minWidth: 100,
                        name: "rtrvAmouont"
                    },
                    {
                        header: "환불",
                        align: "center",
                        minWidth: 100,
                        name: "rfndAmount",
                        formatter: function ({row, column, value}) {
                            if( value !== "0" ) {
                                value = "-" + value;
                            }
                            return value;
                        }
                    },
                    {
                        header: "지급·충전",
                        align: "center",
                        minWidth: 100,
                        name: "chargeAmount",
                        formatter: function ({row, column, value}) {
                            if( value !== "0" ) {
                                value = "-" + value;
                            }
                            return value;
                        }
                    },
                    {
                        header: "기타",
                        align: "center",
                        minWidth: 100,
                        name: "etcAmount"
                    },
                    {
                        header: "예치금 잔액(원)",
                        align: "center",
                        minWidth: 100,
                        name: "remainAmount"
                    },
                    {
                        header: "입금확인증",
                        align: "center",
                        minWidth: 100,
                        name: "issueConfirmation",
                        formatter: function ({row, column, value}) {
                            if(row.depsAmount != 0)
                                return '<a class="label" name="issue" style="cursor: pointer;">발급</a>';
                        }
                    }
                ],
                clickEventColumns : ["issueConfirmation"],
                clickFunction : function (row) {
                    var param = {
                        depositDate : row.transDt,
                        depositAmt : row.depsAmount
                    }
                    if(row.depsAmount != 0)
                        FH.methods.issueConfirmationCert(param);
                }
            })
        },
        /**
         * 예치금 내역 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetDepositList: async function (type = 1) {
            if ($("#wptlPrdNo option").length > 1 && Util.isEmpty($("#wptlPrdNo").val())) {
                alert("조회할 상품을 선택해주세요.");
                $(".h2-head .btn-srch").trigger("click");
                return;
            }
            if (!Util.isEmpty($("#wptlPrdNo").val()) && Util.isEmpty($("#searchAccount").val())) {
                alert("조회할 카드포인트/잔액명을 선택해주세요.");
                $(".h2-head .btn-srch").trigger("click");
                return;
            }
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                ServiceExec.downPost('/api/deposit/doGetDepositList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                                      // 기업 시퀀스
                wptlPrdNo: $("#wptlPrdNo option:selected").val(),                      // 상품 시퀀스
                searchDepositType: $("#searchDepositType").val(),                      // 거래 분류
                searchRcgId: "",                                                       // 법인 계좌
                searchCrdCashId: "",                                                   // 복지 포인트
                searchStartDate: $("#searchStartDate").val().trim(),                   // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim()                        // 검색 종료일
            }

            const depositType = $("#searchAccount option:selected").attr("_depositType");
            // 예치금타입으로 depositType put.
            if( depositType == ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.CASH) {
                _this.params.depositType = ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.CASH;
                _this.params.searchCrdCashId = $("#searchAccount").val();
            } else {
                _this.params.depositType = ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.RECHARGER;
                _this.params.searchRcgId = $("#searchAccount").val();
            }

            // console.log(_this.params);
            const res = await ServiceExec.post('/api/deposit/doGetDepositList', _this.params);
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
         * 예치금 잔액 팝업 열기
         * @returns {Promise<boolean>}
         */
        openDepositBalanceModal: async function () {
            if ($("#wptlPrdNo option").length > 1 && Util.isEmpty($("#wptlPrdNo").val())) {
                alert("조회할 상품를 선택해주세요.");
                $(".h2-head .btn-srch").trigger("click");
                return false;
            }

            if (Util.isEmpty($("#searchAccount").val())) {
                alert("조회할 계좌번호를 선택해주세요.");
                $(".h2-head .btn-srch").trigger("click");
                return false;
            }

            const params = {
                path: "modal/deposit",
                htmlData: {
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#depositPopup").length) $("#depositPopup").remove();
            $("body").children("a.btn-top").after(html);
            $("#depositPopup").css('display', 'none');
            await _this.methods.doGetDepositBalance();

            $("#depositPopup").modal({show: true});
        },
        /**
         * 예치금 잔액 조회 (팝업)
         * @returns {Promise<void>}
         */
        doGetDepositBalance: async function () {
            let searchDate = new Date();
            searchDate = Util.dateFormat(searchDate);
            const $scrollWrap = $("#depositPopup .modal-body");
            const $validEl = $("#msg");

            if ($("#wptlPrdNo option").length > 1 && Util.isEmpty($("#wptlPrdNo").val())) {
                alert("조회할 상품을 선택해주세요.");
                return;
            }

            if (Util.isEmpty($("#searchAccount").val())) {
                alert("조회할 계좌번호를 선택해주세요.");
                $(".h2-head .btn-srch").trigger("click");
                return false;
            }

            $validEl.html("");
            if (Util.isEmpty(searchDate)) {
                Util.validCheck($scrollWrap, $validEl, "기준일을 입력해주세요.");
                return;
            }
            if (!Util.validDate(searchDate)) {
                Util.validCheck($scrollWrap, $validEl, "기준일 입력형식이 잘못되었습니다.");
                return;
            }

            const depositType = $("#searchAccount option:selected").attr("_depositType");
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                wptlPrdNo: $("#wptlPrdNo").val(),
                depositType: depositType,
                searchDate: searchDate, // 기준일
                searchRcgId: "",
                searchCrdCashId: ""
            }

            // 예치금타입
            if( depositType == ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.CASH) {
                params.depositType = ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.CASH;
                params.searchCrdCashId = $("#searchAccount").val();
            } else {
                params.depositType = ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.RECHARGER;
                params.searchRcgId = $("#searchAccount").val();
            }

            // console.log(params);
            const res = await ServiceExec.post('/api/deposit/doGetDepositBalance', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                const depositBalanceAmt = entity.depositBalanceAmt;
                $("#depositBalance").text(params.searchDate + " 기준 예치금 : " + depositBalanceAmt);

            } else {
                switch (code) {
                    case -5001:
                        Util.validCheck($scrollWrap, $validEl, message);
                        break;
                    default:
                        alert(message);
                        break;
                }
            }

        },
        resetSearchInit: function() {
            if($("#searchStartDate").val().length < 1 && $("#searchEndDate").val().length < 1) {
                let dateRange = Util.dateSelect("1M");
                $("#searchStartDate").val(dateRange.startDate);
                $("#searchEndDate").val(dateRange.endDate);
                $("#searchAccount").attr("disabled", true);
            }
        },

        issueConfirmationCert: function (params) {
            params.wptlEntpNo = KSM.targetWptlEntpNo;
            params.prdNm = $("#wptlPrdNo option:selected").text();
            params.vtlAcc = $("#searchAccount option:selected").attr("_vtlAcno");
            params.crdCash = $("#searchAccount option:selected").text();

            ServiceExec.downPost('/api/deposit/doDownloadDepositConfirmation', params);
            return;
        }
    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker();
        _this.methods.resetSearchInit();

        await _this.methods.doGetProductList();
        Toast.methods.getListInfo(FH.methods.setTable);
        Toast.methods.setGridHeight(0);
    }
}

window.FH = FH;
FH.init();