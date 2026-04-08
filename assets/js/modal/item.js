// 아이템 modal js
// let _this;
const ITEM = {
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
            // 입력 영역 라디오 체크시
            $(document).on("click", ".modal-body tbody tr input:radio[name=ra1]", function () {
                $(this).closest('tbody').find('tr').removeClass('bg');
                $(this).closest('tr').addClass('bg');
            });
            // 입력 영역 위로 버튼 클릭시
            $(document).on("click", ".modal-body tbody tr .btn-up", function () {
                $(this).closest("tr").insertBefore($(this).closest("tr").prev());
                $(this).closest("tbody").find("tr").each(function (index, item) {
                    $(item).find("span:eq(0)").text(index + 1);
                });
            });
            // 입력 영역 아래로 버튼 클릭시
            $(document).on("click", ".modal-body tbody tr .btn-down", function () {
                $(this).closest("tr").insertAfter($(this).closest("tr").next());
                $(this).closest("tbody").find("tr").each(function (index, item) {
                    $(item).find("span:eq(0)").text(index + 1);
                });
            });
        },
        // /**
        //  * change 이벤트
        //  */
        // changeEvent: function () {
        // }
    },
    methods: {
        /**
         * 아이템 관련 값
         * @param itemType
         * @returns {{keyName: string, modalName: string, placeHolder: string}}
         */
        getItemSet: function (itemType) {
            let itemSet = {
                modalName: "",
                keyName: "",
                placeHolder: ""
            }
            switch (itemType) {
                case "dept":
                    itemSet.modalName = "positionModal";
                    itemSet.keyName = "deptNm";
                    itemSet.placeHolder = "부서명을 입력해 주세요.";
                    break;
                case "jgd":
                    itemSet.modalName = "positionModal";
                    itemSet.keyName = "jgdNm";
                    itemSet.placeHolder = "직급명을 입력해 주세요.";
                    break;
                case "rsb":
                    itemSet.modalName = "positionModal";
                    itemSet.keyName = "rsbNm";
                    itemSet.placeHolder = "직책명을 입력해 주세요.";
                    break;
                case "classify":
                    itemSet.modalName = "classifyModal";
                    itemSet.keyName = "blbdClNm";
                    itemSet.placeHolder = "분류명을 입력해 주세요.";
                    break;
            }
            return itemSet;
        },
        /**
         * 입력 영역 아이템 추가
         * @param itemType
         */
        addInputItem: function (itemType) {
            const itemSet = ITEM.methods.getItemSet(itemType);
            let index = $("#" + itemSet.modalName + " tbody tr").length + 1
            let raInputBox = '<input type="radio" class="radio" name="ra1"'+ (index === 1 ? ' checked' : '') +'>' + '<p><em></em></p>' ;
            let html = '<tr' + (index === 1 && itemType == 'classify' ? ' class="bg"' : '') + '>' +
                           '<td>' +
                               '<label class="mr15"' + (itemType !== 'classify' ? ' style="margin-right:0 !important;"' : '') + '>' +
                               (
                                   itemType !== 'classify' ? '<input type="checkbox" class="checkbox chkDept" name="chkcommon" ><p><em></em></p>' : raInputBox
                               ) +
                               '</label>' +
                               (itemType == 'classify' ? '<span>' + index + '</span>' : '')+
                           '</td>' +
                           (itemType !== 'classify' ? '<td><span>' + index + '</span></td>' : '') +
                           '<td>' +
                               '<div class="inp-sortable">' +
                                   '<input type="text" class="inp" name="itemName" placeholder="' + itemSet.placeHolder + '" value="" _itemNo="" maxlength="20">' +
                                   '<div class="controls">' +
                                       '<button class="btn-up"><span class="hidden">위로</span></button>' +
                                       '<button class="btn-down"><span class="hidden">아래로</span></button>' +
                                   '</div>' +
                               '</div>' +
                           '</td>' +
                       '</tr>';
            $("#" + itemSet.modalName + " tbody").append(html);
            Util.validCheck($("#" + itemSet.modalName + " .modal-body"), $("#" + itemSet.modalName + " tbody tr").last());
        },
        /**
         * 입력 영역 아이템 삭제
         * @param itemType
         * @param itemListLength
         * @param deleteItem
         */
        deleteInputItem: function (itemType, itemListLength, deleteItem) {
            const itemSet = ITEM.methods.getItemSet(itemType);
            let deleteIndex = $(deleteItem).index();
            $(deleteItem).remove();
            itemListLength = itemListLength - 1;
            // 남은 아이템 라디오 체크
            if(deleteIndex === itemListLength) deleteIndex = itemListLength - 1;
            $("#" + itemSet.modalName + " tbody tr").eq(deleteIndex).find("input:radio[name=ra1]").prop("checked", true);
            $("#" + itemSet.modalName + " tbody tr").eq(deleteIndex).addClass("bg");
            Util.validCheck($("#" + itemSet.modalName + " .modal-body"), $("#" + itemSet.modalName + " tbody tr").eq(deleteIndex))
            // 입력 영역 아이템 번호 정리
            $("#" + itemSet.modalName + " tbody tr").each(function (index, item) {
                $(item).find("span:eq(0)").text(index + 1);
            });
        },

        deleteInputMultipleItem: function (itemType, itemListLength, deleteItems) {
            const itemSet = ITEM.methods.getItemSet(itemType);

            // deleteItems is an array of jQuery <tr>
            $(deleteItems).each(function () {
                $(this).remove();
                itemListLength--;
            });

            // ✅ Reselect first row (if any)
            let $tbody = $("#" + itemSet.modalName + " tbody");
            if (itemListLength > 0) {
                $tbody.find("tr").eq(0).addClass("bg");
                // No more radio to check, just highlight first row
                Util.validCheck($("#" + itemSet.modalName + " .modal-body"), $tbody.find("tr").eq(0));
            }

            // ✅ Re-number rows
            $tbody.find("tr").each(function (index) {
                $(this).find("span:eq(0)").text(index + 1);
            });
        },

        /**
         * 입력된 아이템 리스트 유효성 체크
         * @param itemType
         * @param originalList
         * @returns {{isEmpty: boolean, itemList: *[], isDuplicate: boolean, isChagne: boolean}}
         */
        itemListValid: function (itemType, originalList) {
            const itemSet = ITEM.methods.getItemSet(itemType);
            let inputList = [];      // 기존과 동일 여부 체크 할 값 리스트
            let isChagne = false;    // 기존과 동일 여부 체크 flag
            let isEmpty = false;     // 빈값 존재 여부 체크 flag
            let isDuplicate = false; // 중복값 존재 여부 체크 flag
            let itemList = [];       // 입력된 item 리스트   
            $("#" + itemSet.modalName + " input[name=itemName]").each(function (index, item) {
                let inputValue = $(item).val().trim();
                if (Util.isEmpty(inputValue)) isEmpty = true;
                if (index < originalList.length) {
                    if (inputValue !== originalList[index][itemSet.keyName]) isChagne = true;
                }
                inputList.push(inputValue);
                let inputItemNo = $(item).attr("_itemNo");
                let itemInfo = {
                    name: inputValue,
                    no: Util.isEmpty(inputItemNo) ? "" : Number(inputItemNo)
                }
                itemList.push(itemInfo);
            })
            if (itemList.length === 0) {
                isChagne = true;
                isEmpty = true;
            }
            if (inputList.length !== originalList.length) isChagne = true;
            let set = new Set(inputList);
            if (inputList.length !== set.size) isDuplicate = true;
            return {
                isChagne: isChagne,
                isEmpty: isEmpty,
                isDuplicate: isDuplicate,
                itemList: itemList
            }
        }
    },
    init: function () {
        // _this = this;
        for (let eventFunc in ITEM.events) {
            ITEM.events[eventFunc]();
        }
    }
}

window.ITEM = ITEM;
ITEM.init();