import "/js/common/Toast.js?version=2025052101";

// 관리자 - 전자세금계산서 신청 현황 js
let _this;
const FH = {
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetTaxPublishList();
    },
    wptlCrdOrdrNoList: [],
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
            // "NO" cell 리스트 번호 customRenderer
            class RowNumRenderer {
                constructor(props) {
                    const el = document.createElement("span");
                    el.innerHTML = ((FH.page - 1) * FH.limit) + (props.rowKey + 1);
                    this.el = el;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                }
            }
            // "체크박스" cell 체크박스 customRenderer
            class CustomRenderer {
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
                    input.setAttribute("_wptlCrdOrdrNo", grid.getValue(rowKey, "wptlCrdOrdrNo"));

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
                        grid[!input.checked ? "check" : "uncheck"](rowKey);
                    })
                    this.el = el;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                    const input = this.el.querySelector(".hidden-input");
                    const checked = Boolean(props.value);
                    input.checked = checked;
                }
            }
            Toast.methods.setGrid({
                bodyHeight: "auto",
                scrollY: false,
                rowHeaders: [
                    {
                        type: "rowNum",
                        header: "NO",
                        minWidth: 100,
                        renderer: RowNumRenderer
                    },
                    {
                        type: "checkbox",
                        minWidth: 40,
                        renderer: {
                            type: CustomRenderer
                        }
                    }
                ],
                columns: [
                    {
                        header: "신청일",
                        align: "center",
                        width: 140,
                        name: "requestDt"
                    },
                    {
                        header: "회사명",
                        align: "center",
                        name: "entpNm"
                    },
                    {
                        header: "상품명",
                        align: "center",
                        name: "prdNm"
                    },
                    {
                        header: "주문번호",
                        align: "center",
                        width: 140,
                        name: "ordrNo"
                    },
                    {
                        header: "상품가격(원)",
                        align: "center",
                        width: 140,
                        name: "prdSllUprc"
                    },
                    {
                        header: "카드 주문 수",
                        align: "center",
                        width: 100,
                        name: "aplQty"
                    },
                    {
                        header: "결제금액(원)",
                        align: "center",
                        width: 140,
                        name: "stlmTotAmt"
                    },
                    {
                        header: "발급 상태",
                        align: "center",
                        width: 100,
                        name: "txSoaPblStNm"
                    }
                ]
            })
            _this.methods.doGetTaxPublishList();
        },
        /**
         * 전자세금계산서 신청 현황 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetTaxPublishList: async function (type = 1) {
            if (type === -1) {
                if (_this.totalCount === 0) {
                    alert("다운로드 할 데이터가 없습니다.");
                    return;
                }
                const params = { ..._this.params };
                params.limit = -1;
                ServiceExec.downPost('/api/admin/etc/doGetTaxPublishList', params);
                return;
            }

            const params = {
                page: _this.page,
                limit: _this.limit,
                searchType: $("#searchType").val(),                  // 검색 분류
                searchText: $("#searchText").val().trim(),           // 검색어
                txSoaPblStYn: $("#txSoaPblStYn").val(),              // 발급 상태
                searchStartDate: $("#searchStartDate").val().trim(), // 검색 시작일 (신청일)
                searchEndDate: $("#searchEndDate").val().trim()      // 검색 종료일 (신청일)
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/etc/doGetTaxPublishList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount;
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
         * 전자세금계산서 발급
         * (실제 발급 API가 아닌 DB에 완료로 상태 변경)
         * @returns {Promise<void>}
         */
        doTaxPublishComplete: async function () {
            if (!_this.methods.taxPublishValid()) return;
            const params = {
                wptlCrdOrdrNoList: _this.wptlCrdOrdrNoList // 카드 주문 시퀀스 리스트
            }
            if (!confirm("세금계산서 발급 상태를 완료 상태로 변경 하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/admin/etc/doTaxPublishComplete', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("세금계산서 발급 상태를 완료 상태로 변경 하였습니다.");
                _this.methods.doGetTaxPublishList();
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
         * 전자세금계산서 발급 유효성 체크
         * @returns {boolean}
         */
        taxPublishValid: function () {
            _this.wptlCrdOrdrNoList = [];
            $(".tui-grid-lside-area td input:checkbox[name=taxCheck]:checked").each(function (index, item) {
                const wptlCrdOrdrNo = $(item).attr("_wptlCrdOrdrNo");
                if (!Util.isEmpty(wptlCrdOrdrNo)) _this.wptlCrdOrdrNoList.push(wptlCrdOrdrNo);
            })
            if (_this.wptlCrdOrdrNoList.length === 0) {
                alert("세금계산서 발급 완료 처리할 리스트를 체크해 주세요.");
                return false;
            }
            return true;
        }
    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        Util.setDatePicker();
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();