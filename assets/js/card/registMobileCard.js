import Util from "/js/common/Util.js?version=2025100902";
import ConstCode from "/js/common/ConstCode.js?version=2025010801";
window.Util = Util;
window.ConstCode = ConstCode;

// 수령카드 간편등록 js
let _this;
const FH = {
    authToken: "",
    isSendAuth: false,
    expired: false,
    countTime: 180,
    countTimer: null,
    isAuthComplete: false,
    params: {},
    authCompleteParams: {
        wptlEntpNo : "",
        phoneNumber : "",
        cntctBd : "",
        incmpEmpNo: "",
        stfNm: "",
        birthDt: "",
        gender: ""
    },
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {
            $("#phoneNumber").keyup(function(){
                if($("#phoneNumber").val().length == 13) {
                    $("#requestAuthCodeBtn").removeClass("disabled");
                } else {
                    $("#requestAuthCodeBtn").addClass("disabled");
                }
            });

            $("#cntctBd").keyup(function(){
                let maxLength = $("#cntctBd").attr("maxLength");
                let nowVal = $("#cntctBd").val();
                nowVal = nowVal.replace(/[^0-9]/g, '').substring(0, maxLength);
                $("#cntctBd").val(nowVal);
            });

            $("#gender").keyup(function(){
                let maxLength = $("#gender").attr("maxLength");
                let nowVal = $("#gender").val();
                nowVal = nowVal.replace(/[^1-4]/g, '').substring(0, maxLength);
                $("#gender").val(nowVal);
            });


            $("#authCode").keyup(function(){
                let nowVal = $("#authCode").val();
                nowVal = nowVal.replace(/[^0-9]/g, '');
                $("#authCode").val(nowVal);
            });

        },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            // 링크 복사하기
            $(document).on("click", "#copyLinkBtn", function () {
                window.navigator.clipboard.writeText(window.location.href);

                //$("#konabizUrl").select();
                //document.execCommand("copy");
            })
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
            let regExp = /^([0-9][0-9]\d{2})(0[0-9]|1[0-2])(0[0-9]|[1-2][0-9]|3[0-1])$/;
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
        doTermsData: async function (wptlEntpNo) {
            if (this.isEmpty(wptlEntpNo)) {
                return;
            }
            const params = {
                wptlEntpNo: Number(wptlEntpNo)
            }
            // console.log(params);
            const res = await FH.methods.post('/api/terms/doGetMobileCardRegTerms', params);
            const code = res.code;
            let resEntity = res.entity;
            const message = res.message;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if(resEntity != null) {

                    /*  //// Phase63.1 개인정보 수집 및 이용 동의 약관 숨김처리
                    if(resEntity.ccpnTcVerno) {
                        $("#terms_01_version").val(resEntity.ccpnTcVerno);
                    }
                    */

                    if(resEntity.isUseCppnTc) {
                        // console.log("제 3자 제공 동의 약관..");
                        $("#provPrivacyInfoAgrTerm").css("display", "");
                        $("#terms_02_version").val(resEntity.cppnTcVerno);
                        $("#cppnSvcTcId").val(resEntity.cppnSvcTcId)
                        $("#terms_02Popup").attr("href", resEntity.cppnTcUrl);
                    }

                }
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
        searchProvidePrivacyInfoAgreeTerms : async function (wptlEntpNo) {
            if(this.isEmpty(wptlEntpNo)) return;

            const res = await FH.methods.post('/api/card/mobile/doSendAuthCode', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            if (code === 1) {
                alert("입력하신 휴대폰에 인증번호가 발송되었습니다.");

                FH.authToken = entity.authToken;
                FH.isSendAuth = true;
                FH.expired = false;
                FH.countTime = 180;

                $("#authTimer").text("03:00");
                $("#authCode").val("");
                $("#authCode").focus();

                $("#verifyAuthCodeBtn").removeClass("disabled");

                FH.methods.countDown();

            } else {
                switch (code) {
                    // 예외처리 경우
                    default:
                        alert(message);
                        FH.methods.resetAuth();
                        break;
                }
            }
        },
        doRegistMobileCard : async function () {
            if(!FH.methods.registCardValid()) return;
            // console.log("doRegistMobileCard  ... ");
            const params = {
                wptlEntpNo: Number($("#wptlEntpNo").val()),
                incmpEmpNo: $("#cntctId").val().trim(),         // 사원번호
                stfNm: $("#cntctNm").val().trim(),              // 사용자 이름
                birthDt: $("#cntctBd").val().trim(),            // 생년월일
                gender: $("#gender").val().trim(),              // 성별
                phoneNumber: $("#phoneNumber").data("realValue"),    // 휴대폰번호
                ccpnTcVerno: $("#terms_01_version").val().trim(),
                cppnTcVerno: $("#terms_02_version").val().trim(),
                cppnSvcTcId: $("#cppnSvcTcId").val().trim()
            }

            const res = await FH.methods.post('/api/card/mobile/doRegistMobileCard', params);
            const code = res.code;
            const message = res.message;

            if (code === 1) {
                alert("코나카드 앱에 모바일 단독카드가 등록되었습니다.");
            } else {
                switch (code) {
                    // 예외처리 경우
                    default:
                        alert(message);
                        /*FH.methods.resetAuth();*/
                        break;
                }
            }

            window.location.reload(true);
        },
        registCardValid: function () {

            if (!FH.methods.sendAuthValid()) return false;

            if (this.isEmpty($("#authCode").val())) {
                alert("인증번호를 입력해 주세요.");
                return false;
            }

            if (this.isEmpty(FH.isAuthComplete) || !FH.isAuthComplete) {
                alert("인증 확인 버튼을 눌러주세요.");
                return false;
            }
            
            /* Phase63.1 개인정보 수집 및 이용 동의 약관 숨김 처리  
            if ($("#terms_01_version").val() != '' && !$("#terms_01").is(':checked')) {
                alert("개인정보 수집 및 이용동의 약관에 동의해 주세요.");
                return false;
            }
            */

            if ($("#terms_02_version").val() != '' && !$("#terms_02").is(':checked')) {
                alert("개인정보 제3자 제공 동의 약관에 동의해 주세요.");
                return false;
            }

            return true;

        },
        sendAuthValid : function () {
            if (this.isEmpty($("#wptlEntpNo").val())) {
                alert("기업코드가 잘못 되었습니다.");
                return false;
            }
            if (FH.methods.isEmpty($("#cntctId").val())) {
                alert("사원번호를 입력해주세요.");
                $("#cntctId").focus();
                return false;
            }
            if (FH.methods.isEmpty($("#cntctNm").val())) {
                alert("이름을 입력해주세요.");
                $("#cntctNm").focus();
                return false;
            }
            if (FH.methods.isEmpty($("#cntctBd").val())) {
                alert("생년월일을 입력해주세요.");
                $("#cntctBd").focus();
                return false;
            }
            /*if (!FH.methods.validBirth($("#cntctBd").val())) {
                alert("생년월일 형식이 잘못되었습니다.");
                $("#cntctBd").focus();
                return false;
            }*/
            if (FH.methods.isEmpty($("#gender").val())) {
                alert("성별을 입력해 주세요.");
                $("#gender").focus();
                return false;
            }
            if (FH.methods.isEmpty($("#phoneNumber").data("realValue"))) {
                alert("휴대폰번호를 입력해주세요.");
                $("#phoneNumber").focus();
                return false;
            }

            return true;

        },
        doSendAuthCode: async function () {
            _this.params = {
                wptlEntpNo: Number($("#wptlEntpNo").val()),
                incmpEmpNo: $("#cntctId").val().trim(),         // 사원번호
                stfNm: $("#cntctNm").val().trim(),              // 사용자 이름
                birthDt: $("#cntctBd").val().trim(),            // 생년월일
                gender: $("#gender").val().trim(),              // 성별
                phoneNumber: $("#phoneNumber").data("realValue")     // 휴대폰번호
            }

            if (!FH.methods.sendAuthValid()) return;

            FH.isAuthComplete = false;
            $("#authCode").removeAttr("disabled");

            const res = await FH.methods.post('/api/card/mobile/doSendAuthCode', _this.params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            if (code === 1) {
                alert("입력하신 휴대폰에 인증번호가 발송되었습니다.");

                FH.authToken = entity.authToken;
                FH.isSendAuth = true;
                FH.expired = false;
                FH.countTime = 180;

                $("#authTimer").text("03:00");
                $("#authCode").val("");
                $("#authCode").focus();

                $("#verifyAuthCodeBtn").removeClass("disabled");

                FH.methods.countDown();

            } else {
                switch (code) {
                    // 예외처리 경우
                    default:
                        alert(message);
                        FH.methods.resetAuth();
                        break;
                }
            }
        },
        /**
         * 인증번호 확인
         */
        doConfirmAuthCode: async function () {
            const wptlEntpNo = Number($("#wptlEntpNo").val());
            const incmpEmpNo = $("#cntctId").val().trim();
            const stfNm = $("#cntctNm").val().trim();
            const birthDt = $("#cntctBd").val().trim();
            const gender = $("#gender").val().trim();
            const phoneNumber = $("#phoneNumber").data("realValue");
            if( _this.params.wptlEntpNo !== wptlEntpNo || _this.params.incmpEmpNo !== incmpEmpNo || _this.params.stfNm !== stfNm
                || _this.params.birthDt !== birthDt || _this.params.gender !== gender || _this.params.phoneNumber !== phoneNumber ) {
                alert( "입력한 임직원 정보가 변경되었습니다.\n인증요청을 다시 진행해주세요." );
                _this.methods.resetAuth();
                return;
            }
            const params = {
                authToken: FH.authToken,
                authCode: $("#authCode").val().trim(),
                phoneNumber: phoneNumber
            }

            if(FH.countTime == 0) {
                alert("유효시간이 만료되었습니다. 인증 요청 번호를 다시 눌러주세요.");
                return;
            }

            if(FH.methods.isEmpty($("#authCode").val())) {
                alert("인증번호를 입력해주세요.");
                return;
            }

            const res = await FH.methods.post('/api/card/mobile/doConfirmAuthCode', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            if (code === 1) {
                alert("휴대폰전화번호 인증이 완료되었습니다.");
                FH.methods.doAuthComplete();

            } else {
                switch (code) {
                    case -1008:
                        alert(message);
                        break;
                    case -1013:
                        alert(message);
                        $("#verifyAuthCodeBtn").addClass("disabled");
                        FH.methods.resetAuth();
                        break;
                    default:
                        alert(message);
                        FH.methods.resetAuth();
                        break;
                }
            }
        },
        doAuthComplete: function() {
            FH.isAuthComplete = true;

            FH.authCompleteParams = {
                wptlEntpNo:   _this.params.wptlEntpNo,
                phoneNumber:  _this.params.phoneNumber,
                birthDt:      _this.params.birthDt,
                incmpEmpNo:   _this.params.incmpEmpNo,
                stfNm:        _this.params.stfNm,
                gender:       _this.params.gender
            }

            $("#authTimer").text("");

            FH.methods.stopCountDown();

            $("#cntctId").attr("disabled", "disabled");
            $("#cntctNm").attr("disabled", "disabled");
            $("#cntctBd").attr("disabled", "disabled");
            $("#gender").attr("disabled", "disabled");
            $("#phoneNumber").attr("disabled", "disabled");
            $("#authCode").attr("disabled", "disabled");

            $("#requestAuthCodeBtn").addClass("disabled");
            $("#verifyAuthCodeBtn").addClass("disabled");


        },
        /**
         * 휴대폰 인증 초기화
         */
        resetAuth: function () {
            FH.methods.stopCountDown();
            FH.authToken = "";
            FH.isSendAuth = false;
            FH.expired = false;
            FH.countTime = 180;
            FH.isAuthComplete = false;

            FH.authCompleteParams = {};

            $("#authTimer").text("");
            $("#authCode").val("");
            $("#verifyAuthCodeBtn").addClass("disabled");
        },
        /**
         * 휴대폰 인증 시간 카운트
         */
        countDown: function () {
            FH.methods.stopCountDown();

            FH.countTimer = setInterval(function () {
                if(FH.countTime > 0) {
                    FH.countTime--;
                    let minutes = parseInt(FH.countTime / 60);
                    minutes = minutes < 10 ? "0" + minutes : minutes
                    let seconds = Math.round(((FH.countTime / 60) - minutes) * 60);
                    seconds = seconds < 10 ? "0" + seconds : seconds
                    $("#authTimer").text(minutes + ":" + seconds);
                } else {
                    FH.methods.stopCountDown();

                    FH.expired = true;
                    FH.countTime = 0;
                    $("#authTimer").text("00:00");
                }
            }, 1000);
        },
        /**
         * 휴대폰 인증 시간 카운트 초기화
         */
        stopCountDown: function () {
            if(FH.countTimer !== null) clearInterval(FH.countTimer);
        },

    },
    init: function () {
        _this = this;
        $("#konabizUrl").text( window.location.href );
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
    }
}

window.FH = FH;
FH.init();