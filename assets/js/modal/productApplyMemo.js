// Product Application Memo modal js
// let _this;
const PRODUCT_APPLY_MEMO = {
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
         * Get Product Application Memo
         * @returns {Promise<boolean>}
         */
        doGetMemoCn: async function () {
            const params = {
                wptlPrdNo: PRODUCT_APPLY_MEMO.wptlPrdNo
            };
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doGetProductApplyMemo', params);
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
         * Update Product Application Memo
         * @returns {Promise<boolean>}
         */
        doUpdateProductApplyMemo: async function () {
            const params = {
                wptlPrdNo: PRODUCT_APPLY_MEMO.wptlPrdNo,
                memoCn: $("#memoCn").val()
            };
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doUpdateProductApplyMemo', params);
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
                $("#productApplyMemoModal").modal({show: false}).remove();
                FH.methods.doGetApplyProductDetail("info");
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
        for (let eventFunc in PRODUCT_APPLY_MEMO.events) {
            PRODUCT_APPLY_MEMO.events[eventFunc]();
        }
    }
}

window.PRODUCT_APPLY_MEMO = PRODUCT_APPLY_MEMO;
PRODUCT_APPLY_MEMO.init();