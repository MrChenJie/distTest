import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Form, Collapse } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import { uniqBy } from 'lodash';
import {
  getEditTableData,
  createPagination,
  getCurrentUser,
} from 'utils/utils';
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
import DetailList from './DetailList';

const { Panel } = Collapse;
const { loginName, id } = getCurrentUser();
const prompt = 'spfmhk.dict';
let isSaveFlag = true

@formatterCollections({ code: [prompt, 'spfmhk.mylink'] })
@fastCodeLoader(['DICT.COOPERATE_APPLY_STATUS', 'DICT.PARTNER_FILE_TYPE', 'DICT.MODE_FILE_TYPE', 'DICT.JUDGE_APPLY_STATUS', 'HKSM.APPLICATION.STATUS'])
@connect(({ loading, registerManagementModel }) => ({
  registerManagementModel,
  qeuryLoading: loading.effects['registerManagementModel/queryHeadInfo'] ||
    loading.effects['registerManagementModel/queryList'],
  saveLoading: loading.effects['registerManagementModel/saveHeadInfo'] ||
    loading.effects['registerManagementModel/saveJudges'],
}))
export default class Detail extends React.Component {

  constructor(props) {
    super(props);
    window.parent?.postMessage({ hasListener: true }, '*');
    // window.addEventListener('message', this.handleClickBtn);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { activeId, formRecordId } =
      queryString.parse(location?.search?.substr(1)) || {};
    this.state = {
      formRecordId: formRecordId === 'null' ? activeId : formRecordId,
      isPub,
      activeKey: ['form', 'table'],
      templateCode: 'TRADE_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      judgesSource: [],
    };
  }

  componentDidMount() {
    if (this.state.formRecordId) {
      //查询评委列表
      // this.queryJudgesInfo({}, this.state.formRecordId);
      //查询头信息
      this.queryHeadInfo(this.state.formRecordId)
    }
    this.getBpmWork();
  }

  componentWillUnmount() {
    // window.removeEventListener('message', this.handleClickBtn);
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
            subject: params?.subject,
            info: params?.info,
            ...params,
          },
        },
        url,
      );
    };

    if (e.data.messageType === 'GET_FORM_DATA') {
      if (['DRAFT_HANDLE', 'SEND'].includes(submitType)) {
        // 保存 提交
        this.handleSave((params) => {
          console.log('save&submit', params);
          if (params) {
            handlePostMessage({
              formRecordId: params?.formRecordId,
              subject: params?.subject,
              info: params?.info,
            });
          }
        });
      } else {
        // 其他按钮
        handlePostMessage();
      }
    }
  };

  // 致远调用参数&流程
  @Bind()
  getBpmWork() {
    const { location } = this.props;
    const routerParams = queryString.parse(location.search.substr(1));
    const { formRecordId } = routerParams;
    console.log(formRecordId, this.state.formRecordId)
    // const { infoForm, } = resaleRequestDetail;
    top?.postMessage({
      hasListener: true,
    }, '*');
    // 保存："DRAFT_HANDLE"  不做校验
    // 发起人提交："SEND"  校验
    // 审批人提交："AGREE"  校验
    // 会签："GIVE"  校验
    // 知会："NOTICE"  校验
    // 转办：""  校验
    // 退回：""  校验
    // 撤回：""  校验
    // 注销："TERMINATION"  不做校验
    // 查看流程："PROCESS_SHOW"  不做校验
    window.addEventListener('message', async (e) => {
      const { match } = this.props;
      // const { infoForm, } = resaleRequestDetail;
      // let headerDatalist = infoForm?.current?.getFieldsValue()
      console.log('监听的message', e)
      console.log(formRecordId, this.state.formRecordId)
      if (e.data.messageType === 'GET_FORM_DATA') {
        if (['SEND', 'AGREE', 'DRAFT_HANDLE'].includes(e.data.submitType)) { // 保存和提交
          if (['DRAFT_HANDLE'].includes(e.data.submitType)) {
            this.saveHeadInfo((params) => {
              if (params) {
                console.log('callback', formRecordId && formRecordId !== 'null' ? formRecordId : this.state.formRecordId, formRecordId, this.state.formRecordId)
                // if (isSave) return
                
                top?.postMessage({
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType,//将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  actionInfo: {
                    // 阻止页面关闭
                    preventClose: !['SEND', 'AGREE'].includes(e.data.submitType)
                  },
                  //表单数据放这里
                  formData: {
                    formRecordId: formRecordId && formRecordId !== 'null' ? formRecordId : this.state?.judgeHeadId?.toString(),//表单记录id（Long）
                    caseSender: getCurrentUser().loginName,
                    subject: intl.get(`spfmhk.mylink.title.zhiyuan.judge`, { JudgDep: this.basicForm.getFieldsValue().judgeGroupName }).d('评委专家入库'),
                    department: this.basicForm.getFieldsValue().unitCode,
                    // title: match.params.type == 'create' ?  intl.get('spfmhk.mylink.title.zhiyuan.hzmsxz').d('合作模式新增：') + this.state.headerInfo?.partnerMode?.cooperationMode?.find(item => item.lang === "zh_CN")?.description: intl.get('spfmhk.mylink.title.zhiyuan.hzmsgx').d('合作模式新增：') + this.state.headerInfo?.partnerMode?.cooperationMode?.find(item => item.lang === "zh_CN")?.description,
                    // business_type: headerDatalist?.businessType || 'IDD',
                    // account_manager: ["kammyyang"]
                    // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                    //   packageName: params.packageName
                    // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                    // //下面内容为表单数据
                    // ...params,
                  }
                }, e.data.url);
              }
            }, e.data.submitType);
          } else {
            this.saveHeadInfo((params) => {
              if (params) {
                // this.saveHeadInfo()
                const newId = formRecordId && formRecordId !== 'null' ? formRecordId : this.state?.judgeHeadId.toString()
                console.log('formData', newId);
                top?.postMessage({
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType,//将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  actionInfo: {
                    // 阻止页面关闭
                    preventClose: !['SEND', 'AGREE'].includes(e.data.submitType)
                  },
                  //表单数据放这里
                  formData: {
                    formRecordId: newId,//表单记录id（Long）
                    caseSender: getCurrentUser().loginName,
                    subject: intl.get(`spfmhk.mylink.title.zhiyuan.judge`, { JudgDep: this.basicForm.getFieldsValue().judgeGroupName }).d('评委专家入库'),
                    department: this.basicForm.getFieldsValue().unitCode,
                    // title: headerDatalist?.toDoTitle,
                    // business_type: headerDatalist?.businessType || 'IDD',
                    // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                    //   packageName: params.packageName
                    // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                    // //下面内容为表单数据
                    // ...params,
                  }
                }, e.data.url);
              }
            }, e.data.submitType);
          }
        }
        else {
          if (['TERMINATION', 'PROCESS_SHOW'].includes(e.data.submitType)) {
            // this.goSave((params) => {
            //   console.log('params', params)
            //   if(params) {
            const newId = formRecordId && formRecordId !== 'null' ? formRecordId : this.state?.judgeHeadId.toString()
            top?.postMessage({
              success: true, //传true
              submitType: e.data.submitType,//将此字段值回传
              messageType: e.data.messageType, //获取表单数据消息
              actionInfo: {
                // 阻止页面关闭
                preventClose: e.data.messageType === 'PROCESS_SHOW'
              },
              //表单数据放这里
              formData: {
                formRecordId: newId,//表单记录id（Long）
                caseSender: getCurrentUser().loginName,
                subject: intl.get(`spfmhk.mylink.title.zhiyuan.judge`, { JudgDep: this.basicForm.getFieldsValue().judgeGroupName }).d('评委专家入库'),
                department: this.basicForm.getFieldsValue().unitCode,
                // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                //   packageName: params.packageName
                // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                // //下面内容为表单数据
                // ...params,
              }
            }, e.data.url);
            //   }
            // })
          } else {
            // this.goSubmit((params) => {
            //   console.log('params', params)
            //   if(params) {
            top?.postMessage({
              success: true, //传true
              submitType: e.data.submitType,//将此字段值回传
              messageType: e.data.messageType, //获取表单数据消息
              actionInfo: {
                // 阻止页面关闭
                preventClose: e.data.messageType === 'PROCESS_SHOW'
              },
              //表单数据放这里
              formData: {
                formRecordId: formRecordId,//表单记录id（Long）
                caseSender: getCurrentUser().loginName,
                subject: intl.get(`spfmhk.mylink.title.zhiyuan.judge`, { JudgDep: this.basicForm.getFieldsValue().judgeGroupName }).d('评委专家入库'),
                department: this.basicForm.getFieldsValue().unitCode,
                // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                //   packageName: params.packageName
                // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                // //下面内容为表单数据
                // ...params,
              }
            }, e.data.url);
            //   }
            // })
          }
        }
      }
    })
  }

  queryDetail = (formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'registerManagementModel/queryDetail',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      console.log('详情', res);
      if (res) {
        this.setState({
          headerInfo: { ...res },
        });
      }
    });
  };

  queryJudgesInfo = (page = {}, formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'registerManagementModel/queryList',
      payload: {
        applyNumber: formRecordId,
      },
    }).then((res) => {
      if (res) {
        //从后端查询过来的judges,设置其_status为update,用于区分删除
        console.log('judges详情', res);
        const { content = [] } = res;
        //取第一条数据填充basicForm
        if (content.length > 0) {
          this.setState({
            headerInfo: {
              ...this.state.headerInfo,
              ...content[0]
            },
          });
        }
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        console.log('newDataSource', newDataSource);
        this.setState({
          judgesSource: newDataSource,
        });
      }
    });
  };


  @Bind()
  handleDeleteLine = () => {
    const { dispatch, registerManagementModel } = this.props;
    const { selectedRowKeys, formRecordId, headId, judgesSource } = this.state;
    if (selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = judgesSource?.filter(
          (item) => selectedRowKeys.includes(item['rowKey']) && item._status !== 'create',
        );
        if (deleteData.length > 0) {
          // 后台删除
          const judges = deleteData?.map((i) => {
            return {
              judgeId: i.judgeId,
            };
          });
          dispatch({
            type: 'registerManagementModel/deleteJudgesLine',
            payload: judges,
          }).then((res) => {
            if (res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              this.queryJudgesInfo(_, formRecordId);
            }
          });
        } else {
          // 本地删除
          const newDataSource = judgesSource?.filter((item) => !selectedRowKeys.includes(item.rowKey));
          this.setState({
            judgesSource: newDataSource,
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
  handleAddLine = () => {
    const { dispatch, registerManagementModel } = this.props;
    const { judgesSource } = this.state;
    console.log('basicForm', this.basicForm.getFieldsValue());
    //只是页面层的新增
    this.basicForm.validateFields((err, values) => {
      if (!err) {
        //向数据源judgesSource 添加一条数据
        const newDataSource = [
          ...judgesSource,
          {
            rowKey: uuidv4(),
            _status: 'create',
            employeeNum: undefined,
            name: undefined,
            mobile: undefined,
            email: undefined,
            descri: undefined,
            isEffective: undefined,
          },
        ];
        this.setState({
          judgesSource: newDataSource,
        });
      }
    });
  };

  @Bind()
  handleSave = (callback, record) => {
    const { dispatch } = this.props;
    const { judgesSource } = this.state;
    const validateData = getEditTableData(judgesSource, ['rowKey']);
    const isUniqBy = uniqBy(validateData, item => `${item.judgeAccount}`);//评委行不重复
    this.basicForm.validateFields((err, values) => {
      if (!err) {
        this.detailListForm.validateFields((err1, values1) => {
          if (!err1) {
            if (Array.isArray(validateData) && validateData.length === 0) {
              return CusNotification.warning({
                message: intl.get(`${prompt}.view.field.judgecheckadd`).d('请添加评委行'),
              });
            }
            if (isUniqBy.length < validateData.length) {
              return CusNotification.warning({
                message: intl.get(`${prompt}.view.field.judgecheckidentical`).d('存在相同评委，请检查'),
              });
            }
            console.log('values', values);
            // 数据汇总
            let judges = judgesSource?.map((i) => {
              return {
                judgeId: i?.judgeId,
                judgeAccount: i?.judgeAccount,
                describe: i?.describe,
                isEffective: i?.isEffective === undefined ? 'N' : i?.isEffective,
                judgeDepartCode: values.unitCode,
                ...values,
                judgeHeadId: record.judgeHeadId,
                applyNum: record.applyNum
              };
            });
            console.log('judges', judges);
            dispatch({
              type: 'registerManagementModel/saveJudges',
              payload: judges,
            }).then(res => {
              if (res.failed) {
                return CusNotification.warning({
                  message: intl.get(`${prompt}.${res.code}`).d('该评委已经存在或正在审批中'),
                });
              } else {
                console.log('res11', res);
                const applyNum = res[0].applyNum;
                console.log('applyNum', applyNum);
                this.queryJudgesInfo({}, applyNum);

                this.setState({
                  formRecordId: record.judgeHeadId,
                })
                CusNotification.success({
                  message: intl.get('hzero.common.notification.success.save').d('保存成功'),
                });
                this.queryHeadInfo(record.judgeHeadId)
                callback(true)
              }
            }).catch(err => {
              console.log(err);
              callback(false)
            });
          }
        });
      }
    });

  };

  handleDep = (data) => {
    const { dispatch } = this.props;
    const { judgesSource } = this.state;
    //basicForm选择了评分部门后，带出评分组名
    const unitCode = this.basicForm.getFieldsValue().unitCode;
    const clear = unitCode ? unitCode === data.value : true;
    this.basicForm.setFieldsValue({
      unitCode: data.value,
      judgeGroupName: data.unitName,
    });
    if (!clear) {//更改基础信息的部门时清空评委列表
      const deleteData = judgesSource?.filter(
        (item) => item._status !== 'create',
      );
      if (deleteData?.length > 0) {
        // 后台删除
        const judges = deleteData?.map((i) => {
          return {
            judgeId: i.judgeId,
          };
        });
        console.log('judges', judges);
        dispatch({
          type: 'registerManagementModel/deleteJudgesLine',
          payload: judges,
        }).then((res) => {
          if (res) {
            CusNotification.success({
              message: intl.get('hzero.common.notification.success.save').d('保存成功'),
            });
            this.queryJudgesInfo(_, this.state.formRecordId);
          }
        });
      } else {
        // 本地删除
        const newDataSource = [];
        this.setState({
          judgesSource: newDataSource,
        });
      }
    }
  };

  @Bind
  saveHeadInfo(callback) {
    isSaveFlag = true
    const { dispatch } = this.props;
    const param = this.basicForm?.getFieldsValue()
    console.log(this.state.formRecordId, 'fff')
    dispatch({
      type: 'registerManagementModel/saveHeadInfo',
      payload: [{
        judgeUnitCode: param.unitCode,
        judgeGroupDesc: param.groupDescribe,
        judgeHeadId: this.state?.formRecordId,
        applyNum: this.state?.headerInfo?.applyNum
      }],
    }).then(res => {
      console.log(this.state.formRecordId,)
      if (res.length > 0) {
        this.handleSave((params) => {
          callback(params)
        }, res[0])
        this.setState({
          judgeHeadId: res[0]?.judgeHeadId
        })
      }
    }).catch(err => {
      console.log(err);
    });
  }

  @Bind
  queryHeadInfo(id) {
    const { dispatch } = this.props;
    const param = this.basicForm?.getFieldsValue()
    dispatch({
      type: 'registerManagementModel/queryHeadInfo',
      payload: id,
    }).then(res => {
      if (res) {
        this.queryJudgesInfo({}, res.applyNum)
        this.basicForm.setFieldsValue({
          unitCode: res.judgeUnitCode,
        });
        this.setState({
          headerInfo: res
        })
      }
    })
  }


  render() {

    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
      saveLoading = false
    } = this.props;
    const {
      activeKey,
      selectedRowKeys,
      headerInfo,
      headId,
      formRecordId,
      judgesSource,
    } = this.state;

    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly = ['Inapproval', 'Approved'].includes(headerInfo?.applyStatus) || (headerInfo?.createdBy && headerInfo?.createdBy !== id);
    console.log(headerInfo)
    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      detailList,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.props.form;
      },
      handleDep: this.handleDep,//回调函数
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const detailListProps = {
      ...this.props,
      readyOnly,
      idpValueMap,
      rowSelection,
      judgesSource,
      basicForm: this.basicForm?.getFieldsValue(),//列表中的评委需要限制在basicForm中的部门里
      onRef: (ref) => {
        this.detailListForm = ref.props.form;
      },
      onChange: (page) => {
        this.queryJudgesInfo(page, (formRecordId || headId));
      },
    };

    return (
      <PageWrapper loading={qeuryLoading || saveLoading}>
        {/* <button onClick={() => {
          this.saveHeadInfo();
        }}>保存
        </button> */}
        <Collapse
          className="customize-collapse"
          bordered={false}
          style={{ marginTop: '16px' }}
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            bordered={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.dict.view.common.basicinformation`).d('基本信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <BasicForm {...basicFormProps}></BasicForm>
          </Panel>
          <Panel
            showArrow={false}
            bordered={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.dict.view.judgeinformation`).d('评委信息')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  readyOnly ? (
                    <></>
                  ) : (
                    <>
                      <CusButton mini onClick={this.handleDeleteLine} disabled={selectedRowKeys.length === 0}>
                        {intl.get('hzero.common.view.button.delete').d('删除')}
                      </CusButton>
                      <CusButton mini type="primary" onClick={this.handleAddLine}>
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                    </>
                  )
                }
              />
            }
            key="table"
          >
            <Form>
              <DetailList {...detailListProps} />
            </Form>
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
