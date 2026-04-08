import ConstCode from "./ConstCode.js";

class Util {
    setCookie = function (name, value, second) {
        if (this.isEmpty(second)) {
            document.cookie = name + "=" + escape(value) + "; path=/;";
        } else {
            let date = new Date();
            date.setSeconds(date.getSeconds() + second);
            document.cookie = name + "=" + escape(value) + "; path=/; expires=" + date.toGMTString() + ";";
        }
    }
    getCookie = function (name) {
        let nameOfCookie = name + "=";
        let i = 0;
        while (i <= document.cookie.length) {
            let j = (i + nameOfCookie.length);
            if (document.cookie.substring(i, j) === nameOfCookie) {
                let endOfCookie;
                if((endOfCookie = document.cookie.indexOf(";", j)) === -1) endOfCookie = document.cookie.length;
                return unescape(document.cookie.substring(j, endOfCookie));
            }
            i = document.cookie.indexOf(" ", i) + 1;
            if (i === 0) break;
        }
        return "";
    }
    deleteCookie = function (name) {
        let date = new Date();
        date.setDate(date.getDate() - 1);
        document.cookie = name + "=; path=/; expires=" + date.toGMTString() + ";";
    }



    back = function () {
        if(event != undefined) {
            event.preventDefault();
        }
        window.history.back();
    }
    href = function () {
        if(event != undefined) {
            event.preventDefault();
            event.stopPropagation();
        }
        let args = arguments;
        switch (args.length) {
            case 1:
                window.location.href = args[0];
                break;
            case 2:
                window.location.href = args[0] + "?" + $.param(args[1]);
                break;
        }
    }
    replace = function () {
        if(event != undefined) {
            event.preventDefault();
        }
        let args = arguments;
        switch (args.length) {
            case 1:
                window.location.replace(args[0]);
                break;
            case 2:
                window.location.replace(args[0] + "?" + $.param(args[1]));
                break;
        }
    }

    cancelConfirm = function () {
        if(event != undefined) {
            event.preventDefault();
        }
        if (!confirm("취소 하시겠습니까?")) return false;
        alert("취소 하였습니다.");
        let args = arguments;
        if (this.isEmpty(args)) {
            this.back();
        } else {
            switch (args.length) {
                case 1:
                    window.location.replace(args[0]);
                    break;
                case 2:
                    window.location.replace(args[0] + "?" + $.param(args[1]));
                    break;
            }
        }
    }
    contCheck = function () {
        if(event != undefined) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (this.isEmpty(KSM) ||
            (KSM.wptlUserDvCd === ConstCode.CODES_MEMBER_ACCOUNT.TYPE.AGENCY &&
              KSM.wptlEntpStCd !== ConstCode.CODES_COMPANY.CONTRACT.ACCEPT_SAVE)) {
            alert("서비스 계약 완료 후 이용이 가능합니다. ");
            return false;
        }
        let args = arguments;
        switch (args.length) {
            case 1:
                window.location.href = args[0];
                break;
            case 2:
                window.location.href = args[0] + "?" + $.param(args[1]);
                break;
        }
    }
    prepareAlert = function () {
        alert("준비중입니다.");
        return false;
    }



    /**
     * 빈값 체크
     * @param value
     * @returns {boolean}
     */
    isEmpty = function (value) {
        return (value == '' || value === '' || value == 'null' ||
                value == undefined || value === undefined ||
                value == null || value === null ||
                (value !== null && typeof value == 'object' && !Object.keys(value).length))
    }
    emptyString = function (value) {
        if (this.isEmpty(value)) return '-'
        return value
    }
    emptyNumber = function (value) {
        if (this.isEmpty(value)) return 0
        return value
    }
    /**
     * 텍스트 줄바꿈
     * @param value
     * @returns {string|*}
     */
    nl2br = function (value) {
        if (this.isEmpty(value)) return ''
        return value.replace(/\n/g, "<br />")
    }
    /**
     * 문자열 trim
     * @param value
     * @returns {string|*}
     */
    trim = function(value) {
        if( this.isEmpty(value) ) return "";
        if( value.isNaN ) {
            return value.trim();
        }
        return value;
    }

    /**
     * 텍스트 byte 체크
     * @param value
     * @returns {number}
     */
    checkByte = function (value) {
        // let byteLength = _this.noticeEditor.getMarkdown().replace(/[\0-\x7f]|([0-\u07ff]|(.))/g, "$&$1$2").length;
        let byteLength = (function(s, b , i, c) {
            for (b=i=0; c=s.charCodeAt(i++); b+=c>>11?3:c>>7?2:1);
            return b
        })(value)
        return byteLength
    }

    charByteSize = function (ch) {
        let charCode = ch.charCodeAt(0);
        if (charCode <= 0x00007F) {
            return 1;
        } else if (charCode <= 0x0007FF) {
            return 2;
        } else if (charCode <= 0x00FFFF) {
            return 3;
        } else {
            return 4;
        }
    }
    getByteLength = function (s) {
        let size = 0;
        for (let i=0; i<s.length; i++) {
            size += this.charByteSize(s.charAt(i));
        }
        return size;
    }
    cutByteLength = function (s, length) {
        let size = 0;
        let index = s.length;
        for (let i=0; i<s.length; i++) {
            size += this.charByteSize(s.charAt(i));
            if (size === length) {
                index = i + 1;
                break;
            } else if (size > length) {
                index = i;
                break;
            }
        }
        return s.substring(0, index);
    }



    /**
     * 유효성 문구 및 스크롤 이동
     * @param scrollWrap
     * @param targetEl
     * @param message
     * @param tag
     * @returns {boolean}
     */
    validCheck = function (scrollWrap, targetEl, message, tag = '') {
        if (!this.isEmpty(message)) targetEl.html(!this.isEmpty(tag) ? ('<' + tag + '>' + message + '</' + tag + '>') : message);
        let scrollTop = Number(scrollWrap.scrollTop() + targetEl.offset().top) - 250;
        scrollWrap.scrollLeft(0);
        scrollWrap.animate({scrollTop: scrollTop}, 300);
        return false
    }
    /**
     * 정규식으로 유효성 체크
     * @param value
     * @param regex
     * @return {boolean}
     */
    validCheckRegex = function(value, regex) {
        if (this.isEmpty(value)) return false;
        let regExp;
        if( typeof regex === "string" ) {
            regExp = new RegExp(regex);
        } else if( typeof regex.test === "function" ) {
            regExp = regex;
        } else {
            return false;
        }
        return regExp.test(value);
    }
    /**
     * Email 형식 체크
     * @param value
     * @returns {boolean}
     */
    validEmail = function (value) {
        if (this.isEmpty(value)) return false;
        let regExp = /^([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}}\.)|(([\w-]+\.)+))([a-zA-Z]{2,15}|[0-9]{1,3})(\]?)$/
        return (regExp.test(value))
    }

    /**
     * 비밀번호 형식 체크 (영문, 숫자, 특수문자(!,@,#,$,%,*)포함 8 ~ 12자)
     * @param value
     * @returns {boolean}
     */
    validPassword = function (value) {
        if (this.isEmpty(value)) return false
        let regExp1 = /[0-9]/
        let regExp2 = /[a-zA-Z]/
        let regExp3 = /[!@#$%*]/
        if(!regExp1.test(value) || !regExp2.test(value) || !regExp3.test(value) ||
            value.length < 8 || value.length > 12) {
            return false
        }
        return true
    }
    /**
     * 휴대폰 형식 체크
     * @param value
     * @returns {boolean}
     */
    validPhone = function (value) {
        if (this.isEmpty(value)) return false
        let regExp = /^((01[1|6|7|8|9])[1-9]+[0-9]{6,7})|(010[1-9][0-9]{7})$/
        return (regExp.test(value))
    }
    /**
     * 날짜 형식 체크
     * @param value
     * @returns {boolean}
     */
    validDate = function (value) {
        if (this.isEmpty(value)) return false
        let regExp = /^\d{4}\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])$/
        return (regExp.test(value))
    }
    /**
     * 생년월일 형식 체크
     * @param value
     * @returns {boolean}
     */
    validBirth = function (value) {
        if (this.isEmpty(value)) return false
        let regExp = /^(19[0-9][0-9]|20\d{2})(0[0-9]|1[0-2])(0[0-9]|[1-2][0-9]|3[0-1])$/
        return (regExp.test(value))
    }
    /**
     * 사업자번호 형식 체크
     * @param value
     * @returns {boolean}
     */
    validBzNo = function (value) {
        if (this.isEmpty(value)) return false
        let regExp = /^([0-9]{10})$/
        return (regExp.test(value))
    }
    /**
     * 법인등록번호 형식 체크
     * @param value
     * @returns {boolean}
     */
    validCorpRegNo = function (value) {
        if (this.isEmpty(value)) return false
        // let regExp = /^([0-9]{6})\-([0-9]{7})$/
        let regExp = /^([0-9]{13})$/
        return (regExp.test(value))
    }

    /**
     * 계좌번호 형식 체크
     * @param value
     * @returns {boolean}
     */
    validBankAccount = function (value) {
        if (this.isEmpty(value)) return false

        return !value.includes("-");
    }

    /**
     * 사업자번호 포맷
     * @param value
     */
    bizNumberFormat = function (value) {
        if (this.isEmpty(value)) return ''

        let format = value;
        try {
            if (format.length === 10) {
                format = format.replace(/^(\d{0,3})(\d{0,2})(\d{0,5})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "");
            }
        } catch(e) {
            return format;
        }
        return format;
    }

    cardNumberFormat = function (value) {
        if (this.isEmpty(value)) return ''

        let format = value;
        try {
            if (format.length < 18 && format.length >= 4) {
                format = format.replace(/^(\d{0,4})([0-9|*]{0,4})([0-9|*]{0,4})(\d{0,4})$/g, "$1-$2-$3-$4").replace(/(\-{1,2})$/g, "");
            }
        } catch(e) {
            return format;
        }
        return format;
    }

    cardNumberSpaceFormat = function (value) {
        if (this.isEmpty(value)) return ''

        let format = value;
        try {
            if (format.length < 18 && format.length >= 4) {
                format = format.replace(/^(\d{0,4})([0-9|*]{0,4})([0-9|*]{0,4})(\d{0,4})$/g, "$1 $2 $3 $4").replace(/(\s{1,3})$/g, "");
            }
        } catch(e) {
            return format;
        }
        return format;
    }
    
    /**
     * 연락처 포맷 ("-" 포함)
     * @param value
     * @returns {string|*}
     */
    phoneFormat = function (value) {
        if (this.isEmpty(value)) return ''
        let format = ''
        try {
            if (value.length === 11) {
                format = value.replace(/(\d{3})(\d{4})([0-9|*]{4})/, '$1-$2-$3')
            } else if (value.length === 8) {
                format = value.replace(/(\d{4})([0-9|*]{4})/, '$1-$2')
            } else {
                if (value.indexOf('02') === 0) {
                    if (value.length === 10) {
                        format = value.replace(/(\d{2})(\d{4})([0-9|*]{4})/, '$1-$2-$3')
                    } else {
                        format = value.replace(/(\d{2})(\d{3})([0-9|*]{4})/, '$1-$2-$3')
                    }
                } else {
                    if (value.length === 10) {
                        format = value.replace(/(\d{3})(\d{3})([0-9|*]{4})/, '$1-$2-$3')
                    } else {
                        format = value.replace(/(\d{3})(\d{4})([0-9|*]{4})/, '$1-$2-$3')
                    }
                }
            }
        } catch (e) {
            format = value
        }
        return format
    }
    /**
     * 날짜 포맷 (년,월,일)
     * @param date
     * @returns {string}
     */
    dateFormat = function (date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        return year + '/' + (month < 10 ? '0' + month : month) + '/' + (day < 10 ? '0' + day : day);
    }
    /**
     * 숫자 포맷 ("," 포함)
     * @param value
     * @returns {string}
     */
    numberFormat = function (value) {
        if (this.isEmpty(value) && value !== 0) return '';
        value = ('' + value).replace(/[^0-9]/g, '');
        if (value.length > 1) value = value.replace(/(^0+)/g, '');
        return value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    /**
     * 숫자만
     * @param value
     * @returns {string}
     */
    numberOnly = function (value) {
        if (this.isEmpty(value)) return '';
        return ('' + value).replace(/[^0-9]/g, '');
    }

    /**
     * 영문자만
     * @param value
     * @returns {string}
     */
    alphaOnly = function (value) {
        if (this.isEmpty(value)) return '';
        return ('' + value).replaceAll(/[^a-zA-Z]/gi, '');
    }

    /**
     * 값
     * @param value
     * @param defaultValue
     * @returns {string}
     */
    nvl = function(value, defaultValue) {
        let dv = "";
        if (!this.isEmpty(defaultValue)) dv =  defaultValue;

        return this.isEmpty(value) ? dv : value;
    }

    /**
     * 값
     * @param value
     * @param notNullVal
     * @param nullVal
     * @returns {string}
     */
    nvl2 = function(value, notNullVal, nullVal) {
        return !this.isEmpty(value) ? notNullVal : nullVal;
    }
    
    /**
     * elemnt 핸드폰번호 입력 ("-" 처리)
     * @param el
     */
    inputPhoneFormat = function (el) {
        $(el).val(this.phoneFormat(this.numberOnly($(el).val())));
    }
    /**
     * elemnt 숫자만 입력 ("," 처리)
     * @param el
     */
    inputNumberFormat = function (el) {
        $(el).val(this.numberFormat($(el).val()));
    }
    /**
     * elemnt 숫자만 입력
     * @param el
     */
    inputNumberOnly = function (el) {
        $(el).val(this.numberOnly($(el).val()));
    }

    
    /**
     * 날짜 선택
     * @param type
     * @returns {{}}
     */
    dateSelect = function (type) {
        let dateRange = {}
        let startDate = new Date();
        let endDate = new Date();
        switch (type) {
            case "D":
                dateRange.startDate = this.dateFormat(startDate);
                dateRange.endDate = this.dateFormat(endDate);
                break;
            case "1D":
                startDate.setDate(startDate.getDate() - 1);
                dateRange.startDate = this.dateFormat(startDate);
                dateRange.endDate = this.dateFormat(startDate);
                break;
            case "1W":
                startDate.setDate(startDate.getDate() - 7);
                dateRange.startDate = this.dateFormat(startDate);
                dateRange.endDate = this.dateFormat(endDate);
                break;
            case "M":
                dateRange.startDate = this.dateFormat(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
                dateRange.endDate = this.dateFormat(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0));
                break;
            case "1M":
                startDate.setMonth(startDate.getMonth() - 1);
                dateRange.startDate = this.dateFormat(startDate);
                dateRange.endDate = this.dateFormat(endDate);
                break;
            case "1MA":
                endDate.setMonth(startDate.getMonth() + 1);
                dateRange.startDate = this.dateFormat(startDate);
                dateRange.endDate = this.dateFormat(endDate);
                break;
            case "3M":
                startDate.setMonth(startDate.getMonth() - 3);
                dateRange.startDate = this.dateFormat(startDate);
                dateRange.endDate = this.dateFormat(endDate);
                break;
            case "6M":
                startDate.setMonth(startDate.getMonth() - 6);
                dateRange.startDate = this.dateFormat(startDate);
                dateRange.endDate = this.dateFormat(endDate);
                break;
            case "1Y":
                startDate.setFullYear(startDate.getFullYear() - 1);
                dateRange.startDate = this.dateFormat(startDate);
                dateRange.endDate = this.dateFormat(endDate);
                break;
            default:
                dateRange.startDate = "";
                dateRange.endDate = "";
                break;
        }
        return dateRange
    }
    checkOverSearchDateLimit = function(startDate, endDate, limitNum, limitType) {
        const calDate = moment(endDate).subtract(limitNum, limitType).diff(startDate, 'day');
        console.log("calDate : ", calDate);
        if(calDate > 0){
            return false;
        }else return true;
    }
    /**
     * 데이트 피커 세팅
     */
    setDatePicker = function (type = "", date= 0) {
        if ($(".calendar").length === 0)
            return;
        let hasType = !this.isEmpty(type);
        $(".calendar").each( function(index, item) {
            let rangeType = $(item).data("rangeType");
            if( hasType ) {
                rangeType = type;
            }

            let options = {
                yearRange: '1900:+00',
                maxDate: 0,
                minData: ""
            }
            switch (rangeType) {
                case "all" :
                    options.yearRange = '1900:c+10';
                    options.maxDate = '+10y';
                    options.minDate = "";
                    break;
                case "after" :
                    options.yearRange = '+00:c+10';
                    options.maxDate = '+10y';
                    options.minDate = 0;
                    break;
                case "specific" : // 특정 날짜 주고 싶을 때
                    options.yearRange = '+00:c+10';
                    options.maxDate = '+10y';
                    options.minDate = date;
                    break;
            }
            $.datepicker.regional["ko"] = {
                closeText: "닫기",
                prevText: "이전달",
                nextText: "다음달",
                currentText: "오늘",
                yearRange: options.yearRange,
                monthNames: ["1월","2월","3월","4월","5월","6월", "7월","8월","9월","10월","11월","12월"],
                monthNamesShort: ["1월","2월","3월","4월","5월","6월", "7월","8월","9월","10월","11월","12월"],
                dayNames: ["일","월","화","수","목","금","토"],
                dayNamesShort: ["일","월","화","수","목","금","토"],
                dayNamesMin: ["일","월","화","수","목","금","토"],
                weekHeader: "Wk",
                dateFormat: "yy/mm/dd",
                firstDay: 0,
                isRTL: false,
                showMonthAfterYear: true,
                yearSuffix: "",
                changeYear: true,
                changeMonth: true,
                showOtherMonths: true,
                maxDate: options.maxDate,
                minDate: options.minDate
            };
            // $.datepicker.setDefaults($.datepicker.regional["ko"]);
            //$(".calendar").removeClass("hasDatepicker").datepicker($.datepicker.regional["ko"]);
            $(item).removeClass("hasDatepicker").datepicker($.datepicker.regional["ko"]);
        });

    }

    
    
    /**
     * default 이미지
     * @param type
     */
    defaultImagePath = function (type = '') {
        if (type === "card") {
            event.target.src = '/assets/styles/img/common/tmp_card_back.png';
        }
    }
    /**
     * 파일 경로
     * @param path
     * @returns {*}
     */
    getFilePath = function (path) {
        if (String(path).startsWith("data")) {
            return path
        }
        return ConstCode.FILE_SERVER_URL + path
    }

    setReportHeight = function(reportBodyEl) {
        setTimeout(() => {
            // reportBodyEl이 여러 개일 경우를 대비해 each로 순회
            $(reportBodyEl).each(function() {
                const $currentReport = $(this);
                let contentHeight = $("div.content-inner").outerHeight();
                let gridContentHeight = $currentReport.find("table").outerHeight();

                if (contentHeight < 560) {
                    contentHeight = 560;
                }

                if (gridContentHeight > contentHeight) {
                    contentHeight -= 240;
                    $currentReport.height(contentHeight);
                } else {
                    contentHeight -= 240;
                    if (gridContentHeight > contentHeight) {
                        $currentReport.height(gridContentHeight - (gridContentHeight - contentHeight));
                    } else {
                        $currentReport.height(gridContentHeight);
                    }
                }
            });
        }, 100);
    }

    resizeTextarea = function(el, maxHeight) {
        let height = 300;
        if( !this.isEmpty(maxHeight) ) {
            height = maxHeight;
        }
        $(el).css("height", "30px");
        if( el.scrollHeight + 8 > height ) {
            $(el).css("height", height + "px");
        } else {
            $(el).css("height", (el.scrollHeight + 8) + "px");
        }
    }

    mergeTwoObjArrays = function (firstArr, secondArr, key) {
        return firstArr.map(item1 => {
            let item2 = secondArr.find(item2 => item1[key] === item2[key]);

            if (item2) {
                // normal merge if match
                return { ...item2, ...item1 };
            } else {
                // no match: add hidden + defCol
                return {
                    ...item1,
                    hidden: false,
                    defCol: item1?.default ? item1.default : false
                };
            }
        });
    };

    isValidDateString(dateStr) {
        if (!dateStr) return false;
        const regex = /^\d{4}\/\d{2}\/\d{2}$/;
        if (!regex.test(dateStr)) return false;
        return moment(dateStr, "YYYY/MM/DD", true).isValid();
    }
    normalizeDateInput(input) {
        // Remove all non-numeric
        const digits = input.replace(/\D/g, "");

        if (digits.length === 8) {
            // Format YYYYMMDD → YYYY/MM/DD
            return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6, 8)}`;
        }

        // If already formatted as YYYY-MM-DD or YYYY/MM/DD
        if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(input)) {
            return input.replace(/-/g, "/");
        }

        return input;
    }
    validateManualDates() {
        const $start = $("#searchStartDate");
        const $end = $("#searchEndDate");
        const $error = $("#dateErrorMessage");
        let rawStart = $start.val();
        let rawEnd = $end.val();
        let formattedStart = this.normalizeDateInput(rawStart);
        let formattedEnd = this.normalizeDateInput(rawEnd);
        // Format inputs
        if (formattedStart) $start.val(formattedStart);
        if (formattedEnd) $end.val(formattedEnd);

        // Clear previous error
        $error.text("").css("display", "none"); // or "block" based on layout;

        if (formattedStart && !this.isValidDateString(formattedStart)) {
            $error.text("유효하지 않은 날짜입니다, 다시 입력해 주세요.").css("display", "block"); // or "block" based on layout;
            return false;
        }
        console.log('formattedEnd',formattedEnd)
        if (formattedEnd && !this.isValidDateString(formattedEnd)) {
            $error.text("유효하지 않은 날짜입니다, 다시 입력해 주세요.").css("display", "block"); // or "block" based on layout;
            return false;
        }
        if (formattedStart && formattedEnd) {
            const startMoment = moment(formattedStart, "YYYY/MM/DD");
            const endMoment = moment(formattedEnd, "YYYY/MM/DD");
            if (endMoment.isBefore(startMoment)) {
                $error.text("조회 종료일은 조회 시작일보다 이후 날짜여야 합니다.").css("display", "block"); // or "block" based on layout;
                return false;
            }
        }
        return true;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    storeColsInLocal (defColumns, checkUncheckAll, lsn) {
        const viewCols = [];
        defColumns.forEach(obj => {
            viewCols.push({
                name: obj?.name,
                header: obj?.header,
                hidden: obj?.hidden ? obj.hidden : false,
                defCol: obj?.default ? obj.default : false
            })
        });
        const gridCols = {checkUncheckAll: checkUncheckAll || false, actualCols: viewCols}
        localStorage.setItem(lsn, JSON.stringify(gridCols));
    }

    openPopup(options) {
        // 기본 옵션 설정
        const defaults = {
            title: '',
            message: '알림',
            showCancelButton: false,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            onConfirm: null,
            onConfirmParams: null,
            onCancel: null,
            onCancelParams: null,
        };

        // 옵션 병합
        const settings = { ...defaults, ...options };

        // 취소 버튼 HTML (옵션에 따라 생성)
        const cancelButtonHtml = settings.showCancelButton
            ? `<button class="btn-cancel btn-type1 btn-l" style="font-weight:600;">${settings.cancelButtonText}</button>`
            : '';
        const hasBackdrop = $(".modal-backdrop").length > 0;
        const backdropHtml = hasBackdrop ? '' : '<div class="modal-backdrop"></div>';

        const html = `<div class="modal toastui-editor-contents" id="openPopup" style="display: none; z-index: 7777;">
            <div class="modal center-mode" tabIndex="-1" style="display: block;height: fit-content;width: 600px;">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header mt10 mr10 pd0"
                             style="border-bottom: 0px;height: 50px; justify-content: flex-end;">
                            <button class="close-modal">닫기</button>
                        </div>
                        <div class="modal-body">
                            <div class="mb15 pdl15 pdr15" style="font-size: 20px;text-align: center;">${settings.message}</div>
                            <div class="modal-btns border-none mb15">
                                ${cancelButtonHtml}
                                <button class="btn-confirm btn-type2 btn-l" style="font-weight:600;">${settings.confirmButtonText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${backdropHtml}
        </div>`;

        // 기존 팝업 제거
        $("#openPopup").remove();

        // 새 팝업 추가
        $("body").append(html);

        // 팝업 표시
        $("#openPopup").show();

        // 확인 버튼 이벤트
        $("#openPopup .btn-confirm").on("click", function() {
            if (settings.onConfirm && typeof settings.onConfirm === 'function') {
                settings.onConfirm(settings.onConfirmParams);
            } else {
                $("#openPopup").modal({show: false}).remove();
            }
        });

        // 취소 버튼 이벤트
        $("#openPopup .btn-cancel").on("click", function() {
            if (settings.onCancel && typeof settings.onCancel === 'function') {
                settings.onCancel(settings.onCancelParams);
            } else {
                $("#openPopup").modal({show: false}).remove();
            }
        });

        // 닫기 버튼 이벤트
        $("#openPopup .close-modal").on("click", function() {
            $("#openPopup").modal({show: false}).remove();
        });
    }
}

export default new Util();
