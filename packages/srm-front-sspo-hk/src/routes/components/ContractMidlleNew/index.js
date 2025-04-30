/*
 * ui 修改
 * @date: 2023-08-07
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Upload } from 'antd';
import { connect } from 'dva';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import uuidv4 from 'uuid/v4';
import { tableScrollWidth } from 'hzero-front/lib/utils/utils';
import { isFunction, isArray } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { getEditTableData, createPagination, addItemToPagination, parseParameters, filterNullValueObject, delItemsToPagination, getCurrentLanguage } from 'utils/utils';
import CusSelect from '_cus_components/CusSelect';
import CusExcelExport from '_cus_components/CusExcelExport';
import EditTable from '_cus_components/EditTable';
import CusSpin from '_cus_components/CusSpin';
import CusModal from '_cus_components/CusModal';
import intl from 'utils/intl';
import request from 'utils/request';
import notification from '_cus_components/CusNotification';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'hzero-front-hcuz';
import styles from './index.less';
import { SRM_BID } from '@/common/config';
import { downloadFile } from 'hzero-front/lib/services/api';
import { tooltipRender } from '_cus_utils/render';
import eventBus from '../ev';// 组件通讯
const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();
let technologyPagination = {}
let dataSource1 = []
let loading = false

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
      oldeProId: null,
      isYes: '',
      isYesAnswer: '',
      importLoading: false,
      groupUnsaveFlag: false,
      uploadLoading: false,

    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    this.getSelectedRows();
    eventBus.on('save', this.save)

  }
  componentWillUnmount() {
    eventBus.off('save', this.save)
  }

  @Bind
  getSelectedRows(page = {}) {
    const { matchs, purchaseFlag, getDetailList } = this.props;
    const { projectSettingContent } = getDetailList;
    const query = filterNullValueObject(parseParameters({
      page
    }));
    loading = true
    // erp 新建时暂未数据避免查询出错
    if (matchs.params.proId) {
      // 基本信息查询
      request(
        `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs?proId=${matchs.params.proId}&configType=${purchaseFlag}`,
        {
          method: 'get',
          query
        }
      ).then((res) => {
        if (res && res.content) {
          loading = false
          const newData = res.content.map(n => ({ ...n, _status: 'update', id: uuidv4() }))
          this.updateContractMaintain(newData, createPagination(res), purchaseFlag)
          this.setState({
            dataSource1: newData,
            oldeProId: matchs.params.proId,
            groupUnsaveFlag: false,
          });
          this.getAnswerTable();
        } else {
          loading = false
        }
      })
    } else {
      loading = false
      this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
    }
  }

  // 查询是否线上应答
  @Bind
  getAnswerTable() {
    const { matchs } = this.props;
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
    } = this.props;
    this.setState({ importLoading: true });
    const formData = new FormData();
    formData.append('excel', file, file.name);
    if (file.uid) {
      const url = `${SRM_BID}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
      this.setState({
        uploadLoading: true,
      });
      request(url, {
        method: 'POST',
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
            setTimeout(() => {
              this.handleImportData(params, file)
            }, 500)
          }
        })
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
      size: 1000
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
              isLowestRequire: listn.isLowestRequire ? (listn.isLowestRequire === this.props.detailEnumMap.yesNo[0].meaning ? this.props.detailEnumMap.yesNo[0].value : this.props.detailEnumMap.yesNo[1].value) : '',
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
            this.setState({ dataSource1: newdataList, continue: this.state.continue++ })
            this.save(this.props.matchs.params.proId);
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
    const { detailEnumMap } = this.props;
    const { yesNo = [] } = detailEnumMap;
    const query = parseParameters({
      ...params,
      size: 1000
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
              isLowestRequire: listn.isLowestRequire ? (listn.isLowestRequire === yesNo[0].description ? yesNo[0].value : yesNo[1].value) : '',
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
            this.setState({ dataSource1: newdataList, continue: this.state.continue++ })
            this.save(this.props.matchs.params.proId);
          }
          this.setState({
            uploadLoading: false,
          });
        } else {
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
        isYes: e,
        isYesAnswer: ''
      })
    } else {
      this.setState({
        isYes: '',
        isYesAnswer: e
      })
    }
  }
  /**
   * 添加 
   */
  @Bind()
  add(success = (e) => e) {
    const { contractMaintain } = this.props;
    const { SelectPagination0, SelectPagination1 } = contractMaintain;
    const newData = {
      clause: '',
      clauseDetail: '',
      index: this.state.continue++,
      _status: 'create',
      id: uuidv4(),
    }
    const dataSource1 = [...this.state.dataSource1, newData];
    if (this.props.purchaseFlag === '0') {
      const newPagination = addItemToPagination(dataSource1.length - 1, SelectPagination0);
      this.updateContractMaintain(dataSource1, newPagination, this.props.purchaseFlag);
    } else {
      const newPagination = addItemToPagination(dataSource1.length - 1, SelectPagination1);
      this.updateContractMaintain(dataSource1, newPagination, this.props.purchaseFlag);
    }
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
    this.setState({ groupUnsaveFlag: true })
    this.setState({ dataSource1: dataSource1, continue: this.state.continue++ })
  }

  /**
  * 更新 
  */
  @Bind()
  updateContractMaintain = (data, pagination = {}, purchaseFlag) => {
    if (purchaseFlag === '0') {
      this.props.dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          dataSource1: data,
          SelectPagination0: pagination,
        },
      });
    } else {
      this.props.dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          dataSource1: data,
          SelectPagination1: pagination,
        },
      });
    }
    this.setState({ dataSource1: [...data] })
  };

  /**
  * 保存 
  */
  @Debounce(300, { leading: true })
  @Bind()
  save(id) {
    const { matchs, purchaseFlag, dispatch, activeKey } = this.props;
    const { dataSource1, isYes, isYesAnswer, oldeProId } = this.state
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
      isNeedAnswer: isYes == 'YES' ? 0 : 1,
      proId: matchs.params.proId // erp 新增时会出现proId为空的情况，避免报错重新塞值
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
    // 页面通讯组件未销毁时会存在多组数据，先进行数据匹配
    if (oldeProId == null || oldeProId === id) {
      // console.log('datas', activeKey);
      // 当标包00未保存，再进行分标包时会出现该proid不存在，导致报错
      if (!matchs.params.proId) {
        return
      }
      if(isYes == '') {
        notification.error({
          message: intl.get(`bid.bidcommon.view.message.Psao`).d('请选择线上应答'),
        });
        // 根据activeKey 值进行匹配
        if (activeKey == '1') eventBus.emit('callback', '1', true)
        return
      }
      if (isYes === 'YES' && purchaseFlag == 0) {
        if (data.length > 0) {
          // 保存应答表数据
          request(
            `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
            {
              method: 'POST',
              body: [newData],
            }
          ).then(() => {
            
            // 保存后查询表
            request(
              `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs`,
              {
                method: 'POST',
                body: param,
              }
            ).then((res) => {
              if (isArray(res)) {
                this.setState({ groupUnsaveFlag: true })
                // notification.success();
                this.getSelectedRows();
                if (activeKey == '1') {
                  this.props.isFalse()
                  notification.success({
                  message: intl
                    .get(`bid.bidcommon.view.title.savesuccessfully`)
                    .d('保存成功'),
                });
                }
              } else {
                notification.error({
                  message: intl.get(`bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist`).d('当前列表中不得超出最大长度1000字符')
                })
                if (activeKey == '1') eventBus.emit('callback', '1', true)
              }
            })
          })
        } 
        else {
          notification.error({
            message: intl
              .get(`bid.bidcommon.view.message.pleasecheckitem`)
              .d('请检查必填项并保存!'),
          });
          if (activeKey == '1')  eventBus.emit('callback', '1', true)
        }
      } else {
        // 保存应答表数据
        if (purchaseFlag == 0) {
          request(
            `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
            {
              method: 'POST',
              body: [newData],
            }
          ).then(() => {
            
            this.setState({ groupUnsaveFlag: true, dataSource1: [], })
            dispatch({
              type: 'contractMaintain/updateState',
              payload: {
                SelectPagination0: {},
              },
            });
            if (activeKey == '1') {
              this.props.isFalse()
              notification.success({
              message: intl
                .get(`bid.bidcommon.view.title.savesuccessfully`)
                .d('保存成功'),
            });
            }
            
          })
        }
      }
      if (isYesAnswer === 'YES' && purchaseFlag == 1) {
        if (data.length > 0) {
          // 保存应答表数据
          request(
            `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
            {
              method: 'POST',
              body: [newData],
            }
          ).then(() => {
            // 保存后查询表
            
            request(
              `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs`,
              {
                method: 'POST',
                body: param,
              }
            ).then((res) => {
              if (res) {
                
                this.setState({ groupUnsaveFlag: true })
                // notification.success();
                this.getSelectedRows();
              }
            })
          })
        } else {
          notification.error({
            message: intl
              .get(`bid.bidcommon.view.message.pleasecheckitem`)
              .d('请检查必填项并保存!'),
          });
        }
      } else {
        // 保存应答表数据
        if (purchaseFlag == 1) {
          request(
            `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
            {
              method: 'POST',
              body: [newData],
            }
          ).then(() => {
            
            this.setState({ groupUnsaveFlag: true, dataSource1: [], })
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
    }
  }



  /**
 * 删除 
 */
  @Bind()
  delete() {
    const { purchaseFlag, contractMaintain } = this.props;
    const { SelectPagination0, SelectPagination1 } = contractMaintain;
    const { selectedRowKeys, selectedRows, dataSource1 } = this.state
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      CusModal.confirm({
        content: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
        okType: 'normal',
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
              list.push({ tenBusiConfigId: item.tenBusiConfigId })
            })
            request(
              `${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs`,
              {
                method: 'DELETE',
                body: [...list]
              }
            ).then(() => {
              this.getSelectedRows();
            })
          }
          if (purchaseFlag === '0') {
            const newPagination0 = delItemsToPagination(
              selectedRows.length,
              dataSource1.length,
              SelectPagination0
            );
            this.updateContractMaintain(dataSource1, newPagination0, purchaseFlag);
          } else {
            const newPagination1 = delItemsToPagination(
              selectedRows.length,
              dataSource1.length,
              SelectPagination1
            );
            this.updateContractMaintain(dataSource1, newPagination1, purchaseFlag);
          }

          notification.success();
        },
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
    // console.log('groupUnsaveFlag')
    this.setState({ groupUnsaveFlag: true })
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
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
      CusModal.confirm({
        content: intl
          .get('bid.bidcommon.view.message.confirmgetout')
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okType: 'normal',
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
      mini: true,
    };
    const { getFieldDecorator = (e) => e } = form;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record._status === undefined || disabled,
      }),
    };
    // const { dataSource1 } = this.state;
    // console.log('dataSource1', dataSource1)
    dataSource1 = this.state.dataSource1
    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: getCurrentLanguage() === 'zh_CN' ? 62 : 125,
        fixed: 'left',
        dataIndex: 'orderSeq',
        render: (val, row, index) => {
          return (
            <div style={{ textAlign: 'center' }}>
              {index + 1}
            </div>
          );
        }
      },
      {
        title: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
        dataIndex: 'clause',
        required: !disabled,
        width: 500,
        render: (val, row) => {
          const { getFieldDecorator } = row.$form;
          return (
            disabled ? tooltipRender(val) :
              <FormItem>
                {getFieldDecorator('clause', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
                      }),
                    }, {
                      max: 1000,
                      message: intl.get(`bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist`).d('当前列表中不得超出最大长度1000字符')
                    }
                  ],
                })(
                  <CusInput.TextArea
                    autoChangeSize={true}
                    onChange={() => {
                      this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
                    }}
                  />
                )}
              </FormItem>
          );
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
        dataIndex: 'clauseDetail',
        width: 500,
        required: !disabled,
        render: (val, row) => {
          const { getFieldDecorator } = row.$form;
          return (
            disabled ? tooltipRender(val) :
              <FormItem>
                {getFieldDecorator('clauseDetail', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
                      }),
                    }, {
                      max: 1000,
                      message: intl.get(`bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist`).d('当前列表中不得超出最大长度1000字符')
                    }

                  ],
                })(
                  <CusInput.TextArea
                    autoChangeSize={true}
                    onChange={() => {
                      this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
                    }}
                  />
                )}
              </FormItem>
          );
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.keyindicators`).d('是否关键指标'),
        width: getCurrentLanguage() === 'zh_CN' ? 120 : 155,
        dataIndex: 'operator',
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            disabled ? tooltipRender(record.isLowestRequireMeaning) :
              <Form.Item>
                {getFieldDecorator('isLowestRequire', {
                  initialValue: record.isLowestRequire
                })(
                  <CusSelect
                    allowClear
                    options={yesNo}
                    style={{ width: '100%' }}
                  >
                  </CusSelect>
                )}
              </Form.Item>
          )
        }
      }
    ];
    // console.log('flag', purchaseFlag, getDetailList, getDetailList.isNeedAnswer, getDetailList.isNeedAnswerBusiness, (purchaseFlag == 0 ? getDetailList.isNeedAnswer == null : getDetailList.isNeedAnswerBusiness == null) ? intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择') : ((purchaseFlag == 0 ? getDetailList.isNeedAnswer == 0 : getDetailList.isNeedAnswerBusiness == 0) ? 'YES' : 'NO'))
    return (
      <CusSpin spinning={submitContractLoading || saving || uploadLoading || loading}>
        <Form className="customize-form" >
          <div
            style={{
              display: 'flex',
              float: 'right'
            }}
          >
            <div style={{ display: 'flex', }}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.requireditem`).d('线上应答')}
              >
                {getFieldDecorator(`${purchaseFlag == 0 ? 'isYes' : 'isYesAnswer'}`, {
                  initialValue: (purchaseFlag == 0 ? getDetailList.isNeedAnswer == null : getDetailList.isNeedAnswerBusiness == null) ? null : ((purchaseFlag == 0 ? getDetailList.isNeedAnswer == 0 : getDetailList.isNeedAnswerBusiness == 0) ? 'YES' : 'NO')
                })(
                  <CusSelect allowClear style={{ width: '100%' }}
                    disabled={disabled}
                    options={yesNo}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                    onChange={(e) => (
                      this.handleChangeFormItem(e, purchaseFlag),
                      this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
                    )}>
                  </CusSelect>
                )}
              </Form.Item>
              {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') &&
              !disabled &&
                <CusButton
                  loading={submitContractLoading}
                  onClick={() => this.handleDownloadTemplateClick()}
                  mini
                  disabled={disabled}
                >
                  {intl.get(`bid.bidcommon.view.button.download`).d('下载模板')}
                </CusButton>
              }
              {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') &&
                <CusExcelExport
                  requestUrl={`${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs/exportTenBusiConfigInfo?proId=${matchs.params.proId || -1}&fillerType=single-sheet&configType=${purchaseFlag}&fileName=应答表设置`}
                  otherButtonProps={otherButtonProps}
                  downloadType="Blob"
                  fileName={purchaseFlag == 0 ? intl
                    .get(`bid.bidcommon.view.title.technicalanswerformsetting`)
                    .d('技术应答表') : intl
                      .get(`bid.bidcommon.view.title.businessanswerformsetting`)
                      .d('商务应答表')}
                  buttonText={
                    <>
                      {intl.get('bid.bidcommon.view.button.export').d('导出')}
                    </>
                  }
                />
              }
            </div>
            {!disabled && <div style={{ float: 'right', display: 'flex' }}>
              {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') &&
                <Upload {...uploadProps}>
                  <CusButton
                    onClick={this.handleImport}
                    mini
                    disabled={disabled}
                    loading={uploadLoading}
                  >
                    {intl.get(`bid.bidcommon.view.button.import`).d('导入')}
                  </CusButton>
                </Upload>
              }
              {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') && selectedRowKeys.length > 0 &&
                <CusButton
                  loading={submitContractLoading}
                  onClick={this.delete}
                  mini
                  disabled={disabled}
                >
                  {intl.get(`bid.bidcommon.view.button.delete`).d('删除')}
                </CusButton>
              }
              {(purchaseFlag == 0 ? isYes === 'YES' : isYesAnswer === 'YES') &&
                <CusButton
                  loading={saving}
                  mini
                  onClick={() => this.add()}
                  disabled={disabled}
                >
                  {intl.get(`bid.bidcommon.view.button.add`).d('添加')}
                </CusButton>
              }
              {/* {(isYes || isYesAnswer) &&
                <CusButton
                  loading={submitContractLoading}
                  mini
                  onClick={this.save}
                  disabled={disabled}
                >
                  {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
                </CusButton>
              } */}
            </div>}
          </div>
        </Form>
        <CusModal
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
            <CusButton
              key="submit"
              type="plain"
              mini
              style={{ textAlign: 'center' }}
              onClick={this.handleOk}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </CusButton>
          </div>
        </CusModal>
        <div style={{ marginTop: '16px' }}>
          <EditTable
            rowSelection={rowSelection}
            rowKey="id"
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            dataSource={dataSource1}
            pagination={technologyPagination}
            onChange={(page) => this.handlePageChange(page)}
            onDataChange={this.handleDataChange}
          ></EditTable>
        </div>
      </CusSpin>
    );
  }
}
