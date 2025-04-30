/**
 * index.js - 中标结果提交审批
 * @date: 2022-04-20
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Collapse, Col, Input, Row } from 'antd';
import { tooltipRender } from '_cus_utils/render';
import CusModal from '_cus_components/CusModal';
import EditTable from '_cus_components/EditTable';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import StaticTextEditor from './StaticTextEditor';
import Lov from '_cus_components/CusLov';
import uuid from 'uuid/v4';
import { isUndefined } from 'lodash';
import { routerRedux } from 'dva/router';
import { getCurrentOrganizationId, getCurrentLanguage, createPagination, getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';
import CusNotification from '_cus_components/CusNotification';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { largeScreenWidth } from '_cus_utils/constants';
import searchIcon from '@/assets/searchIcon.svg';
import MaterialList from './materialList';
import ImproveMaterialList from './improveMaterial';
import { numberRender } from 'utils/renderer';

const { Panel } = Collapse;

let newTableSource = [];
@connect(({ loading = {}, contractBidWinningResult = {}, purchaseOrder = {} }) => ({
  fetchEnumLoading: loading.effects['contractBidWinningResult/fetchEnum'],
  saveInfoLoading: loading.effects['contractBidWinningResult/saveInfo'],
  savePoInfoLoading: loading.effects['purchaseOrder/savePoInfo'],
  submitPoLoading: loading.effects['purchaseOrder/submitPo'],
  featchLoading: loading.effects['contractBidWinningResult/getTableInfo'],
  contractBidWinningResult,
  purchaseOrder,
}))

@formatterCollections({
  code: ['bid.bidcommon', 'HKPC.commom']
})
@Form.create({ fieldNameProp: null })

export default class BidWinningResult extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    this.staticTextEditor = React.createRef();
    this.state = {
      emailModel: false,
      tenantId: getCurrentOrganizationId(),
      decisionBox: false,
      requestId: '',
      newBasicsInfo: [], // mip保存传的数据
      poHeadersId: match.params,
      finallyIsView: false, // 是否显示mip按钮
      approvalRequestButtonVOList: [], // 接收按钮信息
      saveModal: false,
      costRequestId: match.params.proId,
      isDisabled: false,
      editorKey: uuid(),
      content: '', // 编辑器内容
      prevContent: '', // 保存用来比较编辑内容是否改变
      applyForState: '',
      groupUnsaveFlag: false,
      number: 0, // 相同供应商数量
      activeKey: [
        'form',
        'table',
        'waitingfordecisioncontent',
        'budgetInfor',
        'purchaseLine',
        'improveMaterial',
        'inquiryInfo',
      ],
      screenWidth: window.innerWidth,
      materialModel: false,
      materialDataSource: [],
      materialPagination: {},
      selectedRowKeys: [],
      selectedRows: [],
      lineRecord: {},
      improveMaterialSource: [],
      materialFlag: false,
      purchaseCategoryVal: '',
    };
    this.cusApprovalBtns = React.createRef();
  }

  componentDidMount() {
    this.fetchEnum(); // 查询值集
    this.fetchBasicInfo();
    this.showDecision();
    this.getTableInfo();
    this.getImproveMaterial();
    // 该方法是用于 goToClose 页面调用的，用于关闭modal框的方法
    window.addEventListener('message', this.receiveMessage, false);

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseOrder/updateState',
      payload: {
        poHeader: {}, // 头信息
      },
    });
    window.addEventListener('message', this.receiveMessage, false);

    window.removeEventListener('resize', this.handleResize);
  }

  
  @Bind()
  handleResize() {
    this.setState({
      screenWidth: window.innerWidth
    })
  }

  @Bind
  getDerivedStateFromProps() {
    const { content, prevContent } = this.state;
    if (content !== prevContent) {
      this.setState({
        editorKey: uuid(),
        content: content || '',
        prevContent: content || '',
      })
    }
  }

  /**
   * 基本信息查询
  */
  @Bind
  fetchBasicInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getBasicInfo',
      payload: {
        proId: match.params.proId
      }
    }).then((res) => {
      if (res) {
        this.setState({ requestId: res.requestId, applyForState: res.applyForState, purchaseCategoryVal: res.purchaseCategory });
        // 待审核和审批通过状态禁止编辑
        if (res.applyForState === 'PENDING_APPROVAL' || res.applyForState === 'APPROVED') {
          this.setState({ isDisabled: false })
        } else {
          this.setState({ isDisabled: true })
        }
        if (res.requestId) {
          this.setState({ finallyIsView: true, isDisabled: false })
          this.showDecision();
          this.approvalProcess(res.requestId)
        }
        if(res.purchaseCategory) {
          this.setState({
            materialFlag: false
          })
        } else {
          this.setState({
            materialFlag: true
          })
        }
      }
    })
  }

  /**
   * 表查询
  */
  @Debounce(200)
  @Bind
  getTableInfo(page = {}) {
    const { dispatch, match } = this.props;
    const { requestId } = this.state;
    dispatch({
      type: 'contractBidWinningResult/getTableInfo',
      payload: {
        page,
        proId: match.params.proId,
        state: 1, //0 表示不需要供应商编码  1 表示需要
      }
    }).then(res => {
      if (res && res.content) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
        }));
        dispatch({
          type: 'contractBidWinningResult/updateState',
          payload: {
            tableSource: newDataSource,
            tablePagination: pagination,
          },
        });
        // let isRequestid = '';
        // for (let i = 0; i < res.content.length; i++) {
        //   isRequestid = res.content[i].requestId
        // }
        if (requestId) {
          // this.setState({finallyIsView: true})
          this.approvalProcess(requestId)
        } else {
          this.setState({ isDisabled: true })
        }
        this.setState({ groupUnsaveFlag: false })
      }
    });
  }

  /**
   * 查询值集
   */
  @Bind
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/init',
    });
  }

  // 打开结果查看的邮件预览弹框
  @Bind
  previewEmail(record) {
    // const { isDisabled } = this.state;
    if (record.isBeChosen && record.isBeChosen.length > 0) {
      this.getTableEmailInfo(record)
    }
  }

  /**
   * 邮件模板的预览
  */
  @Bind
  getTableEmailInfo(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getTableEmailInfo',
      payload: {
        supplierId: record.supplierId,
        isBeChosen: record.isBeChosen,
      }
    }).then((res) => {
      if (res) {
        this.setState({
          emailModel: true,
        })
      }
    })
  }

  @Bind
  changeChosen(value, lovRecord, record, index) {
    const { contractBidWinningResult: { infoSource, tableSource } } = this.props;
    if (record.$form != undefined && value !== undefined) {
      record.$form.setFieldsValue(
        record.isBeChosen = lovRecord.props.value, // 'YES','NO'
      );
      if (lovRecord.props.value === 'YES') {
        this.setState(() => {
          tableSource[index].$form.validateFields(['supplierNum'], { force: true })
        },
        )
        if (record.promptContent) {
          CusNotification.warning({ message: record.promptContent, closable: false });
        }
      } else {
        // tableSource[index].$form.resetFields('supplierNum');
        let num = 0;
        record.supplierNum = '';
        record.supplierNumName = '';
        tableSource.map((it) => {
          if (it.supplierNum === record.companyNum) {
            num += 1;
          }
        })
        this.setState({ number: num })
        // this.setState(() => {
        //   tableSource[index].$form.validateFields(['supplierNum'], { force: false })
        //   },
        // )
      }
    } else {
      if (value === 'result') {
        record.setFieldsValue(
          infoSource.informRejectResult = lovRecord.props.value,
        );
      }
      if (value === 'state') {
        record.setFieldsValue(
          infoSource.applyForState = lovRecord.props.value,
        );
      }
      // 处理清空选择框的值
      if (value === undefined) {
        record.isBeChosen = '';
      }
    }
  }

  @Bind()
  handleCancel() {
    this.setState({
      emailModel: false,
    })
  }

  @Bind()
  handleMaterialCancel() {
    this.setState({
      materialModel: false,
    })
  }

  // 单独保存采购结果
  @Bind()
  handleSaveOnlyResult(cb = e => e) {
    const { dispatch } = this.props;
    const { lineRecord } = this.state;
    dispatch({
      type: 'contractBidWinningResult/saveOnlyResult',
      payload: {
        dataList: [
          {
            bidResult: lineRecord.isBeChosen,
            id: lineRecord.supplierId
          }
        ],
      }
    }).then((res) => {
      if(res) {
        cb(res);
      }
    })
  }

  // 物料名称弹框确认
  @Bind()
  handleSaveMaterial() {
    const { dispatch } = this.props;
    const { selectedRowKeys = [], selectedRows = [] } = this.state;
    console.log('selectedRows', selectedRows)
    if(selectedRowKeys.length > 0) {
      dispatch({
        type: 'contractBidWinningResult/saveMaterial',
        payload: {
          selectedRows
        }
      }).then((res) => {
        if(res) {
          this.handleSaveOnlyResult((valList) => {
            if(valList.length > 0) {
              this.setState({
                materialModel: false
              })
              this.getTableInfo();
            }
          })
        }
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
    }
  }

  @Bind()
  onEditChange(val) {
    this.setState({ content: val })
  }

  @Bind()
  handleSaveImproveMaterial(params, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/saveImproveMaterial',
      payload: {
        improveMaterialList: params,
      }
    }).then(res => cb(res))
  }

  // 保存
  @Bind()
  @Debounce(200)
  goSave(record, cb = (e) => e) {
    const { dispatch, match, contractBidWinningResult: { infoSource, tableSource } } = this.props;
    const { content, number, purchaseCategoryVal, improveMaterialSource = [] } = this.state;
    if (number > 1) {
      CusNotification.error({ message: '一个供应商的编码只能绑定一个临时供应商' });
    } else {
      let basicsInfo = {};
      let bidSuppliers = [];
      basicsInfo.proId = match.params.proId;
      for (let i = 0; i < tableSource.length; i++) {
        bidSuppliers.push(
          {
            id: tableSource[i].supplierId,
            supplierNum: tableSource[i].supplierNum, //供应商编号
            supplierNumName: tableSource[i].supplierNumName,
            supplierName: tableSource[i].supplierName,
            bidResult: tableSource[i].isBeChosen,
          }
        )
        if (tableSource[i].isBeChosen === 'YES') {
          this.setState(() => {
            tableSource[i].$form.validateFields(['supplierNumName'], { force: true })
          },
          )
        }
      }
      basicsInfo.decisionContent = content;
      basicsInfo.informRejectResult = infoSource.informRejectResult;
      basicsInfo.purchaseCategory = purchaseCategoryVal;
      // basicsInfo.applyForState = infoSource.applyForState;
      basicsInfo.bidSuppliers = bidSuppliers
      this.setState({ newBasicsInfo: basicsInfo })
      this.props.form.validateFieldsAndScroll((err, values) => {
        const newData = getEditTableData(tableSource).map((item) =>
          item
        );
        const improveMaterialData = getEditTableData(improveMaterialSource);
        this.handleSaveImproveMaterial(improveMaterialData, (n) => {
            
        })
        console.log('improveMaterialData', improveMaterialData)
        if (!err && newData.length > 0 && improveMaterialData.length > 0) {
          console.log('newData', newData)
          dispatch({
            type: 'contractBidWinningResult/saveInfo',
            payload: {
              basicsInfo,
            }
          }).then((res) => {
            if (res) {
              this.handleSaveImproveMaterial(improveMaterialData, (n) => {
                if(n) {
                  CusNotification.success({
                    message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
                  });
                  // 显示决策内容
                  this.showDecision()
                  this.getTableInfo()
                  this.setState({ requestId: res.requestId })
                  record.applyForState = res.applyForState;
                  if (res.requestId) {
                    record.applyForState = res.applyForState;
                    this.approvalProcess(res.requestId)
                  }
                  cb();
                }
              });
            }
          });
        }
      })
    }
  }
  /**
   * 监听事件回调方法
   * @param param
   */
  @Bind
  receiveMessage(param) {
    const {
      data: { routerParam = {} },
    } = param;
    if (routerParam.opt === 'ok') {
      this.fetchBasicInfo();
      this.getTableInfo();
      this.showDecision();
      CusModal.destroyAll();
      this.handleCloseModal();
      // 飞书提交审批后关闭tag页
      // try {
      //   window.h5sdk.ready(function () {
      //     window.h5sdk.biz.navigation.close({
      //       onSuccess(result) {
      //         console.log(result);
      //       },
      //     });
      //   });
      // } catch (e) {
      //   console.log(e);
      // }
    } else if (routerParam.opt === 'close') {
      this.fetchBasicInfo();
      this.getTableInfo();
      this.showDecision();
      CusModal.destroyAll();
    } else if (routerParam.opt === 'refresh') {
      CusModal.destroyAll();
      // 原意打算使用tab中的刷新，无奈改动太大，等后期有提出需求的时候再做变更
      window.location.reload();
    }
  }

  /**
   * 关闭 CusModal
   */
  @Bind()
  handleCloseModal() {
    const { match, dispatch } = this.props;
    const flag = match.params.mipBack
    if (flag === 'mipBack') {
      dispatch(
        routerRedux.push({
          // 路由跳转
          pathname: `/pub/sspo/online-purchase/detail1/${match.params.proId}/proId`,
        })
      );
    } else {
      window.close();
      // 飞书提交审批后关闭tag页
      try {
        window.h5sdk.ready(function () {
          window.h5sdk.biz.navigation.close({
            onSuccess(result) {
              console.log(result);
            },
          });
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  // MIP审批明细查询
  @Bind
  approvalProcess(getMipId) {
    const { dispatch } = this.props;
    const { applyForState } = this.state;
    dispatch({
      type: 'contractBidWinningResult/approvalProcess',
      payload: {
        requestId: getMipId,
        organizationId: getCurrentOrganizationId(),
      }
    }).then((res) => {
      if (res) {
        this.setState({
          approvalRequestButtonVOList: res.approvalRequestButtonVOList
        })
        // 待审核和审批通过状态禁止编辑
        if (applyForState === 'PENDING_APPROVAL' || applyForState === 'APPROVED') {
          this.setState({ isDisabled: false })
        } else {
          this.setState({ isDisabled: true })
        }
        this.setState({ finallyIsView: true })
        // 显示mip发起审批的按钮
        // this.generateBtns()
      }
    })
  }

  // 保存后显示决策内容
  @Bind
  showDecision() {
    const { dispatch, match } = this.props;
    const { requestId } = this.state;
    dispatch({
      type: 'contractBidWinningResult/getDecision',
      payload: {
        proId: match.params.proId
      }
    }).then((res) => {
      if (res) {
        if (requestId) {
          this.approvalProcess(requestId)
        }
      }
      if (res.result != 'NO') {
        this.setState({
          content: res.content,
          decisionBox: true
        })
      } else {
        this.setState({
          content: res.content,
          decisionBox: false
        })
      }
      this.getDerivedStateFromProps()
    });
  }

  @Bind
  addObjectToList = (arr, obj) => {
    const existingObj = arr?.find((item) => {
      // 判断对象是否已存在，这里以 id 属性作为判断依据
      return item.buttonKey === obj.buttonKey;
    });
    if (!existingObj) {
      arr.push(obj);
    }
    return arr;
  };

  @Bind
  approvalButtonClick(record) {
    const { contractBidWinningResult } = this.props;
    const { infoSource } = contractBidWinningResult;
    if (record.buttonKey === 'saveName') {
      this.goSave(infoSource);
    } else {
      // 打开mip弹框
      this.cusApprovalBtns?.current?.openModal(record);
    }
  }

  /**
   * 渲染审批按钮
   * @returns {unknown[]}
   */
  @Bind
  generateBtns() {
    const { approvalRequestButtonVOList, isDisabled } = this.state;
    approvalRequestButtonVOList.map((item) => {
      if(item.buttonKey === 'forwardName') {
        item.buttonOrder = 15
      }
    })
    console.log(approvalRequestButtonVOList)
    const isEn = getCurrentLanguage() === 'en_US';
    if(isDisabled) {
      this.addObjectToList(approvalRequestButtonVOList, {
        nameE: intl.get('hzero.common.button.save').d('保存'),
        name: intl.get('hzero.common.button.save').d('保存'),
        buttonOrder: 3,
        buttonKey: 'saveName',
      });
    }
    return (
      <>
        {
          approvalRequestButtonVOList && approvalRequestButtonVOList
          .sort((one, two) => {
            return one.buttonOrder - two.buttonOrder;
          }).map((item, index) => {
            return (
              <CusButton
                key={index}
                type={index === 0 ? 'primary' : 'normal'}
                onClick={() => this.openModal(item)}
              >
                {isEn ? item.nameE : item.name}
              </CusButton>
            )
          })
        }
      </>
    )
  }

  // 更换modalContainer的类名控制能否移动
  @Bind
  switchModalContainerClassName(flag) {
    if (flag) {
      const container = document.querySelector('.c7n-pro-modal-container');
      if (container) {
        container.className = styles['c7n-pro-modal-container-moveable'];
      }
    } else {
      const container = document.querySelector(`.${styles['c7n-pro-modal-container-moveable']}`);
      if (container) {
        container.className = 'c7n-pro-modal-container';
      }
    }
  }

  @Bind
  openModal(record) {
    const { contractBidWinningResult } = this.props;
    const { infoSource } = contractBidWinningResult;
    if (record.buttonKey === 'submitName') {
      const { form } = this.props;
      let validateResult = true;
      let errMessageList = [];
      const { validateFieldsAndScroll = (e) => e } = form;
      validateFieldsAndScroll((err) => {
        if (err) {
          for (let child in err) {
            errMessageList.push(err[child].errors[0].message);
          }
          validateResult = false;
        };
      });
      if (validateResult) {
        this.goSave(infoSource, () => {
          this.cusApprovalBtns?.current?.openModal({ ...record })
        })
      } else {
        const description = (
          <div>
            {errMessageList.map((item) => (
              <p style={{ marginBottom: '0px' }}>{item}</p>
            ))}
          </div>
        );
        CusNotification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: description,
        });
      }
    } else if (record.buttonKey === 'saveName') {
      this.goSave(infoSource);
    } else {
      this.cusApprovalBtns?.current?.openModal({ ...record });
    }
  }

  @Bind
  fetchData(times) {
    const { requestId } = this.state;
    this.handleNotice();
    this.setState({
      generalRequestLoading: true,
    });
    // 去查询审批数据
    this.requestRound(requestId, times);
  }

  @Bind
  requestRound(targetHeaderId, times = 30, nextTime = 0) {
    const { requestId } = this.state;
    if (times <= 0) {
      this.setState({
        generalRequestLoading: false,
      });
      return;
    }
    this.timeout = setTimeout(() => {
      // 根据requestType去查询获得通用审批的数据内容，设置定时器，在结束上一个请求的2s之后再执行下一次的。
      this.approvalProcess(requestId);
    }, nextTime);
  }


  /**
    * 按钮状态变更
    * @param {string} btn - 指示是哪个按钮
    */
  @Bind()
  getButtonStatus(btn = '') {
    const {
      purchaseOrder: {
        poHeader: { poStatus }, // 从model获取当前页面需要控制的按钮的状态
      },
    } = this.props;
    const obj = {
      // NEW 起草
      // COMMITED 已提交
      // CANCELED 已取消
      // APPROVED 审批通过
      // REJECTED 审批拒绝
      // CANCELING 取消中
      // 	APPROVING 审批中
      // TERMINATION 已终止
      // STARTCANCEL 发起取消/终止
      cancel: {
        NEW: false,
        COMMITED: false,
        APPROVED: false,
        REJECTED: false,
      },
      RDrafting: {
        COMMITED: false,
        APPROVED: false,
      },
      submit: {
        NEW: false,
        REJECTED: false,
      },
      submit1: {
        NEW: false,
      },
      save: {
        NEW: false,
        REJECTED: false,
        STARTCANCEL: false,
      },
      save1: {
        NEW: false,
        STARTCANCEL: false,
      },
      revoke: {
        STARTCANCEL: false,
      },
      return: {},
    };
    return isUndefined(obj[btn][poStatus]); // 获得该按钮在当前状态是否可编辑
  }

  @Bind
  changeSupplierNum(item, record, index) {
    const { form, contractBidWinningResult: { tableSource } } = this.props;
    let num = 0;
    form.setFieldsValue({ supplierNum: item.companyNum })
    form.setFieldsValue({ supplierNumName: item.companyName })
    // 选择供应商编码的时候校验该编码是否被选择过
    tableSource.map((it) => {
      if (it.supplierNum === item.companyNum) {
        num += 1;
      }
    })
    this.setState({ number: num })
    if (num > 1) {
      CusNotification.error({ message: '一个供应商的编码只能绑定一个临时供应商' });
    }
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   */
  @Bind
  handleDataChange() {
    this.setState({ groupUnsaveFlag: true })
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
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
          this.getTableInfo(page);
        },
      });
    } else {
      this.getTableInfo(page);
    }
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

  onSearchBtnClick = (record) => {
    const { dispatch, match } = this.props;
    const { proId } =  match.params;
    dispatch({
      type: 'contractBidWinningResult/getMaterialName',
      payload: {
        supplierId: record.supplierId,
        proId: proId
      }
    }).then((res) => {
      if (res) {
        // const { content = [] } = res;
        // const pagination = createPagination(res);
        const newDataSource = res.map((item) => ({
          ...item,
          supplierId: record.supplierId,
          proId: proId,
          _status: 'update',
          poOrderId: uuid(),
        }));
        const initialSelectedRowKeys = newDataSource.filter(item => item.ordersNumber).map(item => item.poOrderId);
        this.setState({
          materialModel: true,
          materialDataSource: newDataSource,
          lineRecord: record,
          selectedRowKeys: initialSelectedRowKeys,
          // materialPagination: pagination
        })
      }
    })
  }

  @Bind
  getImproveMaterial() {
    const { dispatch, match } = this.props;
    const { proId } =  match.params;
    dispatch({
      type: 'contractBidWinningResult/getImproveMaterial',
      payload: {
        proId: proId
      }
    }).then((res) => {
      if (res) {
        // const { content = [] } = res;
        // const pagination = createPagination(res);
        const newDataSource = res.map((item) => ({
          ...item,
          // supplierId: record.supplierId,
          // proId: proId,
          _status: 'update',
          poOrderId: uuid(),
        }));
        this.setState({
          improveMaterialSource : newDataSource,
          // materialPagination: pagination
        })
      }
    })
  }

  // 选择否的时候清除剩余数量
  @Bind
  clearMaterial(record) {
    const { dispatch, match } = this.props;
    const { proId } =  match.params;
    dispatch({
      type: 'contractBidWinningResult/delMaterial',
      payload: {
        proId: proId,
        supplierId: record.supplierId,
      }
    }).then((res) => {
      if(res.message === 'ok') {
        record.beSelectedMoney = null;
        record.materialName = null;
      }
    })
  }

  render() {
    const {
      contractBidWinningResult,
      form = {},
      match,
      featchLoading = false,
      saveInfoLoading,
    } = this.props;
    const { infoSource = [], tableSource = [], tablePagination = {}, enumMap = {} } = contractBidWinningResult;
    const {
      tenantId,
      decisionBox,
      finallyIsView,
      emailModel,
      isDisabled,
      activeKey,
      showMore,
      screenWidth,
      materialModel,
      materialDataSource,
      materialPagination,
      selectedRowKeys = [],
      improveMaterialSource = [],
      materialFlag,
    } = this.state;

    newTableSource = tableSource
    const { yesNo = [], status = [], category} = enumMap;
    const {
      proName,
      packageNo,
      packageName,
      proCode,
      informRejectResult,
      applyForState,
      purchaseCategory,
    } = infoSource;
    const { getFieldDecorator } = form;
    const suffix = (
      <>
        <div
          className="cus-lov-clear"
        />
        {this.searchButton()}
      </>
    );
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: getCurrentLanguage() === 'zh_CN' ? 445 : 355,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.choosesuppliers`).d('选择供应商'),
        dataIndex: 'supplierNumName',
        width: getCurrentLanguage() === 'zh_CN' ? 405 : 355,
        render: (val, record, index) => {
          if (record.$form != undefined) {
            if (record.isBeChosen === 'YES') {
              return (
                (!isDisabled || record.isBeChosen === '' || record.isBeChosen === null || record.isBeChosen === 'NO') ? tooltipRender(record.supplierNumName) :
                  <Form.Item>
                    {record.$form.getFieldDecorator('supplierNumName', {
                      initialValue: record.supplierNumName == 'abandon' ? '' : record.supplierNumName,
                      // rules: [{
                      //   required: record.isBeChosen === 'YES',
                      //   message: intl.get('hzero.common.validation.notNull', {
                      //     name: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
                      //   })
                      // }]
                    })(
                      <Lov placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                        disabled={!isDisabled || record.isBeChosen === '' || record.isBeChosen === null || record.isBeChosen === 'NO'}
                        code='BID.CHOOSESUPPLIERS'
                        queryParams={{ tenantId }}
                        textValue={record.supplierNumName == 'abandon' ? '' : record.supplierNumName}
                        onChange={(text, item) => {
                          record.supplierNumName = item.companyName
                          record.supplierNum = item.companyNum
                          this.changeSupplierNum(item, record, index)
                          this.handleDataChange()
                        }}
                      />
                    )}
                  </Form.Item>
              )
            } else {
              return (
                (!isDisabled || record.isBeChosen === '' || record.isBeChosen === null || record.isBeChosen === 'NO') ? tooltipRender(record.supplierNumName) :
                  <Form.Item>
                    <Lov placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                      disabled={!isDisabled || record.isBeChosen === '' || record.isBeChosen === null || record.isBeChosen === 'NO'}
                      code='BID.CHOOSESUPPLIERS'
                      queryParams={{ tenantId }}
                      textValue={''}
                    />
                  </Form.Item>
              )
            }
          }
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.whetherthebidwasw1on').d('物料名称'),
        dataIndex: 'materialName',
        width: 200,
        render: (_, record) => {
          console.log('record', record.materialName)
          return (
            (!isDisabled || record.isBeChosen === '' || record.isBeChosen === null || record.isBeChosen === 'NO') ?
            <Form.Item>
              {record.$form.getFieldDecorator(`materialName`, {
              })(
                <div>{tooltipRender(record.isBeChosen === 'NO' ? null : record.materialName)}</div>
              )}
            </Form.Item>
             :
            <Form.Item>
              <Input
                readOnly
                suffix={suffix}
                className={styles['lov-input']}
                value={record.materialName ? record.materialName : null}
                style={{ cursor: 'pointer', color: '#666' }}
                onClick={() => {
                  this.onSearchBtnClick(record)
                }}
              />
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
        dataIndex: 'orderSeq',
        width: getCurrentLanguage() === 'zh_CN' ? !isDisabled ?90 : 91 : 213,
        render: (_, record, index) => {
          if (record.$form != undefined) {
            return (
              !isDisabled ? tooltipRender(record.isBeChosen == 'YES' ? intl.get(`hzero.common.status.yes`).d('是') : intl.get(`hzero.common.status.no`).d('否')) :
                <Form.Item>
                  {record.$form.getFieldDecorator(`isBeChosen${index}`, {
                    initialValue: record.isBeChosen != undefined ? record.isBeChosen : '',
                    // validateTrigger: 'onChange',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
                        })
                      }
                    ]
                  })(
                    <CusSelect
                      options={yesNo}
                      lazyLoad={false}
                      disabled={!isDisabled}
                      onChange={(value, lovRecord) => {
                        this.changeChosen(value, lovRecord, record, index);
                        this.handleDataChange();
                        if(value === 'NO') {
                          this.clearMaterial(record)
                        }
                      }}
                    />
                  )}
                </Form.Item>
            )
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.mailcontent1`).d('中选金额'),
        dataIndex: 'beSelectedMoney',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`beSelectedMoney`, {
              })(
                <div style={{textAlign: 'right'}}>{record.isBeChosen === 'NO' ? null : numberRender(record.beSelectedMoney, 2)}</div>
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.mailcontent`).d('邮件查看'),
        dataIndex: 'operator',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (_, record) => {
          return (
            <CusButton
              type="plain"
              onClick={() => this.previewEmail(record)}
            >
              {intl.get(`bid.bidcommon.bid.button.Preview`).d('预览')}
            </CusButton>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.approvalstatus`).d('审批结果'),
        dataIndex: 'operation',
        width: getCurrentLanguage() === 'zh_CN' ? 95 : 146,
        render: (text, record) => {
          if (record.result === 'pass') {
            return (
              tooltipRender(intl.get(`bid.bidcommon.bid.button.Adopt`).d('通过'))
            )
          } else if (record.result === 'reject') {
            return (
              tooltipRender(intl.get(`bid.bidcommon.view.title.reject`).d('驳回'))
            )
          }
        }
      },
    ];
    const tableList = {
      dataSource: tableSource,
      columns,
      pagination: tablePagination,
      contractBidWinningResult,
      onChange: (page) => this.handlePageChange(page),
      onDataChange: this.handleDataChange,
    };

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
    };

    const materialProps = {
      dataSource: materialDataSource,
      pagination: materialPagination,
      rowSelection,
      ...this.props,
    };

    const improveMaterialListProps = {
      dataSource: improveMaterialSource,
      materialFlag,
      ...this.props,
    };

    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    const gridSpan = getDFormGridSpan();

    // 小屏为false，大屏为true
    const isShow = screenWidth < largeScreenWidth;

    return (
      <>
        <PageWrapper loading={saveInfoLoading || featchLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <Form className="customize-form">
                <GenerateFormGrid isPackUp={isShow} defaultPackUp={false}>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                    >
                      {getFieldDecorator('proCode', {
                        initialValue: proCode,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.purchaseschemename').d('采购方案名称')}
                    >
                      {getFieldDecorator('proName', {
                        initialValue: proName,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                    >
                      {getFieldDecorator('packageNo', {
                        initialValue: packageNo,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                    >
                      {getFieldDecorator('packageName', {
                        initialValue: packageName,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.informsupplierlose').d('通知落选者结果')}
                    >
                      {getFieldDecorator('informRejectResult', {
                        initialValue: informRejectResult,
                        rules: [{
                          required: informRejectResult === '',
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`bid.bidcommon.view.title.informsupplierlose`).d('通知落选者结果'),
                          })
                        }]
                      })(
                        <CusSelect
                          options={yesNo}
                          lazyLoad={false}
                          allowClear
                          disabled={!isDisabled}
                          onChange={(_, lovRecord) => { this.changeChosen('result', lovRecord, form) }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.applystatus').d('申请状态')}
                    >
                      {getFieldDecorator('applyForState', {
                        initialValue: applyForState != '' ? applyForState : '',
                        rules: [{
                          required: false,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`bid.bidcommon.view.title.informsupplierlose`).d('申请状态'),
                          })
                        }]
                      })(
                        <CusSelect
                          options={status}
                          lazyLoad={false}
                          allowClear
                          disabled
                          onChange={(_, lovRecord) => { this.changeChosen('state', lovRecord, form) }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </GenerateFormGrid>
              </Form>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.Pure`).d('采购结果')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >
              <EditTable {...tableList}></EditTable>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.waitingfordecisioncontent`).d('推荐供应商意见')}
                  arrowActive={activeKey.includes('waitingfordecisioncontent')}
                />
              }
              key="waitingfordecisioncontent"
            >
              <StaticTextEditor
                key={this.state.editorKey}
                content={this.state.prevContent}
                onRef={staticTextEditor => {
                  this.staticTextEditor = staticTextEditor;
                }}
                onEditChange={this.onEditChange}
              />
            </Panel>
            <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`bid.bidcommon.view.title.waitingfordecisioncontent1`).d('询价信息')}
                    arrowActive={activeKey.includes('inquiryInfo')}
                  />
                }
                key="inquiryInfo"
              >
                <Form className="customize-form">
                  <Row>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get('bid.bidcommon.view.title.purchaseschemeno1').d('采购类别')}
                      >
                        {getFieldDecorator('purchaseCategory', {
                          initialValue: purchaseCategory,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get(`himp.template.model.template.columnType1`).d('采购类别'),
                              }),
                            },
                          ],
                        })(
                          <CusSelect
                            options={category}
                            lazyLoad={false}
                            allowClear
                            onChange={(value) => {
                              if(value) {
                                this.setState({
                                  materialFlag: false
                                })
                              } else {
                                this.setState({
                                  materialFlag: true
                                })
                              }
                              this.setState({
                                purchaseCategoryVal: value
                              })
                            }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`bid.bidcommon.view.title.waitingfordecisioncontent1`).d('采购申请行/预算信息')}
                    arrowActive={activeKey.includes('improveMaterial')}
                  />
                }
                key="improveMaterial"
              >
                <ImproveMaterialList {...improveMaterialListProps} />
              </Panel>
            <div style={{display: 'none'}}>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`bid.bidcommon.view.title.waitingfordecisioncontent1`).d('预算信息')}
                    arrowActive={activeKey.includes('budgetInfor')}
                  />
                }
                key="budgetInfor"
              >
                <div>此处预算信息</div>
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`bid.bidcommon.view.title.waitingfordecisioncontent1`).d('采购申请行/预算信息')}
                    arrowActive={activeKey.includes('purchaseLine')}
                  />
                }
                key="purchaseLine"
              >
                <div>此处采购申请行/预算信息</div>
              </Panel>
            </div>
          </Collapse>
        </PageWrapper>
        <CusModal
          title={intl.get(`bid.bidcommon.view.title.mailcontent`).d('邮件查看')}
          visible={emailModel}
          footer={
            <CusButton
              onClick={this.handleCancel}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          }
        >
          <div dangerouslySetInnerHTML={{ __html: this.props.contractBidWinningResult.tableEmailSource }}></div>
        </CusModal>
        <CusModal
          title={intl.get(`bid.bidcommon.view.title.mailconten1t`).d('物料名称')}
          visible={materialModel}
          width={800}
          onOk={this.handleSaveMaterial}
          onCancel={this.handleMaterialCancel}
        >
          <MaterialList {...materialProps} />
        </CusModal>
        <CusApprovalButtons
          ref={this.cusApprovalBtns}
          onOk={() => this.fetchData(1)}
        >
          {this.generateBtns()}
        </CusApprovalButtons>
      </>
    )
  }
}