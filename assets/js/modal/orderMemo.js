// Order Memo modal js
// let _this;
const ORDER_MEMO = {
    scrollWrap: null,
    validEl: null,
    wptlPrdNo: null,
    wptlCrdOrdrNo: null,
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
         * Get Order Memo
         * @returns {Promise<boolean>}
         */
        doGetMemoCn: async function () {
            const params = {
                wptlCrdOrdrNo: ORDER_MEMO.wptlCrdOrdrNo
            };
             console.log(params);
            const res = await ServiceExec.post('/api/admin/card/doGetOrderMemo', params);
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
         * Update Order Memo
         * @returns {Promise<boolean>}
         */
        doUpdateOrderMemo: async function () {
            const params = {
                wptlCrdOrdrNo: ORDER_MEMO.wptlCrdOrdrNo,
                memoCn: $("#memoCn").val()
            };
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/card/doUpdateOrderMemo', params);
            const code = res.code;
            const message = res.message;
            /**

            */
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                const modalType = $("#memoCn").data("modalType");
                if( modalType === "mod" ) {
                    alert("수정된 내용이 저장되었습니다.");
                } else {
                    alert("입력한 내용이 저장되었습니다.");
                }
                $("#orderMemoModal").modal({show: false}).remove();
                FH.methods.doGetCardOrderDetail("info",FH.maskingType);
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
        for (let eventFunc in ORDER_MEMO.events) {
            ORDER_MEMO.events[eventFunc]();
        }
    }
}

window.ORDER_MEMO = ORDER_MEMO;
ORDER_MEMO.init();
