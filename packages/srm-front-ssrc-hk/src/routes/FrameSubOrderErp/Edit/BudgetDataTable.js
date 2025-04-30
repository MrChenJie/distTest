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
import RfqResponse from './components/RfqResponse';
// import ExportHistoryData from './components/ExportHistoryData';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const ROW_KEY = 'enquiryPriceId';
export default class BudgetDataTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    };
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind()
  openEnquiryResponseModal(record) {
    this.setState({
      rfqResponseVisible: true,
      nowRecord: record,
    });
  }

  /**
   * 跳转详情界面
   * @param {object} record
   */
  @Bind()
  openPriceEntryDetail(record) {
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { businessType, enquiryPriceId, enquiryPriceRoundsId } = record;
    let url = '';
    switch (businessType) {
      case 'STANDARD':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/standard-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`
        break;
      case 'ICTS':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`
        break;
      case 'CHINA_DIA':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/china-dia-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`
        break;
    }
    window.open(url);
  }

  /**
   * @description 提交生成采购审批
   */
  @Bind()
  handleSubmitToApproval() {
    const { onSubmitToApproval = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onSubmitToApproval(selectedRows);
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDelete() {
    const { onDetele = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onDetele(selectedRows, this.clearState);
  }

  /**
   * @description 发布询价
   */
  @Bind()
  handlePublish() {
    const { onPublish = (e) => e } = this.props
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onPublish(selectedRows);
  }

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    console.log('newSRows', newSRows);
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  @Bind()
  onSelectAll(selected, _, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, ROW_KEY);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  renderButtons = ({ parent }) => {
    const {
      publishLoading = false,
      submitLoading = false,
      deleteLoading = false,
      exportLoading = false,
    } = parent.props;
    const {
      onMassCreate = (e) => e,
      onOpenModal = (e) => e,
      onExport = (e) => e,
    } = this.props;

    return (
      <>
        <CusButton mini onClick={onExport} loading={exportLoading}>
          {intl.get('hzero.common.button.export').d('导出')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleSubmitToApproval}
          loading={submitLoading}
        >
          {intl.get(`${promptCode}.button.submitToApproval`).d('提交')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleDelete}
          loading={deleteLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handlePublish}
          loading={publishLoading}
        >
          {intl.get(`${promptCode}.button.publish`).d('发布询价')}
        </CusButton>
        <CusButton mini onClick={onMassCreate}>
          {intl.get(`${promptCode}.button.massCreate`).d('批量创建')}
        </CusButton>
        <CusButton mini onClick={onOpenModal} type='primary'>
          {intl.get('hzero.common.button.create').d('新建')}
        </CusButton>
      </>
    )
  }

  render() {
    const {
      onChange = (e) => e,
      getQueryParams = (e) => (e),
      purchaseApplicationModel,
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const {
      purchaseApplicationList = [],
      purchaseApplicationPagination = [],
    } = purchaseApplicationModel;
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('预算类型')),
        dataIndex: 'enquiryPriceNum',
        width: 160,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusSelect />
              </Form.Item>
            </Form>
            // <span className="action-link">
            //   <a style={{ color: '#3271FE' }} onClick={() => this.openPriceEntryDetail(record)}>{val}</a>
            // </span>
          );
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('项目编码')),
        dataIndex: 'enquiryPriceTitle',
        width: 180,
        required: true,
        render: (val, record) =>  {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusLov />
              </Form.Item>
            </Form>
          )
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('预算项目编码')),
        dataIndex: 'enquiryPriceStatus',
        width: 160,
        required: true,
        render: (val, record) =>  {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusLov />
              </Form.Item>
            </Form>
          )
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('物料编码')),
        dataIndex: 'enquiryStartDate',
        width: 120,
        required: true,
        render: (val, record) =>  {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusLov />
              </Form.Item>
            </Form>
          )
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('物料名称')),
        dataIndex: 'enquiryEndDate',
        width: 120,
        required: true,
        render: dateRender,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('规格型号')),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        render: dateRender,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('单位')),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        required: true,
        render: (val, record) =>  {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusLov />
              </Form.Item>
            </Form>
          )
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('数量')),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        required: true,
        render: (val, record) =>  {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusLov />
              </Form.Item>
            </Form>
          )
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('需求日期')),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        required: true,
        render: (val, record) =>  {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusDatePicker />
              </Form.Item>
            </Form>
          )
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('送货地址联系人')),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        render: (val, record) =>  {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusLov />
              </Form.Item>
            </Form>
          )
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('采购申请金额（原币）')),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        render: (val, record) =>  {
          return (
            <Form className="customize-from">
              <Form.Item>
                <CusInput.TextArea />
              </Form.Item>
            </Form>
          )
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('采购申请金额（HKD）')),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        render: dateRender,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('成本中心')),
        dataIndex: 'enquiryPublishDate',
        width: 120,
        align: 'left',
        render: dateRender,
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    const exportModalProps = {
      title: intl.get(`${promptCode}.model.title.enquiryPriceExport`).d('询价单导出列表'),
      visible: exportModalVisible,
      destroyOnClose: true,
      width: '1000px',
      onCancel: () => {
        this.setState({
          exportModalVisible: false,
        })
      },
      footer: null,
    };
    return (
      <React.Fragment>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={purchaseApplicationList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={purchaseApplicationPagination}
          onChange={onChange}
          rowSelection={rowSelection}
        />

        {/* 询价响应 CusModal */}
        <CusModal
          visible={rfqResponseVisible}
          width={800}
          title={intl.get('ssrc.resaleRfq.create.rfqResponseModal.title').d('线上报价情况')}
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
          onCancel={() => this.setState({
            rfqResponseVisible: false,
          })}
          destroyOnClose
        >
          <RfqResponse
            {...this.props}
            nowRecord={nowRecord}
          />
        </CusModal>
      </React.Fragment>
    );
  }
}
