//var MCASH_DOMAIN = location.href.substr(0, location.href.indexOf('/MUP') );
var MCASH_DOMAIN = "https://test.mobilians.co.kr";

var PG_URL = "";
var MCASH_MAIN_URL = "https://mup.mobilians.co.kr/MUP/goCashMain.mcash";
var M_PG_URL = "";

var PAY_WIN;
var CASH_SVCID = [
    "MC_SVCID", "CE_SVCID", "CI_SVCID", "VA_SVCID", "GM_SVCID", "GC_SVCID", "GG_SVCID",
    "HM_SVCID", "FC_SVCID",	"RA_SVCID", "AR_SVCID", "TP_SVCID", "PB_SVCID", "CN_SVCID",
    "TN_SVCID", "TM_SVCID", "PP_SVCID", "MT_SVCID", "TC_SVCID", "OC_SVCID", "CA_SVCID",
    "RT_SVCID", "WP_SVCID", "RF_SVCID"
];

var mcht_list = [
    "",""
];

function getRealUrl( svcid ){
    for(i = 0; i < mcht_list.length; i++){
        try {
            if( mcht_list[i] == svcid.substr(0, 8 ) ) return "https://mcash.mobilians.co.kr/MUP/goCashMain.mcash";
        } catch( e ) {
            return MCASH_MAIN_URL;
        }
    }
    return MCASH_MAIN_URL;
}

function MCASH_PAYMENT_IFRAME(mcashForm){
    if( mcashForm.CASH_GB.value == "" ){
        for(i = 0; i < CASH_SVCID.length; i++){
            try {
                if(eval("mcashForm." + CASH_SVCID[i] + ".value") != ""
                    && eval("mcashForm." + CASH_SVCID[i] + ".value") != null){
                    mcashForm.CASH_GB.value = CASH_SVCID[i].substring(0,2);
                    break;
                }
            } catch( e ) {
            }
        }
    }

    var cpUrl = "";
    try{
        cpUrl = "#"+encodeURIComponent( document.location.href );
    }catch(e){
        cpUrl = "";
    }
    var cashUrl = MCASH_MAIN_URL;

    if(mcashForm.PAY_MODE.value == '10' ){
        cashUrl = getRealUrl( eval("mcashForm." + mcashForm.CASH_GB.value + "_SVCID.value") )+cpUrl;
    }else{
        cashUrl = MCASH_DOMAIN+"/MUP/goCashMain.mcash"+cpUrl;
    }

    mcashForm.action = cashUrl;
    mcashForm.method="post";

    if(mcashForm.CALL_TYPE.value == "SELF"){
        mcashForm.target="_self";
    }else if(mcashForm.CALL_TYPE.value == "I"){
        mcashForm.target = mcashForm.IFRAME_NAME.value;
    }

    try{
        var orgCharset = document.charset;
        mcashForm.acceptCharset='euc-kr';
        document.charset = mcashForm.acceptCharset;
        mcashForm.submit();
        document.charset = orgCharset;
    }catch(e){
        if( orgCharset.toUpperCase() == "UTF-8" )
            mcashForm.action = mcashForm.action.replace('goCashMain.mcash', 'goMcashMain.mcash');

        mcashForm.submit();
    }

}


function MCASH_PAYMENT(mcashForm){

    if( mcashForm.CASH_GB.value != "" ){
        try {
            if( eval("mcashForm." + mcashForm.CASH_GB.value + "_SVCID.value") == "" )
                mcashForm.CASH_GB.value = "";
        } catch (exception){
            mcashForm.CASH_GB.value = "";
        }
    }

    if( mcashForm.CASH_GB.value == "" ){
        for(i = 0; i < CASH_SVCID.length; i++){
            try {
                if(eval("mcashForm." + CASH_SVCID[i] + ".value") != ""
                    && eval("mcashForm." + CASH_SVCID[i] + ".value") != null){
                    mcashForm.CASH_GB.value = CASH_SVCID[i].substring(0,2);
                    break;
                }
            } catch( e ) {
            }
        }
    }
    var cashUrl = MCASH_MAIN_URL;

    var mobile_flag = false;
    if(window.navigator.userAgent.indexOf("Mobile") >= 0 ||
        window.navigator.userAgent.indexOf("Phone") >= 0 ||
        window.navigator.userAgent.indexOf("Opera") >= 0 ||
        window.navigator.userAgent.indexOf("Safari") >= 0) mobile_flag = true;

    var UserAgent = navigator.userAgent;
    if (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null
        || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) mobile_flag = true;
    else mobile_flag = false;

    var iXPos = (window.screen.width - 390) / 2;
    var iYPos = (window.screen.height - 420) / 2;

    //if(mcashForm.CASH_GB.value == 'CN' || mcashForm.CASH_GB.value == 'TN'){
    if(mcashForm.CASH_GB.value == 'TN'){
        mcashForm.target="PAY_WIN";
        if(mobile_flag) {
            PAY_WIN = window.open("","PAY_WIN","fullscreen=yes, resizable=yes,toolbar=no,menubar=no,scrollbars=no,resizable=no,status=no");
            PAY_WIN.focus();
            mcashForm.action = M_PG_URL;
        }else{
            PAY_WIN = window.open("","PAY_WIN","width=480,height=620,toolbar=no,menubar=no,scrollbars=no,resizable=no,status=no");
            PAY_WIN.focus();
            mcashForm.action = PG_URL;
        }
    }else{
        if(mcashForm.PAY_MODE.value == '10' ){
            cashUrl = getRealUrl( eval("mcashForm." + mcashForm.CASH_GB.value + "_SVCID.value") );
        }else{
            cashUrl = MCASH_DOMAIN+"/MUP/goCashMain.mcash";
        }

        mcashForm.action = cashUrl;
        if(mcashForm.CALL_TYPE.value == "SELF"){
            mcashForm.target="_self";
        }else if(mcashForm.CALL_TYPE.value == "I"){  // 2013.01.24
            mcashForm.target = mcashForm.IFRAME_NAME.value;
        }else{
            if(mobile_flag) {
                PAY_WIN = window.open("","PAY_WIN","fullscreen=yes,toolbar=yes,menubar=yes,scrollbars=no,resizable=no");
            }else{
                if(mcashForm.CASH_GB.value == 'CN'){
                    var agent = UserAgent.toLowerCase();
                    if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1) ) {
                        if(typeof mcashForm.CN_DIRECT != 'undefined' && mcashForm.CN_DIRECT.value.indexOf('NAV') != -1) {
                            PAY_WIN = window.open("","PAY_WIN","top=1,left=0,width=480,height=620,toolbar=no,menubar=no,scrollbars=yes,resizable=yes");
                            PAY_WIN.opener = self;
                        } else {
                            PAY_WIN = window.open("","PAY_WIN","top=1,left=0,width=480,height=620,toolbar=no,menubar=no,scrollbars=no,resizable=yes");
                            PAY_WIN.opener = self;
                        }
                    }else{
                        var leftPos = (window.screenX || window.screenLeft || 0) < 0 ? (window.screenX || window.screenLeft || 0) : 0;
                        PAY_WIN = window.open("","PAY_WIN","top=1,left=" + (leftPos) + ",width=480,height=620,toolbar=no,menubar=no,scrollbars=no,resizable=yes");
                        PAY_WIN.opener = self;
                    }
                }else if(mcashForm.CASH_GB.value == 'EP' && typeof mcashForm.EP_CODE != 'undefined' && mcashForm.EP_CODE.value.indexOf('NAV') != -1) {
                    PAY_WIN = window.open("","PAY_WIN","width=480,height=620,toolbar=no,menubar=no,scrollbars=yes,resizable=yes");
                    PAY_WIN.opener = self;
                }else{
                    PAY_WIN = window.open("","PAY_WIN","width=480,height=620,toolbar=no,menubar=no,scrollbars=no,resizable=yes");
                    PAY_WIN.opener = self;
                }
            }
            PAY_WIN.focus();
            mcashForm.target="PAY_WIN";
        }
    }
    try{
        mcashForm.method="post";
    } catch(e){
    }

    var orgCharset = document.charset;

    try{
        mcashForm.acceptCharset='euc-kr';
        document.charset = mcashForm.acceptCharset;
        mcashForm.submit();
        document.charset = orgCharset;
    }catch(e){
        if( orgCharset.toUpperCase() == "UTF-8" )
            mcashForm.action = mcashForm.action.replace('goCashMain.mcash', 'goMcashMain.mcash');

        mcashForm.submit();
    }
}