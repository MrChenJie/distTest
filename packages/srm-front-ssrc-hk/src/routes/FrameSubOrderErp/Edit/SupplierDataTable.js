import React from 'react';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusLov from '_cus_components/CusLov';
import { numberRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
export default class SupplierDataTable extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { form, supplierlistSource, infomation, dispatch } = this.props;
    const {} = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.OrderContractOperator`).d('订单&合同经办人'),
        width: 100,
        dataIndex: 'handledByName',
        key: 'handledByName',
        render: (val, record) => {
          return (
            <Form.Item>
              {form.getFieldDecorator(`${record['rowId']}#handledByName`, {
                initialValue: record.handledByName,
              })(
                <CusLov
                  textValue={record.handledByName}
                  lovOptions={{ displayField: 'userName', valueField: 'userName' }}
                  code="HKPC.PROCUREMENTAGENT"
                  onChange={(val, data) => {
                    record.handledByName = data.userName;
                    form.setFieldsValue({
                      handledByName: data.userName,
                    });
                    dispatch({
                      type: 'frameSubOrderModel/commentUpdateState',
                      payload: { handledBy: data.loginName },
                    });
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人'),
        width: 100,
        dataIndex: 'procurementAgentName',
        key: 'procurementAgentName',
        render: () => {
          return <span>{infomation?.agent}</span>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.SupplierType`).d('供应商类型'),
        width: 100,
        dataIndex: 'supplierType',
        key: 'supplierType',
      },
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        width: 100,
        dataIndex: 'supplierName',
        key: 'supplierName',
      },
      {
        title: intl.get(`${promptCode}.view.title.Contact`).d('联系人'),
        width: 110,
        dataIndex: 'contacts',
        key: 'contacts',
      },
      {
        title: intl.get(`${promptCode}.view.title.SuppliersTelephone`).d('供应商联系电话'),
        width: 100,
        dataIndex: 'supplierPhone',
        key: 'supplierPhone',
      },
      {
        title: intl
          .get(`${promptCode}.view.title.TotalOrderAmountOriginalCurrency`)
          .d('下单总金额（原币）'),
        width: 170,
        dataIndex: 'totalAmount ',
        key: 'totalAmount',
        render: (val, record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.totalAmount, 2)}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}`).d('报价币种'),
        width: 100,
        dataIndex: 'quotationCurrency',
        key: 'quotationCurrency',
      },
      {
        title: intl.get(`${promptCode}.view.title.HKDExchangeRate`).d('港币汇率'),
        width: 100,
        dataIndex: 'hkdRate',
        key: 'hkdRate',
      },
    ];

    return (
      <>
        <EditTable
          rowKey="rowId"
          dataSource={supplierlistSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
        />
      </>
    );
  }
}
