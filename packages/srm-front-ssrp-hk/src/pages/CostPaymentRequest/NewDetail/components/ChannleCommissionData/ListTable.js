import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { uniq, isEmpty } from 'lodash';
import { Row, Col, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import { dateRender, numberRender } from 'utils/renderer';
import cusRequest from '_cus_utils/request';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { SRM_SPUC } from '_utils/config';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';

const organizationId = getCurrentOrganizationId();
const ROW_KEY = 'dataId';
const prefix = 'spfm.channelCommissionInquiry';

export default class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  @Bind
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  @Bind()
  handleSave() {
    const { onOk, onCancel } = this.props;
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      return 0;
    }
    const flag = selectedRows.every((row) => {
      const {
        costBigCategory,
        costProductCategory,
        costSmallCategory,
        isCircuitIdRequired,
        siteCode,
      } = row;
      return (
        costBigCategory &&
        costProductCategory &&
        costSmallCategory &&
        isCircuitIdRequired &&
        siteCode
      );
    });
    if (!flag) {
      CusNotification.error({
        message: intl.get(`${prefix}.view.warning.categoryTips`).d('请维护成本大小类相关字段'),
      });

      return 0;
    }
    const statusFlag = selectedRows.some((item) => {
      return item.status === 'CLOSE';
    });
    if (statusFlag) {
      CusNotification.error({
        message: intl
          .get(`${prefix}.view.warning.statusTips`)
          .d('未付款申请酬金为0不能创建付款申请'),
      });

      return 0;
    }
    // 校验若存在【未付款申请酬金】= 0的数据，则不能创建付款申请并报错
    if (selectedRows.some((row) => row.unpaidPaymentAmount === 0)) {
      CusNotification.error({
        message: intl
          .get(`${prefix}.view.warning.unpaidPaymentAmount`)
          .d('勾选数据【未付款申请酬金】= 0, 不能进行酬金付款!'),
      });

      return 0;
    }

    // 若勾选的电路编号状态为【未结】的数据中是否存在客户已付<0的数据, 弹出提示框
    cusRequest(`${SRM_SPUC}/v1/${organizationId}/commission-data/checkCommissionAmount`, {
      method: 'POST',
      body: selectedRows.map((row) => row.circuitId),
    }).then((res) => {
      if (cusGetResponse(res)) {
        if (isEmpty(res)) {
          onCancel();
          onOk(selectedRows);
        } else {
          CusModal.warning({
            content: intl
              .get(`${prefix}.view.warning.statusAndPaidAmount`, {
                circuitIds: uniq(res).join('、'),
              })
              .d('电路编号{circuitIds}存在负数收款，请确认是否需要合并付款。'),
            onOk: () => {
              onCancel();
              onOk(selectedRows);
            },
            okText: intl.get(`hzero.common.button.sure`).d('确定'),
          });
        }
      }
    });
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      loading = false,
      onChange = (e) => e,
      onCancel = (e) => e,
    } = this.props;
    const { selectedRowKeys } = this.state;

    const columns = [
      {
        title: intl.get(`${prefix}.model.basicInformation`).d('基本信息'),
        dataIndex: 'basicInformation',
        align: 'left',
        children: [
          {
            title: intl.get(`${prefix}.model.orderNumber`).d('序号'),
            dataIndex: 'orderNumber',
            width: 80,
            align: 'center',
            className: 'cus-table-tr-th-border-first',
            render: (text, record, index) => index + 1,
          },
          {
            title: intl.get(`${prefix}.model.company`).d('销售订单公司主体'),
            dataIndex: 'company',
            width: 150,
            render: (val) => tooltipRender(val),
          },
          {
            title: intl.get(`${prefix}.model.customerCode`).d('客户EBS编码'),
            dataIndex: 'customerCode',
            width: 120,
            render: (val) => tooltipRender(val),
          },
          {
            title: intl.get(`${prefix}.model.circuitId`).d('客户电路编号'),
            dataIndex: 'circuitId',
            width: 120,
            render: (val) => tooltipRender(val),
          },
          {
            title: intl.get(`${prefix}.model.customerName`).d('客户名称'),
            dataIndex: 'customerName',
            width: 120,
            render: (val) => tooltipRender(val),
          },
          {
            title: intl.get(`${prefix}.model.referenceNumber`).d('发票编号'),
            dataIndex: 'referenceNumber',
            width: 100,
            render: (val) => tooltipRender(val),
          },
          {
            title: intl.get(`${prefix}.model.sbd`).d('SBD日期'),
            dataIndex: 'sbd',
            width: 120,
            render: (val) => dateRender(val),
          },
          {
            title: intl.get(`${prefix}.model.nrcAmount`).d('NRC金额'),
            dataIndex: 'nrcAmount',
            width: 100,
            render: (val) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
          },
          {
            title: intl.get(`${prefix}.model.mrcAmount`).d('MRC金额'),
            dataIndex: 'mrcAmount',
            width: 100,
            render: (val) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
          },
          {
            title: intl.get(`${prefix}.model.currencyCode`).d('币种'),
            dataIndex: 'currencyCode',
            width: 80,
          },
          {
            title: intl.get(`${prefix}.model.serviceStartDate`).d('服务开始日期'),
            dataIndex: 'serviceStartDate',
            width: 120,
            render: (val) => dateRender(val),
          },
          {
            title: intl.get(`${prefix}.model.serviceEndDate`).d('服务结束日期'),
            dataIndex: 'serviceEndDate',
            width: 120,
            render: (val) => dateRender(val),
          },
          {
            title: intl.get(`${prefix}.model.serviceMonth`).d('服务月'),
            dataIndex: 'serviceMonth',
            width: 100,
            render: (val) => tooltipRender(val),
          },
          {
            title: intl.get(`${prefix}.model.status`).d('状态'),
            dataIndex: 'statusMeaning',
            width: 90,
          },
          {
            title: intl.get(`${prefix}.model.initFlag`).d('是否期初数据'),
            dataIndex: 'initFlagMeaning',
            width: 150,
          },
        ],
      },
      {
        title: intl.get(`${prefix}.model.customerPayment`).d('客户付款情况'),
        dataIndex: 'customerPayment',
        align: 'left',
        children: [
          {
            title: intl.get(`${prefix}.model.sumCircuitAmt`).d('应付'),
            dataIndex: 'sumCircuitAmt',
            width: 100,
            render: (val) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
          },
          {
            title: intl.get(`${prefix}.model.paidAmount`).d('已付'),
            dataIndex: 'paidAmount',
            width: 100,
            render: (val) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
          },
          {
            title: intl.get(`${prefix}.model.sumCircuitRemaining`).d('未付'),
            dataIndex: 'sumCircuitRemaining',
            width: 100,
            render: (val) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
          },
        ],
      },
      {
        title: intl.get(`${prefix}.model.remunerationPayment`).d('酬金付款情况'),
        dataIndex: 'remunerationPayment',
        align: 'left',
        children: [
          {
            title: intl.get(`${prefix}.model.channelName`).d('渠道商名称'),
            dataIndex: 'channelName',
            width: 120,
            render: (val) => tooltipRender(val),
          },
          {
            title: intl.get(`${prefix}.model.channelCode`).d('渠道商EBS编码'),
            dataIndex: 'channelCode',
            width: 150,
            render: (val) => tooltipRender(val),
          },
          {
            title: intl.get(`${prefix}.model.commissionRate`).d('酬金比例'),
            dataIndex: 'commissionRate',
            width: 100,
            render: (val) => (val ? `${val}%` : ''),
          },
          {
            title: intl.get(`${prefix}.model.paidPaymentAmount`).d('付款申请酬金'),
            dataIndex: 'paidPaymentAmount',
            width: 150,
            render: (val) => <div style={{ textAlign: 'right' }}>{numberRender(val || 0, 2)}</div>,
          },
          {
            title: intl.get(`${prefix}.model.unpaidPaymentAmount`).d('未付款申请酬金'),
            dataIndex: 'unpaidPaymentAmount',
            width: 150,
            render: (val) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
          },
        ],
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
    };

    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          bordered
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          rowSelection={rowSelection}
          loading={loading}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={(page) => onChange(page)}
        />
        <div className="cus-modal-body-buttons">
          <CusButton onClick={onCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </CusButton>
          <CusButton type="primary" onClick={this.handleSave}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </CusButton>
        </div>
      </React.Fragment>
    );
  }
}
