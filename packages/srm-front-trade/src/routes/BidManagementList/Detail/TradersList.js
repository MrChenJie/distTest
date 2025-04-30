/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 17:18:09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import EditTable from '_cus_components/EditTable';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusSpin from '_cus_components/CusSpin';
import { getCurrentOrganizationId, getCurrentLanguage, tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';

const organizationId = getCurrentOrganizationId();
@Form.create()
export default class TradersList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      form,
      rowSelection,
      headerInfo,
      bidManagementListModal,
      onChange= (e) => e,
      tradeLoading = false,
    } = this.props;

    const {
      tradersDetailSource,
      tradersDetailPagination,
    } = bidManagementListModal;

    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.TradeName`).d('贸易商名称'),
        dataIndex: 'tradeName',
        width: 220,
        required: true,
        render: (_, record) => {
          return (
            (headerInfo?.actStatus === 'InProgress' && record.isSendMail !== 'Y') ? <Form.Item>
              {record?.$form?.getFieldDecorator('tradeNumber', {
                initialValue: record.tradeNumber,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.trade.field.TradeName`).d('贸易商名称'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      const isRepeat = tradersDetailSource.some(obj => obj.tradeNumber === value && obj !== record);
                      console.log('isRepeat', isRepeat);
                      if (value && isRepeat) {
                        callback(
                          new Error(
                            intl.get('spfmhk.trade.view.verifytip.traderepeat').d('该贸易商已邀请，请勿重复添加')
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <CusLov
                  code="HKTB.TRADE"
                  queryParams={{ tenantId: organizationId, lang: getCurrentLanguage() }}
                  lovOptions={{ displayField: 'companyNameCh', valueField: 'supplierNumber' }}
                  textValue={record.tradeName}
                  onChange={(_, item) => {
                    record.tradeNumber = item?.supplierNumber, // 贸易商code
                    record.tradeName = item?.companyNameCh; // 贸易商名称
                    record.tradeContacts = item?.name; // 联系人
                    record.tradeEmail = item?.email; // 联系人邮箱
                    record.tradePhone = item?.phone; // 联系方式
                  }}
                />
              )}
            </Form.Item>
            :
            tooltipRender(record.tradeName)
          )
        }
      },
      {
        title: intl.get(`spfmhk.trade.field.TradeContact`).d('联系人'),
        dataIndex: 'tradeContacts',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.TradeContactEmail`).d('联系人邮箱'),
        dataIndex: 'tradeEmail',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.TradeContactPhone`).d('联系方式'),
        dataIndex: 'tradePhone',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.QuotatMailSend`).d('已邀请报价'),
        dataIndex: 'isSendMailMeaning',
        width: 100,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.QuotatSubmit`).d('报价已提交'),
        dataIndex: 'isQuoteMeaning',
        width: 100,
        render: tooltipRender,
      },
    ];

    return (
      <>
        <CusSpin spinning={tradeLoading}>
          <EditTable
            rowKey="rowKey"
            columns={columns}
            rowSelection={headerInfo?.actStatus === 'InProgress' ? rowSelection : false}
            dataSource={tradersDetailSource}
            pagination={tradersDetailPagination}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={onChange}
          />
        </CusSpin>
      </>
    );
  }
}
