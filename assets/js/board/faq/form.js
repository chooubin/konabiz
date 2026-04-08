import "/js/common/Toast.js?version=2025052101";

let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: $("#faqValid"),
    faqQuestionEditor: null,
    faqAnswerEditor: null,
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
         * toast editor 생성
         */
        setEditor: function () {
            _this.faqQuestionEditor = Toast.methods.setEditor("faqQuestionEditor");
            _this.faqAnswerEditor = Toast.methods.setEditor("faqAnswerEditor");
            setTimeout(() => {
                _this.faqQuestionEditor.blur();
                _this.faqAnswerEditor.blur();
                $("#wptlBlbdClNo").focus();
            }, 1);
        },
        /**
         * FAQ 등록/수정
         * (시스템 관리자만 가능)
         * @param wptlBlbdNo (board 시퀀스)
         * @returns {Promise<void>}
         */
        doRedifyBoard: async function (wptlBlbdNo) {
            let wptlBlbdClNo = $("#wptlBlbdClNo").val();
            const params = {
                blbdTypeCd: ConstCode.CODES_BOARD_TYPE.FAQ,                                  // board 타입 (FAQ)
                wptlBlbdNo: !Util.isEmpty(wptlBlbdNo) ? Number(wptlBlbdNo) : "",             // board 시퀀스
                wptlBlbdClNo: !Util.isEmpty(wptlBlbdClNo) ? Number(wptlBlbdClNo) : "",       // 분류 시퀀스 
                topExpsYn: "",      
                titNm: "",
                blbdCn: _this.faqQuestionEditor.getHTML(),                                   // 질문 내용
                ansCn: _this.faqAnswerEditor.getHTML(),                                      // 답변 내용
            }

            if (!_this.methods.faqValid(params)) return;
            if (!confirm("FAQ를 수정하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/board/doRedifyBoard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("FAQ를 수정하였습니다.");
                Util.replace("/board/faq/list");
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
         * FAQ 등록/수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        faqValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.wptlBlbdClNo)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "분류를 선택해 주세요.");
                return false;
            }
            let blbdCn = _this.faqQuestionEditor.getMarkdown();
            if (Util.isEmpty(blbdCn.trim())) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "질문을 입력해 주세요.");
                return false;
            }
            let blbdCnLength = $("#faqQuestionEditor").next().find(".editorByte").text();
            blbdCnLength = Number(blbdCnLength.trim().replaceAll(",", ""));
            if (blbdCnLength > 4000) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "글 작성 제한 수를 초과하였습니다.");
                return false;
            }
            let ansCn = _this.faqAnswerEditor.getMarkdown();
            if (Util.isEmpty(ansCn.trim())) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "답변을 입력해 주세요.");
                return false;
            }
            let ansCnLength = $("#faqAnswerEditor").next().find(".editorByte").text();
            ansCnLength = Number(ansCnLength.trim().replaceAll(",", ""));
            if (ansCnLength > 4000) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "글 작성 제한 수를 초과하였습니다.");
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
        _this.methods.setEditor();
    }
}

window.FH = FH;
FH.init();