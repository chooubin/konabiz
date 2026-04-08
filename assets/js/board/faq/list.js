import "/js/common/Toast.js?version=2025052101";

// FAQ js
let _this;
const FH = {
    page: 1,
    limit: 20,
    totalCount: 0,
    virtualNum: 0,
    getList: function () {
        _this.methods.doGetBoardList();
    },
    wptlBlbdClNo: "",
    events: {
        // /**
        //  * key 이벤트
        //  */
        // keyEvent: function () {
        // },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            // FAQ 리스트 영역 - FAQ 제목 클릭시
            $(document).on("click", ".faq-list ul li .q", function () {
                $(this).next().slideToggle(300);
            })
        },
        // /**
        //  * change 이벤트
        //  */
        // changeEvent: function () {
        // }
    },
    methods: {
        /**
         * FAQ 리스트 - 문의 분류 선택
         * @param el (분류 버튼 a태그)
         */
        changeClassify: function (el) {
            $(el).addClass('active').siblings().removeClass('active');
            _this.wptlBlbdClNo = $(el).attr("_wptlBlbdClNo");
            _this.page = 1;
            _this.methods.doGetBoardList();
        },
        /**
         * FAQ 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetBoardList: async function () {
            const params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: "",
                blbdTypeCd: ConstCode.CODES_BOARD_TYPE.FAQ,                                        // board 타입 (FAQ)
                wptlBlbdClNo: !Util.isEmpty(_this.wptlBlbdClNo) ? Number(_this.wptlBlbdClNo) : "", // 문의 분류 시퀀스
                searchType: "",
                searchText: "",
                searchStartDate: "",
                searchEndDate: "",
                oprStatNm: ""
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/board/doGetBoardList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity.boardList;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount
                _this.virtualNum = entity.virtualNum;

                _this.methods.getPageContent(entity.list);
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
         * FAQ 리스트 - 내용 페이지 호출
         * @returns {Promise<void>}
         */
        getPageContent: async function (faqList) {
            const params = {
                path: "board/faq/list_content",
                htmlData: {
                    virtualNum: _this.virtualNum,
                    faqList: faqList
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".faq-list").html(html);
        },
        /**
         * FAQ 삭제
         * (시스템 관리자만 가능)
         * @param wptlBlbdNo (board 시퀀스)
         * @returns {Promise<void>}
         */
        doRemoveBoard: async function (wptlBlbdNo) {
            const params = {
                wptlBlbdNo: Number(wptlBlbdNo) // board 시퀀스
            }
            if (!confirm("선택한 FAQ를 삭제하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/board/doRemoveBoard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("선택한 FAQ를 삭제하였습니다.");
                // FAQ 리스트 갱신
                _this.methods.doGetBoardList();
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
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Toast.methods.getListInfo(FH.methods.doGetBoardList);
    }
}

window.FH = FH;
FH.init();