import "/js/common/Toast.js?version=2025052101";

// 복지카드 이용 내역 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    searchDate: "",
    par: "",
    prdId: "",
    unmaskYn: "N",
    selTabType: "1",
    useBalanceCashType: ConstCode.CODES_PRODUCT.USE_BALANCE_CASH_TYPE.BALANCE,
    getList: function () {
        _this.methods.doGetUseBillDetailList();
    },
    events: {
        // /**
        //  * key 이벤트
        //  */
        // keyEvent: function () {
        // },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            $("#tabs-corporate, #tabs-corporatePoint").on("click", function (e) {

                if(e.target.id == "tabs-corporate") {
                    _this.selTabType = "1";
                } else if (e.target.id == "tabs-corporatePoint") {
                    _this.selTabType = "2";
                }

                $(this).parent().find("a").removeClass("active");
                $(this).addClass("active");

                FH.methods.doGetUseBillDetailList();

            });

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
                        header: "거래일시",
                        align: "center",
                        width: 120,
                        name: "tranDt"
                    },
                    {
                        header: "가맹점명",
                        align: "center",
                        minWidth: 100,
                        name: "mctNm",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : value
                        }
                    },

                    {
                        header: "업종",
                        align: "center",
                        width: 280,
                        name: "bztpNm",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : value
                        }
                    },
                    {
                        header: "사업자 번호",
                        align: "center",
                        width: 200,
                        name: "bizLicenseNo",
                        formatter: function ({row, column, value}) {
                            return (Util.isEmpty(row.bizLicenseNo) || row.bizLicenseNo === "-")
                                ? '-'
                                : `${row.bizLicenseNo.substring(0,3)}-${row.bizLicenseNo.substring(3,5)}-${row.bizLicenseNo.substring(5,10)}`;
                        }
                    },
                    {
                        header: "거래유형",
                        align: "center",
                        width: 100,
                        name: "prcsNm"
                    },
                    {
                        header: "거래타입",
                        align: "center",
                        width: 100,
                        name: "orgNrNm"
                    },
                    {
                        header: "거래결과",
                        align: "center",
                        width: 100,
                        name: "respNm"
                    },
                    {
                        header: "거래금액(원)",
                        align: "center",
                        width: 150,
                        name: "orgAmt"
                    }
                ]
            })
            _this.methods.doGetUseBillDetailList();
        },
        /**
         * 이용대금 명세서 리스트 조회
         * @returns {Promise<void>}
         */
        doGetUseBillDetailList: async function (type = 1, el) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                ServiceExec.downPost('/api/usage/doGetUseBillDetailList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                      // 기업 시퀀스
                searchDate: _this.searchDate,             // 검색년월
                par: _this.par,
                prdId: _this.prdId,                       // 상품 ID
                searchCorpUseBillType: _this.selTabType
            }
            _this.params.unmaskYn = _this.unmaskYn;

            // console.log(_this.params);
            const res = await ServiceExec.post('/api/usage/doGetUseBillDetailList', _this.params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount
                $("#totalCount").text(_this.totalCount);
                _this.virtualNum = entity.virtualNum;
                $("#totalAmount").text( Number(entity.extraValue).toLocaleString("ko-KR") + "원" );

                Toast.grid.resetData(entity.list);
                Toast.methods.setPagination();
                Toast.methods.setListInfo();
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
        unmaskingPage: function() {
            Util.href("/usage/useBill/detail", { par : _this.par, searchDate : _this.searchDate, unmaskYn: "Y" });
        }
    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        const paramUunmaskYn = new URL( location.href ).searchParams.get("unmaskYn");
        if( !Util.isEmpty(paramUunmaskYn) ) {
            const par = new URL( location.href ).searchParams.get("par");
            const searchDate = new URL( location.href ).searchParams.get("searchDate");
            let url = location.pathname + "?par=" + encodeURIComponent(par) + "&searchDate=" + encodeURIComponent(searchDate);
            history.replaceState({}, null, url);
        }
        //Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();