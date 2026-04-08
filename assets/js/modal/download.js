const DOWNLOAD_MODAL = {
    scrollWrap: null,
    validEl: null,
    callback: {},
    args: {},
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {
            $(document).on("keyup", "#filePassword1, #filePassword2", function() {
                const value = $(this).val();
                const regex = /[ㄱ-ㅎ|ㅏ-ㅣ|ㄱ-힣]/g;
                if( Util.validCheckRegex(value, regex) ) {
                    $(this).val( "" );
                }
            });
            $(document).on( "keyup change blur", "#reason", function() {
                const value = $(this).val();
                const maxlength = $(this).attr( "maxlength");
                $(".text-size").text( value.length + "/" + maxlength );
            });
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
         * 다운로드 팝업 열기
         * @param callback (실제 다운로드 실행할 콜백함수)
         */
        openDownloadModal: async function (callback, pageType) {
            DOWNLOAD_MODAL.callback = callback;
            DOWNLOAD_MODAL.args = Array.prototype.slice.call(arguments, 2);
            pageType = pageType === undefined ? '' : pageType;
            const params = {
                path: "modal/download",
                htmlData: {
                    pageType: pageType
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#downloadModal").length) $("#downloadModal").remove();
            if( $("body").children("a.btn-top").next(".modal.right-mode").length ) {
                $("body").children("a.btn-top").next(".modal.right-mode").remove();
            }
            $("body").children("a.btn-top").after(html);
            $("#downloadModal").modal({show: true});

            $("#reason").trigger("keyup");
        },
        downloadConfirm: function() {
            if( !this.downloadValid() ) {
                DOWNLOAD_MODAL.validEl.parent("h5").show();
                return false;
            }
            const args = DOWNLOAD_MODAL.args;
            args.unshift(-1);
            DOWNLOAD_MODAL.callback.apply(this, args);
        },
        download: function( path, params ) {
            let downloadParams = {};
            downloadParams = { ...params };
            downloadParams.type = $("#categorySelect").length && $("#categorySelect").val() === "details" ? "DETAILS" : "LIST";
            downloadParams.unmaskYn = $("#maskingYn").val() === "Y" ? "N" : "Y";
            downloadParams.filePassword = $("#filePassword1").val();
            downloadParams.reason = $("#reason").val();
            ServiceExec.downPost(path, downloadParams);

            $("#downloadModal button[data-dismiss=modal]").trigger("click");
        },
        downloadValid: function() {
            DOWNLOAD_MODAL.validEl.html("");
            const filePassword1 = $("#filePassword1").val();
            const filePassword2 = $("#filePassword2").val();
            const reason = $("#reason").val();

            if (Util.isEmpty(filePassword1)) {
                Util.validCheck(DOWNLOAD_MODAL.scrollWrap, DOWNLOAD_MODAL.validEl, "비밀번호를 입력해 주세요.");
                return false;
            }
            if (filePassword1.length < 4 || filePassword1.length > 12 ) {
                Util.validCheck(DOWNLOAD_MODAL.scrollWrap, DOWNLOAD_MODAL.validEl, "비밀번호를 4자 이상 12자 이내로 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(filePassword2)) {
                Util.validCheck(DOWNLOAD_MODAL.scrollWrap, DOWNLOAD_MODAL.validEl, "비밀번호를 확인해 주세요.");
                return false;
            }
            if (filePassword1 !== filePassword2) {
                Util.validCheck(DOWNLOAD_MODAL.scrollWrap, DOWNLOAD_MODAL.validEl, "비밀번호가 일치하지 않습니다.");
                return false;
            }
            if (Util.isEmpty(reason)) {
                Util.validCheck(DOWNLOAD_MODAL.scrollWrap, DOWNLOAD_MODAL.validEl, "다운로드 사유를 입력해 주세요.");
                return false;
            }
            if (reason.length < 5 || reason.length > 50 ) {
                Util.validCheck(DOWNLOAD_MODAL.scrollWrap, DOWNLOAD_MODAL.validEl, "다운로드 사유를 5자 이상 50자 이내로 입력해 주세요.");
                return false;
            }
            return true;
        }
    },
    init: function () {
        for (let eventFunc in DOWNLOAD_MODAL.events) {
            DOWNLOAD_MODAL.events[eventFunc]();
        }
    }
}

window.DOWNLOAD_MODAL = DOWNLOAD_MODAL;
DOWNLOAD_MODAL.init();