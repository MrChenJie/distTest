/*
 * index.js - ERP工作台 
 * @date: 2022/05/23 10:54:30
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Button, Card, Form, Spin, Modal, LocaleProvider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
// eslint-disable-next-line camelcase
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import {
  // addItemsToPagination,
  // delItemsToPagination,
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  getCurrentLanguage,
} from 'utils/utils';
import notification from 'utils/notification';
import { queryIdpValue } from 'services/api';

// import { addItemToPagination } from 'hzero-front/lib/utils/utils';
import { getCurrentUser } from 'hzero-front/lib/utils/utils';
// import BasicInfo from './components/BasicInfo';
// import ContractInfo from './components/ContractInfo';
// import PurchaseOrderSummary from './components/PurchaseOrderSummary';
// import PurchaseOrderMilestones from './components/PurchaseOrderMilestones';
// import ContractSignSetting from './components/ContractSignSetting';
// import ContractAttachment from './components/ContractAttachment';
// import styles from './index.less';
// import ApprovalHistory from './components/ApprovalHistory';

const currentLanguage = getCurrentLanguage();

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sodr.procurementContract'],
})
@connect(({ procurementContract, loading }) => ({
  procurementContract,
  organizationId: getCurrentOrganizationId(),
  saveLoading: loading.effects['procurementContract/saveHeader'],
  fetchLoading: loading.effects['procurementContract/fetchHeader'],
  confirmLoading: loading.effects['procurementContract/contractConfirm'],
  editSlaLoading: loading.effects['procurementContract/contractPresignurl'],
  querySlaLoading: loading.effects['procurementContract/contractViewrichtext'],
  contractSignLoading: loading.effects['procurementContract/contractSignurl'],
  fetchAttachmentLoading: loading['procurementContract/listPoConAttach'],
  deleteAttachLoading: loading.effects['procurementContract/deleteAttach'],
  cancelConfirmationLoading: loading.effects['procurementContract/cancelConfirmation'],
  submitLoading: loading.effects['procurementContract/submitPoConHeader'],
  deletePoConLinesLoading: loading.effects['procurementContract/deletePoConLines'],
  queryApprovalHistoryLoading: loading.effects['procurementContract/queryApprovalHistory'],
  cancelContractLoading: loading.effects['procurementContract/cancelContract'],
  submitReversePoConHeaderLoading: loading.effects['procurementContract/submitReversePoConHeader'],
}))
export default class ProcurementContract extends Component {
  constructor(props) {
    super(props);
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    const { pendingFlag } = querystring.parse(this.props.location.search.substr(1));
    this.state = {
      pendingFlag,
      open,
      isPub,
      orderMilestoneVisible: true,
      downloadContractLoading: false,
      previewContractLoading: false,
      soUrl: undefined,
      supportElectronicLovDatas: [],
      supportElectronic: false, // 支持电子签署
      contractExecutionStatusList: [],
    };
  }

  componentDidMount() {
    this.init();
    this.handleQueryHeader();
    this.handleQueryAttachment();
    this.loadIbossSoUrl();
    this.handleQueryApprovalHistory();
    this.handleQueryContractExecutionStatusList();
  }

  @Bind()
  init() {
    const { dispatch } = this.props;
    const currentUser = getCurrentUser();
    const { id, currentRoleId } = currentUser;
    dispatch({
      type: 'procurementContract/permissions',
      payload: {
        routePath: '/sodr/procurement-contract',
        userId: id,
        roleId: currentRoleId,
      },
    });
  }

  @Bind()
  handleQueryContractExecutionStatusList() {
    queryIdpValue('SPUC.CONTRACT_EXECUTION_STATUS').then((res) => {
      this.setState({
        contractExecutionStatusList: res,
      });
    });
  }

  @Bind()
  loadIbossSoUrl() {
    const { dispatch } = this.props;
    dispatch({
      type: 'procurementContract/loadIbossUrls',
      payload: {
        lovCode: 'SPUC.IBOSS_SO_URL',
      },
    }).then((res) => {
      if (res) {
        // 销售合同对应的值集里的值
        const soValue = 'IBOSS_SO_URL';
        const soUrl = (res.find((item) => item.value === soValue) || {}).tag;
        this.setState({
          soUrl,
        });
      }
    });
  }

  @Bind()
  handleShowOrderMilestones() {
    this.setState({
      orderMilestoneVisible: true,
    });
  }

  /**
   * 保存
   *
   * @memberof ProcurementContract
   */
  @Bind()
  handleSave(callback, flag) {
    const { form = {}, dispatch, procurementContract } = this.props;
    const {
      headerData = {},
      purchaseOrderDatasource = [],
      contractAttachmentDataSource = [],
    } = procurementContract;
    const { validateFieldsAndScroll = (e) => e } = form;
    // 不校验保存
    if (!flag) {
      const newPurchaseOrderDatasource = purchaseOrderDatasource.map((item) => {
        return item.$form
          ? {
              ...item,
              ...item.$form.getFieldsValue(),
            }
          : item;
      });
      const contractAttachmentData = contractAttachmentDataSource.map((item) => {
        return item.$form
          ? {
              ...item,
              ...item.$form.getFieldsValue(),
            }
          : item;
      });

      const values = form.getFieldsValue();

      const saveHeader = new Promise((resolve, reject) => {
        dispatch({
          type: 'procurementContract/saveHeader',
          payload: {
            ...headerData,
            ...values,
            plannedStartDate:
              values.plannedStartDate && values.plannedStartDate.format('YYYY-MM-DD 00:00:00'),
            plannedEndDate:
              values.plannedEndDate && values.plannedEndDate.format('YYYY-MM-DD 00:00:00'),
            poConLinesList: headerData.poConLinesList.map((item, index) => ({
              ...item,
              poHeadersList: [newPurchaseOrderDatasource[index]],
              _status: 'update',
            })),
            _status: 'update',
            poConAttachList: [],
          },
        }).then((res) => {
          if (res) {
            resolve(res);
          } else {
            reject();
          }
        });
      });
      const saveAttachment = new Promise((resolve, reject) => {
        if (contractAttachmentDataSource.length > 0) {
          dispatch({
            type: 'procurementContract/poConAttachsSave',
            payload: {
              contractHeaderId: headerData.contractHeaderId,
              contractAttachmentData,
            },
          }).then((res) => {
            if (res) {
              this.handleQueryAttachment();
              resolve(res);
            } else {
              reject();
            }
          });
        } else {
          resolve();
        }
      });

      Promise.all([saveHeader, saveAttachment]).then((res) => {
        if (res) {
          if (typeof callback === 'function') {
            callback();
          } else {
            this.handleQueryHeader();
            this.handleQueryAttachment();
            notification.success();
          }
        }
      });

      return false;
    }
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return false;
      } else {
        const newPurchaseOrderDatasource = getEditTableData(purchaseOrderDatasource);
        // 订单行汇总校验
        if (newPurchaseOrderDatasource && newPurchaseOrderDatasource.length > 0) {
          const contractAttachmentData = getEditTableData(contractAttachmentDataSource);
          if (contractAttachmentData.length === 0 && contractAttachmentDataSource.length > 0) {
            return false;
          }
          const saveHeader = new Promise((resolve, reject) => {
            dispatch({
              type: 'procurementContract/saveHeader',
              payload: {
                ...headerData,
                ...values,
                plannedStartDate:
                  values.plannedStartDate && values.plannedStartDate.format('YYYY-MM-DD 00:00:00'),
                plannedEndDate:
                  values.plannedEndDate && values.plannedEndDate.format('YYYY-MM-DD 00:00:00'),
                poConLinesList: headerData.poConLinesList.map((item, index) => ({
                  ...item,
                  poHeadersList: [newPurchaseOrderDatasource[index]],
                  _status: 'update',
                })),
                _status: 'update',
                poConAttachList: [],
              },
            }).then((res) => {
              if (res) {
                resolve(res);
                // this.handleQueryHeader();
                // notification.success();
              } else {
                reject();
              }
            });
          });
          const saveAttachment = new Promise((resolve, reject) => {
            if (contractAttachmentDataSource.length > 0) {
              dispatch({
                type: 'procurementContract/poConAttachsSave',
                payload: {
                  contractHeaderId: headerData.contractHeaderId,
                  contractAttachmentData,
                },
              }).then((res) => {
                if (res) {
                  this.handleQueryAttachment();
                  resolve(res);
                } else {
                  reject();
                }
              });
            } else {
              resolve();
            }
          });

          Promise.all([saveHeader, saveAttachment]).then((res) => {
            if (res) {
              if (typeof callback === 'function') {
                callback();
              } else {
                this.handleQueryHeader();
                this.handleQueryAttachment();
                notification.success();
              }
            }
          });
        }
      }
    });
  }

  // @Bind()
  // handleAddPurchaseOrderLine(lines = []) {
  //   const { procurementContract = {}, dispatch } = this.props;
  //   const { purchaseOrderDatasource = [], purchaseOrderPagination = {} } = procurementContract;
  //   const newDatasource = [...lines, ...purchaseOrderDatasource];
  //   const newPagination = addItemsToPagination(
  //     lines.length,
  //     purchaseOrderDatasource.length,
  //     purchaseOrderPagination
  //   );
  //   dispatch({
  //     type: 'procurementContract/updateState',
  //     payload: {
  //       purchaseOrderDatasource: newDatasource,
  //       purchaseOrderPagination: newPagination,
  //     },
  //   });
  // }

  @Bind()
  handleRemovePurchaseOrderLine(keys = []) {
    const { procurementContract = {}, dispatch } = this.props;
    const {
      // purchaseOrderDatasource = [],
      // purchaseOrderPagination = {},
      headerData = {},
    } = procurementContract;
    const { poConLinesList = [] } = headerData;
    // const newDatasource = purchaseOrderDatasource.filter((item) => !keys.includes(item.poNumber));
    // const newDatasource = purchaseOrderDatasource.map((item) =>
    //   keys.includes(item.poNumber) ? { ...item, _status: 'delete' } : item
    // );
    // const newPagination = delItemsToPagination(
    //   keys.length,
    //   purchaseOrderDatasource.length,
    //   purchaseOrderPagination
    // );
    // dispatch({
    //   type: 'procurementContract/updateState',
    //   payload: {
    //     purchaseOrderDatasource: newDatasource,
    //     purchaseOrderPagination: newPagination,
    //   },
    // });
    const deleteLines = poConLinesList.filter((item) => keys.includes(item.poNumber));
    dispatch({
      type: 'procurementContract/deletePoConLines',
      payload: {
        deleteLines,
      },
    }).then((res) => {
      if (res) {
        this.handleQueryHeader();
      }
    });
  }

  @Bind()
  handleQueryHeader() {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'procurementContract/fetchHeader',
      payload: {
        contractHeaderId: id,
      },
    }).then((res) => {
      const { supportElectronicLovDatas = [] } = this.state;
      if (res && supportElectronicLovDatas.length === 0) {
        const { cmiEntity, esignatureFlagCtl } = res;
        this.querySupportElectronic(cmiEntity, esignatureFlagCtl);
      }
    });
  }

  @Bind()
  handleQueryAttachment() {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'procurementContract/listPoConAttach',
      payload: {
        contractHeaderId: id,
      },
    });
  }

  @Bind()
  handlePurchaseOrderDetail(record) {
    const { history } = this.props;
    const { isPub, open } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/sodr/purchase-order/${
        record.poType === 'DATA_APP' ? 'dataApp/' : ''
      }detail/${record.poSourceId}`,
      search: `${open ? '?open=fs' : ''}`,
    });
  }

  @Bind()
  handleTemplateChange(value) {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'procurementContract/updateDocumentIdToPoCon',
      payload: {
        poConHeaderId: id,
        templateId: value,
      },
    }).then((res) => {
      if (res) {
        this.handleQueryHeader();
      }
    });
  }

  /**
   *预览合同
   *
   * @memberof ProcurementContract
   */
  @Bind()
  handlePreviewContract() {
    this.setState({
      previewContractLoading: true,
    });
    const { procurementContract = {}, dispatch } = this.props;
    const {
      headerData: { contractId },
    } = procurementContract;
    dispatch({
      type: 'procurementContract/getContractViewurl',
      payload: {
        contractId,
      },
    }).then((res) => {
      this.setState({
        previewContractLoading: false,
      });
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.warning({ message: response.message });
          }
        } catch {
          // const newTab = window.open('about:blank');
          // newTab.location.href = res;
          window.open(res);
        }
      }
    });
  }

  @Bind()
  handleDownloadContract() {
    this.setState({
      downloadContractLoading: true,
    });
    const { procurementContract = {}, dispatch } = this.props;
    const {
      headerData: { contractHeaderId },
    } = procurementContract;
    dispatch({
      type: 'procurementContract/documentDownload',
      payload: {
        contractHeaderId,
      },
    }).then((res) => {
      this.setState({
        downloadContractLoading: false,
      });
      if (!res) {
        return;
      }
      const { type } = res;
      if (type === 'application/json') {
        const reader = new FileReader();
        reader.readAsText(res);
        reader.onload = () => {
          const { result } = reader;
          const errorInfos = JSON.parse(result);
          if (errorInfos.failed) {
            notification.warning({
              message: errorInfos.message,
            });
          }
        };
      } else {
        const blob = new Blob([res], { type: 'application/zip' });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `采购合同-${new Date().getTime()}`;
        a.click();
        window.URL.revokeObjectURL(a.href);
        a.remove();
      }
    });
  }

  /**
   *确认合同
   *
   * @memberof ProcurementContract
   */
  @Bind()
  handleConfirmContract() {
    const { dispatch, match = {}, procurementContract = {}, form } = this.props;
    const { params = {} } = match;
    const { id } = params;

    if (form.getFieldValue('sourceContractTemplate') === 'NON_CMI') {
      const { purchaseOrderDatasource = [], contractAttachmentDataSource = [] } =
        procurementContract;
      const contractAttachmentData = contractAttachmentDataSource.map((item) => {
        return item.$form
          ? {
              ...item,
              ...item.$form.getFieldsValue(),
            }
          : item;
      });
      for (let i = 0; i < contractAttachmentData.length; i++) {
        const item = contractAttachmentData[i];
        if (item.fileType === 'CONTRACT') {
          const quantity = Array.isArray(item.poConFiles)
            ? item.poConFiles.filter((p) => p.deleteFlag !== 'Y').length
            : 0;
          if (quantity === 0) {
            notification.warning({
              message: intl
                .get('sodr.procurementContract.warning.message.lackAttachment')
                .d('采购订单缺少附件'),
            });
            return false;
          } else if (quantity > 1) {
            notification.warning({
              message: intl
                .get('sodr.procurementContract.warning.message.attachmentQuantityOverLimit')
                .d('不能上传多个合同正文附件'),
            });
            return false;
          }
        }
      }
      const poNumbers = contractAttachmentDataSource
        .filter((item) => item.$form && item.$form.getFieldValue('fileType') === 'CONTRACT')
        .map((item) => item.$form && item.$form.getFieldValue('poNumber'));
      if (purchaseOrderDatasource.some((item) => !poNumbers.includes(item.poNumber))) {
        notification.warning({
          message: intl
            .get('sodr.procurementContract.warning.message.lackAttachment')
            .d('采购订单缺少附件'),
        });
        return false;
      }
    }

    // 先进行一次保存
    this.handleSave(() => {
      dispatch({
        type: 'procurementContract/contractConfirm',
        payload: {
          contractHeaderId: id,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleQueryHeader();
        }
      });
    }, true);
  }

  @Bind()
  handleEditSla() {
    const { procurementContract = {}, dispatch } = this.props;
    const {
      headerData: { contractId },
    } = procurementContract;
    dispatch({
      type: 'procurementContract/contractPresignurl',
      payload: {
        contractId,
      },
    }).then((res) => {
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.warning({ message: response.message });
          }
        } catch {
          // const newTab = window.open('about:blank');
          // newTab.location.href = res;
          window.open(res);
        }
      }
    });
  }

  @Bind()
  handleQuerySla() {
    const { procurementContract = {}, dispatch } = this.props;
    const {
      headerData: { contractId },
    } = procurementContract;
    dispatch({
      type: 'procurementContract/contractViewrichtext',
      payload: {
        contractId,
      },
    }).then((res) => {
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.warning({ message: response.message });
          }
        } catch {
          // const newTab = window.open('about:blank');
          // newTab.location.href = res;
          window.open(res);
        }
      }
    });
  }

  @Bind()
  handlePaginationChange(page) {
    const { dispatch, procurementContract = {} } = this.props;
    const { purchaseOrderDatasource = [] } = procurementContract;
    dispatch({
      type: 'procurementContract/updateState',
      payload: {
        purchaseOrderPagination: createPagination({
          number: page.current - 1,
          size: page.pageSize,
          total: purchaseOrderDatasource.length,
        }),
      },
    });
  }

  @Bind()
  handleSetSigningLocation() {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    const { id } = params;
    // const {
    //   headerData: { contractId, contractHeaderId },
    // } = procurementContract;
    dispatch({
      type: 'procurementContract/contractSignurl',
      payload: {
        contractHeaderId: id,
      },
    }).then((res) => {
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.warning({ message: response.message });
          }
        } catch {
          // const newTab = window.open('about:blank');
          // newTab.location.href = res;
          window.open(res);
        }
      }
    });
  }

  @Bind()
  handleOrderLineSaveSuccess() {
    this.handleQueryHeader();
  }

  @Bind()
  handleAddAttachmentLine() {
    const { procurementContract = {}, dispatch, organizationId } = this.props;
    const {
      contractAttachmentDataSource = [],
      // procurementContractPagination = {},
      headerData: { contractHeaderId },
    } = procurementContract;
    const rowKey = uuidv4();
    const newDataSource = [
      {
        rowKey,
        _status: 'create',
        contractHeaderId,
        deleteFlag: 'N',
        tenantId: organizationId,
        poConFiles: [],
        newFlag: true,
        editFlag: true,
      },
      ...contractAttachmentDataSource,
    ];
    // const newPagination = addItemToPagination(contractAttachmentDataSource.length, procurementContractPagination);
    dispatch({
      type: 'procurementContract/updateState',
      payload: {
        contractAttachmentDataSource: newDataSource,
        // procurementContractPagination: newPagination,
      },
    });
  }

  @Bind()
  handleDeleteAttachmentLine(keys = [], callback = (e) => e) {
    const { procurementContract = {}, dispatch } = this.props;
    const { contractAttachmentDataSource = [] } = procurementContract;
    const newDataSource = contractAttachmentDataSource.filter(
      (item) => !keys.includes(item.rowKey)
    );
    const deleteLines = contractAttachmentDataSource.filter(
      (item) => keys.includes(item.rowKey) && item.contractAttachmentId
    );
    if (deleteLines.length === 0) {
      callback();
      dispatch({
        type: 'procurementContract/updateState',
        payload: {
          contractAttachmentDataSource: newDataSource,
        },
      });
      return false;
    }
    dispatch({
      type: 'procurementContract/deleteAttach',
      payload: {
        deleteLines,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        callback();
        dispatch({
          type: 'procurementContract/updateState',
          payload: {
            contractAttachmentDataSource: newDataSource,
          },
        });
      }
    });
  }

  @Bind()
  handleFileTypeChange(value, oldValue, form) {
    if (value !== 'CONTRACT') {
      return false;
    }
    const { procurementContract = {} } = this.props;
    const { contractAttachmentDataSource = [] } = procurementContract;
    contractAttachmentDataSource.forEach((item) => {
      if (item.$form && item.$form.getFieldValue('fileType') === 'CONTRACT') {
        Modal.warning({
          title: intl
            .get('sodr.procurementContract.warning.message.onlyOne.contract.type')
            .d('合同正文类型的附件已经存在，请选择其他类型'),
          onOk: () => {
            form.setFieldsValue({
              fileType: oldValue,
            });
          },
        });
      }
    });
  }

  @Bind()
  handleCancelConfirmation() {
    const { dispatch, procurementContract = {} } = this.props;
    const {
      headerData: { contractHeaderId },
    } = procurementContract;
    dispatch({
      type: 'procurementContract/cancelConfirmation',
      payload: {
        contractHeaderId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleQueryHeader();
        this.handleQueryAttachment();
      }
    });
  }

  @Bind()
  handleSubmit() {
    const { procurementContract = {}, dispatch } = this.props;
    const {
      headerData: { contractId, contractHeaderId },
    } = procurementContract;
    dispatch({
      type: 'procurementContract/submitPoConHeader',
      payload: {
        contractId,
        contractHeaderId,
        status: 'SUBMIT',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleQueryHeader();
      }
    });
  }

  @Bind()
  handleSoDetail() {
    const { procurementContract = {} } = this.props;
    const { soUrl } = this.state;
    const { headerData = {} } = procurementContract;
    const { salesContractId } = headerData;
    const user = getCurrentUser();
    const { loginName } = user;
    const url = Base64.stringify(
      Utf8.parse(
        `/mks/cmi-to-approval-details?workflowtype=BOSS_ICTSHTSP&uuid=${salesContractId}&requestid=&loginid=${loginName}`
      )
    );
    return soUrl + url;
    // const newTab = window.open('about:blank');
    // newTab.location.href = `${soUrl}${url}`;
  }

  /**
   * 点击编辑
   *
   * @param {*} record
   * @memberof ProcurementContract
   */
  @Bind()
  handleAttachmentEdit(record) {
    const { procurementContract = {}, dispatch } = this.props;
    const { contractAttachmentDataSource = [] } = procurementContract;
    const { rowKey } = record;
    const newDataSource = contractAttachmentDataSource.map((item) =>
      item.rowKey === rowKey ? { ...item, editFlag: true } : item
    );
    dispatch({
      type: 'procurementContract/updateState',
      payload: {
        contractAttachmentDataSource: newDataSource,
      },
    });
  }

  /**
   * 点击附件行取消
   *
   * @param {*} record
   * @memberof ProcurementContract
   */
  @Bind()
  handleAttachmentCancel(record) {
    const { procurementContract = {}, dispatch } = this.props;
    const { contractAttachmentDataSource = [] } = procurementContract;
    const { rowKey, newFlag } = record;
    let newDataSource = [];
    if (newFlag) {
      newDataSource = contractAttachmentDataSource.filter((item) => item.rowKey !== rowKey);
    } else {
      newDataSource = contractAttachmentDataSource.map((item) =>
        item.rowKey === rowKey ? { ...item, editFlag: false } : item
      );
    }
    dispatch({
      type: 'procurementContract/updateState',
      payload: {
        contractAttachmentDataSource: newDataSource,
      },
    });
  }

  @Bind()
  handleAttachmentSave(record, values) {
    const { procurementContract = {}, dispatch } = this.props;
    const { contractAttachmentDataSource = [] } = procurementContract;
    const { rowKey } = record;
    const newDataSource = contractAttachmentDataSource.map((item) =>
      item.rowKey === rowKey
        ? {
            ...item,
            editFlag: false,
            newFlag: false,
            ...values,
          }
        : item
    );
    dispatch({
      type: 'procurementContract/updateState',
      payload: {
        contractAttachmentDataSource: newDataSource,
      },
    });
  }

  @Bind()
  handleQueryApprovalHistory(page) {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'procurementContract/queryApprovalHistory',
      payload: {
        page,
        contractHeaderId: id,
      },
    });
  }

  /**
   * 查询采购合同支持电子签署的主体。
   *
   * @memberof ProcurementContract
   */
  @Bind()
  querySupportElectronic(cmiEntity, esignatureFlagCtl) {
    const { dispatch } = this.props;
    dispatch({
      type: 'procurementContract/querySupportElectronic',
      payload: {
        lovCode: 'SPUC.SUPPORT_ELECTRONIC',
      },
    }).then((res) => {
      if (res) {
        const supportElectronic =
          (res.find((item) => item.value === cmiEntity) || {}).tag === 'Y' &&
          esignatureFlagCtl !== '0';
        this.setState({
          supportElectronicLovDatas: res,
          supportElectronic,
        });
      }
    });
  }

  @Bind()
  handleCancel() {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'procurementContract/cancelContract',
      payload: {
        contractHeaderId: id,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleQueryHeader();
      }
    });
  }

  @Bind()
  handleContractEvaluation(flag) {
    const { history, match = {}, procurementContract = {}, dispatch } = this.props;
    const { isPub, pendingFlag } = this.state;
    const { headerData = {} } = procurementContract;
    const { evaluateFlag } = headerData;
    const { params = {} } = match;
    // pendingFlag标识待办跳转，去掉控制权限
    if (!pendingFlag && !evaluateFlag && flag) {
      notification.warning({
        message: intl
          .get('sodr.procurementContract.warning.message.noEvaluationPermission')
          .d('当前用户无评价权限！'),
      });
      return false;
    }
    const { id } = params;
    dispatch({
      type: 'procurementContract/queryList',
      payload: {
        page: {},
      },
    }).then((res) => {
      if (res) {
        // 若只有一个模板直接进入评分界面
        if (res.totalElements === 1) {
          const { evalTplId } = res.content[0];
          history.push({
            pathname: `${
              isPub ? '/pub' : ''
            }/sodr/po-evaluate/template/evaluation/${id}/${evalTplId}`,
            search: `evaluateQuery=N${flag ? '' : '&toDetail=Y'}${
              pendingFlag ? `&pendingFlag=${pendingFlag}` : ''
            }`,
          });
        } else {
          history.push({
            pathname: `${isPub ? '/pub' : ''}/sodr/po-evaluate/template/select/${id}`,
            search: `evaluateQuery=N${flag ? '' : '&toDetail=Y'}${
              pendingFlag ? `&pendingFlag=${pendingFlag}` : ''
            }`,
          });
        }
      }
    });
    // if (flag) {
    //   history.push({
    //     pathname: `${isPub ? '/pub' : ''}/sodr/po-evaluate/template/select/${id}`,
    //     search: `evaluateQuery=N${pendingFlag ? `&pendingFlag=${pendingFlag}` : ''}`,
    //   });
    // } else {
    //   history.push({
    //     pathname: `${isPub ? '/pub' : ''}/sodr/po-evaluate/template/select/${id}`,
    //     search: 'todetail=Y',
    //   });
    // }
  }

  @Bind()
  handleRecall() {
    const { procurementContract = {}, dispatch } = this.props;
    const {
      headerData: { contractId, contractHeaderId },
    } = procurementContract;
    dispatch({
      type: 'procurementContract/submitPoConHeader',
      payload: {
        contractId,
        contractHeaderId,
        status: 'RECALL',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleQueryHeader();
        this.handleQueryAttachment();
      }
    });
  }

  @Bind()
  handleSupplementary() {
    const { match = {}, dispatch, procurementContract = {} } = this.props;
    const { isPub, open } = this.state;
    const { headerData = {} } = procurementContract;
    const { params = {} } = match;
    const { id } = params;
    const { userDepartment, userDepartmentMeaning, poContractNum, contractAmount } = headerData;
    dispatch(
      routerRedux.push({
        pathname: `${isPub ? '/pub' : ''}/sodr/procurement-contract/supplementary/${id}`,
        state: {
          userDepartment,
          userDepartmentMeaning,
          poContractNum,
          contractAmount,
        },
        search: `${open ? '?open=fs' : ''}`,
      })
    );
  }

  @Bind()
  handleAnotherSubmit() {
    const { form = {}, dispatch, procurementContract } = this.props;
    const { headerData = {} } = procurementContract;
    const fieldsValue = form.getFieldsValue();
    const data = {
      ...headerData,
      ...fieldsValue,
    };
    dispatch({
      type: 'procurementContract/submitReversePoConHeader',
      payload: {
        data,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleQueryHeader();
      }
    });
  }

  render() {
    const {
      form,
      location,
      procurementContract = {},
      organizationId,
      saveLoading = false,
      fetchLoading = false,
      confirmLoading = false,
      editSlaLoading = false,
      querySlaLoading = false,
      contractSignLoading = false,
      fetchAttachmentLoading = false,
      deleteAttachLoading = false,
      cancelConfirmationLoading = false,
      submitLoading = false,
      deletePoConLinesLoading = false,
      queryApprovalHistoryLoading = false,
      cancelContractLoading = false,
      submitReversePoConHeaderLoading = false,
    } = this.props;
    const {
      orderMilestoneVisible,
      downloadContractLoading,
      previewContractLoading,
      isPub,
      open,
      supportElectronic,
      contractExecutionStatusList,
      pendingFlag,
    } = this.state;

    const {
      purchaseOrderDatasource = [],
      purchaseOrderPagination = {},
      contractAttachmentDataSource = [],
      // procurementContractPagination = {},
      headerData = {},
      historyList = [],
      historyPagination = {},
      // editFlag,
    } = procurementContract;
    const editFlag =
      procurementContract.editFlag === 'N' || headerData.editFlag === 'N' ? 'N' : 'Y';
    const { contractStatus, contractId, contractExecutionStatus } = headerData;
    const { tag: contractExecutionStatusTag } =
      contractExecutionStatusList.find((item) => item.value === contractExecutionStatus) || {};
    const basicInfoProps = {
      editFlag,
      form,
      organizationId,
      headerData,
      contractStatus,
      onContractEvaluation: this.handleContractEvaluation,
      // onTemplateChange: this.handleTemplateChange,
    };
    const contractInfoProps = {
      editFlag,
      form,
      headerData,
      contractStatus,
      purchaseOrderDatasource: purchaseOrderDatasource.filter((item) => item._status !== 'delete'),
      contractExecutionStatusTag,
      onTemplateChange: this.handleTemplateChange,
      onSoDetail: this.handleSoDetail,
    };
    const contractSignProps = {
      editFlag,
      form,
      headerData,
      contractStatus,
      supportElectronic,
    };
    const purchaseOrderSummaryProps = {
      editFlag,
      headerData,
      dataSource: purchaseOrderDatasource.filter((item) => item._status !== 'delete'),
      pagination: purchaseOrderPagination,
      loading: false,
      contractStatus,
      deletePoConLinesLoading,
      onShowOrderMilestones: this.handleShowOrderMilestones,
      // onAddLine: this.handleAddPurchaseOrderLine,
      onRemoveLine: this.handleRemovePurchaseOrderLine,
      onPurchaseOrderDetail: this.handlePurchaseOrderDetail,
      onPaginationChange: this.handlePaginationChange,
      onSaveSuccess: this.handleOrderLineSaveSuccess,
    };
    let purchaseOrderMilestonesDataSource = [];
    purchaseOrderDatasource.forEach((item) => {
      if (item._status !== 'delete' && Array.isArray(item.poMilestonesList)) {
        purchaseOrderMilestonesDataSource = [
          ...purchaseOrderMilestonesDataSource,
          ...item.poMilestonesList,
        ];
      }
    });
    const purchaseOrderMilestonesPorps = {
      dataSource: purchaseOrderMilestonesDataSource,
    };
    const contractAttachmentProps = {
      editFlag,
      contractStatus,
      dataSource: contractAttachmentDataSource,
      // pagination: procurementContractPagination,
      loading: fetchAttachmentLoading || deleteAttachLoading,
      deleteAttachLoading,
      contractHeaderId: headerData.contractHeaderId,
      onAddLine: this.handleAddAttachmentLine,
      onDeleteLine: this.handleDeleteAttachmentLine,
      // onUpdateLine: this.handleUpdateAttachmentLine,
      onFileTypeChange: this.handleFileTypeChange,
      onCancel: this.handleAttachmentCancel,
      onEdit: this.handleAttachmentEdit,
      onSave: this.handleAttachmentSave,
    };

    const approvalHistoryProps = {
      dataSource: historyList,
      loading: queryApprovalHistoryLoading,
      pagination: historyPagination,
      onChange: this.handleQueryApprovalHistory,
    };
    const { search } = location;
    const { evaluateQuery } = querystring.parse(search.substr(1));
    let backPath;
    if (search && evaluateQuery === 'Y') {
      backPath = '/sodr/po-evaluate/evaluate/query';
    } else {
      backPath = '/sodr/procurement-contract';
    }
    const { authorizeFlag, stampFlag } = form.getFieldsValue();
    return (
      <>

<Header>
            <Button
              type="primary"
              onClick={() => {
                this.handleContractEvaluation(true);
              }}
            >
              {intl.get(`sodr.procurementContract.view.contractEvaluation`).d('合同评价')}
            </Button>
          </Header>
        <Content className={styles.content}>
          {/* eslint-disable-next-line camelcase */}
          <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zh_CN}>
            <Spin spinning={fetchLoading || saveLoading}>
              <Card
                key="basicInfo"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>
                    {intl.get(`sodr.procurementContract.view.basicInformation`).d('基本信息')}
                  </h3>
                }
              >
                {/* <BasicInfo {...basicInfoProps} /> */}
              </Card>
              <Card
                key="contractInfo"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>{intl.get(`sodr.procurementContract.view.contractInfo`).d('合同信息')}</h3>
                }
              >
                {/* <ContractInfo {...contractInfoProps} /> */}
              </Card>
              <Card
                key="contractSignSetting"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>
                    {intl
                      .get(`sodr.procurementContract.view.contractSignSetting`)
                      .d('合同签署设置')}
                  </h3>
                }
              >
                {/* <ContractSignSetting {...contractSignProps} /> */}
              </Card>
              <Card
                key="purchaseOrderSummary"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>
                    {intl
                      .get(`sodr.procurementContract.view.purchaseOrderSummary`)
                      .d('采购订单汇总')}
                  </h3>
                }
              >
                {/* <PurchaseOrderSummary {...purchaseOrderSummaryProps} /> */}
              </Card>
              {orderMilestoneVisible && (
                <Card
                  key="purchaseOrderMilestones"
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={
                    <h3>
                      {intl
                        .get(`sodr.procurementContract.view.purchaseOrderMilestones`)
                        .d('采购订单里程碑')}
                    </h3>
                  }
                >
                  {/* <PurchaseOrderMilestones {...purchaseOrderMilestonesPorps} /> */}
                </Card>
              )}
              <Card
                key="contractAttachment"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>{intl.get(`sodr.procurementContract.view.contractAttachment`).d('附件')}</h3>
                }
              >
                {/* <ContractAttachment {...contractAttachmentProps} /> */}
              </Card>
              <Card
                key="approvalHistory"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>{intl.get(`sodr.procurementContract.view.approvalHistory`).d('审批历史')}</h3>
                }
              >
                {/* <ApprovalHistory {...approvalHistoryProps} /> */}
              </Card>
            </Spin>
          </LocaleProvider>
        </Content>
      </>
    );
  }
}
