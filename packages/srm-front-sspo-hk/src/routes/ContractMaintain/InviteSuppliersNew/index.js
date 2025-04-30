/*
 * ui 修改
 * @date: 2023-08-04
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
 import React, { Component, Fragment } from 'react';
 import { Form } from 'hzero-ui';
 import { DataSet } from 'choerodon-ui/pro';
 import { connect } from 'dva';
 import { Bind, Debounce } from 'lodash-decorators';
 
 import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
 import { Header, Content } from 'components/Page';
 import {
   addItemToPagination,
   getCurrentOrganizationId,
   delItemsToPagination,
   getEditTableData,
   createPagination
 } from 'utils/utils';
 import intl from 'utils/intl';
 import formatterCollections from 'utils/intl/formatterCollections';
 import ExcelExport from '@/components/ExcelExport';
 import { SRM_BID } from '@/common/config';
 import notification from 'utils/notification';
 import uuidv4 from 'uuid/v4';
 
 import templateDS from '@/pages/CostPaymentRequest/BatchImport/dataset/templateDS';
 import styles from './index.less';
 import request from 'utils/request';
 import InviteSuppliersList from './list';
 import { isUndefined } from 'lodash';
 import CusNotification from '_cus_components/CusNotification';
 import CusModal from '_cus_components/CusModal';
 import eventBus from '@/routes/components/ev';

 const organizationId = getCurrentOrganizationId();
 const promptCode = 'ssrc.priceEntry';

 
 @connect(({ loading, contractMaintain = {} }) => ({
   fetchLoading: loading.effects['contractMaintain/supplierList'],
   saveLoading: loading.effects['contractMaintain/saveInviteSuppliers'],
   deleteLoading: loading.effects['contractMaintain/deleteSupplierTableList'],
   contractMaintain,
 }))
 @formatterCollections({
   code: [
     'bid.bidcommon',
     'hzero.common',
     'sodr.purchaseOrder',
     'HKPC.commom',
  ],
 })
 export default class InviteSuppliers extends Component {
   constructor(props) {
     super(props);
     const {} = this.props;
     this.state = {
       selectedRows: [],
       selectedRowKeys: [],
       oldeProId: null,
       ladderOfferList: [],
       ladderOfferVisible: false,
       operationRecordVisible: false,
       LadderLevelHeaderData: {
         itemCode: '',
         itemName: '',
         quotationLineId: '',
         supplierCompanyName: '',
         quotationLineStatus: '',
       },
       fileUrl: '',
       upload: false,
       fileList: [],
       visible: false,
       messageVisible: false,
       supplierSource: [],
       dataSourceTest: [],
       rowKey: '',
       groupUnsaveFlag: false,
     };
   }
   InviteSuppliers = Form.create({})(InviteSuppliers);
   templateDataSet = new DataSet(templateDS());
   componentDidMount() {
     this.supplierList(); // 查询数据
     eventBus.on('handleSaveInviteSuppliers', this.handleSaveInviteSuppliers)
   }
   componentWillUnmount() {
    const { dispatch } = this.props;
    eventBus.off('handleSaveInviteSuppliers', this.handleSaveInviteSuppliers)
    dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          supplierSource: []
        },
      });  
  }
   /**
    * supplierList - 查询数据
    * @param {object} params - 查询条件
    */
   @Bind()
   @Debounce(200)
   supplierList(page = {}) {
     const { dispatch, matchs } = this.props;
     const { proId } = matchs.params;
     if (proId) {dispatch({
       type: 'contractMaintain/supplierList',
       payload: {
         proId: proId,
         page,
       },
     }).then((res) => {
       if(res) {
        const { content = [] } = res;
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        this.setState({ groupUnsaveFlag: false, oldeProId: proId })
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            supplierSource: newDataSource,
            supplierPagination: createPagination(res),
          },
        });
       }
     })}
   }
   /**
    * 处理表单中的查询条件
    * @param {Object} filterValues
    * @param {String} radioTab
    */
   handleFormQuery(filterValues) {
     const dealTime = {};
     const timeArray = ['creationDateFrom', 'creationDateTo'];
     timeArray.forEach((item) => {
       dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
     });
     return {
       ...filterValues,
       ...dealTime,
     };
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
 
   /**
    * 处理数据导入后的数据展示(保存)
    *
    * @memberof Import
    */
   @Bind()
   handleImportData(params) {
     request(
       `${SRM_BID}/v1/${organizationId}/import/data?templateCode=${params.templateCode}&batch=${params.batch}`,
       {
         method: 'GET',
       }
     ).then();
   }
   isJSON(str) {
     let result;
     try {
       result = JSON.parse(str);
     } catch (e) {
       return false;
     }
     return isObject(result) && !isString(result);
   }
   @Bind
   handleImport() {
     this.setState({
       visible: true,
     });
   }
   @Bind
   beforeUpload(file) {
     const { templateCode = 'BID.SCORE_CONFIG', param = {} } = this.props;
     const formData = new FormData();
     formData.append('excel', file, file.name);
     if (file.uid) {
       const url = `${SRM_BID}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
       this.setState({
         uploadLoading: true,
       });
       request(url, {
         method: 'POST',
         query: param,
         body: formData,
         responseType: 'text',
       })
         .then((res) => {
           if (this.isJSON(res)) {
             CusNotification.error({
               message: intl.get('hzero.common.notification.error').d('操作失败'),
             });
           } else if (res) {
             CusNotification.success({
               message: intl.get('hzero.common.notification.success').d('导入成功'),
             });
             // 导入成功后查一遍数据进行导入的数据展示
             const params = {
               templateCode: templateCode,
               batch: res,
             };
             this.handleImportData(params);
           }
         })
         .finally(() => {
           this.setState({
             uploadLoading: false,
           });
         });
     }
     return false;
   }
 
   // 取消
   @Bind
   handleCancel() {
     this.setState({
       visible: false,
       messageVisible: false,
       fileList: [],
       message: '',
     });
   }
 
   /**
    * 监听编辑事件，更改当前未保存状态
    *
    * @memberof OrderGroup
    */
   @Bind
   handleDataChange() {
     const { unsaveFlag } = this.props;
     if (!unsaveFlag) {
       const { onEdit = (e) => e } = this.props;
       onEdit(true);
     }
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
       fileList: [],
       upload: false,
     });
   }
 
   // 新增
   @Bind
   handleAddInviteSuppliersLine() {
     const { contractMaintain, dispatch } = this.props;
     const { supplierSource = [], supplierPagination = {} } = contractMaintain;
     const newLine = {
       _status: 'create',
       poOrderId: uuidv4(),
       invitationCode: 'Participate',
       processState: 'Participate',
     };
     const newPagination = addItemToPagination(supplierSource.length, supplierPagination);
     const newDataSource = [...supplierSource, newLine];
     dispatch({
       type: 'contractMaintain/updateState',
       payload: {
         supplierSource: newDataSource,
         supplierPagination: newPagination,
       },
     });
     this.props.isTrue()
     this.setState({ groupUnsaveFlag: true })
   }
 
   // 删除
   @Bind
   handleDeleteInviteSuppliersLine(selectedRowKeys, selectedRows, callback) {
     const { contractMaintain, dispatch } = this.props;
     const { supplierSource = [], supplierPagination = {} } = contractMaintain;
     const deleteData = selectedRows;
    //  const newPagination = delItemsToPagination(
    //    selectedRowKeys.length,
    //    supplierSource.length,
    //    supplierPagination
    //  );
    if (deleteData.length > 0) {
      CusModal.confirm({
        content: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
        okType: 'normal',
        onOk: () => {
          let newDataList = supplierSource
          for (let i of deleteData) {
            if (i._status === 'update') {
              const data = [i]
              dispatch({
                type: 'contractMaintain/deleteSupplierTableList',
                payload: {data}
              })
            }
           newDataList = newDataList.filter((item) => item.poOrderId !== i.poOrderId);
          }
          const newPagination = delItemsToPagination(
            selectedRows.length,
            newDataList.length,
            supplierPagination
          );
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              supplierSource: newDataList,
              supplierPagination: newPagination,
            },
          });
          CusNotification.success();
        },
      });
    } else {
      CusNotification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
    callback();
   }
 
   // 保存
   @Bind
   handleSaveInviteSuppliers(id) {
     const { dispatch, contractMaintain, matchs, activeKey } = this.props;
     const { proId } = matchs.params;
     const {oldeProId} = this.state
     const { supplierSource = [] } = contractMaintain;
     const data = getEditTableData(supplierSource).map((item) =>
       item._status === 'create'
         ? {
             ...item,
             poOrderId: undefined,
           }
         : item
     );
     const newData = data.map((el) => {
      delete el.id
      return el
     })
     const objReplace = JSON.stringify(newData).replace(/userId/g, 'id');
     const newObjReplace = JSON.parse(objReplace)
     let newObjReplacRever = newObjReplace.sort();
     let checkDataName = newObjReplacRever.filter((item) => {
      return item.invitationCode !== 'Quit'
     }).map((el) => el.portalCompanyName || el.supplierName)

     console.log('newObjReplace', newObjReplace, checkDataName)
     if(oldeProId == null || oldeProId == id ){
      if (oldeProId == null  && proId) {
        return
      }
        if (newObjReplace.length > 0) {
        dispatch({
          type: 'contractMaintain/checkSupplierBlackFlag',
          payload: {
            data: checkDataName,
            proId: proId,
          }
        }).then((checkFlag) => {
          if(checkFlag && checkFlag.failed && checkDataName.length > 0) {
            return CusNotification.error({
              message: checkFlag.message,
              closable: false,
            })
          }
          dispatch({
            type: 'contractMaintain/saveInviteSuppliers',
            payload: {
              data: newObjReplacRever,
              proId: proId
            },
          }).then((res) => {
            if (res) {
              this.supplierList();
              CusNotification.success({
                message: intl
                      .get(`bid.bidcommon.view.title.savesuccessfully`)
                      .d('保存成功'),
              });
              this.props.isFalse();
              this.setState({ groupUnsaveFlag: false })
            }
          });
        })
      }else {
        CusNotification.error({
          message: intl
            .get(`bid.bidcommon.view.message.pleasecheckitem`)
            .d('请检查必填项并保存!'),
        });
        if (activeKey == 'inviteSuppliers')  eventBus.emit('callback', 'inviteSuppliers', true)
      }
     }
     
   }
 
   render() {
     const {
       matchs,
       getDetailList,
       contractMaintain: { supplierSource = [], supplierPagination = {} },
       form,
       fetchLoading = false,
       saveLoading = false,
       deleteLoading = false,
       isSaveFlag = false
     } = this.props;
     const { getFieldDecorator } = form;
     const { groupUnsaveFlag } = this.state;
     const listProps = {
       fetchLoading: fetchLoading,
       saveLoading: saveLoading,
       deleteLoading: deleteLoading,
       dataSource: supplierSource,
       pagination: supplierPagination,
       onAddLine: this.handleAddInviteSuppliersLine,
       onDeleteLine: this.handleDeleteInviteSuppliersLine,
       onSave: () => this.handleSaveInviteSuppliers(matchs.params.proId),
       unsaveFlag: groupUnsaveFlag,
       isSaveFlag,
       onPageChange: (page) => this.supplierList(page),
       onChangeTabsFlag: () => this.props.onChangeTabsFlag && this.props.onChangeTabsFlag(),
       onEdit: (flag) => {
         this.setState({
           groupUnsaveFlag: flag,
         });
       },
       isTrue: () => {
         this.props.isTrue();
       },
       proId: matchs.params.proId,
       getDetailList,
     };
 
     return (
           <InviteSuppliersList {...listProps} />
     );
   }
 }
 
 InviteSuppliers = Form.create({})(InviteSuppliers);
 