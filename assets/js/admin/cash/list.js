import "/js/common/Toast.js?version=2025052101";

// 관리자 - 계약 현황 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    unmaskYn: "N",
    getList: function () {
        _this.methods.doGetCashList();
    },
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {},
        /**
         * click 이벤트
         */
        clickEvent: function () {},
        /**
         * change 이벤트
         */
        changeEvent: function () {},
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
                            return (FH.page - 1) * FH.limit + (row.rowKey + 1);
                        },
                    },
                    {header: "회사명", name: "companyName", align: "center", width: 150},
                    {header: "상품명", name: "productName", align: "center", width: 200},
                    {header: "상품코드", name: "productCode", align: "center", width: 200},
                    {header: "상품유형", name: "productType", align: "center", width: 120},
                    {
                    header: "카드포인트명",
                    name: "cardCashName",
                    align: "center",
                    width: 200,
                    formatter: ({ value }) => {
                        return `<span style="color:#0028b6; text-decoration:underline; cursor:pointer;">${value}</span>`;
                    }
                    },
                    {header: "카드포인트타입", name: "cardCashType", align: "center", width: 200},
                    {header: "식권 서비스", name: "mealTicketServiceYn", align: "center", width: 120},
                    {header: "연간 예산 한도", name: "annualBudgetLimit", align: "center", width: 150},
                    {header: "개인별 제공한도 설정(년)", name: "rewardLimitYear", align: "center", width: 180},
                    {header: "개인별 제공한도 설정(월)", name: "rewardLimitMonth", align: "center", width: 180},
                    {header: "소득공제 설정", name: "incomeDeductionYn", align: "center", width: 150},
                    {header: "단말기 포인트 지급", name: "terminalRechargeYn", align: "center", width: 150},
                    {header: "자동사용 설정", name: "autoUseYn", align: "center", width: 150},
                    {header: "사용처/제한처", name: "usageRestriction", align: "center", width: 180},
                    {header: "예치금 계좌번호", name: "depositAccountNo", align: "center", width: 200},
                    {header: "사용시작일", name: "startDate", align: "center", width: 150},
                    {header: "포인트 유효기간", name: "cashExpPeriod", align: "center", width: 200},
                    {header: "취소 포인트 유효기간", name: "cashCancelExpPeriod", align: "center", width: 200},
                    {header: "1회 사용한도", name: "maxAmtOnetime", align: "center", width: 150},
                    {header: "1일 사용한도", name: "maxAmtDay", align: "center", width: 150},
                ],
                clickEventColumns: ["cardCashName"],
                clickFunction: function (row) {
                    Toast.methods.setListInfo();
                    Util.contCheck("/product/cash/detail", {wptlPrdNo: row.wptlPrdNo, crdCashId: row.crdCashId});
                },
            });
            _this.methods.doGetCashList();
        },

          unmaskingPage: async function() {
            _this.unmaskYn = "Y";
            await _this.methods.doGetCashList();
        },
        /**
         * 계약 현황 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetCashList: async function (type = 1) {
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(), // 검색 분류
                searchText: $("#searchText").val().trim(), // 검색어
                productType: $("#productType").val(), //상품유형
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim(), // 검색 종료일
                unmaskYn: _this.unmaskYn
            };
            if (Util.isEmpty(_this.params.searchEndDate)) {
                _this.params.searchEndDate = moment().format("YYYY/MM/DD");
            }
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = {..._this.params};
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download("/api/product/doGetCashList", params);
                return;
            }
            const res = await ServiceExec.post("/api/product/doGetCashList", _this.params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            console.log(
                "code: %d\nmessage: %s\nentity: %o\nstringify: \n%s",
                code,
                message,
                entity,
                JSON.stringify(entity)
            );
            if (code === 1) {
                _this.totalCount = entity.totalCount;
                $("#totalCount").text(_this.totalCount);
                _this.virtualNum = entity.virtualNum;

                Toast.grid.resetData(entity.list);
                Toast.methods.setPagination();
                Toast.methods.setScroll();
            } else {
                switch (code) {
                    default:
                        alert(message);
                        break;
                }
            }
        },
    },
    init: function () {
        _this = this;
        Util.setDatePicker();
        Toast.methods.getListInfo(FH.methods.setTable);
    },
};

window.FH = FH;
FH.init();
