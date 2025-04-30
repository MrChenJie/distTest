import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage, createPagination } from 'utils/utils';
import { Input } from 'antd';
import { pullAllBy } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
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
import { numberRender, dateRender } from 'utils/renderer';
import MaterialList from './materialList2';
import searchIcon from '@/assets/searchIcon.svg';
import styles from './index.less';
// import RfqResponse from './components/RfqResponse';
// import QuotationDocumentSubmitEditModal from './QuotationDocumentSubmitEditModal'
// import QuotationDocumentSubmitNextModal from './QuotationDocumentSubmitNextModal'
// import ExportHistoryData from './components/ExportHistoryData';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'inquiryResultsId';
@formatterCollections({
  code: [promptCode],
})
export default class InquireResult extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      materialModel: false,
      materialDataSource: [],
      materialPagination: {},
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
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

  // 打开物料弹窗
  @Bind
  onSearchBtnClick = (page = {}, record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'singlePurchaseApplicationCusModel/getQuoteMatList',
      payload: {
        ...page,
        inquiryResultsId: record.inquiryResultsId,
      }
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        // const newDataSource = content?.map((item) => ({
        //   ...item,
        // }));
        // newDataSource.map(i => {
        //   priceSummaryList.filter(n => n.prThirdQuoteSettingList).map(k => {
        //     k.prThirdQuoteSettingList.map(l => {
        //       if (i.settingId === l.settingId) {
        //         i.availableQuantity -= l.orderQuantity;
        //       }
        //     })
        //   })
        //   return i;
        // })
        this.setState({
          materialModel: true,
          materialDataSource: content,
          lineRecord: record,
          selectedRowKeys: [],
          selectedRows: [],
          materialPagination: pagination,
        });
      }
    });
  };

  // 物料名称弹框确认
  @Bind()
  handleSaveMaterial() {
    this.setState({
      materialModel: false,
    });
  }

  // 物料弹窗取消
  @Bind()
  handleMaterialCancel() {
    this.setState({
      materialModel: false,
    });
  }

  searchButton = () => {
    return (
      <img
        src={searchIcon}
        alt="searchIcon"
        style={{ cursor: 'pointer', color: '#666' }}
        onClick={() => this.onSearchBtnClick()}
      />
    );
  }


  render() {
    const { singlePurchaseApplicationCusModel } = this.props;
    const {
      materialModel,
      materialDataSource = [],
      materialPagination = {},
      selectedRowKeys,
    } = this.state;
    const { inquiryResultList = [] } = singlePurchaseApplicationCusModel;
    const suffix = (
      <>
        <div className="cus-lov-clear" />
        {this.searchButton()}
      </>
    );
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称')),
        dataIndex: 'supplierName',
        width: 160,
        render: tooltipRender,
      },
      {
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）')
        ),
        dataIndex: 'supplierQuotationOri',
        width: 160,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币')),
        dataIndex: 'quotationCurrency',
        width: 180,
        render: tooltipRender,
      },
      {
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）')
        ),
        dataIndex: 'supplierQuotationHkd',
        width: 160,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'materialName',
        width: 200,
        render: (_, record) => {
          return (
            // (!isDisabled || record.isBeChosen === '' || record.isBeChosen === null || record.isBeChosen === 'NO') ?
            // <Form.Item>
            //   {record.$form.getFieldDecorator(`materialName`, {
            //   })(
            //     <div>{tooltipRender(record.isBeChosen === 'NO' ? null : record.materialName)}</div>
            //   )}
            // </Form.Item>
            //  :
            <Form.Item>
              <Input
                readOnly
                suffix={
                  <>
                    <div className="cus-lov-clear" />
                    <div onClick={() => {this.onSearchBtnClick({}, record); }}>
                      <img
                        src={searchIcon}
                        alt="searchIcon"
                        style={{ cursor: 'pointer', color: '#666' }}
                      />
                    </div>
                  </>
                }
                className={styles['lov-input']}
                value={record.materialName ? record.materialName : null}
                style={{ cursor: 'pointer', color: '#666' }}
                onClick={() => {
                  this.onSearchBtnClick({}, record);
                }}
              />
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.Selectedamount`).d('中选金额'),
        dataIndex: 'selectedAmount',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
    ];

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      fixed: true,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true, // 选择框的是否可选
      }),
    };

    const materialProps = {
      dataSource: materialDataSource,
      pagination: materialPagination,
      rowSelection,
      ...this.props,
    };

    return (
      <React.Fragment>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={inquiryResultList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
        <CusModal
          title={intl.get(`bid.bidcommon.view.title.mailconten1t`).d('物料名称')}
          visible={materialModel}
          width={800}
          destroyOnClose={true}
          onOk={this.handleSaveMaterial}
          onCancel={this.handleMaterialCancel}
        >
          <MaterialList {...materialProps} />
        </CusModal>
      </React.Fragment>
    );
  }
}
