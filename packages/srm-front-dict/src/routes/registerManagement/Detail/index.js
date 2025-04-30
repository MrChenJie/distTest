import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse, Col, Divider } from 'antd';
import { Form } from 'hzero-ui';
import { fastCodeLoader } from '@/utils/decorators';
import CusRequest from '_cus_utils/request';
import {
  getCurrentOrganizationId,
  createPagination,
  getCurrentUser,
} from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { downloadFile } from 'hzero-front/lib/services/api';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import BasicList from './basicList';
import JudgesList from './JudgesList';
import CusLov from '_cus_components/CusLov';
import CusInput from 'srm-front-common/lib/components/CusInput';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const { loginName } = getCurrentUser();

const prompt = 'spfmhk.dict';

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader(['HKTB.HEAD_BIDALL', 'HKTB.LINE_BIDRULE', 'HKTB.ACTIVITY_STATUS', 'LINK.PARTNER_CATEGORY'])
@connect(({ loading, registerManagementModel }) => ({
  registerManagementModel,
  queryLoading: loading.effects['registerManagementModel/queryDetail'] || loading.effects['registerManagementModel/queryListDetail'],
  dataSource: registerManagementModel?.dataSource,
  pagination: registerManagementModel?.pagination,
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    this.state = {
      formRecordId: null,
      isPub,
      activeKey: ['basicList', 'info'],
      childActiveKey: ['judgesList1', 'judgesList2'],
      templateCode: 'TRADE_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      partnerList: [], // 合作伙伴列表数据
      partnerSelectedRows: [],
      partnerSelectedRowKeys: [],
      partnerJudgesList: [], // 评委抽取列表数据
      partnerInfoIds: [],
      judgeTotalNum: 0,
      qualPartnerNum: 0,
      techPartnerNum: 0,
      qualDataSource: [], // 资格评委
      techDataSource: [], // 技术评委
      qualExistUnitCodes: [], // 资格评委已选择的部门code
      techExistUnitCodes: [], // 技术评委已选择的部门code
      loading: false,
    };
  }

  componentDidMount() {
    this.pageInit();
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleClickBtn);
  }

  pageInit() {
    const { location: { search }, dispatch } = this.props;
    const { activeId, formRecordId, partnerInfoIds } = queryString.parse(search.substr(1));
    this.setState({
      formRecordId: formRecordId?.indexOf('null') > -1 ? formRecordId : activeId,
      partnerInfoIds,
    });
    // 基础信息
    dispatch({
      type: 'registerManagementModel/queryPartnerListData',
      payload: {
        partnerInfoIds,
      },
    }).then(res => {
      if (res) {
        this.setState({
          partnerList: res?.content || [],
        });
      }
    });
    dispatch({
      type: 'registerManagementModel/init',
    }).then(res => {
      const JUDGE_DEPART = res['JUDGE_DEPART'];
      const qual = JUDGE_DEPART.filter(item => item.tag === 'qualify');
      const tech = JUDGE_DEPART.filter(item => item.tag === 'tech');
      const qualDataSource = qual.map(item => {
        return {
          rowKey: uuidv4(),
          judgeType: 'JUDGE_LIBRARY',
          status: 'IN',
          tag: item.tag,
          _status: 'update',
          disabled: true,
        };
      });
      const techDataSource = tech.map(item => {
        return {
          rowKey: uuidv4(),
          judgeType: 'JUDGE_LIBRARY',
          status: 'IN',
          tag: item.tag,
          _status: 'update',
          disabled: true,
        };
      });
      this.setState({
        qualDataSource: qualDataSource,
        techDataSource: techDataSource,
        qualPartnerNum: qualDataSource.length,
        techPartnerNum: techDataSource.length,
        judgeTotalNum: qualDataSource.length + techDataSource.length,
      });
    });
  }

  // 合作伙伴table select
  @Bind()
  handlePartnerSelectRows(selectedRowKeys, selectedRows) {
    console.log(selectedRowKeys, selectedRows);
    this.setState({
      partnerSelectedRows: selectedRows,
      partnerSelectedRowKeys: selectedRowKeys,
    });
  }

  // 删除合作伙伴行信息
  @Bind()
  handleDeletePartnerRowData() {
    const { partnerSelectedRows, partnerList, partnerInfoIds, partnerSelectedRowKeys } = this.state;
    const arr = partnerInfoIds.split(',');
    const result = arr.filter(item => !partnerSelectedRowKeys.map(item => item.toString()).includes(item));
    this.setState({
      partnerList: partnerList.filter(r => partnerSelectedRows.every(rd => rd.partnerId !== r.partnerId)),
      partnerSelectedRows: [],
      partnerSelectedRowKeys: [],
      partnerInfoIds: result.toString(),
    });
  }

  // 新增一行合作伙伴行信息
  @Bind()
  handleAddPartnerRowData(row) {
    const { partnerList, partnerInfoIds } = this.state;
    const newPartnerInfoIds = partnerInfoIds.split(',').concat(row.partnerId + '').toString();
    this.setState({
      partnerList: [
        ...partnerList,
        {
          partnerId: row.partnerId,
          cmpanyName: row.cmpanyName,
          collaborationMode: row.collaborationMode,
          email: row.email,
          phone: row.phone,
          registrationDate: row.registrationDate,
        },
      ],
      partnerInfoIds: newPartnerInfoIds,
    });
  }

  queryListDetail = (page = {}, formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'registerManagementModel/queryListDetail',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        console.log('商品详情', res);
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'registerManagementModel/updateState',
          payload: {
            judgesQuaSource: newDataSource,
            judgesQuaPagination: pagination,
          },
        });
      }
    });
  };

  @Bind()
  handleDownloadTemplateClick = () => {
    const { templateCode } = this.state;
    const api = `/bidding/v1/${organizationId}/import/template/${templateCode}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] });
  };

  payUpload = (payFileList = []) => {
    const { registerManagementModel, dispatch } = this.props;
    const { judgesQuaSource = [], judgesQuaPagination = {} } = registerManagementModel;
    const basicForm = this.basicForm?.getFieldsValue();
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({
      importUploading: true,
    });
    CusRequest(`/trade/v1/${organizationId}/cmhk-act-mats/importMatExcelCheck`, {
      method: 'POST',
      body: formData,
      responseType: 'text',
    }).then((res) => {
      if (res) {
        const response = JSON.parse(res);
        const data = (response?.data || [])?.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          quoteRule: basicForm?.isFullQuote === 'Y' ? 'Bundled' : 'Singleton',
          _status: 'create',
        }));
        const newDataSource = [
          ...judgesQuaSource,
          ...data,
        ];
        dispatch({
          type: 'registerManagementModel/updateState',
          payload: {
            judgesQuaSource: newDataSource,
          },
        });
        this.setState({
          importUploading: false,
          productVisible: false,
        }, () => {
          if (response.msg) {
            CusNotification.error({
              message: response.msg,
            });
          }
        });
      }
    });
  };

  //发起审批流程
  handleApproval = () => {
    const { partnerList, qualDataSource, techDataSource } = this.state;
    const { dispatch } = this.props;
    const partnerIds = partnerList.map(item => item.partnerId).toString();
    const judgesList = [...qualDataSource, ...techDataSource];
    const partnerJudges = judgesList.map(item => {
      return {
        judgeAccount: item.judgeAccount,
        unitCode: item.unitCode,
        unitName: item.unitName,
        email: item.email,
        mobile: item.mobile,
        name: item.name,
        status: item.status,
        judgeType: item.tag,
      };
    });
    const payload = {
      partnerIds: partnerIds,
      partnerJudges: partnerJudges,
    };
    this.setState({
      loading: true,
    });
    dispatch({
      type: 'registerManagementModel/submitApplyJudges',
      payload: payload,
    }).then(res => {
      if (res) {
        this.setState({
          loading: false,
        });
        CusNotification.success({
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        setTimeout(() => {
          window.close();
        }, 500);
      }
    });
  };

  // 抽取，全部抽取
  @Bind()
  handleJudgePartner(params) {
    const { judgeType } = params;
    const { dispatch, form } = this.props;
    const { qualDataSource, techDataSource } = this.state;
    const payload = {
      judgeType,
    };
    dispatch({
      type: 'registerManagementModel/getPartnerJudges',
      payload,
    }).then(res => {
      if (res?.length > 0) {
        if (judgeType === 'qualify') {
          const newData = res.map(item => {
            return {
              _status: 'update',
              rowKey: uuidv4(),
              judgeAccount: item.judgeAccount,
              unitCode: item.unitCode,
              unitName: item.unitName,
              email: item.email,
              mobile: item.mobile,
              name: item.name,
              judgeType: 'JUDGE_LIBRARY',
              status: 'IN',
              disabled: true,
              tag: 'qualify',
            };
          });
          this.setState({
            qualDataSource: newData,
            qualPartnerNum: newData.length,
            judgeTotalNum: newData.length + techDataSource.length,
            qualExistUnitCodes: [],
          });
        } else if (judgeType === 'tech') {
          const newData = res.map(item => {
            return {
              _status: 'update',
              rowKey: uuidv4(),
              judgeAccount: item.judgeAccount,
              unitCode: item.unitCode,
              unitName: item.unitName,
              email: item.email,
              mobile: item.mobile,
              name: item.name,
              judgeType: 'JUDGE_LIBRARY',
              status: 'IN',
              disabled: true,
              tag: 'tech',
            };
          });
          this.setState({
            techDataSource: newData,
            techPartnerNum: newData.length,
            judgeTotalNum: newData.length + qualDataSource.length,
            techExistUnitCodes: [],
          });
        } else {
          const qual = res.filter(item => item.judgeType === 'qualify');
          const tech = res.filter(item => item.judgeType === 'tech');
          const newQual = qual.map(item => {
            return {
              _status: 'update',
              rowKey: uuidv4(),
              judgeAccount: item.judgeAccount,
              unitCode: item.unitCode,
              unitName: item.unitName,
              email: item.email,
              mobile: item.mobile,
              name: item.name,
              judgeType: 'JUDGE_LIBRARY',
              status: 'IN',
              disabled: true,
              tag: 'qualify',
            };
          });
          const newTech = tech.map(item => {
            return {
              _status: 'update',
              rowKey: uuidv4(),
              judgeAccount: item.judgeAccount,
              unitCode: item.unitCode,
              unitName: item.unitName,
              email: item.email,
              mobile: item.mobile,
              name: item.name,
              judgeType: 'JUDGE_LIBRARY',
              status: 'IN',
              disabled: true,
              tag: 'tech',
            };
          });
          this.setState({
            qualDataSource: newQual,
            qualPartnerNum: newQual.length,
            techDataSource: newTech,
            techPartnerNum: newTech.length,
            judgeTotalNum: newQual.length + newTech.length,
            qualExistUnitCodes: [],
            techExistUnitCodes: [],
          });
          newQual.map(item => {
            item?.$form?.setFieldsValue({
              judgeType: 'JUDGE_LIBRARY',
            });
          });
          newTech.map(item => {
            item?.$form?.setFieldsValue({
              judgeType: 'JUDGE_LIBRARY',
            });
          });
        }
      }
    });
  }

  // 选择评委
  @Bind()
  handleTableFieldChange(params) {
    const { rowValue, selectedRow, record, fieldName, dataSource } = params;
    const { qualExistUnitCodes, techExistUnitCodes } = this.state;
    // 资格评委
    if (record.tag === 'qualify') {
      if (fieldName === 'name') {
        record.name = selectedRow.name;
        record.unitCode = selectedRow.unitCode;
        record.unitName = selectedRow.unitName;
        record.mobile = selectedRow.mobile;
        record.email = selectedRow.email;
        record.judgeAccount = selectedRow.judgeAccount;
        record.disabled = true;
        this.setState({
          qualExistUnitCodes: [...qualExistUnitCodes, selectedRow.unitCode],
        });
      }
      if (['judgeType', 'status'].includes(fieldName)) {
        record[fieldName] = rowValue;
      }
      if (fieldName === 'judgeType') {
        record.disabled = rowValue !== 'MANUAL';
        record.name = null;
        record.unitCode = null;
        record.unitName = null;
        record.mobile = null;
        record.email = null;
        record.judgeAccount = null;
        const arr1 = dataSource.filter(item => item.unitCode);
        const arr2 = arr1.map(item => item.unitCode);
        this.setState({
          qualExistUnitCodes: arr2,
        });
      }
    }
    // 技术评委
    if (record.tag === 'tech') {
      if (fieldName === 'name') {
        record.name = selectedRow.name;
        record.unitCode = selectedRow.unitCode;
        record.unitName = selectedRow.unitName;
        record.mobile = selectedRow.mobile;
        record.email = selectedRow.email;
        record.judgeAccount = selectedRow.judgeAccount;
        record.disabled = true;
        this.setState({
          techExistUnitCodes: [...techExistUnitCodes, selectedRow.unitCode],
        });
      }
      if (['judgeType', 'status'].includes(fieldName)) {
        record[fieldName] = rowValue;
      }
      if (fieldName === 'judgeType') {
        record.disabled = rowValue !== 'MANUAL';
        record.name = null;
        record.unitCode = null;
        record.unitName = null;
        record.mobile = null;
        record.email = null;
        record.judgeAccount = null;
        const arr1 = dataSource.filter(item => item.unitCode);
        const arr2 = arr1.map(item => item.unitCode);
        this.setState({
          techExistUnitCodes: arr2,
        });
      }
    }
  };

  // 重新抽取
  @Bind()
  handleReset(params) {
    const { record } = params;
    const { dispatch } = this.props;
    let judgeType = '';
    if (record.tag === 'qualify') {
      judgeType = 'qualify';
    } else if (record.tag === 'tech') {
      judgeType = 'tech';
    }
    dispatch({
      type: 'registerManagementModel/resetPartnerJudge',
      payload: {
        judgeType,
        judgeAccount: record.judgeAccount,
        unitCode: record.unitCode,
      },
    }).then(res => {
      if (res?.name) { // 没有评委名称时不覆盖已有信息
        record.judgeAccount = res.judgeAccount;
        record.unitCode = res.unitCode;
        record.unitName = res.unitName;
        record.name = res.name;
        record.mobile = res.mobile;
        record.email = res.email;
        record.disabled = true;
        record.judgeType = 'JUDGE_LIBRARY';
        record.$form.setFieldsValue({
          name: res.name,
          mobile: res.mobile,
          email: res.email,
          judgeType: 'JUDGE_LIBRARY',
        });
      }
    });
  }

  // 导出
  handleExport(params) {
    const { dispatch } = this.props;
    const { judgeType } = params;
    const { qualDataSource, techDataSource } = this.state;
    let payload = [];
    if (judgeType === 'qualify') {
      payload = qualDataSource.map(item => {
        return {
          judgeType: 'qualify',
          unitCode: item.unitCode,
          unitName: item.unitName,
          email: item.email,
          mobile: item.mobile,
          name: item.name,
          status: item.status,
        };
      });
    }
    if (judgeType === 'tech') {
      payload = techDataSource.map(item => {
        return {
          judgeType: judgeType,
          unitCode: item.unitCode,
          unitName: item.unitName,
          email: item.email,
          mobile: item.mobile,
          name: item.name,
          status: item.status,
        };
      });
    }
    if (judgeType === 'all') {
      const qual = qualDataSource.map(item => {
        return {
          judgeType: 'qualify',
          unitCode: item.unitCode,
          unitName: item.unitName,
          email: item.email,
          mobile: item.mobile,
          name: item.name,
          status: item.status,
        };
      });
      const tech = techDataSource.map(item => {
        return {
          judgeType: 'tech',
          unitCode: item.unitCode,
          unitName: item.unitName,
          email: item.email,
          mobile: item.mobile,
          name: item.name,
          status: item.status,
        };
      });
      payload = [...qual, ...tech];
    }
    dispatch({
      type: 'registerManagementModel/dataExport',
      payload: payload,
    }).then(res => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl.get(`${prompt}.view.export.master.data.fileName`).d('数据导出报表') + `(${dayjs().format('YYYY-MM-DD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          Promise.resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.setState({
          loading: false,
        });
      } else {
        this.setState({
          loading: false,
        });
      }
    });
  }

  render() {
    const {
      queryLoading = false,
      idpValueMap,
      registerManagementModel,
      form,
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      activeKey,
      childActiveKey,
      partnerInfoIds,
      selectedRowKeys,
      headerInfo,
      headId,
      formRecordId,
      partnerList,
      judgeTotalNum,
      qualPartnerNum,
      techPartnerNum,
      qualDataSource,
      techDataSource,
      partnerSelectedRowKeys,
      qualExistUnitCodes,
      techExistUnitCodes,
      loading,
    } = this.state;
    const basicListProps = {
      ...this.props,
      idpValueMap,
      registerManagementModel,
      onChange: (page) => this.queryListDetail(page, (formRecordId || headId)),
      dataSource: partnerList,
      rowSelection: {
        selectedRowKeys: partnerSelectedRowKeys,
        onChange: this.handlePartnerSelectRows,
      },
      rowKey: 'partnerId',
    };
    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly = ['InApproval', 'Approved'].includes(headerInfo?.status) || (headerInfo?.createrCode && headerInfo?.createrCode !== loginName);
    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const JudgesListProps1 = {
      ...this.props,
      readyOnly,
      idpValueMap,
      rowSelection,
      basicForm: this.basicForm?.getFieldsValue(),
      onChange: (page) => this.queryListDetail(page, (formRecordId || headId)),
      dataSource: qualDataSource,
      handleTableFieldChange: this.handleTableFieldChange,
      handleReset: this.handleReset,
      existUnitCodes: qualExistUnitCodes,
    };
    const JudgesListProps2 = {
      ...this.props,
      readyOnly,
      idpValueMap,
      rowSelection,
      basicForm: this.basicForm?.getFieldsValue(),
      onChange: (page) => this.queryListDetail(page, (formRecordId || headId)),
      dataSource: techDataSource,
      handleTableFieldChange: this.handleTableFieldChange,
      handleReset: this.handleReset,
      existUnitCodes: techExistUnitCodes,
    };
    return (
      <PageWrapper loading={queryLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          // bordered={null}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.dict.view.common.basicinformation`).d('基本信息')}
                arrowActive={activeKey.includes('basicList')}
              />
            }
            bordered={null}
            key="basicList"
          >
            <Form>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.common.partnercategory`).d('合作伙伴类别')}
                  style={{ display: 'flex' }}
                >
                  {getFieldDecorator('statusMeaning', {
                    initialValue: idpValueMap['LINK.PARTNER_CATEGORY']?.find(
                      (item) => item.value === 'DICT',
                    )?.meaning,
                  })(<CusInput disabled />)}
                </Form.Item>
              </Col>
            </Form>
            <Divider style={{ margin: '0px' }}></Divider>
            <div style={{ float: 'right', padding: '10px 0px' }}>
              <CusButton mini onClick={this.handleDeletePartnerRowData}>
                {intl.get('hzero.common.view.button.delete').d('删除')}
              </CusButton>
              <CusLov
                isButton
                code="DICT.PARTNER_INFO"
                type="primary"
                mini
                onOk={this.handleAddPartnerRowData}
                queryParams={{
                  excludePartnerIds: partnerInfoIds,
                  partnerStatus: 'PENDING_REFER',
                }}
              >
                {intl.get('hzero.common.button.add').d('新增')}
              </CusLov>
            </div>
            <Divider style={{ borderColor: '#FFFFFFFF', opacity: '0', margin: '0px' }}></Divider>
            <BasicList {...basicListProps}></BasicList>
          </Panel>

          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get('spfmhk.dict.view.selectjudge.selectjudge').d('评委选取')}
                arrowActive={activeKey.includes('info')}
              />
            }
            bordered={false}
            key="info"
          >
            <div>
              <div style={{ backgroundColor: '#EAF0FE', padding: '10px', borderRadius: '5px' }}>
                <h3>{intl.get(`${prompt}.view.marked.title`).d('提示：')}</h3>
                <p>{intl.get(`${prompt}.view.verifytip.addjudge`).d('（1）资格评审默认为2人，一人来自于采购部门，一人来自于财务部门')}</p>
                <p>{intl.get(`${prompt}.view.verifytip.secaddjudge`).d('（2）技术评委人数默认为4人，其成员分别来自DICT中心，政企客户部，政企交维中心，产品中心')}</p>
              </div>
              <div style={{ padding: '16px 0', float: 'right' }}>
                {intl.get('spfmhk.dict.view.selectjudge.judgetotalnumbers').d('项目评委总人数')}
                <CusButton mini>{judgeTotalNum}</CusButton>
                <CusButton mini onClick={() => this.handleExport({ judgeType: 'all' })}>
                  {intl.get(`${prompt}.view.field.title.exportAll`).d('全部导出')}
                </CusButton>
                <CusButton mini onClick={() => this.handleJudgePartner({ judgeType: null })}>
                  {intl.get(`${prompt}.view.field.title.extractAll`).d('全部抽取')}
                </CusButton>
              </div>
            </div>
            <Collapse
              defaultActiveKey={childActiveKey}
              bordered={false}
              onChange={(collapseKeys) => {
                this.setState({ childActiveKey: collapseKeys });
              }}
              style={{ marginTop: '70px' }}
            >
              <Divider style={{ margin: '0px' }}></Divider>
              <Panel
                style={{ border: '0px' }}
                showArrow={false}
                header={
                  <PanelHeader
                    style={{ paddingLeft: '0px' }}
                    title={intl
                      .get('spfmhk.dict.view.selectjudge.qualifiedjudge')
                      .d('资格评委抽取')}
                    arrowActive={childActiveKey.includes('judgesList1')}
                    buttons={
                      <>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontWeight: 'lighter' }}>
                            {intl.get(`${prompt}.view.field.judge.num`).d('评委人数')}
                          </span>
                        </div>
                        <CusButton mini>{qualPartnerNum}</CusButton>
                        <CusButton mini onClick={() => this.handleExport({ judgeType: 'qualify' })}>
                          {intl.get(`${prompt}.view.file.title.export`).d('导出')}
                        </CusButton>
                        <CusButton
                          mini
                          onClick={() => this.handleJudgePartner({ judgeType: 'qualify' })}
                        >
                          {intl.get(`${prompt}.view.field.title.extract`).d('抽取')}
                        </CusButton>
                      </>
                    }
                  />
                }
                bordered={false}
                key="judgesList1"
              >
                <JudgesList {...JudgesListProps1}></JudgesList>
              </Panel>

              <Divider style={{ margin: '0px' }}></Divider>
              <Panel
                style={{ border: '0px' }}
                showArrow={false}
                header={
                  <PanelHeader
                    style={{ paddingLeft: '0px' }}
                    title={intl
                      .get('spfmhk.dict.view.selectjudge.technicaljudge')
                      .d('技术评委抽取')}
                    arrowActive={childActiveKey.includes('judgesList2')}
                    buttons={
                      <>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontWeight: 'lighter' }}>
                            {intl.get(`${prompt}.view.field.judge.num`).d('评委人数')}
                          </span>
                        </div>
                        <CusButton mini>{techPartnerNum}</CusButton>
                        <CusButton mini onClick={() => this.handleExport({ judgeType: 'tech' })}>
                          {intl.get(`${prompt}.view.file.title.export`).d('导出')}
                        </CusButton>
                        <CusButton
                          mini
                          onClick={() => this.handleJudgePartner({ judgeType: 'tech' })}
                        >
                          {intl.get(`${prompt}.view.field.title.extract`).d('抽取')}
                        </CusButton>
                      </>
                    }
                  />
                }
                bordered={false}
                key="judgesList2"
              >
                <JudgesList {...JudgesListProps2}></JudgesList>
              </Panel>
            </Collapse>
          </Panel>
        </Collapse>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
          <CusButton type="primary" onClick={this.handleApproval} loading={loading}>
            {intl.get('spfmhk.dict.view.selectjudge.initiatereviewprocess').d('发起审批流程')}
          </CusButton>
        </div>
      </PageWrapper>
    );
  }
}
