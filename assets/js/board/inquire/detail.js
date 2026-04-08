// 문의 현황 상세 js
let _this;
const FH = {
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
         * 문의 삭제
         * (등록한 계정 / 시스템 관리자만 가능)
         * @param wptlBlbdNo (board 시퀀스)
         * @returns {Promise<void>}
         */
        doRemoveBoard: async function (wptlBlbdNo) {
            const params = {
                wptlBlbdNo: Number(wptlBlbdNo) // board 시퀀스
            }
            if (!confirm("1:1 문의 글을 삭제하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/board/doRemoveBoard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("1:1 문의 글을 삭제하였습니다.");
                Util.replace("/board/inquire/list");
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
        unmaskingPage: function() {
            const paramWptlBlbdNo = new URL( location.href ).searchParams.get("wptlBlbdNo");
            const params = { wptlBlbdNo: paramWptlBlbdNo, unmaskYn: "Y" };

            Util.href("/board/inquire/detail", params);
        }
    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
        const paramUunmaskYn = new URL( location.href ).searchParams.get("unmaskYn");
        if( !Util.isEmpty(paramUunmaskYn) ) {
            const paramWptlBlbdNo = new URL( location.href ).searchParams.get("wptlBlbdNo");
            let url = location.pathname + "?wptlBlbdNo=" + paramWptlBlbdNo;
            history.replaceState({}, null, url);
        }

    }
}

window.FH = FH;
FH.init();