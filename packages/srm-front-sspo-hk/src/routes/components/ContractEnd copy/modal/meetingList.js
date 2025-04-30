/**
 * MeetingList - 查询表格
 * @date: 2023-4-28
 * @author: chenjie
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
 import React, { PureComponent } from 'react';
 import { Form, LocaleProvider, DatePicker, Button, Input } from 'hzero-ui';
 import {
   getCurrentLanguage,
   tableScrollWidth,
   getDateTimeFormat,
 } from 'utils/utils';
 import intl from 'utils/intl';
 import moment from 'moment';
 import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
 import styles from '../index.less';
 import classnames from 'classnames';
 import EditTable from 'components/EditTable';
 import ValueList from 'hzero-front/lib/components/ValueList';
 import { fastCodeLoader } from '@/utils/decorators';
 import { Bind } from 'lodash-decorators';
 
 const currentLanguage = getCurrentLanguage();

 @Form.create({ fieldNameProp: null })
 @fastCodeLoader(['BID.DESCRIPTION_TYPE'])
 class MeetingList extends PureComponent {
   state = {
     selectedRowKeys: [],
     selectedRows: [],
   };
 
   componentDidMount() {}

   @Bind
   getRowClassName(record) {
    if(record.supplierBidFileState !== 'y') {
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
     } = this.props;
     const { supplierSource = [], supplierListPagination = {} } = contractMaintain;

    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.biddingStatus`).d('技术投标状态'),
        dataIndex: 'supplierBidFileState',
        key: 'supplierBidFileState',
        width: 150,
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
        width: 150,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('bidMeetingStartTime', {
                initialValue: record.bidMeetingStartTime && moment(record.bidMeetingStartTime) || '',
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  showTime
                  disabled={record.supplierBidFileState !== 'y'}
                  // disabledDate={currentDate =>
                  //   this.disabledStart(currentDate, record.$form.getFieldValue('bidMeetingEndTime'))
                  // }
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.milestonecommon.view.title.deadline`).d('截止时间'),
        dataIndex: 'bidMeetingEndTime',
        key: 'bidMeetingEndTime',
        width: 150,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('bidMeetingEndTime', {
                initialValue: record.bidMeetingEndTime && moment(record.bidMeetingEndTime) || '',
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  showTime
                  disabled={record.supplierBidFileState !== 'y'}
                  // disabledDate={currentDate =>
                  //   this.disabledEnd(currentDate, record.$form.getFieldValue('bidMeetingStartTime'))
                  // }
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.BidPresentationType`).d('述标类型'),
        dataIndex: 'conferenceCode',
        key: 'conferenceCode',
        width: 150,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('conferenceCode', {
                initialValue: record.conferenceCode,
              })(
                <ValueList
                  allowClear
                  lazyLoad={false}
                  style={{ width: '100%' }}
                  options={idpValueMap['BID.DESCRIPTION_TYPE']}
                  disabled={record.supplierBidFileState !== 'y'}
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
          </Form.Item>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.MeetingLink`).d('会议链接'),
        dataIndex: 'bidMeetingUrl',
        key: 'bidMeetingUrl ',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('bidMeetingUrl', {
                initialValue: record.conferenceCode === 'siteBidding' ? '' : record.bidMeetingUrl,
              })(
                <Input
                  disabled={record.supplierBidFileState !== 'y' || record.conferenceCode === 'siteBidding'}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.meetingarrangement`).d('会议安排'),
        dataIndex: 'conferenceLink',
        key: 'conferenceLink',
        width: 150,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('conferenceLink', {
                initialValue: record.conferenceLink || '',
              })(
                <Input
                  disabled={record.supplierBidFileState !== 'y'}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.milestonecommon.view.title.operation`).d('操作'),
        dataIndex: 'mail',
        width: 120,
        render: (_, record) => (
          <Button
            onClick={() => handleSendMailUrl(record)}
            disabled={record.supplierBidFileState !== 'y'}
          >
            {intl.get(`bid.bidcommon.bid.button.SendOut`).d('发送')}
          </Button>
        )
      },
      {
        title: intl.get(`bid.bidcommon.view.title.sendshijian`).d('发送时间'),
        dataIndex: 'bidMeetingSendTime',
        width: 250,
      },
    ].filter(Boolean);
 
     const tableProps = {
       dataSource: supplierSource,
       loading,
       columns: columns,
       pagination: supplierListPagination,
       rowKey: 'id',
       scroll: { x: tableScrollWidth(columns) }, // y: 480
       onChange: onPageChange,
       rowClassName: this.getRowClassName
     };
 
     return (
       <React.Fragment>
         <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zh_CN}>
           <>
            <EditTable {...tableProps} />
            <div>
              <span  className={classnames(styles['tip-style'])}>
                {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
              </span>
              <span className={classnames(styles['tip-style'])}>
                {intl.get('bid.bidcommon.view.title.Editingtimeofprojectbidpresentationmeetingkssj').d('供应商须在截止时间前递交报价文件')}
              </span>
              <span className={classnames(styles['tip-style'])}>
                {intl.get('bid.bidcommon.view.title.Editingtimeofprojectbidpresentationmeetingjssj').d('采购员在截止时间后才可查看报价【单一来源谈判方式除外】')}
              </span>
              <span className={classnames(styles['tip-style'])}>
                {intl.get('bid.bidcommon.view.title.Editingtimeofprojectbidpresentationmeetingfssj').d('采购员在截止时间后才可查看报价【单一来源谈判方式除外】')}
              </span>
            </div>
            </>
         </LocaleProvider>
       </React.Fragment>
     );
   }
 }
 
 export default MeetingList;
 