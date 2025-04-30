import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input, Row, Select } from 'antd';
import { Form } from 'hzero-ui';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import UploadTable from './UploadTable2';
import CusSelect from '_cus_components/CusSelect';
import CusTable from '_cus_components/CusTable';
import CusUpload from '_cus_components/CusUpload';
import UploadList from '@/components/uploadList';
import styles from './index.less';
// import CusUpload from '../components/CusUpload'
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();
const ROW_KEY = 'enquiryPriceId';

export default class PlanInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;

    onRef(this);
    this.state = {
      isShowMore: false,
      selectedRows: [],
      selectedRowKeys: [],
      win: '价低者得',
      other: '其他补充说明',
      decision: '依据XXX采购方式向供应商发起采购',
    };
  }

  form = React.createRef();

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    console.log('newSRows', newSRows);
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  @Bind()
  onSelectAll(selected, _, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, ROW_KEY);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  // 将子组件文件信息传递给父组件
  @Bind()
  getFileList(fileList) {
    this.props.getFatherFileList(fileList);
  }

  // 删除
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    this.ChildRef?.handleDelete();
  }

  render() {
    const { selectedRows, selectedRowKeys } = this.state;

    const {
      headFromDataSource,
      form,
      attachDataSource,
      idpValueMap,
      listIntoFlag,
      fileSource,
      dispatch,
      projectDesc,
      prPlan,
      dataSpliceFlag,
      todoFlag,
      delSelectedRows,
      purchasePlan,
    } = this.props;
    const { UUid } = purchasePlan;
    const { getFieldDecorator = (e) => e } = form;

    // console.log(headFromDataSource,"11111111");
    // 如果是待办进入，因为textArea涉及到初始值渲染，但是没触发dataSource的改变
    if (
      dataSpliceFlag &&
      !headFromDataSource?.projectOverview &&
      !headFromDataSource?.winPrinciple &&
      !headFromDataSource?.supplement &&
      !headFromDataSource?.decisionPoint &&
      !headFromDataSource?.prPlanSug
    ) {
      headFromDataSource.projectOverview = projectDesc; //项目概况
      headFromDataSource.winPrinciple = this.state.win; //中选原则
      headFromDataSource.supplement = this.state.other; //其它补充
      headFromDataSource.decisionPoint = this.state.decision; //决策点
      headFromDataSource.prPlanSug = prPlan; //采购实施计划
    }

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };

    const uploadProps = {
      fileSource,
      dispatch,
      // attachDataSource
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.model.label`).d('文件名称'),
        dataIndex: '',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('操作'),
        dataIndex: 'take',
        width: 160,
        render: (val, record) => {
          return (
            <span className="action-link">
              <a style={{ color: '#3271FE' }}>{val}</a>
            </span>
          );
        },
      },
    ];
    return (
      <div className={styles['out-ant-input']}>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.PPname`).d('采购方案名称')}
                name="prPlanName"
              >
                {getFieldDecorator('prPlanName', {
                  initialValue: headFromDataSource?.prPlanName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.PPname`).d('采购方案名称'),
                      }),
                    },
                  ],
                })(
                  <Input
                    disabled={
                      todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft'
                        ? false
                        : true
                    }
                    onBlur={(e) => (headFromDataSource.prPlanName = e.target.value)}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PPnumber`).d('采购方案编号')}
                name="prPlanNum"
              >
                {getFieldDecorator('prPlanNum', {
                  initialValue: headFromDataSource?.prPlanNum,
                })(
                  <>
                    <Input disabled onBlur={(e) => (headFromDataSource.prPlanNum = e.target.value)} />
                    <a
                      onClick={() => {
                        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${headFromDataSource?.caseId}`);
                      }}
                      className={styles['outer-link']}
                    >
                      {headFromDataSource?.prPlanNum}
                    </a>
                  </>
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.SuggestedProcurementMethod`)
                  .d('建议采购方式')}
                name="prPlanWay"
              >
                {getFieldDecorator('prPlanWay', {
                  initialValue: headFromDataSource?.prPlanWay,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.SuggestedProcurementMethod`)
                          .d('建议采购方式'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    disabled={
                      todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft'
                        ? false
                        : true
                    }
                    allowClear
                    onChange={(val) => (headFromDataSource.prPlanWay = val)}
                    popupClassName="customize-select"
                    style={{ width: '100%' }}
                    options={idpValueMap['HKPC.PPPROCUREMENTMETHOD']}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PPStatus`).d('采购方案状态')}
                name="prPlanStatus"
              >
                {getFieldDecorator('prPlanStatus', {
                  initialValue: headFromDataSource?.prPlanStatus,
                })(
                  <CusSelect
                    disabled={true}
                    allowClear
                    onChange={(val) => (headFromDataSource.prPlanStatus = val)}
                    popupClassName="customize-select"
                    style={{ width: '100%' }}
                    options={idpValueMap['HKPC.PPDOCUMENTSTATUS']}
                  />
                )}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.ettimatedbudgetamountO`)
                  .d('预估总金额（原币）')}
                name="estimatedBudgetAmount"
              >
                {getFieldDecorator('estimatedBudgetAmount', {
                  initialValue: numberRender(headFromDataSource?.estimatedBudgetAmount, 2),
                })(
                  <Input
                    disabled
                    onBlur={(e) => (headFromDataSource.estimatedBudgetAmount = e.target.value)}
                  />
                )}
              </Form.Item>
            </Col> */}
            <Col {...gridSpan}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.estimatedBudgetAmountHkd`)
                  .d('预估总金额（HKD）')}
                name="prPlanStatus"
              >
                {getFieldDecorator('estimatedBudgetAmountHkd', {
                  initialValue: numberRender(headFromDataSource?.estimatedBudgetAmountHkd, 2),
                })(
                  <Input
                    disabled
                    onBlur={(e) => (headFromDataSource.estimatedBudgetAmountHkd = e.target.value)}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
              >
                {getFieldDecorator('prDealMan', {
                    initialValue: headFromDataSource?.prDealMan,
                  })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ProjectOverview`).d('项目概况')}
                name="projectOverview"
              >
                {getFieldDecorator('projectOverview', {
                  initialValue:
                    dataSpliceFlag && !headFromDataSource?.projectOverview
                      ? projectDesc
                      : headFromDataSource?.projectOverview,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get(`${promptCode}.view.title.ProjectOverview`).d('项目概况'),
                  //     }),
                  //   },
                  // ],
                })(
                  <CusInput.TextArea
                    disabled={
                      todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft'
                        ? false
                        : true
                    }
                    style={{ height: 'auto' }}
                    onChange={(e) => (headFromDataSource.projectOverview = e.target.value)}
                    rows={24}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.ProcurementImplementationPlan`)
                  .d('采购实施计划')}
                name="prPlanSug"
              >
                {getFieldDecorator('prPlanSug', {
                  // 前者是代办进入名称     后者是列表进入
                  initialValue:
                    dataSpliceFlag && !headFromDataSource?.prPlanSug
                      ? prPlan
                      : headFromDataSource?.prPlanSug,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get(`${promptCode}.view.title.ProcurementImplementationPlan`).d('采购实施计划'),
                  //     }),
                  //   },
                  // ],
                })(
                  <CusInput.TextArea
                    disabled={
                      todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft'
                        ? false
                        : true
                    }
                    onChange={(e) => (headFromDataSource.prPlanSug = e.target.value)}
                    style={{ height: 'auto' }}
                    rows={24}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PrincipleofWinning`).d('中选原则')}
                name="winPrinciple "
              >
                {getFieldDecorator('winPrinciple', {
                  // initialValue: headFromDataSource?.winPrinciple ,
                  initialValue:
                    dataSpliceFlag && !headFromDataSource?.winPrinciple
                      ? this.state.win
                      : headFromDataSource?.winPrinciple,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get(`${promptCode}.view.title.PrincipleofWinning`).d('中选原则'),
                  //     }),
                  //   },
                  // ],
                })(
                  <CusInput.TextArea
                    disabled={
                      todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft'
                        ? false
                        : true
                    }
                    onChange={(e) => (headFromDataSource.winPrinciple = e.target.value)}
                    // placeholder={this.state.win}
                    style={{ height: 'auto' }}
                    rows={24}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.OtherSupplements`).d('其他补充')}
                name="supplement "
              >
                {getFieldDecorator('supplement', {
                  // initialValue: headFromDataSource?.supplement ,
                  initialValue:
                    dataSpliceFlag && !headFromDataSource?.supplement
                      ? this.state.other
                      : headFromDataSource?.supplement,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get(`${promptCode}.view.title.OtherSupplements`).d('其他补充'),
                  //     }),
                  //   },
                  // ],
                })(
                  <CusInput.TextArea
                    disabled={
                      todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft'
                        ? false
                        : true
                    }
                    onChange={(e) => (headFromDataSource.supplement = e.target.value)}
                    // placeholder={this.state.other}
                    style={{ height: 'auto' }}
                    rows={24}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.DecisionPoint`).d('决策点')}
                name="decisionPoint "
              >
                {getFieldDecorator('decisionPoint', {
                  // initialValue: headFromDataSource?.decisionPoint ,'决策点'
                  initialValue:
                    dataSpliceFlag && !headFromDataSource?.decisionPoint
                      ? this.state.decision
                      : headFromDataSource?.decisionPoint,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get(`${promptCode}.view.title.DecisionPoint`).d('决策点'),
                  //     }),
                  //   },
                  // ],
                })(
                  <CusInput.TextArea
                    disabled={
                      todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft'
                        ? false
                        : true
                    }
                    onChange={(e) => (headFromDataSource.decisionPoint = e.target.value)}
                    // placeholder={this.state.decision}
                    style={{ height: 'auto' }}
                    rows={24}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}
                name="attachUuid"
              >
                {getFieldDecorator('attachUuid')(
                  <UploadList
                    viewOnly={true}
                    multiple={true}
                    bucketName='spfm-comp'
                    tenantId={getCurrentOrganizationId()}
                    showUploadList={{
                      removePopConfirmTitle: intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？'),
                      showRemoveIcon: (todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft'),
                    }}
                    filePreview
                    onUploadSuccess={(file, fileList, attachmentUUID) => {
                      console.log('上传成功', attachmentUUID);
                      headFromDataSource.attachUuid = attachmentUUID
                    }}
                    attachmentUUID={headFromDataSource?.attachUuid}
                    setLoading={(uploading = false) => {
                      this.setState({
                        uploading,
                      });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            {/* <Col span={24} style={{ padding: '16px 0 16px 16px' }}> */}
            {/* <Form.Item>
                <Row style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#646a73' }}>附件</span>
                  </Col>
                  <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <CusButton mini>批量删除</CusButton>
                    <CusButton mini type='primary'>上传</CusButton>
                    <CusUpload></CusUpload>
                  </Col>
                </Row>
                <Row style={{ marginTop: '16px' }}>
                  <Col>
                    <CusTable  dataSource={[{take:'操作'}]} pagination={[]} rowSelection={rowSelection} columns={columns}></CusTable>
                  </Col>
                </Row>
              </Form.Item> */}
            {/* <Form.Item> */}
            {/* {
                todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft' ? (<>
                <Row style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#646a73' }}>{
                      intl.get(`${promptCode}.view.title.Attachment`).d('附件')
                    }</span>
                  </Col>
                  <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <CusUpload attachmentUUID={UUid} delSelectedRows={delSelectedRows} lastData = {fileSource} dispatch={this.props.dispatch} getfileList={this.getFileList.bind(this)} />
                  </Col>
                </Row>
                <Row style={{ marginTop: '16px' }}>
                  <Col>
                    <UploadTable getFatherFileList={this.props.getFatherFileList} onRef={node => this.ChildRef = node} {...uploadProps} />
                  </Col>
                </Row>
                </>) : <Row style={{ marginTop: '16px' }}>
                  <Col>
                    <UploadTable onRef={node => this.ChildRef = node} {...uploadProps} />
                  </Col>
                </Row>
              } */}
            {/* </Form.Item> */}
            {/* </Col> */}
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
