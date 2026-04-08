// 튜토리얼 js
const TUTORIAL = {
    swiper: null,
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
            // 튜토리얼 이미지 영역 - 이미지 클릭시
            $(document).on("click", ".tutorial-wrap .img-click", function () {
                if (TUTORIAL.swiper !== null) TUTORIAL.swiper.slideNext();
            })
        },
        // /**
        //  * change 이벤트
        //  */
        // changeEvent: function () {
        // }
    },
    methods: {
        /**
         * 튜토리얼 열기
         * @returns {Promise<void>}
         */
        openTutorial: async function () {
            const params = {
                path: "modal/tutorial"
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $("body").children("script").first().before(html);

            TUTORIAL.swiper = new Swiper(".tutorial-wrap .swiper-container", {
                observer: true,
                observeParents: true,
                effect: "fade",
                fadeEffect: { crossFade: true },
                allowTouchMove: false,
                pagination: {
                    el: ".tutorial-wrap .swiper-pagination",
                    type: "fraction"
                },
                navigation: {
                    nextEl: ".tutorial-wrap .swiper-button-next",
                    prevEl: ".tutorial-wrap .swiper-button-prev"
                }
            });
            $(".tutorial-wrap").fadeIn(300);
        },
        /**
         * 튜토리얼 닫기
         */
        closeTutorial: function () {
            $(".tutorial-wrap").fadeOut(300).remove();
        }
    },
    init: function () {
        for (let eventFunc in TUTORIAL.events) {
            TUTORIAL.events[eventFunc]();
        }
    }
}

window.TUTORIAL = TUTORIAL;
TUTORIAL.init();