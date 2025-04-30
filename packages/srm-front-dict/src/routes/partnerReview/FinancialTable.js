import React from 'react';
import intl from 'utils/intl';
import { Input } from 'antd';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import { getCurrentOrganizationId } from 'utils/utils';
import queryString from 'querystring';
const prompt = 'spub.purchaseApiList';
const commonPrompt = 'spfmhk.dict';
@Form.create()
export default class FinancialTable extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getInfo();
  }

  // 获取列表
  getInfo() {
    const { dispatch, location: { search }, } = this.props;
    const { formRecordId, partnerId } = queryString.parse(search?.substring(1));
    dispatch({
      type: 'partnerReview/getFinancialInfo',
      payload: {
        partnerId:  partnerId || formRecordId,
      },
    });
  }

  render() {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const {
      history,
      rowSelection,
      financialList = [
      
      ],
      pagination = {},
      onChange = (e) => e,
      form: { getFieldDecorator },
      idpValueMap,
      isAnswer,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.field.portalordercurrency`).d('订单币种'),
        dataIndex: 'orderCurrency',
        align: 'left',
        width: 180,
 
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalpaymentterm`).d('付款期限'),
        dataIndex: 'paymentProvisionMeaning',
        align: 'left',
        width: 180,
    
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portaldepositbank`).d('开户银行'),
        dataIndex: 'depositBank',
        align: 'left',
        width: 280,
       
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalcountry`).d('国家'),
        dataIndex: 'country',
        width: 140,
   
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalswiftcode`).d('国际汇款编号'),
        dataIndex: 'ibanCode',
        width: 180,
   
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalbankname`).d('账户名称'),
        dataIndex: 'accountName',
        width: 180,
   
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalbankaccount`).d('银行账户'),
        dataIndex: 'account',
        width: 180,
   
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalinternationalreg`).d('国贸条规'),
        width: 180,
        dataIndex: 'tradeTerms',
        align: 'left',
    
      },
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={financialList}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
