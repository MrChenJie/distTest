import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse } from 'antd';
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
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import FinanceForm from '../../cooperationChange/Detail/FinanceForm';
import BasicMatForm from './BasicMatForm';
import UploadFileList from './UploadFileList';
import BusBackGround from './BusBackGround';
import ScoreForm from './ScoreForm';
import Store from './Store';
import Logistics from './Logistics';
import ScoreList from './ScoreList';
import { every } from 'lodash';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const { loginName, realName } = getCurrentUser();

@formatterCollections({ code: ['spfmhk.mylink', 'spfmhk.dict'] })
@fastCodeLoader([
  'HKSM.COMPANY.ATTACHMENT_TYPE',
  'LINK.REV_ITEM',
  'HKSM.APPLICATION.STATUS',
  'LINK_INVITE.REASON',
  'REGISTRATION_ADDRESS',
  'LINK_UPDATE_TYPE',
  'LINK.PARTNER_CATEGORY',
  'LINK.PARTNER_SUPPLIER_TYPE',
  'LINK.BUSINESS_CATEGORIES',
  'LINK.PARTNER.TERMINATE_OR_NOT',
  'LINK.PARTNER.STORE_TYPE',
  'LINK.PARTNER.DELIVERY_METHOD',
  'HKSP.CREDIT_PERIOD',
  'HKSP.PAYMENT_METHOD',
])
@connect(({ loading, PartnerInformationModal }) => ({
  PartnerInformationModal,
  qeuryLoading:
    loading.effects['PartnerInformationModal/getQueryBasic'] ||
    loading.effects['PartnerInformationModal/saveInfoPartner'],
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const { isType, formRecordId, refCaseId } =
      queryString.parse(location?.search?.substr(1)) || {};
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    if (refCaseId && !(formRecordId && formRecordId != 'null')) this.add(refCaseId);
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
      selectedRows: [],
      selectedRowKeys: [],
      refCaseId,
      storeSelectedRowKeys: [],
      storeSelectedRows: [],
    };
    if (formRecordId && formRecordId != 'null') this.queryBasicFromName();
  }
  componentDidMount() {
    // this.fetchEnum();
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
    debugger
    const { formRecordId } = this.state;
    console.log(formRecordId, 'formRecordId');
    if (formRecordId && formRecordId != 'null') this.queryBasicFromName();
  }

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
            subject: params?.subject,
            ...params,
          },
        },
        url
      );
    };

    if (e.data.messageType === 'GET_FORM_DATA') {
      if (['DRAFT_HANDLE', 'SEND', 'AGREE'].includes(submitType)) {
        // 保存 提交
        this.handleSave((params) => {
          console.log('save&submit', params);
          if (params) {
            handlePostMessage({
              formRecordId: params?.partnerRecordId || this.state.formRecordId,
              subject: params?.subject,
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
      type: 'PartnerInformationModal/getQueryBasicPartner',
      payload: {
        partnerId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'PartnerInformationModal/updateState',
          payload: {
            partnerBase: res, // 基本信息
            partnerBusiness: res?.linkPartnerBusinessHis, // 商户背景
            partnerSupplement: res?.partnerSupplement, // 评委评分
            partnerFinance: res?.linkPartnerFinanceHis, // 财务信息
            partnerFile: res?.linkPartnerFileHiss?.map((item) => ({
              ...item,
              _status: 'update',
              rowKey: uuidv4(),
            })), // 附件信息
            partnerStore: res?.partnerStore,
            partnerStoreFile: res?.partnerStore?.storeBrandList
              ? res?.partnerStore?.storeBrandList.map((item) => {
                  return {
                    ...item,
                    _status: 'update',
                    rowKey: uuidv4(),
                  };
                })
              : [],
          },
        });
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
      fileUuid: uuidv4(),
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
    const { selectedRowKeys, formRecordId } = this.state;
    if (selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = partnerFile.filter(
          (item) => selectedRowKeys.includes(item['rowKey']) && item._status !== 'create'
        );
        console.log(deleteData);
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'PartnerInformationModal/deletePartner',
            payload: {
              deleteData: deleteData?.map((item) => {
                return {
                  fileRecordId: item.fileRecordId,
                };
              }),
              partnerId: formRecordId,
            },
          }).then((res) => {
            if (res) {
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
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
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
  handleSave = async (callback) => {
    const { dispatch, PartnerInformationModal } = this.props;
    const { partnerFile, partnerBase, partnerBusiness, partnerStoreFile, partnerStore, partnerFinance } =
      PartnerInformationModal;
    const validateDataFile = getEditTableData(partnerFile, ['rowKey']);
    const partnerStoreFileList = getEditTableData(partnerStoreFile, ['rowKey']);

    const isFinance =
    (partnerBase?.applyStatus && partnerBase?.applyStatus != 'Draft') ||
    (partnerBase?.saleMan && partnerBase?.saleMan != loginName);

    // 封装表单验证函数
    const validateForm = (form) => {
      return new Promise((resolve, reject) => {
        form.validateFields({ force: true }, (err) => {
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
        validateForm(this.busBackForm),
      ];

      // 如果 ecommerceServiceOrNot 是 'Y'，则需要额外校验 shopForm 和 deliveryForm
      if (partnerBase?.ecommerceServiceOrNot === 'Y') {
        formValidationPromises.push(validateForm(this.storeForm));
        formValidationPromises.push(validateForm(this.logisticsForm));
      }

      // 如果是财务信息，则需要额外校验 financeForm
      if (!isFinance) {
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

    if (isValid) {
      if (validateDataFile.length > 0) {
        dispatch({
          type: 'PartnerInformationModal/saveInfoPartner',
          payload: {
            applyStatus: 'Draft',
            ...partnerBase,
            ...this.basicMatForm?.getFieldsValue(),
            // ...value,
            partnerCategory: partnerBase.businessCategory,
            linkPartnerFinanceHis: {
              ...partnerFinance,
              ...this.financeForm?.getFieldsValue(),
            },
            linkPartnerFileHiss: validateDataFile.map((item) => ({
              ...item,
              fileType: item?.fileTypeList?.[0],
              subFileType: item?.fileTypeList?.[1],
            })),
            linkPartnerBusinessHis: {
              ...partnerBusiness,
              ...this.busBackForm?.getFieldsValue(),
            },
            partnerStore: {
              storeId: partnerStore?.storeId,
              ...this.storeForm?.getFieldsValue(),
              ...this.logisticsForm?.getFieldsValue(),
              storeBrandList: partnerStoreFileList?.map((item) => {
                return {
                  ...item,
                  storeId: partnerStore?.storeId,
                  authorizationPeriodFrom: dayjs(item.authorizationPeriod?.[0]).format(
                    'DD/MM/YYYY'
                  ),
                  authorizationPeriodTo: dayjs(item.authorizationPeriod?.[1]).format('DD/MM/YYYY'),
                };
              }),
            },
            businessCategories: this.basicMatForm?.getFieldsValue()?.businessCategories?.join(','),
          },
        }).then((res) => {
          if (res) {
            this.setState({
              formRecordId: res?.partnerRecordId,
            });
            this.fetchEnum();
            if (typeof callback === 'function') {
              callback({
                partnerBase: res,
                subject: intl
                  .get('spfmhk.mylink.title.zhiyuan.infochange', {
                    CompName: res?.companyName,
                  })
                  .d('合作伙伴类别更新：{CompName}'),
              });
            }
          }
        });
      }
    }
  };

  submit = () => {
    this.handleSave((params) => {
      const formRecordId = params?.partnerRecordId || this.state.formRecordId;
      const subject = params?.subject;
      console.log('submit', formRecordId, isCustom, venCode, custCode, subject);
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
    dispatch({
      type: 'PartnerInformationModal/returned',
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

  // 新增
  @Bind
  add(id) {
    const { dispatch } = this.props;
    dispatch({
      type: 'cooperationCategoryModal/add',
      payload: { id },
    }).then((res) => {
      console.log('res', res);
      if (res) {
        dispatch({
          type: 'PartnerInformationModal/updateState',
          payload: {
            partnerBase: {
              ...res?.partnerBase,
              refSourceHeadId: id,
              saleMan: loginName,
              saleManMeaning: realName,
              // applyStatus: 'Draft'
            }, // 基本信息
            partnerBusiness: res?.partnerBusiness, // 商户背景
            partnerSupplement: res?.partnerSupplement, // 评委评分表单
            partnerFinance: res?.partnerFinance, // 财务信息
            partnerFile:
              res?.partnerFile?.length > 0
                ? res?.partnerFile?.map((item) => ({
                    ...item,
                    _status: 'create',
                    rowKey: uuidv4(),
                  }))
                : [], // 评委评分表格
            partnerStore: res?.partnerStore,
            partnerStoreFile: res?.partnerStore?.storeBrandList
              ? res?.partnerStore?.storeBrandList.map((item) => {
                  return {
                    ...item,
                    _status: 'create',
                    rowKey: uuidv4(),
                  };
                })
              : [],
            // partnerFile: res?.partnerFile, // 附件信息
          },
        });
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
            type: 'PartnerInformationModal/deleteUpdateStoreLine',
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
    } = this.props;

    const { partnerBase } = PartnerInformationModal;
    const { activeKey, headerInfo, isType, selectedRowKeys, storeSelectedRowKeys } = this.state;

    const readyOnly =
      (partnerBase?.applyStatus && partnerBase?.applyStatus != 'Draft') ||
      (partnerBase?.saleMan && partnerBase?.saleMan != loginName);

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
      readyOnly,
      isType,
      onRef: (ref) => {
        this.basicMatForm = ref.props.form;
      },
    };

    const busBackGroundProps = {
      ...this.props,
      readyOnly,
      onRef: (ref) => {
        this.busBackForm = ref.props.form;
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
      rowSelection: storeRowSelection,
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

    const uploadFileListProps = {
      ...this.props,
      readyOnly,
      rowSelection,
    };

    const financeFormProps = {
      ...this.props,
      readyOnly: !readyOnly,
      onRef: (ref) => {
        this.financeForm = ref.props.form;
      },
    }

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
                      {!readyOnly && (
                        <CusButton mini onClick={this.handleStoreDelete}>
                          {intl.get('hzero.common.view.button.delete').d('删除')}
                        </CusButton>
                      )}
                      {!readyOnly && (
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
          {
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
          }
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.mylink.field.attachment.upload`).d('附件上传')}
                arrowActive={activeKey.includes('uploadFile')}
                buttons={
                  <>
                    {!readyOnly && (
                      <CusButton mini onClick={this.handleDelete}>
                        {intl.get('hzero.common.view.button.delete').d('删除')}
                      </CusButton>
                    )}
                    {!readyOnly && (
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
        </Collapse>
        {/* <CusButton onClick={this.handleSave}>save</CusButton>
        <CusButton onClick={this.submit}>submit</CusButton> */}
        {/* <CusButton onClick={this.handleNotPass}>不通过</CusButton>
        <CusButton onClick={this.handleReturned}>退回商户</CusButton> */}
      </PageWrapper>
    );
  }
}
