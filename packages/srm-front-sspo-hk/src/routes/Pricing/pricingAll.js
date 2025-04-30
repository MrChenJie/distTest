/** -- 报总价模式
 * @date: 2022/04/24 11:50:55
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Modal, Button, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import saveIcon from '@/assets/buttonIcons/保存.png';
import submitIcon from '@/assets/buttonIcons/提交.png';
import changeIcon from '@/assets/buttonIcons/变更.png';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { numberRender } from 'utils/renderer';

import intl from 'utils/intl';
import UploadFile from './UploadFile';
import { getCurrentOrganizationId, getAccessToken, tableScrollWidth } from 'utils/utils';
import { connect } from 'dva';
import EditTable from 'components/EditTable';
import styles from './index.less';

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
      Modal.confirm({
        title: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
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
        width: 180,
        fixed: isShow && 'left'
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.purchaseitems').d('采购内容'),
        key: 'purchaseContent',
        dataIndex: 'purchaseContent',
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        key: 'serviceContent',
        dataIndex: 'serviceContent',
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.quotecurrency').d('报价货币（原币）'),
        key: 'priceCurrency',
        width: 100,
        dataIndex: 'priceCurrency',
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.totalpriceexcludingtax').d('不含税总价'),
        key: 'afterTaxPrice',
        dataIndex: 'afterTaxPrice',
        render: (_, record) => {
          return <div>{numberRender(record.afterTaxPrice, 2)}</div>;
        },
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.taxamount').d('税额'),
        key: 'tax',
        dataIndex: 'tax',
        render: (_, record) => {
          return <div>{numberRender(record.tax, 2)}</div>;
        },
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.totalpriceincludingtax').d('含税总价'),
        key: 'preTax',
        dataIndex: 'preTax',
        render: (_, record) => {
          return <div>{numberRender(record.preTax, 2)}</div>;
        },
      },
      {
        title: intl
          .get('bid.bidcommon.view.title.thepurchaserconfirmsandreviewsthequotation')
          .d('采购员确认评审报价'),
        key: 'confirmPrice',
        dataIndex: 'confirmPrice',
        width: isShow ? 160 : 200,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('confirmPrice', {
              initialValue: val,
            })(
              <InputNumber
                disabled={timeFlag || submitFlag && !editConfirmPriceFlag}
                onChange={(value) => this.confirmPriceChange(value, record)}
                precision={2}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            )}
          </Form.Item>
        ),
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.hkdreference').d('HKD（参考）'),
        key: 'referencePriceHkd',
        dataIndex: 'referencePriceHkd',
        width: 130,
        render: (_, record) => {
          return <div>{numberRender(record.referencePriceHkd, 2)}</div>;
        },
      },
      poHeaderInfo?.hideSwitch && {
        title: intl.get('bid.bidcommon.view.title.attachment').d('附件'),
        key: 'fileDTOList',
        dataIndex: 'fileDTOList',
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
        width: 180,
      },
    ].filter(Boolean);

    const loading = saveLoading || deleteLoading || fetchLoading;

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    // const draggerUploadProps = {
    //   name: 'file',
    //   multiple: true,
    //   // accept: 'image/*',
    //   data: this.uploadData,
    //   headers,
    //   action: `${API_HOST}${HZERO_FILE}/v1/${tenantId}/files/multipart`,
    //   beforeUpload: this.beforeUpload,
    //   onChange: this.onDraggerUploadChange,
    //   onRemove: this.onDraggerUploadRemove,
    // };

    return (
      <div style={{ marginTop: '-10px' }}>
        <div
          style={{
            marginBottom: '10px',
            float: 'right',
          }}
          className="customize-buttons"
        >
          <Button
            onClick={onSave}
            loading={saveLoading}
            disabled={loading || submitFlag && !editConfirmPriceFlag || timeFlag}
          >
            <img src={saveIcon} alt="" style={{ width: '15px' }} />
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            onClick={onConfirmPrice}
            disabled={submitFlag && !editConfirmPriceFlag || timeFlag || !confirmPriceFlag && timeFlag}
          >
            <img src={submitIcon} alt="" style={{ width: '15px' }} />
            {intl.get('bid.bidcommon.view.button.checkhejiaprice').d('确认核价')}
          </Button>
          <Button
            onClick={onEditConfirmPrice}
            disabled={editConfirmPriceFlag}
          >
          <img src={changeIcon} alt="" style={{ width: '15px' }} />
            {intl.get('bid.bidcommon.view.title.modifyprice').d('修改价格')}
          </Button>
        </div>
        <div style={{ clear: 'both' }} />
        <EditTable
          bordered
          rowKey="allQaId"
          dataSource={dataSource}
          pagination={pagination}
          onChange={this.handlePageChange}
          columns={columns}
          loading={fetchLoading}
          onDataChange={this.handleDataChange}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </div>
    );
  }
}
