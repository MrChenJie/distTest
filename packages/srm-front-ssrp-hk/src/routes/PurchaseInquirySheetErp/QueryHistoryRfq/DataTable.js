/**
 * DataTable-查询表单
 * @since 2022-02-18
 * @author xinyi.he02@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { openTab } from 'utils/menuTab';
import { SRM_SSRC } from '_utils/config';
import { dateRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import RfqResponse from './components/RfqResponse';

/**
* 多语言前缀
*/
const promptCode = 'ssrc.resaleRfqHistory';
const ROW_KEY = 'enquiryPriceRoundsId';
export default class DataTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    };

    this.state = {
      rfqResponseVisible: false,
      nowRecord: {},
    };
  }

  @Bind()
  openEnquiryResponseModal(record) {
    this.setState({
      rfqResponseVisible: true,
      nowRecord: record,
    })
  }

  /**
   * 跳转历史详情界面
   * @param {object} record
   */
  @Bind()
  openPriceEntryDetail(record) {
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { businessType, enquiryPriceId, enquiryPriceRoundsId } = record;
    let url = ''
    switch (businessType) {
      case 'STANDARD':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq-history/standard/view-detail/${
          record.enquiryPriceId
        }/${record.enquiryPriceRoundsId}`;
        break;
      case 'ICTS':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq-history/view-detail/${
          enquiryPriceId
        }/${enquiryPriceRoundsId}`;
        break;
      case 'CHINA_DIA':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq-history/china-dia/view-detail/${
          enquiryPriceId
        }/${enquiryPriceRoundsId}`;
        break;
    }
    window.open(url);
  }

  render() {
    const { onChange = (e) => e, resaleRfq } = this.props;
    const { rfqResponseVisible = false, nowRecord } = this.state;
    const {
      rfqHistoryList = [],
      rfqHistoryPagination = [],
    } = resaleRfq;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.label.enquiryPriceNum`).d('询价单号'),
        dataIndex: 'enquiryPriceNum',
        width: 160,
        render: (val, record) => {
          return (
            <span className="action-link">
              <a style={{ color: '#3271FE' }} onClick={() => this.openPriceEntryDetail(record)}>{val}</a>
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label.enquiryPriceTitle`).d('询价单标题'),
        dataIndex: 'enquiryPriceTitle',
        width: 220,
        render: (val) => {
          return (
            tooltipRender(val)
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label.enquiryPriceStatus`).d('询价状态'),
        dataIndex: 'enquiryPriceStatus',
        width: 120,
        render: (_, record) => (
          tooltipRender(record.enquiryPriceStatusMeaning)
        ),
      },
      {
        title: intl.get(`${promptCode}.model.label.enquiryStartDate`).d('询价开始日期'),
        dataIndex: 'enquiryStartDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.label.enquiryEndDate`).d('询价截止日期'),
        dataIndex: 'enquiryEndDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.label.enquiryPublishDate`).d('询价发布日期'),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.label.enquiryResponse`).d('询价响应'),
        dataIndex: 'enquiryResponse',
        width: 90,
        align: 'left',
        render: (val, record) => {
          return (
            <a style={{ color: '#3271FE' }} onClick={() => this.openEnquiryResponseModal(record)}>
              {val}
            </a>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.model.label.enquiryRounds`).d('询价轮次'),
        dataIndex: 'enquiryRounds',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.label.soEnquiryCodeSoRequireCode`).d('销售意向单号/需求单号'),
        dataIndex: 'soEnquiryCodeSoRequireCode',
        width: 220,
        align: 'left',
        render: (_, record) => {
          const content = `${record.soEnquiryCode ? record.soEnquiryCode : ''}${
            record.soRequireCode && record.soEnquiryCode ? '/' : ''
          }${record.soRequireCode ? record.soRequireCode : ''}`;
          return (
            tooltipRender(content)
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label.createdName`).d('录入员'),
        dataIndex: 'createdName',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.label.department`).d('录入员部门'),
        dataIndex: 'department',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.label.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 120,
        align: 'left',
        render: dateRender,
      },
    ];

    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={rfqHistoryList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={rfqHistoryPagination}
          onChange={onChange}
          rowSelection={null}
        />

        {/* 询价响应 Modal */}
        {rfqResponseVisible &&
          <CusModal
            visible={rfqResponseVisible}
            width={800}
            title={intl.get('ssrc.resaleRfqHistory.create.rfqResponseModal.title').d('线上报价情况')}
            footer={
              <CusButton
                onClick={() => {
                  this.setState({
                    rfqResponseVisible: false,
                  });
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            }
            onCancel={() => this.setState({ rfqResponseVisible: false })}
            destroyOnClose
          >
            <RfqResponse
              {...this.props}
              nowRecord={nowRecord}
            />
          </CusModal>
        }
      </React.Fragment>
    );
  }
}
