import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import styles from './index.less';
import { numberRender } from 'utils/renderer';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import UploadList from '../../../../../srm-front-po-hk/src/components/uploadList';

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
    const { onRef } = this.props;

    onRef(this);
    this.state = {
      isShowMore: false,
    };
  }

  form = React.createRef();

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.form.current?.resetFields();
    onSearch();
  }

  /**
   * 展开高级查询
   * @function handleShowMore
   */
  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  render() {
    const uploadProps = {
      filePreview: true,
      bucketName: 'private-bucket',
      bucketDirectory: 'srsp-receivePayment',
      tenantId: getCurrentOrganizationId(),
    };
    const { isShowMore } = this.state;
    const { idpValueMap = {}, onSearch = (e) => e, purchaseResultModel, form, projectInfo } = this.props;
    // console.log(idpValueMap['HKPC.PRRECORDSSTATUS'],'6666666');
    // console.log(idpValueMap['HKPC.PURCHASINGCATEGORY'],'8888888');
    const { fourthHead, paStatusYB, fourthPackageList } = purchaseResultModel;
    const [ { purchaseType } = {} ] = fourthPackageList;
    const { getFieldDecorator } = form;
    const formLayout = this.computeFormLayout();
    return (
      <div className={styles['out-ant-input']}>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={true}>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.PAName`).d('采购结果名称')}
              >
                {getFieldDecorator('paName', {
                  initialValue: fourthHead?.prPlanName,
                })(
                  <Input
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.PAnumber`).d('采购结果编号')}>
                {getFieldDecorator('paNumber', {
                  initialValue: fourthHead?.paNumber,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PACurrency`).d('结果币种')}
              >
                {getFieldDecorator('paCurrency', {
                  initialValue: fourthHead?.paCurrency,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            {/* <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.PAStatus`).d('采购结果状态')}>
                {getFieldDecorator('paStatus', {
                  initialValue: idpValueMap['HKPC.PRRECORDSSTATUS']?.find(
                    (item) => item.value == fourthHead?.paStatus
                  )?.meaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            {/* <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.PARate`).d('结果汇率')}>
                {getFieldDecorator('paRate', {
                  initialValue: fourthHead?.paRate,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.compareammount`).d('初始报价')}
                name="projectComparisonAmount"
              >
                {getFieldDecorator('projectComparisonAmount', {
                  initialValue: numberRender(fourthHead?.projectComparisonAmount, 2),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PAAmountH`).d('采购结果金额(HKD)')}
                name="paAmountHkd"
              >
                {getFieldDecorator('paAmountHkd', {
                  initialValue: numberRender(fourthHead?.paAmountHkd, 2),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.savingrate`).d('节省比例(%)')}
                name="ratio"
              >
                {getFieldDecorator('ratio', {
                  initialValue:
                  (fourthHead.projectComparisonAmount && fourthHead.paAmountHkd) ?
                  `${(((fourthHead.projectComparisonAmount - fourthHead.paAmountHkd) / fourthHead.projectComparisonAmount) * 100).toFixed(2)}%`
                  : '',
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.SuggestedProcurementMethod`).d('采购方式')}
              >
                {getFieldDecorator('purchaseType', {
                  initialValue: purchaseType,
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={idpValueMap['BID.PROCUREMENT_METHOD']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.subcontractingexists`).d('是否分标包')}
              >
                {getFieldDecorator('procurementHandler', {
                  initialValue: fourthHead?.whetherPackage == 'YES' ? intl.get(`${promptCode}.view.title.yes`).d('是') : intl.get(`${promptCode}.view.title.no`).d('否'),
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.WinningSupplier`).d('中选供应商')}
                name="winSupplier"
              >
                {getFieldDecorator('winSupplier', {
                  initialValue: fourthHead?.winSupplier,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col sapn={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.decisionresult`).d('决策结果')}
                name="decisionResult"
              >
                {getFieldDecorator('decisionResult', {
                  initialValue: fourthHead?.decisionResult,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`${promptCode}.view.title.decisionresult`).d('决策结果'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procuremrntremark`).d('采购意见')}
                name="comments"
              >
                {getFieldDecorator('comments', {
                  initialValue: fourthHead?.comments,
                })(
                  <CusInput.TextArea
                    disabled
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`hzero.common.upload.modal.title`).d('附件')}
                name='uuid'
              >
                <UploadList
                  viewOnly={true}
                  multiple={true}
                  bucketName={fourthHead?.decisionType ? 'bidding' : 'pr-apply'}
                  tenantId={getCurrentOrganizationId()}
                  showUploadList={{
                    removePopConfirmTitle: intl
                      .get('hzero.common.message.confirm.delete')
                      .d('是否删除此条记录？'),
                    showRemoveIcon: true,
                  }}
                  filePreview
                  attachmentUUID={projectInfo?.uuid}
                  setLoading={(uploading = false) => {
                    this.setState({
                      uploading,
                    });
                  }}
                />
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
              >
                {getFieldDecorator('procurementHandler', {
                  initialValue: fourthHead?.procurementHandlerName,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            {/* <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prcategory`).d('采购类别')}
                name="purchasingCategory"
              >
                {getFieldDecorator('purchasingCategory', {
                  initialValue: idpValueMap['HKPC.PURCHASINGCATEGORY']?.find(
                    (item) => item?.value === fourthHead?.purchasingCategory
                  )?.meaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
