// 임직원 검색 modal js
// let _this;
const CASH_MEMO = {
    scrollWrap: null,
    validEl: null,
    wptlPrdNo: null,
    crdCashId: null,
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
            $(document).on( "keyup change blur", "#memoCn", function() {
                const value = $(this).val();
                const maxlength = $(this).attr( "maxlength");
                $(".text-size").text( value.length + "/" + maxlength );
            });
        }
    },
    methods: {
        /**
         * 카드 리스트 데이터 조회
         * @returns {Promise<boolean>}
         */
        doGetMemoCn: async function () {
            const params = {
                wptlPrdNo: CASH_MEMO.wptlPrdNo,
                crdCashId: CASH_MEMO.crdCashId
            };
            // console.log(params);
            const res = await ServiceExec.post('/api/product/doGetCashMemo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                $("#memoCn").val(entity.memoCn);
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
         * 카드캐시 메모 업데이트
         * @returns {Promise<boolean>}
         */
        doUpdateCashMemo: async function () {
            const params = {
                crdCashId: CASH_MEMO.crdCashId,
                memoCn: $("#memoCn").val()
            };
            // console.log(params);
            const res = await ServiceExec.post('/api/product/doUpdateCashMemo', params);
            const code = res.code;
            const message = res.message;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                const modalType = $("#memoCn").data("modalType");
                if( modalType === "mod" ) {
                    alert("수정된 내용이 저장되었습니다.");
                } else {
                    alert("입력한 내용이 저장되었습니다.");
                }
                $("#cashMemoModal").modal({show: false}).remove();
                FH.methods.doGetProductInfo("cash");
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
    },
    init: function () {
        for (let eventFunc in CASH_MEMO.events) {
            CASH_MEMO.events[eventFunc]();
        }
    }
}

window.CASH_MEMO = CASH_MEMO;
CASH_MEMO.init();