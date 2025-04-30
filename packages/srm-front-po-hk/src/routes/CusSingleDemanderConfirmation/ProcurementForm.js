import React from 'react';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusSelect from '_cus_components/CusSelect';
import UploadList from '@/components/uploadList';
import {
  getCurrentOrganizationId,
  getCurrentUser
} from 'utils/utils';
import CusInput from '_cus_components/CusInput';

const gridSpan = getDFormGridSpan();
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { loginName } = currentUser;

export default class ProcurementForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.baseForm = React.createRef();
    props?.onRef(this);
  }

  componentDidMount() {
    // 在页面加载时清除 sessionStorage 中的数据
    sessionStorage.removeItem('demandDepartmentRemark');
   }

  render() {
    const { isEdit, singlePurchaseApplicationCusModel } = this.props;
    const { priceBasicInfo } = singlePurchaseApplicationCusModel;
    const getSessionRemark = sessionStorage.getItem('demandDepartmentRemark');
    this.baseForm.current?.setFieldsValue({
      ...priceBasicInfo,
      demandDepartmentRemark: getSessionRemark ? JSON.parse(getSessionRemark) : priceBasicInfo?.demandDepartmentRemark
    });

    return (
      <>
        <Form className='customize-form' ref={this.baseForm}>
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.Projectnumber`).d('项目编码')}
                name='projectNumber'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
                name='projectName'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PackageName`).d('标包名称')}
                name='rqName'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
                name='rqNumber'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}
                name='prNumber'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
                name='prName'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
                name='applicant'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.applyingdepartment`).d('申请人部门')}
                name='applicantDept'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额（HKD）')}
                name='numberRenderEstimatedHKD'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prcurrency`).d('币种')}
                name='currency'
              >
                <Input disabled />
              </Form.Item>
            </Col> */}
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                name='procurementHandler'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.RQrate`).d('询价汇率')}
                name='rqRate'
              >
                <Input disabled />
              </Form.Item>
            </Col> */}
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式')}
                name='procurementMethod'
              >
                <CusSelect
                  lovCode="BID.PROCUREMENT_METHOD"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.CapexBudgetAmountHKD`).d('Capex预算金额(HKD)')}
                name='capexBudgetAmountHkd'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.NumberofSuccessfulBidders`).d('中标人数')}
                name='winingBidderNumber'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.OpexBudgetAmountHKD`).d('Opex预算金额(HKD)')}
                name='opexBudgetAmountHkd'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.padraftremark`).d('需求部门备注')}
                name='demandDepartmentRemark'
              >
                <CusInput.TextArea
                  style={{height: 'auto'}}
                  disabled={isEdit}
                  showCharacter
                  maxLength={500}
                  rows={3}
                  onChange={(e) => {
                    this.baseForm.current?.setFieldsValue({
                      demandDepartmentRemark: e.target.value
                    });
                    sessionStorage.setItem('demandDepartmentRemark', JSON.stringify(e.target.value))
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`hzero.common.upload.modal.title`).d('附件')}
                name='uuid'
              >
                <UploadList
                  viewOnly={isEdit}
                  multiple={true}
                  bucketName='pr-apply'
                  tenantId={getCurrentOrganizationId()}
                  showUploadList={{
                    removePopConfirmTitle: intl
                      .get('hzero.common.message.confirm.delete')
                      .d('是否删除此条记录？'),
                    showRemoveIcon: !isEdit,
                  }}
                  filePreview
                  onUploadSuccess={(file, fileList, attachmentUUID) => {
                    console.log('上传成功', attachmentUUID);
                    this.baseForm.current?.setFieldsValue({
                      uuid: attachmentUUID
                    });
                  }}
                  attachmentUUID={priceBasicInfo?.uuid}
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
                label={intl.get(`${promptCode}.view.title.PAnumber`).d('采购结果编号')}
                name='paNumber'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PAName`).d('采购结果名称')}
                name='paName'
                rules={
                  [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.PAName`).d('采购结果名称'),
                      }),
                    }
                  ]
                }
              >
                <CusInput />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                name='prHandlerName'
              >
                <CusInput disabled />
              </Form.Item>
            </Col> */}
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
