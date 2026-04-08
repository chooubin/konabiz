import "/js/common/Toast.js?version=2025052101";

// 연간 이용 내역 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetYearUsageList();
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
                    }
                    },
                    {
                        header: "카드번호",
                        align: "center",
                        width: 230,
                        name: "cdno"
                    },
                    {
                        header: "카드 속성",
                        align: "center",
                        width: 100,
                        name: "wptlPrdTypeNm"
                    },
                    {
                        header: "임직원명",
                        align: "center",
                        width: 120,
                        name: "stfNm"
                    },
                    {
                        header: "사번",
                        align: "center",
                        minWidth: 100,
                        name: "incmpEmpNo"
                    },
                    {
                        header: "부서명",
                        align: "center",
                        minWidth: 150,
                        name: "deptNm",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : value
                        }
                    },
                    {
                        header: "직급",
                        align: "center",
                        minWidth: 150,
                        name: "jgdNm",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : value
                        }
                    },
                    {
                        header: "직책",
                        align: "center",
                        minWidth: 150,
                        name: "rsbNm",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : value
                        }
                    },
                    {
                        header: "재직 상태",
                        align: "center",
                        width: 100,
                        name: "empSt",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.empSt);
                        }
                    },
                    {
                        header: "지급",
                        align: "center",
                        width: 150,
                        name: "giveAmount",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : Util.numberFormat(value)
                        }
                    },
                    {
                        header: "회수",
                        align: "center",
                        width: 150,
                        name: "takeAmount",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : Util.numberFormat(value)
                        }
                    },
                    {
                        header: "소멸",
                        align: "center",
                        width: 150,
                        name: "expireAmount",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : Util.numberFormat(value)
                        }
                    },
                    {
                        header: "모아서 결제",
                        align: "center",
                        width: 150,
                        name: "copsTransAmount",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : Util.numberFormat(value)
                        }
                    },
                    {
                        header: "사용",
                        align: "center",
                        width: 150,
                        name: "usageAmount",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : Util.numberFormat(value)
                        }
                    }
                ]
            })
            Toast.methods.setDate();
        },
        /**
         * 연간 이용 내역 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetYearUsageList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = {..._this.params};
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/usage/doGetYearUsageList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                    // 기업 시퀀스
                searchType: $("#searchType").val(),                  // 검색 분류
                searchText: $("#searchText").val().trim(),           // 검색어
                searchProductType: $("#searchProductType").val(),    // 상품 타입
                searchTranType: $("#searchTranType").val(),          // 거래 유형
                searchYear: Toast.selectYear.toString()              // 검색년도
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/usage/doGetYearUsageList', _this.params);
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
         * 연간 이용 내역 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetYearUsageListV2: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = {..._this.params};
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/usage/doGetYearUsageListV2', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                    // 기업 시퀀스
                searchType: $("#searchType").val(),                  // 검색 분류
                searchText: $("#searchText").val().trim(),           // 검색어
                searchProductType: $("#searchProductType").val(),    // 상품 타입
                searchTranType: $("#searchTranType").val(),          // 거래 유형
                searchYear: Toast.selectYear.toString()              // 검색년도
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/usage/doGetYearUsageListV2', _this.params);
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
         * 기업 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                          // 기업 시퀀스
                useYn: "Y"                                                 // 사용중 여부 (사용중인 카드만 조회)
            }
            // console.log(params);
            const res = await ServiceExec.jsonPost('/common/doGetProductList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let html = '';
            if (code === 1) {
                let isWelfareProduct = false;
                let isCorporateProduct = false;
                let isCorporateMasterProduct = false;
                let isCorporateDebitMasterProduct = false;
                let isCorporateDebitAccountProduct = false;
                for (let i = 0; i < entity.length; i++) {
                    if (entity[i].wptlPrdTypeCd == '10') isWelfareProduct = true;
                    else if (entity[i].wptlPrdTypeCd == '20') isCorporateProduct = true;
                    else if (entity[i].wptlPrdTypeCd == '30') isCorporateMasterProduct = true;
                    else if (entity[i].wptlPrdTypeCd == '40') isCorporateDebitMasterProduct = true;
                    else if (entity[i].wptlPrdTypeCd == '50') isCorporateDebitAccountProduct = true;
                }
                if (!!isWelfareProduct && !!isCorporateProduct) {
                    html += '<option value="10">' + "복지카드" + '</option>';
                    html += '<option value="20">' + "법인카드" + '</option>';
                } else if (!!isCorporateProduct) {
                    html += '<option value="20">' + "법인카드" + '</option>';
                } else if (!!isWelfareProduct) {
                    html += '<option value="10">' + "복지카드" + '</option>';
                } else {
                    html += '<option value="10">' + "복지카드" + '</option>';
                    html += '<option value="20">' + "법인카드" + '</option>';
                }

                if(!!isCorporateMasterProduct && !!isCorporateDebitMasterProduct && !!isCorporateDebitAccountProduct) {
                    html += '<option value="30">' + "법인 마스터카드" + '</option>';
                    html += '<option value="40">' + "법인 직불 마스터카드" + '</option>';
                } else if(!!isCorporateMasterProduct) {
                    html += '<option value="30">' + "법인 마스터카드" + '</option>';
                } else if(!!isCorporateDebitMasterProduct) {
                    html += '<option value="40">' + "법인 직불 마스터카드" + '</option>';
                } else if(!!isCorporateDebitAccountProduct) {
                    html += '<option value="50">' + "법인 계좌 직불 카드" + '</option>';
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
            $("#searchProductType").html(html);
        },

        showToolTip: async function () {
            const expireAmountEl = document.querySelector('th[data-column-name="expireAmount"]');
            const copsTransAmountEl = document.querySelector('th[data-column-name="copsTransAmount"]');

            if (copsTransAmountEl && expireAmountEl) {
                expireAmountEl.innerHTML = '소멸 <span class="tooltip tooltip-kbc" data-tooltip-text="포인트 유효기간 종료로 인한 소멸 금액입니다."></span>';
                copsTransAmountEl.innerHTML = '모아서 결제 <span class="tooltip tooltip-kbc" data-tooltip-text="모아서 결제를 통한 포인트 사용 금액입니다."></span>';
            }
        },

    },
    init: async function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        Util.setDatePicker();
        await _this.methods.doGetProductList();
        Toast.methods.getListInfo(FH.methods.setTable);
        this.methods.showToolTip();
    }
}

window.FH = FH;
FH.init();