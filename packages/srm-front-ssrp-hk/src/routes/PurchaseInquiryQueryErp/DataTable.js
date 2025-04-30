import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Button as ButtonPermission } from 'components/Permission';
import { Popconfirm } from 'hzero-ui';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { operatorRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import RfqResponse from './components/RfqResponse';
import { routerRedux } from 'dva/router';
import styles from './index.less'

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const ROW_KEY = 'prApplyNo';
export default class DataTable extends React.Component {
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
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/standard-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'ICTS':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'CHINA_DIA':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/china-dia-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
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
  handleDelete(record) {
    const { onDetele = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    // console.log(selectedRows)
    // console.log(record)
    selectedRows.push(record)
    // if (selectedRows.length === 0) {
    //   CusNotification.error({
    //     message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
    //   });
    //   return 0;
    // }
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

  // 编辑当前行
  @Bind()
  handleUpdate(record) {
    const { dispatch } = this.props;
    dispatch({
      type: `purchaseInquiryQueryModel/editPurchaseResultApplication`,
      payload: record.id,
    }).then(res => {
      dispatch(
        routerRedux.push({
          pathname: `/ssrp-hk/purchaseInquirySheet/edit`,
          state: res,
        }));
    });
  }

  /**
   * 操作区render
   */
  // @Bind()
  // optionsRender(_, record) {
  //   const { match } = this.props;
  //   const operators = [
  //     {
  //       key: 'edit',
  //       ele: (
  //         <ButtonPermission
  //           className={styles['operateStyle']}
  //           type='text'
  //           permissionList={[
  //             {
  //               code: `${match.path}.button.edit`,
  //               type: 'button',
  //               meaning: '表单配置行-编辑',
  //             },
  //           ]}
  //           onClick={() => this.handleUpdate(record)}
  //         >
  //           {intl.get('hzero.common.button.edit').d('编辑')}
  //         </ButtonPermission>
  //       ),
  //       len: 2,
  //       title: intl.get('hzero.common.button.edit').d('编辑'),
  //     },
  //     {
  //       key: 'delete',
  //       ele: (
  //         <Popconfirm
  //           title={intl.get('hpfm.prompt.model.message.confirm.remove').d('确认删除此条记录？')}
  //           onConfirm={() => {
  //             this.handleDelete(record);
  //           }}
  //         >
  //           <ButtonPermission
  //             className={styles['operateStyle']}
  //             type='text'
  //             permissionList={[
  //               {
  //                 code: `${match.path}.button.delete`,
  //                 type: 'button',
  //                 meaning: '表单配置行-删除',
  //               },
  //             ]}
  //             style={{ marginLeft: 8 }}
  //           >
  //             {intl.get('hzero.common.button.delete').d('删除')}
  //           </ButtonPermission>
  //         </Popconfirm>
  //       ),
  //       len: 2,
  //       title: intl.get('hzero.common.button.delete').d('删除'),
  //     },
  //   ];
  //   return operatorRender(operators, record);
  // }

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
    );
  };

  render() {
    const {
      onChange = (e) => e,
      getQueryParams = (e) => (e),
      purchaseInquiryQueryModel,
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const {
      purchaseInquiryList = [],
      purchaseInquiryPagination = [],
    } = purchaseInquiryQueryModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.label`).d('采购结果单号'),
        dataIndex: 'prApplyNo',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model`).d('标题'),
        dataIndex: 'prApplyTitle',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('状态'),
        dataIndex: 'prApplyStatus',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('创建日期'),
        dataIndex: 'creatDate',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('申请人'),
        dataIndex: 'prApplier',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('总金额(HKD)'),
        dataIndex: 'totalAmountHkd',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('hpfm.dynamicForm.line').d('操作区'),
        align: 'left',
        width: 120,
        dataIndex: 'operator',
        fixed: 'right',
        render: (text, record) => {
          return (
            <>
              <CusButton
                style={{ marginRight: '16px' }}
                type="plain"
                onClick={() => this.handleUpdate(record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </CusButton>
              <CusButton
                style={{ marginRight: '16px' }}
                type="plain"
                onClick={() => this.handleDelete(record)}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </CusButton>

            </>
          )
        },
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
        });
      },
      footer: null,
    };
    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={purchaseInquiryList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={purchaseInquiryPagination}
          onChange={onChange}
        // rowSelection={rowSelection}
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
        {/* <CusModal {...exportModalProps}>
          <ExportHistoryData
            onCancel={() => {
              this.setState({
                exportModalVisible: false
              })
            }}
            fileName='询价单导出'
            getQueryParams={getQueryParams}
          />
        </CusModal> */}
      </React.Fragment>
    );
  }
}
