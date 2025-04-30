import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input, Row } from 'antd';
import { getCurrentOrganizationId, getCurrentUser, getCurrentLanguage, getDateFormat, getAccessToken, tableScrollWidth } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusTable from '_cus_components/CusTable';
import CusSelect from '_cus_components/CusSelect';
import UploadTable from './UploadTable';
import styles from './index.less';
import CusUpload from '_cus_components/CusUpload';
import uuidv4 from 'uuid/v4';
import dayjs from 'dayjs';
import queryString from 'querystring';
import { Form, InputNumber } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import { round } from 'lodash';
import { largeScreenWidth } from '_cus_utils/constants';
import UploadList from '@/components/uploadList';

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
      lineNum: window.innerWidth >= largeScreenWidth ? 8 : 10,
      stateAttachmentUUID: uuidv4(),
    };
  }

  @Form.create()
  componentDidMount() {
    window.addEventListener('resize', this.computeChunkSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.computeChunkSize);
  }

  @Bind()
  computeChunkSize() {
    this.setState({
      lineNum: window.innerWidth >= largeScreenWidth ? 8 : 10
    });
  }

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
    const { tenantId, lineNum, stateAttachmentUUID } = this.state;
    const {
      location: { search },
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
    const { activityCode } = queryString.parse(search.substr(1)) || {};
    const { getFieldDecorator, setFieldsValue } = form;
    const {
      fileSource,
      demander,
      demanderPhone,
      demanderDepartment,
      demanderId,
      demanderDepartmentId,
      projectNumber,
    } = frameSubOrderModel;
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

    const { permissionType } = queryString.parse(search.substring(1));
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
          <GenerateFormGrid isPackUp={true} defaultPackUp={permissionType !== 'SEND'} showLine={lineNum}>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
              >
                {getFieldDecorator('prName', {
                  initialValue: infomation?.prName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prname`).d('采购申请名称'),
                      }),
                    },
                  ],
                })(
                  <Input
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}>
                {getFieldDecorator('prNumber', {
                  initialValue: infomation?.prNumber,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
              >
                {getFieldDecorator('applicantUserName', {
                  initialValue: infomation?.applicantUserName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.applicant`).d('申请人'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
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
                required
                label={intl.get(`${promptCode}.view.title.applyingdepartment`).d('申请人部门')}
              >
                {getFieldDecorator('applyingDepartmentName', {
                  initialValue: infomation?.applyingDepartmentName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.applyingdepartment`)
                          .d('申请人部门'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    textValue={infomation?.applyingDepartmentName}
                    textField={infomation?.applyingDepartmentName}
                    code="CMHK_USER_DEPT"
                    queryParams={{ tenantId, userId: getCurrentUser().id, lang: language }}
                    lovOptions={{ displayField: 'unitName', valueField: 'unitId' }}
                    onChange={(_, lovData) => {}}
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
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.requester`).d('需求人')}
              >
                {getFieldDecorator('applyUserName', {
                  initialValue:
                    (demander ? demander : infomation?.applyUserName) || getCurrentUser().realName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.requester`).d('需求人'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={
                      (!projectName && related == '0') ||
                      (infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true)
                    }
                    textValue={
                      (demander ? demander : infomation?.applyUserName) || getCurrentUser().realName
                    }
                    textField={
                      (demander ? demander : infomation?.applyUserName) || getCurrentUser().realName
                    }
                    code="CMHK.EMPLOYEEUNIT"
                    queryParams={{
                      tenantId,
                      lang: language,
                      isProject: related,
                      projectCode: projectNumber,
                    }}
                    lovOptions={{ displayField: 'realName', valueField: 'realName' }}
                    // form={this.form.current}
                    tip={
                      related == '0'
                        ? intl
                            .get(`${promptCode}.view.title.selectprojectname`)
                            .d('请先选择项目名称')
                        : null
                    }
                    onChange={(_, lovData) => {
                      form.resetFields()
                      infomation.applyUserName = lovData.realName;
                      infomation.applyUserId = lovData.userId;
                      infomation.applyUserDepId = lovData.unitId;
                      infomation.applyUserPhone = lovData.phone;
                      infomation.applyUserDepName = lovData.unitName;
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
                  initialValue:
                    (demanderPhone ? demanderPhone : infomation?.applyUserPhone) ||
                    getCurrentUser().phone,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门')}
              >
                {getFieldDecorator('applyUserDepName', {
                  initialValue:
                    (demanderDepartment ? demanderDepartment : infomation?.applyUserDepName) ||
                    infomation?.applyingDepartmentName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.requesterdepartment`)
                          .d('需求人部门'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    textValue={
                      (demanderDepartment ? demanderDepartment : infomation?.applyUserDepName) ||
                      infomation?.applyingDepartmentName
                    }
                    textField={
                      (demanderDepartment ? demanderDepartment : infomation?.applyUserDepName) ||
                      infomation?.applyingDepartmentName
                    }
                    code="CMHK.EMPLOYEEUNITDEPT"
                    queryParams={{ tenantId, lang: language }}
                    lovOptions={{ displayField: 'unitName', valueField: 'unitName' }}
                    onChange={(_, lovData) => {}}
                  />
                )}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
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
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            {/* <Col {...gridSpan}>
              <Form.Item required label={intl.get(`${promptCode}.view.title.prcurrency`).d('币种')}>
                {getFieldDecorator('currency', {
                  initialValue: infomation?.currency,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prcurrency`).d('币种'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
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
            <Col {...gridSpan}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.ettimatedbudgetamountH`)
                  .d('预估总金额(HKD)')}
              >
                {getFieldDecorator('estimatedBudgetAmountHkd', {
                  initialValue: infomation?.estimatedBudgetAmountHkd,
                })(
                  <InputNumber
                    allowThousandth
                    precision={4}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prrate`).d('申请汇率')}>
                {getFieldDecorator('prRate', {
                  initialValue: infomation?.prRate,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型')}>
                {getFieldDecorator('prType', {
                  initialValue: prType ? prType : infomation?.prType,
                })(<CusSelect options={idpValueMap['HKPC.PRTYPE']} disabled />)}
              </Form.Item>
            </Col>
            {infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == '' ? (
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl
                    .get(`${promptCode}.view.title.AssociatedFrameworkAgreement`)
                    .d('关联框架协议')}
                >
                  {
                    getFieldDecorator('associatedAgreement', {
                      initialValue: infomation?.associatedAgreement,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.view.title.AssociatedFrameworkAgreement`)
                              .d('关联框架协议'),
                          }),
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (related === '0') {
                              if (infomation?.projectNum) {
                                if (infomation?.projectNum === infomation?.projectCode) {
                                  callback();
                                } else {
                                  callback(
                                    new Error(
                                      intl
                                        .get('HKPC.commom.bid.message.checkproject')
                                        .d('请确认框架协议关联的项目与所选项目是否一致')
                                    )
                                  );
                                }
                              } else {
                                callback();
                              }
                            } else {
                              callback();
                            }
                          },
                        },
                      ],
                    })(
                      <CusLov
                        disabled={
                          infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                            ? false
                            : true
                        }
                        textValue={infomation?.associatedAgreementName}
                        textField={infomation?.associatedAgreementName}
                        code="CMHK.API.FRAME"
                        lovOptions={{
                          displayField: 'frameworkTitle',
                          valueField: 'frameworkCode',
                        }}
                        // 不需要过滤条件
                        // queryParams={{ projectCode: projectCode }}
                        onChange={(val, data) => {
                          console.log(data, 'data');
                          // 判断是否单价限制
                          handleFrameWork(
                            data.frameworkCode,
                            data.ebs,
                            data.companyNameEn ? data.companyNameEn : data.companyNameCh,
                            data.prType,
                            data.unitPriceControl
                          );
                          if (data.prType == '' || data.prType == undefined) {
                            this.setState({
                              canSelected: false,
                            });
                          } else {
                            this.setState({
                              canSelected: true,
                            });
                            setFieldsValue({
                              purchasingCategory: data.prType,
                            });
                          }
                          setFieldsValue({
                            currency: data.currency,
                            prRate: data.exchangeRate,
                          });
                          infomation.frameworkPrType = data.prType;
                          infomation.frameworkCode = data.frameworkCode;
                          infomation.associatedAgreement = data.frameworkCode;
                          infomation.projectNum = data.projectNumber; // projectNum用于校验选中的项目编码是否正确
                          infomation.companyName = data.companyNameEn ? data.companyNameEn : data.companyNameCh;
                          infomation.currency = data.currency;
                          infomation.prRate = data.exchangeRate;
                          dispatch({
                            type: 'frameSubOrderModel/commentUpdateState',
                            payload: {
                              infomation: infomation,
                              purchaseApplicationLineSource: [],
                            },
                          });
                        }}
                      />
                    )
                    // infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == '' ? (
                    //   <CusLov
                    //     disabled={
                    //       infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                    //         ? false
                    //         : true
                    //     }
                    //     textValue={infomation?.associatedAgreementName}
                    //     textField={infomation?.associatedAgreementName}
                    //     code="CMHK.API.FRAME"
                    //     lovOptions={{ displayField: 'frameworkTitle', valueField: 'frameworkCode' }}
                    //     // 不需要过滤条件
                    //     // queryParams={{ projectCode: projectCode }}
                    //     onChange={(val, data) => {
                    //       console.log(data, 'data');
                    //       // 判断是否单价限制
                    //       handleFrameWork(
                    //         data.frameworkCode,
                    //         data.ebs,
                    //         data.companyName,
                    //         data.prType,
                    //         data.unitPriceControl
                    //       );
                    //       if (data.prType == '' || data.prType == undefined) {
                    //         this.setState({
                    //           canSelected: false,
                    //         });
                    //       } else {
                    //         this.setState({
                    //           canSelected: true,
                    //         });
                    //         setFieldsValue({
                    //           purchasingCategory: data.prType,
                    //         });
                    //       }
                    //       setFieldsValue({
                    //         currency: data.currency,
                    //         prRate: data.exchangeRate,
                    //       });
                    //       infomation.frameworkPrType = data.prType;
                    //       infomation.frameworkCode = data.frameworkCode;
                    //       infomation.associatedAgreement = data.frameworkCode;
                    //       infomation.projectNum = data.projectNumber; // projectNum用于校验选中的项目编码是否正确
                    //       infomation.companyName = data.companyName;
                    //       infomation.currency = data.currency;
                    //       infomation.prRate = data.exchangeRate;
                    //       dispatch({
                    //         type: 'frameSubOrderModel/commentUpdateState',
                    //         payload: {
                    //           infomation: infomation,
                    //           purchaseApplicationLineSource: [],
                    //         },
                    //       });
                    //     }}
                    //   />
                    // ) : (
                    //   <>
                    //     <Input disabled />
                    //     <a
                    //       onClick={() => this.goToErpPage(infomation?.frameId)}
                    //       className={styles['outer-link']}
                    //     >
                    //       {infomation.associatedAgreementName}
                    //     </a>
                    //   </>
                    // )
                  }
                </Form.Item>
              </Col>
            ) : (
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl
                    .get(`${promptCode}.view.title.AssociatedFrameworkAgreement`)
                    .d('关联框架协议')}
                >
                  {getFieldDecorator('associatedAgreementName', {
                    initialValue: infomation?.associatedAgreementName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.view.title.AssociatedFrameworkAgreement`)
                            .d('关联框架协议'),
                        }),
                      },
                      {
                        validator: (rule, value, callback) => {
                          if (related === '0') {
                            if (infomation?.projectNum) {
                              if (infomation?.projectNum === infomation?.projectCode) {
                                callback();
                              } else {
                                callback(
                                  new Error(
                                    intl
                                      .get('HKPC.commom.bid.message.checkproject')
                                      .d('请确认框架协议关联的项目与所选项目是否一致')
                                  )
                                );
                              }
                            } else {
                              callback();
                            }
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <>
                      <Input disabled />
                      <a
                        onClick={() => this.goToErpPage(infomation?.frameId)}
                        className={styles['outer-link']}
                      >
                        {infomation.associatedAgreementName}
                      </a>
                    </>
                  )}
                </Form.Item>
              </Col>
            )}
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.UnitPriceControlOrNot`).d('是否单价限制')}
              >
                {getFieldDecorator('unitPriceControl', {
                  initialValue: infomation?.unitPriceControl,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.UnitPriceControlOrNot`)
                          .d('是否单价限制'),
                      }),
                    },
                  ],
                })(<CusSelect options={idpValueMap['HKPC.IS_UNIT_PRICE']} disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.venorcategory`).d('采购业务类别')}
              >
                {getFieldDecorator('erpPrType', {
                  initialValue: infomation?.erpPrType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.venorcategory`)
                          .d('采购业务类别'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={idpValueMap['HKPC.VENDOR_CATEGORY']}
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == '' || (infomation.prStatus === 'In_Approval' && activityCode === 'CGJL03')
                        ? false
                        : true
                    }
                  />
                  )}
              </Form.Item>
            </Col>
            {/* {!(infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == '') && <Col span={24}>
              <Form.Item label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}>
                <CusTable
                  columns={columns}
                  dataSource={fileDataSource}
                  scroll={{x: tableScrollWidth(columns)}}
                />
              </Form.Item>
            </Col>} */}
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
                    showCharacter
                    maxLength={500}
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
                    showCharacter
                    maxLength={500}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.applicantremarkpc`)
                  .d('需求部门给采购的备注')}
              >
                {getFieldDecorator('prBakup', {
                  initialValue: infomation?.prBakup,
                })(
                  <CusInput.TextArea
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    rows={3}
                    autosize={{ minRows: 3, maxRows: 3 }}
                    showCharacter
                    maxLength={500}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.applicantremarks`)
                  .d('需求部门给供应商的备注')}
              >
                {getFieldDecorator('supBakup', {
                  initialValue: infomation?.supBakup,
                })(
                  <CusInput.TextArea
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    rows={3}
                    autosize={{ minRows: 3 }}
                    showCharacter
                    maxLength={500}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}>
                {getFieldDecorator('attachUuid', {
                  initialValue: infomation?.attachUuid,
                })(
                  <UploadList
                    viewOnly={infomation.prStatus != 'PENDING_REFER' && infomation.prStatus != '' && (infomation.prStatus === 'In_Approval' && ['CGY04', 'CGJL03'].includes(activityCode) ? false : true)}
                    multiple={true}
                    bucketName='spfm-comp'
                    tenantId={getCurrentOrganizationId()}
                    showUploadList={{
                      removePopConfirmTitle: intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？'),
                      showRemoveIcon: !(infomation.prStatus != 'PENDING_REFER' && infomation.prStatus != ''),
                    }}
                    filePreview
                    onUploadSuccess={(file, fileList, attachmentUUID) => {
                      console.log('上传成功', attachmentUUID);
                      this.props.infomation.attachUuid = attachmentUUID;
                    }}
                    attachmentUUID={infomation?.attachUuid || stateAttachmentUUID}
                    setLoading={(uploading = false) => {
                      this.setState({
                        uploading,
                      });
                    }}
                    isTitle={intl.get(`${promptCode}.view.title.attachmentremark`).d('附件说明')}
                  />
                  // <CusUpload
                  //   filePreview
                  //   bucketName="spfm-comp"
                  //   tenantId={getCurrentOrganizationId()}
                  //   viewOnly={infomation.prStatus != 'PENDING_REFER' && infomation.prStatus != ''}
                  //   attachmentUUID={infomation?.attachUuid}
                  //   isEncrypt
                  // />
                )}
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
                    showCharacter
                    maxLength={500}
                  />
                )}
              </Form.Item>
            </Col> */}
            {/* <Col span={24} style={{ padding: '16px 0 16px 16px' }}>
              <Form.Item>
                <Row style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#646a73' }}>{intl.get(`${promptCode}.view.title.Attachment`).d('附件')}</span>
                  </Col>
                  {infomation.prStatus != 'PENDING_REFER' && infomation.prStatus != '' ? (
                    <Col span={12}></Col>
                  ) : (
                    <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            <div style={{ display: 'none' }}>
              <Col>
                <Form.Item label={intl.get(`${promptCode}.view.title.requester`).d('需求人id')}>
                  {getFieldDecorator('applyUserId', {
                    initialValue:
                      (demanderId ? demanderId : infomation?.applyUserId) || getCurrentUser().id,
                  })}
                </Form.Item>
              </Col>
            </div>
            <div style={{ display: 'none' }}>
              <Col>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门Id')}
                >
                  {getFieldDecorator('applyUserDepId', {
                    initialValue:
                      (demanderDepartmentId ? demanderDepartmentId : infomation.applyUserDepId) ||
                      infomation.applyingDepartmentId,
                  })}
                </Form.Item>
              </Col>
            </div>
            {!(infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == '') && (
              <div style={{ display: 'none' }}>
                <Col {...gridSpan}>
                  <Form.Item
                    required
                    label={intl
                      .get(`${promptCode}.view.title.AssociatedFrameworkAgreement`)
                      .d('关联框架协议')}
                  >
                    {getFieldDecorator('associatedAgreement', {
                      initialValue: infomation?.associatedAgreement,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
              </div>
            )}
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
