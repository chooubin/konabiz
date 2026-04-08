import "/js/common/Toast.js?version=2025052101";

// 문의 현황 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetBoardList();
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
            // "첨부파일" cell 클립 이미지 customRenderer
            class CustomRenderer {
                constructor(props) {
                    let el;
                    if (!Util.isEmpty(props.value)) {
                        el = document.createElement("img");
                        el.src = "/assets/styles/img/common/ico_file.svg"
                    } else {
                        el = document.createElement("div");
                        el.className = "tui-grid-cell-content";
                        el.appendChild(document.createTextNode("-"));
                    }
                    this.el = el;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                }
            }
            Toast.methods.setGrid({
                columns: [
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
                        header: '문의분류',
                        align: 'center',
                        width: 200,
                        name: 'blbdClNm'
                    },
                    {
                        header: '회사명',
                        align: 'center',
                        name: 'entpNm'
                    },
                    {
                        header: '제목',
                        name: 'titNm',
                        minWidth: 100,
                        renderer: {
                            styles: {
                                cursor: "pointer",
                                color: "#0028b6",
                                textDecoration: "underline"
                            }
                        },
                    },
                    {
                        header: "첨부파일",
                        align: "center",
                        width: 100,
                        name: "atchFileNm",
                        renderer: CustomRenderer
                    },
                    {
                        header: '작성자',
                        align: 'center',
                        width: 120,
                        name: 'regUserNm'
                    },
                    {
                        header: '처리상태',
                        align: 'center',
                        width: 100,
                        name: 'oprStatNm'
                    },
                    {
                        header: '등록일시',
                        align: 'center',
                        width: 220,
                        name: 'sysCreDttm'
                    }
                ],
                clickEventColumns : ["titNm"],
                clickFunction : function (row) {
                    // 1:1문의 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/board/inquire/detail", { wptlBlbdNo : row.wptlBlbdNo});
                }
            })
            _this.methods.doGetBoardList();
        },
        /**
         * 문의 현황 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetBoardList: async function () {
            let wptlBlbdClNo = $("#wptlBlbdClNo").val();
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: KSM.targetWptlEntpNo,                                      // 기업 시퀀스
                blbdTypeCd: ConstCode.CODES_BOARD_TYPE.INQUIRE,                        // board 타입 (문의)
                wptlBlbdClNo: !Util.isEmpty(wptlBlbdClNo) ? Number(wptlBlbdClNo) : "", // 분류 시퀀스
                searchType: $("#searchType").val(),                                    // 검색 분류
                searchText: $("#searchText").val().trim(),                             // 검색어
                searchStartDate: $("#searchStartDate").val().trim(),                   // 검색 시작일
                searchEndDate: $("#searchEndDate").val().trim(),                       // 검색 종료일
                oprStatNm: $("#oprStatNm").val()                                       // 답변 여부
           }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/board/doGetBoardList', _this.params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity.boardList;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount;
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