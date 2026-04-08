import "/js/common/Toast.js?version=2025010801";
import "/js/common/File.js?version=2025010801";

// 복지 카드 관리 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    userCardUploadList: [],
    userCardUploadSaveYn: "N",
    getList: function () {
        _this.methods.doGetWelfareCardList();
    },
    entpNm: KSM.targetEntpNm,
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
            // 상품명 영역 - 상품 선택 변경시
            $("#wptlPrdNo").on("change", function () {
                _this.methods.doGetCardCashList();
            });

            $(".table-box #searchType").on("change", function() {
                const type = $(this).val();
                FH.methods.changeSearchType( type );
                $(".table-box #searchText").val( "" );
                $(".table-box #searchText").data( "realValue", "" );
            });
            // 🟢 Start & End Date field listeners for manual date entering
            $("#searchStartDate, #searchEndDate")
                .on("change", function () {
                    Util.validateManualDates();
                })
                .on("blur", function () {
                    Util.validateManualDates();
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
         * 리스트 table 생성
         */
        setTable: function () {
            // "충전포인트", "사용포인트" cell 조회 확인 버튼 customRenderer
            class CustomRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;
                    grid.setValue(rowKey, props.columnInfo.name, "");
                    let el;
                    el = document.createElement("a");
                    el.className = "label";
                    el.style.cursor = "pointer";
                    el.appendChild(document.createTextNode("확인"))

                    el.addEventListener("click", (ev) => {
                        ev.preventDefault();
                        FH.methods.doGetWelfarePointInfo(rowKey);
                    })
                    this.el = el;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                    if (!Util.isEmpty(props.value)) {
                        let el;
                        el = document.createElement("div");
                        el.className = "tui-grid-cell-content";
                        el.appendChild(document.createTextNode(String(props.value)));
                        this.el.replaceWith(el);
                    }
                }
            }
            const userLoginId = KSM.userLoginId;
            const lsn = userLoginId + '_cardWelfareGridColumns';
            const defColumns = [
                {
                    header: "NO",
                    align: "center",
                    width: 100,
                    name: "rowKey",
                    formatter: function ({row, column, value}) {
                        return ((FH.page - 1) * FH.limit) + (row.rowKey + 1);
                        // 번호 역순으로 바인딩시
                        // return FH.virtualNum - row.rowKey;
                    },
                    default: true
                },
                {
                    header: "상품명",
                    align: "center",
                    name: "prdNm",
                    minWidth: 200,
                    default: true
                },
                {
                    header: "카드포인트명",
                    align: "center",
                    minWidth: 360,
                    name: "cashNm"
                },
                {
                    header: "카드번호",
                    align: "center",
                    width: 230,
                    name: "cdno",
                    renderer: {
                        styles: {
                            cursor: "pointer",
                            color: "#0028b6",
                            textDecoration: "underline"
                        }
                    },
                    default: true,
                    sortable: true
                },
                {
                    header: "유효기간",
                    align: "center",
                    width: 100,
                    name: "crdExnYrMmDd"
                },
                {
                    header: "카드 상태",
                    align: "center",
                    width: 100,
                    name: "cardStatus"
                },
                {
                    header: "앱등록여부",
                    align: "center",
                    width: 100,
                    name: "appConnectYn"
                },
                {
                    header: "카드 지급",
                    align: "center",
                    width: 100,
                    name: "crdDsbNm"
                },
                {
                    header: "지급일",
                    align: "center",
                    width: 140,
                    name: "crdDsbDt",
                    formatter: function ({row, column, value}) {
                        return Util.emptyString(row.crdDsbDt);
                    },
                    sortable: true
                },
                {
                    header: "임직원명",
                    align: "center",
                    width: 150,
                    name: "stfNm",
                    formatter: function ({row, column, value}) {
                        return Util.emptyString(row.stfNm);
                    },
                    sortable: true
                },
                {
                    header: "사원번호",
                    align: "center",
                    minWidth: 120,
                    name: "incmpEmpNo",
                    formatter: function ({row, column, value}) {
                        return Util.emptyString(row.incmpEmpNo);
                    },
                    sortable: true
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
                    name: "wptlEntpWkinStNm",
                    formatter: function ({row, column, value}) {
                        return Util.emptyString(row.wptlEntpWkinStNm);
                    }
                },
                {
                    header: "충전 포인트",
                    align: "center",
                    minWidth: 120,
                    name: "rechargePoint",
                    renderer: CustomRenderer,
                    default: true
                },
                {
                    header: "사용 포인트",
                    align: "center",
                    minWidth: 120,
                    name: "usePoint",
                    renderer: CustomRenderer,
                    default: true
                },
                {
                    header: "잔여 포인트",
                    align: "center",
                    minWidth: 120,
                    name: "remainPoint",
                    default: true
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
                columns: actualColumns,
                clickEventColumns : ["cdno"],
                clickFunction : function (row) {
                    // 복지 카드 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/card/welfare/detail", { par : row.par});
                }
            })
            _this.methods.doGetWelfareCardList();
            _this.methods.doGetCardCashList();
        },
        /**
         * 기업 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                          // 기업 시퀀스
                searchPrdType: 1,           // 상품 검색 타입 (법인 20,30,40,50)
                useYn: "Y"                                                 // 사용중 여부 (사용중인 카드만 조회)
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
                for (let i = 0; i < entity.length; i++) {
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
         * 복지 카드 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetWelfareCardList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/card/doGetWelfareCardList', params);
                return;
            }
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                            // 기업 시퀀스
                wptlPrdNo: $("#wptlPrdNo").val(),                            // 상품 시퀀스
                searchType: $("#searchType").val(),                          // 검색 분류
                searchEmployeeStatus: $("#searchEmployeeStatus").val(),      // 재직 상태
                searchDateType: $("#searchDateType").val(),                  // 검색 기간 분류
                searchStartDate: $("#searchStartDate").val().trim(),         // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim(),             // 검색 종료일
                dateSelect: $("input:radio[name=dateSelect]:checked").val(), // 기간 검색 버튼 값
                searchCardStatus: $("#searchCardStatus").val(),              // 카드 상태
                searchProvideCard: $("#searchProvideCard").val(),             // 카드 지급 여부
                crdCashId: $("#crdCashId").val()                            // 캐시 ID
            }

            if( _this.params.searchType === "2" ) {
                _this.params.searchText = $("#searchText").data( "realValue" );
            } else {
                _this.params.searchText = $("#searchText").val().trim();
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/card/doGetWelfareCardList', _this.params);
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
         * 복지 카드 충전/사용 포인트 조회
         * @param rowKey
         * @returns {Promise<void>}
         */
        doGetWelfarePointInfo: async function (rowKey) {
            const params = {
                par: Toast.grid.getValue(rowKey, "par"), // 상품 par
                crdCashId: Toast.grid.getValue(rowKey, "crdCashId")
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doGetPointInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                Toast.grid.setValue(rowKey, "rechargePoint", entity.rechargePoint);
                Toast.grid.setValue(rowKey, "usePoint", entity.usePoint);
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

        /* ---------------------------------------- 복지카드 modal start ---------------------------------------- */
        /**
         * 복지카드 modal 열기
         * @param modalType (엑셀: excel, 등록: reg, 수정: mod, 상세: info)
         * @returns {Promise<boolean>}
         */
        openWelfareModal: async function (modalType = "excel") {
            _this.userCardUploadSaveYn = "N";
            // _this.isCheckId = false; // 사원번호 중복 확인 flag 초기화
            const params = {
                path: "modal/welfare",
                htmlData: {
                    modalType: modalType,
                    entpNm: _this.entpNm
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#welfareModal").length) $("#welfareModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#welfareModal").modal({show: true});
        },

        /**
         * 미지급카드 사용자 일괄 등록 modal - 엑셀 업로드
         * @param saveYn
         * @returns {Promise<boolean>}
         */
/*        doRegistWelfareExcel: async function (saveYn = "N") {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                   // 기업 시퀀스
                saveYn: saveYn,                                     // 실제 저장 여부
                tempFileName: "",                                   // 업로드한 엑셀 파일 이름
                wptlPrdTypeCd: "10"                                 //상품 타입
            }
            if (saveYn === "N") {
                let $tempFile = $("#welfareModal #userCardExcelFile");
                let $tempFileName = $("#welfareModal #tempFileName");
                $tempFileName.val("");
                params.userCardExcelFile = $tempFile[0].files[0];    // 임직원 엑셀 파일

                const res = await ServiceExec.formPostAsync('/api/card/doRegistUserCardExcel', params);
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
                const $welfareModal = $("#welfareModal");
                params.tempFileName = $welfareModal.find("#tempFileName").val() // 임직원 엑셀 파일 이름
                if (Util.isEmpty(params.tempFileName)) {
                    $welfareModal.modal({show: false});
                    $welfareModal.remove();
                    return false;
                }
                if (!confirm("임직원 일괄 등록 하시겠습니까?")) return false;
                // console.log(params);
                const res = await ServiceExec.formPost('/api/card/doRegistUserCardExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    alert("임직원 일괄 등록하였습니다.");
                    $welfareModal.modal({show: false});
                    $welfareModal.remove();
                    // 복지 카드 리스트 갱신
                    _this.page = 1;
                    _this.methods.doGetWelfareCardList();
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
        },*/
        doRegistWelfareExcel: async function (el) {
            _this.userCardUploadList = [];
            _this.userCardUploadSaveYn = "N";

            const props = {
                fileInput: el,
                uploadUrl: "/api/card/doRegistUserCardExcel",
                columnTitles: ["카드번호", "사원번호"],
                setColumns: function (line) {
                    line.cdNo = Util.trim(line["카드번호"]);
                    line.incmpEmpNo = Util.trim(line["사원번호"]);
                    line.wptlPrdTypeCd = "10";      // 법인상품타입 (20, 30, 40, 50)
                    line.wptlEntpNo = KSM.targetWptlEntpNo;
                    if( Util.isEmpty(line.incmpEmpNo) && Util.isEmpty(line.stfNm) ) {
                        return null;
                    } else {
                        return line;
                    }
                },
                setUploadList: function(entity) {
                    _this.userCardUploadList.push(...entity.userCardUploadList);
                },
                setComplete: function(result) {
                    if( result.rejectCount < 1 ) {
                        _this.userCardUploadSaveYn = "Y";
                    }
                }
            }
            await FILE.methods.fileUpload(props);
        },
        doRegistWelfareExcelConfirm:  async function() {
            const $welfareModal = $("#welfareModal");
            if (_this.userCardUploadSaveYn !== "Y") {
                $welfareModal.modal({show: false});
                $welfareModal.remove();
                return false;
            }
            if (!confirm("사용자 일괄 등록 하시겠습니까?")) return false;
            startLoading();
            const params = {
                userCardUploadList: _this.userCardUploadList
            }
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/card/doRegistUserCardExcelConfirm', params);
            stopLoading();
            const code = res.code;
            const message = res.message;
            const entity = res.entity;

            if (code === 1) {
                alert("사용자 일괄 등록하였습니다.");
                $welfareModal.modal({show: false});
                $welfareModal.remove();
                _this.page = 1;
                await _this.methods.doGetCorporateCardList();
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
        },
        doDownCardNoExcel: async function () {
            const params = {
                wptlEntpNo: _this.params.wptlEntpNo,
                limit: -1
            };
            DOWNLOAD_MODAL.methods.download('/api/card/doDownCardNoExcel', params);
            return;
        },
        changeSearchType: function( searchType ) {
            if (searchType === "2") {
                $(".table-box #searchText").attr("maxlength", "16");
                $(".table-box #searchText").attr("data-masking-type", "CARD_NUMBER_ONLY");
            } else {
                $(".table-box #searchText").removeAttr("maxlength");
                $(".table-box #searchText").removeAttr("data-masking-type");
            }
        },
        gridCustomizationModal: function () {
            const userLoginId = KSM.userLoginId;
            const lsn = userLoginId + '_cardWelfareGridColumns';
            GRID_COLUMN_SETTINGS_MODAL.methods.openGridSettingModal(lsn).then();
        },
        resetSearchInit: function () {
            _this.methods.doGetCardCashList();
        }
    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker("all");
        await _this.methods.doGetProductList();

        Toast.methods.getListInfo(FH.methods.setTable);

        const searchType = $("#searchType").val();
        FH.methods.changeSearchType( searchType );
    }
}

window.FH = FH;
FH.init();