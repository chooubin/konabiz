const EXPENSE_MODAL = {
    scrollWrap: null,
    methods: {
        openExpenseApplyModal: async function (wptlPrdNo) {
            const prdNo = {
                wptlPrdNo: wptlPrdNo,                   // 상품 시퀀스
            }
            const res = await ServiceExec.formPost('/api/product/doGetProductDetail', prdNo);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            if (code === 1) {
                const params = {
                    path: "modal/expenseApply",
                    htmlData: {
                        wptlPrdNo: wptlPrdNo,
                        entpNm: entity.entpNm, //회사명
                        prdNm: entity.prdNm, //상품명
                    }
                }
                if( !Util.isEmpty(entity.bzno) && entity.bzno.length === 10 ) {
                    let bzno = entity.bzno;
                    bzno = bzno.replace(/^(\d{0,3})(\d{0,2})(\d{0,5})$/g, "$1-$2-$3");
                    params.htmlData.bzno = bzno; //사업자등록번호
                }
                const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
                if ($("#expenseApplyModal").length) $("#expenseApplyModal").remove();
                $("body").children("a.btn-top").after(html);
                $("#expenseApplyModal").modal({show: true});
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
        terminateExpense: async function (wptlPrdNo) {
            let confirmText = "서비스 해지 기간 동안의 데이터는 추후 서비스 신청 시에도 제공이 불가능합니다. 서비스를 해지하시겠습니까?";
            if (!confirm(confirmText)) return;

            const params = {
                wptlPrdNo: wptlPrdNo,                   // 상품 시퀀스
            }
            const res = await ServiceExec.formPost('/api/product/doTerminateExpense', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            if (code === 1) {
                alert("경비 관리 서비스가 해지되었습니다.");
                $("#expenseApplyModal").modal({show: false}).remove();
                FH.methods.doGetProductList();
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
        applyExpense: async function (wptlPrdNo) {
            const params = {
                wptlPrdNo: wptlPrdNo                   // 상품 시퀀스
            }
            const res = await ServiceExec.formPost('/api/product/doApplyExpense', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            if (code === 1) {
                alert("신청이 완료되었습니다. 유니포스트 회원가입 후 경비 관리 서비스 이용 가능합니다.");
                $("#expenseApplyModal").modal({show: false}).remove();
                FH.methods.doGetProductList();
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
        }
    }
}
window.EXPENSE_MODAL = EXPENSE_MODAL;