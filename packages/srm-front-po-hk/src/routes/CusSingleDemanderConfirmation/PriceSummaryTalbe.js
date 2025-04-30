/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-05-30 14:13:20
 * Copyright (c) 2024, All Rights Reserved. 
 */

import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth, getCurrentLanguage, getEditTableData } from 'utils/utils';
import { Input } from 'antd';
import { Form } from 'hzero-ui';
import { isEmpty, uniqBy } from 'lodash';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusLov from '_cus_components/CusLov';
import CusNotification from '_cus_components/CusNotification';
import CusButton from '_cus_components/CusButton';
import { tooltipRender } from '_cus_utils/render';
import searchIcon from '@/assets/searchIcon.svg';
import styles from './index.less';
import MaterialList from './materialList';

const promptCode = 'HKPC.commom';

export default class PriceSummaryTalbe extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      materialModel: false,
    };
  }

  // 打开物料弹窗
  @Bind
  onSearchBtnClick = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'singlePurchaseApplicationCusModel/getMatList',
      payload: {
        refSupId: record.refSupId,
        refHeadId: record.refHeadId,
        rounds: record.rounds,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const newDataSource = content?.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuid()
        }));
        const initialSelectedRowKeys = newDataSource
        .filter((item) => item.isSelected === 'Y')
        .map((item) => item.poOrderId);
        this.setState({
          materialModel: true,
          materialDataSource: newDataSource,
          lineRecord: record,
          selectedRowKeys: initialSelectedRowKeys,
          selectedRows: newDataSource.filter((item) => item.isSelected === 'Y'),
        });
      }
    });
  };

  // 物料名称弹框确认
  @Bind()
  handleSaveMaterial() {
    const { dispatch, prThirdHeadId, onQuery = (e) => e } = this.props;
    const {
      selectedRowKeys = [],
      selectedRows = [],
      lineRecord = {},
    } = this.state;
    const params = getEditTableData(selectedRows, ['orderQuantity', 'unitPrice', 'warrantyPeriod']);
    if(selectedRowKeys.length > 0) {
      if (params.length > 0) {
        dispatch({
          type: `singlePurchaseApplicationCusModel/priceSummaryMatSave`,
          payload: [
            {
              refSupId: lineRecord.refSupId,
              refHeadId: prThirdHeadId,
              rounds: lineRecord.rounds,
              prThirdQuoteSettingList: params.map((item) => ({
                ...item,
                refQuoteTolId: lineRecord.id
              }))
            }
          ]
        }).then((res) => {
          if(res) {
            this.handlePriceSummarySave((result) => {
              if(result) {
                this.setState({
                  materialModel: false,
                }, () => {
                  onQuery();
                });
              }
            });
          }
        })
      } else {
        CusNotification.error({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get('hzero.common.view.title.submitprompt').d('有必填字段未填写，请检查表单数据'),
          }),
        });
      }
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
    }

  }

  // 价格汇总表保存
  @Bind()
  handlePriceSummarySave(cb = (e) => e) {
    const { dispatch, singlePurchaseApplicationCusModel } = this.props;
    // const { lineRecord } = this.state;
    const { priceSummaryList } = singlePurchaseApplicationCusModel;
    const params = priceSummaryList.map((item) => ({
      refHeadId: item.refHeadId,
      refSupId: item.refSupId,
      rounds: item.rounds,
      supName: item.supName,
      name: item.name,
      supplierNum: item.supplierNum,
      id: item.id
    }));
    dispatch({
      type: 'singlePurchaseApplicationCusModel/priceSummarySave',
      payload: params,
    }).then((res) => {
      if(res) {
        cb(res);
      }
    })
  }

  // 物料弹窗取消
  @Bind()
  handleMaterialCancel() {
    this.setState({
      materialModel: false,
    });
  }

  render() {
    const {
      singlePurchaseApplicationCusModel,
      state,
      isEdit,
      isFinancialApproval = true,
    } = this.props;

    const {
      priceSummaryList,
    } = singlePurchaseApplicationCusModel;

    const {
      materialModel,
      materialDataSource = [],
      selectedRowKeys,
    } = this.state;

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
        disabled: isEdit || record.isQuote === 'N', // 选择框的是否可选
      }),
    };

    const materialProps = {
      dataSource: materialDataSource,
      rowSelection,
      isEdit,
      ...this.props,
    };

    const columns = [
      isFinancialApproval && {
        dataIndex: 'supName',
        key: 'supName',
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        width: 225,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.ChooseSupplier`).d('选择供应商'),
        dataIndex: 'name',
        key: 'name',
        width: 200,
        required: isFinancialApproval,
        render: (val, record) => {
          return isEdit ? (
            <>
              {tooltipRender(record.name)}
            </>
          )
          :
          (
            <Form.Item>
              {record.$form.getFieldDecorator(`companyName`, {
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
                      // 过滤supplierNum等于空的数据
                      const filterList = priceSummaryList.filter(item => item.supplierNum);
                      // 检测 supplierNum 是否重复
                      const isSupplierNum = (list, supplierNum) => {
                      // 使用 uniqBy 函数基于 supplierNum 属性移除重复项
                      const uniqueNames = uniqBy(list, supplierNum);

                      // 如果去重后的数组长度小于原数组长度，说明有重复项
                      return uniqueNames.length !== filterList.length;
                      };
                      if(isSupplierNum(filterList, 'supplierNum')) {
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
                  code="CMHK.QUALIFIED_SUPPLIER"
                  lovOptions={{ valueField: 'supplierNumber', displayField: 'companyNameCh' }}
                  textValue={record.name}
                  onChange={(_, item) => {
                    record.supplierNum = item.supplierNumber;
                    record.name = item.companyNameCh;
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        dataIndex: 'priceOriginak',
        key: 'priceOriginak',
        title: intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）'),
        width: 225,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        dataIndex: 'currency',
        key: 'currency',
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'priceHkd',
        key: 'priceHkd',
        title: intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）'),
        width: 225,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'materialName',
        width: 200,
        required: isFinancialApproval,
        render: (_, record) => {
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
                  suffix={
                    <>
                      <div className="cus-lov-clear" />
                      <div onClick={() => !(isEmpty(record.name)) && this.onSearchBtnClick(record)}>
                        <img
                          src={searchIcon}
                          alt="searchIcon"
                          style={{ cursor: 'pointer', color: '#666' }}
                        />
                      </div>
                    </>
                  }
                  className={styles['lov-input']}
                  value={record?.materialName ? record?.materialName : null}
                  style={{ cursor: 'pointer', color: '#666' }}
                  onClick={() => {
                    this.onSearchBtnClick(record);
                  }}
                  disabled={isEmpty(record.name)}
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
    ].filter(Boolean);

    const tableProps = {
      dataSource: priceSummaryList,
      columns,
      rowKey: 'rowKey',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return (
      <>
        <EditTable {...tableProps} />
        <CusModal
          title={intl.get(`${promptCode}.view.title.materialname`).d('物料名称')}
          visible={materialModel}
          width={1000}
          destroyOnClose={true}
          onCancel={this.handleMaterialCancel}
          footer={
            <>
              {!isEdit && <div>
                <CusButton
                  onClick={() => {
                    this.handleMaterialCancel();
                  }}
                >
                  {intl.get(`hzero.common.cusModal.button.cancel`).d('取消')}
                </CusButton>
                <CusButton
                  onClick={() => {
                    this.handleSaveMaterial();
                  }}
                  type="primary"
                >
                  {intl.get(`hzero.common.cusModal.button.confirm`).d('确认')}
                </CusButton>
              </div>}
              {isEdit && <CusButton
                  onClick={() => {
                    this.setState({
                      materialModel: false
                    })
                  }}
                >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>}
            </>
          }
        >
          <MaterialList {...materialProps} />
        </CusModal>
      </>
    )
  }
}
