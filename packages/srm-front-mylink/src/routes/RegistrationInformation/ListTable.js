/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:43
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import CusButton from '_cus_components/CusButton';
import { yesOrNoRender } from 'utils/renderer';

const prompt = 'spub.purchaseApiList';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleActiveLink = (record) => {
    const { APPROVAL_PROCESS } = process.env;
    const { 
      location
    } = this.props
    const isPub = location.pathname.includes('pub'); 
    // const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
    // window.open(url, '_blank')
    window.open(`${isPub ? '/pub' : ''}/mylink/registration-information/Detail?signId=${record.signId}`, '_blank')
  }

  handleDelete = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'RegistrationInformationModal/queryList',
      payload: {
        id: record.id
      },
    });
  }

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      accountCheck = (e) => e,
      handleReduce = (e) => e,
      handleAdd = (e) => e,
      idpValueMap
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfmhk.mylink.field.companyName`).d('公司名称'),
        width: 160,
        dataIndex: 'companyName',
        key: 'companyName',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleActiveLink(record)}>
              {tooltipRender(record.companyName)}
            </a>
          )
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作意向'),
        width: 300,
        dataIndex: 'partnerModeMeaning',
        key: 'partnerModeMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.company.productSer`).d('产品/服务'),
        width: 100,
        dataIndex: 'product',
        key: 'product',
        render:(val) => {
         const data = idpValueMap['HKSM.PRODCUT_SERVICE']?.find(item=> item.value == val )
         console.log(data, 'data')
         return data?.meaning
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.registerdate`).d('报名日期'),
        width: 100,
        dataIndex: 'creationDate',
        key: 'creationDate',
        render: dateRender,
      },
      {
        title: intl.get(`spfmhk.mylink.button.invite.in`).d('引入邀请'),
        width: 100,
        dataIndex: 'signStatusMeaning',
        key: 'signStatusMeaning',
      },
      {
        title: intl.get(`spfmhk.mylink.field.supplier.code`).d('供应商编码'),
        width: 100,
        dataIndex: 'supplierNumber',
        key: 'supplierNumber',
      },
      {
        title: intl.get(`spfmhk.mylink.field.balcklist`).d('是否黑名单'),
        width: 100,
        dataIndex: 'blackStatus',
        key: 'blackStatus',
        render: (val) => {
          return (
            val == "Y" ?  intl.get('hzero.common.status.yes').d('是') : intl.get('hzero.common.status.no').d('否')
          )
        },
      },
      {
        title: intl.get(`spfmhk.mylink.field.portalAccount`).d('存在门户账号'),
        width: 100,
        dataIndex: 'portalAccount',
        key: 'portalAccount',
        render:  (val) => {
          return (
            val == "Y" ?  intl.get('hzero.common.status.yes').d('是') : intl.get('hzero.common.status.no').d('否')
          )
        },
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        width: 250,
        key: 'operator',
        render: (_, record) => {
          return (
            <>
              <CusButton type="plain" style={{ marginRight: '16px' }} disabled={record.refuseStatus == 'Y' || record.inviteStatus == 'Y' || record.blackStatus == 'Y'} onClick={() => handleAdd(record)}>
                {intl.get('spfmhk.mylink.button.invite.in').d('引入邀请')}
              </CusButton>
              <CusButton type="plain" onClick={() => handleReduce(record)} disabled={record.refuseStatus == 'Y' || record.inviteStatus == 'Y' || record.blackStatus == 'Y'}>
                {intl.get('spfmhk.mylink.button.mail.reject').d('邮件拒绝')}
              </CusButton>
            </>
          )
        },
      }
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
