import "/js/common/Toast.js?version=2025080401";
import "/js/common/Auth.js?version=2025010801";

// 정기 지급 현황 js
let _this;
const nowDate = moment().format('YYYY/MM/DD');
const lastMonth = moment(nowDate).subtract(1, 'month').format('YYYY/MM/DD');
const FH = {
    params: {},
    prdList: [],
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    wlpoFxtmDsbSno: null,
    transAuthUnmaskYn: "N",
    oneMonthDateObj: Util.dateSelect("1M"),
    getList: function () {
        _this.methods.doGetTransList();
    },
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {
            $(document).on("keyup", "#authCode", function (e) {
                if (e.keyCode === 13) {
                    if (!Util.isEmpty($("#authCode").val().trim())) {
                        _this.methods.doDeleteTrans();
                    } else {
                        $("#authCode").focus();
                    }
                }
            });
            $(document).on("keydown", "#searchType", function (e) {
                if (e.keyCode === 8) {
                    // $("#searchEndDate").val( "" );
                }
            });
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
            // $(document).on("change", "#searchDateType", function (e) {
            //     const searchDateType = $("#searchDateType").val();
            //     if( searchDateType === "1" || searchDateType === "2" ) {
            //         $("#searchStartDate").val(lastMonth);
            //         $("#searchEndDate").val(moment().format('YYYY/MM/DD'));
            //         $("#searchEndDate").attr("readonly", true);
            //     }
            // });

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
            let html = '';
            if (code === 1) {
                if( entity.length > 0 ) {
                    _this.prdList = entity;
                    for (let i = 0; i < entity.length; i++) {
                        if( !(entity[i].wptlPrdTypeCd === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER && entity[i].crdPntUsePsblYn !== "Y") ) {
                            html += '<option value="' + entity[i].wptlPrdNo + '">' + entity[i].prdNm + '</option>';
                        }
                    }
                } else {
                    html += '<option value="" selected>상품명을 선택해주세요.</option>';
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
            class CustomRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;
                    let el;
                    if(props.columnInfo.name === "delDttm") {
                        let strtDttm = props.grid.getValue(props.rowKey, "strtDttm");
                        let endDttm = props.grid.getValue(props.rowKey, "endDttm");
                        let delDttm = props.grid.getValue(props.rowKey, "delDttm");

                        const curDate = new Date();
                        let isUsed = (new Date(strtDttm) <= curDate || new Date(strtDttm) > curDate) && new Date(endDttm) >= curDate;

                        if (Util.isEmpty(props.value) && (isUsed && Util.isEmpty(delDttm))) {
                            el = document.createElement("a");
                            el.className = "label";
                            el.style.cursor = "pointer";
                            el.appendChild(document.createTextNode("삭제"));

                            el.addEventListener("click", (ev) => {
                                ev.preventDefault();
                                FH.wlpoFxtmDsbSno = Toast.grid.getValue(rowKey, "wlpoFxtmDsbSno");
                                FH.dsbStTypeCd = Toast.grid.getValue(rowKey, "dsbStTypeCd");
                                FH.methods.doTransSendAuthCode();
                            });
                        } else {
                            let value = Util.isEmpty(props.value) ? "-" : props.value;
                            el = document.createElement("div");
                            el.className = "tui-grid-cell-content";
                            el.appendChild(document.createTextNode(String(value)));
                        }
                    } else {
                        let value = Util.isEmpty(props.value) ? "-" : props.value;
                        el = document.createElement("div");
                        el.className = "tui-grid-cell-content";
                        el.appendChild(document.createTextNode(String(value)));
                    }
                    this.el = el;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {}
            }
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
                        header: "상품명",
                        align: "center",
                        minWidth: 100,
                        name: "prdNm",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        }
                    },
                    {
                        header: "사유",
                        align: "center",
                        minWidth: 100,
                        name: "dsbRsnCn",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        }
                    },
                    {
                        header: "대상자 구분",
                        align: "center",
                        width: 110,
                        name: "fxtmDsbTrgpTypeNm"
                    },
                    // {
                    //     header: "인별 지급 금액",
                    //     align: "center",
                    //     width: 140,
                    //     name: "totalAmount"
                    // },
                    {
                        header: "상태",
                        align: "center",
                        width: 100,
                        name: "dsbStTypeNm"
                    },
                    {
                        header: "등록자 명",
                        align: "center",
                        width: 100,
                        name: "userNm"
                    },
                    {
                        header: "등록 일시",
                        align: "center",
                        width: 120,
                        name: "sysCreDttm"
                    },
                    {
                        header: "실행 일시",
                        align: "center",
                        width: 120,
                        name: "dedDt",
                    },
                    {
                        header: "정기지급기간",
                        align: "center",
                        width: 130,
                        name: "fxtmDsbDt",
                    },
                    {
                        header: "삭제일시",
                        align: "center",
                        width: 120,
                        name: "delDttm",
                        renderer: CustomRenderer
                    }
                ],
                clickEventColumns : ["dsbRsnCn", "prdNm"],
                clickFunction : function (row) {
                    // 정기지급 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/regular/trans/detail", { wlpoFxtmDsbSno : row.wlpoFxtmDsbSno, wptlPrdNo: row.wptlPrdNo, strtDttm: row.strtDttm, endDttm: row.endDttm });
                }
            })
            if( _this.prdList.length > 0 ) {
                _this.methods.doGetTransList();
            }
        },

        validateSearchParam: function () {
            let searchStartDate = $("#searchStartDate").val();
            let searchEndDate = $("#searchEndDate").val();

            if (Util.isEmpty($("#wptlPrdNo").val())) {
                alert("조회할 상품을 선택해주세요.");
                return;
            }
            if (Util.isEmpty(searchStartDate)) {
                alert("기간 시작일을 입력해주세요.");
                return false;
            }

            if (Util.isEmpty(searchEndDate)) {
                searchEndDate = moment().format("YYYY/MM/DD");
            }


            let StartDate = moment(searchStartDate).format('YYYY/MM/DD');
            let EndDate = moment(searchEndDate).format('YYYY/MM/DD');
            if (!Util.checkOverSearchDateLimit(StartDate, EndDate, 1, "year")) {
                    alert("기간은 최대 12개월까지만 조회 가능합니다.");
                return;
            }

            return true;
        },
        /**
         * 정기지급 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetTransList: async function (type = 1) {
            if(!FH.methods.validateSearchParam()) return;

            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/regular/trans/doGetTransList', params);
                return;
            }

            let wptlPrdNo = $("#wptlPrdNo").val();
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wlpoEntpNo: KSM.targetWptlEntpNo,                             // 기업 시퀀스
                wlpoPrdNo: !Util.isEmpty(wptlPrdNo) ? Number(wptlPrdNo) : "", // 상품 시퀀스
                wptlPrdNo: !Util.isEmpty(wptlPrdNo) ? Number(wptlPrdNo) : "", // 상품 시퀀스
                searchDateType: $("#searchDateType").val(),                   // 검색 기간 분류
                searchStartDate: $("#searchStartDate").val().trim(),          // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim(),              // 검색 종료일
                dsbStTypeCd: $("#dsbStTypeCd").val()                        // 정기지급 상태
            }

            const res = await ServiceExec.post('/api/regular/trans/doGetTransList', _this.params);
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
         * 휴대폰 인증번호 발송
         * @returns {Promise<void>}
         */
        doTransSendAuthCode: async function (modal) {
            if(!modal) {
                if (!confirm("등록된 정기지급을 삭제하시겠습니까?")) return;
            }
            if($("#msg").length) {
                $("#msg").html("");
            }
            const res = await ServiceExec.post('/api/trans/doTransSendAuthCode');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                let message = "휴대폰으로 인증번호를 발송했습니다.";
                if(!modal) {
                    alert(message);
                } else {
                    $("#msg").html(message);
                }
                // 테스트시 사용
                // alert("휴대폰으로 인증번호를 발송했습니다. (인증번호 : " + entity.authCode + ")");

                AUTH.authToken = entity.authToken;
                AUTH.isSendAuth = true;
                AUTH.expired = false;
                AUTH.countTime = 180;

                $("#authTimer").text("03:00");
                $("#authCode").val("");
                $("#authCode").focus();

                AUTH.methods.countDown();
                if(!modal) {
                    await _this.methods.openTransAuthModal();
                    Util.validCheck($(".modal-content"), $("#msg"), "인증 번호를 입력해 주세요.", "p");
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
        },

        doAuthConfirmByRegularTrans: async function () {
            await _this.methods.doDeleteTrans();
        },
        resetSearchInit: function(){
            $("#searchStartDate").val(lastMonth);
            $("#searchEndDate").val(nowDate);
        },
        /**
         * 정기지급 인증 modal 열기
         * @returns {Promise<boolean>}
         */
        openTransAuthModal: async function () {
            _this.transUnmaskYn = "N";
            if(!AUTH.isSendAuth) {
                alert("휴대폰 인증을 진행해주세요.");
                return false;
            }
            const params = {
                path: "modal/transAuth",
                htmlData: {
                    pageType: 'regularTrans'
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#transAutheModal").length) $("#transAutheModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#transAutheModal").modal({show: true});
            addEventListenerByElements( $("#transAutheModal .masking-input").get() );
            $("#transAutheModal .masking-input").each( function(idx, item) {
                item.dispatchEvent( new Event('input') );
            });
            $("#transAutheModal #authCode").focus();
        },
        /* ---------------------------------------- 지급/회수 인증 modal start ---------------------------------------- */
        /**
         * 정기지급 삭제
         * (사용중경우만 취소가능)
         * @returns {Promise<void>}
         */
        doDeleteTrans: async function () {
            const params = {
                authToken: AUTH.authToken,                                                                 // 인증 토큰
                authCode: $("#authCode").val().trim(),                                                     // 인증 코드
                wlpoFxtmDsbSno: _this.wlpoFxtmDsbSno,
                dsbStTypeCd: _this.dsbStTypeCd
            }

            if(!AUTH.isSendAuth) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증번호 재전송을 진행해주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && Util.isEmpty(params.authCode)) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증 번호를 입력해 주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && String(params.authCode).length < 4) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증 번호를 정확히 입력해 주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && AUTH.expired) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증번호 입력 시간을 초과하였습니다.", "p");
                return;
            }

            const res = await ServiceExec.post('/api/regular/trans/doDeleteTrans', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                AUTH.methods.stopCountDown();
                alert("정기지급이 삭제되었습니다.");
                $(".modal").modal({ show: !1 })
                _this.methods.doGetTransList();
            } else {
                switch (code) {
                    // -1008 : 인증번호 불일치
                    case -1008:
                        Util.validCheck($(".modal-content"), $("#msg"), message, "p");
                        $("#authCode").val("");
                        break;
                    default:
                        alert(message);
                        AUTH.methods.resetAuth();
                        $(".modal").modal({ show: !1 })
                        break;
                }
            }
        },
        unmaskingPage: function (pageType = "trans") {
            if( pageType === "transAuth" ) {
                _this.transAuthUnmaskYn = "Y";
                $("#transAutheModal .masking-input").each(function (idx, item) {
                    $(item).val($(item).data("realValue"));
                });
            }
        }
    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker("all");

        $("#searchStartDate").val(lastMonth);
        $("#searchEndDate").val(nowDate);
        await _this.methods.doGetProductList();
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();
