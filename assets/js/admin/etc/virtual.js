import "/js/common/Toast.js?version=2025052101";
import "/js/common/File.js?version=2025010801";

// 관리자 - 가상 계좌 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetVirtualAccountList();
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
                        header: "은행",
                        align: "center",
                        minWidth: 100,
                        name: "bankNm"
                    },
                    {
                        header: "모계좌",
                        align: "center",
                        minWidth: 100,
                        name: "prtAcno"
                    },
                    {
                        header: "가상계좌",
                        align: "center",
                        minWidth: 100,
                        name: "vtlAcno"
                    },
                    {
                        header: "예치금계좌",
                        align: "center",
                        minWidth: 100,
                        name: "dpstAcno"
                    },
                    {
                        header: "상품 신청번호",
                        align: "center",
                        width: 160,
                        name: "prdSno",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.prdSno);
                        }
                    },
                    {
                        header: "KA명",
                        align: "center",
                        minWidth: 100,
                        name: "entpNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.entpNm);
                        }
                    },
                    {
                        header: "충전상명 / 포인트명",
                        align: "center",
                        minWidth: 100,
                        name: "rcgCashNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.rcgCashNm);
                        }
                    },
                    {
                        header: "충전상ID / 포인트ID",
                        align: "center",
                        width: 200,
                        name: "rcgCashId",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.rcgCashId);
                        }
                    },
                    {
                        header: "충전상 / 포인트 구분",
                        align: "center",
                        width: 100,
                        name: "rcgCashType",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.rcgCashType);
                        }
                    }
                ]
            })
            _this.methods.doGetVirtualAccountList();
        },
        /**
         * 가상 계좌 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetVirtualAccountList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/admin/etc/doGetVirtualAccountList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(),                  // 검색 분류
                searchAccountType: $("#searchAccountType").val(),    // 충전상/캐시 구분
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일 (등록 기간)
                searchEndDate: $("#searchEndDate").val().trim()      // 검색 종료일 (등록 기간)
            }
            if( _this.params.searchType === "2" || _this.params.searchType === "3" || _this.params.searchType === "4" ) {
                _this.params.searchText = $("#searchText").data( "realValue" );
            } else {
                _this.params.searchText = $("#searchText").val().trim();
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/etc/doGetVirtualAccountList', _this.params);
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
         * 가상계좌 modal 열기
         * @returns {Promise<void>}
         */
        openVirtualModal: async function () {
            const params = {
                path: "modal/virtual"
            };
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#virtualModal").length) $("#virtualModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#virtualModal").modal({show: true});
        },
        /**
         * 엑셀 업로드
         * @returns {Promise<void>}
         */
        doUploadVirtualAccountExcel: async function () {
            let $tempFile = $("#virtualExcelFile");
            let $tempFileName = $("#tempFileName");
            $tempFileName.val("");
            const params = {
                file: $tempFile[0].files[0] // 가상계좌 엑셀 파일
            }
            // console.log(params);
            const res = await ServiceExec.formPostAsync('/api/admin/etc/doUploadVirtualAccountExcel', params);
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
                    // case :
                    //     break;
                    default:
                        alert(message);
                        break;
                }
            }
            $tempFile.val("");
        },
        /**
         * 엑셀 업로드 결과 저장
         * @returns {Promise<void>}
         */
        doSaveVirtualAccountExcel: async function () {
            const $virtualModal = $("#virtualModal");
            const params = {
                tempFileName: $virtualModal.find("#tempFileName").val() // 가상계좌 엑셀 파일 이름
            }
            if (Util.isEmpty(params.tempFileName)) {
                $virtualModal.modal({show: false}).remove();
                return;
            }
            if (!confirm("계좌 정보를 등록 하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/etc/doSaveVirtualAccountExcel', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("계좌 정보를 등록하였습니다.");
                $virtualModal.modal({show: false}).remove();
                // 가상계좌 리스트 갱신
                _this.page = 1;
                _this.methods.doGetVirtualAccountList();
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
        changeSearchType: function( searchType ) {
            if (searchType === "2" || searchType === "3" || searchType === "4") {
                $(".table-box #searchText").attr("data-masking-type", "ACCOUNT_NUMBER");
            } else {
                $(".table-box #searchText").removeAttr("data-masking-type");
            }
        }
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker();
        Toast.methods.getListInfo(FH.methods.setTable);

        const searchType = $("#searchType").val();
        FH.methods.changeSearchType( searchType );
    }
}

window.FH = FH;
FH.init();