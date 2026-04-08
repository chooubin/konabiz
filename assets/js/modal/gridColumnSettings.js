const GRID_COLUMN_SETTINGS_MODAL = {
    scrollWrap: null,
    validEl: null,
    callback: {},
    args: {},
    gridColumns: [],
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
            $(".chk").on
        }
    },
    methods: {
        /**
         * 다운로드 팝업 열기
         * @param callback (실제 다운로드 실행할 콜백함수)
         */
        openGridSettingModal: async function (gridName) {

            const existingGridSettings = JSON.parse(localStorage.getItem(gridName))

            const gridColumnCheckAllState = existingGridSettings?.checkUncheckAll;
            const gridColumns = existingGridSettings?.actualCols;

            const params = {
                path: "modal/gridColumnSetting",
                htmlData: {
                    gridColumnAllCheckState: gridColumnCheckAllState,
                    gridColumns: gridColumns,
                    gridName: gridName
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            // if ($("#downloadModal").length) $("#downloadModal").remove();
            if ($("body").children("a.btn-top").next(".modal.right-mode").length) {
                $("body").children("a.btn-top").next(".modal.right-mode").remove();
            }
            $("body").children("a.btn-top").after(html);
            $("#gridColumnSettings").modal({show: true, backdrop: false});
        },
        changeGridColumnSetting: function (event) {

            const settingsGridName = $("#settingsGridName").val();

            // Retrieve the array from localStorage
            let gridSettings = JSON.parse(localStorage.getItem(settingsGridName));
            let storedItems = gridSettings?.actualCols;
            // Find the item to update (for example, by ID)
            let itemToUpdate = storedItems.find(item => item?.name === event?.target?.value);

            // Update the item's properties
            if (itemToUpdate) {
                itemToUpdate.hidden = !event?.target?.checked;
                event?.target?.checked ? Toast.grid.showColumn(event?.target?.value) : Toast.grid.hideColumn(event?.target.value)
            }

            let isAnyHiddenItem = false;

            for (let i = 0; i < storedItems.length; i++) {
                let item = storedItems[i];
                if (!item?.defCol) {
                    if (item?.hidden) {
                        isAnyHiddenItem = true;
                        break;
                    } else {
                        isAnyHiddenItem = false;
                    }
                }
            }

            if (isAnyHiddenItem) {
                $("#checkUncheckAll").prop('checked', false);
            } else {
                $("#checkUncheckAll").prop('checked', true);
            }

            // Save the updated array back to localStorage
            localStorage.setItem(settingsGridName, JSON.stringify({
                checkUncheckAll: !isAnyHiddenItem,
                actualCols: storedItems
            }));
        },
        checkUncheckAll: function (evnt) {
            const settingsGridName = $("#settingsGridName").val();

            // Retrieve the array from localStorage
            let storedItems = JSON.parse(localStorage.getItem(settingsGridName));
            let gridCols = storedItems?.actualCols;

            // Update Items
            gridCols.forEach((item, index) => {
                if (!item?.defCol) {
                    evnt?.target?.checked ? Toast.grid.showColumn(item?.name) : Toast.grid.hideColumn(item?.name);
                    item.hidden = !evnt?.target?.checked;
                }
            })

            // check uncheck all column checkbox items
            $(".grid-col-cls").prop('checked', evnt?.target?.checked);

            // Save the updated array back to localStorage
            localStorage.setItem(settingsGridName, JSON.stringify({
                checkUncheckAll: evnt?.target?.checked,
                actualCols: gridCols
            }));
        }
    },
    init: function () {
        for (let eventFunc in GRID_COLUMN_SETTINGS_MODAL.events) {
            GRID_COLUMN_SETTINGS_MODAL.events[eventFunc]();
        }
    }
}

window.GRID_COLUMN_SETTINGS_MODAL = GRID_COLUMN_SETTINGS_MODAL;
GRID_COLUMN_SETTINGS_MODAL.init();