import "/js/common/Toast.js?version=2025080401";

// 법인카드 이용 내역 js
let _this;
const FH = {
    params: {},
    corpAcnDbCrdUseYn: "N",
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetCorporatePaymentFailureList();
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
            $(".table-box #searchType").on("change", function() {
                const type = $(this).val();
                FH.methods.changeSearchType( type );
                $(".table-box #searchText").val( "" );
                $(".table-box #searchText").data( "realValue", "" );
            });

            const downloadBtn = $("#download_btn");
            const searchBtn = $("#search_btn");
            function validateDateRange() {
                // Reset to enabled before checks
                searchBtn.prop("disabled", false);
                downloadBtn.prop("disabled", false);

                const searchStartDate = $("#searchStartDate").val();
                let searchEndDate = $("#searchEndDate").val();

                if (Util.isEmpty(searchStartDate)) return;

                 if(Util.isEmpty(searchEndDate)) {
                    searchEndDate = moment().format('YYYY/MM/DD');
                }

                const StartDate = moment(searchStartDate).format("YYYY/MM/DD");
                const EndDate = moment(searchEndDate).format("YYYY/MM/DD");
                
                // ❌ Over 3 months → disable search
                if (!Util.checkOverSearchDateLimit(StartDate, EndDate, 3, "month")) {
                    searchBtn.prop("disabled", true);
                }

                // ❌ Over 1 year → disable both
                if (!Util.checkOverSearchDateLimit(StartDate, EndDate, 1, "year")) {
                    searchBtn.prop("disabled", true);
                    downloadBtn.prop("disabled", true);
                }
            }

            // 🟢 Radio button logic
            $("input[name='dateSelect']").on("change", function () {
                  //Removing all manual date related error
                const selectedValue = $(this).val();
                const allowedValues = ["P", "D", "1D", "1W", "1M", "3M"];
                if (allowedValues.includes(selectedValue)) {
                    searchBtn.prop("disabled", false);
                    downloadBtn.prop("disabled", false);
                } else {
                    searchBtn.prop("disabled", true);
                    downloadBtn.prop("disabled", false);
                    _this.totalCount = 0;
                    $("#totalCount").text(_this.totalCount);
                    Toast.grid.resetData([]);
                    Toast.methods.setPagination();
                    Toast.methods.setListInfo();
                }
                // If 직접입력(P) selected, trigger validation based on date fields
                if (selectedValue === "P") {
                    validateDateRange();
                }
            });

            // 🟢 Start & End Date field listeners
            $("#searchStartDate, #searchEndDate").on("change", validateDateRange);

             // 🟢 Start & End Date field listeners for manual date entering
            $("#searchStartDate, #searchEndDate")
                .on("change", function () {
                    if (Util.validateManualDates()) {
                        validateDateRange();
                    } else {
                        $("#search_btn").prop("disabled", true);
                        $("#download_btn").prop("disabled", true);
                    }
                }).on("blur", function () {
                    if (Util.validateManualDates()) {
                        validateDateRange();
                    } else {
                        $("#search_btn").prop("disabled", true);
                        $("#download_btn").prop("disabled", true);
                    }
                })
                .on("keydown", function (e) {
                    if (e.key === "Enter" || e.keyCode === 13) {
                        e.preventDefault(); // Prevent form submission if inside a form
                        $(this).blur(); // Trigger blur manually to validate
                    }
                });
        }
    },
    methods: {
        /**
         * 기업 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                          // 기업 시퀀스
                //wptlPrdTypeCd: ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE, // 상품 타입 - 법인카드만
                searchPrdType: 2,           // 상품 검색 타입 (법인 20,30,40,50)
                useYn: "Y"                                                 // 사용중 여부 (사용중인 카드만 조회)
            }
            // console.log(params);
            const res = await ServiceExec.jsonPost('/common/doGetProductList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let param_prdId = $("#param_prdId").val();
            let html = '<option value="" _prdId=""' + (Util.isEmpty(param_prdId) ? 'selected' : '') + '>상품을 선택해주세요.</option>';

            if (code === 1) {
                for (let i = 0; i < entity.length; i++)
                    if( i == 0 ) {
                        html = '<option value="' + entity[i].wptlPrdNo + '" _prdId="' + entity[i].prdId + '" ' + (entity[i].prdId === param_prdId ? 'selected' : '') + '>' + entity[i].prdNm + '</option>';
                    } else {
                        html += '<option value="' + entity[i].wptlPrdNo + '" _prdId="' + entity[i].prdId + '" ' + (entity[i].prdId === param_prdId ? 'selected' : '') + '>' + entity[i].prdNm + '</option>';
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
        },
        /**
         * 리스트 table 생성
         */
        setTable: function () {
            const userLoginId = KSM.userLoginId;
            const lsn = userLoginId+'_usageCorporateGridColumns';

            const defColumns = [
                {
                    header: "NO",
                    align: "center",
                    width: 100,
                    name: "rowKey",
                    default: true,
                    formatter: function ({row, column, value}) {
                        return ((FH.page - 1) * FH.limit) + (row.rowKey + 1);
                        // 번호 역순으로 바인딩시
                        // return FH.virtualNum - row.rowKey;
                    }
                },
                {
                    header: "거래일시",
                    align: "center",
                    minWidth: 120,
                    default: true,
                    name: "iasTranDt"
                },
                {
                    header: "상품명",
                    align: "center",
                    minWidth: 360,
                    default: true,
                    name: "svcNm"
                },
                {
                    header: "카드번호",
                    align: "center",
                    minWidth: 240,
                    default: true,
                    name: "cdno"
                },
                {
                    header: "임직원명",
                    align: "center",
                    minWidth: 180,
                    name: "stfNm",
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                },
                {
                    header: "사원번호",
                    align: "center",
                    minWidth: 180,
                    name: "incmpEmpNo",
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                },
                {
                    header: "가맹점명",
                    align: "center",
                    minWidth: 280,
                    name: "mctNm",
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                },
                {
                    header: "가맹점 코드",
                    align: "center",
                    minWidth: 280,
                    name: "mctId",
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                },
                {
                    header: "업종",
                    align: "center",
                    minWidth: 280,
                    name: "bztpNm",
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                },
                {
                    header: "사업자 번호",
                    align: "center",
                    minWidth: 140,
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
                    minWidth: 100,
                    name: "prcsNm"
                },
                {
                    header: "거래타입",
                    align: "center",
                    minWidth: 100,
                    name: "orgNrNm"
                },
                {
                    header: "거래결과",
                    align: "center",
                    minWidth: 100,
                    name: "respNm"
                },
                {
                    header: "승인번호",
                    align: "center",
                    minWidth: 110,
                    name: "apvNo",
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                },
                {
                    header: "거래금액(원)",
                    align: "center",
                    minWidth: 150,
                    default: true,
                    name: "trAmt"
                },
                {
                    header: "결제 실패 코드",
                    align: "center",
                    minWidth: 150,
                    name: "paymentFailureCode",
                    default: true,
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                },
                {
                    header: "사유",
                    align: "center",
                    minWidth: 150,
                    name: "paymentFailureReason",
                    default: true,
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                }
            ].filter(Boolean);
            const savedCols = JSON.parse(localStorage.getItem(lsn))?.actualCols;
            let actualColumns = []
            if (savedCols && savedCols.length > 0) {
                actualColumns = Util.mergeTwoObjArrays(defColumns, savedCols, 'name');
                const corporateGridColumns = {checkUncheckAll: true, actualCols: actualColumns}
                localStorage.setItem(lsn, JSON.stringify(corporateGridColumns));
            } else {
                actualColumns = defColumns
                const viewCols = [];
                defColumns.forEach(obj => {
                    viewCols.push({
                        name: obj?.name,
                        header: obj?.header,
                        hidden: false,
                        defCol: obj?.default ? obj.default : false
                    })
                });
                const corporateGridColumns = {checkUncheckAll: true, actualCols: viewCols}
                localStorage.setItem(lsn, JSON.stringify(corporateGridColumns));
            }

            Toast.methods.setGrid({
                rowHeaders: [],
                columns: actualColumns
            })

            // lside and rside scrolling synchronization
            setTimeout(() => {

                const $gridContainer = $('#grid');
                const $rsideBody = $gridContainer.find('.tui-grid-rside-area .tui-grid-body-area');
                const $lsideBody = $gridContainer.find('.tui-grid-lside-area .tui-grid-body-area');
                const $lsideArea = $gridContainer.find('.tui-grid-lside-area');

                //Use CSS calc for truly dynamic height
                function syncHeights() {
                    const rsideElement = $rsideBody[0];
                    if (!rsideElement) return;


                    const hasHScrollbar = rsideElement.scrollWidth > rsideElement.clientWidth;
                    const scrollbarHeight = hasHScrollbar ? 17 : 0;
                    const actualHeight = $rsideBody.outerHeight();

                    $lsideBody.css({
                        'padding-bottom': scrollbarHeight + 'px',
                        'box-sizing': 'border-box'

                    });
                }

                syncHeights();

                // Scroll synchronization
                let isScrolling = false;

                $rsideBody.on('scroll.gridSync', function () {
                    if (isScrolling) return;
                    isScrolling = true;
                    $lsideBody.scrollTop(this.scrollTop);
                    setTimeout(() => {
                        syncHeights();
                        isScrolling = false;
                    }, 10);
                });

                $lsideBody.on('scroll.gridSync', function () {
                    if (isScrolling) return;
                    isScrolling = true;
                    $rsideBody.scrollTop(this.scrollTop);
                    setTimeout(() => isScrolling = false, 10);
                });

                // Enable scrolling on left side
                $lsideArea.css('overflow', 'visible');
                $lsideBody.css({
                    'overflow-y': 'scroll',
                    'overflow-x': 'hidden',
                    'pointer-events': 'auto',
                    'margin-right': '0px'
                });

                $(window).off('resize.gridSync').on('resize.gridSync', syncHeights);

            }, 50);

            _this.methods.doGetCorporatePaymentFailureList();
        },
        /**
         * 법인카드 이용 내역 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetCorporatePaymentFailureList: async function (type = 1) {
            const searchStartDate = $("#searchStartDate").val();
            if (Util.isEmpty(searchStartDate)) {
                alert("기간 시작일을 입력해주세요.");
                return false;
            }
            
            if( Util.isEmpty($("#wptlPrdNo option:selected").attr("_prdId")) ) {
                alert("상품명을 선택해주세요.");
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                      // 기업 시퀀스
                searchType: $("#searchType").val(),                    // 검색 분류
                searchStartDate: $("#searchStartDate").val().trim(),   // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim(),       // 검색 종료일
                prdId: $("#wptlPrdNo option:selected").attr("_prdId"), // 상품 ID
                crdCashId: "",                                         // 캐시 ID
                par: $("#param_par").val().trim(),                      // 카드 PAR (법인카드 관리 > 상세 > 카드이용내역 으로 진입시)
                dateSelect: $("input:radio[name=dateSelect]:checked").val(), // 기간 검색 버튼 값
                searchEmployeeStatus: $("#searchEmployeeStatus").val(),      // 재직 상태
                searchTranType: $("#searchTranType").val()          // 거래 유형
            }
            if( _this.params.searchType === "6" ) {
                _this.params.searchText = $("#searchText").data( "realValue" );
            } else {
                _this.params.searchText = $("#searchText").val().trim();
            }
             if (type === -1) {
                 const params = {..._this.params};
                 params.limit = -1;
                 const res = await ServiceExec.post("/api/payment/failure/doGetCorporatePaymentFailureList", _this.params);
                 const entity = res.entity;
                 if (entity.totalCount === 0) {
                     alert("다운로드 할 데이터가 없습니다.");
                     return;
                 }
                 DOWNLOAD_MODAL.methods.download("/api/payment/failure/doGetCorporatePaymentFailureList", params);
                 return;
             }

             const StartDate = moment(_this.params.searchStartDate).format("YYYY/MM/DD");
             const EndDate = moment(_this.params.searchEndDate).format("YYYY/MM/DD");

              if (!Util.checkOverSearchDateLimit(StartDate, EndDate, 3, "month")) {
                 _this.totalCount = 0;
                 $("#totalCount").text(_this.totalCount);
                 Toast.grid.resetData([]);
                 Toast.paginationFlag = false;
                 Toast.methods.setPagination();
                 Toast.methods.setListInfo();
                 return;
              }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/payment/failure/doGetCorporatePaymentFailureList', _this.params);
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
        resetSearchInit: function() {
            $("input:radio[name=dateSelect][value=1M]").trigger("click");
        },
        changeSearchType: function( searchType ) {
            if (searchType === "6") {
                $(".table-box #searchText").attr("maxlength", "16");
                $(".table-box #searchText").attr("data-masking-type", "CARD_NUMBER_ONLY");
            } else {
                $(".table-box #searchText").removeAttr("maxlength");
                $(".table-box #searchText").removeAttr("data-masking-type");
            }
        },
        gridCustomizationModal: function () {
            const userLoginId = KSM.userLoginId;
            const lsn = userLoginId+'_usageCorporateGridColumns';
            GRID_COLUMN_SETTINGS_MODAL.methods.openGridSettingModal(lsn).then();
        },

        parseAmount: function(amountStr) {
            if (!amountStr) return null;
            // Remove any commas and parse to Long (integer)
            const cleaned = amountStr.replace(/,/g, '');
            const parsed = parseInt(cleaned, 10);
            return isNaN(parsed) ? null : parsed;
        }
    },
    initList: function() {
        Toast.methods.getListInfo(FH.methods.setTable);
    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker();
        $("input:radio[name=dateSelect][value=1M]").trigger("click");
        await _this.methods.doGetProductList();

        const searchType = $("#searchType").val();
        FH.methods.changeSearchType( searchType );
    }
}

window.FH = FH;
FH.init();
