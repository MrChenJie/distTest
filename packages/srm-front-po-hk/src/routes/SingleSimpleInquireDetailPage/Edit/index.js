import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Col, Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import { Bind, Debounce } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import notification from 'utils/notification';
import { fastCodeLoader } from '@/utils/decorators';
import uuid from 'uuid/v4';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import FilterSearch from './FilterSearch';
import InquireBaseInfo from './InquireBaseInfo'
import InviteSupplierTable from './InviteSupplierTable'
import QuotationTable from './QuotationTable'
import StageTable from './StageTable'
import styles from './index.less';
import classnames from 'classnames';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import CusUpload from './component/CusUpload';
import { Form } from 'hzero-ui';
// import { fastCodeLoader } from '@/utils/decorators';
import queryString from 'querystring';
import UploadList from '../../../../../srm-front-ssrc-hk/src/components/uploadList'; 

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const { ERP_HOST } = process.env;

@Form.create()

@formatterCollections({ code: [promptCode] })
@connect(({ singlePurchaseApplicationModel, loading = {} }) => ({
  singlePurchaseApplicationModel,
  fetchListLoading: loading.effects['singlePurchaseApplicationModel/queryDetail'] ||
    loading.effects['singlePurchaseApplicationModel/firstQueryDetail'],
}))
@fastCodeLoader([

])
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm

  constructor(props) {
    super(props);
    const {
      location: { search = '' },
    } = props;
    const { enter, packageNo } = queryString.parse(search.substr(1)) || {};

    this.state = {
      activeKey: ['form', 'inquireBaseTab', 'uploadTable', 'inquireInfoTab', 'quatation', 'inviteSupplier', 'stageTab'],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      stageShow: false,  // 第一次点击保存以后，阶段才会显示;
      quatationSelectedRowKeys: [],
      rqStatus: '',  //询价单状态
      enter,  // 进入该页面方式
      packageNo, //标包编号
      caseId: '', //致远的caseId
      uuid: '', // 附件uuid
      prThirdSupAttachmentList: [], //附件list
      tabActiveKey: 'scoreDetailTwo',
      SearchTabActiveKey: '1',
      isSendAllFlag: '',
    }
  }

  componentDidMount() {
    this.handleQuery();
    this.fetchDetailEnum();
  }

  @Bind()
  fetchDetailEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'singlePurchaseApplicationModel/fetchDetailEnum',
    });
  }

  /**
    * @description 简易询价详情
    */
  @Bind()
  handleQuery() {
    const { packageNo } = this.state;
    this.inquiryQuery(packageNo);
    this.getMaterialList(_, packageNo);
  }





  /**
   * @description 保存
   */
  @Bind()
  save() {
    const { dispatch, singlePurchaseApplicationModel, refHeadId } = this.props;
    const { enter, isPub, uuid, prThirdSupAttachmentList = [] } = this.state;
    const {
      inquireBaseInfo = {},
      InviteSuppliersList = [],
      quotationFormatList = [],
      projectName,
      projectNumber,
      statusList,
    } = singlePurchaseApplicationModel;
    const inquireForm = this.inquireForm.getFieldsValue();
    const newInviteSuppliersList = InviteSuppliersList.map(item => {
      return {
        ...item,
        projectName,
        projectNumber,
      }
    })
    let newBasicInfo = {};

    let inquireErr = [];
    this.inquireForm.validateFieldsAndScroll((err) => {
      inquireErr = err || [];
    });
    let inviteSupplierErr = [];
    this.inviteSupplierForm.validateFields((err) => {
      inviteSupplierErr = err || [];
    });
    if (inquireErr.length === 0 && inviteSupplierErr.length === 0) {
      newBasicInfo = {
        ...inquireBaseInfo,
        ...inquireForm,
        totalAmount: inquireBaseInfo.estimatedBudgetAmountHkd,
        exchangeRate: inquireBaseInfo.prRate,
        name: inquireBaseInfo.packageName,
        capexBudgetAmountHkd: inquireBaseInfo.budgetLocalAmountCapex,
        opexBudgetAmountHkd: inquireBaseInfo.budgetLocalAmountOpex,
        winingBidderNumber: inquireBaseInfo.bidNum,
        procurementMethod: inquireBaseInfo.purchaseType,
        sourceType: inquireBaseInfo.prType,
        prApplyMaterialList: quotationFormatList,
        refPrFirstId: inquireBaseInfo.prId,
        refProjectNo: inquireBaseInfo.projectNumber,
        tenantId: getCurrentOrganizationId(),
        type: 'simpleInquiry',
      };
      // 先调用保存接口；
      dispatch({
        type: `singlePurchaseApplicationModel/saveDetail`,
        payload: {
          ...newBasicInfo,
          prThirdSupList: newInviteSuppliersList,
        }
      }).then((res) => {
        if (res) {
          // 调用附件保存接口
          dispatch({
            type: `singlePurchaseApplicationModel/saveAttachment`,
            payload: {
              uuid,
              prThirdSupAttachmentList,
              refHeadId: res.id,
            },
          }).then(res2 => {
            CusNotification.success({
              message: intl
                .get(`${promptCode}.view.message.savesuccessfully`)
                .d('保存成功'),
            });
            // 之后要调用简易询价的查询；
            this.inquiryQuery(res?.packageNo);
            this.getSupplierList(_, res?.packageNo);
          })
        }
      })
    }
  }

  /**
   * @description 获取申请人和需求人，判断是否是同一个人； 获取建议询价编号和名称
   */
  @Bind()
  getEqualDetail(id) {
    const { dispatch, singlePurchaseApplicationModel } = this.props;
    const { statusList } = singlePurchaseApplicationModel;
    dispatch({
      type: `singlePurchaseApplicationModel/queryDetail`,
      payload: {
        id
      }
    }).then(res => {
      if (res) {
        if (res?.applicantUserId && res?.applyUserId) {
          const equal = res.applicantUserId === res.applyUserId;
          dispatch({
            type: `singlePurchaseApplicationModel/updateState`,
            payload: {
              equal,
              prName: res?.prName,
              prNumber: res?.prNumber,
            }
          })
        } else {
          dispatch({
            type: `singlePurchaseApplicationModel/updateState`,
            payload: {
              equal: false,
              prName: res?.prName,
              prNumber: res?.prNumber,
            }
          })
        }

      }
    })
  }

  
  @Bind()
  handleCheckSend(refHeadId) {
    const { dispatch } = this.props;
    dispatch({
      type: `singlePurchaseApplicationModel/getCheckSend`,
      payload: {
        refHeadId,
      }
    }).then((res) => {
      if(res) {
        this.setState({
          isSendAllFlag: res?.isSelectSup
        })
      }
    })
  }

  // 查询
  @Bind()
  inquiryQuery(packageNo) {
    const { dispatch, singlePurchaseApplicationModel } = this.props;
    const { statusList } = singlePurchaseApplicationModel;
    return dispatch({
      type: `singlePurchaseApplicationModel/firstQueryDetail`,
      payload: {
        packageNo,
      }
    }).then(res => {
      if (res && res.flag) {
        console.log('res', res);
        // this.getEqualDetail(res?.refPrFirstId);  暂时用不到
        this.handleCheckSend(res?.bidThirdHeadTrueVO?.id);
        this.getProjectId(res?.bidThirdHeadTrueVO.projectNumber);
        this.getUuid(res?.bidThirdHeadTrueVO?.id);
        this.setState({ caseId: res.caseId });
        // 先拿一下供应商列表数据 ，因为stageList全部发送放到外面来了
        dispatch({
          type: `singlePurchaseApplicationModel/stagePreview`,
          payload: {
            refHeadId: res?.bidThirdHeadTrueVO?.id,  // 基本信息id
          }
        }).then(res2 => {
          if (res2) {
            dispatch({
              type: `singlePurchaseApplicationModel/updateState`,
              payload: {
                supplierList: res2,  // 供应商列表
              }
            })
          }
        })
        let rounds = 0;
        const stageList = res?.prThirdStageList?.map(item => {
          if (item.stageArrangement.includes('submissionOfQuotationDocuments')) {
            rounds++;
            return {
              ...item,
              _status: 'update',
              prThirdStageId: uuid(),
              rounds: rounds.toString(),
            }
          } else {
            return {
              ...item,
              _status: 'update',
              prThirdStageId: uuid(),
            }
          }
        })
        console.log('stageList', stageList);
        dispatch({
          type: `singlePurchaseApplicationModel/updateState`,
          payload: {
            projectName: res?.bidThirdHeadTrueVO.projectName,
            projectNumber: res?.bidThirdHeadTrueVO.projectNumber,
            inquireBaseInfo: res?.bidThirdHeadTrueVO,
            stageList,
            refHeadId: res?.bidThirdHeadTrueVO?.id,
          }
        })
        // 当接口为true调用供应商数据
        this.getSupplierList(_, packageNo);
      } else {
        dispatch({
          type: `singlePurchaseApplicationModel/queryDetail`,
          payload: {
            packageNo,
          }
        }).then(res => {
          if (res) {
            // this.getEqualDetail(res?.refPrFirstId);  暂时用不到
            this.setState({
              uuid: uuid()
            })
            dispatch({
              type: `singlePurchaseApplicationModel/updateState`,
              payload: {
                projectName: res?.bidThirdHeadVO.projectName,
                projectNumber: res?.bidThirdHeadVO.projectNumber,
                inquireBaseInfo: { status: 'PENDING_REFER', ...res?.bidThirdHeadVO, },
                // 为false供应商数据
                InviteSuppliersList: res?.bidSupVOList?.map((item) => {
                  return {
                    ...item,
                    _status: 'update',
                    uuid: uuid(),
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  /**
  * 邀请供应商查询
  */
  @Bind()
  @Debounce(200)
  getSupplierList(page = {}, packageNo) {
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: 'singlePurchaseApplicationModel/getSupplierList',
      payload: {
        page,
        organizationId: getCurrentOrganizationId(),
        packageNo,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'singlePurchaseApplicationModel/updateState',
          payload: {
            InviteSuppliersList: res?.content
          },
        })
      }
    })
  }
  /**
  * 物料查询
  */
  @Bind()
  @Debounce(200)
  getMaterialList(page = {}, packageNo) {
    console.log('packageNo', packageNo);
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: 'singlePurchaseApplicationModel/getMaterialList',
      payload: {
        page,
        organizationId: getCurrentOrganizationId(),
        packageNo,
      },
    })
  }



  /**
   * @description 打开新建询价单Modal
   */
  @Bind()
  handleOpenModal() {
    this.setState({
      modalVisible: true,
    });
  }

  @Bind()
  onTableRef(ref) {
    this.table = ref;
  }

  @Bind
  translateEbsCode(code) {
    const { idpValueMap = {} } = this.props;
    const valuelist = idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY'] || [];
    const { meaning } = valuelist.find((item) => item.value === code) || {};
    return meaning;
  }

  /**
   * 转义值集
   * @param {*} list - 值集列表
   * @param {*} value - 值
   */
  @Bind()
  getFastCode(list = [], value) {
    const item = list.find((e) => e.value === value);
    if (item) {
      return item.description;
    }
  }





  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    const { dispatch } = this.props;
    const deleteFlag = data.every(item => item.enquiryPriceStatus === 'NEW');
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get(`${promptCode}.message.confirm.remove`).d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'resaleRfq/deleteEnquiryPriceByList',
            payload: data,
          }).then(res => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
            ;
          });
        },
        okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlyDeleteNEW`).d('只能删除状态为“起草”的询价单'),
      });
    }
    ;
  }


  /**
   * @description 邀请供应商新建；
   */
  @Bind()
  addInviteSupplier() {
    const {
      dispatch,
      singlePurchaseApplicationModel: { InviteSuppliersList = [] },
    } = this.props;
    dispatch({
      type: `singlePurchaseApplicationModel/updateState`,
      payload: {
        InviteSuppliersList: [
          ...InviteSuppliersList,
          {
            _status: 'create',
            uuid: uuid(),
            enquiryPriceNum: '',
            enquiryPriceTitle: '',
            email: '',
            contacts: '',
            phone: '',
            name: '',
            isDel: '0',
            enquiryPriceStatus: '',
            isInviteSended: 'false',
            isUpdated: 'false', // 用于判断是否有变更;默认false
          },
        ],
      },
    });
  }

  /**
   * @description 邀请供应商删除；
  */
  @Bind()
  delInviteSupplier() {
    const {
      dispatch,
      singlePurchaseApplicationModel: { InviteSuppliersList },
      // companyId,
      // currentStage,
    } = this.props;
    const { quatationSelectedRowKeys } = this.state;
    if (quatationSelectedRowKeys.length > 0) {
      const newInviteSuppliersList = InviteSuppliersList
        .map((item) => {
          if (quatationSelectedRowKeys.includes(item.uuid)) {
            item.isDel = '1';
            return item;
          } else {
            return item;
          }
        })
        .filter((i) => i.id !== undefined || i.isDel !== '1');
      dispatch({
        type: `singlePurchaseApplicationModel/updateState`,
        payload: {
          InviteSuppliersList: [...newInviteSuppliersList],
        },
      });
      this.setState({ quatationSelectedRowKeys: [] });
    } else {
      notification.info({
        message: intl.get(`hzero.common.message.validation.atLeast`).d('请至少选择一条数据'),
        placement: 'bottomRight',
      });
    }
  }

  /**
   * @description 批量创建
   */
  @Bind()
  handleMassCreate() {
    const { history } = this.props;
    const { isPub } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/ssrc/resale-rfq/batchImport`,
    });
  }

  @Bind()
  handleSubmit(onlySubmit = 'N') {
    const { dispatch } = this.props;
    const { selectSubmitData = [] } = this.state;
    dispatch({
      type: 'resaleRfq/submitValidateSummary',
      payload: selectSubmitData.map(item => {
        return {
          enquiryPriceId: item.enquiryPriceId,
          enquiryPriceRoundsId: item.enquiryPriceRoundsId,
        };
      }),
    }).then(r => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitSummary',
          payload: {
            enquiryPriceList: selectSubmitData,
            onlySubmit,
          },
        }).then(res => {
          if (res) {
            this.setState({
              submitModalVisible: false,
            });
            CusNotification.success();
            this.handleSearch();
          }
          ;
        });
      }
      ;
    });
  }




  // 获取项目id
  @Bind()
  getProjectId(projectCode) {
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: `singlePurchaseApplicationModel/queryProjectId`,
      payload: {
        projectCode
      },
    }).then(res => {
      if (res) {
        this.setState({
          projectId: res.projectId
        })
      }
    })
  }
  // 附件查询
  @Bind()
  getUuid(refHeadId) {
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: `singlePurchaseApplicationModel/getUuid`,
      payload: {
        refHeadId
      },
    }).then(res => {
      this.setState({
        uuid: res?.uuid || uuid()
      })
    })
  }

  // 附件上传成功回调
  @Bind
  onUploadSuccess(file, fileList) {
    this.updateFileList(fileList);
  }
  // 附件移除回调
  @Bind
  removeChange(file) {
    const { prThirdSupAttachmentList = [] } = this.state;
    const fileList = prThirdSupAttachmentList.filter((list) => list.url !== file.url)
    this.updateFileList(fileList);
  }
  // 附件列表处理
  @Bind
  updateFileList(list = []) {
    const fileList = list.map(item => {
      return {
        ...item,
        tenantId: getCurrentOrganizationId(),
        fileName: item?.name,
        filePath: item?.url,
      }
    })
    this.setState({
      prThirdSupAttachmentList: fileList
    })
  }


  render() {
    const {
      dispatch,
      idpValueMap = {},
      singlePurchaseApplicationModel,
      fetchListLoading = false,
      form
    } = this.props;
    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      quatationSelectedRowKeys,
      caseId,
      uuid,
      projectId,
      tabActiveKey,
      SearchTabActiveKey,
      isSendAllFlag,
    } = this.state;
    const {
      inquireBaseInfo = {},
      projectName,
    } = singlePurchaseApplicationModel;

    // console.log('inquireBaseInfo', inquireBaseInfo);

    const quatationRowSelection = {
      fixed: true,
      selectedRows: quatationSelectedRowKeys,
      selectedRowKeys: quatationSelectedRowKeys,
      onChange: (keys) => {
        this.setState({
          quatationSelectedRowKeys: keys,
        });
      },
      // getCheckboxProps: () => ({
      //   disabled: !isEdit, // 选择框的是否可选
      // }),
    };


    const filterSearchProps = {
      singlePurchaseApplicationModel,
      idpValueMap,
      onRef: (ref) => {
        this.projectFrom = ref.props.form;
      },
    }
    const InquireBaseInfoProps = {
      singlePurchaseApplicationModel,
      idpValueMap,
      onRef: (ref) => {
        this.inquireForm = ref.props.form;
      },
    }

    const inviteSupplierTableProps = {
      dispatch,
      singlePurchaseApplicationModel,
      rowSelection: quatationRowSelection,
      form,
      isEdit: inquireBaseInfo?.status === 'PENDING_REFER',
      onRef: (node) => {
        this.inviteSupplierForm = node.props.form;
      },
    }

    const stageTableTableProps = {
      form,
      dispatch,
      singlePurchaseApplicationModel,
      caseId,
      isSendAllFlag,
    }

    const quatationTableProps = {
      form,
      singlePurchaseApplicationModel,
    }



    // 采购——采购实施内容
    const pChildren = (<>
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
              title={intl.get(`${promptCode}.view.title.BasicInformationofInquiry`).d('询价基本信息')}
              arrowActive={activeKey.includes('inquireBaseTab')}
            />
          }
          key="inquireBaseTab"
        >
          <InquireBaseInfo {...InquireBaseInfoProps} />
        </Panel>
        <Panel
          showArrow={false}
          header={
            <PanelHeader
              title={intl.get(`${promptCode}.view.title.InquiryContentSettings`).d('询价内容设置')}
              arrowActive={activeKey.includes('inquireInfoTab')}
            // showArrow={false}
            />
          }
          key="inquireInfoTab"
        >
          <Collapse
            className={classnames('customize-collapse', styles['show-border'])}
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  verticalLine={false}
                  title={intl
                    .get(`${promptCode}.view.title.QuotationContent`)
                    .d('报价表格式')}
                  arrowActive={activeKey.includes('quatation')}
                />
              }
              key="quatation"
            >
              <QuotationTable  {...quatationTableProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  verticalLine={false}
                  title={intl
                    .get(`HKPC.commom.view.title.InviteSuppliers`)
                    .d('邀请供应商')}
                  arrowActive={activeKey.includes('inviteSupplier')}
                  buttons={
                    <>
                      {/* {
                        <div className={classnames(styles['upload-button'])}>
                          <CusUpload
                            bucketName="private-bucket"
                            bucketDirectory="ssrc-comp"
                            attachmentUUID={uuid || null}
                            showFilesNumber={false}
                            returnFileList={(fileList) => this.updateFileList(fileList)}
                            onUploadSuccess={(file, fileList) => this.onUploadSuccess(file, fileList)}
                            removeCallback={(file) => this.removeChange(file)}
                            viewOnly={inquireBaseInfo?.status && inquireBaseInfo?.status !== 'PENDING_REFER'}
                          />
                        </div>
                      } */}
                      {
                        (!inquireBaseInfo?.status || inquireBaseInfo?.status === 'PENDING_REFER') &&
                        <CusButton
                          mini
                          onClick={this.delInviteSupplier}
                        >
                          {intl.get(`hzero.common.view.button.delete`).d('删除')}
                        </CusButton>
                      }
                      {
                        (!inquireBaseInfo?.status || inquireBaseInfo?.status === 'PENDING_REFER') &&
                        <CusButton
                          mini
                          onClick={this.addInviteSupplier}
                        >
                          {intl.get('hzero.common.view.button.add').d('新建')}
                        </CusButton>
                      }
                    </>
                  }
                />
              }
              key="inviteSupplier"
            >
              <InviteSupplierTable  {...inviteSupplierTableProps} />
              <div style={{ marginTop: '15px', fontSize: '14px', lineHeight: '22px', fontWeight: 600 }}>{intl.get('HKPC.commom.view.title.attachtosup').d('给供应商的文件')}</div>
              <UploadList
                viewOnly={inquireBaseInfo?.status && inquireBaseInfo?.status !== 'PENDING_REFER'}
                multiple={true}
                bucketName='private-bucket'
                tenantId={getCurrentOrganizationId()}
                showUploadList={{
                  removePopConfirmTitle: intl
                    .get('hzero.common.message.confirm.delete')
                    .d('是否删除此条记录？'),
                  showRemoveIcon: !(inquireBaseInfo?.status && inquireBaseInfo?.status !== 'PENDING_REFER'),
                }}
                filePreview
                onUploadSuccess={(file, fileList) => this.onUploadSuccess(file, fileList)}
                attachmentUUID={uuid || null}
                setLoading={(uploading = false) => {
                  this.setState({
                    uploading,
                  });
                }}
              />
            </Panel>
          </Collapse>
        </Panel>
        <Panel
          showArrow={false}
          header={
            <PanelHeader
              title={intl.get(`${promptCode}.view.title.stage`).d('阶段')}
              arrowActive={activeKey.includes('stageTab')}
              showArrow={true}
            />
          }
          key="stageTab"
        >
          <StageTable  {...stageTableTableProps} />
        </Panel>
      </Collapse>
    </>)

    return (
      <>
        <PageWrapper loading={fetchListLoading}>
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
                  title={intl.get(`${promptCode}.view.title.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <FilterSearch {...filterSearchProps} />
            </Panel>
          </Collapse>
          <div className={classnames(styles['out-div-tab'], styles['scoreDetail'])}>
            <CusTabs
              defaultActiveKey={'scoreDetailTwo'}
              onChange={(val) => this.setState({ tabActiveKey: val })}
              items={[
                projectName && {
                  label: intl.get(`HKPC.commom.view.title.CreateProject`).d('立项'),
                  key: 'scoreDetail',
                  children: (
                    <CusSearchTabs
                      style={{
                        backgroundColor: '#fff',
                        padding: '16px 16px 0 16px',
                      }}
                      activeKey="0"
                      items={[
                        {
                          label: intl.get(`HKPC.commom.bid.title.projectinfo`).d('项目信息'),
                          key: '0',
                          children: (
                            <div style={{ height: '100vh' }}>
                              <iframe style={{ width: '100%', height: '100%' }} src={`${ERP_HOST}/root/finance/projectInformation/update?id=${projectId}`} width="100%" height="100vh !important" frameBorder="0" />
                            </div>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  label: intl.get(`HKPC.commom.view.title.Procurement`).d('采购'),
                  key: 'scoreDetailTwo',
                  children:
                  <div className={styles['tabs-wrapper']}>
                  <CusSearchTabs
                    style={{
                      backgroundColor: '#fff',
                      padding: '16px 16px 0 16px',
                    }}
                    // defaultActiveKey="1"
                    // activeKey="1"
                    activeKey={SearchTabActiveKey}
                    items={
                      [
                        {
                          label: intl
                            .get(`${promptCode}.view.title.ProcurementRequisition`)
                            .d('采购申请'),
                          key: '2',
                          children: (
                            <div style={{ height: '100vh' }}>
                              <iframe
                                style={{ width: '100%', height: '100%' }}
                                src={`/pub/ssrc-hk/purchaseApplicationErp/edit?id=${inquireBaseInfo?.prId}`}
                                width="100%"
                                height="100% !important"
                                frameBorder="0"
                              />
                            </div>
                          ),
                        },
                        {
                          label: intl
                            .get(`${promptCode}.view.title.ProcurementScheme`)
                            .d('采购方案'),
                          key: '0',
                          children: (
                            <div style={{ height: '100vh' }}>
                              <iframe
                                style={{ width: '100%', height: '100%' }}
                                src={`/pub/ssrc-hk/purchase-plan-list/detail/castrate?id=${inquireBaseInfo?.refSecondId}`}
                                width="100%"
                                height="100% !important"
                                frameBorder="0"
                              />
                            </div>
                          ),
                        },
                        {
                          label: intl
                            .get(`HKPC.commom.view.title.procurementimplementation`)
                            .d('采购实施'),
                          key: '1',
                          children: pChildren,
                        },
                      ]}
                    onChange={(val) => this.setState({ SearchTabActiveKey: val })}
                  />
                  </div>,
                },
              ]}
            />
          </div>
        </PageWrapper>
        {tabActiveKey === 'scoreDetailTwo' && inquireBaseInfo?.status === 'PENDING_REFER' && (
          <CusApprovalButtons
            children={
              <CusButton onClick={this.save}>
                {intl.get(`hzero.common.view.button.save`).d('保存')}
              </CusButton>
            }
          ></CusApprovalButtons>
        )}
      </>
    );
  }
}
