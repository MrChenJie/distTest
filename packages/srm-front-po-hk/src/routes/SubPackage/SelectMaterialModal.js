import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Col, Form, Row } from 'antd';
import CusInput from '_cus_components/CusInput';
const FormItem = Form.Item;

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceRoundsId';
export default class SelectMaterialModal extends React.Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      // 序号信息也是后端给的
      ResDataSource: [{aaa:'111',bbb:'2222'}],
    }
  }

  // componentDidMount() {
  //   const { dispatch, nowRecord } = this.props;
  //   const { enquiryPriceId, enquiryPriceRoundsId } = nowRecord;
  //   dispatch({
  //     type: 'resaleRfq/queryRfqResponse',
  //     payload: {
  //       enquiryPriceId,
  //       enquiryPriceRoundsId,
  //     },
  //   }).then(res => {
  //     if (res) {
  //       this.setState({
  //         ResDataSource: res,
  //       });
  //     };
  //   });
  // }

  render() {
    const { queryRfqResponseLoading = false } = this.props;
    const { ResDataSource } = this.state;

    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: '',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: '',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        dataIndex: '',
        width: 160,
      },
    ];

    return (
      <React.Fragment>
        {/* <CusTable
          rowKey={ROW_KEY}
          columns={columns}
          loading={queryRfqResponseLoading}
          dataSource={ResDataSource}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        /> */}
        <CusTable
        columns={columns}
        pagination={false}
        dataSource={ResDataSource}
        scroll={{ x: tableScrollWidth(columns) }}
        ></CusTable>
      </React.Fragment>
    )
  }
}
