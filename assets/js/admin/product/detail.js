import "/js/common/Toast.js?version=2025052101";
import "/js/modal/using.js?version=2025021201";
import "/js/modal/usingMerchant.js?version=2025281101";

// 관리자 - 상품 관리 상세 js
let _this;
const FH = {
    wptlPrdNo: '',
    productDetail: null,
    cardCashIdList: [],
    page: 1,
    limit: 10,
    totalCount: 0,
    virtualNum: 0,
    vtlNo: '',
    getList: function () {
        _this.methods.doGetUsingEntpList();
    },
    unmaskYn: "N",
    usingEntpList: [],
    events: {
        // /**
        //  * key 이벤트
        //  */
        // keyEvent: function () {
        // },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            // 상품 상세 정보 - 펼치기/접기 변경시
            $(document).on("click", "#productDetailBtn", function () {
                $(this).toggleClass("active");
                $("#Table1").stop().slideToggle(300);
            });

            $(document).on("click", "#paymentLimitDetailBtn", function () {
                $(this).toggleClass("active");
                $("#Table2").stop().slideToggle(300);
            });

            $(document).on("click", ".table-title-flip", function() {
                let $titleEl = $(this);
                let $flipEl = $(this).next();
                $titleEl.toggleClass("active");
                $flipEl.stop().slideToggle(300);
                if( $flipEl.is(":visible") ) {
                    $titleEl.css( "border-bottom", "" );
                    const $memobox = $flipEl.find("textarea.memo-box");
                    if( $memobox.length && !Util.isEmpty($memobox.val()) ) {
                        setTimeout(() => {
                            Util.resizeTextarea($flipEl.find(".memo-box").get(0));
                        }, 300);
                    }
                } else {
                    $titleEl.css( "border-bottom", "0px" );
                }
            });

            $(document).on("click", "div.select-section", function () {
                $(this).find("input[type=radio]").prop("checked", true);
            });
        },
        // /**
        //  * change 이벤트
        //  */
        // changeEvent: function () {
        //
        // }
    },
    methods: {
        /**
         * 상품 관리 상세 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductInfo: async function (type = "init") {
            if (Util.isEmpty(_this.wptlPrdNo)) return;
            const params = {
                wptlPrdNo: Number(_this.wptlPrdNo), // 상품 시퀀스
                unmaskYn: _this.unmaskYn
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doGetProductInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.productDetail = entity;
                _this.methods.getPageContent();
                _this.methods.doGetCashDepositAmount();
                if (type === "init") _this.methods.doGetUsingEntpList();
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
         * 상품 관리 상세 - 내용 페이지 호출
         * @param pageType (상세: detail, 캐시: cash, 취소: cancel)
         * @returns {Promise<void>}
         */
        getPageContent: async function (pageType = "detail") {
            if (pageType === "cancel") {
                if (!confirm("취소 하시겠습니까?")) return;
                alert("취소 하였습니다.");
                pageType = "detail";
            }
            const params = {
                path: "admin/product/detail_content",
                htmlData: {
                    pageType: pageType,
                    productDetail: { ..._this.productDetail }
                }
            }

            if (pageType === "detail") {
                if (!Util.isEmpty(_this.productDetail) && !Util.isEmpty(_this.productDetail.cardCashInfoList)) {
                    // 현재 사용중인 캐시만
                    params.htmlData.productDetail.cardCashInfoList = _this.productDetail.cardCashInfoList.filter(item => !Util.isEmpty(item.wptlPrdNo));
                }
            }

            if( pageType === "cash" ) {
                if (!Util.isEmpty(_this.productDetail) && !Util.isEmpty(_this.productDetail.cardCashInfoList)) {
                    const usedCashList = _this.productDetail.cardCashInfoList.filter(item => !Util.isEmpty(item.wptlPrdNo));
                    if( !Util.isEmpty(usedCashList) ) {
                        if( usedCashList.length >= 3 ) {
                            // alert( "캐시는 최대 3개까지만 추가 가능합니다." );
                            // return;
                        }
                    }
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $("#productWrap").html(html);

            if (pageType === "detail") {
                _this.methods.doGetCashDepositAmount();
            }
            if( $(".memo-box").length ) {
                Util.resizeTextarea($(".memo-box").get(0));
            }
        },
        /**
         * 결제 알림설정 MODAL OPEN
         */
        openPaymentNotiModal: async function () {
            const params = {
                path: "modal/paymentNoti",
                htmlData: {
                    smsNfctYn: _this.productDetail.basicInfo.smsNfctYn
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#paymentNotiModal").length) $("#paymentNotiModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#paymentNotiModal").modal({show: true});
        },
        /**
         * 결제 알림 설정 업데이트
         */
        doUpdatePaymentNoti: async function() {
            const params = {
                wptlPrdNo: _this.productDetail.basicInfo.wptlPrdNo, // 상품 시퀀스
                smsNfctYn: $("input[name=smsNfctYn]:checked").val()
            }
            if(Util.isEmpty(params.smsNfctYn) || (params.smsNfctYn !== "Y" && params.smsNfctYn !== "N")) {
                alert("결제 알림 수단을 선택해주세요.");
                return;
            }
            if(!confirm("결제 알림 설정을 적용하시겠습니까?")){
                return;
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doUpdatePaymentNoti', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert( "결제 알림 설정이 완료되었습니다." );
                $("#paymentNotiModal").modal({show: false}).remove();
                await _this.methods.doGetProductInfo();
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
         * 가상계좌 설정 - 가상게좌 조회 modal 열기
         */
        openVtlModal: async function ( cardCashId, maskingType = "mask" ) {
            const params = {
                path: "modal/vtl",
                htmlData: {
                    searchAccountType: 2,        // 캐시
                    crdCashId: cardCashId,
                    unmaskYn: maskingType === "unmask" ? "Y" : "N"
                }
            }
            const vtl = await ServiceExec.post('/api/admin/etc/doGetNonMappingVritualAccList', params.htmlData);
            params.htmlData.vtlList = vtl.entity;

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#vtlModal").length) $("#vtlModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#vtlModal").modal({show: true});

            _this.vtlNo = "";
        },
        selectVtl: function( obj, vtlNo ) {
            $("tr[name=vtlLine]").css( "background", "" );
            $(obj).css( "background", "#f5f3f3" );
            _this.vtlNo = vtlNo;
        },
        confirmVtl: async function( cardCashId ) {
            if( Util.isEmpty(_this.vtlNo) ) {
                alert( "가상계좌를 선택해 주세요." );
                return;
            }
            await this.doAddUsingVtl( cardCashId );
            await this.doGetProductInfo();

            $("#vtlModal").modal({show: false}).remove();
            _this.vtlNo = "";
        },
        /**
         * 가상계좌 연결
         */
        doAddUsingVtl: async function ( cardCashId ) {
            const params = {
                wptlPrdNo: _this.productDetail.basicInfo.wptlPrdNo, // 상품 시퀀스
                wptlVtlAccNo: _this.vtlNo,
                crdCashId: cardCashId
            }
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/admin/product/doAddUsingVtl', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert( "가상계좌 설정이 완료되었습니다." );
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
         * 캐시 메모 팝업
         */
        openCashMemoModal: async function(wptlPrdNo, cardCashId, type) {
            const params = {
                path: "modal/cashMemo",
                htmlData: {
                    wptlPrdNo: wptlPrdNo,
                    crdCashId: cardCashId,
                    modalType: type
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#cashMemoModal").length) $("#cashMemoModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#cashMemoModal").modal({show: true});

            CASH_MEMO.wptlPrdNo = wptlPrdNo;
            CASH_MEMO.crdCashId = cardCashId;
            if( type === "mod" ) {
                await CASH_MEMO.methods.doGetMemoCn();
            }
            $("#memoCn").trigger("keyup");
        },
        /**
         * 사용처 제한처 유형 팝업
         */
        openUsingTypeModal: async function(wptlPrdNo, crdCashId) {
            let params = {
                path: "modal/usingType",
                htmlData: {
                    wptlPrdNo: wptlPrdNo,
                    crdCashId: crdCashId
                }
            }
            const res = await ServiceExec.post('/api/admin/product/doGetUsingTypeCode', params.htmlData);
            params.htmlData.usingType = res.entity;
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#usingTypeModal").length) $("#usingTypeModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#usingTypeModal").modal({show: true});

            let scrollTop = Number($("#usingTypeModal .modal-body").scrollTop() + $("input[name=usingType]:checked").closest(".select-section").offset().top) - 550;
            $("#usingTypeModal .modal-body").animate({scrollTop: scrollTop}, 300);
        },
        /**
         * 사용처/제한처 유형 업데이트
         */
        doUpdateUsingType: async function(crdCashId) {
            const usingType = $("input[name=usingType]:checked").val();
            if( Util.isEmpty(usingType) ) {
                alert("사용처/제한처 유형을 선택해주세요.");
                return;
            }
            let typeNm = $("input[name=usingType]:checked").closest("label").next("span").text();
            if (!confirm(typeNm + " 로 저장하시겠습니까?")) return;

            const params = {
                wptlEntpNo: _this.productDetail.basicInfo.wptlEntpNo, // 상품 시퀀스
                wptlPrdNo: _this.productDetail.basicInfo.wptlPrdNo, // 상품 시퀀스
                crdCashId: crdCashId,
                usingTypeCode: usingType
            }
            const res = await ServiceExec.post('/api/admin/product/doUpdateUsingType', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("저장되었습니다.");
                $("#usingTypeModal").modal({show: false}).remove();
                await _this.methods.doGetProductInfo();
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
         * 기업 상품 캐시 - 데이터 조회
         * (사용처/제한처 설정 후, 갱신)
         */
        doGetCardCashInfo: function () {
            _this.methods.doGetProductInfo("cash");
        },

        /* ---------------------------------------- 캐시 추가 관련 start ---------------------------------------- */
        /**
         * 캐시 지급 여부 체크
         * @param provideCount
         */
        checkCashProvide: function (provideCount) {
            if (provideCount > 0) {
                event.target.checked = true;
                alert("카드 포인트 지급 내역이 있는 경우 체크 해제가 불가능합니다.");
            }
        },
        /**
         * 카드 캐시 추가
         * @returns {Promise<void>}
         */
        doUpdateCardCashInfo: async function () {
            if (!_this.methods.cashValid()) return;
            const params = {
                wptlPrdNo: _this.productDetail.basicInfo.wptlPrdNo, // 상품 시퀀스
                prdId: _this.productDetail.basicInfo.prdId,         // 상품 ID
                cardCashIdList: _this.cardCashIdList                // 카드 캐시 리스트
            }
            if (!confirm("카드 포인트를 적용 하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/admin/product/doUpdateCardCashInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("체크한 카드 포인트를 적용하였습니다.");
                _this.methods.doGetProductInfo();
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
         * 카드 캐시 추가 유효성 체크
         * @returns {boolean}
         */
        cashValid: function () {
            _this.cardCashIdList = []
            $("input:checkbox[name=cashCheck]:checked").each(function (index, item) {
                const crdCashId = $(item).val();
                if (!Util.isEmpty(crdCashId)) _this.cardCashIdList.push(crdCashId);
            })
            if (_this.cardCashIdList.length === 0) {
                alert("체크된 카드 포인트가 없습니다.");
                return false;
            }
            // Phase65.0 캐시 갯수 제한 해제
            // if(_this.cardCashIdList.length > 3 ) {
            //     alert("캐시는 최대 3개까지만 추가 가능합니다.");
            //     return false;
            // }
            return true;
        },
        /* ---------------------------------------- 캐시 추가 관련 end ---------------------------------------- */

        /* ---------------------------------------- 사용중인 기업 관련 start ---------------------------------------- */
        /**
         * 리스트 table 생성
         */
        setTable: function () {
            // "잔여금액", "잔여포인트" cell 확인 버튼 customRenderer
            class CustomRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;
                    let el;
                    el = document.createElement("a");
                    el.className = "label";
                    el.style.cursor = "pointer";
                    el.appendChild(document.createTextNode("확인"))

                    el.addEventListener("click", (ev) => {
                        ev.preventDefault();
                        FH.methods.doGetUsingEntpAmount(rowKey);
                    })
                    this.el = el;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                    if (!Util.isEmpty(props.value)) {
                        let el;
                        el = document.createElement("div");
                        el.className = "tui-grid-cell-content";
                        el.appendChild(document.createTextNode(String(props.value)));
                        this.el.replaceWith(el);
                    }
                }
            }
            Toast.methods.setGrid({
                columns: [
                    {
                        header: "NO",
                        align: "center",
                        width: 100,
                        name: "rowKey",
                        formatter: function ({row, column, value}) {
                            return ((FH.page - 1) * FH.limit) + (row.rowKey + 1);
                            // 번호 역순으로 바인딩시
                            // return FH.virtualNum - row.rowKey;
                        }
                    },
                    {
                        header: "기업 코드",
                        align: "center",
                        minWidth: 100,
                        name: "kaId"
                    },
                    {
                        header: "회사명",
                        align: "center",
                        minWidth: 100,
                        name: "entpNm"
                    },
                    {
                        header: "사업자등록번호",
                        align: "center",
                        width: 140,
                        name: "bzno",
                        formatter: function ({row, column, value}) {
                            return (Util.isEmpty(row.bzno) || row.bzno === "-")
                                    ? '-'
                                    : `${row.bzno.substring(0,3)}-${row.bzno.substring(3,5)}-${row.bzno.substring(5,10)}`;
                        }
                    },
                    {
                        header: "계약 상태",
                        align: "center",
                        width: 100,
                        name: "wptlEntpStNm"
                    },
                    {
                        header: "카드 수",
                        align: "center",
                        minWidth: 100,
                        name: "useCrdCnt",
                        formatter: function ({row, column, value}) {
                            let totCrdCnt = 0;
                            if( row.mbRltgCrdDvCd === "M" ) {
                                totCrdCnt = row.mbTotCrdCnt;
                            } else {
                                totCrdCnt = row.totCrdCnt;
                            }
                            return row.useCrdCnt + " / " + totCrdCnt;
                        }
                    },
                    {
                        header: "잔여 금액(원)",
                        align: "center",
                        width: 120,
                        name: "remainAmount",
                        renderer: CustomRenderer
                    },
                    {
                        header: "잔여 포인트",
                        align: "center",
                        width: 120,
                        name: "remainPoint",
                        renderer: CustomRenderer
                    },
                    {
                        header: "사용 시작일",
                        align: "center",
                        width: 140,
                        name: "dsgFileCfmDttm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.dsgFileCfmDttm);
                        }
                    },
                    {
                        header: "사용 종료일",
                        align: "center",
                        width: 140,
                        name: "tempDttm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(row.tempDttm);
                        }
                    }
                ]
            })
        },
        /**
         * 사용중인 기업 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetUsingEntpList: async function () {
            const params = {
                page: _this.page,
                limit: _this.limit,
                prdId: _this.productDetail.basicInfo.prdId // 상품 ID
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doGetUsingEntpList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount
                $("#totalCount").text(_this.totalCount);
                _this.virtualNum = entity.virtualNum;

                _this.usingEntpList = entity.list;
                Toast.grid.resetData(entity.list);
                Toast.methods.setPagination();
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
         * 사용중인 기업 리스트 - 잔여금액/포인트 조회
         * @param rowKey
         * @returns {Promise<void>}
         */
        doGetUsingEntpAmount: async function (rowKey) {
            const params = {
                prdId: _this.productDetail.basicInfo.prdId,           // 상품 ID
                wptlEntpNo: Toast.grid.getValue(rowKey, "wptlEntpNo") // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doGetUsingEntpAmount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                Toast.grid.setValue(rowKey, "remainAmount", entity.amount);
                Toast.grid.setValue(rowKey, "remainPoint", entity.point);
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
         * 사용중인 기업 리스트 - 추가 - 기업 조회 modal 열기
         * @returns {Promise<void>}
         */
        openEntpModal: async function () {
            const params = {
                path: "modal/entp",
                htmlData: {
                    // 이미 사용중인 기업 제외하려면 prdId 보냄
                    // prdId: _this.productDetail.basicInfo.prdId,
                    prdId: "",
                    searchText: $("#entpModal").length ? $("#entpModal #searchText").val() : ""
                }
            }
            const entp = await ServiceExec.post('/common/doGetEntpList', params.htmlData);
            params.htmlData.entpList = entp.entity;
            // 사용중인 기업 리스트 보냄 (비활성화 처리용도)
            params.htmlData.usingEntpList = _this.usingEntpList.map(item => { return item.wptlEntpNo });
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#entpModal").length) $("#entpModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#entpModal").modal({show: true});
        },
        /**
         * 사용중인 기업 추가
         * @param wptlEntpNo (기업 시퀀스)
         * @returns {Promise<void>}
         */
        doAddUsingEntpList: async function (wptlEntpNo) {
            const params = {
                wptlPrdNo: _this.productDetail.basicInfo.wptlPrdNo, // 상품 시퀀스
                wptlEntpNo: Number(wptlEntpNo)                      // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.formPost('/api/admin/product/doAddUsingEntpList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                $("#entpModal").modal({show: false}).remove();
                _this.page = 1;
                _this.methods.doGetUsingEntpList();
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
        unmaskingPage: async function() {
            _this.unmaskYn = "Y";
            await _this.methods.doGetProductInfo();
        },
        /**
         * 캐시 예치금 조회
         * @returns {Promise<void>}
         */
        doGetCashDepositAmount: async function () {
            const $wptlEntpNoEl = $("input[name=wptlEntpNo]");
            if( !$wptlEntpNoEl.length ) {
                return;
            }

            for( let i = 0; i < $wptlEntpNoEl.length; i++ ) {
                const vtlAcno = $("input[name=vtlAcno]").eq(i);
                if( !Util.isEmpty(vtlAcno) ) {
                    const wptlEntpNoVal = $("input[name=wptlEntpNo]").eq(i).val();
                    const cashIdVal = $("input[name=crdCashId]").eq(i).val();

                    let params = {
                        wptlEntpNo: wptlEntpNoVal, // 기업 시퀀스
                        wptlPrdNo: _this.productDetail.basicInfo.wptlPrdNo, // 상품 시퀀스
                        cashId: cashIdVal
                    }

                    const res = await ServiceExec.post('/api/product/doGetCashDepositAmount', params);
                    const code = res.code;
                    const message = res.message;
                    const entity = res.entity;
                     // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                    if (code === 1) {
                        $("td[name=depositAmount]").eq(i).text(entity + "원");
                    } else {
                        switch (code) {
                            // 예외처리 경우
                            // case :
                            //     break;
                            default:
                                $("td[name=depositAmount]").eq(i).text("예치금 잔액을 불러올 수 없습니다.");
                                break;
                        }
                    }
                }
            }
        },
        /**
         * 카드 주문 제한 UPDATE
         */
        doUpdateCardOrderRestriction: async function() {

            const params = {
                wptlPrdNo: _this.productDetail.basicInfo.wptlPrdNo,
                crdOrdRstYn : $("#afterClose").is(":checked") ? "Y" : "N"
            }

            //console.log(params);
            const res = await ServiceExec.post('/api/admin/product/doUpdateCardOrderRestriction', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.productDetail.basicInfo.crdOrdRstYn = $("#afterClose").is(":checked") ? "Y" : "N";
                $("#crdOrdRstYn").text(_this.productDetail.basicInfo.crdOrdRstYn === 'Y' ? 'Y(주문 불가)' : 'N(주문 가능)');
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        $("#afterClose").prop("checked", _this.productDetail.basicInfo.crdOrdRstYn === "Y");
                        $("#crdOrdRstYn").text(_this.productDetail.basicInfo.crdOrdRstYn === 'Y' ? 'Y(주문 불가)' : 'N(주문 가능)');
                        alert(message);
                        break;
                }
            }
        },
        /**
         * Product Detail Memo Modal
         * @param
        */
        openProductDetailMemo: async function(type) {
            const params = {
                path: "modal/productDetailMemo",
                htmlData: {
                    wptlPrdNo: _this.wptlPrdNo,
                    modalType: type
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#productDetailMemo").length) $("#productDetailMemo").remove();
            $("body").children("a.btn-top").after(html);
            $("#productDetailMemo").modal({show: true});

            PRODUCT_DETAIL_MEMO.wptlPrdNo = _this.wptlPrdNo;

            if( type === "mod" ) {
                await PRODUCT_DETAIL_MEMO.methods.doGetMemoCn();
            }
            $("#memoCn").trigger("keyup");
        },
        /* ---------------------------------------- 사용중인 기업 관련 end ---------------------------------------- */
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