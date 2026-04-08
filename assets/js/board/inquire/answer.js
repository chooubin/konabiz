import "/js/common/Toast.js?version=2025052101";
import "/js/common/File.js?version=2025010801";

// 문의 답변 등록/수정 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: $("#answerValid"),
    answerEditor: null,
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
            _this.answerEditor = Toast.methods.setEditor("answerEditor");
            setTimeout(() => {
                _this.answerEditor.blur();
                _this.scrollWrap.scrollTop(0);
            }, 1);
        },
        /**
         * 문의 답변 등록/수정
         * (시스템 관리자만 가능)
         * @param wptlBlbdNo (board 시퀀스)
         * @returns {Promise<void>}
         */
        doRedifyAnswerInquire: async function (wptlBlbdNo) {
            let ansAtchFile = $("#ansAtchFile")[0].files[0];
            const params = {
                wptlBlbdNo: Number(wptlBlbdNo),                                                              // board 시퀀스
                ansCn: _this.answerEditor.getHTML(),                                                         // 답변 내용
                ansAtchFileNm: $("#ansAtchFileNm").val(),                                                    // 답변 첨부 파일 이름
                ansAtchFilePthNm: $("#ansAtchFilePthNm").val()                                               // 답변 첨부 파일 경로
            }

            if(ansAtchFile !== undefined) {
                params.ansAtchFile = ansAtchFile; // 답변 첨부 파일
            }

            if (!_this.methods.answerValid()) return;
            if (!confirm("문의 답변 글을 등록하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/board/doRedifyAnswerInquire', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("문의 답변 글을 등록하였습니다.");
                Util.replace("/board/inquire/list");
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
         * 문의 답변 등록/수정 유효성 체크
         * @returns {boolean}
         */
        answerValid: function () {
            _this.validEl.html("");
            let ansCn = _this.answerEditor.getMarkdown();
            if (Util.isEmpty(ansCn.trim())) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "답변 내용을 입력해주세요.");
                return false;
            }
            let ansCnLength = $("#answerEditor").next().find(".editorByte").text();
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