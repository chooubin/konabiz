let inputUnmaskYn = "N";
let ajaxLoading = false;
$(function () {
    $(document).on({
        mouseenter: function () {
            const $target = $(this);
            const tooltipText = $target.data("tooltipText");
            const $tooltipEl = $("<div class='tooltip-text'>" + tooltipText + "</div>");

            $("body").append($tooltipEl);

            // Get dimensions
            const tooltipWidth = $tooltipEl.outerWidth();
            const tooltipHeight = $tooltipEl.outerHeight();
            const targetOffset = $target.offset();
            const targetWidth = $target.outerWidth();
            const targetHeight = $target.outerHeight();
            const scrollTop = $(window).scrollTop();

            let top = targetOffset.top - tooltipHeight - 10; // Default: above
            let left = targetOffset.left - 20;

            const viewportWidth = $(window).width();
            const viewportHeight = $(window).height();

            // If tooltip goes off the top of the viewport, show it below
            if (top < scrollTop) {
                top = targetOffset.top + targetHeight + 10;
            }

            // Prevent tooltip from going off left edge
            if (left < 10) {
                left = 10;
            }

            // Prevent tooltip from going off right edge
            if (left + tooltipWidth > viewportWidth - 10) {
                left = viewportWidth - tooltipWidth - 10;
            }

            // Apply final position
            $tooltipEl
                .css({
                position: "absolute",
                left: left + "px",
                top: top + "px",
                display: "none"
            })
                .fadeIn(200);
        },
        mouseleave: function () {
            $(".tooltip-text").remove();
        }
    }, '.tooltip-kbc');

    // input 박스 마스킹 처리 이벤트 주입
    const elements = document.querySelectorAll(".masking-input");
    addEventListenerByElements( elements );
    elements.forEach( (el) => {
        if( !Util.isEmpty($(el).val()) ) {
            el.dispatchEvent( new Event("input") );
        }
    });
});

window.addEventListener("load", function() {
    if( !ajaxLoading ) {
        stopLoading();
    }
});

function startLoading() {
    if( !$(".loading-container").length ) {
        if( $(".nav").length ) {
            $("body").prepend("<div class=\"loading-container inner\"><div class=\"loading-wrap\"><div class=\"loading\"></div><div class=\"loading-text\">loading</div></div></div>");
        } else {
            $("body").prepend("<div class=\"loading-container\"><div class=\"loading-wrap\"><div class=\"loading\"></div><div class=\"loading-text\">loading</div></div></div>");
        }
    }
    if( $(".loading-container .loading").length ) {
        if( $(".modal-backdrop:visible").length ) {
            $(".loading-container .loading").css("border-color", "transparent #FFF");
            $(".loading-container .loading-text").css("color", "transparent #FFF");
        } else {
            $(".loading-container .loading").css("border-color", "transparent #000");
            $(".loading-container .loading-text").css("color", "transparent #000");
        }
    }
}

function stopLoading() {
    setTimeout( function() {
        if( $(".loading-container").length ) {
            $(".loading-container").remove();
        }
    }, 150);
}

function addEventListenerByElements( elements ) {
    elements.forEach( (el) => {
        el.dataset.selectionStart = 0;
        el.dataset.selectionEnd = 0;

        // 텍스트 드래그 선택 범위
        el.addEventListener( "select", (event) => {
            const target = event.target;
            target.dataset.selectionStart = target.selectionStart;
            target.dataset.selectionEnd = target.selectionEnd;
        });

        el.addEventListener( "input", (event) => {
            const target = event.target;
            const $target = $(event.target);
            const maskingType = target.dataset.maskingType;
            if( Util.isEmpty(maskingType) ) {
                return;
            }
            let realValue = $target.data("realValue");
            realValue = Util.isEmpty(realValue) ? "" : realValue;
            let currentPos = Number(target.selectionStart);
            const selectionStart = Number(target.dataset.selectionStart);
            const selectionEnd = Number(target.dataset.selectionEnd);
            let letter = "";
            // backspace or delete 삭제
            if( event.inputType === "deleteContentBackward" || event.inputType === "deleteContentForward") {
                if (selectionStart !== selectionEnd) {
                    realValue = makeValue(realValue, selectionStart, selectionEnd);
                } else {
                    realValue = makeValue(realValue, currentPos, currentPos + 1);
                }
            }
            // 텍스트 붙여넣기
            else if ( event.inputType === "insertFromPaste" ) {
                let currentValue = target.value;
                let beforeFront = realValue.substring( 0, realValue.length - currentValue.substring(currentPos).length );
                const letter = currentValue.substring( beforeFront.length, currentPos );

                if (selectionStart !== selectionEnd) {
                    realValue = makeValue(realValue, selectionStart, selectionEnd, letter);
                } else {
                    realValue = makeValue(realValue, beforeFront.length, beforeFront.length, letter);
                }
            } else {
                letter = Util.isEmpty(event.inputType) ? target.value : event.data; // inputType 이 null 일 경우 자동완성으로 판단.
                if( event.inputType === "insertCompositionText"
                        && (maskingType === ConstCode.CODES_MASKING.PHONE || maskingType === ConstCode.CODES_MASKING.PHONE_NUMBER_ONLY
                                || maskingType === ConstCode.CODES_MASKING.CARD_NUMBER || maskingType === ConstCode.CODES_MASKING.CARD_NUMBER_ONLY
                                || maskingType === ConstCode.CODES_MASKING.CARD_NUMBER_SPACE || maskingType === ConstCode.CODES_MASKING.ACCOUNT_NUMBER
                                || maskingType === ConstCode.CODES_MASKING.CARD_NUMBER2 || maskingType === ConstCode.CODES_MASKING.CARD_NUMBER3)
                ) {
                    letter = "";
                }
                if (selectionStart !== selectionEnd) {
                    realValue = makeValue(realValue, selectionStart, selectionEnd, letter);
                } else {
                    let currentValue = target.value;
                    // if( Util.isEmpty(letter) ) {
                    //     letter = currentValue;
                    // }
                    if( Util.isEmpty(event.inputType) && currentValue.length ) {
                        realValue = letter;
                    } else {
                        realValue = makeValue(realValue, currentPos - 1, currentPos - 1, letter);
                    }
                }
            }

            let maskingValue;
            let beforeRealValue, beforeSeparCnt = 0, afterSepaCnt = 0;

            switch (maskingType) {
                // 핸드폰 번호 마스킹 처리
                case ConstCode.CODES_MASKING.PHONE:
                    beforeRealValue = $target.data("realValue");
                    if( !Util.isEmpty(beforeRealValue) ) {
                        if( beforeRealValue.toString().indexOf("-") > -1 ) {
                            beforeSeparCnt = beforeRealValue.split("-").length - 1;
                        }
                    }
                    realValue = Util.numberOnly( realValue );
                    maskingValue = Util.phoneFormat( maskingForPhone(realValue) );
                    realValue = Util.phoneFormat( realValue );
                    if( !Util.isEmpty(realValue) ) {
                        afterSepaCnt = realValue.split("-").length - 1;
                    }
                    break;
                // 카드번호 마스킹 처리
                case ConstCode.CODES_MASKING.CARD_NUMBER:
                    beforeRealValue = $target.data("realValue");
                    if( !Util.isEmpty(beforeRealValue) ) {
                        beforeSeparCnt = beforeRealValue.split("-").length - 1;
                    }
                    realValue = Util.numberOnly( realValue );
                    maskingValue = Util.cardNumberFormat( maskingForCardNumber(realValue) );
                    realValue = Util.cardNumberFormat( realValue );
                    if( !Util.isEmpty(realValue) ) {
                        afterSepaCnt = realValue.split("-").length - 1;
                    }
                    break;
                case ConstCode.CODES_MASKING.CARD_NUMBER_SPACE:
                    beforeRealValue = $target.data("realValue");
                    if( !Util.isEmpty(beforeRealValue) ) {
                        beforeSeparCnt = beforeRealValue.split(" ").length - 1;
                    }
                    realValue = Util.numberOnly( realValue );
                    maskingValue = Util.cardNumberSpaceFormat( maskingForCardNumber(realValue) );
                    realValue = Util.cardNumberSpaceFormat( realValue );
                    if( !Util.isEmpty(realValue) ) {
                        afterSepaCnt = realValue.split(" ").length - 1;
                    }
                    break;
                case ConstCode.CODES_MASKING.CARD_NUMBER2:
                    realValue = Util.numberOnly( realValue );
                    maskingValue = maskingForCardNumber2( realValue );
                    break;
                case ConstCode.CODES_MASKING.CARD_NUMBER3:
                    realValue = Util.numberOnly( realValue );
                    maskingValue = maskingForAll( realValue );
                    break;
                case ConstCode.CODES_MASKING.PHONE_NUMBER_ONLY:
                    realValue = Util.numberOnly( realValue );
                    maskingValue = maskingForPhone( realValue );
                    break;
                case ConstCode.CODES_MASKING.CARD_NUMBER_ONLY:
                    realValue = Util.numberOnly( realValue );
                    maskingValue = maskingForCardNumber( realValue );
                    break;
                case ConstCode.CODES_MASKING.ACCOUNT_NUMBER:
                    realValue = Util.numberOnly( realValue );
                    maskingValue = maskingForBankAccount( realValue );
                    break;
                case ConstCode.CODES_MASKING.NAME:
                    maskingValue = maskingForName(realValue);
                    break;
                case ConstCode.CODES_MASKING.ALL:
                    maskingValue = maskingForAll(realValue);
                    break;
                default:
                    break;
            }

            $target.data("realValue", realValue);   // 실제 값 dataset 저장
            target.value = inputUnmaskYn === "Y" ? realValue : maskingValue;    // 마스킹된 값

            if( selectionStart != selectionEnd ) {
                currentPos = selectionStart + ( Util.isEmpty(letter) ? 0 : letter.length );
            } else {
                let diffrence = afterSepaCnt - beforeSeparCnt;
                currentPos = currentPos + (diffrence < 0 ? 0 : diffrence);
                currentPos = currentPos < 0 ? 0 : currentPos;
            }
            target.dataset.selectionStart = currentPos;
            target.dataset.selectionEnd = currentPos;
            target.selectionStart = currentPos;
            target.selectionEnd = currentPos;
        });
    });

    function makeValue( sourceValue, startPos, endPos, letter ) {
        const addString = Util.isEmpty(letter) ? "" : letter
        if( !Util.isEmpty(sourceValue) ) {
            const front = String(sourceValue).slice(0, startPos);
            const back = String(sourceValue).slice(endPos);
            return front + addString +  back;
        } else {
            return addString;
        }
    }
}

function maskingForCardNumber2(cardNumber2) {
    if( Util.isEmpty(cardNumber2) ) {
            return "";
    }
    const resultValue = cardNumber2.split("").map( (value, idx) => {
        if( idx > 1 ) {
            return "*";
        } else {
            return value;
        }
    }).join("");

    return resultValue;
}

function maskingForName(name) {
    if( Util.isEmpty(name) ) {
        return "";
    }

    const regex = /^([a-zA-Z\s]*)$/;
    let resultValue = ""
    let index = 0;
    if( regex.test(name) ) {
        resultValue = name.split("").map( (value, idx) => {
            if( value === " " ) {
                return value;
            } else {
                index++;
                if( index > 2 ) {
                    return "*";
                } else {
                    return value;
                }
            }
        }).join("");
    } else {
        resultValue = name.split("").map( (value, idx) => {
            if( value === " " ) {
                return value;
            } else {
                index++;
                if( index > 1 && index < name.length || name.length === 2 && index === 2 ) {
                    return "*";
                } else {
                    return value;
                }
            }
        }).join("");
    }
    return resultValue;
}

function maskingForPhone(phoneNumber) {
    if( Util.isEmpty(phoneNumber) ) {
        return "";
    } else if( phoneNumber.length <= 7 ) {
        return phoneNumber;
    } else {
        return phoneNumber.substring( 0, 7 ) + "*".repeat( phoneNumber.length - 7 );
    }
}

function maskingForCardNumber(cardNumber) {
    if( Util.isEmpty(cardNumber) ) {
        return "";
    }
    const resultValue = cardNumber.split("").map( (value, idx) => {
        if( idx > 5 && idx < 12 ) {
            return "*";
        } else {
            return value;
        }
    }).join("");

    return resultValue;
}

function maskingForBankAccount(accNumber) {
    if( Util.isEmpty(accNumber) ) {
        return "";
    } else if( accNumber.length <= 5 ) {
        return accNumber;
    } else {
        return accNumber.substring( 0, accNumber.length - 5 ) + "*".repeat( 5 );
    }
}

function maskingForAll(value) {
    if( Util.isEmpty(value) ) {
        return "";
    }
    const resultValue = value.split("").map( (v, idx) => {
        if( v !== " " ) {
            return "*";
        } else {
            return v;
        }
    }).join("");

    return resultValue;
}

function unmaskingInput( $parent ) {
    inputUnmaskYn = "Y";
    let $elements = $parent.find(".masking-input");
    $elements.each( function(idx, item) {
        const value = $(item).data("realValue");
        $(item).val( value );
    });
}