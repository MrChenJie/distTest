/*
 * ui 修改
 * @date: 2023-08-07
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
// ps：保存注释通contractmidlleNew 不做额外注释

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Button } from 'antd';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { isFunction, uniqWith, every } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import request from 'utils/request';
import notification from '_cus_components/CusNotification';
import ImportModal from '_cus_components/CusModal/ImportModal';
import CusRequest from '_cus_utils/request';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';
import {
  getCurrentOrganizationId,
  createPagination,
  addItemToPagination,
  getEditTableData,
  delItemsToPagination,
} from 'hzero-front/lib/utils/utils';
import { SRM_BID } from '@/common/config';
import QuotationAllList from './quotationAll';
import eventBus from '@/routes/components/ev';
import dayjs from 'dayjs';

const commonPrompt = 'srsp.nrcEstimate';
const organizationId = getCurrentOrganizationId();
/**
 * ContractHeader - 报价表头信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@connect(({ loading, contractMaintain = {} }) => ({
  fetchLoading: loading.effects['contractMaintain/quotationList'],
  saveLoading: loading.effects['contractMaintain/saveQuotation'],
  deleteLoading: loading.effects['contractMaintain/deleteQuotation'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'spcm.purchaseRequisitionCreation',
    'spcm.common',
    'entity.supplier',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'hzero.common',
  ],
})
@Form.create({ fieldNameProp: null })
export default class QuotationTable extends Component {
  constructor(props) {
    super(props);
    const { getDetailList = {} } = this.props;
    this.state = {
      signFlag: false,
      visible: false,
      messageVisible: false,
      oldProId: null,
      selectedRows: [],
      selectedRowKeys: [],
      typeModeCode: getDetailList.priceType ? getDetailList.priceType : 'unitPrice',
      // typeModeCode: '',
      priceFlag: false,
      groupUnsaveFlag: false,
      quotationData: [], // 报价表本地数据源
      productVisible: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    this.quotationList(); // 查询数据
    eventBus.on('handleSaveQuotation', this.handleSaveQuotation)
  }

  componentWillUnmount() {
    eventBus.off('handleSaveQuotation', this.handleSaveQuotation)
  }

  /**
   * quotationList - 查询数据
   */
  @Bind()
  @Debounce(200)
  quotationList(page = {}) {
    const { dispatch, matchs } = this.props;
    const { proId } = matchs.params;
    if(proId) {
      this.setState({oldProId : proId})
      dispatch({
            type: 'contractMaintain/quotationList',
            payload: {
              page,
              proId: proId,
            },
          }).then((res) => {
            if (res) {
              const { content = [] } = res;
              // const pagination = createPagination(res);
              const newDataSource = content.map((item) => ({
                ...item,
                _status: 'update',
                poOrderId: uuidv4(),
              }));
              this.setState({
                groupUnsaveFlag: false,
                quotationData: [...newDataSource]
              });
              dispatch({
                type: 'contractMaintain/updateState',
                payload: {
                  quotationSource: newDataSource,
                  quotationPagination: createPagination(res),
                },
              });
              console.log(newDataSource,'newDataSource')
              if (newDataSource.length == 0) this.props.onChangeTabsFlag()
            }
          });
    } else {
      this.setState({
        groupUnsaveFlag: false,
        quotationData: []
      });
      dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          quotationSource: [],
          quotationPagination: createPagination([]),
        },
      });
      this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
    }
  }

  @Bind
  handleChangeFormItem(val) {
    this.setState({ typeModeCode: val, quotationData: [] });
    const { dispatch, matchs } = this.props
    const { proId } = matchs.params;
    if(!proId) {
      return;
    }
    dispatch({
      type: 'contractMaintain/priceListDeleteAll',
      payload: {
        proId: proId,
      },
    });
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        quotationSource: [],
        quotationPagination: createPagination([]),
      },
    });
  }

  @Bind
  handleOk() {
    const { priceEntry, upload } = this.state;
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面;
    if (upload) {
      openTab({
        title: intl.get(`${promptCode}.entry.input.title`).d('价格数据录入'),
        key: `${isPub ? '/pub' : ''}${SRM_BID}/price-entry/detail/${priceEntry.priceGroupId}`,
        path: `${isPub ? '/pub' : ''}${SRM_BID}/price-entry/detail/${priceEntry.priceGroupId}`,
        icon: 'edit',
        closable: true,
      });
    }
    this.setState({
      messageVisible: false,
      visible: false,
      message: '',
      priceFileList: [],
      upload: false,
    });
  }

  @Bind
  handleCancel() {
    this.setState({
      visible: false,
      messageVisible: false,
      priceFileList: [],
      message: '',
    });
  }

  /**
   * 供应商Lov修改回调
   * @param {*} value
   * @param {*} record
   */
  @Bind()
  handleChangeSupplier(value, record) {
    const { dataSource, onChangeHeader } = this.props;
    const { supplierTenantId, supplierCompanyCode, supplierCompanyName, supplierCurrencyCode } =
      record;
    this.handleChangeFormItem();
    onChangeHeader({
      ...dataSource,
      supplierTenantId,
      supplierCompanyName,
      supplierCompanyNum: supplierCompanyCode,
      supplierCurrencyCode,
    });
  }

  /**
   * 校验显示的默认值
   */
  @Bind()
  handleExpUnitChange(value, record) {
    const { handleExpenseUnitChange = (e) => e } = this.props;
    this.handleChangeFormItem();
    handleExpenseUnitChange(value, record);
  }

  // 删除
  @Bind
  handleDelete() {
    const { selectedRows } = this.state;
    const {
      contractMaintain: { quotationSource, pagination },
      dispatch,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.proPriceConfigId);
    if (selectedRowKeys.length > 0) {
      CusModal.confirm({
        content: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
        okType: 'normal',
        onOk: () => {
          dispatch({
            type: 'contractMaintain/deleteQuotationTableList',
            payload: [...selectedRows], // poHeaders
          }).then((res) => {
            if (res) {
              this.setState({ selectedRows: [] });
              notification.success();
              this.quotationList();
            }
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  @Bind
  handleAddQuotationLine() {
    const { contractMaintain, dispatch, matchs, erpAllInfo, getDetailList } = this.props;
    const { proId } = matchs.params;
    const { quotationSource = [], quotationPagination = {} } = contractMaintain;
    const { typeModeCode, quotationData } = this.state;
    const { projectType } = erpAllInfo;
    const newLine = {
      _status: 'create',
      priceType: typeModeCode,
      proId: proId, // 项目ID
      poOrderId: uuidv4(),
      budgetType: projectType == '2' ? 'INVENTORY' : '',
      priceCurrency: projectType == '2' ? 'HKD' : getDetailList.talCurrencyType,
    };
    const newDataSource = [...this.state.quotationData, newLine];
    const newPagination = addItemToPagination(quotationData.length, quotationPagination);
    console.log('newDataSource', newDataSource);
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        quotationSource: newDataSource,
        quotationPagination: newPagination,
      },
    });
    this.props.isTrue()
    this.setState({ groupUnsaveFlag: true, quotationData: [...newDataSource] })
  }

  @Bind
  handleAddMatLine(itemList) {
    const { contractMaintain, dispatch, matchs } = this.props;
    const { proId } = matchs.params;
    const { quotationSource = [], quotationPagination = {} } = contractMaintain;
    const { typeModeCode, quotationData } = this.state;
    const newLine = itemList ? itemList.map((item) => ({
      // ...item,
      _status: 'create',
      priceType: typeModeCode,
      proId: proId, // 项目ID
      poOrderId: uuidv4(),
      purchaseContent: item?.matName,
      matNumber: item?.matNumber,
      priceCurrency: item?.currency,
      serviceContent: item?.matType,
      count: item?.qty,
      unit: item?.unit,
      deliverAddress: item?.deliverAddress,
      deliverContact: item?.deliverContact,
      deliverAddressBakup: item?.deliverAddressBakup,
      deliverDate: dayjs(new Date(item?.deliverDate)),
      deliveryPhoneNumber: item?.deliveryPhoneNumber,
      deliveryAddressRemarks: item?.deliveryAddressRemarks,
      deliveryContactCode: item?.deliveryContactCode,
      purchasingCategoryMeaning: item?.meaning,
      purchasingCategory: item?.purchasingCategory,
      budgetType: item?.budgetType,
      budgetItemNumber: item.budgetItemNumber, // 预算项目编号
      businessActivitiesCode: item.businessActivitiesCode, // 业务活动code
      businessActivitiesName: item.businessActivitiesName, // 业务活动名称
      costCenterCode: item.costCenterCode, // 成本中心code
      costCenterName: item.costCenterName, // 成本中心名称
    }))
    : [];
    const newDataSource = [...this.state.quotationData, ...newLine];
    const newPagination = addItemToPagination(quotationData.length, quotationPagination);
    console.log('newDataSource', newDataSource);
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        quotationSource: newDataSource,
        quotationPagination: newPagination,
      },
    });
    this.props.isTrue()
    this.setState({ groupUnsaveFlag: true, quotationData: [...newDataSource] })
  }

  @Bind
  handleImportData(val) {
    const { contractMaintain, dispatch, matchs } = this.props;
    const { proId } = matchs.params;
    const { quotationSource = [], quotationPagination = {} } = contractMaintain;
    const { typeModeCode } = this.state;
    request(
      `${SRM_BID}/v1/${organizationId}/import/data?templateCode=${val.templateCode}&batch=${val.batch}&size=500`,
      {
        method: 'GET',
      }
    ).then((res) => {
      if (res.content) {
        let newData = [];
        if (res.content.length > 0) {
          res.content.map((item) => {
            const _obj = JSON.parse(item._data);
            const newLine = {
              _status: 'create',
              priceType: typeModeCode,
              proId: proId, // 项目ID
              poOrderId: uuidv4(),
              unitMeaning:_obj.unit,
              isImport: 'y'
            };
            const newObj = Object.assign(_obj, newLine);
            newData.push(newObj);
          });
          if (typeModeCode === 'totalPrice' && res.content.length > 2) {
            notification.error({
              message: intl.get(`bid.bidcommon.view.message.leas1tdata`).d('总价模式只可导入一条数据'),
            })
          } else {
            if (newData.length > 50) {
              notification.error({ message: '单次导入不能超过50条，超出不做保存' })
              return;
            } else {
              const newDataSource = [...newData, ...quotationSource];
              // const newPagination = addItemToPagination(quotationSource.length, quotationPagination);
              dispatch({
                type: 'contractMaintain/updateState',
                payload: {
                  quotationSource: newDataSource,
                  // quotationPagination: newPagination,
                  quotationPagination: createPagination({
                    number: 0, 
                    size: newDataSource.length,
                    totalElements: newDataSource.length
                  }),
                },
              });
              this.setState({ quotationData: [...newDataSource] })
              this.handleSaveQuotation(this.props.matchs.params.proId);
            }
          }
        } else {
          setTimeout(()=>{ 
            this.handleImportDataTwo(params)},500)
          // notification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
        }
      }
    });
  }

  @Bind
  handleImportDataTwo(val) {
    const { contractMaintain, dispatch, matchs } = this.props;
    const { proId } = matchs.params;
    const { quotationSource = [], quotationPagination = {} } = contractMaintain;
    const { typeModeCode } = this.state;
    request(
      `${SRM_BID}/v1/${organizationId}/import/data?templateCode=${val.templateCode}&batch=${val.batch}&size=500`,
      {
        method: 'GET',
      }
    ).then((res) => {
      if (res.content) {
        let newData = [];
        if (res.content.length > 0) {
          res.content.map((item) => {
            const _obj = JSON.parse(item._data);
            const newLine = {
              _status: 'create',
              priceType: typeModeCode,
              proId: proId, // 项目ID
              poOrderId: uuidv4(),
              unitMeaning:_obj.unit,
              isImport: 'y'
            };
            const newObj = Object.assign(_obj, newLine);
            newData.push(newObj);
          });
          if (typeModeCode === 'totalPrice' && res.content.length > 2) {
            notification.error({
              message: intl.get(`bid.bidcommon.view.message.leas1tdata`).d('总价模式只可导入一条数据'),
            })
          } else {
            if (newData.length > 50) {
              notification.error({ message: '单次导入不能超过50条，超出不做保存' })
              return;
            } else {
              const newDataSource = [...newData, ...quotationSource];
              // const newPagination = addItemToPagination(quotationSource.length, quotationPagination);
              dispatch({
                type: 'contractMaintain/updateState',
                payload: {
                  quotationSource: newDataSource,
                  // quotationPagination: newPagination,
                  quotationPagination: createPagination({
                    number: 0, 
                    size: newDataSource.length,
                    totalElements: newDataSource.length
                  }),
                },
              });
              // notification.success({
              //   message: intl.get('bid.bidcommon.view.message.uploadsuccessfully').d('导入成功'),
              // });
              this.setState({ quotationData: [...newDataSource] })
              this.handleSaveQuotation(this.props.matchs.params.proId);
            }
          }
        } else {
          notification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
        }
      }
    });
  }


  @Bind
  @Debounce(500)
  handleSaveQuotation(id) {
    const { dispatch, contractMaintain, getDetailList, matchs, activeKey } = this.props;
    const { quotationSource = [] } = contractMaintain;
    const { quotationData, oldProId, typeModeCode } = this.state;
    const newList = getEditTableData(quotationData).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
          proId: matchs.params.proId,
          deliverDate: dayjs(item.deliverDate).format("YYYY-MM-DD HH:mm:ss")
        }
        : {
          ...item,
          deliverDate: dayjs(item.deliverDate).format("YYYY-MM-DD HH:mm:ss")
        }
    );
    let data = newList.sort();
    // const repeatDataSource = uniqWith(newList, (r1, r2) => r1.remarks === r2.remarks);
    // if(repeatDataSource.length !== data.length) {
    //   notification.error({
    //     message: intl.get('HKcommom').d('重复选择物料')
    //   });
    //   return;
    // }
    console.log('data123456789', data, getDetailList.talCurrencyType)
    const repeatDataSource = every(data, { priceCurrency: getDetailList.talCurrencyType });
    console.log('repeatDataSource', repeatDataSource)
    if(!repeatDataSource) {
      notification.error({
        message: intl.get(`HKPC.commom.view.title.PleasemainPR`).d('请与采购申请的报价币种保持一致') ,
      })
      return;
    }
    if (oldProId == null || oldProId === id) {
      if (!matchs.params.proId) {
        return
      }
      console.log('getDetailList', getDetailList, typeModeCode);
      if (typeModeCode == '') {
          notification.error({
            message: intl.get(`bid.bidcommon.view.message.Psqm`).d('请选择报价模式') ,
          })
          if (activeKey == 'quotationTable') eventBus.emit('callback', 'quotationTable', true)
        return
      }
      if (data.length > 0) {
        const newData = getDetailList;
        // console.log('123', newData);
        newData.priceType = this.state.typeModeCode;
        dispatch({
          type: 'contractMaintain/saveProject',
          payload: newData,
        });
        dispatch({
          type: 'contractMaintain/saveQuotation',
          payload: {
            data,
          },
        }).then((res) => {
          if (res.message === 'err') {
            notification.error({ message: intl.get('bid.bidcommon.view.title.Quotationcurrencymustbeconsistent').d('报价货币必须一致') })
            console.log('datas1');
            eventBus.emit('callback', 'quotationTable', true)
          } else {
            this.quotationList();
            this.props.isFalse()
            if (activeKey == 'quotationTable') {
              this.props.isFalse()
              notification.success({
              message: intl
                .get(`bid.bidcommon.view.title.savesuccessfully`)
                .d('保存成功'),
            });
            }
            // notification.success({
            //   message: intl
            //     .get(`bid.bidcommon.view.title.savesuccessfully`)
            //     .d('保存成功'),
            // });
            this.setState({
              priceFlag: true,
              groupUnsaveFlag: false
            });
          }
        });
      }
       else {
        notification.error({
          message: intl
            .get(`bid.bidcommon.view.message.pleasecheckitem`)
            .d('请检查必填项并保存!'),
        });
        if (activeKey == 'quotationTable') eventBus.emit('callback', 'quotationTable', true)
      }
    }
    
  }

  @Bind
  handleDeleteQuotationLine(selectedRowKeys, selectedRows, callback) {
    const { contractMaintain, dispatch } = this.props;
    const { quotationSource = [], quotationPagination = {} } = contractMaintain;
    const { quotationData } = this.state;
    const deleteData = selectedRows;
    if (deleteData.length > 0) {
      CusModal.confirm({
        content: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
        okType: 'normal',
        onOk: () => {
          let deleteNewDataList = [];
          for (let i in selectedRows) {
            if (selectedRows[i]._status === 'update') {
              selectedRows.map((item) => {
                quotationData.map((ite, j) => {
                  if (item.poOrderId === ite.poOrderId && item._status === 'update') {
                    deleteNewDataList.push(ite);
                    quotationData.splice(j, 1)
                  }
                })
              })
            } else {
              // 删除本地数据
              selectedRows.map((item) => {
                quotationData.map((ite, j) => {
                  if (item.poOrderId === ite.poOrderId && item._status === 'create') {
                    quotationData.splice(j, 1)
                  }
                })
              })
              this.setState({ selectedRows: [], selectedRowKeys: [] })
            }
          }
          if (deleteNewDataList.length > 0) {
            let data = deleteNewDataList;
            dispatch({
              type: 'contractMaintain/deleteQuotation',
              payload: {data},
            }).then(() => {
              this.quotationList();
            })
          }
          const newPagination = delItemsToPagination(
            selectedRows.length,
            quotationData.length,
            quotationPagination
          ); 
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              quotationSource: quotationData,
              quotationPagination: newPagination,
            },
          })
          this.setState({ quotationData: [...quotationData] })
          notification.success();
        },
      });
    } else {
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
    callback();
  }

  @Bind()
  importTemplate() {
    this.setState({
      productVisible: true,
    })
  }
  
  // 导入报价表(现在用的是这个导入方法)
  @Bind()
  payUpload = (payFileList = []) => {
    const { contractMaintain, dispatch, matchs, getDetailList } = this.props;
    const { proId } = matchs.params;
    const { quotationSource = [], quotationPagination = {} } = contractMaintain;
    const { typeModeCode, quotationData } = this.state;
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({
      importUploading: true,
    });
    CusRequest(`/cmhk-pr-center/v1/${organizationId}/pr-apply-materials/importMatExcelCheckBidding`, {
      method: 'POST',
      body: formData,
      responseType: 'text',
    }).then((res) => {
      if(res) {
        const response = JSON.parse(res);
        // let budgetPricesHkdTotal = 0;
        // response?.data?.map((item) => {
        //   console.log(item, 'item: ');
        //   budgetPricesHkdTotal += multiply(Number(item.qty) * Number(item?.matPriceHkd));
        // });
        const newLine = response?.data?.map((item) => ({
          ...item,
          poOrderId: uuidv4(),
          priceType: typeModeCode,
          proId: proId, // 项目ID
          _status: 'create',
          purchaseContent: item?.matName,
          matNumber: item?.matNumber,
          priceCurrency: getDetailList.talCurrencyType,
          serviceContent: item?.matType,
          count: item?.qty,
          unit: item?.unit,
          deliverAddress: item?.deliverAddress,
          deliverContact: item?.deliverContact,
          deliverAddressBakup: item?.deliverAddressBakup,
          deliverDate: dayjs(new Date(item?.deliverDate)),
          deliveryPhoneNumber: item?.deliveryPhoneNumber,
          deliveryAddressRemarks: item?.deliveryAddressRemarks,
          deliveryContactCode: item?.deliveryContactCode,
          purchasingCategoryMeaning: item?.purchasingCategoryMeaning,
          purchasingCategory: item?.purchasingCategory,
          budgetType: item?.budgetType,
          budgetItemNumber: item.budgetItemNumber, // 预算项目编号
          businessActivitiesCode: item.businessActivitiesCode, // 业务活动code
          businessActivitiesName: item.businessActivitiesName, // 业务活动名称
          costCenterCode: item.costCenterCode, // 成本中心code
          costCenterName: item.costCenterName, // 成本中心名称
        }));
        console.log('newLine', newLine);
        
        const newDataSource = [...this.state.quotationData, ...newLine];
        const newPagination = addItemToPagination(quotationData.length, quotationPagination);
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            quotationSource: newDataSource,
            quotationPagination: newPagination,
          },
        });
        this.props.isTrue()
        this.setState({
          importUploading: false,
          productVisible: false,
          groupUnsaveFlag: true,
          quotationData: newDataSource
        }, () => {
          if(response.msg){
            notification.error({
              message: response.msg,
            });
          }
        });
      }
    })
  }

  render() {
    const {
      contractMaintain: { quotationSource = [], quotationPagination = {}, detailEnumMap = {} },
      getDetailList = {},
      matchs,
      fetchLoading = false,
      saveLoading = false,
      deleteLoading = false,
      disabled,
      match,
      dispatch,
      erpAllInfo,
    } = this.props;

    const { priceFlag = false, typeModeCode, groupUnsaveFlag, quotationData, productVisible, importUploading } = this.state;

    const quotationAllProps = {
      disabled,
      dispatch,
      dataSource: quotationData, // quotationSource
      pagination: quotationPagination,
      priceFlag,
      getDetailList,
      matchs,
      match,
      detailEnumMap,
      fetchLoading: fetchLoading,
      saveLoading: saveLoading,
      deleteLoading: deleteLoading,
      unsaveFlag: groupUnsaveFlag,
      erpAllInfo,
      onAddLine: this.handleAddQuotationLine,
      onMatLine: this.handleAddMatLine,
      onDeleteLine: this.handleDeleteQuotationLine,
      onSave: this.handleSaveQuotation,
      onChangeFormItem: this.handleChangeFormItem,
      onPageChange: (page) => this.quotationList(page),
      onChangeTabsFlag:() => this.props.onChangeTabsFlag && this.props.onChangeTabsFlag(),
      onEdit: (flag) => {
        this.setState({
          groupUnsaveFlag: flag,
        });
      },
      onImportData: this.handleImportData,
      isTrue:()=>{
        this.props.isTrue()
      },
      getQuotationList: this.quotationList,
      importTemplate: this.importTemplate,
    };

    return (
      <>
        <Form>
          <CusModal
            title={intl.get('hzero.common.button.import.result').d('导入结果')}
            visible={this.state.messageVisible}
            footer={null}
            destroyOnClose
            width={300}
            style={{ top: 150 }}
            className={styles.priceEntry}
            onCancel={this.handleCancel}
            cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
          >
            <p
              style={{
                fontSize: '14px',
                marginTop: '10px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {this.state.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CusButton
                key="submit"
                type="primary"
                style={{ textAlign: 'center' }}
                onClick={this.handleOk}
              >
                {intl.get('bid.bidcommon.view.button.surequeren').d('确认')}
              </CusButton>
            </div>
          </CusModal>
        </Form>
        <QuotationAllList {...quotationAllProps} />

        <ImportModal
          visible={productVisible}
          onCancel={() => {
            this.setState({
              productVisible: false,
            })
          }}
          importUploading={importUploading}
          payUpload={this.payUpload}
        />
      </>
    );
  }
}
