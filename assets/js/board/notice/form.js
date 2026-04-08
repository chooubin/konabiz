import "/js/common/Toast.js?version=2025052101";
import "/js/common/File.js?version=2025010801";

// 공지사항 등록/수정 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: $("#noticeValid"),
    noticeEditor: null,
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
            _this.noticeEditor = Toast.methods.setEditor("noticeEditor");
            setTimeout(() => {
                _this.noticeEditor.blur();
                $("#titNm").focus();
            }, 1)
        },
        /**
         * 공지사항 등록/수정
         * (시스템 관리자만 가능)
         * @param wptlBlbdNo (board 시퀀스)
         * @returns {Promise<void>}
         */
        doRedifyBoard: async function (wptlBlbdNo) {
            let atchFile = $("#atchFile")[0].files[0];
            const params = {
                blbdTypeCd: ConstCode.CODES_BOARD_TYPE.NOTICE,                                      // board 타입 (공지사항)
                wptlBlbdNo: !Util.isEmpty(wptlBlbdNo) ? Number(wptlBlbdNo) : "",                    // board 시퀀스
                wptlBlbdClNo: "",
                topExpsYn: $("#topExpsYn").is(":checked") ? "Y" : "N",                              // 상단 고정 여부
                titNm: $("#titNm").val().trim(),                                                    // 공지사항 제목
                blbdCn: _this.noticeEditor.getHTML(),                                               // 공지사항 내용
                ansCn: "",
                atchFileNm: $("#atchFileNm").val(),                                                 // 첨부 파일 이름
                atchFilePthNm: $("#atchFilePthNm").val(),                                           // 첨부 파일 경로
                popupYn: $("#popupYn").is(":checked") ? "Y" : "",
                popupStartYmd: $("#popupStartYmd").val(),
                popupEndYmd: $("#popupEndYmd").val()
            }

            if(atchFile !== undefined) {
                params.atchFile = atchFile; // 첨부 파일
            }

            if (! await _this.methods.noticeValid(params)) return;
            if (!confirm("(팝업) 공지사항을 등록하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/board/doRedifyBoard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("(팝업) 공지사항을 등록하였습니다.");
                Util.replace("/board/notice/list");
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
         * 공지사항 등록/수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        noticeValid: async function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.titNm)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "제목을 입력해주세요.");
                return false
            }
            let blbdCn = _this.noticeEditor.getMarkdown();
            if (Util.isEmpty(blbdCn.trim())) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "내용을 입력해주세요.");
                return false;
            }
            let blbdCnLength = $("#noticeEditor").next().find(".editorByte").text();
            blbdCnLength = Number(blbdCnLength.trim().replaceAll(",", ""));
            if (blbdCnLength > 4000) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "글 작성 제한 수를 초과하였습니다.");
                return false;
            }
            let popupYnEl = $("#popupYn");
            if(popupYnEl.is(':checked')) {
                let popupStartYmd = $("#popupStartYmd").val();
                let popupEndYmd = $("#popupEndYmd").val();

                if (Util.isEmpty(popupStartYmd) || Util.isEmpty(popupEndYmd)) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "팝업 기간을 입력해 주세요.");
                    return false;
                }

                if (!Util.validDate(popupStartYmd) || !Util.validDate(popupEndYmd)) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "팝업 기간을 입력해 주세요.");
                    return false;
                }

                let sdt = new Date(popupStartYmd);
                let edt = new Date(popupEndYmd);
                if (sdt > edt) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "팝업 기간을 확인해 주세요.");
                    return false;
                }

                let isDuplicated = await _this.methods.isNoticePopupDayDuplicated(params);

                if(isDuplicated) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "팝업이 중복으로 설정되었습니다. 팝업 기간을 다시 확인해 주세요.");
                    return false;
                }
            }
            return true;
        },
        /**
         * 공지사항 팝업 기간 중복 여부
         * @param params
         * @returns {boolean}
         */
        isNoticePopupDayDuplicated: async function(params) {
            const res = await ServiceExec.formPost('/api/board/doCheckPopupDayDuplicated', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));

            if (code === 1) {
                if(entity > 0) {
                    return true;
                }
            } else {
                switch (code) {
                    default:
                        alert(message);
                        break;
                }
            }

            return false;
        },
        /**
         * 팝업 미리보기
         * @returns 
         */
        doPopupPreview: function () {
            let attachFile = $("#atchFile").val();
            let titNm = $("#titNm").val();
            let contentHtml =_this.noticeEditor.getHTML();

            if(Util.isEmpty(attachFile)) {
                $("#noticeShortcut").css('display', 'none');
            } else {
                $("#noticeShortcut").css('display', 'block');
            }

            $("#noticePopup").css('display', 'block');

            $("#previewSubject").text(titNm);
            $("#previewContent").html(contentHtml);

        },
        /**
         * 팝업 닫기
         * @returns
         */
        closePreviewPopup: function () {
            $("#noticePopup").css('display', 'none');
        },
        /**
         * 팝업 적용 여부 변경 event
         * @returns
         */
        doChangePopupYn: function () {
            if($("#popupYn").is(":checked")) {
                $(".popupYnArea").attr("colspan", "1");
                $(".popupDayArea").css("display", "");
                $("#popupPreviewBtn").css("display", "");

                let dateRange = Util.dateSelect("1MA");

                $("#popupStartYmd").val(dateRange.startDate);
                $("#popupEndYmd").val(dateRange.endDate);
            } else {
                $(".popupYnArea").attr("colspan", "3");
                $(".popupDayArea").css("display", "none");
                $("#popupPreviewBtn").css("display", "none");
                $("#popupStartYmd").val("");
                $("#popupEndYmd").val("");
            }
        }
    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        _this.methods.setEditor();
        Util.setDatePicker('all');
    }
}

window.FH = FH;
FH.init();