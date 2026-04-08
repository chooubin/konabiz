/**
 * mock-api.js
 * ServiceExec 인터셉터 + data.json 기반 Mock API
 * PRD HND-20260408-010
 */

let MOCK_DB = null;

async function loadMockDB() {
  if (!MOCK_DB) {
    const base = location.pathname.includes('/pages/') ? '../' : './';
    const res = await fetch(base + 'data.json');
    MOCK_DB = await res.json();
  }
  return MOCK_DB;
}

function paginate(data, p) {
  if (!data) data = [];
  const page = parseInt(p.page) || 1;
  const limit = parseInt(p.limit) || 50;
  const start = (page - 1) * limit;
  const list = limit === -1 ? data : data.slice(start, start + limit);
  return {
    code: 1,
    message: 'OK',
    entity: {
      totalCount: data.length,
      virtualNum: data.length,
      list: list
    }
  };
}

function mockApiResponse(url, params, db) {
  const p = params || {};
  const entpNo = parseInt(p.wptlEntpNo) || 1;

  switch (url) {
    case '/api/group/doGetEmpList': {
      let data = db.employees.filter(e => e.wptlEntpNo === entpNo);
      if (p.searchEmpStatus) data = data.filter(e => {
        const st = p.searchEmpStatus;
        if (st === '00') return e.wptlEntpWkinStNm === '재직';
        if (st === '98') return e.wptlEntpWkinStNm === '휴직';
        if (st === '99') return e.wptlEntpWkinStNm === '퇴사';
        if (st === '97') return e.wptlEntpWkinStNm === '수습';
        return true;
      });
      if (p.searchText) {
        const q = p.searchText.toLowerCase();
        data = data.filter(e =>
          (e.stfNm && e.stfNm.includes(q)) ||
          (e.incmpEmpNo && e.incmpEmpNo.includes(q)) ||
          (e.deptNm && e.deptNm.includes(q))
        );
      }
      return paginate(data, p);
    }

    case '/api/trans/doGetTransList': {
      let data = db.transactions || [];
      if (p.wptlPrdNo) {
        const prdNo = parseInt(p.wptlPrdNo);
        const prd = db.products.find(pr => pr.wptlPrdNo === prdNo);
        if (prd) data = data.filter(t => t.prdNm === prd.prdNm);
      }
      if (p.searchRtrvlType) {
        const typeMap = { '1': '카드포인트 지급', '2': '카드포인트 회수', '3': '잔액 충전', '4': '잔액 회수' };
        const typeName = typeMap[p.searchRtrvlType];
        if (typeName) data = data.filter(t => t.dsbRtrvlDvNm && t.dsbRtrvlDvNm.includes(typeName.split(' ')[0]));
      }
      if (p.dsbRtrvlStCd) {
        const stMap = { '99': '대기', '00': '완료', '90': '취소' };
        const stName = stMap[p.dsbRtrvlStCd];
        if (stName) data = data.filter(t => t.dsbRtrvlStNm === stName);
        else if (p.dsbRtrvlStCd === 'FAIL') data = data.filter(t => t.dsbRtrvlStNm === '실패');
        else if (p.dsbRtrvlStCd === 'PARTIAL') data = data.filter(t => t.dsbRtrvlStNm === '부분 완료');
      }
      return paginate(data, p);
    }

    case '/api/usage/doGetWelfareUsageList': {
      let data = db.card_usages || [];
      if (p.wptlPrdNo) {
        const prdNo = parseInt(p.wptlPrdNo);
        const prd = db.products.find(pr => pr.wptlPrdNo === prdNo);
        if (prd) data = data.filter(u => u.svcNm === prd.prdNm);
      }
      if (p.searchText) {
        const q = p.searchText.toLowerCase();
        data = data.filter(u =>
          (u.stfNm && u.stfNm.includes(q)) ||
          (u.mctNm && u.mctNm.includes(q)) ||
          (u.deptNm && u.deptNm.includes(q))
        );
      }
      return paginate(data, p);
    }

    case '/api/deposit/doGetDepositList': {
      let data = db.deposits || [];
      if (p.wptlPrdNo) {
        const prdNo = parseInt(p.wptlPrdNo);
        data = data.filter(d => d.wptlPrdNo === prdNo);
      }
      return paginate(data, p);
    }

    case '/api/dashboard/doGetDashBoardData': {
      const summary = (db.dashboard_summary || []).find(s => s.wptlEntpNo === entpNo) || db.dashboard_summary[0];
      const products = db.products.filter(pr => pr.wptlEntpNo === entpNo);
      const welfProducts = products.filter(pr => pr.wptlPrdTypeCd === '10');
      const corpProducts = products.filter(pr => pr.wptlPrdTypeCd !== '10');

      const welfUseDataPerBizList = [
        { bizLtypeName: '식음료', welfUseRate: 32 },
        { bizLtypeName: '쇼핑', welfUseRate: 28 },
        { bizLtypeName: '의료', welfUseRate: 18 },
        { bizLtypeName: '교육', welfUseRate: 12 },
        { bizLtypeName: '여가', welfUseRate: 10 }
      ];

      return {
        code: 1,
        message: 'OK',
        entity: {
          welfProductCount: welfProducts.length,
          corpProductCount: corpProducts.length,
          productList: products,
          welfUseDataPerBizList: welfUseDataPerBizList,
          corpUseDataPerBizList: [],
          isUseMobileCard: false,
          isExistShippedOrder: false,
          welfareBankAccountList: [],
          corporateBankAccountList: []
        }
      };
    }

    case '/api/dashboard/doGetNoticeList': {
      return { code: 1, message: 'OK', entity: db.notices || [] };
    }

    case '/api/dashboard/doGetNoticePopup': {
      // 팝업 없음
      return { code: 1, message: 'OK', entity: null };
    }

    case '/common/doGetProductList': {
      const data = db.products.filter(pr => pr.wptlEntpNo === entpNo);
      return { code: 1, message: 'OK', entity: data };
    }

    case '/common/doGetCashBalaDepositList': {
      const data = db.products.filter(pr => pr.wptlEntpNo === entpNo && pr.crdCashId).map(pr => ({
        crdCashId: pr.crdCashId,
        crdCashNm: pr.crdCashNm,
        rcgId: pr.rcgId,
        balaNm: pr.balaNm,
        depositType: pr.rcgId ? 'RECHARGER' : 'CASH',
        wptlPrdTypeCd: pr.wptlPrdTypeCd
      }));
      return { code: 1, message: 'OK', entity: data };
    }

    case '/common/doGetCardCashList': {
      const data = db.products.filter(pr => pr.wptlEntpNo === entpNo && pr.crdCashId).map(pr => ({
        crdCashId: pr.crdCashId,
        crdCashNm: pr.crdCashNm
      }));
      return { code: 1, message: 'OK', entity: data };
    }

    case '/api/deposit/doGetDepositBalance': {
      return { code: 1, message: 'OK', entity: { depositBalanceAmt: '125,000,000' } };
    }

    case '/common/doGetEmpSmsIsYCount': {
      return { code: 1, message: 'OK', entity: 'N' };
    }

    case '/api/trans/doTransSendAuthCode': {
      return { code: 1, message: 'OK', entity: { authToken: 'MOCK_TOKEN', authCode: '1234' } };
    }

    case '/api/trans/doCancelTrans': {
      return { code: 1, message: 'OK', entity: null };
    }

    default:
      // listInfo 저장/조회
      if (url === '/common/doGetListInfo' || url === '/common/doSaveListInfo') {
        return { code: 1, message: 'OK', entity: null };
      }
      return { code: 1, message: 'OK', entity: { totalCount: 0, list: [], virtualNum: 0 } };
  }
}

// ─── ServiceExec Mock (글로벌 인터셉터) ───────────────────────────────────────
window.ServiceExec = {
  post: async function(url, params) {
    const db = await loadMockDB();
    return mockApiResponse(url, params, db);
  },
  jsonPost: async function(url, params) {
    const db = await loadMockDB();
    return mockApiResponse(url, params, db);
  },
  htmlGet: async function() { return ''; },
  formPost: async function() { return { code: 1, message: 'OK', entity: null }; },
  formPostAsync: async function() { return { code: 1, message: 'OK', entity: null }; },
  downPost: async function() { },
  jsonDownPost: async function() { }
};

// ─── Toast listInfo mock ──────────────────────────────────────────────────────
// Toast.methods.getListInfo는 실제 조회 후 콜백 호출
// 원본 코드 의존성 처리
window._mockListInfo = {};
