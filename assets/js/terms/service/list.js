// 서비스 이용 약관 js
let _this;
const FH = {
    wptlPrvNo: "",
    wptlPrvAgrmVerNo: "1.0",
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
         * swiper 생성
         */
        setSwiper: function () {
            new Swiper(".slider .swiper-container", {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 16,
                navigation: {
                    nextEl: ".slider .swiper-button-next",
                    prevEl: ".slider .swiper-button-prev",
                },
                pagination: {
                    el: ".versions .swiper-pagination",
                    type: "fraction",
                }
            });
        },
        /**
         * 서비스 약관 상세 - 데이터 조회
         * @param wptlPrvNo
         * @returns {Promise<void>}
         */
        doGetTermsData: async function (wptlPrvNo) {
            const params = {
                wptlPrvNo: Number(wptlPrvNo) // 약관 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/terms/doGetTermsData', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.wptlPrvNo = entity.wptlPrvNo;
                $("#wptlPrvAgrmVerNo").text(entity.wptlPrvAgrmVerNo);
                $("#sysUpdDttm").text(entity.sysUpdDttm);
                $("#prvCn").html(Util.nl2br(entity.prvCn));
                $(".member-content").animate({scrollTop: 0}, 300);
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
         * 서비스 이용 약관 - 등록/수정 페이지로 이동
         * @param type (등록: reg, 수정: mod)
         */
        termsForm: function (type = "reg") {
            if (type == "reg") {
                // 마지막 버전에서 0.1 버전 증가 -> 등록 페이지에서 파라미터로 받은 후, 노출만 시키는 용도
                let wptlPrvAgrmVerNo = (Number(_this.wptlPrvAgrmVerNo) + 0.1).toFixed(1);
                Util.href("/terms/service/form", {wptlPrvNo: 0, wptlPrvAgrmVerNo: wptlPrvAgrmVerNo});
            } else {
                Util.href("/terms/service/form", {wptlPrvNo: _this.wptlPrvNo});
            }
        }
    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        Util.deleteCookie("listInfo");
    }
}

window.FH = FH;
FH.init();