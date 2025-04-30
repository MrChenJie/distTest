import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import querystring from 'querystring';
import { numberRender } from 'utils/renderer';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
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
   * @description 删除
   */
  @Bind()
  handleDelete(record) {
    const { onDetele = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    // console.log(selectedRows)
    // console.log(record)
    selectedRows.push(record);
    // if (record.prApplyStatus != 'PENDING_REFER') {
    //   CusNotification.error({
    //     message: intl.get('hzero.common.message.confirm.selected.atLeast').d('只能删除状态为草稿的数据'),
    //   });
    //   return 0;
    // }
    onDetele(selectedRows, this.clearState);
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
      payload: { id: record.id },
    }).then(res => {
      // dispatch(
      //   routerRedux.push({
      //     pathname: `/ssrp-hk/purchaseInquirySheet/edit`,
      //     search: querystring.stringify({ id: record.id }),
      //     state: res,
      //   }));
      if (record.prApplyStatus == 'PENDING_REFER') {
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=ICTzhuanshouPRshenpiliucheng&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrp-hk/purchaseInquirySheet/add?${querystring.stringify({ id: record.id })}`)}`)
        window.close()
      } else {
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`)
        window.close()
      }
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
          onClick={this.handleDelete}
          loading={deleteLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
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
        title: intl.get(`${promptCode}.view.title.ictprnumber`).d('采购结果单号'),
        dataIndex: 'prApplyNo',
        width: 160,
        render: (val, record) => {
          return <a onClick={() => this.handleUpdate(record)}>{val}</a>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.icttitle`).d('标题'),
        dataIndex: 'prApplyTitle',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.ictstatus`).d('状态'),
        dataIndex: 'prApplyStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.ictcreatedate`).d('创建日期'),
        dataIndex: 'creatDate',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.ictapplicant`).d('申请人'),
        dataIndex: 'prApplierMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.ictsuppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.ictammounthkd`).d('总金额(HKD)'),
        dataIndex: 'totalAmountHkd',
        width: 120,
        align: 'left',
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {record.totalAmountHkd}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.operation`).d('操作区'),
        align: 'center',
        width: 120,
        dataIndex: 'operator',
        render: (text, record) => {
          return record.prApplyStatus == 'PENDING_REFER' ? (
            <>
              {/*<CusButton*/}
              {/*  style={{ marginRight: '16px' }}*/}
              {/*  type='plain'*/}
              {/*  onClick={() => this.handleUpdate(record)}*/}
              {/*>*/}
              {/*  {intl.get('hzero.common.button.edit').d('编辑')}*/}
              {/*</CusButton>*/}
              <CusButton
                // style={{ marginRight: '16px' }}
                type="plain"
                onClick={() => this.handleDelete(record)}
              >
                {intl.get('hzero.common.view.button.delete').d('删除')}
              </CusButton>
            </>
          ) : (
            <>
              <CusButton
                // style={{ marginRight: '16px' }}
                disabled
                type="plain"
                onClick={() => this.handleDelete(record)}
              >
                {intl.get(`${promptCode}.view.title.resend`).d('重新推送')}
              </CusButton>
            </>
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
        <CusTable
          rowKey={ROW_KEY}
          dataSource={purchaseInquiryList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={purchaseInquiryPagination}
          onChange={onChange}
        // rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
