import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Col, Collapse, Tabs } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { concat } from 'lodash';
import notification from 'utils/notification';
import { fastCodeLoader } from '@/utils/decorators';
import uuid from 'uuid/v4';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusUpload from './component/CusUpload';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import FilterSearch from './FilterSearch';
import InquireBaseInfo from './InquireBaseInfo'
import InviteSupplierTable from './InviteSupplierTable';
import QuotationTable from './QuotationTable';
import StageTable from './StageTable'
import styles from './index.less';
import classnames from 'classnames';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { Form } from 'hzero-ui';
// import { fastCodeLoader } from '@/utils/decorators';
import queryString from 'querystring';
import UploadList from '../../../../../srm-front-ssrc-hk/src/components/uploadList'; 

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const promptCodeOther='bid.bidcommon';
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const { ERP_HOST } = process.env;

@Form.create()

@formatterCollections({ code: [promptCode,promptCodeOther] })
@connect(({ purchaseApplicationModel, loading = {} }) => ({
  purchaseApplicationModel,
  fetchListLoading: loading.effects['purchaseApplicationModel/applyQueryDetail'] ||
    loading.effects['purchaseApplicationModel/queryDetail'],
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
    const { enter, createBy } = queryString.parse(search.substr(1)) || {};

    this.state = {
      activeKey: ['form', 'inquireBaseTab', 'uploadTable', 'inquireInfoTab', 'quatation', 'inviteSupplier', 'stageTab'],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      stageShow: false,  // 第一次点击保存以后，阶段才会显示;
      quatationSelectedRowKeys: [],
      isShowStageTab: false, // 阶段tab是否显示,刚进来默认不显示，点击保存以后可以显示，后面进来也可以显示；
      rqStatus: '',  //询价单状态
      enter,  // 进入该页面方式
      createBy, //根据进入页面方式，返回的是采购申请id / 询价单号
      caseId: '', //致远的caseId
      uuid: '', // 附件uuid
      prThirdSupAttachmentList: [], //附件list
      tabActiveKey: 'scoreDetailTwo',
      isrepeat: false,
      SearchTabActiveKey: '0',
      purchaseRequestId: '',
      addMatModalVisible: false,
      selectedRows: [],
      selectedRowKeys: [],
      isReady: false, // 物料编辑按钮初始状态
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
      type: 'purchaseApplicationModel/fetchDetailEnum',
    });
  }

  /**
    * @description 简易询价详情
    */
  @Bind()
  handleQuery() {
    const { enter, createBy } = this.state;
    // 采购申请进入；传的是采购申请id
    if (enter === 'create') {
      this.isRepeat(createBy);
      this.purchaseQuery(createBy);
      this.setState({
        purchaseRequestId: createBy,
      })
    } else {
      // enter === 'list' ，列表进入，传的是询价单号

      this.inquiryQuery(createBy);
    }
  }

  /**
   * @description 判断实施单子是否已存在
   */
  @Bind()
  isRepeat(id) {
    const { dispatch } = this.props;
    dispatch({
      type: `purchaseApplicationModel/isRepeat`,
      payload: {
        id
      }
    }).then(res => {
      if (res && res.length > 0) {
        // 说明之前就生成过数据
        this.setState({ isrepeat: true });
        CusNotification.error({
          message: intl.get(`${promptCode}.view.message.inquirygeneratedprompt`).d('当前采购申请已生成询价单，请勿重复操作。'),
        });
      }
    })
  }

  /**
   * @description 保存
   */
  @Bind()
  save() {
    const { dispatch, purchaseApplicationModel, refHeadId } = this.props;
    const { enter, isPub, uuid, prThirdSupAttachmentList = [] } = this.state;
    const {
      inquireBaseInfo = {},
      InviteSuppliersList = [],
      projectName,
      projectNumber,
      statusList,
      quotationFormatList,
    } = purchaseApplicationModel;
    const inquireForm = this.inquireForm.getFieldsValue();
    console.log('quotationFormatList', quotationFormatList);
    const prApplyMaterialList = getEditTableData(quotationFormatList, ['rowKey']);
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
    console.log('inquireErr', inquireErr);
    let inviteSupplierErr = [];
    this.inviteSupplierForm.validateFields((err) => {
      inviteSupplierErr = err || [];
    });
    console.log('inviteSupplierErr', inviteSupplierErr);
    if (inquireErr.length === 0 && inviteSupplierErr.length === 0) {
      if (enter === 'create') {
        newBasicInfo = {
          ...inquireBaseInfo,
          ...inquireForm,
          tenantId: currentUser.tenantId,
          totalAmount: inquireBaseInfo.totalAmount,
          refProjectNo: inquireBaseInfo.projectNumber,
          refPrFirstId: inquireBaseInfo.id,
          remark: inquireBaseInfo.supBakup,
          type: 'simpleInquiry',
          status: 'PENDING_REFER',
        };
        newBasicInfo.id = null;
      } else {
        newBasicInfo = {
          ...inquireBaseInfo,
          ...inquireForm,
          totalAmount: inquireBaseInfo.totalAmount,
          tenantId: currentUser.tenantId.toString(),
          type: 'simpleInquiry',
        };
      }

      // 先调用保存接口；
      dispatch({
        type: `purchaseApplicationModel/saveDetail`,
        payload: {
          ...newBasicInfo,
          prThirdSupList: newInviteSuppliersList,
          prApplyMaterialList: prApplyMaterialList.map((item) => ({
            ...item,
            deliverDate: dayjs(item.deliverDate).format('YYYY-MM-DD HH:mm:ss'),
          })),
        }
      }).then((res) => {
        if (res) {
          // 调用附件保存接口
          dispatch({
            type: `purchaseApplicationModel/saveAttachment`,
            payload: {
              uuid,
              prThirdSupAttachmentList,
              refHeadId: res.id,
            },
          }).then(res2 => {
            if (enter === 'create') {
              // 之后重新进入list的时候的页面；  后续如果不接受这个刷新，就加个参数进行二次判断是否已保存过； 如果已保存过，就不跑143行 newBasicInfo.id = null
              const url = `${isPub ? '/pub' : ''}/ssrc-hk/purchase-implement-page-detail?enter=list&createBy=${res?.no}`;
              // window.open(url); //刷新更改成打开一个新的标签页；
              window.location.href = url; // 打开一个新的标签页更改回刷新；
              return;
            }
            CusNotification.success({
              message: intl
                .get(`${promptCode}.view.message.savesuccessfully`)
                .d('保存成功'),
            });
            // 之后要调用简易询价的查询；
            this.inquiryQuery(res?.no);
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
    const { dispatch, purchaseApplicationModel } = this.props;
    const { statusList } = purchaseApplicationModel;
    dispatch({
      type: `purchaseApplicationModel/applyQueryDetail`,
      payload: {
        id
      }
    }).then(res => {
      if (res) {
        if (res?.applicantUserId && res?.applyUserId) {
          const equal = res.applicantUserId === res.applyUserId;
          dispatch({
            type: `purchaseApplicationModel/updateState`,
            payload: {
              equal,
              prName: res?.prName,
              prNumber: res?.prNumber,
              headerInfo: res,
            }
          })
        } else {
          dispatch({
            type: `purchaseApplicationModel/updateState`,
            payload: {
              equal: false,
              prName: res?.prName,
              prNumber: res?.prNumber,
              headerInfo: res,
            }
          })
        }

      }
    })
  }


  /**
   * @description 采购申请数据查询——只有在采购申请进入的时候，第一次查询调用；
   */
  @Bind()
  purchaseQuery(id) {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { statusList } = purchaseApplicationModel;
    dispatch({
      type: `purchaseApplicationModel/applyQueryDetail`,
      payload: {
        id
      }
    }).then(res => {
      if (res) {
        // 第一次进入没有附件信息，直接自己生成uuid；
        this.setState({
          uuid: uuid()
        })
        this.getProjectId(res?.projectNumber)
        const inquireBaseInfo = {
          ...res,
          name: res?.prName,
          totalAmount: res?.estimatedBudgetAmountHkd,
          rqRate: res?.exchangeRate,
        }

        const quotationFormatList = res?.prApplyMaterialList?.map(item => {
          return {
            ...item,
            currency: res.currency,
            _status: 'update',
            rowKey: uuid(),
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
        if (Array.isArray(stageList) && stageList.length > 0) {
          this.setState({
            isShowStageTab: true,
          })
        }


        if (res.currency && res.currency !== 'HKD') {
          dispatch({
            type: `purchaseApplicationModel/getRate`,
            payload: {
              currencyCode: res.currency,
              rateDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
          }).then(res2 => {
            inquireBaseInfo.exchangeRate = res2.rate;
            dispatch({
              type: `purchaseApplicationModel/updateState`,
              payload: {
                projectName: res?.projectName,
                projectNumber: res?.projectNumber,
                inquireBaseInfo,
                stageList: stageList ? stageList : [],
                quotationFormatList,
                headerInfo: res,
              }
            })
          })
        } else {
          inquireBaseInfo.exchangeRate = '1';
          dispatch({
            type: `purchaseApplicationModel/updateState`,
            payload: {
              projectName: res?.projectName,
              projectNumber: res?.projectNumber,
              inquireBaseInfo,
              stageList: stageList ? stageList : [],
              quotationFormatList,
              headerInfo: res,
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
      type: `purchaseApplicationModel/getCheckSend`,
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

  /**
   * @description 简易询价查询
   */
  @Bind()
  inquiryQuery(id) {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { statusList } = purchaseApplicationModel;
    this.setState({ isShowStageTab: true, isReady: false, }); //阶段展示；
    return dispatch({
      type: `purchaseApplicationModel/queryDetail`,
      payload: {
        rqNumber: id
      }
    }).then(res => {
      if (res) {
        this.getProjectId(res?.refProjectNo);
        this.handleCheckSend(res?.id);
        // 先拿一下供应商列表数据 ，因为stageList全部发送放到外面来了
        dispatch({
          type: `purchaseApplicationModel/stagePreview`,
          payload: {
            refHeadId: res.id,  // 基本信息id
          }
        }).then(res2 => {
          if (res2) {
            dispatch({
              type: `purchaseApplicationModel/updateState`,
              payload: {
                supplierList: res2,  // 供应商列表
              }
            })
          }
        })
        this.getEqualDetail(res?.refPrFirstId);
        this.getUuid(res.id);
        this.setState({ caseId: res.caseId });
        const inquireBaseInfo = {
          ...res,
        }
        const InviteSuppliersList = res?.prThirdSupList?.map(item => {
          return {
            ...item,
            _status: 'update',
            rowKey: uuid(),
            copyName: item.name,
            copyType: item.type,
            copyEmail: item.email,
            copyContacts: item.contacts,
            copyPhone: item.phone,
            uuid: item?.uuid ? item.uuid : uuid(),
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
        // console.log('InviteSuppliersList', InviteSuppliersList);
        dispatch({
          type: `purchaseApplicationModel/updateState`,
          payload: {
            projectName: res?.projectName,
            projectNumber: res?.refProjectNo,
            inquireBaseInfo,
            InviteSuppliersList,
            stageList,
            refHeadId: res?.id,
            prThirdHeadId: res?.refPrFirstId,
            quotationFormatList: res?.prThirdSetting?.map((item) => ({
              ...item,
              _status: 'update',
              rowKey: uuid()
            })),
          }
        })

      }
    })
  }




  // /**
  // * @description 阶段查询；   阶段查询不要了，直接在询价查询里找出
  // */
  // @Bind()
  // stageQuery(refHeadId) {
  //   const { dispatch } = this.props;
  //   // 发送全部邀请 接口
  //   // 调用阶段查询接口；
  //   dispatch({
  //     type: `purchaseApplicationModel/stageQuery`,
  //     payload: {
  //       refHeadId,
  //     }
  //   }).then(res => {
  //     console.log('stageQueryres-----------', res);

  //   })

  // }

  // 获取项目id
  @Bind()
  getProjectId(projectCode) {
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: `purchaseApplicationModel/queryProjectId`,
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

  // 删除报价表
  @Bind()
  handleDeleteLine = () => {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { quotationFormatList } = purchaseApplicationModel;
    const { selectedRowKeys, formRecordId } = this.state;
    if(selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        // 本地删除
        const newDataSource = quotationFormatList.filter((item) => !selectedRowKeys.includes(item['rowKey']));
        // const delItemsLength = productDetailSource.length - newDataSource.length;
        // const newPagination = delItemsToPagination(delItemsLength, productDetailSource.length, productDetailPagination);
        dispatch({
          type: 'purchaseApplicationModel/updateState',
          payload: {
            quotationFormatList: newDataSource,
          },
        });
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
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
      purchaseApplicationModel: { InviteSuppliersList = [] },
    } = this.props;
    dispatch({
      type: `purchaseApplicationModel/updateState`,
      payload: {
        InviteSuppliersList: [
          ...InviteSuppliersList,
          {
            _status: 'create',
            uuid: uuid(),
            rowKey: uuid(),
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
      purchaseApplicationModel: { InviteSuppliersList },
      // companyId,
      // currentStage,
    } = this.props;
    const { quatationSelectedRowKeys } = this.state;
    if (quatationSelectedRowKeys.length > 0) {
      const newInviteSuppliersList = InviteSuppliersList
        .map((item) => {
          if (quatationSelectedRowKeys.includes(item.rowKey)) {
            item.isDel = '1';
            return item;
          } else {
            return item;
          }
        })
        .filter((i) => i.id !== undefined || i.isDel !== '1');
      dispatch({
        type: `purchaseApplicationModel/updateState`,
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



  // 附件查询
  @Bind()
  getUuid(refHeadId) {
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: `purchaseApplicationModel/getUuid`,
      payload: {
        refHeadId
      },
    }).then(res => {
      if (res) {
        this.setState({
          uuid: res.uuid ? res.uuid : uuid()
        })
      }
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
    console.log('list', list);
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

  @Bind
  handleAddMat() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { quotationFormatList = [], inquireBaseInfo, headerInfo } = purchaseApplicationModel;
    const params = [
      ...quotationFormatList,
      {
        _status: 'create',
        rowKey: uuid(),
        currency: headerInfo?.currency || inquireBaseInfo?.currency,
        budgetItemNumber: inquireBaseInfo?.refProjectNo,
        budgetType: (headerInfo?.projectType == '2' || inquireBaseInfo?.projectType == '2') ? 'INVENTORY' : '',
      }
    ]
    dispatch({
      type: `purchaseApplicationModel/updateState`,
      payload: {
        quotationFormatList: params,
      },
    });
  }

  render() {
    const {
      dispatch,
      idpValueMap = {},
      purchaseApplicationModel,
      fetchListLoading = false,
      form
    } = this.props;
    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      quatationSelectedRowKeys,
      isShowStageTab = false,
      caseId,
      uuid,
      enter,
      projectId,
      tabActiveKey,
      isrepeat,
      SearchTabActiveKey,
      addMatModalVisible,
      selectedRowKeys,
      isReady,
      isSendAllFlag,
    } = this.state;
    const {
      inquireBaseInfo = {},
      prName,
      prNumber,
      projectName,
      prThirdHeadId,
      stageList,
      headerInfo,
    } = purchaseApplicationModel;

    console.log('stageList', stageList);
    const inquiryInvitationList = stageList?.filter(item => item?.stageArrangement === 'inquiryInvitation');
    const isQuotation = inquiryInvitationList.length > 0 ? inquiryInvitationList.some((item) => item?.status === 'to_be_carried_out') : true
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
      purchaseApplicationModel,
      idpValueMap,
      onRef: (ref) => {
        this.projectFrom = ref.props.form;
      },
    }
    const InquireBaseInfoProps = {
      purchaseApplicationModel,
      idpValueMap,
      onRef: (ref) => {
        this.inquireForm = ref.props.form;
      },
    }

    const inviteSupplierTableProps = {
      dispatch,
      purchaseApplicationModel,
      rowSelection: quatationRowSelection,
      form,
      isEdit: enter === 'create' || inquireBaseInfo?.status === 'PENDING_REFER',
      onRef: (node) => {
        this.inviteSupplierForm = node.props.form;
      },
    }

    const stageTableTableProps = {
      form,
      dispatch,
      purchaseApplicationModel,
      prName,
      prNumber,
      caseId,
      isSendAllFlag,
    }

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    const quatationTableProps = {
      form,
      isReady,
      rowSelection,
      purchaseApplicationModel,
    }

    const editMatComponentProps = {
      ...this.props,
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
                  buttons={
                    <>
                      {isQuotation && <div>
                        {!isReady && <CusButton
                          mini
                          onClick={() => {
                            this.setState({
                              isReady: true
                            })
                          }}
                        >
                          {intl.get(`hzero.common.button.edit`).d('编辑')}
                        </CusButton>}
                        {isReady && <CusButton
                          mini
                          onClick={this.handleDeleteLine}
                        >
                          {intl.get(`hzero.common.view.button.delete`).d('删除')}
                        </CusButton>}
                        {isReady && <CusButton mini onClick={this.handleAddMat}>
                          {intl.get('HKPC.commom.view.title.additem').d('新增物料')}
                        </CusButton>}
                      </div>}
                    </>
                  }
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
        {isShowStageTab &&
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
        }
      </Collapse>
    </>)

    return (
      <>
        <PageWrapper loading={fetchListLoading}>
          { ['0', '1'].includes(headerInfo?.projectType) && <Collapse
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
              <FilterSearch  {...filterSearchProps} />
            </Panel>
          </Collapse>}
          <div className={classnames(styles['out-div-tab'], styles['scoreDetail'])}>
            <CusTabs
              defaultActiveKey={'scoreDetailTwo'}
              onChange={(val) => this.setState({ tabActiveKey: val })}
              items={[
                projectName && {
                  label: intl
                    .get(`HKPC.commom.view.title.CreateProject`)
                    .d('立项'),
                  key: 'scoreDetail',
                  children:
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
                          children:
                            <div style={{ height: '100%' }}>
                              <iframe style={{ width: '100%', height: '100%' }} src={`${ERP_HOST}/root/finance/projectInformation/update?id=${projectId}`} width="100%" height="100vh !important" frameBorder="0" />
                            </div>
                        },
                      ]}
                    />,
                },
                {
                  label: intl
                    .get(`HKPC.commom.view.title.Procurement`)
                    .d('采购'),
                  key: 'scoreDetailTwo',
                  children:
                  <div className={styles['tabs-wrapper']}>
                  <CusSearchTabs
                    style={{
                      backgroundColor: '#fff',
                      padding: '16px 16px 0 16px',
                    }}
                    // defaultActiveKey="0"
                    // activeKey="0"
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
                                src={`/pub/ssrc-hk/purchaseApplicationErp/edit?id=${prThirdHeadId || this.state.purchaseRequestId}`}
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
                          key: '0',
                          children: pChildren
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
        {tabActiveKey === 'scoreDetailTwo' && (enter === 'create' || inquireBaseInfo?.status === 'PENDING_REFER') && !isrepeat && <CusApprovalButtons
          children={
            <CusButton
              onClick={this.save}
            >
              {intl.get(`hzero.common.view.button.save`).d('保存')}
            </CusButton>
          }
        ></CusApprovalButtons>
        }
      </>
    );
  }
}
