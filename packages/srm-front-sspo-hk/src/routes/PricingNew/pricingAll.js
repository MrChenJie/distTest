/** -- 报总价模式
 * @date: 2022/04/24 11:50:55
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import { Bind } from 'lodash-decorators';
import { numberRender, dateRender } from 'utils/renderer';

import intl from 'utils/intl';
import UploadFile from './UploadFile';
import { getCurrentOrganizationId, getAccessToken, tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { connect } from 'dva';
import EditTable from '_cus_components/EditTable';
import { tooltipRender } from '_cus_utils/render';
import CusInputNumber from '_cus_components/CusInputNumber';

const status = ['create', 'update'];
const tenantId = getCurrentOrganizationId();

@connect(({ materiel }) => ({
  materiel,
}))
@Form.create({ fieldNameProp: null })
export default class PricingAll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRows: [],
      selectedRowKeys: [],
      fileList: [],
    };
    // this.unsaveFlag = false;
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    // this.checkPermission();
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof PricingAll
   */
  @Bind
  handleDataChange() {
    const { unsaveFlag } = this.props;
    if (!unsaveFlag) {
      const { onEdit = (e) => e } = this.props;
      onEdit(true);
    }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   *
   * @param {object} page
   * @memberof PricingAll
   */
  @Bind
  handlePageChange(page) {
    const { onPageChange = (e) => e, unsaveFlag } = this.props;
    if (unsaveFlag) {
      CusModal.confirm({
        content: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
        okType: 'normal',
        onOk: () => {
          onPageChange(page);
        },
      });
    } else {
      onPageChange(page);
    }
  }

  /**
   * 方法含义？
   * @param {*} file - <>
   */
  @Bind()
  uploadData(file) {
    return {
      tenantId: tenantId,
      bucketName: 'bidding',
      fileName: file.name,
    };
  }

  // 采购员确认评审报价
  @Bind()
  confirmPriceChange(value, record) {
    const { HkdVal } = this.props;
    if (value === '' || value === undefined) {
      record.referencePriceHkd = '';
    } else {
      record.referencePriceHkd = value * HkdVal;
    }
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      isShow = true,
      poHeaderMilestonesInfo: { milestoneState },
      onSave = (e) => e,
      onConfirmPrice = (e) => e,
      timeFlag,
      submitFlag,
      confirmPriceFlag,
      editConfirmPriceFlag = false,
      onEditConfirmPrice = (e) => e,
      poHeaderInfo,
    } = this.props;
    const columns = [
      {
        title: intl.get('bid.bidcommon.view.title.suppliername').d('供应商名称'),
        key: 'supplierName',
        dataIndex: 'supplierName',
        width: isShow  ? 180 :525,
        fixed: 'left',
        render: tooltipRender,
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.purchaseitems').d('采购内容'),
        key: 'purchaseContent',
        dataIndex: 'purchaseContent',
        width: 180,
        render: tooltipRender,
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        key: 'serviceContent',
        dataIndex: 'serviceContent',
        width: 180,
        render: tooltipRender,
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.quotecurrency').d('报价货币（原币）'),
        key: 'priceCurrency',
        width: getCurrentLanguage() === 'zh_CN' ? 145 : 150,
        dataIndex: 'priceCurrency',
        render: tooltipRender,
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.totalpriceexcludingtax').d('不含税总价'),
        key: 'afterTaxPrice',
        dataIndex: 'afterTaxPrice',
        width: getCurrentLanguage() === 'zh_CN' ? 180 : 320,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPrice, 2)}</div>;
        },
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.taxamount').d('税额'),
        key: 'tax',
        dataIndex: 'tax',
        width: getCurrentLanguage() === 'zh_CN' ? 180 : 240,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.tax, 2)}</div>;
        },
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.totalpriceincludingtax').d('含税总价'),
        key: 'preTax',
        dataIndex: 'preTax',
        width: getCurrentLanguage() === 'zh_CN' ? 180 : 315,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.preTax, 2)}</div>;
        },
      },
      {
        title: intl
          .get('bid.bidcommon.view.title.thepurchaserconfirmsandreviewsthequotation')
          .d('采购员确认评审报价'),
        key: 'confirmPrice',
        dataIndex: 'confirmPrice',
        width:  getCurrentLanguage() === 'zh_CN' ? 200 : 510,
        render: (val, record) => (
          (timeFlag || submitFlag && !editConfirmPriceFlag) ?
          <div style={{ textAlign: 'right' }}>
            {tooltipRender(
              <>
                <div>{numberRender(val, 2)}</div>
              </>
            )}
          </div>
          :
          <Form.Item>
            {record.$form.getFieldDecorator('confirmPrice', {
              initialValue: val,
            })(
              <CusInputNumber
                disabled={timeFlag || submitFlag && !editConfirmPriceFlag}
                onChange={(value) => this.confirmPriceChange(value, record)}
                precision={2}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                className="cus-input-money"
              />
            )}
          </Form.Item>
        ),
      },
      // {
      //   title: intl.get('bid.bidcommon.view.title.').d('参考汇率'),
      //   key: 'referencePriceHkd2',
      //   dataIndex: 'referencePriceHkd2',
      //   width:  getCurrentLanguage() === 'zh_CN' ? 180 : 144,
      //   render: (_, record) => {
      //     return <div style={{ textAlign: 'right' }}>{numberRender(record.referencePriceHkd2, 2)}</div>;
      //   },
      // },
      // {
      //   title: intl.get('bid.bidcommon.view.title.').d('汇率日期'),
      //   key: 'referencePriceHkd1',
      //   dataIndex: 'referencePriceHkd1',
      //   width:  getCurrentLanguage() === 'zh_CN' ? 180 : 144,
      //   render: dateRender,
      // },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.hkdreference').d('HKD（参考）'),
        key: 'referencePriceHkd',
        dataIndex: 'referencePriceHkd',
        width:  getCurrentLanguage() === 'zh_CN' ? 120 : 144,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.referencePriceHkd, 2)}</div>;
        },
      },
      poHeaderInfo?.hideSwitch && {
        title: intl.get('bid.bidcommon.view.title.attachment').d('附件'),
        key: 'fileDTOList',
        dataIndex: 'fileDTOList',
        width: getCurrentLanguage() === 'zh_CN' ? 120 :124,
        render: (value, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.qaId}
            value={value}
            disabled
          />
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.remarks`).d('备注'),
        dataIndex: 'annotation',
        width: 300,
        render: tooltipRender,
      },
    ].filter(Boolean);

    const loading = saveLoading || deleteLoading || fetchLoading;

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    return (
      <>
        {/* <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '16px'}}>
          {!(loading || submitFlag && !editConfirmPriceFlag || timeFlag) && <CusButton
            mini
            onClick={onSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </CusButton>}
          {!(submitFlag && !editConfirmPriceFlag || timeFlag || !confirmPriceFlag && timeFlag) && <CusButton
            mini
            onClick={onConfirmPrice}
          >
            {intl.get('bid.bidcommon.view.button.checkhejiaprice').d('确认核价')}
          </CusButton>}
          {!(editConfirmPriceFlag) && <CusButton
            mini
            onClick={onEditConfirmPrice}
          >
            {intl.get('bid.bidcommon.view.title.modifyprice').d('修改价格')}
          </CusButton>}
        </div> */}
        <EditTable
          rowKey="allQaId"
          dataSource={dataSource}
          pagination={pagination}
          onChange={this.handlePageChange}
          columns={columns}
          onDataChange={this.handleDataChange}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
