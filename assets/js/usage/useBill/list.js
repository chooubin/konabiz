import "/js/common/Toast.js?version=2025052101";

// 애용 대금 명세서 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetUseBillList();
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
         * 기업 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                        // 기업 시퀀스
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
                        header: "카드번호",
                        align: "center",
                        width: "auto",
                        minWidth: 240,
                        name: "cdno",
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        }
                    },
                    {
                        header: "임직원명",
                        align: "center",
                        width: 200,
                        name: "stfNm",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : value
                        }
                    },
                    {
                        header: "사원번호",
                        align: "center",
                        width: 180,
                        name: "incmpEmpNo",
                        formatter: function ({row, column, value}) {
                            return Util.isEmpty(value) || value === '-' ? '-' : value
                        }
                    },
                    {
                        header: "상품명",
                        align: "center",
                        minWidth: 100,
                        name: "prdNm"
                    },
                    {
                        header: "발급유형",
                        align: "center",
                        width: 230,
                        name: "mbRltgCrdDvNm"
                    },
                    {
                        header: "이용월",
                        align: "center",
                        width: 150,
                        name: "monthDt"
                    },
                    {
                        header: "이용 금액",
                        align: "center",
                        width: 230,
                        name: "amount",
                        formatter: function ({row, column, value}) {
                            return Number(value).toLocaleString("ko-KR");
                        }
                    }
                ],
                clickEventColumns : ["cdno"],
                clickFunction : function (row) {
                    // 복지 카드 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/usage/useBill/detail", { par : row.par, searchDate : row.monthDt });
                }
            })
            _this.methods.doGetUseBillList();
        },
        /**
         * 이용대금 명세서 리스트 조회
         * @returns {Promise<void>}
         */
        doGetUseBillList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                DOWNLOAD_MODAL.methods.download('/api/usage/doGetUseBillList', params);
                return;
            }

            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                      // 기업 시퀀스
                searchType: $("#searchType").val(),                    // 검색 분류
                searchText: $("#searchText").val().trim(),             // 검색어
                searchDate: $("#searchDate").val().trim(),             // 검색년월
                wptlPrdNo: $("#wptlPrdNo").val(),                       // 상품 시퀀스
                prdId: $("#wptlPrdNo option:selected").attr("_prdId") // 상품 ID
            }
            if( _this.params.searchType === "6" ) {
                _this.params.searchText = $("#searchText").data( "realValue" );
            } else {
                _this.params.searchText = $("#searchText").val().trim();
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/usage/doGetUseBillList', _this.params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount
                $("#totalCount").text(_this.totalCount);
                _this.virtualNum = entity.virtualNum;
                $("#totalAmount").text( "총 " + Number(entity.extraValue).toLocaleString("ko-KR") + "원" );
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
            let date = new Date();
            date.setMonth(date.getMonth() - 1);
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let searchDate = year + '/' + (month < 10 ? '0' + month : month);
            $("#searchDate").val(searchDate);
        },
        changeSearchType: function( searchType ) {
            if (searchType === "6") {
                $(".table-box #searchText").attr("maxlength", "16");
                $(".table-box #searchText").attr("data-masking-type", "CARD_NUMBER_ONLY");
            } else {
                $(".table-box #searchText").removeAttr("maxlength");
                $(".table-box #searchText").removeAttr("data-masking-type");
            }
        }
    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker();

        FH.methods.resetSearchInit();
        await _this.methods.doGetProductList();
        Toast.methods.getListInfo(FH.methods.setTable);

        const searchType = $("#searchType").val();
        FH.methods.changeSearchType( searchType );
    }
}

window.FH = FH;
FH.init();