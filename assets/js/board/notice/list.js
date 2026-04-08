import "/js/common/Toast.js?version=2025052101";

// 공지사항 js
let _this;
const FH = {
    params: {},
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    topCount: 0,
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


            let columns = _this.methods.getGridColumns();

            Toast.methods.setGrid({
                columns: columns,
                clickEventColumns : ["titNm"],
                clickFunction : function (row) {
                    // 공지사항 상세 페이지로 이동
                    Toast.methods.setListInfo();
                    Util.href("/board/notice/detail", { wptlBlbdNo : row.wptlBlbdNo});
                }
            })
            _this.methods.doGetBoardList();
        },
        /**
         * 그리드 컬럼
         */
        getGridColumns: function () {
            // "첨부파일" cell 클립 이미지 customRenderer
            class CustomRenderer {
                constructor(props) {
                    let el;
                    if(!Util.isEmpty(props.value)) {
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

            let columns =  [
                {
                    header: "NO",
                    align: "center",
                    width: 100,
                    name: "rowKey",
                    formatter: function ({row, column, value}) {
                        return (row.isTopYn === "Y") ? "-" : ((FH.page - 1) * FH.limit) + ((row.rowKey + 1) - _this.topCount);
                        // 번호 역순으로 바인딩시
                        // return (row.isTopYn === "Y") ? "-" : (FH.virtualNum - (row.rowKey - FH.topCount))
                    }
                },
                {
                    header: "제목",
                    minWidth: 100,
                    name: "titNm",
                    renderer: {
                        styles: {
                            cursor: "pointer",
                        }
                    }
                },
                {
                    header: "첨부파일",
                    align: "center",
                    width: 100,
                    name: "atchFileNm",
                    renderer: CustomRenderer
                },

            ];

            if(KSM.wptlUserDvCd === ConstCode.CODES_MEMBER_ACCOUNT.TYPE.ADMIN) {
                columns.push(
                    {
                        header: "팝업 상태",
                        align: "center",
                        width: 100,
                        name: "popupStatus"
                    },
                    {
                        header: "팝업 시작일",
                        align: "center",
                        width: 130,
                        name: "popupStartYmd"
                    },
                    {
                        header: "팝업 종료일",
                        align: "center",
                        width: 130,
                        name: "popupEndYmd"
                    }
                );
            }

            columns.push(
                {
                    header: "조회수",
                    align: "center",
                    width: 100,
                    name: "inqCnt"
                },
                {
                    header: "등록일시",
                    align: "center",
                    width: 220,
                    name: "sysCreDttm"
                }
            );

            return columns;
        },

        /**
         * 공지사항 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetBoardList: async function () {
            _this.params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: "",
                blbdTypeCd: ConstCode.CODES_BOARD_TYPE.NOTICE, // board 타입 (공지사항)
                wptlBlbdClNo: "",
                searchType: $("#searchType").val(),            // 검색 분류
                searchText: $("#searchText").val().trim(),     // 검색어
                searchStartDate: "",
                searchEndDate: "",
                oprStatNm: "",
                popupStatus: $("#popupStatus").val()
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/board/doGetBoardList', _this.params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity.boardList;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount
                $("#totalCount").text(_this.totalCount);
                _this.virtualNum = entity.virtualNum;
                _this.topCount = 0;

                let topBoardList = res.entity.topBoardList;
                if (!Util.isEmpty(topBoardList)) {
                    _this.topCount = topBoardList.length;
                    entity.list = topBoardList.map(item => {
                        // 상단고정 공지사항 class 추가 (배경색 변경 dev.css)
                        item._attributes = {
                            className: {
                                row: ['topContent']
                            }
                        }
                        item.isTopYn = "Y";
                        return item;
                    }).concat(entity.list);
                }
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
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();