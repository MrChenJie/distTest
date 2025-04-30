import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse } from 'antd';
import { Form } from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import { fastCodeLoader } from '@/utils/decorators';
import { sumBy, groupBy, map } from 'lodash';
import {
  getCurrentOrganizationId,
  getEditTableData,
  getCurrentLanguage,
  createPagination,
  getCurrentUser,
} from 'utils/utils';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import queryString from 'querystring';
import dayjs from 'dayjs';
import { queryFileList } from '@/utils/utils';
import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import SalePlanList from './SalePlanList';
import PurchaseInformationList from './PurchaseInformationList';
import PageMessage from '_cus_components/Page/PageMessage';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const {  realName, id, phone } = getCurrentUser();

@formatterCollections({ code: ['HKPC.commom'] })
@fastCodeLoader([
  'CMHK.Y_N',
  'HKPC.PRTYPE',
  'HKPC.PURCHASINGCATEGORY',
  'HKPC.DELIVERYTERMS',
  'HKPC.PAYMENTTERMS',
  'HKPC.PAYMENTMETHOD',
  'HKPC.PRRECORDSSTATUS',
  'HKPC.VENDOR_CATEGORY',
])
@connect(({ loading, phoneBusinessListModal }) => ({
  phoneBusinessListModal,
  //当三个详情列表有一个为在加载中时，整体loading为true
  queryLoading: loading.effects['phoneBusinessListModal/queryDetail'] ||
  loading.effects['phoneBusinessListModal/getPlanNameList'],
  querySalePlanListLoading: loading.effects['phoneBusinessListModal/querySalePlanList'],
  checkAmountLoading: loading.effects['phoneBusinessListModal/checkAmount'],
  salePlanList: phoneBusinessListModal.salePlanList, // 销售计划列表
  purchaseInformationList: phoneBusinessListModal.purchaseInformationList, // 采购信息列表
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    const { location } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { activeId, formRecordId, state, activityCode } = queryString.parse(location?.search?.substr(1)) || {};
    this.state = {
      formRecordId: formRecordId === 'null' ? activeId : formRecordId,
      isPub, // 是否为pub页面
      activeKey: ['form', 'SalePlan', 'purchaseInformation'], // 是否收起
      salePlanSelectedRows: [], // 选中行
      salePlanSelectedRowKeys: [], // 选中行key
      purchaseInformationSelectedRows: [], // 选中行
      purchaseInformationSelectedRowKeys: [], // 选中行key
      headerInfo: {}, // form信息
      bpmState: state, // 致远单据状态
      bpmActivityCode: activityCode, // 致远单据活动编码
    };
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    const { prType } = queryString.parse(location?.search?.substr(1)) || {};
    if (this.state.formRecordId) {
      this.queryDetail(this.state.formRecordId); // 查询form详情
      this.querySalePlanList(_, this.state.formRecordId); // 查询销售计划列表
    } else {
      dispatch({
        type: 'phoneBusinessListModal/getUserUnit',
        payload: {
          tenantId: organizationId,
          userId: id,
          lang:getCurrentLanguage()
        },
      }).then((res) => {
        if(res) {
          this.setState({
            headerInfo: {
              applyingDepartmentName: res.content?.[0]?.unitName, // 申请人部门
              applyingDepartmentId: res.content?.[0]?.unitId, // 申请人部门Id
              unitCode: res.content?.[0]?.unitCode, // 申请人部门编码
              applyUserDepName: res.content?.[0]?.unitName, // 需求人部门
              applyUserDepId: res.content?.[0]?.unitId, // 需求人部门Id
              applyUserPhone: phone, // 需求人电话
              applicantUserName: res.content?.[0]?.realName, // 申请人名称
              applicantUserId: res.content?.[0]?.userId, // 申请人Id
              applyUserName: res.content?.[0]?.realName, // 需求人名称
              applyUserId: res.content?.[0]?.userId, // 需求人Id
              prType: prType,
              isAssociatedAgreement:'Y',
            },
          }, () => {
            dispatch({
              type: 'phoneBusinessListModal/updateState',
              payload: {
                employeeNum: res.content?.[0]?.employeeNum, // 申请人工号
              }
            })
          });
        }
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleClickBtn);
  }

  /**
   * @name: 监听事件 - 监听致远点击按钮
   * @param {object} e
   */
  handleClickBtn = (e) => {
    console.log('监听的message', e);
    const { submitType, messageType, url } = e.data || {};

    const handlePostMessage = (params) => {
      window.parent?.postMessage(
        {
          success: true,
          submitType: submitType,
          messageType: messageType,
          formData: {
            formRecordId: params?.formRecordId,
            info: params?.info,
            ...params,
          },
        },
        url
      );
    };

    if (e.data.messageType === 'GET_FORM_DATA') {
      if (['DRAFT_HANDLE', 'AGREE', 'SEND', 'SUBMIT', 'GIVE', 'NOTICE'].includes(submitType)) {
        if(['SEND', 'GIVE'].includes(submitType)) {
          // 校验金额接口
          this.handleCheckAmount((res) => {
            if(res?.checkResult) {
              this.handleSave((params) => {
                console.log('save&submit', params);
                if (params) {
                  handlePostMessage({
                    formRecordId: params?.formRecordId,
                    subject: params?.subject, // 待办标题
                    Manager: params?.info?.managerId, // 采购经理
                    Department: params?.info.applyUserDepCode, // 需求部门
                    Judgment: params?.isJudgment, // 销售计划利润率 > 0 & 订单总金额 < 500万港币 = Y, 其余走N
                    Product: params?.info.prType === 'consignment' ? 'Y' : 'N', // 采购申请类型等于寄售品 = Y, 其余N
                  });
                }
              });
            } else {
              CusNotification.error({
                message: intl.get('HKPC.commom.view.title.insufficientBalance', {
                  brand: res?.checkBrandResult
                }).d('可用余额不足'),
              })
            }
          })
        } else {
          // 保存 提交
          this.handleSave((params) => {
            console.log('save&submit', params);
            if (params) {
              handlePostMessage({
                formRecordId: params?.formRecordId,
                subject: params?.subject, // 待办标题
                Manager: params?.info?.managerId, // 采购经理
                Department: params?.info.applyUserDepCode, // 需求部门
                Judgment: params?.isJudgment, // 销售计划利润率 > 0 & 订单总金额 < 500万港币 = Y, 其余走N
                Product: params?.info.prType === 'consignment' ? 'Y' : 'N', // 采购申请类型等于寄售品 = Y, 其余N
              });
            }
          });
        }
      } else {
        // 其他按钮
        handlePostMessage();
      }
    }
  };

  handleBrandList = (org_code, plan_header_number) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'phoneBusinessListModal/getPlanNameList',
      payload: {
        org_code,
        plan_header_number,
      }
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        const item = newDataSource.pop();
        dispatch({
          type: 'phoneBusinessListModal/updateState',
          payload: {
            brandList: map(item?.line, 'product_code').join(','), // 品牌
          }
        })
      }
    })
  }

  queryDetail = (formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'phoneBusinessListModal/queryDetail',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: {
            ...res,
            unitCode: res?.applyingDepartmentCode, // 申请人部门编码
          },
        });
        this.handleBrandList(res?.applyingDepartmentCode, res?.planNumber);
        const { salePlan = [], prApplySonMaterialList = [] } = res;
        // const SalePlanPagination = createPagination(res);
        // const PurchaseInformationPagination = createPagination(res);
        const newPurchaseInformationDataSource = prApplySonMaterialList?.map((item) => ({
          ...item,
          rowKey: uuid(),
          _status: 'update',
          matName: item?.matName
        }));
        dispatch({
          type: 'phoneBusinessListModal/updateState',
          payload: {
            // salePlanDetailPagination: SalePlanPagination,
            purchaseInformationDetailSource: newPurchaseInformationDataSource,
            associatedAgreement: res?.associatedAgreement,
            associatedAgreementEbs: res?.ebs,
            // purchaseInformationDetailPagination: PurchaseInformationPagination,
          },
        });
      }
    });
  };

  /**
   * @name: 查询销售计划列表
   * @param {*} page
   * @param {*} formRecordId
   */
  querySalePlanList = (page = {}, formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'phoneBusinessListModal/querySalePlanList',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        console.log('销售计划', res);
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuid(),
          _status: 'update',
        }));
        dispatch({
          type: 'phoneBusinessListModal/updateState',
          payload: {
            salePlanDetailSource: newDataSource,
            salePlanDetailPagination: pagination,
          },
        });
      }
    });
  };

  /**
   * @name: 删除销售计划行
   */
  @Bind()
  handleDeleteSalePlanLine = () => {
    const { dispatch, phoneBusinessListModal } = this.props;
    const { salePlanDetailSource, salePlanDetailPagination } = phoneBusinessListModal;
    const { salePlanSelectedRowKeys, formRecordId, headId } = this.state;
    if (salePlanSelectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = salePlanDetailSource.filter(
          (item) => salePlanSelectedRowKeys.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'phoneBusinessListModal/deleteSalePlanLine',
            payload: deleteData,
          }).then((res) => {
            if (res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              this.querySalePlanList(_, formRecordId || headId);
            }
          });
        } else {
          // 本地删除
          const newDataSource = salePlanDetailSource.filter(
            (item) => !salePlanSelectedRowKeys.includes(item['rowKey'])
          );
          // const delItemsLength = salePlanDetailSource.length - newDataSource.length;
          // productDetailPagination.total = salePlanDetailSource.length - 1
          // const newPagination = delItemsToPagination(delItemsLength, salePlanDetailSource.length, productDetailPagination);
          dispatch({
            type: 'phoneBusinessListModal/updateState',
            payload: {
              salePlanDetailSource: newDataSource,
              // salePlanDetailPagination: newPagination,
            },
          });
          this.setState({
            salePlanSelectedRowKeys: [],
            salePlanSelectedRows: [],
          });
        }
      });
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  };

  /**
   * @name: 删除采购申请行信息行
   */
  @Bind()
  handleDeletePurchaseInformationLine = () => {
    const { dispatch, phoneBusinessListModal } = this.props;
    const { purchaseInformationDetailSource, purchaseInformationDetailPagination } =
      phoneBusinessListModal;
    const { purchaseInformationSelectedRowKeys, formRecordId, headId } = this.state;
    // debugger;
    console.log('purchaseInformationSelectedRowKeys', purchaseInformationSelectedRowKeys);
    if (purchaseInformationSelectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        // 本地删除
        const newDataSource = purchaseInformationDetailSource.filter(
          (item) => !purchaseInformationSelectedRowKeys.includes(item['rowKey'])
        );
        dispatch({
          type: 'phoneBusinessListModal/updateState',
          payload: {
            purchaseInformationDetailSource: newDataSource,
          },
        });
        this.setState({
          purchaseInformationSelectedRowKeys: [],
          purchaseInformationSelectedRows: [],
        });
      });
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  };

  /**
   * @name: 新增销售计划行
   */
  @Bind()
  handleAddSalePlanLine = () => {
    const { dispatch, phoneBusinessListModal } = this.props;
    const { salePlanDetailSource = [], salePlanDetailPagination = {} } = phoneBusinessListModal;
    const basicForm = this.basicForm?.getFieldsValue();
    const newDataSource = [
      ...salePlanDetailSource,
      {
        rowKey: uuid(),
        _status: 'create',
      },
    ];
    // const newPagination = addItemsToPagination(productDetailSource.length, productDetailPagination);
    dispatch({
      type: 'phoneBusinessListModal/updateState',
      payload: {
        salePlanDetailSource: newDataSource,
        // salePlanDetailPagination: newPagination,
      },
    });
  };

  /**
   * @name: 新增采购申请行信息行
   * 这里需要注意，有个associatedAgreementEbs判断，走不同逻辑
   */
  @Bind()
  handleAddPurchaseInformationLine = () => {
    const { dispatch, phoneBusinessListModal } = this.props;
    const {
      purchaseInformationDetailSource = [],
      purchaseInformationDetailPagination = {},
      associatedAgreementEbs,
    } = phoneBusinessListModal;
    const basicForm = this.basicForm?.getFieldsValue();
    if(associatedAgreementEbs) {
      dispatch({
        type: 'phoneBusinessListModal/handleSupplierInfo',
        payload: {
          supplierNumber: associatedAgreementEbs,
        },
      }).then((res) => {
        if(res) {
          const { content = [] } = res;
          const newDataSource = [
            ...purchaseInformationDetailSource,
            {
              rowKey: uuid(),
              _status: 'create',
              contentBudgetType: basicForm?.purchaseCategoryTag,
              purchasingCategory: basicForm?.purchasingCategory,
              winningSupplier: getCurrentLanguage() === 'zh_CN' ? content?.[0]?.companyNameCh : content?.[0]?.companyNameEn,
              winningSupplierNumber: content?.[0]?.supplierNumber,
              contacts: content?.[0]?.contactMan,
              supplierPhone: content?.[0]?.phoneNumber,
              // 以下信息是从第一行数据带过来的
              addressCode: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].addressCode : null, // 送货地址code
              deliverContact: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliverContact : null, // 送货地址联系人
              deliverAddress: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliverAddress : null, // 送货地址
              deliveryPhoneNumber: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliveryPhoneNumber : null, // 送货联系电话
              deliverContactCode: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliverContactCode : '', //联系人编码
              deliverDate: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliverDate : null, // 送货日期
            },
          ];
          dispatch({
            type: 'phoneBusinessListModal/updateState',
            payload: {
              purchaseInformationDetailSource: newDataSource,
            },
          });
        }
      })
    } else {
      // 不调用接口的新增
      const newDataSource = [
        ...purchaseInformationDetailSource,
        {
          rowKey: uuid(),
          _status: 'create',
          contentBudgetType: basicForm?.purchaseCategoryTag,
          currency: 'HKD',
          exchangeRate: '1',
          purchasingCategory: basicForm?.purchasingCategory,
          // 以下信息是从第一行数据带过来的
          addressCode: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].addressCode : null, // 送货地址code
          deliverContact: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliverContact : null, // 送货地址联系人
          deliverAddress: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliverAddress : null, // 送货地址
          deliveryPhoneNumber: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliveryPhoneNumber : null, // 送货联系电话
          deliverContactCode: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliverContactCode : '', //联系人编码
          deliverDate: purchaseInformationDetailSource.length > 0 ? purchaseInformationDetailSource[0].deliverDate : null, // 送货日期
        },
      ];
      dispatch({
        type: 'phoneBusinessListModal/updateState',
        payload: {
          purchaseInformationDetailSource: newDataSource,
        },
      });
    }
  };

  @Bind()
  handleSave = (callback) => {
    const { dispatch, phoneBusinessListModal } = this.props;
    const { salePlanDetailSource, purchaseInformationDetailSource } = phoneBusinessListModal;
    const { headerInfo } = this.state;

    //获取行数据
    const validateSalePlanData = getEditTableData(salePlanDetailSource, ['rowKey']);
    const validatePurchaseInformationData = getEditTableData(purchaseInformationDetailSource, [
      'rowKey',
    ]);
    
    this.basicForm.validateFields((err, values) => {
      if (!err) {
        queryFileList({
          tenantId: organizationId,
          bucketName: 'spfm-comp',
          attachmentUUID: values.attachUuid,
        }).then((fileList) => {
          if (fileList?.length > 0) {
            if (Array.isArray(validateSalePlanData) && validateSalePlanData.length === 0 && ['salesbusinessproduct'].includes(headerInfo?.prType)) {
              return CusNotification.warning({
                message: intl.get('HKPC.commom.view.title.addSalesPlanLine').d('请添加销售计划行'),
              });
            }
            if (
              Array.isArray(validatePurchaseInformationData) &&
              validatePurchaseInformationData.length === 0
            ) {
              return CusNotification.warning({
                message: intl.get('HKPC.commom.view.title.addPurchaseRequisitionLine').d('请添加采购申请行信息'),
              });
            }
            dispatch({
              type: 'phoneBusinessListModal/savePurchaseInfo',
              payload: {
                ...headerInfo,
                ...values,
                projectType: values?.purchaseCategoryTag === 'OPEX' ? '1' : '2',
                tenantId: organizationId,
                prLineDTOList: validatePurchaseInformationData?.map((item) => ({
                  ...item,
                  deliverDate: dayjs(item.deliverDate).format('YYYY-MM-DD HH:mm:ss'),
                  requirementDate: dayjs(item.requirementDate).format('YYYY-MM-DD HH:mm:ss'),
                  matName: item?.matName || item?.matNameVal,
                })),
              }
            }).then((info) => {
              if(info) {
                this.setState({
                  headId: info?.id,
                });
                dispatch({
                  type: 'phoneBusinessListModal/saveSalePlanInfo',
                  payload: {
                    list: validateSalePlanData?.map((item) => ({
                      ...item,
                      refHeadId: info?.id,
                      profit: numberRender(item?.profit, 4)
                    })),
                  }
                }).then((saleRes) => {
                  if(saleRes) {
                    const saleJine = sumBy(saleRes, item => Number(item.profit)); // 销售计划总利润率
                    const isJudgment = saleJine > 0 && Number(info?.estimatedBudgetAmountHkd) < 5000000 ? 'Y' : 'N';
                    if (typeof callback === 'function') {
                      callback({
                        formRecordId: info?.id,
                        subject: '标题',
                        isJudgment,
                        info,
                      });
                    }
                    this.queryDetail(info?.id);
                    this.querySalePlanList(_,info?.id)
                  }
                })
              }
            })
          } else {
            CusNotification.warning({
              message: intl.get('HKPC.commom.view.title.addUploadAttachments').d('请上传附件'),
            })
          }
        });
      }
    });
  };

  @Bind()
  handleCheckAmount = (callback) => {
    const { dispatch, phoneBusinessListModal } = this.props;
    const { purchaseInformationDetailSource = [] } = phoneBusinessListModal;
    const { planNumber, unitCode, prType } = this.basicForm?.getFieldsValue();

    //获取申请行数据
    const validatePurchaseInformationData = getEditTableData(purchaseInformationDetailSource, [
      'rowKey',
    ]);

    console.log('validatePurchaseInformationData', validatePurchaseInformationData, planNumber, unitCode, prType);
    if(prType === 'salesbusinessproduct') {
      if(validatePurchaseInformationData.length > 0) {
        // 相同品牌的预算总金额hkd相加
        const purchaseResult = map(groupBy(validatePurchaseInformationData, 'brandCode'), (items, brandCode) => ({
          brandCode: brandCode,
          brandAmount: Number((sumBy(items, 'purchaseRequestAmountHkd') || 0).toFixed(4)), // 汇总金额
          brandName: items[0].brand // 获取品牌名称
        }));
        console.log('purchaseResult', purchaseResult);
        dispatch({
          type: 'phoneBusinessListModal/checkAmount',
          payload: {
            itemLines: purchaseResult, // 采购申请行品牌数据
            planCode: planNumber, // 采购计划编号
            applyDepartmentCode: unitCode, // 申请人部门编码
          },
        }).then((res) => {
          if(res) {
            callback(res)
          }
        })
      }
    } else {
      callback({
        checkResult: true,
      })
    }
  }

  handleSubmit = () => {
    this.handleCheckAmount((params) => {
      console.log('params', params);
      if(params?.checkResult) {
        console.log('金额校验通过');
        this.handleSave(params => {})
        
      } else {
        CusNotification.warning({
          message: params?.checkMessage,
        })
      }
    })
  }

  render() {
    const {
      queryLoading = false,
      querySalePlanListLoading = false,
      checkAmountLoading = false,
      salePlanList = {},
      purchaseInformationList = {},
      idpValueMap,
      phoneBusinessListModal,
    } = this.props;
    const {
      salePlanDetailSource,
      salePlanDetailPagination,
      purchaseInformationDetailSource,
      purchaseInformationDetailPagination,
    } = phoneBusinessListModal;
    const {
      activeKey, // 是否折叠
      salePlanSelectedRowKeys,
      salePlanSelectedRows,
      purchaseInformationSelectedRows,
      purchaseInformationSelectedRowKeys,
      headerInfo, //基本信息
      headId,
      formRecordId,
      bpmState,
      bpmActivityCode,
    } = this.state;

    console.log('headerInfo', headerInfo);

    const readyOnly = headerInfo?.prStatus ? headerInfo?.prStatus !== 'PENDING_REFER' : false; // 状态为草稿可以编辑

    console.log('readyOnly', readyOnly);

    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      salePlanList,
      purchaseInformationList,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.props.form;
      },
    };

    const rowSalePlanSelection = {
      salePlanSelectedRowKeys,
      salePlanSelectedRows,
      onChange: (keys, rows) => {
        this.setState({
          salePlanSelectedRowKeys: keys,
          salePlanSelectedRows: rows,
        });
      },
    };

    const rowPurchaseInformationSelection = {
      purchaseInformationSelectedRowKeys,
      purchaseInformationSelectedRows,
      onChange: (keys, rows) => {
        this.setState({
          purchaseInformationSelectedRowKeys: keys,
          purchaseInformationSelectedRows: rows,
        });
      },
    };

    const salePlanListprops = {
      ...this.props,
      readyOnly,
      idpValueMap,
      rowSelection: rowSalePlanSelection,
      basicForm: this.basicForm?.getFieldsValue(),
      onChange: (page) => this.queryDetail(page, formRecordId || headId),
    };

    const purchaseInformationListprops = {
      ...this.props,
      readyOnly,
      idpValueMap,
      rowSelection: rowPurchaseInformationSelection,
      basicForm: this.basicForm?.getFieldsValue(),
      onChange: (page) => this.queryDetail(page, formRecordId || headId),
    };

    const messageTitle = (() => {
      if (headerInfo?.prStatus === 'PENDING_REFER' || !(headerInfo?.prStatus)) {
        return intl.get('HKPC.commom.view.title.purchaseRequirements').d('起草采购申请');
      } else {
        if(bpmActivityCode === '01') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredVerify').d('核對采購申請');
        } else {
          return intl.get('HKPC.commom.view.title.purchaseRequiredApproval').d('審批采購申請');
        }
      }
    })();

    console.log('messageTitle', messageTitle);

    return (
      <PageWrapper loading={queryLoading || querySalePlanListLoading || checkAmountLoading}>
        {!['DONE', 'SENT'].includes(bpmState) && <PageMessage
          message={messageTitle}
          style={{ color: '#F54A45', margin: ' 0  0 16px 0' }}
        />}
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
                title={intl.get(`HKPC.commom.view.title.basicinformation`).d('基本信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <BasicForm {...basicFormProps} />
          </Panel>
          {['salesbusinessproduct'].includes(headerInfo?.prType) && <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`HKPC.commom.view.titla.salesplan`).d('销售计划')}
                arrowActive={activeKey.includes('SalePlan')}
                buttons={
                  readyOnly ? (
                    <></>
                  ) :
                  <>
                    <CusButton mini onClick={this.handleDeleteSalePlanLine}>
                      {intl.get('hzero.common.view.button.delete').d('删除')}
                    </CusButton>
                    <CusButton mini type="primary" onClick={this.handleAddSalePlanLine}>
                      {intl.get('hzero.common.button.add').d('新增')}
                    </CusButton>
                  </>
                }
              />
            }
            key="SalePlan"
          >
            <Form>
              <SalePlanList {...salePlanListprops} />
            </Form>
          </Panel>}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl
                  .get(`HKPC.commom.view.title.ProcurementRequisitionLineInformation`)
                  .d('采购申请行信息')}
                arrowActive={activeKey.includes('purchaseInformation')}
                buttons={
                  readyOnly ? (
                    <></>
                  ) :
                  <>
                    <CusButton mini onClick={this.handleDeletePurchaseInformationLine}>
                      {intl.get('hzero.common.view.button.delete').d('删除')}
                    </CusButton>
                    <CusButton
                      mini
                      type="primary"
                      onClick={this.handleAddPurchaseInformationLine}
                      disabled={!(this.basicForm?.getFieldValue('associatedAgreement')) && this.basicForm?.getFieldValue('isAssociatedAgreement') === 'Y'}
                    >
                      {intl.get('hzero.common.button.add').d('新增')}
                    </CusButton>
                  </>
                }
              />
            }
            key="purchaseInformation"
          >
            <PurchaseInformationList {...purchaseInformationListprops} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
