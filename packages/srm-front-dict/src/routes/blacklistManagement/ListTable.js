import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { enableRender, dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import {Checkbox} from 'antd';
import dayjs from 'dayjs';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const prompt = 'spub.purchaseApiList';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleApplicationLink = (record) => {
    if (record?.blackCaseId) {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.blackCaseId}`);
    } else {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTHMD&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/blacklist-management/detail?blackId=${record.blackId}`)}`);
    }
    // window.open('/pub/dict/blacklist-management/detail?blackId=${record.blackId}', '_blank')
  }

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      idpValueMap,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfmhk.dict.view.field.applicationno`).d('申请单号'),
        width: 160,
        dataIndex: 'applyNum',
        key: 'applyNum',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleApplicationLink(record)}>
              {tooltipRender(record?.applyNum )}
            </a>
          )
        }
      },
      {
        title: intl.get(`spfmhk.dict.view.field.applicantionstatus`).d('申请状态'),
        width: 160,
        dataIndex: 'applyStatusMeaning',
        key: 'applyStatusMeaning',
      },
      {
        title: intl.get(`spfmhk.dict.view.balcklist.appliactiontype`).d('申请类型'),
        width: 250,
        dataIndex: 'applyTypeMeaning',
        key: 'applyTypeMeaning',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.partner.code`).d('合作伙伴编号'),
        width: 160,
        dataIndex: 'partnerNum',
        key: 'partnerNum',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.companynameen`).d('公司名称（英文）'),
        width: 250,
        dataIndex: 'cmpanyNameEn',
        key: 'cmpanyNameEn',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.companynamecn`).d('公司名称（中文）'),
        width: 250,
        dataIndex: 'cmpanyNameCh',
        key: 'cmpanyNameCh',
      },
      {
        title: intl.get(`spfmhk.dict.view.balcklist.applicant`).d('申请人'),
        width: 200,
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.applicantion.date`).d('申请日期'),
        width: 160,
        dataIndex: 'applyDate',
        key: 'applyDate',
        render: dateRender,
      },
      {
        title: intl.get(`spfmhk.dict.view.balcklist.reason`).d('列入黑名单原因'),
        width: 250,
        dataIndex: 'blackReason',
        key: 'blackReason',
      },
    ];
    return (
      <>
        <CusTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
