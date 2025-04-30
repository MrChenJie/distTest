/**
 * Table - 期间新增结果展示
 * @date: 2023-9-12
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth, getCurrentLanguage, getEditTableData } from 'utils/utils';
import { Input } from 'antd';
// import { routerRedux } from 'dva/router';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
import { isEmpty, uniqBy } from 'lodash';
import CusModal from '_cus_components/CusModal';
// import querystring from 'querystring';
import { numberRender, dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import CusNotification from '_cus_components/CusNotification';
import Modal from './Modal';
import { Form } from 'hzero-ui';
import { createPagination } from 'hzero-front/lib/utils/utils';
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';
const promptCode = 'HKPC.commom';
import MaterialList from './materialList';
import searchIcon from '@/assets/searchIcon.svg';
import styles from './index.less';
import CusLov from '_cus_components/CusLov';

@formatterCollections({
  code: [promptCode],
})
export default class PriceSummaryTalbe extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 打开物料弹窗
  @Bind
  onSearchBtnClick = (record) => {
    const { dispatch, singlePurchaseApplicationModel, state } = this.props;
    const { priceSummaryList = [] } = singlePurchaseApplicationModel;
    // 如果有物料信息，就不调物料查询接口了，直接拿原有数据；
    if (record.prThirdQuoteSettingList) {
      console.log(record.prThirdQuoteSettingList);
      // const initialSelectedRowKeys = record.prThirdQuoteSettingList.filter(item => item.orderQuantity).map(item => item.settingId);
      record.prThirdQuoteSettingList.map((i) => {
        priceSummaryList
          .filter((n) => n.prThirdQuoteSettingList)
          .map((k) => {
            k.prThirdQuoteSettingList.map((l) => {
              if (i.settingId === l.settingId) {
                i.availableQuantity -= l.orderQuantity;
              }
            });
          });
        return i;
      });
      this.setState({
        materialModel: true,
        materialDataSource: record.prThirdQuoteSettingList,
        lineRecord: record,
        selectedRowKeys: record.selectedRowKeys,
        selectedRows: record.selectedRows,
        // materialPagination: record.materialPagination,
      });
    } else {
      // const url = state === 'DONE' || state === 'REVOKE' || state === 'SENT' ? 'singlePurchaseApplicationModel/getMatList' : 'singlePurchaseApplicationModel/getMatListBefore';
      dispatch({
        type: 'singlePurchaseApplicationModel/getMatList',
        payload: {
          refSupId: record.refSupId,
          refHeadId: record.refHeadId,
          rounds: record.rounds,
        },
      }).then((res) => {
        if (res) {
          const { content = [] } = res;
          const pagination = createPagination(res);
          const newDataSource = content?.map((item) => ({
            ...item,
            availableQuantity: parseInt(item.quantity),
            _status: 'update',
          }));
          const initialSelectedRowKeys = newDataSource
          .filter((item) => item.orderQuantity)
          .map((item) => item.settingId);
          newDataSource.map((i) => {
            priceSummaryList
              .filter((n) => n.prThirdQuoteSettingList)
              .map((k) => {
                k.prThirdQuoteSettingList.map((l) => {
                  if (i.settingId === l.settingId) {
                    i.availableQuantity -= l.orderQuantity;
                  }
                });
              });
            return i;
          });
          this.setState({
            materialModel: true,
            materialDataSource: newDataSource,
            lineRecord: record,
            selectedRowKeys: initialSelectedRowKeys,
            selectedRows: newDataSource.filter((item) => item.orderQuantity),
            // materialPagination: pagination,
          });
        }
      });
    }
  };

  // 物料名称弹框确认
  @Bind()
  handleSaveMaterial() {
    const { dispatch, form, singlePurchaseApplicationModel } = this.props;
    const {
      selectedRowKeys = [],
      selectedRows = [],
      materialDataSource = [],
      lineRecord = [],
    } = this.state;
    const { priceSummaryList = [] } = singlePurchaseApplicationModel;
    if (selectedRowKeys.length > 0) {
      const params = getEditTableData(selectedRows, ['orderQuantity']);
      if (isEmpty(params)) {
        CusNotification.error({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get('HKPC.commom.view.title.OrderQuantity').d('下单数量'),
          }),
        });
        return;
      }
      let materialName = '';
      if (selectedRows.length > 1) {
        selectedRows.map((item) => {
          materialName += isEmpty(materialName) ? item.matName : ',' + item.matName;
        });
      } else {
        materialName = selectedRows[0].matName;
      }
      let selectedAmount = 0;
      const newmMaterialDataSource = materialDataSource.map((i) => {
        if (i.orderQuantity) {
          selectedAmount += parseInt(i.orderQuantity) * parseFloat(i.unitPrice);
        }
        return {
          ...i,
          availableQuantity: parseInt(i.quantity),
        };
      });

      const newPriceSummaryList = priceSummaryList.map((item) => {
        if (item.id === lineRecord.id) {
          lineRecord.$form.setFieldsValue({
            materialName: materialName
          })
          return {
            ...item,
            materialName,
            selectedAmount: selectedAmount.toString(),
            prThirdQuoteSettingList: newmMaterialDataSource,
            selectedRowKeys,
            selectedRows,
          };
        } else {
          return {
            ...item,
          };
        }
      });
      dispatch({
        type: `singlePurchaseApplicationModel/updateState`,
        payload: {
          priceSummaryList: newPriceSummaryList,
        },
      });
      this.setState({
        materialModel: false,
      });
      // dispatch({
      //   type: 'contractBidWinningResult/saveMaterial',
      //   payload: {
      //     selectedRows
      //   }
      // }).then((res) => {
      //   if (res) {
      //     this.handleSaveOnlyResult((valList) => {
      //       if (valList.length > 0) {
      //         this.setState({
      //           materialModel: false
      //         })
      //         this.getTableInfo();
      //       }
      //     })
      //   }
      // })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
    }
  }

  // 物料弹窗取消
  @Bind()
  handleMaterialCancel() {
    this.setState({
      materialModel: false,
    });
  }

  searchButton = () => {
    return <img src={searchIcon} alt="searchIcon" style={{ cursor: 'pointer', color: '#666' }} />;
  };

  render() {
    const { singlePurchaseApplicationModel, state, form } = this.props;
    const { getFieldDecorator } = form;
    const {
      materialModel,
      materialDataSource = [],
      // materialPagination = {},
      selectedRowKeys,
    } = this.state;

    const { priceSummaryList } = singlePurchaseApplicationModel;

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
        disabled:
          state === 'DONE' || state === 'REVOKE' || state === 'SENT' || record.isQuote === 'N', // 选择框的是否可选
      }),
    };

    const materialProps = {
      dataSource: materialDataSource,
      // pagination: materialPagination,
      rowSelection,
      ...this.props,
    };

    const suffix = (
      <>
        <div className="cus-lov-clear" />
        {this.searchButton()}
      </>
    );

    const columns = [
      {
        dataIndex: 'supName',
        key: 'supName',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称')),
        width: 225,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.ChooseSupplier`).d('选择供应商'),
        dataIndex: 'name',
        key: 'name',
        width: 200,
        required: true,
        render: (val, record) => {
          return state !== 'DONE' && state !== 'REVOKE' && state !== 'SENT' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`name`, {
                initialValue: record.name,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.ChooseSupplier`).d('选择供应商'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      // 检测 supplierNum 是否重复
                      const isSupplierNum = (priceSummaryList, supplierNum) => {
                      // 使用 uniqBy 函数基于 supplierNum 属性移除重复项
                      const uniqueNames = uniqBy(priceSummaryList, supplierNum);

                      // 如果去重后的数组长度小于原数组长度，说明有重复项
                      return uniqueNames.length !== priceSummaryList.length;
                      };
                      if(isSupplierNum(priceSummaryList, 'supplierNum')) {
                        callback(
                          new Error(
                            intl
                              .get('HKPC.commom.bid.messaget.checkduplicatesup')
                              .d('请勿选择重复供应商')
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  }
                ],
              })(
                <CusLov
                  code="HKSP.SUPPLIER"
                  lovOptions={{ valueField: 'supplierNumber', displayField: 'companyNameCh' }}
                  textValue={record.name}
                  // onChange={(value, lovRecord) => this.supplierNameOnChange(value, lovRecord, record)}
                  onChange={(text, item) => {
                    record.supplierNum = item.supplierNumber;
                    // record.refSupId = item.id;
                    record.name = item.companyNameCh;
                    // record.supName = item.companyNameCh
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <>{record.name}</>
          );
        },
      },
      {
        dataIndex: 'priceOriginak',
        key: 'priceOriginak',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）')
        ),
        width: 225,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        dataIndex: 'currency',
        key: 'currency',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币')),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'priceHkd',
        key: 'priceHkd',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）')
        ),
        width: 225,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'materialName',
        width: 200,
        required: true,
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`materialName`, {
                initialValue: record.materialName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
                    }),
                  },
                ],
              })(
                <Input
                  readOnly
                  // suffix={suffix}
                  suffix={
                    <>
                      <div className="cus-lov-clear" />
                      <div onClick={() => this.onSearchBtnClick(record)}>
                        <img
                          src={searchIcon}
                          alt="searchIcon"
                          style={{ cursor: 'pointer', color: '#666' }}
                        />
                      </div>
                    </>
                  }
                  className={styles['lov-input2']}
                  value={record?.materialName ? record?.materialName : null}
                  style={{ cursor: 'pointer', color: '#666' }}
                  onClick={() => {
                    this.onSearchBtnClick(record);
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.Selectedamount`).d('中选金额')),
        dataIndex: 'selectedAmount',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
    ];

    const tableProps = {
      dataSource: priceSummaryList,
      columns,
      rowKey: 'rowKey',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return (
      <React.Fragment>
        <EditTable {...tableProps} />
        <CusModal
          title={intl.get(`${promptCode}.view.title.materialname`).d('物料名称')}
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
