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
import ScoreList from './ScoreList';
import Store from './Store';
import Logistics from './Logistics';
import CusLov from '_cus_components/CusLov';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const { loginName, realName } = getCurrentUser();

@formatterCollections({ code: ['spfmhk.mylink', 'spfmhk.dict'] })
@fastCodeLoader([
  'HKSM.COMPANY.ATTACHMENT_TYPE',
  'LINK.REV_ITEM',
  'HKSM.BENEFIT_PARTNER.CATEGORY',
  'LINK_INVITE.REASON',
  'LINK_UPDATE_TYPE',
  'LINK.PARTNER_SUPPLIER_TYPE',
  'LINK.BUSINESS_CATEGORIES',
  'LINK.PARTNER.TERMINATE_OR_NOT',
  'LINK.PARTNER.STORE_TYPE',
  'LINK.PARTNER.DELIVERY_METHOD',
  'HKSP.CREDIT_PERIOD',
  'HKSP.PAYMENT_METHOD'
])
@connect(({ loading, cooperationCategoryModal, PartnerInformationModal }) => ({
  cooperationCategoryModal,
  PartnerInformationModal,
  qeuryLoading:
    loading.effects['cooperationCategoryModal/getQueryBasic'] ||
    loading.effects['cooperationCategoryModal/saveInfo'],
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const {
      isType,
      formRecordId,
      activityCode,
      refCaseId,
      state = null,
    } = queryString.parse(location?.search?.substr(1)) || {};
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    // if(activityCode === 'Start') {
    //   this.handleReady();
    // }
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
      activityCode,
      selectedRows: [],
      selectedRowKeys: [],
      refCaseId,
      state,
    };
    if (formRecordId && formRecordId != 'null') this.queryBasicFromName();
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
              this.handleReturned();
              console.log('退回商户');
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
              this.handleNotPass();
              console.log('不通过');
            },
          },
        ],
      },
    ];
    console.log('btns', btns);
  };

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
    const { formRecordId } = this.state;
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
        this.handleSave((params) => {
          console.log('save&submit', params);
          if (params) {
            handlePostMessage({
              formRecordId: params?.partnerBase?.recordTypeId || this.state.formRecordId,
              // isCustom: 'Y',
              // venCode: 'Y',
              // custCode: 'Y',
              isCustom: params?.checklist === 'CustomerPart' ? 'Y' : 'N', // 节点2商盟经理审批时传给致远 === 客户类传Y,否则N
              VenCode:
                !params?.partnerBase?.supplierNum &&
                params?.partnerBase?.businessCategory?.includes('ProcurePart')
                  ? 'Y'
                  : 'N', // 节点4商盟主管审批时传给致远 === 无供应商编码&&商盟伙伴类别包含商盟采购类。传Y,否则N
              CustCode:
                (!params?.partnerBase?.customerNum &&
                  params?.partnerBase?.businessCategory?.includes('CustomerPart')) ||
                (!params?.partnerBase?.supplierNum &&
                  (params?.partnerBase?.businessCategory === 'ConsignmentPart' ||
                    params?.partnerBase?.businessCategory === 'CustomerPart,ConsignmentPart' ||
                    params?.partnerBase?.businessCategory === 'ConsignmentPart,CustomerPart'))
                  ? 'Y'
                  : 'N', // 节点5采购补充供应商编码时传给致远 === 1.商盟伙伴类别包含商盟客户类 || 2.无供应商编码&&商盟伙伴类别等于寄售类或寄售类和客户类
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
      type: 'cooperationCategoryModal/getQueryBasicName',
      payload: formRecordId,
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'PartnerInformationModal/updateState',
          payload: {
            partnerFinance: res?.partnerFinance, // 财务信息
          },
        })
        dispatch({
          type: 'cooperationCategoryModal/updateState',
          payload: {
            partnerBase: res?.partnerBase, // 基本信息
            partnerBusiness: res?.partnerBusiness, // 商户背景
            partnerSupplement: res?.partnerSupplement, // 评委评分
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
                    _status: 'update',
                  };
                })
              : [],
          },
        });
        this.setState({
          formRecordId: res?.partnerBase?.recordTypeId,
        });
      }
    });
  };

  // 新增附件
  @Bind()
  handleAddLine = () => {
    const { cooperationCategoryModal, dispatch } = this.props;
    const { partnerFile = [] } = cooperationCategoryModal;
    const { formRecordId } = this.state;
    const newLine = {
      _status: 'create',
      rowKey: uuidv4(),
      refRecordTypeId: formRecordId,
    };
    const newDataSource = [...partnerFile, newLine];
    dispatch({
      type: 'cooperationCategoryModal/updateState',
      payload: {
        partnerFile: newDataSource,
      },
    });
  };

  // 删除附件
  @Bind()
  handleDelete = () => {
    const { dispatch, cooperationCategoryModal } = this.props;
    const { partnerFile } = cooperationCategoryModal;
    const { selectedRowKeys, selectedRows, formRecordId } = this.state;
    if (selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = partnerFile.filter(
          (item) => selectedRowKeys.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'cooperationCategoryModal/deleteTradeLine',
            payload: {
              deleteData: deleteData?.map((item) => item.typeFileId),
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
              this.fetchEnum();
            }
          });
        } else {
          // 本地删除
          const newDataSource = partnerFile.filter(
            (item) => !selectedRowKeys.includes(item['rowKey'])
          );
          dispatch({
            type: 'cooperationCategoryModal/updateState',
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
  handleSave = (callback) => {
    const { dispatch, cooperationCategoryModal } = this.props;
    const { formRecordId, activityCode } = this.state;
    const { partnerScore, partnerFile, partnerBase } = cooperationCategoryModal;
    const validateDataScore = getEditTableData(partnerScore, ['rowKey']);
    const validateDataFile = getEditTableData(partnerFile, ['rowKey']);
    // if(['01', '02', '03'].includes(activityCode)) {
    //   if(validateDataScore.length > 0) {
    //     dispatch({
    //       type: 'cooperationCategoryModal/saveInfo',
    //       payload: {
    //         partnerId: formRecordId,
    //         partnerBase: {},
    //         partnerFile: [],
    //         partnerScore: validateDataScore,
    //       },
    //     }).then((res) => {
    //       if(res) {
    //         if (typeof callback === 'function') {
    //           callback({
    //             partnerBase: res?.partnerBase,
    //             subject: '标题',
    //           });
    //         }
    //         this.fetchEnum();
    //       }
    //     })
    //   }
    // } else {
    this.basicMatForm?.validateFields((err, values) => {
      if (!err) {
        if (validateDataFile.length > 0) {
          dispatch({
            type: 'cooperationCategoryModal/saveInfo',
            payload: {
              recordTypeId: formRecordId,
              businessCategory: values?.businessCategory?.join(','),
              refSourceHeadId: partnerBase.refSourceHeadId,
              sourceBusinessCategory: partnerBase.sourceBusinessCategory,
              supplierModify:
                activityCode === '09'
                  ? 'Y'
                  : partnerBase?.supplierModify
                  ? partnerBase.supplierModify
                  : partnerBase?.supplierNum
                  ? 'Y'
                  : 'N',
              supplierNum: values?.supplierNum,
              customerNum: values?.customerNum,
              inviteReason: values?.inviteReason,
              inviteReasonSup: values?.inviteReasonSup,
              partnerFile: validateDataFile.map((item) => ({
                ...item,
                fileType: item?.fileTypeList?.[0],
                subFileType: item?.fileTypeList?.[1],
              })),
            },
          }).then((res) => {
            if (res) {
              this.setState({
                formRecordId: res?.partnerBase?.recordTypeId,
              });
              if (typeof callback === 'function') {
                callback({
                  partnerBase: res?.partnerBase,
                  subject: intl.get(`spfmhk.mylink.title.zhiyuan.categchange`, {
                    CompName: res?.partnerBase?.companyName,
                  }),
                  checklist: [
                    ...res?.partnerBase?.businessCategory
                      ?.split(',')
                      .filter(
                        (item) =>
                          !res?.partnerBase?.sourceBusinessCategory?.split(',').includes(item)
                      ),
                    ...res?.partnerBase?.sourceBusinessCategory
                      ?.split(',')
                      .filter(
                        (item) => !res?.partnerBase?.businessCategory?.split(',').includes(item)
                      ),
                  ].join(','),
                });
              }
              this.fetchEnum();
            }
          });
        }
      }
    });
    // }
  };

  submit = () => {
    this.handleSave((params) => {
      const formRecordId = params?.partnerBase?.partnerId || this.state.formRecordId;
      const isCustom = params?.partnerBase?.businessCategory === 'CustomerPart' ? 'Y' : 'N'; // 节点2商盟经理审批时传给致远 === 客户类传Y,否则N
      // const venCode = (!(params?.partnerBase?.supplierNum)) && params?.partnerBase?.businessCategory?.includes('ProcurePart') ? 'Y' : 'N' // 节点4商盟主管审批时传给致远 === 无供应商编码&&商盟伙伴类别包含商盟采购类。传Y,否则N
      // const custCode = params?.partnerBase?.businessCategory?.includes('CustomerPart') || (!(params?.partnerBase?.supplierNum) && params?.partnerBase?.businessCategory === 'ConsignmentPart') ? 'Y' : 'N' // 节点5采购补充供应商编码时传给致远 === 1.商盟伙伴类别包含商盟客户类 || 2.无供应商编码&&商盟伙伴类别等于寄售类
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
      type: 'cooperationCategoryModal/notPass',
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
      type: 'cooperationCategoryModal/returned',
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
            partnerFinance: res?.partnerFinance, // 财务信息
          },
        })
        dispatch({
          type: 'cooperationCategoryModal/updateState',
          payload: {
            partnerBase: res?.partnerBase, // 基本信息
            partnerBusiness: res?.partnerBusiness, // 商户背景
            partnerSupplement: res?.partnerSupplement, // 评委评分表单
            partnerFile:
              res?.partnerFile?.length > 0
                ? res?.partnerFile?.map((item) => ({
                    ...item,
                    _status: 'update',
                    rowKey: uuidv4(),
                  }))
                : [], // 附件信息
            partnerStore: res?.partnerStore,
            partnerStoreFile: res?.partnerStore.storeBrandList
              ? res?.partnerStore?.storeBrandList.map((item) => {
                  return {
                    ...item,
                    _status: 'update',
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

  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
      cooperationCategoryModal,
    } = this.props;

    const { partnerBase, partnerSupplement } = cooperationCategoryModal;
    const { activeKey, headerInfo, formRecordId, isType, activityCode, selectedRowKeys, state } =
      this.state;

    const readyOnly =
      (partnerBase?.applyStatus && partnerBase?.applyStatus != 'Draft') ||
      (partnerBase?.applyMan && partnerBase?.applyMan != realName);

    console.log('readyOnly', readyOnly);

    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      detailList,
      idpValueMap,
      activityCode,
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
      activityCode,
      state,
      onRef: (ref) => {
        this.basicMatForm = ref.props.form;
      },
    };

    const busBackGroundProps = {
      ...this.props,
      activityCode,
      readyOnly,
      state,
    };

    const storeProps = {
      ...this.props,
      readyOnly,
      activityCode,
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
      activityCode,
      readyOnly,
      state,
    };

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
    };

    const financeFormProps = {
      ...this.props,
      readyOnly: false,
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
                    {(!readyOnly || (activityCode === '06' && state != 'DONE')) && (
                      <CusButton mini onClick={this.handleDelete}>
                        {intl.get('hzero.common.view.button.delete').d('删除')}
                      </CusButton>
                    )}
                    {(!readyOnly || (activityCode === '06' && state != 'DONE')) && (
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
        {/* <CusButton onClick={()=>this.handleSave((params)=>console.log(params, 'params'))}>save</CusButton>
        <CusButton onClick={this.submit}>submit</CusButton> */}
        {/* <CusButton onClick={this.handleNotPass}>不通过</CusButton>
        <CusButton onClick={this.handleReturned}>退回商户</CusButton> */}
        <CusButton onClick={()=>this.handleSave((params)=>console.log(params, 'params'))}>save</CusButton>
      </PageWrapper>
    );
  }
}
