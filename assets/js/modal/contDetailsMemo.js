const CONST_DETAILS_MEMO = {
    scrollWrap: null,
    validEl: null,
    wptlEntpNo: null,
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
                wptlEntpNo: CONST_DETAILS_MEMO.wptlEntpNo
            };
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/cont/doGetContDtlMemo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;

            if (code === 1) {
                $("#memoCn").val(entity.memoCn);
            } else {
                switch (code) {
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
        doUpdateContDetailsMemo: async function () {
            const params = {
                wptlEntpNo: CONST_DETAILS_MEMO.wptlEntpNo,
                memoCn: $("#memoCn").val()
            };
            const res = await ServiceExec.post('/api/admin/cont/doUpdateContDtlMemo', params);
            const code = res.code;
            const message = res.message;
            if (code === 1) {
                const modalType = $("#memoCn").data("modalType");
                if( modalType === "mod" ) {
                    alert("수정된 내용이 저장되었습니다.");
                } else {
                    alert("입력한 내용이 저장되었습니다.");
                }
                $("#contDetailsMemoModal").modal({show: false}).remove();
                FH.methods.doGetContDtl();
            } else {
                switch (code) {
                    default:
                        alert(message);
                        break;
                }
            }
        },
    },
    init: function () {
        for (let eventFunc in CONST_DETAILS_MEMO.events) {
            CONST_DETAILS_MEMO.events[eventFunc]();
        }
    }
}

window.CONST_DETAILS_MEMO = CONST_DETAILS_MEMO;
CONST_DETAILS_MEMO.init();