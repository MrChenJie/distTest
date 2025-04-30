import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col } from 'antd';
import { getCurrentOrganizationId, getCurrentUser, getDateFormat, getAccessToken, tableScrollWidth } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusTable from '_cus_components/CusTable';
import CusSelect from '_cus_components/CusSelect';
import CusInputNumber from '_cus_components/CusInputNumber';
import UploadTable from './UploadTable';
import styles from './index.less';
import CusUpload from '_cus_components/CusUpload';
import dayjs from 'dayjs';
import { Form } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import { round } from 'lodash';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();
export default class SearchApplication extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      isShowMore: false,
      tenantId: getCurrentOrganizationId(),
      canSelected: true,
      packUp: false,
    };
  }

  @Form.create()
  componentDidMount() {}

  // 上传文件
  @Bind()
  getFileList(fileList) {
    const { dispatch } = this.props;
    dispatch({
      type: 'frameSubOrderModel/commentUpdateState',
      payload: {
        fileSource: fileList,
      },
    });
  }

  onUploadSuccess = (record) => {
    const { form } = this.props;
    form.setFieldsValue({ files: record });
  };

  /**
   * @description 批量删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    this.ChildRef?.handleDelete();
  }

  @Bind()
  goToErpPage(frameId) {
    const { ERP_HOST } = process.env;
    const url = `${ERP_HOST}/root/po/purchaseFrame/info?frame_id=${frameId}`;
    window.open(url, '_blank');
  }

  render() {
    const { tenantId, canSelected, packUp } = this.state;
    const {
      form,
      related,
      prType,
      language,
      dispatch,
      infomation,
      idpValueMap,
      frameSubOrderModel,
      fileDataSource = [],
      handleSearchRate = (e) => e,
      handleFrameWork = (e) => e,
    } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const { fileSource, demander, demanderPhone, demanderDepartment } = frameSubOrderModel;
    const prApplyAttachmentList = fileSource;
    const uploadProps = {
      dispatch,
      frameSubOrderModel,
      prApplyAttachmentList,
      attachmentSource: [],
      fileSource,
      infomation,
    };
    // 项目名称
    const projectName = form.getFieldsValue().projectName;
    // 项目ID
    const projectCode = form.getFieldsValue().projectCode;
    const columns = [
      {
        title: intl.get(`hzero.common.table.column.fileName`).d('附件名'),
        dataIndex: 'fileName',
        width: 160,
      },
      {
        title: intl.get(`hzero.common.uploadFile.view.uploadTimeNew`).d('上传时间'),
        dataIndex: 'creationDate',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.table.column.option`).d('操作'),
        dataIndex: 'operation',
        width: 120,
        render: (_, record) => {
          const url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/decrypt-download-ext?access_token=${getAccessToken()}&bucketName=spfm-comp&url=${encodeURIComponent(record.fileUrl)}`;
          return (
            <>
              <CusButton type="plain">
                <a href={url} target="_blank">{intl.get(`hzero.common.button.download`).d('下载')}</a>
              </CusButton>
              <CusButton
                type="plain"
                style={{ marginLeft: '16px' }}
                onClick={() => {
                  const { OOS_HOST } = process.env;
                  const onlineApi = `${OOS_HOST}?file=`;
                  const api = encodeURIComponent(
                    `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/decrypt-download-ext?access_token=${getAccessToken()}&bucketName=spfm-comp&url=${encodeURIComponent(record.fileUrl)}`
                  );
                  window.open(`${onlineApi}${api}`)
                  }
                }
              >
                {intl.get(`hzero.common.button.preview`).d('预览')}
              </CusButton>
            </>
          );
        },
      },
    ];
    return (
      <div className={styles['out-ant-input']}>
        <Form className="customize-form" ref={this.searchForm}>
          {/* <GenerateFormGrid isPackUp={true}> */}
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}>
              {getFieldDecorator('prName', {
                initialValue: infomation?.prName,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}>
              {getFieldDecorator('prNumber', {
                initialValue: infomation?.prNumber,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}>
              {getFieldDecorator('applicantUserName', {
                initialValue: infomation?.applicantUserName,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.prstatus`).d('申请状态')}>
              {getFieldDecorator('prStatus', {
                initialValue: infomation?.prStatus != '' ? infomation?.prStatus : 'PENDING_REFER',
              })(<CusSelect options={idpValueMap['HKPC.PRRECORDSSTATUS']} disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.applyingdepartment`).d('申请人部门')}
            >
              {getFieldDecorator('applyingDepartmentName', {
                initialValue: infomation?.applyingDepartmentName,
              })(
                <CusLov
                  disabled
                  textValue={infomation?.applyingDepartmentName}
                  textField={infomation?.applyingDepartmentName}
                  code="CMHK_USER_DEPT"
                  queryParams={{ tenantId, userId: getCurrentUser().id, lang: language }}
                  lovOptions={{ displayField: 'unitName', valueField: 'unitId' }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.prdate`).d('申请日期')}>
              {getFieldDecorator('applyingDate', {
                initialValue: infomation.applyingDate
                  ? dayjs(infomation.applyingDate).format('YYYY-MM-DD')
                  : dayjs().format('YYYY-MM-DD'),
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.requester`).d('需求人')}>
              {getFieldDecorator('applyUserName', {
                initialValue: demander ? demander : infomation?.applyUserName,
              })(
                <CusLov
                  disabled
                  textValue={demander ? demander : infomation?.applyUserName}
                  textField={demander ? demander : infomation?.applyUserName}
                  code="CMHK.EMPLOYEEUNIT"
                  queryParams={{ tenantId, lang: language }}
                  lovOptions={{ displayField: 'realName', valueField: 'realName' }}
                  // form={this.form.current}
                  tip={
                    related == '0'
                      ? intl.get(`${promptCode}.view.title.selectprojectname`).d('请先选择项目名称')
                      : null
                  }
                  onChange={(_, lovData) => {
                    infomation.applyUserId = lovData.userId;
                    infomation.applyUserDepId = lovData.unitId;
                    dispatch({
                      type: 'frameSubOrderModel/commentUpdateState',
                      payload: {
                        infomation: infomation,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.requestertel`).d('需求人电话')}>
              {getFieldDecorator('applyUserPhone', {
                initialValue: demanderPhone ? demanderPhone : infomation?.applyUserPhone,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门')}
            >
              {getFieldDecorator('applyUserDepName', {
                initialValue: demanderDepartment
                  ? demanderDepartment
                  : infomation?.applyUserDepName,
              })(
                <CusLov
                  disabled
                  textValue={demanderDepartment ? demanderDepartment : infomation?.applyUserDepName}
                  textField={demanderDepartment ? demanderDepartment : infomation?.applyUserDepName}
                  code="CMHK.EMPLOYEEUNITDEPT"
                  queryParams={{ tenantId, lang: language }}
                  lovOptions={{ displayField: 'unitName', valueField: 'unitName' }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.title.ettimatedbudgetamountO`)
                .d('预估总金额(原币)')}
              name="estimatedBudgetAmount"
            >
              {getFieldDecorator('estimatedBudgetAmount', {
                initialValue: infomation?.estimatedBudgetAmount
                  ? numberRender(infomation?.estimatedBudgetAmount, 2)
                  : numberRender(
                      round(infomation?.estimatedBudgetAmountHkd / Number(infomation?.prRate), 2),
                      2
                    ),
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          {/* <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.prcurrency`).d('币种')}>
              {getFieldDecorator('currency', {
                initialValue: infomation?.currency,
              })(
                <CusLov
                  disabled
                  textValue={infomation?.currency}
                  textField={infomation?.currency}
                  code="CMHKHPFM.CURRENCY"
                  lovOptions={{ displayField: 'currencyCode', valueField: 'currencyCode' }}
                  // form={this.form.current}
                  onChange={(val, lovData) => {
                    handleSearchRate(val);
                  }}
                />
              )}
            </Form.Item>
          </Col> */}
          {/* <Col {...gridSpan}>
            <Form.Item
              name="estimatedBudgetAmountHkd"
              label={intl.get(`${promptCode}.model.label`).d('预估总金额(HKD)')}
            >
              {getFieldDecorator('estimatedBudgetAmountHkd', {
                initialValue: infomation?.estimatedBudgetAmountHkd
                  ? numberRender(infomation?.estimatedBudgetAmountHkd, 2)
                  : numberRender(0, 2),
              })(<CusInput disabled />)}
            </Form.Item>
          </Col> */}
          {/* <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.prrate`).d('申请汇率')}>
              {getFieldDecorator('prRate', {
                initialValue: infomation?.prRate,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col> */}
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型')}>
              {getFieldDecorator('prType', {
                initialValue: prType ? prType : infomation?.prType,
              })(<CusSelect options={idpValueMap['HKPC.PRTYPE']} disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.title.AssociatedFrameworkAgreement`)
                .d('关联框架协议')}
            >
              {getFieldDecorator('associatedAgreement', {
                initialValue: infomation?.associatedAgreementName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.label`).d('关联框架协议'),
                    }),
                  },
                ],
              })(
                <>
                  <CusInput disabled />
                  <a
                    onClick={() => this.goToErpPage(infomation?.frameId)}
                    className={styles['outer-link']}
                  >
                    {infomation?.associatedAgreementName}
                  </a>
                </>
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.UnitPriceControlOrNot`).d('是否单价限制')}
            >
              {getFieldDecorator('unitPriceControl', {
                initialValue: infomation?.unitPriceControl,
              })(<CusSelect options={idpValueMap['HKPC.RELATEDTOPROJECT']} disabled />)}
            </Form.Item>
          </Col>
          <div style={{ display: packUp ? 'none' : '' }}>
            <Col span={24}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prreason`).d('采购原因')}
              >
                {getFieldDecorator('prReason', {
                  initialValue: infomation?.prReason,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prreason`).d('采购原因'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    rows={3}
                    autosize={{ minRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prrequirment`).d('采购需求')}
              >
                {getFieldDecorator('prReq', {
                  initialValue: infomation?.prReq,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prrequirment`).d('采购需求'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    rows={3}
                    autosize={{ minRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.applicantremarkpc`)
                  .d('需求部门给采购的备注')}
              >
                {getFieldDecorator('prBakup', {
                  initialValue: infomation?.prBakup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.applicantremarkpc`)
                          .d('需求部门给采购的备注'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    rows={3}
                    autosize={{ minRows: 3, maxRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.applicantremarks`)
                  .d('需求部门给供应商的备注')}
              >
                {getFieldDecorator('supBakup', {
                  initialValue: infomation?.supBakup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.applicantremarks`)
                          .d('需求部门给供应商的备注'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    rows={3}
                    autosize={{ minRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}>
                {/* {getFieldDecorator('attachUuid', {
                  initialValue: infomation?.attachUuid,
                })(
                  <CusUpload
                    filePreview
                    bucketName="spfm-comp"
                    tenantId={getCurrentOrganizationId()}
                    viewOnly
                    attachmentUUID={infomation?.attachUuid}
                    isEncrypt
                  />
                )} */}
                  <CusTable
                    columns={columns}
                    dataSource={fileDataSource}
                    scroll={{x: tableScrollWidth(columns)}}
                  />
              </Form.Item>
            </Col>
            {/* <Col span={24}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prplan`).d('建议采购计划')}>
                {getFieldDecorator('prSuggestion', {
                  initialValue: infomation?.prSuggestion,
                })(
                  <CusInput.TextArea
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    rows={3}
                    autosize={{ minRows: 3 }}
                  />
                )}
              </Form.Item>
            </Col> */}
          </div>
          <Col span={24}>
            <div
              style={{
                textAlign: 'right',
                marginTop: '-8px',
                marginBottom: '8px',
                marginRight: '-4px',
              }}
            >
              <CusButton
                type="plain"
                onClick={() => {
                  this.setState({ packUp: !packUp });
                }}
              >
                {packUp
                  ? intl.get('hzero.common.button.unfold').d('展开')
                  : intl.get('hzero.common.button.packUp').d('收起')}
              </CusButton>
            </div>
          </Col>
          {/* <Col span={24} style={{ padding: '16px 0 16px 16px' }}>
              <Form.Item>
                <Row style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#646a73' }}>附件</span>
                  </Col>
                  {infomation.prStatus != 'PENDING_REFER' && infomation.prStatus != '' ? (
                    <Col span={12}></Col>
                  ) : (
                    <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <CusButton onClick={this.handleDetele} mini>
                        批量删除
                      </CusButton>
                      <CusUpload getfileList={this.getFileList.bind(this)} />
                    </Col>
                  )}
                </Row>
                <Row style={{ marginTop: '16px' }}>
                  <Col>
                    <UploadTable onRef={(node) => (this.ChildRef = node)} {...uploadProps} />
                  </Col>
                </Row>
              </Form.Item>
            </Col> */}
          {/* </GenerateFormGrid> */}
        </Form>
      </div>
    );
  }
}
