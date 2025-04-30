import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { pullAllBy } from 'lodash';

import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import { Form } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';
import { numberRender } from 'utils/renderer';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'uuid';
export default class PackageDataTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
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
        url = `${
          isPub ? '/pub' : ''
        }${SRM_SSRC}/standard-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'ICTS':
        url = `${
          isPub ? '/pub' : ''
        }${SRM_SSRC}/resale-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'CHINA_DIA':
        url = `${
          isPub ? '/pub' : ''
        }${SRM_SSRC}/china-dia-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
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
    const { onPublish = (e) => e } = this.props;
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
    const { onMassCreate = (e) => e, onOpenModal = (e) => e, onExport = (e) => e } = this.props;

    return (
      <>
        <CusButton mini onClick={onExport} loading={exportLoading}>
          {intl.get('hzero.common.button.export').d('导出')}
        </CusButton>
        <CusButton mini onClick={this.handleSubmitToApproval} loading={submitLoading}>
          {intl.get(`${promptCode}.button.submitToApproval`).d('提交')}
        </CusButton>
        <CusButton mini onClick={this.handleDelete} loading={deleteLoading}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </CusButton>
        <CusButton mini onClick={this.handlePublish} loading={publishLoading}>
          {intl.get(`${promptCode}.button.publish`).d('发布询价')}
        </CusButton>
        <CusButton mini onClick={onMassCreate}>
          {intl.get(`${promptCode}.button.massCreate`).d('批量创建')}
        </CusButton>
        <CusButton mini onClick={onOpenModal} type="primary">
          {intl.get('hzero.common.button.create').d('新建')}
        </CusButton>
      </>
    );
  };

  render() {
    const {
      onChange = (e) => e,
      getQueryParams = (e) => e,
      purchaseResultModel,
      form,
      dispatch,
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const { fourthPackageList = [], paStatusYB } = purchaseResultModel;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.PackageName`).d('标包名称'),
        dataIndex: 'packageName',
        width: 160,
        render: tooltipRender,
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.OrderHandler`).d('订单经办人'),
      //   dataIndex: 'agentMeaning',
      //   width: 180,
      //   render: (val, record) => {
      //     return paStatusYB == 'PENDING_REFER' || paStatusYB == '' ? (
      //       <Form className="customize-from">
      //         <Form.Item>
      //           {getFieldDecorator(`${record['uuid']}#agentMeaning`, {
      //             initialValue: record.agentName,
      //           })(
      //             <CusLov
      //               textValue={record.agentName}
      //               code="HKPC.PROCUREMENTAGENT"
      //               // queryParams={{ tenantId }}
      //               lovOptions={{ displayField: 'userName', valueField: 'loginName' }}
      //               onChange={(_, lovData) => {
      //                 record.agent = lovData.loginName
      //                 form?.setFieldsValue({
      //                   [`${record['uuid']}#agent`]: lovData.loginName,
      //                 });
      //                 dispatch({
      //                   type: 'purchaseResultModel/commentUpdateState',
      //                   payload: {
      //                      agent: lovData.loginName,
      //                   },
      //                 });
      //               }}
      //             />
      //           )}
      //         </Form.Item>
      //       </Form>
      //     ) : (<span>{record.agentName}</span>);
      //   },
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人'),
      //   dataIndex: 'procurementHandlerName',
      //   width: 200,
      // },
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 120,
        render: tooltipRender,
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号'),
      //   dataIndex: 'packageNo',
      //   width: 160,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.SupplierType`).d('供应商类型'),
      //   dataIndex: 'bidResult',
      //   width: 120,
      //   render: (_, record) => {
      //     return (
      //       <span>{record?.bidResult == '1' ? '中标' : 'record?.bidResult'}</span>
      //     )
      //   }
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.Contact`).d('联系人'),
      //   dataIndex: 'contact',
      //   width: 120,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.SuppliersTelephone`).d('供应商联系电话'),
      //   dataIndex: 'contactInformation',
      //   width: 200,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.SuppliersMailAddress`).d('供应商联系人邮箱'),
      //   dataIndex: 'contactMail',
      //   width: 200,
      // },
      {
        title: intl.get(`${promptCode}.view.title.FinalTotalTenderAmountOriginalCurrency`).d('最终投标总金额(原币)'),
        dataIndex: 'bidderAmount',
        width: 200,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.bidderAmount, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.InitialTotalTenderAmountOriginalCurrency`).d('初始投标总金额(原币)'),
        dataIndex: 'initialBidderAmount',
        width: 200,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.initialBidderAmount, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.RQCurrencyt`).d('投标币种'),
        dataIndex: 'bidderCurrency',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.view.title.HKDExchangeRate`).d('港币汇率'),
        dataIndex: 'hkExchangeRate',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.view.title.FinalTotalTenderAmountH`).d('最终投标总金额（HKD）'),
        dataIndex: 'bidderAmountHkd',
        width: 220,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.bidderAmountHkd, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.InitialTotalTenderAmountH`).d('初始投标总金额（HKD）'),
        dataIndex: 'initialBidderAmountHkd',
        width: 220,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.initialBidderAmountHkd, 2)}
            </span>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    return (
      <React.Fragment>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={fourthPackageList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
          rowSelection={false}
        />
      </React.Fragment>
    );
  }
}
