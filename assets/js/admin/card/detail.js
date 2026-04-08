import "/js/common/File.js?version=2025010801";

// 관리자 - 카드 주문 현황 상세 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: null,
    wptlCrdOrdrNo: '',
    cardOrderDetail: null,
    cardOrderDesignList: [],
    defaultDlvNoText: '송장 번호를 입력해 주세요.',
    maskingType: "mask",
    events: {
        // /**
        //  * key 이벤트
        //  */
        // keyEvent: function () {
        // },
        // /**
        //  * click 이벤트
        //  */
        // clickEvent: function () {
        // },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            // 디자인 업로드 영역 - 개별등록/일괄등록 선택 변경시
            $(document).on("change", "input:radio[name=uploadType]", function () {
                $("#orderValid").html("");                                     // 디자인 파일 유효성 체크 초기화
                let isEach = $(this).val() === "10";
                $(".eachUpload").css("display", (isEach ? "block" : "none"));  // 개별등록 영역 토글
                $(".batchUpload").css("display", (isEach ? "none" : "block")); // 일괄등록 영역 토글
            })

            // 송장 택배사 정보 선택 변경시
            let defaultDlvNoText;
            $(document).on("change", "#psrcNm", function () {
                if($("#psrcNm").val() == "기타") {
                    defaultDlvNoText = "직접 입력해 주세요.";
                } else {
                    defaultDlvNoText = _this.defaultDlvNoText;
                }

                $('[id^="psrvIvcNo"]').each(function(){
                    $(this).attr('placeholder', defaultDlvNoText);
                })
            })

        }
    },
    methods: {
        /**
         * 카드 주문 현황 상세 - 데이터  조회
         * @param pageType (주문 정보: info, 디자인: design, 배송 정보: delivery)
         * @returns {Promise<boolean>}
         */
        doGetCardOrderDetail: async function (pageType = "info", maskingType = "mask") {
            if (Util.isEmpty(_this.wptlCrdOrdrNo)) return false;
            _this.maskingType = maskingType;
            const params = {
                wptlCrdOrdrNo: _this.wptlCrdOrdrNo // 카드 주문 시퀀스
            }
            if( maskingType === "unmask" ) {
                params.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/card/doGetCardOrderDetail', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.cardOrderDetail = entity;
                _this.cardOrderDetail.cardOrderDesignNmList = _this.cardOrderDetail.cardOrderDesignList.map(item => {return item.crdDsgFileNm});
                _this.methods.getPageContent(pageType);
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
         * @param pageType (주문 정보: info,
         *                  디자인: design, 디자인 등록/수정: designMod,
         *                  배송 정보: delivery, 배송 정보 등록/수정: deliveryMod)
         * @returns {Promise<void>}
         */
        getPageContent: async function (pageType = "info") {
            const params = {
                path: 'admin/card/detail_content',
                htmlData: {
                    pageType: pageType,
                    cardOrderDetail: _this.cardOrderDetail
                }
            }
            switch (pageType) {
                case "design" :
                    // 무통장 입금이 완료 되지 않은 경우 (사원증만)
                    if (_this.cardOrderDetail.wptlCrdOrdrStCd === ConstCode.CODES_CARD.ORDER_STATUS.APPLY_COMPLETE &&
                        _this.cardOrderDetail.wptlPrdCrdTypeCd === ConstCode.CODES_PRODUCT.CRD_TYPE.EMPLOYEE) {
                        alert("무통장 입금 확인 완료 후 디자인을 등록해 주세요.");
                        return;
                    }
                    // 디자인을 등록하지 않은 경우, 디자인 등록/수정 화면으로 (사원증만)
                    if (_this.cardOrderDetail.wptlCrdOrdrStCd === ConstCode.CODES_CARD.ORDER_STATUS.PAYMENT_COMPLETE &&
                        _this.cardOrderDetail.wptlPrdCrdTypeCd === ConstCode.CODES_PRODUCT.CRD_TYPE.EMPLOYEE) {
                        params.htmlData.pageType = "designMod";
                    }
                    break;
                case "designMod" :
                    if (!confirm("디자인 파일 수정 시 파일을 다시 업로드 해야 합니다.\n수정하시겠습니까?")) return;
                    break;
                // case "designCancel" :
                //     // 디자인 등록/수정 화면에서 취소시
                //     if (!confirm("취소 하시겠습니까?")) return;
                //     alert("취소 하였습니다.");
                //     // 디자인을 등록하지 않은 경우, 주문정보 화면으로
                //     params.htmlData.pageType = (_this.cardOrderDetail.wptlCrdOrdrStCd === ConstCode.CODES_CARD.ORDER_STATUS.APPLY_COMPLETE ||
                //                                  _this.cardOrderDetail.wptlCrdOrdrStCd === ConstCode.CODES_CARD.ORDER_STATUS.PAYMENT_COMPLETE)
                //                                 ? "info"
                //                                 : "design";
                //     break;
                case "delivery" :
                    // 무통장 입금이 완료 되지 않은 경우
                    if (_this.cardOrderDetail.wptlCrdOrdrStCd === ConstCode.CODES_CARD.ORDER_STATUS.APPLY_COMPLETE) {
                        alert("무통장 입금 확인 완료 후 배송 정보를 등록해 주세요.");
                        return;
                    }
                    // 결제 완료인 경우, 디자인 등록이 되지 않은 경우 (사원증만)
                    if (_this.cardOrderDetail.wptlCrdOrdrStCd === ConstCode.CODES_CARD.ORDER_STATUS.PAYMENT_COMPLETE &&
                        _this.cardOrderDetail.wptlPrdCrdTypeCd === ConstCode.CODES_PRODUCT.CRD_TYPE.EMPLOYEE) {
                        alert("디자인을 등록해 주세요.");
                        return;
                    }
                    // 디자인 완료인 경우
                    if (_this.cardOrderDetail.wptlCrdOrdrStCd === ConstCode.CODES_CARD.ORDER_STATUS.DESIGN_COMPLETE) {
                        alert("기업 회원이 제작 요청 후 배송 정보를 등록할 수 있습니다.");
                        return;
                    }
                    // 배송 정보를 등록하지 않은 경우, 배송 정보 등록/수정 화면으로
                    if (_this.cardOrderDetail.wptlCrdOrdrStCd !== ConstCode.CODES_CARD.ORDER_STATUS.SHIPPING &&
                        _this.cardOrderDetail.wptlCrdOrdrStCd !== ConstCode.CODES_CARD.ORDER_STATUS.RECEIPT_COMPLETE) {
                        params.htmlData.pageType = "deliveryMod";
                    }
                    break;
                // case "deliveryCancel" :
                //     // 배송 정보 등록/수정 화면에서 취소시
                //     if (!confirm("취소 하시겠습니까?")) return;
                //     alert("취소 하였습니다.");
                //     // 배송 정보를 등록하지 않은 경우, 주문정보 화면으로
                //     params.htmlData.pageType = (_this.cardOrderDetail.wptlCrdOrdrStCd !== ConstCode.CODES_CARD.ORDER_STATUS.SHIPPING &&
                //                                 _this.cardOrderDetail.wptlCrdOrdrStCd !== ConstCode.CODES_CARD.ORDER_STATUS.RECEIPT_COMPLETE)
                //                                 ? "info"
                //                                 : "delivery";
                //     break;
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
            if( pageType === "deliveryMod" ) {
                $("#psrcNm").trigger("change");
            }
            if( $(".memo-box").length ) {
                Util.resizeTextarea($(".memo-box").get(0));
            }
            // _this.scrollWrap.animate({scrollTop: 0}, 300);
            // Util.validCheck(_this.scrollWrap, $(".card-item-detail-wrap"));
        },

        /* ---------------------------------------- 주문 정보 start ---------------------------------------- */
        /**
         * 무통장 입금 확인 완료
         * @returns {Promise<void>}
         */
        doConfirmBankDeposit: async function () {
            const params = {
                wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo), // 카드 주문 시퀀스
                freePaymentYn: $("#freePayment").is(":checked") ? "Y" : "N"   // 무상제작 Y/N
            }
            if (params.freePaymentYn === "Y") {
                if (!confirm("무상 제작 처리하시겠습니까?")) return;
            } else {
                if (!confirm("현재 주문 건을 입금 확인 처리 하시겠습니까?")) return;
            }

            // console.log(params);
            const res = await ServiceExec.post('/api/admin/card/doConfirmBankDeposit', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if (params.freePaymentYn === "Y") {
                    alert("무상 처리 완료 처리하였습니다");
                } else {
                    alert("현재 주문 건을 입금 확인 처리하였습니다.");
                }
                _this.methods.doGetCardOrderDetail();
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
        /* ---------------------------------------- 주문 정보 end ---------------------------------------- */

        /* ---------------------------------------- 디자인 start ---------------------------------------- */
        /**
         * 디자인 등록/수정 input 영역 추가
         */
        addDesignInputItem: function () {
            let index = $("#designInputWrap").find('tr').length + 1
            let html = '<tr>' +
                            '<td>' + index + '</td>' +
                            '<td><input type="text" class="inp text-center block" name="eachNm"></td>' +
                            '<td>' +
                                '<div class="inp-box1">' +
                                    '<div class="inp-del">' +
                                        '<input type="file" name="eachFile" accept="image/jpeg, image/png" onchange="FILE.methods.fileChange(this, \'image\')" style="display: none;">' +
                                        '<input type="text" class="inp" name="eachFileNm" readonly>' +
                                        '<input type="hidden" name="eachFilePthNm">' +
                                        '<button class="btn-del" onclick="FILE.methods.removeFile(this)" style="display: none;"><span class="hidden">삭제</span></button>' +
                                    '</div>' +
                                    '<button class="btn-type10" onclick="FILE.methods.findFile(this)"><strong>찾기</strong></button>' +
                                    '<button class="btn-type12 red" onclick="FH.methods.deleteDesignInputItem(this)"><strong>삭제</strong></button>' +
                                '</div>' +
                            '</td>' +
                        '</tr>';
            $("#designInputWrap").append(html);
        },
        /**
         * 디자인 등록/수정 input 영역 삭제
         * @param el (삭제 button)
         */
        deleteDesignInputItem: function (el) {
            $(el).closest("tr").remove();
            $("#designInputWrap tr").each(function (index, item) {
                $(item).find("td:eq(0)").text(index + 1);
            });
        },
        /**
         * 디자인 미리보기 데이터
         * @param contentType (디자인: design, 디자인 등록/수정: designMod)
         * @returns {boolean}
         */
        setPreview: function (contentType) {
            let previewList = [];
            if (contentType === "design") { // 디자인 화면인 경우
                // 기존 디자인 리스트로 모달 열기
                previewList = _this.cardOrderDetail.cardOrderDesignList.map(item => {
                    let cardInfo = { ...item };
                    cardInfo.crdDsgFilePthNm = Util.getFilePath(cardInfo.crdDsgFilePthNm);
                    return cardInfo
                })
                _this.methods.openPreviewModal(previewList);
            } else { // 디자인 등록/수정 화면인 경우
                let promises = [];
                const getFileInfo = async function (file, stfNm) {
                    return new Promise(resolve => {
                        let reader = new FileReader();
                        reader.onload = function (e) {
                            let fileInfo = {
                                crdDsgFile: file,
                                crdDsgFileNm: file.name,
                                crdDsgFilePthNm: e.target.result,
                                stfNm: stfNm
                            }
                            resolve(fileInfo);
                        };
                        reader.readAsDataURL(file);
                    })
                }
                const getImageInfo = function (el) {
                    return {
                        stfNm: $(el).find("input:text[name=eachNm]").val(),
                        crdDsgFile: undefined,
                        crdDsgFileNm: $(el).find("input:text[name=eachFileNm]").val(),
                        crdDsgFilePthNm: Util.getFilePath($(el).find("input:hidden[name=eachFilePthNm]").val())
                    }
                }
                _this.validEl.html("");
                let uploadType = $("input:radio[name=uploadType]:checked").val()
                if (uploadType === "10") { // 개별 등록인 경우
                    $("#designInputWrap tr").each((index, item) => {
                        let file = $(item).find("input:file[name=eachFile]")[0].files[0];
                        if (file !== undefined) {
                            let stfNm = $(item).find("input:file[name=eachNm]").val();
                            promises.push(getFileInfo(file, stfNm));
                        } else {
                            let fileNm = $(item).find("input:text[name=eachFileNm]").val();
                            if (!Util.isEmpty(fileNm)) promises.push(getImageInfo(item));
                        }
                    })
                    if (promises.length === 0) {
                        Util.validCheck(_this.scrollWrap, _this.validEl, "디자인 파일을 업로드해 주세요.");
                        return false;
                    }
                } else { // 일괄 등록인 경우
                    let batchFiles = $("#batchFiles")[0].files
                    if (batchFiles.length !== 0) {
                        for (const batch of batchFiles) {
                            promises.push(getFileInfo(batch, batch.name))
                        }
                    } else {
                        $(".batchFileWrap").each((index, item) => {
                            let fileNm = $(item).find("input:text[name=eachFileNm]").val();
                            if (!Util.isEmpty(fileNm)) promises.push(getImageInfo(item));
                        })
                    }
                    if (promises.length === 0) {
                        Util.validCheck(_this.scrollWrap, _this.validEl, "디자인 파일을 업로드해 주세요.");
                        return false;
                    }

                    // let batchFiles = $("#batchFiles")[0].files
                    // if (batchFiles.length === 0) {
                    //     Util.validCheck(_this.scrollWrap, _this.validEl, "디자인 파일을 업로드해 주세요.");
                    //     return false;
                    // }
                    // for (const batch of batchFiles) {
                    //     promises.push(getFileInfo(batch, batch.name))
                    // }
                }
                if (promises.length > 0) {
                    Promise.all(promises).then(results => {
                        for (const result of results) {
                            result.wptlCrdOrdrNo = _this.wptlCrdOrdrNo
                            previewList.push(result)
                        }
                        _this.methods.openPreviewModal(previewList);
                    })
                }
            }
        },
        /**
         * 디자인 미리보기 modal 열기
         * @param previewList (이미지 리스트)
         */
        openPreviewModal: async function (previewList) {
            const params = {
                path: "modal/preview",
                htmlData: {
                    previewList : previewList
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#previewModal").length) $("#previewModal").remove();
            $("body").children("a.btn-top").after(html);
            setTimeout(() => {
                $("#previewModal").modal({show: true});
            }, 300)
        },
        /**
         * Order Memo Modal
         * @param
        */
        openOrderMemoModal: async function(type) {
            const params = {
                path: "modal/orderMemo",
                htmlData: {
                    wptlCrdOrdrNo: _this.wptlCrdOrdrNo,
                    modalType: type
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#orderMemoModal").length) $("#orderMemoModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#orderMemoModal").modal({show: true});

            ORDER_MEMO.wptlCrdOrdrNo = _this.wptlCrdOrdrNo;

            if( type === "mod" ) {
                await ORDER_MEMO.methods.doGetMemoCn();
            }
            $("#memoCn").trigger("keyup");
        },

        /**
         * 디자인 등록/수정
         * @returns {Promise<void>}
         */
        doUploadCardOrderDesign: async function () {
            if (!_this.methods.designValid()) return;
            const params = {
                wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo),                    // 카드 주문 시퀀스
                crdDsgTypeCd: $("input:radio[name=uploadType]:checked").val(), // 업로드 유형 (개별, 일괄)
                cardOrderDesignList: _this.cardOrderDesignList                 // 디자인 리스트
            }
            if (!confirm("디자인 파일을 업로드 하시겠습니까?")) return;

            // 2500건 ~ 3000건 일 경우, 1000건씩 업로드
            const limitParameterCount = params.cardOrderDesignList.length;
            if(limitParameterCount >= 2500 || limitParameterCount <= 3000){
                const uploadCount = 1000;
                const new_array = [];
                const limitUploadCount = Math.floor(limitParameterCount / uploadCount) + (Math.floor(limitParameterCount % uploadCount) > 0 ? 1 : 0);
                for (let i = 0; i < limitUploadCount; i++){
                    new_array.push(params.cardOrderDesignList.splice(0, uploadCount));

                    const new_params = {
                        wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo),                    // 카드 주문 시퀀스
                        crdDsgTypeCd: $("input:radio[name=uploadType]:checked").val(), // 업로드 유형 (개별, 일괄)
                        isRemoveCardOrderDesign: i === 0 ? false : true, // 기존 카드 디자인 삭제 여부
                        cardOrderDesignList: new_array[i]                 // 디자인 리스트
                    }

                    const res = await ServiceExec.formPost('/api/admin/card/doUploadCardOrderDesign', new_params);
                    if((i + 1) === limitUploadCount){
                        const code = res.code;
                        const message = res.message;
                        const entity = res.entity;

                        _this.methods.doUploadCardOrderDesignRes(code, message);
                    }
                }
            } else {
                const res = await ServiceExec.formPost('/api/admin/card/doUploadCardOrderDesign', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;

                _this.methods.doUploadCardOrderDesignRes(code, message);
            }
        },
        /**
         * 디자인 등록/수정 API Response
         * @returns {Promise<void>}
         */
        doUploadCardOrderDesignRes: async function (code, message){
            if (code === 1) {
                alert("디자인 파일을 업로드 하였습니다.");
                _this.methods.doGetCardOrderDetail();
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
         * 디자인 등록/수정 유효성 체크
         * @returns {boolean}
         */
        designValid: function () {
            _this.validEl.html("");
            let isNameEmpty = false;
            let isFileEmpty = false;
            _this.cardOrderDesignList = [];
            let uploadType = $("input:radio[name=uploadType]:checked").val();
            if (uploadType === "10") { // 개별 등록인 경우
                $("#designInputWrap tr").each((index, item) => {
                    let cardDsgFile = $(item).find("input:file[name=eachFile]")[0].files[0];
                    let crdDsgInfo = {
                        wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo),
                        stfNm: $(item).find("input:text[name=eachNm]").val().trim(),
                        crdDsgFileNm: $(item).find("input:text[name=eachFileNm]").val().trim(),
                        crdDsgFilePthNm: $(item).find("input:hidden[name=eachFilePthNm]").val().trim()
                    }

                    if(cardDsgFile !== undefined) {
                        crdDsgInfo.crdDsgFile = cardDsgFile;
                    }

                    _this.cardOrderDesignList.push(crdDsgInfo);
                    if (Util.isEmpty(crdDsgInfo.stfNm)) isNameEmpty = true;
                    if (Util.isEmpty(crdDsgInfo.crdDsgFile) && Util.isEmpty(crdDsgInfo.crdDsgFileNm)) isFileEmpty = true;
                })
            } else { // 일괄 등록인 경우
                let batchFiles = $("#batchFiles")[0].files;
                if (batchFiles.length === 0) {
                    $(".batchFileWrap").each((index, item) => {
                        let crdDsgInfo = {
                            wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo),
                            stfNm: "",
                            crdDsgFile: {},
                            crdDsgFileNm: $(item).find("input:text[name=eachFileNm]").val(),
                            crdDsgFilePthNm: $(item).find("input:text[name=eachFilePthNm]").val()
                        }
                        if (!Util.isEmpty(crdDsgInfo.crdDsgFileNm)) _this.cardOrderDesignList.push(crdDsgInfo);
                    })
                    if (_this.cardOrderDesignList.length === 0) isFileEmpty = true;
                } else {
                    for (const batch of batchFiles) {
                        let crdDsgInfo = {
                            wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo),
                            // 파일명 보낼떄
                            // stfNm: !Util.isEmpty(batch.name) ? batch.name.substring(0, batch.name.lastIndexOf(".")) : "",
                            stfNm: "",
                            crdDsgFile: batch,
                            crdDsgFileNm: batch.name,
                            crdDsgFilePthNm: ""
                        }
                        _this.cardOrderDesignList.push(crdDsgInfo);
                    }
                }
            }
            if (isNameEmpty) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "사원명을 입력해 주세요.");
                return false;
            }
            if (isFileEmpty) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "디자인 파일을 업로드해 주세요.");
                return false;
            }
            return true;
        },
        /* ---------------------------------------- 디자인 end ---------------------------------------- */

        /* ---------------------------------------- 배송 정보 start ---------------------------------------- */
        /**
         * 배송 정보 등록/수정
         * @returns {Promise<void>}
         */
        doRegistDeliveryInfo: async function () {
            const params = {
                wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo), // 카드 주문 시퀀스
                psrcNm: $("#psrcNm").val(),                 // 택배사
                dlvRcpDt: $("#dlvRcpDt").val().trim(),      // 배송접수일
                psrvIvcNo: $("#psrvIvcNo").val().trim(),    // 송장번호1
                psrvIvcNo1: $("#psrvIvcNo1").val().trim(),  // 송장번호2
                psrvIvcNo2: $("#psrvIvcNo2").val().trim()   // 송장번호3
            }
            if (!_this.methods.deliveryValid(params)) return;
            if (!confirm("송장 번호를 저장하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/admin/card/doRegistDeliveryInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("송장 번호를 저장했습니다.");
                _this.methods.doGetCardOrderDetail();
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
         * 배송 정보 등록/수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        deliveryValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.psrcNm)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "택배사를 선택해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.dlvRcpDt)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "배송 접수일을 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.psrvIvcNo) && Util.isEmpty(params.psrvIvcNo1) && Util.isEmpty(params.psrvIvcNo2)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "송장 번호를 입력해 주세요.");
                return false;
            }
            return true;
        }
        /* ---------------------------------------- 배송 정보 end ---------------------------------------- */
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