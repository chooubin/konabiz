import "/js/common/Toast.js?version=2025052101";
import "/js/common/File.js?version=2025010801";

// 문의 등록/수정 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: $("#inquireValid"),
    inquireEditor: null,
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
            _this.inquireEditor = Toast.methods.setEditor("inquireEditor");
            setTimeout(() => {
                _this.inquireEditor.blur();
                $("#wptlBlbdClNo").focus();
            }, 1);
        },
        /**
         * 문의 등록/수정
         * (기업 회원만 가능)
         * @param wptlBlbdNo (board 시퀀스)
         * @returns {Promise<void>}
         */
        doRedifyBoard: async function (wptlBlbdNo) {
            let atchFile = $("#atchFile")[0].files[0];
            const params = {
                blbdTypeCd: ConstCode.CODES_BOARD_TYPE.INQUIRE,                                     // 게시글 타입 (문의)
                wptlBlbdNo: !Util.isEmpty(wptlBlbdNo) ? Number(wptlBlbdNo) : "",                    // 게시글 시퀀스
                wptlBlbdClNo: $("#wptlBlbdClNo").val(),                                             // 문의 분류
                topExpsYn: "",  
                titNm: $("#titNm").val().trim(),                                                    // 문의 제목
                blbdCn: _this.inquireEditor.getHTML(),                                              // 문의 내용    
                ansCn: "",
                atchFileNm: $("#atchFileNm").val(),                                                 // 첨부 파일 이름
                atchFilePthNm: $("#atchFilePthNm").val()                                            // 첨부 파일 경로
            }

            if(atchFile !== undefined) {
                params.atchFile = atchFile; // 첨부 파일
            }

            if (!_this.methods.inquireValid(params)) return;
            if (!confirm("1:1 문의를 등록하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/board/doRedifyBoard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("1:1 문의를 등록하였습니다.");
                if (!Util.isEmpty(params.wptlBlbdNo)) {
                    Util.replace("/board/inquire/detail", {wptlBlbdNo: params.wptlBlbdNo});
                    return;
                }
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
         * 문의 등록/수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        inquireValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.wptlBlbdClNo)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "문의 분류를 선택해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.titNm)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "문의 제목을 입력해 주세요.");
                return false;
            }
            let blbdCn = _this.inquireEditor.getMarkdown();
            if (Util.isEmpty(blbdCn.trim())) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "문의 내용을 입력해 주세요.");
                return false;
            }
            let blbdCnLength = $("#inquireEditor").next().find(".editorByte").text();
            blbdCnLength = Number(blbdCnLength.trim().replaceAll(",", ""));
            if (blbdCnLength > 4000) {
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