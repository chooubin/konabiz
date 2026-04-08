// 지급/회수 상세 js
let _this;
const FH = {
    wptlDsbRtrvlNo: "",
    dsbRtrvlTypeCd: "",
    transDetail: null,
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
            window.onresize = function() {
                if( $(".table-body").length ) {
                    Util.setReportHeight( $(".table-body")[0] );
                }
            }
        }
    },
    methods: {
        /**
         * 지급/회수 상세 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetTransDetail: async function (maskingType) {
            const params = {
                wptlDsbRtrvlNo: _this.wptlDsbRtrvlNo,        // 지급/회수 시퀀스
                dsbRtrvlTypeCd: _this.dsbRtrvlTypeCd         // 지급/회수 타입
            }
            if( maskingType === "unmask" ) {
                params.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/trans/doGetTransDetail', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.transDetail = entity;
                _this.methods.getPageContent();
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
         * 지급/회수 상세 - 내용 페이지 호출
         * @returns {Promise<void>}
         */
        getPageContent: async function () {
            const params = {
                path: "trans/detail_content",
                htmlData: {
                    transDetail: _this.transDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
            if( $(".table-body").length ) {
                Util.setReportHeight( $(".table-body")[0] );
            }
        },
        /**
         * 지급/회수 대상자 리스트 엑셀 다운로드
         */
        doDownTransTargetList: function () {
            if (Util.isEmpty(_this.wptlDsbRtrvlNo)) return;
            const params = {
                wptlDsbRtrvlNo: _this.wptlDsbRtrvlNo, // 지급/회수 시퀀스
                dsbRtrvlTypeCd: _this.dsbRtrvlTypeCd         // 지급/회수 타입
            }
            DOWNLOAD_MODAL.methods.download('/api/trans/doDownTransTargetList', params);
        }
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
    }
}

window.FH = FH;
FH.init();