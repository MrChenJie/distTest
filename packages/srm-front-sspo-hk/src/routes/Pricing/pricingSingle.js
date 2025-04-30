/** -- 报单价模式
 * @date: 2022/04/24 11:50:55
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form, Modal, Input, Button, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import saveIcon from '@/assets/buttonIcons/保存.png';
import submitIcon from '@/assets/buttonIcons/提交.png';
import changeIcon from '@/assets/buttonIcons/变更.png';
import moment from 'moment';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getAccessToken, tableScrollWidth } from 'utils/utils';
import { connect } from 'dva';
import EditTable from 'components/EditTable';
import { update } from '@/services/contractMaintainService';
import UploadFile from './UploadFile';
import { numberRender } from 'utils/renderer';
import './index.less';

const status = ['create', 'update'];
const tenantId = getCurrentOrganizationId();

@connect(({ materiel }) => ({
  materiel,
}))
@Form.create({ fieldNameProp: null })
export default class PricingSingle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRows: [],
      selectedRowKeys: [],
      fastCodes: {},
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

  @Bind
  changelist(e) {
    this.state.dataSource[e.dataSourceIndex].priceViewDTOList[e.eIndex] = e.$form.getFieldValue(
      `${e.dataSourceIndex}${e.eIndex}`
    );
  }

  @Bind
  onSave(data) {
    const { onSave = (e) => e } = this.props;
    onSave(data);
  }

  @Bind
  onConfirmPrice(data) {
    const { onConfirmPrice = (e) => e } = this.props;
    onConfirmPrice(data);
  }

  @Bind()
  confirmPriceChange(value, record) {
    const { HkdVal, dataSource, dispatch } = this.props;
    // 改变值求总合
    dataSource[record.dataSourceIndex].answerVOList[
      dataSource[record.dataSourceIndex].answerVOList.length - 1
    ].confirmPrice = 0;
    dataSource[record.dataSourceIndex].answerVOList.map((item, index) => {
      if (item.isSum !== 'y') {
        if (record.eIndex === index) {
          dataSource[record.dataSourceIndex].answerVOList[index].referencePriceHkd = value * HkdVal
          dataSource[record.dataSourceIndex].answerVOList[index].confirmPrice = value;
          dataSource[record.dataSourceIndex].answerVOList[
            dataSource[record.dataSourceIndex].answerVOList.length - 1
          ].confirmPrice =
            value * 1 +
            dataSource[record.dataSourceIndex].answerVOList[
              dataSource[record.dataSourceIndex].answerVOList.length - 1
            ].confirmPrice *
              1
              ? value * 1 +
                dataSource[record.dataSourceIndex].answerVOList[
                  dataSource[record.dataSourceIndex].answerVOList.length - 1
                ].confirmPrice *
                  1
              : 0;
              // 计算HKD值
              dataSource[record.dataSourceIndex].answerVOList[
                dataSource[record.dataSourceIndex].answerVOList.length - 1
              ].referencePriceHkd = dataSource[record.dataSourceIndex].answerVOList[
                dataSource[record.dataSourceIndex].answerVOList.length - 1
              ].confirmPrice * HkdVal
        } else {
          if (item.confirmPrice) {
            dataSource[record.dataSourceIndex].answerVOList[
              dataSource[record.dataSourceIndex].answerVOList.length - 1
            ].confirmPrice =
              item.confirmPrice * 1 +
              dataSource[record.dataSourceIndex].answerVOList[
                dataSource[record.dataSourceIndex].answerVOList.length - 1
              ].confirmPrice *
                1
                ? item.confirmPrice * 1 +
                  dataSource[record.dataSourceIndex].answerVOList[
                    dataSource[record.dataSourceIndex].answerVOList.length - 1
                  ].confirmPrice *
                    1
                : 0;
                // 计算HKD值
                dataSource[record.dataSourceIndex].answerVOList[
                  dataSource[record.dataSourceIndex].answerVOList.length - 1
                ].referencePriceHkd = dataSource[record.dataSourceIndex].answerVOList[
                  dataSource[record.dataSourceIndex].answerVOList.length - 1
                ].confirmPrice * HkdVal
          }
        }
      }
    });

    dispatch({
      type: 'pricingModels/updateState',
      payload: {
        pricingSingleDataSource: dataSource,
      },
    });
  }

  render() {
    const {
      pagination = {},
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      poHeaderMilestonesInfo: { milestoneState },
      timeFlag,
      submitFlag,
      dataSource,
      confirmPriceFlag,
      editConfirmPriceFlag = false,
      onEditConfirmPrice = (e) => e,
    } = this.props;
    let newDataSource = [];
    if (dataSource) {
      dataSource.map((e, j) => {
        e.answerVOList.map((i, k) => {
          newDataSource = [
            ...newDataSource,
            {
              ...i,
              dataSourceIndex: j,
              supplierName: e.supplierName,
              userId: e.userId,
              eIndex: k,
              fileDTOList: e.fileDTOList,
              _status: 'update',
            },
          ];
        });
      });
    }

    const getRowSpans = (arr, key) => {
      let sameValueLength = 0;

      const rowSpans = [];

      for (let i = arr.length - 1; i >= 0; i--) {
        if (i === 0) {
          rowSpans[i] = sameValueLength + 1;

          continue;
        }

        if (arr[i][key] === arr[i - 1][key]) {
          rowSpans[i] = 0;

          sameValueLength++;
        } else {
          rowSpans[i] = sameValueLength + 1;

          sameValueLength = 0;
        }
      }

      return rowSpans;
    };
    const rowSpans = getRowSpans(newDataSource, 'userId');
    const columns = [
      {
        title: intl.get('bid.bidcommon.view.title.suppliername').d('供应商名称'),
        dataIndex: 'supplierName',
        fixed: 'left',
        width: 180,
        render: (value, _, index) => {
          const obj = {
            children: value,

            props: {},
          };

          obj.props.rowSpan = rowSpans[index];

          return obj;
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.attachment').d('附件'),
        dataIndex: 'fileDTOList',
        width: 180,
        render: (value, record, index) => {
          const obj = {
            children: (
              <UploadFile
                onUploadSuccess={(item) => onUploadSuccess(item, record)}
                onDeleteSuccess={() => onDeleteSuccess(record)}
                tableName="SPUC_PO_CON_ATTACH"
                parentId={record.qaId}
                value={value}
                disabled
              />
            ),

            props: {},
          };

          obj.props.rowSpan = rowSpans[index];

          return obj;
        },
      },
      // ...(newcaseDetail1[0]).map((e, index) => {
      //     console.log('e1111111', e)
      //     return {
      //         key: `${index}`,
      //         title: `${e.name}`,
      //         dataIndex: `${e[index]}`,
      //         // render: () => {
      //         //     return (
      //         //         <span>{e.qaContent1}</span>
      //         //     )
      //         // },
      //     }
      // })
      // {
      //   title: '附件',
      //   dataIndex: 'enclosure',
      //   width: 180,
      //   render: (value, record, index) => {
      //       return (
      //           <UploadEdit
      //       bucketName="private-bucket"
      //       attachmentUUID={value}
      //       tenantId={tenantId}
      //       btnText="查看附件"
      //       viewOnly
      //       filePreview
      //       />
      //       )
      //   }
      // },
      // {

      //       //  title: '采购内容',
      //       //  dataIndex: 'qaContent1',
      //       //  width: 180,
      //       //  render: (value, record, index) => {
      //       //     const qaContent1 = newcaseDetail1[0].map((e) => {
      //       //         return e.qaContent1
      //       //     })
      //       //     return (
      //       //         <span>{qaContent1[index]}</span>
      //       //     )
      //       //  }
      //      },
      // {
      //   title: '附件',
      //   // dataIndex: 'enclosure',
      //   width: 180,
      //   render: (value, record, index) => {
      //       if(row.count) {
      //           return (
      //             <a>
      //               {record.priceViewDTOList.enclosure}
      //             </a>

      //           )
      //       }else{
      //         return {
      //           children: value,
      //           props: {
      //             colSpan: 6,
      //           },
      //         };
      //       }

      //   }
      // },
      {
        title: intl.get('bid.bidcommon.view.title.purchaseitems').d('采购内容'),
        dataIndex: 'purchaseContent',
        width: 180,
        render: (val, row) => {
          if (row.isSum) {
            return {
              children: intl
                .get('bid.bidcommon.view.title.totalpricequotedbythesupplier')
                .d('供应商报价总价'),
              props: {
                colSpan: 5,
              },
            };
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        dataIndex: 'serviceContent',
        width: 180,
        render: (val, row) => {
          if (row.count) {
            return val;
          } else {
            return {
              children: val,
              props: {
                colSpan: 0,
              },
            };
          }
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.quotecurrency').d('报价货币（原币）'),
        dataIndex: 'priceCurrency',
        width: 100,
        render: (val, row) => {
          if (row.count) {
            return val;
          } else {
            return {
              children: val,
              props: {
                colSpan: 0,
              },
            };
          }
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.quantity').d('数量'),
        dataIndex: 'count',
        width: 100,
        render: (val, row) => {
          if (row.count) {
            return val;
          } else {
            return {
              children: val,
              props: {
                colSpan: 0,
              },
            };
          }
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.unit').d('计量单位'),
        dataIndex: 'unit',
        width: 100,
        render: (val, row) => {
          if (row.count) {
            return val;
          } else {
            return {
              children: val,
              props: {
                colSpan: 0,
              },
            };
          }
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.unitpriceexcludingtax').d('不含税单价'),
        dataIndex: 'afterTaxPerPrice',
        width: 180,
        render: (_, record) => {
          return <div>{numberRender(record.afterTaxPerPrice, 2)}</div>;
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.subtotalexcludingtax').d('不含税小计'),
        dataIndex: 'afterTaxPrice',
        width: 180,
        render: (_, record) => {
          return <div>{numberRender(record.afterTaxPrice, 2)}</div>;
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.subtotaltaxincluded').d('小计税额'),
        dataIndex: 'tax',
        width: 180,
        render: (_, record) => {
          return <div>{numberRender(record.tax, 2)}</div>;
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.subtotalincludingtax').d('含税小计'),
        dataIndex: 'preTax',
        width: 180,
        render: (_, record) => {
          return <div>{numberRender(record.preTax, 2)}</div>;
        },
      },
      {
        title: intl
          .get('bid.bidcommon.view.title.thepurchaserconfirmsandreviewsthequotation')
          .d('采购员确认评审报价'),
        dataIndex: 'confirmPrice',
        width: 180,
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`${record.dataSourceIndex}${record.eIndex}`, {
                initialValue: val,
              })(
                <InputNumber
                  disabled={
                    timeFlag || submitFlag && !editConfirmPriceFlag || record.isSum === 'y' || !record.proPriceConfigAnswerId
                  }
                  onChange={(value) => {
                    this.confirmPriceChange(value, record);
                  }}
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.hkdreference').d('HKD（参考）'),
        dataIndex: 'referencePriceHkd',
        width: 180,
        render: (_, record) => {
          return <div>{numberRender(record.referencePriceHkd, 2)}</div>;
        },
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
            onClick={() => this.onSave(newDataSource)}
            loading={saveLoading}
            disabled={loading || submitFlag && !editConfirmPriceFlag || timeFlag}
          >
            <img src={saveIcon} alt="" style={{ width: '15px' }} />
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            onClick={() => this.onConfirmPrice(newDataSource)}
            disabled={ submitFlag && !editConfirmPriceFlag || timeFlag || !confirmPriceFlag && timeFlag}
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
          rowKey="singleQaId"
          dataSource={newDataSource}
          pagination={false}
          // onChange={this.handlePageChange}
          columns={columns}
          loading={fetchLoading}
          //  onDataChange={this.handleDataChange}
          scroll={{x: tableScrollWidth(columns), y: 360 }}
          rowClassName={(record) => {
            return record.isSum === 'y' ? 'bg-color' : 'normal-color'
          }}
        />
      </div>
    );
  }
}
