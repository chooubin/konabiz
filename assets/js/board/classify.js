import "/js/common/Toast.js?version=2025052101";
import "/js/modal/item.js?version=2025231001";

// 문의 분류 관리 js
let _this;
const FH = {
    scrollWrap: null,
    validEl: null,
    classifyList: [],
    redifyClassifyList: [],
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
                            return row.rowKey + 1;
                        }
                    },
                    {
                        header: "문의 분류",
                        align: "center",
                        minWidth: 100,
                        name: "blbdClNm"
                    },
                    {
                        header: "FAQ 매핑 수",
                        align: "center",
                        width: 140,
                        name: "faqMappCnt"
                    },
                    {
                        header: "1:1문의 매핑 수",
                        align: "center",
                        width: 140,
                        name: "inqMappCnt"
                    }
                ]
            })
            _this.methods.doGetBoardClassify();
        },
        /**
         * 문의 분류 관리 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetBoardClassify: async function () {
            const res = await ServiceExec.post('/api/board/doGetBoardClassify');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.classifyList = entity;
                Toast.grid.resetData(_this.classifyList);
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
         * 문의 분류 관리 modal 열기
         * @returns {Promise<void>}
         */
        openClassifyModal: async function () {
            const params = {
                path: "modal/classify",
                htmlData: {
                    classifyList: _this.classifyList
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#classifyModal").length) $("#classifyModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#classifyModal").modal({show: true});
        },
        /**
         * 문의 분류 관리 modal - 아이템 삭제
         * @returns {Promise<void>}
         */
        doCheckRemoveBoardClassify: async function () {
            let length = $("#classifyModal tbody tr").length;
            if (length === 0) return;

            let item = $("#classifyModal").find("input:radio[name=ra1]:checked").closest("tr");
            let wptlBlbdClNo = $(item).find("input:text[name=itemName]").attr("_itemNo");

            if (Util.isEmpty(wptlBlbdClNo)) {
                ITEM.methods.deleteInputItem("classify", length, item);
                return;
            }
            const params = {
                wptlBlbdClNo: Number(wptlBlbdClNo) // 분류 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/board/doCheckRemoveBoardClassify', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                ITEM.methods.deleteInputItem("classify", length, item);
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -3002 : FAQ가 등록되있는 경우
                    case -3002:
                        alert(message);
                        break;
                    // -3003 : 1:1문의가 등록되있는 경우
                    case -3003:
                        alert(message);
                        break;
                    // -3004 : FAQ, 1:1문의 둘다 등록되있는 경우
                    case -3004:
                        alert(message);
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 문의 분류 관리 modal - 아이템 등록/수정
         * @returns {Promise<void>}
         */
        doRedifyBoardClassify: async function () {
            if (!_this.methods.classifyValid()) return;
            if (!confirm("문의 분류 설정을 수정하시겠습니까?")) return;
            // console.log(_this.redifyClassifyList);
            const res = await ServiceExec.jsonPost('/api/board/doRedifyBoardClassify', _this.redifyClassifyList);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("문의 분류 설정을 수정하였습니다.");
                $("#classifyModal").modal({show: false}).remove();
                // 문의 분류 리스트 갱신
                _this.methods.doGetBoardClassify();
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
         * 문의 분류 관리 modal - 아이템 등록/수정 유효성 체크
         * @returns {boolean}
         */
        classifyValid: function () {
            _this.validEl.html("");
            const res = ITEM.methods.itemListValid("classify", _this.classifyList);
            if(!res.isChagne) {
                $("#classifyModal").modal({show: false}).remove();
                return false;
            }
            if(res.isEmpty) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "문의 분류명을 입력해 주세요.");
                return false;
            }
            if(res.isDuplicate) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "중복된 문의 분류가 있습니다.");
                return false;
            }
            _this.redifyClassifyList = res.itemList.map(item => {
                return {
                    blbdClNm: item.name,
                    wptlBlbdClNo: item.no
                }
            })
            return true;
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