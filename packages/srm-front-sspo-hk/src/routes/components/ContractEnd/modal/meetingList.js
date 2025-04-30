/**
 * MeetingList - 查询表格
 * @date: 2023-4-28
 * @author: chenjie
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import {
  getCurrentLanguage,
  tableScrollWidth,
  getDateTimeFormat,
} from 'utils/utils';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import styles from '../index.less';
import classnames from 'classnames';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import { fastCodeLoader } from '@/utils/decorators';
import { Bind } from 'lodash-decorators';
import CusSpin from '_cus_components/CusSpin';
import { tooltipRender } from '_cus_utils/render';

@Form.create({ fieldNameProp: null })
@fastCodeLoader(['BID.DESCRIPTION_TYPE', 'BID.DESCRIPTION_TYPENEW'])
class MeetingList extends PureComponent {
  state = {
    selectedRowKeys: [],
    selectedRows: [],
  };

  componentDidMount() { }

  @Bind
  getRowClassName(record) {
    if (record.supplierBidFileState !== 'y') {
      return styles['active-table-y'];
    } else {
      return styles['active-table-n']
    }
   }
 
   render() {
     const {
       loading,
       onPageChange = (e) => e,
       contractMaintain,
       handleSendMailUrl = (e) => e,
       idpValueMap = {},
       getDetailList,
     } = this.props;
     const { supplierSource = [], supplierListPagination = {} } = contractMaintain;

    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: getDetailList.proInfoWording ?
          intl.get(`bid.bidcommon.view.title.biddingStatus`).d('技术投标状态')
          : intl.get(`bid.bidcommon.view.title.biddingStatusnew`).d('技术应答状态'),
        dataIndex: 'supplierBidFileState',
        key: 'supplierBidFileState',
        width: getCurrentLanguage() === 'zh_CN' ? 150 : 195,
        render: (_, record) => {
          return (
            <span>
              {record.supplierBidFileState === 'y' ? intl.get(`bid.bidcommon.view.title.Submitted`).d('已提交') : intl.get(`bid.bidcommon.view.title.NotSubmitted`).d('未提交')}
            </span>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.starttime`).d('开始时间'),
        dataIndex: 'bidMeetingStartTime',
        key: 'bidMeetingStartTime',
        width: 205,
        render: (val, record) => {
          return (
            (record.supplierBidFileState !== 'y') ? (
              tooltipRender(val)
            ) :
              (<Form.Item>
                {record.$form.getFieldDecorator('bidMeetingStartTime', {
                  initialValue: record.bidMeetingStartTime && dayjs(record.bidMeetingStartTime) || '',
                })(
                  <CusDatePicker
                    style={{ width: '100%' }}
                    format={getDateTimeFormat()}
                    showTime
                  // disabledDate={currentDate =>
                  //   this.disabledStart(currentDate, record.$form.getFieldValue('bidMeetingEndTime'))
                  // }
                  />
                )}
              </Form.Item>)
          );
        },
      },
      {
        title: intl.get(`bid.milestonecommon.view.title.deadline`).d('截止时间'),
        dataIndex: 'bidMeetingEndTime',
        key: 'bidMeetingEndTime',
        width: 205,
        render: (val, record) => {
          return (
            (record.supplierBidFileState !== 'y') ? (
              tooltipRender(val)
            ) :
              (<Form.Item>
                {record.$form.getFieldDecorator('bidMeetingEndTime', {
                  initialValue: record.bidMeetingEndTime && dayjs(record.bidMeetingEndTime) || '',
                })(
                  <CusDatePicker
                    style={{ width: '100%' }}
                    format={getDateTimeFormat()}
                    showTime
                  // disabledDate={currentDate =>
                  //   this.disabledEnd(currentDate, record.$form.getFieldValue('bidMeetingStartTime'))
                  // }
                  />
                )}
              </Form.Item>)
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.BidPresentationType`).d('方案陈述类型'),
        dataIndex: 'conferenceCode',
        key: 'conferenceCode',
        width: getCurrentLanguage() === 'zh_CN' ? 150 : 185,
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            (record.supplierBidFileState !== 'y') ? (
              tooltipRender(val)
            ) :
              (<Form.Item>
                {getFieldDecorator('conferenceCode', {
                  initialValue: record.conferenceCode,
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={getDetailList.proInfoWording ? idpValueMap['BID.DESCRIPTION_TYPE'] : idpValueMap['BID.DESCRIPTION_TYPENEW']}
                    onChange={(ValueList) => {
                      if (ValueList === 'siteBidding') {
                        record.conferenceCode = 'siteBidding';
                        record.$form.setFieldsValue({ bidMeetingUrl: '' }); // 清空会议链接
                      } else {
                        if (record.bidMeetingUrl) { // 如果原本会议链接有值
                          record.$form.setFieldsValue({ bidMeetingUrl: record.bidMeetingUrl }); // 还原会议链接
                        }
                        record.conferenceCode = ValueList;
                      }
                    }}
                  />
                )}
              </Form.Item>) 
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.MeetingLink`).d('会议链接'),
        dataIndex: 'bidMeetingUrl',
        key: 'bidMeetingUrl ',
        width: 200,
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            (record.supplierBidFileState !== 'y' || record.conferenceCode === 'siteBidding') ? (
              tooltipRender(val)
            ) :
              <Form.Item>
                {getFieldDecorator('bidMeetingUrl', {
                  initialValue: record.conferenceCode === 'siteBidding' ? '' : record.bidMeetingUrl,
                })(
                  <CusInput.TextArea autoChangeSize={true} />
                )}
              </Form.Item>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.meetingarrangement`).d('会议安排'),
        dataIndex: 'conferenceLink',
        key: 'conferenceLink',
        width: getCurrentLanguage() === 'zh_CN' ? 150 : 180,
        render: (val, record) => {
          return (
            (record.supplierBidFileState !== 'y') ? (
              tooltipRender(val)
            ) :
              (<Form.Item>
                {record.$form.getFieldDecorator('conferenceLink', {
                  initialValue: record.conferenceLink || '',
                })(
                  <CusInput.TextArea autoChangeSize={true} />
                )}
              </Form.Item>)
          );
        },
      },
      {
        title: intl.get(`bid.milestonecommon.view.title.operation`).d('操作'),
        dataIndex: 'operator',
        width: getCurrentLanguage() === 'zh_CN' ? 63 : 93,
        render: (_, record) => (
          record.supplierBidFileState === 'y' ?
          <CusButton
            onClick={() => handleSendMailUrl(record)}
            type="plain"
          >
            {intl.get(`bid.bidcommon.bid.button.SendOut`).d('发送')}
          </CusButton>
          :
          <></>
        )
      },
      {
        title: intl.get(`bid.bidcommon.view.title.sendshijian`).d('发送时间'),
        dataIndex: 'bidMeetingSendTime',
        width: 180,
        render: tooltipRender,
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: supplierSource,
      columns: columns,
      pagination: supplierListPagination,
      rowKey: 'id',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
      onChange: onPageChange,
      rowClassName: this.getRowClassName
    };

    return (
      <>
        <CusSpin spinning={loading}>
          <div className={classnames(styles['tip-head'])}>
            <span className={classnames(styles['tip-style'])} style={{ marginBottom: '4px' }}>
              {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
            </span>
            <span className={classnames(styles['tip-style'])}>
              {intl.get('bid.bidcommon.view.title.Editingtimeofprojectbidpresentationmeetingkssj').d('供应商须在截止时间前递交报价文件')}
            </span>
            <span className={classnames(styles['tip-style'])}>
              {intl.get('bid.bidcommon.view.title.Editingtimeofprojectbidpresentationmeetingjssj').d('采购员在截止时间后才可查看报价【单一来源谈判方式除外】')}
            </span>
            <span className={classnames(styles['tip-style'])} style={{ paddingBottom: 0 }}>
              {intl.get('bid.bidcommon.view.title.Editingtimeofprojectbidpresentationmeetingfssj').d('采购员在截止时间后才可查看报价【单一来源谈判方式除外】')}
            </span>
          </div>
          <EditTable {...tableProps} />
        </CusSpin>
      </>
    );
  }
}

export default MeetingList;
