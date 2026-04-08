import Util from "/js/common/Util.js?version=2025100902";
import ConstCode from "/js/common/ConstCode.js?version=2025010801";
window.Util = Util;
window.ConstCode = ConstCode;

// 수령카드 간편등록 js
let _this;
const FH = {
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {
            $("input[name=cardNm]").keyup(function(){
                let idx = $("input[name=cardNm]").index(this);
                let value = $(this).val();
                if( idx == 0 || idx == 3 ) {
                    if( Util.validCheckRegex(value, "\\D") ) {
                        $(this).val(Util.numberOnly(value));
                        return;
                    }
                }
                if( value.length > 4 ) {
                    $(this).val(value.substring(0, 4));
                }
                if( value.length >= 4 && idx < 4) {
                    $("input[name=cardNm]").eq(idx+1).focus();
                }
            });

            $("#cntctBd").keyup(function(){
                let nowVal = $("#cntctBd").val();
                nowVal = nowVal.replace(/[^0-9]/g, '');
                $("#cntctBd").val(nowVal);
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
        isEmpty: function (value) {
            return (value == '' || value === '' || value == 'null' ||
                value == undefined || value === undefined ||
                value == null || value === null ||
                (value !== null && typeof value == 'object' && !Object.keys(value).length));
        },
        validBirth: function (value) {
            if (this.isEmpty(value)) return false;
            let regExp = /^(19[0-9][0-9]|20\d{2})(0[0-9]|1[0-2])(0[0-9]|[1-2][0-9]|3[0-1])$/;
            return (regExp.test(value));
        },
        post: function (path, payload) {
            let promise = new Promise(resolve => {
                $.ajax({
                    url: path || '',
                    type: 'POST',
                    data: payload,
                    dataType: 'JSON',
                    async: false,
                    // processData: false,
                    // contentType: false,
                    // enctype: 'multipart/form-data',
                    beforeSend: function () {
                    },
                    complete: function () {
                    },
                    success: resolve,
                    error: function (xhr, status, error) {
                        console.log('error');
                        console.log(xhr.status + error);
                    }
                })
            });

            return promise.then(res => res);
        },
        doGetEntpNm: async function (wptlEntpNo) {
            if (this.isEmpty(wptlEntpNo)) wptlEntpNo = _this.wptlEntpNo;
            if (this.isEmpty(wptlEntpNo)) {
                $(".entpNm").text("기업코드가 잘못 되었습니다.");
                $(".btn-submit, input[type=text]").attr("disabled", true);
                alert("기업코드가 잘못 되었습니다.");
                return;
            }
            const params = {
                wptlEntpNo: Number(wptlEntpNo)
            }
            // console.log(params);
            const res = await FH.methods.post('/common/doGetEntpNm', params);
            const code = res.code;
            let entpNm = res.entity;
            const message = res.message;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if(FH.methods.isEmpty(entpNm)) {
                    entpNm = "기업코드가 잘못 되었습니다.";
                    $(".btn-submit, input[type=text]").attr("disabled", true);
                    alert("기업코드가 잘못 되었습니다.");
                }
                $(".entpNm").text(entpNm);
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
        doRegistUserCard: async function () {
            if (FH.methods.isEmpty($("#wptlEntpNo").val())) {
                alert("기업코드가 잘못 되었습니다.");
                return;
            }
            if (FH.methods.isEmpty($("#cntctId").val())) {
                alert("사원번호를 입력해주세요.");
                $("#cntctId").focus();
                return;
            }
            if (FH.methods.isEmpty($("#cntctNm").val())) {
                alert("사용자 이름을 입력해주세요.");
                $("#cntctNm").focus();
                return;
            }
            if (FH.methods.isEmpty($("#cntctBd").val())) {
                alert("생년월일을 입력해주세요.");
                $("#cntctBd").focus();
                return;
            }
            if (!FH.methods.validBirth($("#cntctBd").val())) {
                alert("생년월일 형식이 잘못되었습니다.");
                $("#cntctBd").focus();
                return;
            }
            let cardNumber = "";
            for( let i = 0; i < $("input[name=cardNm]").length; i++ ) {
                let $item = $("input[name=cardNm]").eq(i);
                let value;
                if( $item.hasClass("masking-input") ) {
                    value = $item.data("realValue");
                } else {
                    value = $item.val();
                }

                if ( value.length != 4 ) {
                    alert("카드번호를 정확히 입력해주세요.");
                    $item.focus();
                    return;
                }
                cardNumber += value;
            }


            const params = {
                wptlEntpNo: Number($("#wptlEntpNo").val()),
                incmpEmpNo: $("#cntctId").val(), // 사원번호
                stfNm: $("#cntctNm").val(), // 임직원 이름
                birthDt: $("#cntctBd").val(),   // 생년월일
                cdno: cardNumber    // 카드번호
            }
            // console.log(params);
            //const res = await FH.methods.post('/common/doGetEntpNm', params, 'JSON');
            const res = await FH.methods.post('/api/card/doRegistUserCard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            if (code === 1) {
                alert("카드등록이 완료되었습니다.");
                document.getElementById("registInfo").reset();
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