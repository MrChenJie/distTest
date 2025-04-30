// 报价表格式列表
import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'uniqueid';
export default class QuatationTable extends React.Component {
  constructor(props) {
    super(props);
    // const { onRef } = props;
    // if (onRef) {
    //   onRef(this);
    // };
    this.state = {
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
      aaa: false
    };
  }


  render() {
    const {
      singlePurchaseApplicationModel,
    } = this.props;
    const { quotationFormatList = [], quotationFormatListPagination } = singlePurchaseApplicationModel;
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.SN`).d('序号')),
        width: '50px',
        render: (val, record, index) => {
          return <span>{index + 1}</span>
        }
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.materialname`).d('物料名称')),
        dataIndex: 'matName',
        render: tooltipRender,
        width: 200,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.specification`).d('规格型号')),
        dataIndex: 'matType',
        render: tooltipRender,
        width: 200,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.unit`).d('单位')),
        dataIndex: 'unit',
        width: 200,
        render: tooltipRender,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.quantity`).d('数量')),
        dataIndex: 'qty',
        width: 200,
        render: tooltipRender,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币')),
        dataIndex: 'currency',
        width: 200,
        render: tooltipRender,
      }
    ];


    return (
      <React.Fragment>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={quotationFormatList}
          pagination={quotationFormatListPagination}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </React.Fragment>
    );
  }
}
