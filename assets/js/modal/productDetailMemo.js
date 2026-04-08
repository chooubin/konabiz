// Product Detail Memo modal js
// let _this;
const PRODUCT_DETAIL_MEMO = {
    scrollWrap: null,
    validEl: null,
    wptlPrdNo: null,
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
         * Get Product Detail Memo
         * @returns {Promise<boolean>}
         */
        doGetMemoCn: async function () {
            const params = {
                wptlPrdNo: PRODUCT_DETAIL_MEMO.wptlPrdNo
            };
           //  console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doGetProductDetailMemo', params);
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
         * Update Product Detail Memo
         * @returns {Promise<boolean>}
         */
        doUpdateProductDetailMemo: async function () {
            const params = {
                wptlPrdNo: PRODUCT_DETAIL_MEMO.wptlPrdNo,
                memoCn: $("#memoCn").val()
            };
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doUpdateProductDetailMemo', params);
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
                $("#productDetailMemo").modal({show: false}).remove();
                FH.methods.doGetProductInfo("detail");
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
        for (let eventFunc in PRODUCT_DETAIL_MEMO.events) {
            PRODUCT_DETAIL_MEMO.events[eventFunc]();
        }
    }
}

window.PRODUCT_DETAIL_MEMO = PRODUCT_DETAIL_MEMO;
PRODUCT_DETAIL_MEMO.init();
