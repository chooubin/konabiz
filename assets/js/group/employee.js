// Toast loaded via script tag;
// File loaded inline;

// 임직원 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    pageSortBy: "",
    prevSortColName: "",
    getList: function () {
        _this.methods.doGetEmpList();
    },
    entpNm: KSM.targetEntpNm,
    isCheckId: false,
    empSmsIsYn: "",
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
            // 검색 영역 - 기간 선택 변경시
            $("#searchDateType").on("change", function() {
                // 특정월의 입사자, 생일자 선택시 검색 종료 기간 비활성화
                let isStartOnly = $(this).val() === "4" || $(this).val() === "5";
                if (isStartOnly) $("#searchEndDate").val("");
                $("#searchEndDate").prop("disabled", isStartOnly);
            });
            $(".table-box #searchType").on("change", function() {
                const type = $(this).val();
                FH.methods.changeSearchType( type );
                $(".table-box #searchText").val( "" );
                $(".table-box #searchText").data( "realValue", "" );
            });
        }
    },
    methods: {
        /* ---------------------------------------- 임직원 리스트 start ---------------------------------------- */
        /**
         * 리스트 table 생성
         */
        setTable: function () {
            let columns = _this.methods.getGridColumns()

            Toast.methods.setGrid({
                columns: columns,
                clickEventColumns : ["stfNm"],
                clickFunction : function (row) {
                    // 임직원 정보 상세 modal 열기
                    EMP_MODAL.methods.openEmployeeModal("info", row.wptlEmpNo, null, _this.empSmsIsYn);
                }
            });
            Toast.grid.on('beforeSort', ev =>{
                ev.stop();
                const prevSortEl = document.querySelector(`th[data-column-name="${_this.prevSortColName}"] a.tui-grid-btn-sorting`);
                if(prevSortEl) prevSortEl.classList.remove('tui-grid-btn-sorting-up', 'tui-grid-btn-sorting-down');

                const colName = ev.columnName;
                if(_this.prevSortColName !== colName) _this.pageSortBy = "";
                let sortType = _this.pageSortBy.slice(-3);
                if(sortType === 'Asc'){
                    _this.pageSortBy = colName + "Dsc";
                    document.querySelector(`th[data-column-name="${colName}"] a.tui-grid-btn-sorting`) ?.classList.add('tui-grid-btn-sorting-down');
                }else if(sortType === 'Dsc'){
                    _this.pageSortBy = "";
                }else {  // default
                    _this.pageSortBy = colName + "Asc";
                    document.querySelector(`th[data-column-name="${colName}"] a.tui-grid-btn-sorting`) ?.classList.add('tui-grid-btn-sorting-up');
                }

                //console.log(`Sort requested: ${colName}, ascending: ${_this.pageSortBy}`);
                _this.page = 1;
                _this.methods.doGetEmpList();
                _this.prevSortColName = colName;
            });
            _this.methods.doGetEmpList();
        },

        /**
         * 그리드 컬럼
         */
        getGridColumns: function () {
            let columns =  [
                {
                    header: 'NO',
                    align: 'center',
                    width: 100,
                    name: 'rowKey',
                    formatter: function ({row, column, value}) {
                        return ((FH.page - 1) * FH.limit) + (row.rowKey + 1);
                        // 번호 역순으로 바인딩시
                        // return FH.virtualNum - row.rowKey;
                    }
                },
                {
                    header: '사원번호',
                    align: 'center',
                    minWidth: 100,
                    name: 'incmpEmpNo',
                    sortable: true
                },
                {
                    header: '임직원명',
                    align: 'center',
                    width: 150,
                    name: 'stfNm',
                    renderer: {
                        styles: {
                            cursor: "pointer",
                            color: "#0028b6",
                            textDecoration: "underline"
                        }
                    },
                    sortable: true
                },
                {
                    header: '여권명(영문)',
                    align: 'center',
                    width: 180,
                    name: 'engFullNm',
                    formatter: function ({row, column, value}) {
                        return Util.emptyString(row.engFullNm);
                    }
                },
                {
                    header: '입사일',
                    align: 'center',
                    width: 140,
                    name: 'entcoDt',
                    formatter: function ({row, column, value}) {
                        return Util.emptyString(row.entcoDt);
                    },
                    sortable: true
                },
                {
                    header: '보유카드 수',
                    align: 'center',
                    width: 110,
                    name: 'cardCount'
                },
                {
                    header: '부서',
                    align: 'center',
                    minWidth: 100,
                    name: 'deptNm'
                },
                {
                    header: '직책',
                    align: 'center',
                    minWidth: 100,
                    name: 'rsbNm'
                },
                {
                    header: '직급',
                    align: 'center',
                    minWidth: 100,
                    name: 'jgdNm'
                },
                {
                    header: '상태',
                    align: 'center',
                    width: 100,
                    name: 'wptlEntpWkinStNm'
                }

            ];

            if(_this.empSmsIsYn === "Y") {
                columns.push(
                    {
                        header: "결제 SMS 알림",
                        align: "center",
                        width: 100,
                        name: "smsNfctYnNm"
                    }
                );
            }

            return columns;
        },
        /**
         * 임직원 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetEmpList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download( '/api/group/doGetEmpList', params );
                return;
            }
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                pageSortBy: _this.pageSortBy,
                wptlEntpNo: KSM.targetWptlEntpNo,                    // 기업 시퀀스
                searchType: Number($("#searchType").val()),          // 검색 분류
                searchEmpStatus: $("#searchEmpStatus").val(),        // 재직 상태
                searchDateType: Number($("#searchDateType").val()),  // 검색 기간 분류
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim(),     // 검색 종료일
                provideCardYn: $("#provideCardYn").val()             // 카드 지급 여부
            }
            if( _this.params.searchType === 6 || _this.params.searchType === 8 ) {
                _this.params.searchText = $("#searchText").data( "realValue" );
            } else {
                _this.params.searchText = $("#searchText").val().trim();
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/group/doGetEmpList', _this.params);
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
                // _this.empSmsIsYn = entity.extraValue.empSmsIsYn;
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
         * 임직원 결제 SMS 알림 설정 여부 조회
         * @returns {Promise<void>}
         */
        doGetEmpSmsIsYCount: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo
            }

            const res = await ServiceExec.post('/common/doGetEmpSmsIsYCount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            if (code === 1) {
                _this.empSmsIsYn = entity;

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
        changeSearchType: function( searchType, isInit ) {
            if( searchType === "6" ) {
                $(".table-box #searchText").attr( "maxlength", "16" );
                $(".table-box #searchText").attr( "data-masking-type", "CARD_NUMBER_ONLY" );
                if(isInit) {
                    $(".table-box #searchText").data("realValue", Toast.listInfo.params["searchText"]);
                }
            } else if( searchType === "7" ) {
                $(".table-box #searchText").attr("maxlength", "4");
                $(".table-box #searchText").removeAttr( "data-masking-type" );
            } else if( searchType === "8" ) {
                $(".table-box #searchText").attr( "maxlength", "4" );
                $(".table-box #searchText").attr( "data-masking-type", "ALL" );
                if(isInit) {
                    $(".table-box #searchText").data("realValue", Toast.listInfo.params["searchText"]);
                }
            } else {
                $(".table-box #searchText").removeAttr( "maxlength" );
                $(".table-box #searchText").removeAttr( "data-masking-type" );
            }
        }
        /* ---------------------------------------- 임직원 리스트 end ---------------------------------------- */
    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker();

        await FH.methods.doGetEmpSmsIsYCount();
        await Toast.methods.getListInfo(FH.methods.setTable);

        const searchType = $("#searchType").val();
        FH.methods.changeSearchType( searchType, true );
    }
}

window.FH = FH;
FH.init();