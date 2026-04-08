// Toast loaded via script tag;

// 복지카드 이용 내역 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    checkedRowKeyList: [],
    getList: function () {
        _this.methods.doGetWelfareUsageList();
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
                _this.methods.doGetCardCashList();
            });

            $(".table-box #searchType").on("change", function () {
                const type = $(this).val();
                FH.methods.changeSearchType(type);
                $(".table-box #searchText").val("");
                $(".table-box #searchText").data("realValue", "");
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


                // Over 3 months → disable search
                if (!Util.checkOverSearchDateLimit(StartDate, EndDate, 3, "month")) {
                    searchBtn.prop("disabled", true);
                }

                // Over 1 year → disable both
                if (!Util.checkOverSearchDateLimit(StartDate, EndDate, 1, "year")) {
                    searchBtn.prop("disabled", true);
                    downloadBtn.prop("disabled", true);
                }
            }

            // Radio button logic
            $("input[name='dateSelect']").on("change", function () {
                //Removing all manual date related error
                $("#dateErrorMessage").text("").css("display", "none");
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

            // Start & End Date field listeners
            $("#searchStartDate, #searchEndDate").on("change", validateDateRange);

            // Start & End Date field listeners for manual date entering
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
        },
    },
    methods: {
        /**
         * 기업 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                        // 기업 시퀀스
                wptlPrdTypeCdList: [ConstCode.CODES_PRODUCT.PRD_TYPE.WELFARE], // 상품 타입 - 복지카드만
                useYn: "Y"                                               // 사용중 여부 (사용중인 카드만 조회)
            }
            // console.log(params);
            const res = await ServiceExec.jsonPost('/common/doGetProductList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let param_prdId = $("#param_prdId").val();
            let html = '<option value="" _prdId=""' + (Util.isEmpty(param_prdId) ? 'selected' : '') + '>전체</option>';
            if (code === 1) {
                for (let i = 0; i < entity.length; i++)
                    html += '<option value="' + entity[i].wptlPrdNo + '" _prdId="' + entity[i].prdId + '" ' + (entity[i].prdId === param_prdId ? 'selected' : '') + '>' + entity[i].prdNm + '</option>';
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
         * 카드 캐시 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetCardCashList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                wptlPrdNo: $("#wptlPrdNo").val(),  // 상품 시퀀스
                searchPrdType: 1                   // 복지카드타입
            }
            // console.log(params);
            const res = await ServiceExec.post('/common/doGetCardCashList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let html = '<option value="">전체</option>';
            if (code === 1) {
                for (let i = 0; i < entity.length; i++)
                    html += '<option value="' + entity[i].crdCashId + '">' + entity[i].crdCashNm + '</option>';
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
            $("#crdCashId").html(html);
        },
        /**
         * 리스트 table 생성
         */
        setTable: function () {
            const userLoginId = KSM.userLoginId;
            const lsn = userLoginId + '_usageWelfareGridColumns';

            class CheckboxRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;

                    const el = document.createElement("label");
                    el.className = "checkbox tui-grid-row-header-checkbox";
                    el.setAttribute("for", String(rowKey));
                    el.style.display = "block";

                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.className = "hidden-input";
                    input.id = String(rowKey);
                    input.name = "taxCheck";
                    input.setAttribute("_svcNm", grid.getValue(rowKey, "svcNm"));
                    input.setAttribute("_rowKey", rowKey);

                    const p = document.createElement("p");
                    const em = document.createElement("em");
                    const span = document.createElement("span");
                    span.className = "custom-input";

                    p.appendChild(em);
                    p.appendChild(span);

                    el.appendChild(input);
                    el.appendChild(p);

                    el.addEventListener("click", (ev) => {
                        ev.preventDefault();

                        // Check if row is disabled
                        const isDisabled = input.disabled || el.classList.contains('disabled');

                        if (!isDisabled) {
                            grid[!input.checked ? "check" : "uncheck"](rowKey);
                        }
                    });

                    this.el = el;
                    this.input = input;
                    this.span = span;
                    this.em = em;
                    this.render(props);
                }

                getElement() {
                    return this.el;
                }

                render(props) {
                    const {grid, rowKey} = props;
                    const input = this.el.querySelector(".hidden-input");
                    const span = this.span;
                    const em = this.em;
                    const checked = Boolean(props.value);

                    // Get transaction type from row data
                    const tranSubTypeNm = grid.getValue(rowKey, "tranSubTypeNm") || '';

                    // Only enable checkbox for '지불' (payment) and '취소' (cancellation)
                    const allowedTypes = ['지불', '취소'];
                    const isAllowedType = allowedTypes.some(type =>
                        tranSubTypeNm.includes(type)
                    );

                    // Update disabled state and visual styling
                    if (!isAllowedType) {
                        input.checked = false;
                        input.disabled = true;
                        this.el.classList.add('disabled');

                        // Make the checkbox box itself grey
                        em.style.backgroundColor = '#80808080';
                        em.style.cursor = 'not-allowed';

                        Toast.grid.disableRowCheck(rowKey);
                    } else {
                        input.checked = checked;
                        input.disabled = false;
                        this.el.classList.remove('disabled');

                        // Restore checkbox box styling
                        em.style.backgroundColor = '';
                        em.style.cursor = 'pointer';

                        Toast.grid.enableRowCheck(rowKey);
                    }
                    setTimeout(() => {
                        const header = grid.el.querySelector('.tui-grid-cell-row-header input[name="_checked"]');
                        if (header) header.disabled = false;
                    }, 0);
                }
            }

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
                    name: "tranDt",
                    default: true
                },
                {
                    header: "상품명",
                    align: "center",
                    minWidth: 360,
                    name: "svcNm",
                    default: true
                },
                {
                    header: "포인트명",
                    align: "center",
                    minWidth: 360,
                    name: "cashNm"
                },
                {
                    header: "카드번호",
                    align: "center",
                    minWidth: 240,
                    name: "cdno",
                    default: true
                },
                {
                    header: "임직원명",
                    align: "center",
                    minWidth: 180,
                    name: "stfNm"
                },
                {
                    header: "사원번호",
                    align: "center",
                    minWidth: 180,
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
                    header: "상태",
                    align: "center",
                    minWidth: 150,
                    name: "empSt",
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
                            : `${row.bizLicenseNo.substring(0, 3)}-${row.bizLicenseNo.substring(3, 5)}-${row.bizLicenseNo.substring(5, 10)}`;
                    }
                },
                {
                    header: "거래유형",
                    align: "center",
                    minWidth: 100,
                    name: "tranSubTypeNm"
                },
                {
                    header: "거래타입",
                    align: "center",
                    minWidth: 100,
                    name: "apvTrNm"
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
                    header: "모아서 결제 번호",
                    align: "center",
                    minWidth: 110,
                    name: "itgCltId",
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                },
                {
                    header: "포인트 사용",
                    align: "center",
                    minWidth: 150,
                    name: "pointAmt",
                    default: true
                },
                {
                    header: "유효기간",
                    align: "center",
                    minWidth: 120,
                    name: "expDt",
                    formatter: function ({row, column, value}) {
                        return Util.isEmpty(value) || value === '-' ? '-' : value
                    }
                }
            ]
            const savedCols = JSON.parse(localStorage.getItem(lsn))?.actualCols;
            const checkUncheckAll = JSON.parse(localStorage.getItem(lsn))?.checkUncheckAll;
            let actualColumns = []
            if (savedCols && savedCols.length > 0) {
                actualColumns = Util.mergeTwoObjArrays(defColumns, savedCols, 'name');
                Util.storeColsInLocal(actualColumns, checkUncheckAll, lsn);
            } else {
                actualColumns = defColumns
                Util.storeColsInLocal(actualColumns, true, lsn);
            }

            Toast.methods.setGrid({
                rowHeaders: [
                    {
                        type: "checkbox",
                        minWidth: 50,
                        renderer: {
                            type: CheckboxRenderer
                        }
                    }
                ],
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

            _this.methods.doGetWelfareUsageList();

        },
        /**
         * 복지카드 이용 내역 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetWelfareUsageList: async function (type = 1) {
            const searchStartDate = $("#searchStartDate").val();
            if (Util.isEmpty(searchStartDate)) {
                alert("기간 시작일을 입력해주세요.");
                return false;
            }
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                      // 기업 시퀀스
                searchType: $("#searchType").val(),                    // 검색 분류
                searchStartDate: $("#searchStartDate").val().trim(),   // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim(),       // 검색 종료일
                prdId: $("#wptlPrdNo option:selected").attr("_prdId"), // 상품 ID
                crdCashId: $("#crdCashId").val(),                      // 캐시 ID
                par: $("#param_par").val().trim(),                      // 카드 PAR (복지카드 관리 > 상세 > 카드이용내역 으로 진입시)
                dateSelect: $("input:radio[name=dateSelect]:checked").val(), // 기간 검색 버튼 값
                searchEmployeeStatus: $("#searchEmployeeStatus").val(),      // 재직 상태
                searchTranType: $("#searchTranType").val()          // 거래 유형
            }

            if (_this.params.searchType === "6") {
                _this.params.searchText = $("#searchText").data("realValue");
            } else {
                _this.params.searchText = $("#searchText").val().trim();
            }
             if (type === -1) {
                 const params = {..._this.params};
                 params.limit = -1;
                 const res = await ServiceExec.post("/api/usage/doGetWelfareUsageList", _this.params);
                 const entity = res.entity;
                 if (entity.totalCount === 0) {
                     alert("다운로드 할 데이터가 없습니다.");
                     return;
                 }
                 DOWNLOAD_MODAL.methods.download("/api/usage/doGetWelfareUsageList", params);
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
            const res = await ServiceExec.post('/api/usage/doGetWelfareUsageList', _this.params);
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
        resetSearchInit: function () {
            $("input:radio[name=dateSelect][value=1M]").trigger("click");
        },
        changeSearchType: function (searchType) {
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
            const lsn = userLoginId + '_usageWelfareGridColumns';
            GRID_COLUMN_SETTINGS_MODAL.methods.openGridSettingModal(lsn).then();
        },

        downloadPdf: async function (crdType) {
            const checkedRows = Toast.grid.getCheckedRows();

            const validRows = checkedRows.filter(row => {
                const tranSubTypeNm = row.tranSubTypeNm || '';
                return ['지불', '취소'].some(type => tranSubTypeNm.includes(type));
            });

            if (validRows.length === 0) {
                alert("다운로드할 항목을 선택해주세요.");
                return;
            }

            // Map the grid data to match backend DTO structure
            const pdfDataList = validRows.map(item => ({
                transactionAmount: item.pointAmt,
                cardType: item.svcNm,
                cardNumber: item.cdno,
                transactionDateTime: item.tranDt,
                transactionType: item.tranSubTypeNm,
                approvalNumber: item.apvNo || '',
                supplyPrice: null,
                surtax: null,
                serviceCharge: null,
                totalTransactionAmount: item.pointAmt,
                affiliateStoreName: item.mctNm || '',
                industry: item.bztpNm || '',
                affiliateNumber: item.mctId || '',
                affiliateStoreAddress: '',
                businessRegistrationNumber: item.bizLicenseNo || '',
                apvDt: item.apvDt || '',
                nrNo: item.nrNo || '',
                par: item.par || ''
            }));

            const params = {
                limit: -1,
                wptlEntpNo: KSM.targetWptlEntpNo,
                wptlPrdNo: $("#wptlPrdNo").val(),
                crdType: crdType,
                checkedItems: pdfDataList
            };

            await ServiceExec.jsonDownPost("/api/usage/downloadUsageReq", params);
        },


        parseAmount: function(amountStr) {
            if (!amountStr) return null;
            // Remove any commas and parse to Long (integer)
            const cleaned = amountStr.replace(/,/g, '');
            const parsed = parseInt(cleaned, 10);
            return isNaN(parsed) ? null : parsed;
        }


    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker();
        $("input:radio[name=dateSelect][value=1M]").trigger("click");
        await _this.methods.doGetProductList();
        await _this.methods.doGetCardCashList();
        Toast.methods.getListInfo(FH.methods.setTable);

        const searchType = $("#searchType").val();
        FH.methods.changeSearchType(searchType);
    }
}


window.FH = FH;
FH.init();
