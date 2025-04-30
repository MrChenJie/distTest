/*
 * 应答表
 * @date: 2022-4-1
 * @author:  <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Select, Button, Upload, Tooltip, Modal } from 'hzero-ui';
import { connect } from 'dva';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import importIcon from '@/assets/buttonIcons/导入.png';
import exportIcon from '@/assets/buttonIcons/导出.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import uuidv4 from 'uuid/v4';
import { tableScrollWidth } from 'hzero-front/lib/utils/utils';
import { isFunction, isArray } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { getEditTableData, createPagination, addItemToPagination, parseParameters, filterNullValueObject, delItemsToPagination } from 'utils/utils';
import ExcelExport from '@/components/ExcelExport';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import request from 'utils/request';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'hzero-front-hcuz';
import styles from './index.less';
import { SRM_BID, SRM_SPUC } from '@/common/config';
import { downloadFile } from 'hzero-front/lib/services/api';
const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();
let technologyPagination = {}

@connect(({ loading, contractMaintain, contractCommon }) => ({
  queryingHeader: loading.effects['contractCommon/fetchHeader'],
  queryingPartner: loading.effects['contractCommon/fetchPartner'],
  queryingSubject: loading.effects['contractCommon/fetchSubject'],
  queryingStage: loading.effects['contractCommon/fetchStage'],
  queryingTerm: loading.effects['contractCommon/fetchTerm'],
  saving: loading.effects['contractMaintain/update'] || loading.effects['contractMaintain/add'],
  deleteHeaderLoading: loading.effects['contractMaintain/delete'],
  submitContractLoading: loading.effects['contractMaintain/submit'],
  deletePcSubjectLoading: loading.effects['contractMaintain/pcSubjectLinesDelete'],
  deletePcStageLoading: loading.effects['contractMaintain/pcStageLinesDelete'],
  deletePartnerLoading: loading.effects['contractMaintain/partnerLinesDelete'],
  queryingPcAttachmentList: loading.effects['contractCommon/fetchPcAttachmentList'],
  contractMaintain,
  contractCommon,
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
    'bid.bidcommon',
    'bid.biddashbord'
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL'],
})

export default class ContractMidlle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      selectedRowKeys: [],
      continue: 2,
      signFlag: false,
      code: 'BID.TEC_BUSINESS_CONFIGS',
      visible: false,
      messageVisible: false,
      dataSource1: [],
      isYes: '',
      isYesAnswer: '',
      importLoading: false,
      groupUnsaveFlag: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    this.getSelectedRows();
  }

  changeInput = (name, record, row, index, e) => {
    if (record || row) {
    }
    this.props.form.validateFields((error, values) => {
      if (values) {
      }
      if (error && error[e.currentTarget.id]) return;
      const newData = [...this.state.dataSource1];
      newData[index][name] = e.currentTarget.value;
      this.setState({ dataSource1: newData });
    });
  };

  @Bind
  changeColumns(value, index, record) {
    if (record == 2) {
      this.state.dataSource1[index].clauseDetail = value
    } else {
      this.state.dataSource1[index].clause = value
    }
  }

  @Bind
  getSelectedRows(page = {}) {
    const { matchs, purchaseFlag, dispatch, getDetailList } = this.props;
    const { projectSettingContent } = getDetailList;
    const query = filterNullValueObject(parseParameters({
      page
    }));

    // 基本信息查询
    request(
      `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs?proId=${matchs.params.proId}&configType=${purchaseFlag}`,
      {
        method: 'get',
        query
      }
    ).then((res) => {
      if (res) {
        const newData = res.content.map(n => ({ ...n, _status: 'update', id: uuidv4() }))
        this.updateContractMaintain(newData, createPagination(res), purchaseFlag)
        this.setState({
          dataSource1: newData,
          groupUnsaveFlag: false,
        });
        this.getAnswerTable();
        // // 查询是否线上应答
        // request(
        //   `${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail?proId=${matchs.params.proId}`,
        //   {
        //     method: 'GET',
        //   }
        // ).then((res) => {
        //   if (res) {
        //     if (res.isNeedAnswer !== undefined || res.isNeedAnswerBusiness !== undefined) {
        //       this.props.getDetailList.isNeedAnswer = res.isNeedAnswer
        //       this.props.getDetailList.isNeedAnswerBusiness = res.isNeedAnswerBusiness
        //       if (res.isNeedAnswer == 0) {
        //         this.setState({
        //           isYes: 'YES',
        //         });
        //       } else {
        //         this.setState({
        //           isYes: 'NO',
        //         });
        //       }
        //       if (res.isNeedAnswerBusiness == 0) {
        //         this.setState({
        //           isYesAnswer: 'YES'
        //         });
        //       } else {
        //         this.setState({
        //           isYesAnswer: 'NO'
        //         });
        //       }
        //     }
        //   }
        // })
      }
    })
  }

  // 查询是否线上应答
  @Bind
  getAnswerTable() {
    const { matchs} = this.props;
    request(
      `${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail?proId=${matchs.params.proId}`,
      {
        method: 'GET',
      }
    ).then((res) => {
      if (res) {
        if (res.isNeedAnswer !== undefined || res.isNeedAnswerBusiness !== undefined) {
          this.props.getDetailList.isNeedAnswer = res.isNeedAnswer
          this.props.getDetailList.isNeedAnswerBusiness = res.isNeedAnswerBusiness
          if (res.isNeedAnswer == 0) {
            this.setState({
              isYes: 'YES',
            });
          } else {
            this.setState({
              isYes: 'NO',
            });
          }
          if (res.isNeedAnswerBusiness == 0) {
            this.setState({
              isYesAnswer: 'YES'
            });
          } else {
            this.setState({
              isYesAnswer: 'NO'
            });
          }
        }
      }
    })
  }

  @Bind
  beforeUpload(file) {
    const {
      // args,
      templateCode = 'BID.TEC_BUSINESS_CONFIGS',
      param = {},
    } = this.props;
    this.setState({ importLoading: true });
    const formData = new FormData();
    formData.append('excel', file, file.name);
    // if (args) {
    // formData.append('param', JSON.stringify(args));
    // }
    if (file.uid) {
      const url = `${SRM_BID}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
      this.setState({
        uploadLoading: true,
      });
      request(url, {
        method: 'POST',
        // query: param,
        body: formData,
        responseType: 'text',
      })
        .then((res) => {
          if (this.isJSON(res)) {
            notification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
          } else if (res) {
            // 导入成功后查一遍数据进行导入的数据展示
            const params = {
              templateCode: templateCode,
              batch: res
            }
            // debugger
            // this.handleImportData(params)
             setTimeout(()=>{ 
              this.handleImportData(params, file)},500)
          }
        })
        // .finally(() => {
        //   this.setState({
        //     uploadLoading: false,
        //   });
        // });
    }
    return false;
  }

  /**
   * 处理数据导入后的数据展示(保存)二次
   *
   * @memberof Import
   */
  //  @Debounce(300)
  @Bind()
  handleImportDataTwo(params) {
    const query = parseParameters({
      ...params,
      size:1000
    })
    
    request(`${SRM_BID}/v1/${organizationId}/import/data`, {
      method: 'GET',
      query
    }
    ).then(res => {
      if (res.content) {
        let newdata = []
        if (res.content.length > 0) {
          res.content.map((item) => {
            const listn = { ...JSON.parse(item._data) }
            const newList = {
              _status: 'update',
              clause: listn.clause,
              clauseDetail: listn.clauseDetail,
              isLowestRequire: listn.isLowestRequire?(listn.isLowestRequire === this.props.detailEnumMap.yesNo[0].meaning ? this.props.detailEnumMap.yesNo[0].value : this.props.detailEnumMap.yesNo[1].value) : '',
              id: uuidv4(),
            }
            newdata.push(newList)
          })
          if (newdata.length > 1000) {
            notification.error({ message: intl.get('bid.bidcommon.view.message.Asingleimportcannotexceed').d('单次导入不能超过1000条，超出不做保存') })
            this.setState({
              uploadLoading: false,
            });
            return
          } else {
            const newdataList = [...newdata, ...this.state.dataSource1]
            if (this.props.purchaseFlag === '0') {
              this.props.dispatch({
                type: 'contractMaintain/updateState',
                payload: {
                  SelectPagination0: createPagination({
                    number: 0, 
                    size: newdataList.length,
                    totalElements: newdataList.length
                  }),
                },
              });
            } else {
              this.props.dispatch({
                type: 'contractMaintain/updateState',
                payload: {
                  SelectPagination1: createPagination({
                    number: 0, 
                    size: newdataList.length,
                    totalElements: newdataList.length
                  }),
                },
              });
            }
            // notification.success({ message: intl.get('bid.bidcommon.view.message.uploadsuccessfully').d('导入成功') });
            this.setState({ dataSource1: newdataList, continue: this.state.continue++ })
            this.save();
          }
        } else {
          notification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
        }
      }
    })
        this.setState({
            uploadLoading: false,
          });
  }

  /**
   * 处理数据导入后的数据展示(保存)
   *
   * @memberof Import
   */
  //  @Debounce(300)
  @Bind()
  handleImportData(params, file) {
    const query = parseParameters({
      ...params,
      size:1000
    })
    
    request(`${SRM_BID}/v1/${organizationId}/import/data`, {
      method: 'GET',
      query
    }
    ).then(res => {
      if (res.content) {
        let newdata = []
        if (res.content.length > 0) {
          res.content.map((item) => {
            const listn = { ...JSON.parse(item._data) }
            let newList = {
              _status: 'update',
              clause: listn.clause,
              clauseDetail: listn.clauseDetail,
              isLowestRequire: listn.isLowestRequire?(listn.isLowestRequire === this.props.detailEnumMap.yesNo[0].meaning ? this.props.detailEnumMap.yesNo[0].value : this.props.detailEnumMap.yesNo[1].value) : '',
              id: uuidv4(),
            }
            newdata.push(newList)
          })
          if (newdata.length > 1000) {
            notification.error({ message: intl.get('bid.bidcommon.view.message.Asingleimportcannotexceed').d('单次导入不能超过1000条，超出不做保存') })
            this.setState({
              uploadLoading: false,
            });
            return
          } else {
            const newdataList = [...newdata, ...this.state.dataSource1]
            if (this.props.purchaseFlag === '0') {
              this.props.dispatch({
                type: 'contractMaintain/updateState',
                payload: {
                  SelectPagination0: createPagination({
                    number: 0, 
                    size: newdataList.length,
                    totalElements: newdataList.length
                  }),
                },
              })
            } else {
              this.props.dispatch({
                type: 'contractMaintain/updateState',
                payload: {
                  SelectPagination1: createPagination({
                    number: 0, 
                    size: newdataList.length,
                    totalElements: newdataList.length
                  }),
                },
              })
            }
            // notification.success({ message: intl.get('bid.bidcommon.view.message.uploadsuccessfully').d('导入成功') });
            this.setState({ dataSource1: newdataList, continue: this.state.continue++ })
            this.save();
          }
          this.setState({
            uploadLoading: false,
          });
        } else {
          // notification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
          // this.handleImportDataTwo(params)
          setTimeout(() => {
            this.handleImportData(params)
          }, 2000)
        }
      }
    })
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
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem(e, purchaseFlag) {
    if (purchaseFlag === '0') {
      this.setState({
        // dataSource1: [],
        isYes: e,
        isYesAnswer: ''
      })
    } else {
      this.setState({
        // dataSource1:[],
        isYes: '',
        isYesAnswer: e
      })
    }
    
    // const { onChangeState } = this.props;
    // onChangeState({ headerEdited: true });
  }
  /**
   * 添加 
   */
  @Bind()
  add(success = (e) => e) {
    const { contractMaintain } = this.props;
    const { SelectPagination0 ,SelectPagination1 } = contractMaintain;
    const newData = {
      clause: '',
      clauseDetail: '',
      index: this.state.continue++,
      _status: 'create',
      id: uuidv4(),
    }
    const dataSource1 = [...this.state.dataSource1, newData];
    // console.log('dataSource1',dataSource1);
    // this.state.dataSource1 = dataSource1;
    if (this.props.purchaseFlag === '0') {
      const newPagination = addItemToPagination(dataSource1.length - 1, SelectPagination0);
      this.updateContractMaintain(dataSource1, newPagination, this.props.purchaseFlag);
    } else {
      const newPagination = addItemToPagination(dataSource1.length - 1, SelectPagination1);
      this.updateContractMaintain(dataSource1, newPagination, this.props.purchaseFlag);
    }
    this.props.isTrue()
    this.setState({ groupUnsaveFlag: true })
    this.setState({ dataSource1: dataSource1, continue: this.state.continue++ })
  }

  /**
  * 更新 
  */
  @Bind()
  updateContractMaintain = (data, pagination = {},purchaseFlag) => {
    if(purchaseFlag === '0'){
      this.props.dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          dataSource1: data,
          SelectPagination0: pagination,
        },
      });
    }else{
      this.props.dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          dataSource1: data,
          SelectPagination1: pagination,
        },
      });
    }
  };

  /**
  * 保存 
  */
   @Debounce(300, { leading: true })
  @Bind()
  save() {
    const { matchs, purchaseFlag, dispatch } = this.props;
    const { dataSource1, isYes, isYesAnswer } = this.state
    const data = getEditTableData(dataSource1).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    const params = getEditTableData(dataSource1)
    const newData = purchaseFlag == 0 ? {
      configType: purchaseFlag,
      isNeedAnswer : isYes == 'YES' ? 0 : 1,
      proId: matchs.params.proId
    } : {
      configType: purchaseFlag,
      isNeedAnswerBusiness: isYesAnswer == 'YES' ? 0 : 1,
      proId: matchs.params.proId
    }
    let newlist = []
    for (const i of params) {
      newlist.push({ ...i, ...newData })
    }
    newlist = newlist.sort();
    const param = newlist
    if(isYes === 'YES' &&purchaseFlag == 0){
      if(data.length > 0){
           // 保存应答表数据
      request(
        `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
        {
          method: 'POST',
          body: [newData],
        }
      ).then(() => {
        this.props.isFalse()
        // 保存后查询表
        request(
          `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs`,
          {
            method: 'POST',
            body: param,
          }
        ).then((res) => {
          // console.log('res',res)
          if (isArray(res)) {
            this.setState({ groupUnsaveFlag: true })
            notification.success();
            this.getSelectedRows();
            
          }else{
            notification.error({
              message:intl.get(`bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist`).d('当前列表中不得超出最大长度1000字符')
            })
          }
        })
      })
      }else{
        notification.error({
          message: intl
            .get(`bid.bidcommon.view.message.pleasecheckitem`)
            .d('请检查必填项并保存!'),
        });
      }
    }else{
            // 保存应答表数据
      if (purchaseFlag == 0) {
        request(
          `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
          {
            method: 'POST',
            body: [newData],
          }
        ).then(() => {
          this.props.isFalse()
          this.setState({ groupUnsaveFlag: true,dataSource1: [], })
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              SelectPagination0: {},
            },
          });
          notification.success({
            message: intl
              .get(`bid.bidcommon.view.title.savesuccessfully`)
              .d('保存成功'),
          });
        })
      }
    }
    if(isYesAnswer === 'YES' && purchaseFlag == 1 ){
      if(data.length > 0){
           // 保存应答表数据
      request(
        `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
        {
          method: 'POST',
          body: [newData],
        }
      ).then(() => {
        // 保存后查询表
        this.props.isFalse()
        request(
          `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs`,
          {
            method: 'POST',
            body: param,
          }
        ).then((res) => {
          if (res) {
            this.props.isFalse()
            this.setState({ groupUnsaveFlag: true })
            notification.success();
            this.getSelectedRows();
          }
        })
      })
      }else{
        notification.error({
          message: intl
            .get(`bid.bidcommon.view.message.pleasecheckitem`)
            .d('请检查必填项并保存!'),
        });
      }
    }else{
            // 保存应答表数据
      if (purchaseFlag == 1) {
        request(
          `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
          {
            method: 'POST',
            body: [newData],
          }
        ).then(() => {
          this.props.isFalse()
          this.setState({ groupUnsaveFlag: true,dataSource1: [], })
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              SelectPagination1: {},
            },
          });
          notification.success({
            message: intl
              .get(`bid.bidcommon.view.title.savesuccessfully`)
              .d('保存成功'),
          });
        })
      }
    }
    // if (data.length > 0 && (isYes === 'YES' || isYesAnswer === 'YES')) {
    //   // 保存应答表数据
    //   request(
    //     `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
    //     {
    //       method: 'POST',
    //       body: [...newlist],
    //     }
    //   ).then(() => {
    //     // 保存后查询表
    //     request(
    //       `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs`,
    //       {
    //         method: 'POST',
    //         body: param,
    //       }
    //     ).then((res) => {
    //       if (res) {
    //         notification.success();
    //         this.getSelectedRows();
    //       }
    //     })
    //   })
    // } else {
    //   // 保存应答表数据
    //   if (params.length > 0) {
    //     request(
    //       `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
    //       {
    //         method: 'POST',
    //         body: [...newlist],
    //       }
    //     ).then(() => {
    //       notification.success({
    //         message: intl
    //           .get(`bid.bidcommon.view.title.savesuccessfully`)
    //           .d('保存成功'),
    //       });
    //     })
    //   }
    // }
  }

  /**
 * 删除 
 */
  @Bind()
  delete() {
    const { dispatch, purchaseFlag, contractMaintain } = this.props;
    const { SelectPagination0 ,SelectPagination1 } = contractMaintain;
    const { selectedRowKeys, selectedRows, dataSource1 } = this.state
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
        okText: intl.get(`bid.bidcommon.view.title.sure`).d('确定'),
        cancelText: intl.get(`bid.bidcommon.view.button.cancel`).d('取消'),
        onOk: () => {
          let deleteNewDataList = [];
          for (let i in selectedRows) {
            if (selectedRows[i]._status === 'update') {
              selectedRows.map((item) => {
                dataSource1.map((ite, j) => {
                  if (item.id === ite.id && item._status === 'update') {
                    deleteNewDataList.push(ite);
                    dataSource1.splice(j, 1)
                  }
                })
              })
              this.setState({ dataSource1: dataSource1 })
            } else {
              // 删除本地数据
              selectedRows.map((item) => {
                dataSource1.map((ite, j) => {
                  if (item.id === ite.id && item._status === 'create') {
                    dataSource1.splice(j, 1)
                  }
                })
              })
              this.setState({ selectedRows: [], selectedRowKeys: [] })
            }
          }
          if (deleteNewDataList.length > 0) {
            let list = [];
            deleteNewDataList.map((item) => {
              list.push({tenBusiConfigId: item.tenBusiConfigId})
            })
            request(
              `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs`,
              {
                method: 'DELETE',
                body: [...list]
              }
            ).then(() => {
              this.getSelectedRows();
              // if (purchaseFlag === '0') {
              //   dispatch({
              //     type: 'contractMaintain/updateState',
              //     payload: {
              //       SelectPagination0: createPagination({
              //         number: 0, 
              //         size: list.length,
              //         totalElements: list.length
              //       }),
              //     },
              //   });
              // } else {
              //   dispatch({
              //     type: 'contractMaintain/updateState',
              //     payload: {
              //       SelectPagination1: createPagination({
              //         number: 0, 
              //         size: list.length,
              //         totalElements: list.length
              //       }),
              //     },
              //   });
              // }
            })
          }
          if (purchaseFlag === '0') {
            const newPagination0 = delItemsToPagination(
              selectedRows.length,
              dataSource1.length,
              SelectPagination0
            );
            this.updateContractMaintain(dataSource1, newPagination0, purchaseFlag);
          }else{
            const newPagination1 = delItemsToPagination(
              selectedRows.length,
              dataSource1.length,
              SelectPagination1
            );
            this.updateContractMaintain(dataSource1, newPagination1, purchaseFlag);
          }
         
          notification.success();
        },
          // console.log(selectedRowKeys)
          // let allList = this.state.dataSource1
          // for (const i of selectedRowKeys) {
          //   allList = allList.filter(item => item.id !== i)
          //   console.log('item', allList)
          //   this.handleDelete(i, allList)
          // }
          // this.setState({
          //   selectedRowKeys: [],
          // });
      })
    } else {
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 下载模板
   */
  @Bind()
  handleDownloadTemplateClick() {
    const { code } = this.state;
    const api = `${SRM_BID}/v1/${organizationId}/import/template/${code}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] },);
  }

  /**
  * 导入
  */
  @Bind()
  handleImport() {
    this.setState({
      visible: true,
      importLoading: false,
    });
  }

  /**
   * 供应商Lov修改回调
   * @param {*} value
   * @param {*} record
   */
  // @Bind()
  // handleChangeSupplier(value, record) {
  //   if (value) {

  //   }
  //   const { dataSource, onChangeHeader } = this.props;
  //   const {
  //     supplierTenantId,
  //     supplierCompanyCode,
  //     supplierCompanyName,
  //     supplierCurrencyCode,
  //   } = record;
  //   // this.handleChangeFormItem();
  //   onChangeHeader({
  //     ...dataSource,
  //     supplierTenantId,
  //     supplierCompanyName,
  //     supplierCompanyNum: supplierCompanyCode,
  //     supplierCurrencyCode,
  //   });
  // }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  /**
   * 公司改变回调
   */
  // @Bind()
  // handleChangeCompany() {
  //   const {
  //     form: { resetFields },
  //   } = this.props;
  //   resetFields(['pcTypeId', 'pcTemplateId', 'ouId']);
  //   this.handleChangeFormItem();
  // }

  /**
   * 协议类型改变回调
  //  */
  // @Bind()
  // handleChangePcTypeId() {
  //   const {
  //     form: { resetFields },
  //   } = this.props;
  //   resetFields(['pcTemplateId']);
  //   this.handleChangeFormItem();
  // }


  // /**
  //  * 校验显示的默认值
  //  */
  // @Bind()
  // handleExpUnitChange(value, record) {
  //   const { handleExpenseUnitChange = (e) => e } = this.props;
  //   this.handleChangeFormItem();
  //   handleExpenseUnitChange(value, record);
  // }

  @Bind()
  onRowSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof ActiveClarificationTable
   */
   @Bind
   handleDataChange() {
    this.setState({ groupUnsaveFlag: true })
    //  const { groupUnsaveFlag } = this.state;
    //  if (!groupUnsaveFlag) {
    //    const { onEdit = (e) => e } = this.props;
    //    onEdit(true);
    //  }
   }
 
   /**
    * 监听分页变化，判断是否有未保存的数据
    *
    * @param {object} page
    * @memberof ActiveClarificationTable
    */
   @Bind
   handlePageChange(page) {
     const { groupUnsaveFlag } = this.state;
     if (groupUnsaveFlag) {
       Modal.confirm({
         title: intl
           .get('bid.bidcommon.view.message.confirmgetout')
           .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
         onOk: () => {
           this.getSelectedRows(page);
         },
       });
     } else {
       this.getSelectedRows(page);
     }
   }

  render() {
    const { selectedRowKeys, isYes, isYesAnswer, uploadLoading } = this.state;
    const {
      getDetailList,
      saving = false,
      submitContractLoading = false,
      detailEnumMap = {},
      form = {},
      customizeForm,
      purchaseFlag,
      matchs,
      contractMaintain,
      disabled,
    } = this.props;
    if (purchaseFlag === '0') {
      technologyPagination = contractMaintain.SelectPagination0
    } else {
      technologyPagination = contractMaintain.SelectPagination1
    }
    const { yesNo = [] } = detailEnumMap;
    const otherButtonProps = {
      // type: 'default',
      icon: null,
    };
    const { getFieldDecorator = (e) => e } = form;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
    };
    const { dataSource1 } = this.state;
    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        // dataIndex: 'index',
        width: '5%',
        editable: true,
        render: (val, row, index) => {
          if (row || val) {

          }
          return (
            index + 1
          );
        }
      },
      {
        title: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
        dataIndex: 'clause',
        // editable: true,
        width: 350,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, row) => {
          const { getFieldDecorator } = row.$form;
          return (
            <FormItem>
              <Tooltip title={val} placement="topLeft" 
              // overlayStyle={{'max-height': '30vh','overflow-y': 'scroll',
              //   'scrollbar-width': 'none !important',
              //   '-ms-overflow-style': 'none !important',
              // }}
              >
                {getFieldDecorator('clause', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
                      }),
                    },{
                      max:1000,
                      message:intl.get(`bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist`).d('当前列表中不得超出最大长度1000字符')
                    }
                  ],
                })(
                  <Input
                    disabled={disabled}
                    onChange={()=>{
                      // this.handleDataChange()
                      this.props.isTrue()
                    }}
                  />
                )}
              </Tooltip>
            </FormItem>
          );
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
        dataIndex: 'clauseDetail',
        width: 600,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        // render: (record, row, index) => { return editCol('clauseDetail', record, row, index, '细节条款'); }
        render: (val, row) => {
          const { getFieldDecorator } = row.$form;
          return (
            <FormItem>
              <Tooltip title={val} placement="topLeft" 
              // overlayStyle={{'max-height': '30vh','overflow-y': 'scroll',
              //   'scrollbar-width': 'none !important',
              //   '-ms-overflow-style': 'none !important',
              // }}
              >
                {getFieldDecorator('clauseDetail', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
                      }),
                    },{
                      max:1000,
                      message:intl.get(`bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist`).d('当前列表中不得超出最大长度1000字符')
                    }
                    
                  ],
                })(
                  <Input
                    disabled={disabled}
                    onChange={()=>{
                      // this.handleDataChange()
                      this.props.isTrue()
                    }}
                  />
                )}
              </Tooltip>
            </FormItem>
          );
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.keyindicators`).d('是否关键指标'),
        dataIndex: 'isLowestRequire',
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('isLowestRequire', {
                // initialValue: getDetailList.isNeedAnswer == 0 ? 'YES' : 'NO',
                initialValue: val
              })(
                <Select allowClear style={{ width: 150 }}
                  disabled={disabled}
                   >
                  {(yesNo).map(n => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          )
        }
      }
    ];
    return customizeForm(
      {

      },
      <Form className={styles['header-form']}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '-2px', }}>
            <div style={{
              width: '80px',
              textAlign: 'end',
              marginRight: '10px',
              lineHeight: '26px',
              color: '#666',
              fontSize: '14px',
            }}>
              {intl.get(`bid.bidcommon.view.title.requireditem`).d('线上应答')}
            </div>
            <Form.Item>
              {getFieldDecorator(`${purchaseFlag == 0 ? 'isYes' : 'isYesAnswer'}`, {
                // initialValue: getDetailList.isNeedAnswer == 0 ? 'YES' : 'NO',
                initialValue: (purchaseFlag == 0 ? getDetailList.isNeedAnswer === null : getDetailList.isNeedAnswerBusiness == null) ?intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择') : ((purchaseFlag == 0 ? getDetailList.isNeedAnswer == 0 : getDetailList.isNeedAnswerBusiness == 0) ? 'YES' : 'NO')
              })(
                <Select allowClear style={{ width: 150 }}
                  disabled={disabled}
                  // defaultValue={(purchaseFlag == 0 ? !getDetailList.isNeedAnswer : !getDetailList.isNeedAnswerBusiness) ? '请选择' : ((purchaseFlag == 0 ? getDetailList.isNeedAnswer == 0 : getDetailList.isNeedAnswerBusiness == 0) ? 'YES' : 'NO')}
                   onChange={(e) => this.handleChangeFormItem(e, purchaseFlag)} placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}>
                  {(yesNo).map(n => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </div>
          <div style={{ float: 'right', display: 'flex' }}>
            {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') &&
              <div className={styles['customize-buttons']}>
                <Button
                  loading={submitContractLoading}
                  onClick={() => this.handleDownloadTemplateClick()}
                  style={{ border: 'none' }}
                  disabled={disabled}
                >
                  <img src={importIcon} alt="" style={{ border: 'none', width: 18, marginRight: 5 }} />
                  {intl.get(`bid.bidcommon.view.button.download`).d('下载模板')}
                </Button>
              </div>}
            {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') && <div className={styles['customize-buttons']}>
              <Upload {...uploadProps}>
                <Button
                  // loading={deleteHeaderLoading}
                  // loading={importLoading}
                  style={{ border: 'none' }}
                  onClick={this.handleImport}
                  disabled={disabled}
                >
                  <img src={importIcon} alt="" style={{ border: 'none', width: 18, marginRight: 5 }} />
                  {intl.get(`bid.bidcommon.view.button.import`).d('导入')}
                </Button>
              </Upload>
            </div>}
            {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') && <div className={styles['customize-buttons']}>
              <ExcelExport
                requestUrl={`${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs/exportTenBusiConfigInfo?proId=${matchs.params.proId}&fillerType=single-sheet&configType=${purchaseFlag}&fileName=应答表设置`}
                otherButtonProps={otherButtonProps}
                downloadType="Blob"
                disabled={disabled}
                fileName={purchaseFlag == 0 ? intl
                  .get(`bid.bidcommon.view.title.`)
                  .d('技术应答表设置导出') : intl
                    .get(`bid.bidcommon.view.title.`)
                    .d('商务应答表设置导出')}
                buttonText={
                  <>
                    <img src={exportIcon} alt="" style={{ border: 'none', width: 18, marginRight: 5 }} />
                    {intl.get('bid.bidcommon.view.button.export').d('导出')}
                  </>
                }
              />
            </div>}
            {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') &&
              <div className={styles['customize-buttons']}>
                <Button
                  loading={submitContractLoading}
                  onClick={this.delete}
                  style={{ border: 'none' }}
                  disabled={disabled}
                >
                  <img src={deleteIcon} alt="" style={{ border: 'none', width: 18, marginRight: 5 }} />
                  {intl.get(`bid.bidcommon.view.button.delete`).d('删除')}
                </Button>
              </div>}
            {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') &&
              <div className={styles['customize-buttons']}>
                <Button
                  loading={saving}
                  onClick={() => this.add()}
                  style={{ border: 'none' }}
                  disabled={disabled}
                >
                  <img src={addIcon} alt="" style={{ border: 'none', width: 18, marginRight: 5 }} />
                  {intl.get(`bid.bidcommon.view.button.add`).d('添加')}
                </Button>
              </div>}
            {(isYes || isYesAnswer) && <div className={styles['customize-buttons']}>
              <Button
                loading={submitContractLoading}
                onClick={this.save}
                style={{ border: 'none' }}
                disabled={disabled}
              >
                <img src={saveIcon} alt="" style={{ border: 'none', width: 18, marginRight: 5 }} />
                {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
              </Button>
            </div>}
            {/* <Button
              // loading={submitDeliveryLoading}
              icon="export"
              style={{ border: 'none' }}
              onClick={() => this.handleExport()}
            >
              {intl.get(`hzero.common.button.opeating`).d('导出')}
            </Button> */}
          </div>
        </div>
        <Modal
          title={intl.get('bid.bidcommon.button.import.result').d('导入结果')}
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
            <Button
              key="submit"
              type="primary"
              style={{ textAlign: 'center' }}
              onClick={this.handleOk}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        </Modal>
        {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') && <EditTable
          //  loading={queryLoading || deleteLoading}
          rowSelection={rowSelection}
          bordered
          rowKey="id"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource1}
          loading={uploadLoading}
          pagination={technologyPagination}
          onChange={(page) => this.handlePageChange(page)}
          onDataChange={this.handleDataChange}
          // onEdit={(flag) => {
          //   this.setState({
          //     groupUnsaveFlag: flag,
          //   });
          // }}
        ></EditTable>}
      </Form>
    );
  }
}
// ContractMidlle = Form.create({
//   onValuesChange: (props, changedValues, allValues) => {
//     // console.log(allValues);
//   },
// })(ContractMidlle);