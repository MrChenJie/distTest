/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 17:18:09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import CusTable from '_cus_components/CusTable';
import CusNotification from '_cus_components/CusNotification';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';

@Form.create()
export default class EmailSendList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      emailModalVisible: false,
      htmlContent: '',
    }
  }

  // 预览邮件
  handleOpenTemplate = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidManagementListModal/handleEmailTemplate',
      payload: {
        id: record?.id
      }
    }).then((res) => {
      this.setState({
        emailModalVisible: true,
        htmlContent: res?.templateContent,
      })
    })
  }

  // 重新发送
  handleResend = (record) => {
    const { dispatch, onSearchSupplierList = (e) => e } = this.props;
    const params = [
      {
        id: record?.id,
        refHeadId: record?.refHeadId
      }
    ]
    dispatch({
      type: 'bidManagementListModal/handleSendEmail',
      payload: params
    }).then((res) => {
      if(res) {
        CusNotification.success({
          message: intl.get(`demoTitle1`).d('发送成功')
        })
        onSearchSupplierList();
      }
    })
  }

  render() {
    const {
      form,
      bidManagementListModal,
    } = this.props;

    const { emailModalVisible, htmlContent } = this.state;

    const {
      emailDataSource,
      emailPagination,
      recordLine,
    } = bidManagementListModal;

    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.TradeName`).d('贸易商名称'),
        dataIndex: 'tradeName',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get(`hzero.common.view.operation`).d('操作'),
        dataIndex: 'operator',
        width: 120,
        render: (_, record) => {
          return (
            <>
              <CusButton
                type="plain"
                onClick={() => this.handleOpenTemplate(record)}
                style={{marginRight: '16px'}}
              >
                {intl.get('spfmhk.trade.button.Preview').d('预览')}
              </CusButton>
              {recordLine?.status === 'Inprogress' && <span>
                {record?.isSendMail === 'N' && <CusButton
                  type="plain"
                  onClick={() => this.handleResend(record)}
                >
                  {intl.get('spfmhk.trade.button.Send').d('发送')}
                </CusButton>}
                {record?.isSendMail === 'Y' && <CusButton
                  type="plain"
                  onClick={() => this.handleResend(record)}
                >
                  {intl.get('spfmhk.trade.button.Resend').d('重新发送')}
                </CusButton>}
              </span>}
            </>
          )
        },
      },
    ];

    return (
      <>
        <CusTable
          rowKey="rowKey"
          columns={columns}
          dataSource={emailDataSource}
          pagination={emailPagination}
          scroll={{ x: tableScrollWidth(columns) }}
        />

        <CusModal
          title={intl.get('demoTitle1').d('邮件预览')}
          visible={emailModalVisible}
          onCancel={() => {
            this.setState({
              emailModalVisible: false
            })
          }}
          width={600}
          footer={
            <>
              <CusButton
                onClick={() => {
                  this.setState({
                    emailModalVisible: false
                  })
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            </>
          }
          destroyOnClose
        >
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </CusModal>
      </>
    );
  }
}
