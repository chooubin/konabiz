import "/js/common/File.js?version=2025010801";

// 관리자 - 상품 신청 관리 상세 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: $("#valid"),
    wptlPrdNo: '',
    applyProductDetail: null,
    cstzCrdDsgFrnsList: [],
    cstzCrdDsgBcks: {},
    prdSllUprc: "",
    prdOrdUnt : "",
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
            $(document).on("click", "#crdOrdrFileModBtn", function () {
                $("#crdOrdrFileSaveCell").show();
                $("#crdOrdrFileModCell").hide();
            });
        },
        /**
         * change 이벤트
         */
        changeEvent: function () {
        }
    },
    methods: {
        /**
         * 상품 신청 관리 상세 - 데이터 조회
         * @param pageType (신청정보: info, 디자인: design)
         * @returns {Promise<boolean>}
         */
        doGetApplyProductDetail: async function (pageType = "info", maskingType) {
            if (Util.isEmpty(_this.wptlPrdNo)) return false;
            const params = {
                wptlPrdNo: Number(_this.wptlPrdNo) // 상품 시퀀스
            }
            if( maskingType === "unmask" ) {
                params.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doGetApplyProductDetail', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.applyProductDetail = entity;
                _this.prdSllUprc = entity.prdSllUprc;
                _this.prdOrdUnt  = entity.prdOrdUnt;
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
         * 상품 신청 관리 상세 - 내용 페이지 호출
         * @param pageType (신청정보: info, 디자인: design, 디자인 수정: designMod)
         * @returns {Promise<void>}
         */
        getPageContent: async function (pageType = "info") {
            const params = {
                path: "admin/product/request/detail_content",
                htmlData: {
                    pageType: pageType,
                    applyProductDetail: _this.applyProductDetail
                }
            }
            let ret = true;
            switch (pageType) {
                case "design" :
                    // 디자인을 등록하지 않은 경우, 디자인 등록/수정 화면으로
                    if (_this.applyProductDetail.wptlPrdStCd === ConstCode.CODES_PRODUCT.PRD_ST_TYPE.UNDER_DESIGN
                            || _this.applyProductDetail.wptlPrdStCd === ConstCode.CODES_PRODUCT.PRD_ST_TYPE.COMPLETE_DESIGN)
                        params.htmlData.pageType = "designMod";
                case "designMod":
                    if( $("#prdSllUprc").length &&  $("#prdOrdUnt").length ) {
                        if( pageType === "design") {
                            const currPrice = $("#prdSllUprc").val().trim().replaceAll(",", "");
                            const currOrderUnit = $("#prdOrdUnt").val().trim().replaceAll(",", "");
                            if (Util.isEmpty(currPrice)) {
                                Util.validCheck(_this.scrollWrap, _this.validEl, "상품 가격을 입력해주세요.");
                                return;
                            }
                            if (Util.isEmpty(currOrderUnit)) {
                                Util.validCheck(_this.scrollWrap, _this.validEl, "상품 주문 단위를 입력해 주세요.");
                                return;
                            }
                            ret = await _this.methods.doUpdatePrdPrice( true );
                        } else {
                            ret = await _this.methods.doUpdatePrdPrice();
                        }
                    }
                // case "designCancel" :
                //     // 디자인 등록/수정 화면에서 취소시
                //     if (!confirm("취소 하시겠습니까?")) return false;
                //     alert("취소 하였습니다.");
                //     // 디자인을 등록하지 않은 상태에선 신청정보로
                //     params.htmlData.pageType = _this.applyProductDetail.wptlPrdStCd === ConstCode.CODES_PRODUCT.PRD_ST_TYPE.UNDER_DESIGN
                //                                 ? "info"
                //                                 : "design";
                //     break;
            }
            if(ret) {
                const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
                $(".content-body").html(html);
            }
            // _this.scrollWrap.animate({scrollTop: 0}, 300);
            // Util.validCheck(_this.scrollWrap, $(".card-item-detail-wrap"));
            if( $(".memo-box").length ) {
                Util.resizeTextarea($(".memo-box").get(0));
            }
        },
        /**
         * 승인
         */
        doConfirmProduct: async function () {
            _this.prdSllUprc = $("#prdSllUprc").val().trim().replaceAll(",", "");
            _this.prdOrdUnt = $("#prdOrdUnt").val().trim().replaceAll(",", "");

            if (Util.isEmpty(_this.prdSllUprc)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "상품 가격을 입력해주세요.");
                return false;
            }
            if (Util.isEmpty(_this.prdOrdUnt)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "상품 주문 단위를 입력해 주세요.");
                return false;
            }

            const params = {
                wptlPrdNo: Number(_this.wptlPrdNo),           // 상품 시퀀스
                prdSllUprc: Number(_this.prdSllUprc),          // 상품 가격
                prdOrdUnt: Number(_this.prdOrdUnt)
            }
            if (!confirm("상품 신청을 승인하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doConfirmProduct', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                //_this.methods.doGetApplyProductDetail("design");
                Util.replace("/admin/product/request/list");
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
         * 디자인, 가격 등록/수정
         * @returns {Promise<boolean>}
         */
        doUploadDesignAndPrice: async function () {
            if (!_this.methods.uploadValid()) return false;
            const params = {
                wptlPrdNo: Number(_this.wptlPrdNo),           // 상품 시퀀스
                cstzCrdDsgFrnsList: _this.cstzCrdDsgFrnsList, // 카드 앞면 정보 리스트
                cstzCrdDsgBcks: _this.cstzCrdDsgBcks,         // 카드 뒷면 정보
                prdSllUprc: Number(_this.prdSllUprc),          // 상품 가격
                crdOrdrFileNm: $("#crdOrdrFileNm").val(),
                prdOrdUnt:  Number(_this.prdOrdUnt),
                crdOrdrFilePthNm: $("#crdOrdrFilePthNm").val()
            }

            let crdOrdrFile = $("#crdOrdrFile")[0].files[0];
            if(crdOrdrFile !== undefined) {
                params.crdOrdrFile = crdOrdrFile;
            }

            if (!confirm("디자인을 저장하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/admin/product/doUploadDesignAndPrice', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("디자인 파일을 저장했습니다.");
                _this.methods.doGetApplyProductDetail("design");
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
            * Modification of Card Order Design File
            * @returns {Promise<boolean>}
        */
        doUpdateCrdOrdrFile: async function () {
            const params = {
                wptlPrdNo: Number(_this.wptlPrdNo),           // 상품 시퀀스
                crdOrdrFileNm: $("#crdOrdrFileNm").val(),
                crdOrdrFilePthNm: $("#crdOrdrFilePthNm").val()
            }

            let crdOrdrFile = $("#crdOrdrFile")[0].files[0];
            if(crdOrdrFile !== undefined) {
                params.crdOrdrFile = crdOrdrFile;
            }

            if (!confirm("디자인 파일을 저장하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/admin/product/doUpdateCrdOrdrFile', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("저장이 완료되었습니다.");
                _this.methods.doGetApplyProductDetail("design");
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
         * 상품 가격 업데이트
         *
         * @returns {boolean}
         */
        doUpdatePrdPrice: async function( isTab ) {
            if( $("#prdSllUprc").length ) {
                const currPrice = $("#prdSllUprc").val().trim().replaceAll(",", "");
                const currOrderUnit = $("#prdOrdUnt").val().trim().replaceAll(",", "");
                if( !isTab ) {
                    if (Util.isEmpty(currPrice)) {
                        Util.validCheck(_this.scrollWrap, _this.validEl, "상품 가격을 입력해주세요.");
                        return false;
                    }
                    if (Util.isEmpty(currOrderUnit)) {
                        Util.validCheck(_this.scrollWrap, _this.validEl, "상품 주문 단위를 입력해 주세요.");
                        return false;
                    }
                    if (!confirm("상품 가격 및 주문 수량을 저장하시겠습니까?")) return false;
                    _this.prdSllUprc = currPrice;
                    _this.prdOrdUnt  = currOrderUnit;
                } else {
                    if(_this.prdSllUprc != currPrice && _this.prdOrdUnt != currOrderUnit) {
                         if (!confirm("상품 가격 및 주문 수량을 저장하시겠습니까?")) return false;
                         _this.prdSllUprc = currPrice;
                         _this.prdOrdUnt  = currOrderUnit;
                    } else if (_this.prdSllUprc != currPrice) {
                         if (!confirm("상품가격을 저장하시겠습니까?")) return false;
                         _this.prdSllUprc = currPrice;
                    } else if ( _this.prdOrdUnt != currOrderUnit) {
                         if (!confirm("상품 주문 수량을 저장하시겠습니까?")) return false;
                         _this.prdOrdUnt  = currOrderUnit;
                    } else if (isTab) {
                        return true;
                    }
                }
            }

            const params = {
                wptlPrdNo: Number(_this.wptlPrdNo),           // 상품 시퀀스
                prdSllUprc: Number(_this.prdSllUprc),          // 상품 가격
                prdOrdUnt:  Number(_this.prdOrdUnt)
            }

            const res = await ServiceExec.formPost('/api/admin/product/doUpdatePrice', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.applyProductDetail.prdSllUprc = params.prdSllUprc;
                _this.applyProductDetail.prdOrdUnt  = params.prdOrdUnt;
                alert( "상품 가격과 주문 단위가 저장되었습니다.");
                if( !isTab ) {
                    _this.methods.doGetApplyProductDetail("info");
                }
                return true;
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        Util.validCheck(_this.scrollWrap, _this.validEl, "상품 가격 업데이트를 실패했습니다.");
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 디자인 등록/수정 유효성 체크
         * @returns {boolean}
         */
        uploadValid: function () {
            _this.validEl.html("");
            let isEmpty = true;
            _this.cstzCrdDsgFrnsList = [];
            $(".uploads.modFileWrap").each((index, item) => {
                let dsgFrnsFile = $(item).find("input:file[name=dsgFrnsFile]")[0].files[0];
                let dsgFrnsInfo = {
                    dsgFrnsFileNm: $(item).find("input:text[name=dsgFrnsFileNm]").val(),
                    dsgFrnsFilePthNm: $(item).find("input:hidden[name=dsgFrnsFilePthNm]").val()
                };

                if(dsgFrnsFile !== undefined) {
                    dsgFrnsInfo.dsgFrnsFile =  dsgFrnsFile
                }

                _this.cstzCrdDsgFrnsList.push(dsgFrnsInfo);

                if (!Util.isEmpty(dsgFrnsInfo.dsgFrnsFile) || !Util.isEmpty(dsgFrnsInfo.dsgFrnsFileNm)) {
                    isEmpty = false;
                }
            })
            let dsgBcksFile = $("input:file[name=dsgBcksFile]")[0].files[0];
            _this.cstzCrdDsgBcks = {
                dsgBcksFileNm: $("input:text[name=dsgBcksFileNm]").val(),
                dsgBcksFilePthNm: $("input:hidden[name=dsgBcksFilePthNm]").val()
            };

            if(dsgBcksFile !== undefined) {
                _this.cstzCrdDsgBcks.dsgBcksFile = dsgBcksFile;
            }

            if (isEmpty ||
                (Util.isEmpty(_this.cstzCrdDsgBcks.dsgBcksFile) && Util.isEmpty(_this.cstzCrdDsgBcks.dsgBcksFileNm))) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "디자인 파일을 업로드해 주세요.");
                return false;
            }

            return true;
        },
           /**
         * Product Application Modal
         * @param
        */
        openProductApplyMemoModal: async function(type) {
            const params = {
                path: "modal/productApplyMemo",
                htmlData: {
                    wptlPrdNo: _this.wptlPrdNo,
                    modalType: type
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#productApplyMemoModal").length) $("#productApplyMemoModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#productApplyMemoModal").modal({show: true});

            PRODUCT_APPLY_MEMO.wptlPrdNo = _this.wptlPrdNo;

            if( type === "mod" ) {
                await PRODUCT_APPLY_MEMO.methods.doGetMemoCn();
            }
            $("#memoCn").trigger("keyup");
        },
        setOrderUnit: function() {
            Util.inputNumberFormat($('#prdOrdUnt').get(0));
            let ordUntInput = $("#prdOrdUnt").val().trim().replaceAll(",", "");
            let ordUnt = Number(Util.numberOnly(ordUntInput));
            if (ordUnt > 3000) {
                ordUnt = 3000;
                $("#prdOrdUnt").val(Util.numberFormat(ordUnt));
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