/*
 * @Description:
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2025-03-11 10:25:34
 */
import React from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Col, Collapse, Row } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import { queryMapIdpValue } from 'services/api';
import { getCurrentOrganizationId, getEditTableData, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import { ready } from '../udc-sdk-esm';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import FinanceForm from './FinanceForm';
import BasicMatForm from './BasicMatForm';
import UploadFileList from './UploadFileList';
import BusBackGround from './BusBackGround';
import ScoreForm from './ScoreForm';
import ScoreList from './ScoreList';
import Store from './Store';
import Logistics from './Logistics';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { every } from 'lodash';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const { loginName, realName } = getCurrentUser();
const gridSpan = getDFormGridSpan();

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['spfmhk.mylink', 'spfmhk.dict'] })
@fastCodeLoader([
  'HKSM.COMPANY.ATTACHMENT_TYPE',
  'LINK.REV_ITEM',
  'LINK_INVITE.REASON',
  'HKSM.PRODCUT_SERVICE',
  'REGISTRATION_ADDRESS',
  'LINK.BUSINESS_CATEGORIES',
  'LINK.PARTNER_SUPPLIER_TYPE',
  'LINK.PARTNER.STORE_TYPE',
  'LINK.PARTNER.DELIVERY_METHOD',
  'LINK.PARTNER.TERMINATE_OR_NOT',
  'HKSP.CREDIT_PERIOD',
  'HKSP.PAYMENT_METHOD'
])
@connect(({ loading, PartnerInformationModal }) => ({
  PartnerInformationModal,
  qeuryLoading:
    loading.effects['PartnerInformationModal/getQueryBasicName'] ||
    loading.effects['PartnerInformationModal/getQueryBasicNum'] ||
    loading.effects['PartnerInformationModal/queryFileTypeList'] ||
    loading.effects['PartnerInformationModal/saveInfo'],
  confirmLoading: loading.effects['PartnerInformationModal/returned'],
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const {
      isType,
      formRecordId,
      activityCode,
      state = null,
    } = queryString.parse(location?.search?.substr(1)) || {};
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    this.state = {
      formRecordId,
      activeKey: [
        'basicInfo',
        'basicInfoMat',
        'busBackground',
        'store',
        'logistics',
        'scoreForm',
        'uploadFile',
        'scoreTable',
        'financeInfo',
      ],
      isType,
      activityCode,
      selectedRows: [],
      selectedRowKeys: [],
      state,
      reasonVisible: false,
      storeSelectedRowKeys: [],
      storeSelectedRows: [],
    };
  }

  /**
   * @name: 操作 - 设置致远自定义按钮
   */
  @Bind()
  handleReady = () => {
    console.log('开始调用设置致远自定义按钮');
    const btns = [
      {
        name: intl.get(`spfmhk.mylink.button.return`).d('退回商户'),
        buttonType: 'ghost',
        customEvents: [
          {
            type: 'click',
            messageType: 'returned',
            func: () => {
              const { PartnerInformationModal } = this.props;
              const { partnerBase } = PartnerInformationModal;
              if (partnerBase?.revStatus == 'MerchantSupplement') {
                CusNotification.error({
                  message: intl
                    .get('spfmhk.mylink.button.verify.tips')
                    .d('商户补充资料中，请勿重复操作！'),
                });
                return;
              }

              this.setState({
                reasonVisible: true,
              });
            },
          },
        ],
      },
      {
        name: intl.get(`spfmhk.mylink.button.refuse`).d('不通过'),
        buttonType: 'ghost',
        customEvents: [
          {
            type: 'click',
            messageType: 'NotPass',
            func: () => {
              const { PartnerInformationModal } = this.props;
              const { partnerBase } = PartnerInformationModal;
              if (partnerBase?.revStatus == 'MerchantSupplement') {
                CusNotification.error({
                  message: intl
                    .get('spfmhk.mylink.button.verify.tips')
                    .d('商户补充资料中，请勿重复操作！'),
                });
                return;
              }
              CusModal.confirm({
                content: intl.get(`spfmhk.mylink.button.confirm.refused`).d('确认拒绝引入该商户！'),
                onOk: () => {
                  this.handleNotPass();
                  console.log('不通过');
                },
              });
            },
          },
        ],
      },
    ];
    console.log('btns', btns);
    ready(
      {
        mode: 'iframe',
        tenant: 'CMI',
      },
      (instance) => {
        instance.getCustomApi().insertBtnForToolbar({
          // 按钮插入位置
          position: 1,
          btns,
        });
      }
    );
  };

  componentDidMount() {
    this.fetchEnum();
    this.queryFileTypeList();
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleClickBtn);
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    // 存在isType的话是名称进来的
    const { isType } = this.state;
    queryMapIdpValue({
      'LINK.REV_ITEM': 'LINK.REV_ITEM',
    }).then((res) => {
      if (res) {
        if (isType) {
          this.queryBasicFromName();
        } else {
          this.queryBasicFromNum(res['LINK.REV_ITEM']);
        }
      }
    });
  }

  queryFileTypeList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/queryFileTypeList',
      payload: {
        'HKSM.COMPANY.ATTACHMENT_TYPE': 1,
        'HKSM.COMPANY.SUB_ATTACHMENT': 2,
      },
    });
  };

  /**
   * @name: 监听事件 - 监听致远点击按钮
   * @param {object} e
   */
  handleClickBtn = (e) => {
    console.log('监听的message', e);
    const { submitType, messageType, url } = e.data || {};

    const handlePostMessage = (params) => {
      debugger;
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
      if (['DRAFT_HANDLE', 'SEND', 'AGREE'].includes(submitType)) {
        // 保存 提交
        // 判断 状态,未商户补充信息时无法提交
        if (this.props?.PartnerInformationModal?.partnerBase?.revStatus == 'MerchantSupplement') {
          CusNotification.error({
            message: intl
              .get('spfmhk.mylink.button.verify.tips')
              .d('商户补充资料中，请勿重复操作！'),
          });
          return;
        }
        this.handleSave((params) => {
          console.log('save&submit', params);
          if (params) {
            handlePostMessage({
              formRecordId: params?.partnerBase?.partnerId || this.state.formRecordId,
              isCustom: params?.partnerBase?.businessCategory === 'CustomerPart' ? 'Y' : 'N', // 节点2商盟经理审批时传给致远 === 客户类传Y,否则N
              VenCode:
                !params?.partnerBase?.supplierNum &&
                params?.partnerBase?.businessCategory?.includes('ProcurePart')
                  ? 'Y'
                  : 'N', // 节点4商盟主管审批时传给致远 === 无供应商编码&&商盟伙伴类别包含商盟采购类。传Y,否则N
              CustCode:
                params?.partnerBase?.businessCategory?.includes('CustomerPart') ||
                (!params?.partnerBase?.supplierNum &&
                  params?.partnerBase?.businessCategory === 'ConsignmentPart')
                  ? 'Y'
                  : 'N', // 节点5采购补充供应商编码时传给致远 === 1.商盟伙伴类别包含商盟客户类 || 2.无供应商编码&&商盟伙伴类别等于寄售类
              AverScore: params?.partnerBase?.revTotalNum, // 总平均分
              subject: intl.get(`spfmhk.mylink.title.zhiyuan.partnerapp`, {
                CompName: params?.partnerBase?.companyName
              }).d(`商盟伙伴入库审批: ${params?.partnerBase?.companyName}`),
              titleView: intl.get(`spfmhk.mylink.title.process.notice`, {
                CompName: params?.partnerBase?.companyName
              }).d(`查册通知：${params?.partnerBase?.companyName}`)
            });
          }
        });
      } else {
        // 其他按钮
        handlePostMessage();
      }
    }
  };

  // 查询基础信息-fromName
  queryBasicFromName = () => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'PartnerInformationModal/getQueryBasicName',
      payload: {
        partnerId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'PartnerInformationModal/updateState',
          payload: {
            partnerBase: res?.partnerBase, // 基本信息
            partnerBusiness: res?.partnerBusiness, // 商户背景
            partnerSupplement: res?.partnerSupplement, // 评委评分
            partnerFinance: res?.partnerFinance, // 财务信息
            partnerFile: res?.partnerFile?.map((item) => ({
              ...item,
              _status: 'update',
              rowKey: uuidv4(),
            })), // 附件信息
            partnerStore: res?.partnerStore,
            partnerStoreFile: res?.partnerStore.storeBrandList
              ? res?.partnerStore?.storeBrandList.map((item) => {
                  return {
                    ...item,
                    rowKey: uuidv4(),
                    _status: 'update',
                  };
                })
              : [],
          },
        });
      }
    });
  };

  // 查询基本信息-fromNum
  queryBasicFromNum = (linkRevItem) => {
    const { dispatch } = this.props;
    const { formRecordId, activityCode } = this.state;
    dispatch({
      type: 'PartnerInformationModal/getQueryBasicNum',
      payload: {
        partnerId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        const partnerScoreData = linkRevItem?.map((item) => ({
          revItem: item?.value, // 评分大项value
          revItemMeaning: item?.meaning, // 评分细项meaning
          revSubItem: item?.description, // 评分细项
          scoreRange: `0 - ${item?.tag}`, // 分值
          maxScore: item?.tag, // 最大分
          refHeadId: formRecordId, // 单据ID
          _status: 'create',
          rowKey: uuidv4(),
        }));
        const partnerFileData = res?.partnerFile?.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'PartnerInformationModal/updateState',
          payload: {
            partnerBase: res?.partnerBase, // 基本信息
            partnerBusiness: res?.partnerBusiness, // 商户背景
            partnerSupplement: res?.partnerSupplement, // 评委评分表单
            partnerFinance: res?.partnerFinance, // 财务信息
            partnerScore:
              res?.partnerScore?.length > 0
                ? res?.partnerScore?.map((item) => {
                    // 从 scoreRange 提取最大值
                    const [minScore, maxScore] = item.scoreRange.split('-').map(Number);
                    return {
                      ...item,
                      _status: 'update',
                      rowKey: uuidv4(),
                      maxScore, // 最大分
                    };
                  })
                : partnerScoreData, // 评委评分表格
            partnerFile: partnerFileData, // 附件信息
            partnerStore: res?.partnerStore,
            partnerStoreFile: res?.partnerStore.storeBrandList
              ? res?.partnerStore?.storeBrandList.map((item) => {
                  return {
                    ...item,
                    rowKey: uuidv4(),
                    _status: 'update',
                  };
                })
              : [],
          },
        });
        if (
          activityCode === 'Start' &&
          !['Inapproval', 'Approved', 'Terminate'].includes(res?.partnerBase?.revStatus)
        ) {
          this.handleReady();
        }
      }
    });
  };

  // 新增附件
  @Bind()
  handleAddLine = () => {
    const { PartnerInformationModal, dispatch } = this.props;
    const { partnerFile = [] } = PartnerInformationModal;
    const newLine = {
      _status: 'create',
      rowKey: uuidv4(),
    };
    const newDataSource = [...partnerFile, newLine];
    dispatch({
      type: 'PartnerInformationModal/updateState',
      payload: {
        partnerFile: newDataSource,
      },
    });
  };

  // 删除附件
  @Bind()
  handleDelete = () => {
    const { dispatch, PartnerInformationModal } = this.props;
    const { partnerFile } = PartnerInformationModal;
    const { selectedRowKeys, selectedRows, formRecordId } = this.state;
    if (selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = partnerFile.filter(
          (item) => selectedRowKeys.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'PartnerInformationModal/deleteTradeLine',
            payload: {
              deleteData: deleteData?.map((item) => item.fileId),
              partnerId: formRecordId,
            },
          }).then((res) => {
            if (res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
              });
              const newDataSource = partnerFile.filter(
                (item) => !selectedRowKeys.includes(item['rowKey'])
              );
              dispatch({
                type: 'PartnerInformationModal/updateState',
                payload: {
                  partnerFile: newDataSource,
                },
              });
              // this.fetchEnum();
            }
          });
        } else {
          // 本地删除
          const newDataSource = partnerFile.filter(
            (item) => !selectedRowKeys.includes(item['rowKey'])
          );
          dispatch({
            type: 'PartnerInformationModal/updateState',
            payload: {
              partnerFile: newDataSource,
            },
          });
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
          });
        }
      });
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  };

  @Bind()
  @Debounce(500)
  handleSave = async (callback) => {
    const { dispatch, PartnerInformationModal } = this.props;
    const { formRecordId, activityCode } = this.state;
    const {
      partnerScore,
      partnerFile,
      partnerBase,
      partnerBusiness,
      partnerStoreFile,
      partnerStore,
      partnerFinance,
    } = PartnerInformationModal;
    const validateDataScore = getEditTableData(partnerScore, ['rowKey']);
    const validateDataFile = getEditTableData(partnerFile, ['rowKey']);
    const validatePartnerStoreFile = getEditTableData(partnerStoreFile, ['rowKey']);
    let allScore = 0;
    validateDataScore.map((item) => (allScore = allScore + item.score));
    if (allScore >= 70) console.log(allScore, 'check');
    console.log(allScore, 'check2');

    const isFinance =
    activityCode === 'Start' &&
    ['ReApprov', 'ReModify'].includes(partnerBase?.revStatus) &&
    !(partnerBase?.revStartMan && partnerBase?.revStartMan != realName);

    // 封装表单验证函数
    const validateForm = (form) => {
      return new Promise((resolve, reject) => {
        form.validateFields((err) => {
          if (err) {
            reject(err); // 如果验证出错，返回错误
          } else {
            resolve(true); // 如果没有错误，验证通过
          }
        });
      });
    };

    const validateAllForms = async () => {
      // 需要根据 ecommerceServiceOrNot 的值来动态选择校验表单
      const formValidationPromises = [
        validateForm(this.basicMatForm),
        validateForm(this.busBackGroundForm),
      ];

      // 如果 ecommerceServiceOrNot 是 'Y'，则需要额外校验 shopForm 和 deliveryForm
      if (partnerBase?.ecommerceServiceOrNot === 'Y') {
        formValidationPromises.push(validateForm(this.storeForm));
        formValidationPromises.push(validateForm(this.logisticsForm));
      }

      // 如果是财务信息，则需要额外校验 financeForm
      if (isFinance) {
        formValidationPromises.push(validateForm(this.financeForm));
      }

      try {
        // 等待所有表单验证完成
        const results = await Promise.all(formValidationPromises);
        // 判断所有表单是否验证通过
        const isValid = every(results, (result) => result === true);
        return isValid;
      } catch (err) {
        // 如果验证失败，返回 false
        return false;
      }
    };

    // 调用验证函数
    const isValid = await validateAllForms();
    console.log('isValid', isValid);

    if (['01', '02', '03'].includes(activityCode)) {
      if (validateDataScore.length > 0) {
        if (allScore >= 70) {
          dispatch({
            type: 'PartnerInformationModal/saveInfo',
            payload: {
              partnerId: formRecordId,
              partnerBase: {},
              partnerFile: [],
              partnerScore: validateDataScore,
            },
          }).then((res) => {
            if (res) {
              if (typeof callback === 'function') {
                callback({
                  partnerBase: res?.partnerBase,
                });
              }
              this.fetchEnum();
            }
          });
        } else {
          CusModal.confirm({
            content: intl
              .get(`spfmhk.mylink.button.score.save`, { score: allScore })
              .d('本次评审总分{score}，分数低于70分，请确认不建议引入'),
            onOk: () => {
              dispatch({
                type: 'PartnerInformationModal/saveInfo',
                payload: {
                  partnerId: formRecordId,
                  partnerBase: {},
                  partnerFile: [],
                  partnerScore: validateDataScore,
                },
              }).then((res) => {
                if (res) {
                  if (typeof callback === 'function') {
                    callback({
                      partnerBase: res?.partnerBase,
                    });
                  }
                  this.fetchEnum();
                }
              });
            },
          });
        }
      }
    } else {
      if(isValid) {
        if (validateDataFile.length > 0) {
          dispatch({
            type: 'PartnerInformationModal/saveInfo',
            payload: {
              partnerId: formRecordId,
              partnerBase: {
                ...partnerBase,
                ...this.basicMatForm.getFieldsValue(),
                supplierModify: activityCode === '09' ? 'Y' : null,
                businessCategories: this.basicMatForm
                  ?.getFieldsValue()
                  ?.businessCategories?.join(','),
              },
              partnerBusiness: {
                ...partnerBusiness,
                ...this.busBackGroundForm.getFieldsValue(),
              },
              partnerFinance: {
                ...partnerFinance,
                ...this.financeForm?.getFieldsValue(),
              },
              partnerFile: validateDataFile.map((item) => ({
                ...item,
                fileType: item?.fileTypeList?.[0],
                subFileType: item?.fileTypeList?.[1],
              })),
              partnerScore: [],
              partnerStore: {
                storeId: partnerStore?.storeId,
                ...this.storeForm?.getFieldsValue(),
                ...this.logisticsForm?.getFieldsValue(),
                storeBrandList: validatePartnerStoreFile.map((item) => {
                  return {
                    ...item,
                    storeId: partnerStore?.storeId,
                    authorizationPeriodFrom: dayjs(item.authorizationPeriod?.[0]).format(
                      'DD/MM/YYYY'
                    ),
                    authorizationPeriodTo: dayjs(item.authorizationPeriod?.[1]).format(
                      'DD/MM/YYYY'
                    ),
                  };
                }),
              },
            },
          }).then((res) => {
            if (res) {
              if (typeof callback === 'function') {
                callback({
                  partnerBase: res?.partnerBase,
                });
              }
              this.fetchEnum();
            }
          });
        }
      }
    }
  };

  submit = () => {
    this.handleSave((params) => {
      const formRecordId = params?.partnerBase?.partnerId || this.state.formRecordId;
      const isCustom = params?.partnerBase?.businessCategory === 'CustomerPart' ? 'Y' : 'N'; // 节点2商盟经理审批时传给致远 === 客户类传Y,否则N
      const VenCode =
        !params?.partnerBase?.supplierNum &&
        params?.partnerBase?.businessCategory?.includes('ProcurePart')
          ? 'Y'
          : 'N'; // 节点4商盟主管审批时传给致远 === 无供应商编码&&商盟伙伴类别包含商盟采购类。传Y,否则N
      const CustCode =
        params?.partnerBase?.businessCategory?.includes('CustomerPart') ||
        (!params?.partnerBase?.supplierNum &&
          params?.partnerBase?.businessCategory === 'ConsignmentPart')
          ? 'Y'
          : 'N'; // 节点5采购补充供应商编码时传给致远 === 1.商盟伙伴类别包含商盟客户类 || 2.无供应商编码&&商盟伙伴类别等于寄售类
      const AverScore = params?.partnerBase?.revTotalNum; // 总平均分
      const subject = intl
        .get(`spfmhk.mylink.title.zhiyuan.partnerapp`, {
          CompName: params?.partnerBase?.companyName,
        })
        .d(`商盟伙伴入库审批: ${params?.partnerBase?.companyName}`);
      console.log('submit', formRecordId, isCustom, VenCode, CustCode, AverScore, subject);
    });
  };

  // // 致远自定义按钮不通过
  @Bind()
  handleNotPass = () => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'PartnerInformationModal/notPass',
      payload: {
        partnerId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        // 通知致远关闭窗口
        window.parent?.postMessage({ messageType: 'CLOSE_WINDOW' }, '*');
      }
    });
  };

  // 致远自定义按钮退回商户
  @Bind()
  handleReturned = () => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    console.log(
      this.props.form.validateFields((err, value) => {
        if (!err) {
          dispatch({
            type: 'PartnerInformationModal/returned',
            payload: {
              partnerId: formRecordId,
              businessManRemark: value.businessManRemark,
            },
          }).then((res) => {
            if (res) {
              // 通知致远关闭窗口
              window.parent?.postMessage({ messageType: 'CLOSE_WINDOW' }, '*');
            }
          });
        }
        console.log(value, err);
      })
    );
  };

  // 删除店铺行数据
  @Bind()
  handleStoreDelete = () => {
    const { dispatch, PartnerInformationModal } = this.props;
    const { partnerStoreFile } = PartnerInformationModal;
    const { storeSelectedRowKeys, formRecordId } = this.state;
    if (storeSelectedRowKeys.length > 0) {
      console.log(storeSelectedRowKeys);
      CusModal.CusDeleteConfirm(() => {
        const deleteData = partnerStoreFile.filter(
          (item) => storeSelectedRowKeys.includes(item['rowKey']) && item._status !== 'create'
        );
        // 后台删除
        if (deleteData.length > 0) {
          dispatch({
            type: 'PartnerInformationModal/deleteStoreLine',
            payload: {
              deleteData: deleteData?.map((item) => {
                return item.brandId;
              }),
              partnerId: formRecordId,
            },
          }).then((res) => {
            if (res) {
              // 本地删除
              const newDataSource = partnerStoreFile.filter(
                (item) => !storeSelectedRowKeys.includes(item['rowKey'])
              );
              dispatch({
                type: 'PartnerInformationModal/updateState',
                payload: {
                  partnerStoreFile: newDataSource,
                },
              });
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              this.setState({
                storeSelectedRowKeys: [],
                storeSelectedRows: [],
              });
            }
          });
        }
        // 本地删除
        else {
          // 本地删除
          const newDataSource = partnerStoreFile.filter(
            (item) => !storeSelectedRowKeys.includes(item['rowKey'])
          );
          dispatch({
            type: 'PartnerInformationModal/updateState',
            payload: {
              partnerStoreFile: newDataSource,
            },
          });
          this.setState({
            storeSelectedRowKeys: [],
            storeSelectedRows: [],
          });
        }
      });
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  };

  // 新增店铺行数据
  @Bind()
  handleStoreAddLine = () => {
    const { PartnerInformationModal, dispatch } = this.props;
    const { partnerStoreFile = [] } = PartnerInformationModal;
    const newLine = {
      _status: 'create',
      rowKey: uuidv4(),
      brandName: null,
      authorizationPeriod: null,
      brandQualificationUuid: uuidv4(),
      brandLogoImageUuid: uuidv4(),
    };
    const newDataSource = [...partnerStoreFile, newLine];
    dispatch({
      type: 'PartnerInformationModal/updateState',
      payload: {
        partnerStoreFile: newDataSource,
      },
    });
  };

  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
      PartnerInformationModal,
      confirmLoading = false,
    } = this.props;

    const { partnerBase, partnerSupplement } = PartnerInformationModal;
    const {
      activeKey,
      headerInfo,
      formRecordId,
      isType,
      activityCode,
      selectedRowKeys,
      state,
      reasonVisible,
      storeSelectedRowKeys,
    } = this.state;

    // 节点 = 开始节点 && 评审状态 = 退回待审批||退回已修改 （可编辑单据）
    const readyOnly =
      activityCode === 'Start' &&
      ['ReApprov', 'ReModify'].includes(partnerBase?.revStatus) &&
      !(partnerBase?.revStartMan && partnerBase?.revStartMan != realName);

    console.log('readyOnly', readyOnly);

    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      detailList,
      idpValueMap,
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        // 选中项发生变化时的回调
        this.setState({
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows,
        });
      },
    };

    const basicMatFormProps = {
      ...this.props,
      isType,
      readyOnly,
      activityCode,
      onRef: (ref) => {
        this.basicMatForm = ref.props.form;
      },
    };

    const busBackGroundProps = {
      ...this.props,
      readyOnly,
      onRef: (ref) => {
        this.busBackGroundForm = ref.props.form;
      },
    };

    const storeRowSelection = {
      storeSelectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        // 选中项发生变化时的回调
        this.setState({
          storeSelectedRowKeys: selectedRowKeys,
          storeSelectedRows: selectedRows,
        });
      },
    };

    const storeProps = {
      ...this.props,
      readyOnly,
      activityCode,
      rowSelection: storeRowSelection,
      state,
      onRef: (ref) => {
        this.storeForm = ref.props.form;
      },
    };

    const logisticsProps = {
      ...this.props,
      readyOnly,
      onRef: (ref) => {
        this.logisticsForm = ref.props.form;
      },
    };

    const scoreFormProps = {
      ...this.props,
    };

    const financeFormProps = {
      ...this.props,
      readyOnly,
      onRef: (ref) => {
        this.financeForm = ref.props.form;
      },
    }

    const uploadFileListProps = {
      ...this.props,
      readyOnly,
      rowSelection,
      activityCode,
      state,
    };

    const scoreListProps = {
      ...this.props,
      formRecordId,
      activityCode,
      state,
    };

    return (
      <PageWrapper loading={qeuryLoading}>
        <Collapse
          className="customize-collapse"
          style={{ marginTop: '16px' }}
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          {!isType && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.basicinfo`).d('基本信息')}
                  arrowActive={activeKey.includes('basicInfo')}
                />
              }
              bordered={false}
              key="basicInfo"
            >
              <BasicForm {...basicFormProps} />
            </Panel>
          )}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.mylink.view.title.basicinfomat`).d('基础信息')}
                arrowActive={activeKey.includes('basicInfoMat')}
              />
            }
            bordered={false}
            key="basicInfoMat"
          >
            <BasicMatForm {...basicMatFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.mylink.view.title.bus.background`).d('商户背景')}
                arrowActive={activeKey.includes('busBackground')}
              />
            }
            bordered={false}
            key="busBackground"
          >
            <BusBackGround {...busBackGroundProps} />
          </Panel>
          {partnerBase?.ecommerceServiceOrNot === 'Y' && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.field.portal.shop`).d('店铺')}
                  arrowActive={activeKey.includes('store')}
                  buttons={
                    <>
                      {(readyOnly || (['06', '13'].includes(activityCode) && state != 'DONE')) && (
                        <CusButton mini onClick={this.handleStoreDelete}>
                          {intl.get('hzero.common.view.button.delete').d('删除')}
                        </CusButton>
                      )}
                      {(readyOnly || (['06', '13'].includes(activityCode) && state != 'DONE')) && (
                        <CusButton mini type="primary" onClick={this.handleStoreAddLine}>
                          {intl.get('hzero.common.button.create').d('新增')}
                        </CusButton>
                      )}
                    </>
                  }
                />
              }
              bordered={false}
              key="store"
            >
              <Store {...storeProps} />
            </Panel>
          )}
          {partnerBase?.ecommerceServiceOrNot === 'Y' && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.field.portal.logistics`).d('物流及售后')}
                  arrowActive={activeKey.includes('logistics')}
                />
              }
              bordered={false}
              key="logistics"
            >
              <Logistics {...logisticsProps} />
            </Panel>
          )}
          {(
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.financialInformation`).d('财务信息')}
                  arrowActive={activeKey.includes('financeInfo')}
                />
              }
              key="financeInfo"
            >
              <FinanceForm {...financeFormProps} />
            </Panel>
          )}
          {partnerSupplement?.sumAverageScore > 0 && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.judges.score`).d('评委评分')}
                  arrowActive={activeKey.includes('scoreForm')}
                />
              }
              bordered={false}
              key="scoreForm"
            >
              <ScoreForm {...scoreFormProps} />
            </Panel>
          )}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.mylink.field.attachment.upload`).d('附件上传')}
                arrowActive={activeKey.includes('uploadFile')}
                buttons={
                  <>
                    {(readyOnly || (['06', '13'].includes(activityCode) && state != 'DONE')) && (
                      <CusButton mini onClick={this.handleDelete}>
                        {intl.get('hzero.common.view.button.delete').d('删除')}
                      </CusButton>
                    )}
                    {(readyOnly || (['06', '13'].includes(activityCode) && state != 'DONE')) && (
                      <CusButton mini type="primary" onClick={this.handleAddLine}>
                        {intl.get('hzero.common.button.create').d('新增')}
                      </CusButton>
                    )}
                  </>
                }
              />
            }
            key="uploadFile"
          >
            <UploadFileList {...uploadFileListProps} />
          </Panel>
          {['01', '02', '03'].includes(activityCode) && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.judges.score`).d('评委评分')}
                  arrowActive={activeKey.includes('scoreTable')}
                />
              }
              key="scoreTable"
            >
              <div style={{ paddingBottom: '16px', marginTop: '-4px' }}>
                {intl.get(`spfmhk.mylink.field.score.des`).d('说明：平均分低于70份将不予引入')}
              </div>
              <ScoreList {...scoreListProps} />
            </Panel>
          )}
        </Collapse>
        <CusModal
          title={intl.get(`spfmhk.mylink.button.return`).d('退回商户')}
          width={800}
          visible={reasonVisible}
          destroyOnClose
          onCancel={() => {
            this.setState({
              reasonVisible: false,
            });
          }}
          onOk={() => {
            this.handleReturned();
          }}
          confirmLoading={confirmLoading}
        >
          <div className="customize-form">
            <Form ref={this.form}>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={intl
                      .get(`spfmhk.mylink.field.merchantReturn.Reason`)
                      .d('商户补充内容备注')}
                  >
                    {this.props.form.getFieldDecorator('businessManRemark', {
                      initialValue: '',
                      rules: [
                        {
                          required: reasonVisible,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`spfmhk.mylink.field.merchantReturn.Reason`)
                              .d('商户补充内容备注'),
                          }),
                        },
                      ],
                    })(
                      <CusInput.TextArea
                        rows={7}
                        autoSize={{ minRows: 7, maxRows: 7 }}
                        maxLength={2000}
                        showCharacter
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </CusModal>
        {/* <CusButton onClick={this.handleSave}>save</CusButton> */}
        {/* <CusButton onClick={this.submit}>submit</CusButton> */}
        {/* <CusButton onClick={this.handleNotPass}>不通过</CusButton>
        <CusButton onClick={this.handleReturned}>退回商户</CusButton> */}
      </PageWrapper>
    );
  }
}
