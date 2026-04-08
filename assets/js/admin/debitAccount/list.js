import "/js/common/Toast.js?version=2025052101";

// 관리자 - 계약 현황 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    unmaskYn: 'N',
    getList: function () {
        _this.methods.doGetDebitAccountList();
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
                            // 번호 역순으로 바인딩시
                            // return FH.virtualNum - row.rowKey;
                        }
                    },
                    {
                        header: "회사명",
                        align: "center",
                        width: 300,
                        name: "entpNm",
                    },
                    {
                        header: "사업자등록번호",
                        align: "center",
                        width: 140,
                        name: "bzno",
                        formatter: function ({row, column, value}) {
                            return (Util.isEmpty(row.bzno) || row.bzno === "-")
                                ? '-'
                                : `${row.bzno.substring(0, 3)}-${row.bzno.substring(3, 5)}-${row.bzno.substring(5, 10)}`;
                        }
                    },
                    {
                        header: "은행",
                        align: "center",
                        width: 180,
                        name: "bankNm"
                    },
                    {
                        header: "기업 계좌번호",
                        align: "center",
                        width: 200,
                        name: "defpayAcno"
                    },
                    {
                        header: "예금주",
                        align: "center",
                        minWidth: 200,
                        name: "dpsrNm",
                    },
                    {
                        header: "상태",
                        align: "center",
                        width: 130,
                        name: "dbitAcnStNm",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        },
                    },
                    {
                        header: "출금이체 신청일",
                        align: "center",
                        width: 180,
                        name: "applyDate",
                    },
                    {
                        header: "출금이체 동의서",
                        align: "center",
                        width: 250,
                        name: "defpayTsfrAplfFileNm",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        },
                    },
                    {
                        header: "연결 카드",
                        align: "center",
                        width: 140,
                        name: "connectCardCount",
                        formatter: function ({row, column, value}) {
                            return value === 0 ? '없음' : value + "개";
                        },

                    }
                ],
                clickEventColumns: ["dbitAcnStNm", "defpayTsfrAplfFileNm"],
                clickFunction: function (row, columnName) {
                    if (columnName === 'dbitAcnStNm') {
                        FH.methods.openModal(row.wlpoDbitAcnSno);
                    } else if (columnName === 'defpayTsfrAplfFileNm') {
                        const path = encodeURIComponent(row.defpayTsfrAplfFilePthNm);
                        window.open(`/viewer/image-viewer?url=${path}`);
                    }
                }
            })
            _this.methods.doGetDebitAccountList();
        },
        /**
         * 기업출금계좌리스트
         * @returns {Promise<void>}
         */
        doGetDebitAccountList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = {..._this.params};
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/admin/company/doGetDebitAccountList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(),                  // 검색 분류
                searchText: $("#searchText").val().trim(),           // 검색어
                searchStatus: $("#searchStatus").val(),          // 계약 상태
                dateSelect: $("input:radio[name=dateSelect]:checked").val(), // 기간 검색 버튼 값
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim()      // 검색 종료일
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/admin/company/doGetDebitAccountList', _this.params);
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
         * 반려
         *
         * @param wlpoDbitAcnSno
         */
        doRejectDebitAccount: async function(wlpoDbitAcnSno) {
            if (!confirm("계좌 등록을 반려하시겠습니까?")) {
                return;
            }

            const params = {
                wlpoDbitAcnSno: wlpoDbitAcnSno
            }
            const res = await ServiceExec.post('/api/admin/company/doRejectDebitAccount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("반려되었습니다.");
                $("#adminDebitAccountModal").modal({show: false}).remove();
                // 운영자 리스트 갱신
                _this.methods.doGetDebitAccountList();
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
         * 등록승인
         *
         * @param wlpoDbitAcnSno
         */
        doConfirmDebitAccount: async function(wlpoDbitAcnSno) {
            if (!confirm("계좌를 등록하시겠습니까?")) {
                return;
            }

            const params = {
                wlpoDbitAcnSno: wlpoDbitAcnSno
            }
            const res = await ServiceExec.post('/api/admin/company/doConfirmDebitAccount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("계좌 등록이 완료되었습니다.");
                $("#adminDebitAccountModal").modal({show: false}).remove();
                // 운영자 리스트 갱신
                await _this.methods.doGetDebitAccountList();
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        break;
                }
                await _this.methods.openModal(wlpoDbitAcnSno, _this.unmaskYn === 'N' ? 'mask' : 'unmask');
                await _this.methods.doGetDebitAccountList();
            }
        },
        /**
         * 기업출금계좌 상세 modal 열기
         * @param wlpoDbitAcnSno (직불계좌시퀀스)
         * @returns {Promise<boolean>}
         */
        openModal: async function (wlpoDbitAcnSno, maskingType = "mask") {
            _this.unmaskYn = maskingType === "mask" ? "N" : "Y";
            const apiParams = {
                wlpoDbitAcnSno: Number(wlpoDbitAcnSno),
                unmaskYn: _this.unmaskYn,
            }
            const res = await ServiceExec.post('/api/company/doGetDebitAccountInfo', apiParams);
            const params = {
                path: "modal/adminDebitAccount",
                htmlData: {
                    debitAccountInfo: res.entity,
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#adminDebitAccountModal").length) $("#adminDebitAccountModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#adminDebitAccountModal").modal({show: true});
        },
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker();
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();