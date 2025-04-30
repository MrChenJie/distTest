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
const { loginName } = getCurrentUser();
const prompt = 'spfmhk.dict';
@formatterCollections({ code: [prompt] })
@fastCodeLoader(['DICT.COOPERATE_APPLY_STATUS', 'DICT.PARTNER_FILE_TYPE', 'DICT.MODE_FILE_TYPE', 'DICT.JUDGE_APPLY_STATUS'])
@connect(({ loading, judgesManagementModel }) => ({
  judgesManagementModel,
  qeuryLoading: loading.effects['judgesManagementModel/queryJudgesInfo'],
}))
export default class Detail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      groupId: null,
      // formRecordId: formRecordId === 'null' ? activeId : formRecordId,
      activeKey: ['form', 'table'],
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      judgesSource: [],
      readOnly: false,
    };
  }

  componentDidMount() {
    this.pageInit();
  }


  pageInit() {
    const { location: { search }, dispatch } = this.props;
    const { groupId, formRecordId, state, permissionType } = queryString.parse(search.substring(1));
    this.setState({
      formRecordId: groupId || formRecordId,
      readOnly: formRecordId?.indexOf('null') < 0 && state !== 'READY' && !(state === 'PENDING' && permissionType === 'SEND'), // 只有草稿和退回单可编辑,
    });
    console.log(groupId, formRecordId);
    if (groupId || formRecordId !== 'null') {
      const params = {
        groupId: groupId || formRecordId,
      };
      //查询评委列表
      this.queryJudgesInfo({ page: {}, ...params });
    }
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 提交 保存 退回 会签 注销 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'GIVE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            console.log(params, '===params===');
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        } else {
          this.handleSave((params) => {
            console.log(params, '===params===');
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        }
      }
    });
  }

  queryJudgesInfo = (params) => {
    const { dispatch } = this.props;
    const { page = {}, groupId } = params;
    dispatch({
      type: 'judgesManagementModel/queryList',
      payload: {
        groupId: groupId,
        page,
      },
    }).then((res) => {
      if (res) {
        //从后端查询过来的judges,设置其_status为update,用于区分删除
        console.log('judges详情', res);
        const { content = [] } = res;
        //取第一条数据填充basicForm
        if (content.length > 0) {
          this.setState({
            headerInfo: { ...content[0] },
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
    const { dispatch } = this.props;
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
            type: 'judgesManagementModel/deleteJudgesLine',
            payload: { judges },
          }).then((res) => {
            if (res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              const groupId = judgesSource[0].groupId;
              this.queryJudgesInfo({ page: { pageNum: 1, pageSize: judgesSource.length }, groupId });
              // this.queryJudgesInfo(_, formRecordId);
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
  handleSave = (callback) => {
    const { dispatch } = this.props;
    const { judgesSource, headerInfo } = this.state;
    const validateData = getEditTableData(judgesSource, ['rowKey']);
    const isUniqBy = uniqBy(validateData, item => `${item.judgeAccount}`);//评委行不重复
    this.basicForm.validateFields((err, values) => {
      if (!err) {
        this.detailListForm.validateFields((err1, values1) => {
          if (!err1) {
            if (Array.isArray(validateData) && validateData.length === 0) {
              return CusNotification.warning({
                message: intl.get('spfmhk.dict.view.field.judgecheckadd').d('请添加评委行'),
              });
            }
            if (isUniqBy.length < validateData.length) {
              return CusNotification.warning({
                message: intl.get('spfmhk.dict.view.field.judgecheckidentical').d('存在相同评委，请检查'),
              });
            }
            const judgeGroup = [{
              // ...headerInfo,
              judgeDepartCode: values.unitCode,
              groupDescribe: values.groupDescribe,
            }];
            //更新时，用原本的groupId
            if (headerInfo?.groupId) {
              judgeGroup[0].groupId = headerInfo.groupId;
            }
            console.log('values', values, judgeGroup);
            dispatch({
              type: 'judgesManagementModel/savejudgeGroups',
              payload: { judgeGroup },
            }).then(res => {
              console.log('groups', res);
              if (res) {
                // 数据汇总
                let judges = judgesSource?.map((i) => {
                  if (headerInfo?.applyNum) {
                    return {
                      judgeId: i?.judgeId,
                      judgeAccount: i?.judgeAccount,
                      describe: i?.describe,
                      isEffective: i?.isEffective === undefined ? 'N' : i?.isEffective,
                      judgeDepartCode: values.unitCode,
                      groupDescribe: values.groupDescribe,
                      groupId: res[0].groupId,
                      applyNum: headerInfo.applyNum,
                    };
                  } else {
                    return {
                      judgeId: i?.judgeId,
                      judgeAccount: i?.judgeAccount,
                      describe: i?.describe,
                      isEffective: i?.isEffective === undefined ? 'N' : i?.isEffective,
                      judgeDepartCode: values.unitCode,
                      groupDescribe: values.groupDescribe,
                      groupId: res[0].groupId,
                    };
                  }
                });
                console.log('judges', judges);
                dispatch({
                  type: 'judgesManagementModel/saveJudges',
                  payload: { judges },
                }).then(res => {
                  if (res.failed) {
                    return CusNotification.warning({
                      message: intl.get(`${prompt}.${res.code}`).d('该评委已经存在或正在审批中'),
                    });
                  } else {
                    console.log('res11', res);
                    const groupId = res[0].groupId;
                    this.queryJudgesInfo({ page: { pageNum: 1, pageSize: judgesSource.length }, groupId });
                    if (typeof callback === 'function') {
                      console.log('待办标题: ', intl.get('spfmhk.dict.view.field.judge.judgesin').d('评委入库流程') + '：' + res[0].applyNum);
                      callback({
                        ...res,
                        formRecordId: groupId,
                        affairTitle: intl.get('spfmhk.dict.view.field.judge.judgesin').d('评委入库流程') + '：' + res[0].applyNum,
                      });
                    }
                  }
                });
              }
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
      judgeGroupName: data.description,
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
          type: 'judgesManagementModel/deleteJudgesLine',
          payload: { judges },
        }).then((res) => {
          if (res) {
            CusNotification.success({
              message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
            });
            const groupId = judgesSource[0].groupId;
            this.queryJudgesInfo({ page: { pageNum: 1, pageSize: judgesSource.length }, groupId });
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


  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
    } = this.props;
    const {
      activeKey,
      selectedRowKeys,
      headerInfo,
      judgesSource,
      readOnly,
    } = this.state;


    const basicFormProps = {
      ...this.props,
      readOnly,
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
      getCheckboxProps: record => ({
        disabled: readOnly,
      }),
    };
    const detailListProps = {
      ...this.props,
      readOnly,
      idpValueMap,
      rowSelection,
      judgesSource,
      basicForm: this.basicForm?.getFieldsValue(),//列表中的评委需要限制在basicForm中的部门里
      onRef: (ref) => {
        this.detailListForm = ref.props.form;
      },
      onChange: (page) => {
        // this.queryJudgesInfo(page, (formRecordId || headId));
      },
    };

    return (
      <PageWrapper loading={qeuryLoading}>
        {/*<CusButton onClick={this.handleSave}>test</CusButton>*/}
        <Collapse
          className="customize-collapse"
          // bordered={false}
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
                  readOnly ? (
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
            <DetailList {...detailListProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
