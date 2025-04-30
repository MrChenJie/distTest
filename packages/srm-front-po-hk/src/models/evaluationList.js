import { getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'evaluationList',
  state: {
    supperlierSouce: [
      {
      key:'1',
      assessmentNo:'我是单号',
      supplierNumber:'我是评审单号',
      companyNameEN:'我是公司名称',
      companyNameCN:'COmpanyName',
      purchaser:'采购员',
      assessmentYear:'评审年度',
      assessmentQuarter:'评审季度',
      assessmentType:'评审类型',
      assessmentStatus:'评审状态',
    },{
      key:'2',
      assessmentNo:'我是单号2',
      supplierNumber:'我是评审单号2',
      companyNameEN:'我是公司名称2',
      companyNameCN:'COmpanyName2',
      purchaser:'采购员2',
      assessmentYear:'评审年度2',
      assessmentQuarter:'评审季度2',
      assessmentType:'评审类型2',
      assessmentStatus:'评审状态2',
    }
  ], // 数据源
    supperlierPagination:{}
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
}