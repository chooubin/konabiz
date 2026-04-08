import "/js/modal/using.js?version=2025021201";
import "/js/modal/usingMerchant.js?version=2025281101";

// 카드 주문 상세 js
let _this;
const FH = {
    wptlPrdNo: "",
    cardCashId: "",
    SUNDAY_INDEX: 6,
    cardCashDetail: {},
    cashUseLimit: {},
    depositAmount: 0,
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
        }
    },
    methods: {
        /**
         * 카드 주문 상세 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetCardCashDetail: async function (maskingType) {
            const params = {
                wptlPrdNo: Number(_this.wptlPrdNo), // 상품 시퀀스
                cardCashId: _this.cardCashId
            }
            if( maskingType === "unmask" ) {
                params.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/product/doGetCardCashInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if(!Util.isEmpty(entity.cardCashInfoList)) {
                    _this.cardCashDetail = entity.cardCashInfoList[0];
                    await _this.methods.doGetCashUseLimit(_this.cardCashId);
                    await _this.methods.getPageContnet();
                    await _this.methods.doGetCashDepositAmount($("#depositAmount"), _this.cardCashId);
                    if( $(".memo-box").length ) {
                        Util.resizeTextarea($(".memo-box").get(0));
                    }
                } else {
                    alert("포인트 정보를 불러오는데 실패하였습니다.");
                    Util.back();
                    return;
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
        /**
         * * 카드 주문 상세 - 내용 페이지 호출
         * @param pageType (상세: detail, 수정: mod)
         * @returns {Promise<void>}
         */
        getPageContnet: async function (pageType = "detail") {
            const params = {
                path: "product/cash/detail_content",
                htmlData: {
                    pageType: pageType,
                    cashDetail: _this.cardCashDetail,
                    cashUseLimit : _this.cashUseLimit,
                    depositAmount : _this.depositAmount,
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
        },
        /**
         * 캐시 예치금 조회
         * @returns {Promise<void>}
         */
        doGetCashDepositAmount: async function (el, cashId) {
            let params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                cashId: cashId,
                wptlPrdNo: Number(_this.wptlPrdNo) // 상품 시퀀스
            }

            const res = await ServiceExec.post('/api/product/doGetCashDepositAmount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
             // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                el.text(entity + "원");
                _this.depositAmount = entity;
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        el.text("예치금 잔액을 불러올 수 없습니다.");
                        break;
                }
            }
        },

        /**
         * 캐시 사용 한도 정보
         * @returns {Promise<void>}
         */
        doGetCashUseLimit: async function (cashId) {
            let params = {
                cardCashId: cashId
            }

            const res = await ServiceExec.post('/api/product/doGetCardCashUseLimitInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.cashUseLimit = entity;
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
         * 캐시 일시 제한 요일/시간 행추가
         */
        addCashAvailableTime: function() {
            const dayTimeLimitRowCount = $(".dayTimeDiv").length;

            if(dayTimeLimitRowCount >= 5) {
                alert("최대 5개까지 설정 가능합니다.");
                return;
            }

            const thDayLimitRowspan = parseInt($("#thDayLimit").attr("rowspan")) + 1;
            const thTimeLimitRowspan = parseInt($("#thTimeLimit").attr("rowspan")) + 1;

            const postFixNum = dayTimeLimitRowCount + 1;

            const $clone = $("#cashAvailableTimeTemplate").contents().clone();

            // 클론된 요소에서 체크박스와 레이블 가져오기
            $("#thDayLimit").attr("rowspan", thDayLimitRowspan);
            $("#thTimeLimit").attr("rowspan", thTimeLimitRowspan);

            $(".addTimeBtn").remove();   //기존 '시간 추가' 버튼 삭제

            $(".trDayTime").last().after($clone[0].data);

            // 첫행에 삭제 버튼 추기
            const firstTimeEl = $(".dayTimeDiv")[0];
            const firstTimeDivEl = $(firstTimeEl).children(".cashTimeDiv");

            if($(".dayTimeDiv").length > 1 && firstTimeDivEl.find(".removeTimeBtn").length == 0) {
                const $removeBtnclone = $("#removeCashAvailableTimeBtnTemplate").contents().clone();
                firstTimeDivEl.append($removeBtnclone[0].data);
            }

        },

        /**
         * 캐시 일시 제한 요일/시간 행삭제
         */
        removeCashAvailableTime: function(el) {
            const index = $(".removeTimeBtn").index($(el));                // 삭제버튼 누른 요소가 몇번째 요소인지

            const thDayLimitRowspan = parseInt($("#thDayLimit").attr("rowspan")) - 1;
            const thTimeLimitRowspan = parseInt($("#thTimeLimit").attr("rowspan")) - 1;

            $("#thDayLimit").attr("rowspan", thDayLimitRowspan);
            $("#thTimeLimit").attr("rowspan", thTimeLimitRowspan);

            if(index === 0) {
                const removeRowEl = el.closest("tr");
                const $nextTr = $(removeRowEl).next();

                removeRowEl.remove();
                $nextTr.prepend("<th rowspan='" + thTimeLimitRowspan + "' id='thTimeLimit'>요일별 시간</th>");

            } else {
                const $removeRow = el.closest(".dayTimeDiv").closest("tr");
                $removeRow.remove();
            }

            // 시간 추가 버튼 (전체 삭제 후 마지막 row에만 '시간추가'버튼 추가)
            $(".addTimeBtn").remove();

            const dayTimeLimitRowCount = $(".dayTimeDiv").length;
            const lastTimeEl = $(".dayTimeDiv")[dayTimeLimitRowCount-1];
            const lastTimeDivEl = $(lastTimeEl).children(".cashTimeDiv");
            const $clone = $("#addCashAvailableTimeBtnTemplate").contents().clone();
            lastTimeDivEl.append($clone[0].data);

            // 삭제 버튼 한개일 경우 없애기
            if($(".removeTimeBtn").length === 1) {
                const firstTimeEl = $(".dayTimeDiv")[0];
                const firstTimeDivEl = $(firstTimeEl).children(".cashTimeDiv");
                firstTimeDivEl.find(".removeTimeBtn").remove();
            }
        },

        /**
         * 1회 사용 한도
         */
        handleChangeOneTimeLimit: function() {
            const noLimit = $("#oneTimeLimitDv").val() === "00";
            if(noLimit) {
                $("#oneTimeLimitValue").val("");
            }

            $("#oneTimeLimitValue").prop("disabled", noLimit);

        },

        /**
         * 1일 사용 한도
         */
        handleChangeOneDayLimit: function() {
            const noLimit = $("#oneDayLimitDv").val() === "00";
            if(noLimit) {
                $("#oneDayLimitValue").val("");
            }

            $("#oneDayLimitValue").prop("disabled", noLimit);
        },

        /**
         * 일시 제한 사용/미사용 변경 이벤트
         */
        handleChangeDayLimit: function() {
            if($("#dayLimitYn").val() === "Y") {
                $("#thDayLimit").attr("rowspan", "3");
                $(".dayLimitHiddenRow").removeClass("hidden");

                this.initDayTimeLimit();

            } else {
                $("#thDayLimit").attr("rowspan", "1");
                $(".dayLimitHiddenRow").addClass("hidden");
            }
        },

        /**
         * 사용 횟수 제한 변경 이벤트
         */
        handleChangeUseCountLimitYn: function () {
            if($("#useCountLimitUseYn").val() === "Y") {
                $("#thUseCountLimit").attr("rowspan", "3");
                $(".useCountLimitHiddenRow").removeClass("hidden");

                this.initDayUseCountLimit();

            } else {
                $("#thUseCountLimit").attr("rowspan", "1");
                $(".useCountLimitHiddenRow").addClass("hidden");
            }
        },

        /**
         * 종료 시간 변경 이벤트
         */
        handleChangeEndHour: function (_this) {
            if($(_this).val() == '24') {
                $(_this).next('select').val('00')
                $(_this).next('select').prop('disabled', true);
            } else {
                $(_this).next('select').prop('disabled', false);
            }
        },

        /**
         * 입력 변경 이벤트
         */
        handleChangeInput: function (_this) {
            Util.inputNumberFormat(_this);
        },

        /**
         * 일시 제한 입력 항목 초기화
         */
        initDayTimeLimit: function () {
            $("#isNotAllowHoliday").prop("checked", true);

            $(".trDayTime").remove();

            const $clone = $("#cashAvailableTimeTemplate").contents().clone();

            if($(".trDayTime").length > 0) {
                $(".trDayTime").last().after($clone[0].data);
            } else {
                $(".holidayUseLimit").after($clone[0].data);
            }

            $(".trDayTime").prepend("<th rowspan='1' id='thTimeLimit'>요일별 시간</th>");
            $(".removeTimeBtn").remove();
        },

        /**
         * 횟수 제한 입력 항목 초기화
         */
        initDayUseCountLimit: function () {
            $(".useCountLimitDay").val("0");
        },

        /**
         * 카드캐시 정책 저장
         */
        doSaveCashPolicy: async function() {

            if(!this.validCashPolicyParam()) {
                return;
            }

            if(!confirm("저장하시겠습니까?")) {
                return;
            }

            const params = this.getCashPolicyParams();
            const res = await ServiceExec.jsonPost('/api/product/doSettingCashPolicy', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("저장되었습니다.");
                _this.methods.doGetCardCashDetail();
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

        validCashPolicyParam: function () {
            let isValid = true;

            if($("#oneTimeLimitDv").val() != '00') {
                if(Util.isEmpty($("#oneTimeLimitValue").val())) {
                    alert("사용한도 금액을 확인해 주세요");
                    return false;
                }
            }

            if($("#oneDayLimitDv").val() != '00') {
                if(Util.isEmpty($("#oneDayLimitValue").val())) {
                    alert("사용한도 금액을 확인해 주세요");
                    return false;
                }
            }

            if(_this.cardCashDetail.crdCashDvCd == ConstCode.CARD_CASH.CRD_CASH_DV_CD.WELFARE_SAL
                || _this.cardCashDetail.crdCashDvCd == ConstCode.CARD_CASH.CRD_CASH_DV_CD.WELFARE_EX
                || _this.cardCashDetail.crdCashDvCd == ConstCode.CARD_CASH.CRD_CASH_DV_CD.CORP) {

                isValid = this.isValidTimeLimit() && this.isValidUseCountLimit();
            }

            return isValid;
        },

        isValidTimeLimit: function() {
            let isValid = true;

            if($("#dayLimitYn").val() == 'Y') {
                if (Util.isEmpty($("input[name='allowHolidayYn']:checked").val())) {
                    alert("포인트 사용가능 시간을 확인해 주세요");
                    return false;
                }

                $(".dayTimeDiv").each(function (index, item) {
                    let checkedCnt = $(item).find("input[type='checkbox'][name='dayCheckbox']:checked").length;

                    if(checkedCnt == 0) {
                        alert("포인트 사용가능 시간을 확인해 주세요");
                        isValid = false;
                        return false;
                    }

                    let startHm = $(item).find("select[name='startHour']").val() + $(item).find("select[name='startMin']").val();
                    let endHm = $(item).find("select[name='endHour']").val() + $(item).find("select[name='endMin']").val();

                    if(startHm >= endHm) {
                        alert("시작시간과 종료시간을 다시 확인해 주세요");
                        isValid = false;
                        return false;
                    }
                });

                if(isValid) {
                    isValid = this.isNonExistOverlapTime();
                }
            }

            return isValid;

        },

        /* 회수 제한 validation */
        isValidUseCountLimit: function() {
            let isValid = true;
            let invalidDayArr = [];

            const dayOfWeekKor = {
                'MON' : '월요일',
                'TUE' : '화요일',
                'WED' : '수요일',
                'THU' : '목요일',
                'FRI' : '금요일',
                'SAT' : '토요일',
                'SUN' : '일요일'
            };
            const dayOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
            let checkedDay = {
                'MON' : false,
                'TUE' : false,
                'WED' : false,
                'THU' : false,
                'FRI' : false,
                'SAT' : false,
                'SUN' : false
            };

            const isDayLimit = $("#dayLimitYn").val() == 'Y';
            const isUseCountLimit = $("#useCountLimitUseYn").val() == 'Y';

            if(isDayLimit && isUseCountLimit) {

                $(".dayTimeDiv").each(function (index, item) {
                    let checkboxes = $(item).find("input[type='checkbox'][name='dayCheckbox']");

                    checkboxes.each(function(chIdx, checkbox) {
                        if($(checkbox).is(":checked")) {
                            checkedDay[dayOfWeek[chIdx]] = true;  // 일시제한 설정되어있으면 true
                        }
                    })
                })

                for(let i=0; i < dayOfWeek.length; i++) {
                    let isCheckedDay = checkedDay[dayOfWeek[i]];
                    let useCountLimitValue = $(".useCountLimitDay")[i].value;
                    
                    if(isCheckedDay && useCountLimitValue == 'X') {               // 일시제한 '설정' && 사용횟수 '사용못함' 인 경우
                        invalidDayArr.push(dayOfWeekKor[dayOfWeek[i]]);
                    } else if (!isCheckedDay && useCountLimitValue != 'X') {      // 일시제한 '미설정' && 사용횟수 '사용못함 아닌' 경우
                        invalidDayArr.push(dayOfWeekKor[dayOfWeek[i]]);
                    }
                }

                const isAllowHolidayUse = $("input[name='allowHolidayYn']:checked").val() == 'Y';

                if(isAllowHolidayUse && $("#holiCountLimit").val() == 'X') {         // 공휴일 사용 '가능' && 공휴일 사용 횟수 '사용못함' 인 경우
                    invalidDayArr.push('공휴일');
                }else if(!isAllowHolidayUse && $("#holiCountLimit").val() != 'X') {  // 공휴일 사용 '불가능' && 공휴일 사용 횟수 '사용못함 아닌' 경우
                    invalidDayArr.push('공휴일');
                }

                if(invalidDayArr.length > 0) {
                    isValid = false;
                    alert("일시제한과 횟수제한에 동시 적용되지 않은 " + invalidDayArr.join(", ") + "이 있습니다. 확인 후 다시 시도해 주세요.");
                }

            }

            return isValid;
        },

        isNonExistOverlapTime: function() {
            const dayOfWeekKor = {
                'MON' : '월요일',
                'TUE' : '화요일',
                'WED' : '수요일',
                'THU' : '목요일',
                'FRI' : '금요일',
                'SAT' : '토요일',
                'SUN' : '일요일'
            };
            const dayOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

            let schedule = {
                'MON' : [],
                'TUE' : [],
                'WED' : [],
                'THU' : [],
                'FRI' : [],
                'SAT' : [],
                'SUN' : []
            };

            let overlapTimeObj = {};

            $(".dayTimeDiv").each(function (index, item) {
                let checkboxes = $(item).find("input[type='checkbox'][name='dayCheckbox']");

                checkboxes.each(function(chIdx, checkbox) {
                    if($(checkbox).is(":checked")) {

                        let startHm = $(item).find("select[name='startHour']").val() + $(item).find("select[name='startMin']").val();
                        let endHm = $(item).find("select[name='endHour']").val() + $(item).find("select[name='endMin']").val();

                        schedule[dayOfWeek[chIdx]].push({startHm: startHm, endHm: endHm});
                    }
                })
            })

            for(let dayOfWeek in schedule) {
                let arr = schedule[dayOfWeek];

                if(arr.length > 1) {
                    for(let i=0; i < arr.length-1; i++) {
                        let start = schedule[dayOfWeek][i].startHm;
                        let end = schedule[dayOfWeek][i].endHm;

                        for(let j=i+1; j < arr.length; j++) {
                            if( this.isTimeOverlap(start, end, schedule[dayOfWeek][j].startHm, schedule[dayOfWeek][j].endHm) ) {
                                overlapTimeObj[dayOfWeekKor[dayOfWeek]] = true;
                            }
                        }
                    }
                }
            }

            if(overlapTimeObj != null && Object.keys(overlapTimeObj).length > 0) {
                alert(Object.keys(overlapTimeObj).join(", ") + " 설정 시간이 중복됩니다. 다시 확인해 주세요");
                return false;
            }

            return true;
        },

        isTimeOverlap: function(startHm1, endHm1, startHm2, endHm2) {
            return startHm1 <= endHm2 && endHm1 >= startHm2;
        },

        getCashPolicyParams: function () {
            const maxAmtOnetime = $("#oneTimeLimitDv").val() == '00' ?  0 : Util.numberOnly($("#oneTimeLimitValue").val());
            const maxAmtDay = $("#oneDayLimitDv").val() == '00' ?  0 : Util.numberOnly($("#oneDayLimitValue").val());
            const allowHolidayYn = $("input[name='allowHolidayYn']:checked").val();
            const dayLimitYn = $("#dayLimitYn").val();
            const useCountLimitUseYn = $("#useCountLimitUseYn").val();
            let timeSlotArray, useLimitCaseCountDayValue;

            // 일시 제한 사용하면
            if(dayLimitYn == 'Y') {
                timeSlotArray = [];

                $(".dayTimeDiv").each(function (index, item) {
                    let dayWeek = '', timeStart = '', timeEnd='';
                    let checkboxes = $(item).find("input[type='checkbox'][name='dayCheckbox']");

                    checkboxes.each(function (idx, checkbox) {
                        let isChecked = $(checkbox).is(":checked") ? '1' : '0';

                        if(idx == FH.SUNDAY_INDEX) {
                            dayWeek = isChecked + dayWeek;
                        } else {
                            dayWeek += isChecked;
                        }

                    })

                    timeStart += $(item).find("select[name='startHour']").val();
                    timeStart += $(item).find("select[name='startMin']").val();

                    timeEnd += $(item).find("select[name='endHour']").val();
                    timeEnd += $(item).find("select[name='endMin']").val();

                    let timeSlotParam = {
                        allowHolidayYn: allowHolidayYn
                        , dayWeek : dayWeek
                        , timeStart : timeStart
                        , timeEnd : timeEnd
                    };

                    timeSlotArray.push(timeSlotParam);

                });
            }

            if(useCountLimitUseYn == 'Y') {
                useLimitCaseCountDayValue = $("#sunCountLimit").val()
                 + $("#monCountLimit").val()
                 + $("#tueCountLimit").val()
                 + $("#wedCountLimit").val()
                 + $("#thuCountLimit").val()
                 + $("#friCountLimit").val()
                 + $("#satCountLimit").val()
                 + $("#holiCountLimit").val();
            }

            const params = {
               cardCashId: _this.cardCashId
                , maxAmtOnetime: maxAmtOnetime
                , maxAmtDay: maxAmtDay
                ,timeSlots: timeSlotArray
                ,useLimitCaseCountDayValue: useLimitCaseCountDayValue
            };
    debugger;
           return params;
        }

    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
    }
}

window.FH = FH;
FH.init();