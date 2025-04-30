import React from 'react';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getDFormGridSpan } from '_cus_utils/utils';
import { HZERO_FILE } from 'utils/config';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
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
    this.state = {
      fileList: []
    };
    this.baseForm = React.createRef();
    props?.onRef(this);
  }

  /**
   *Ref
   *
   * @param {*} upload
   * @memberof UploadModal
   */
   onRef = (upload) => {
     this.upload = upload;
   }

   componentDidMount() {
    // 在页面加载时清除 sessionStorage 中的数据
    sessionStorage.removeItem('demandDepartmentRemark');
   }

  render() {
    const {
      isEdit,
      dispatch,
      purchaseApplicationCusModel,
    } = this.props;
    const { priceBasicInfo } = purchaseApplicationCusModel;
    const getSessionRemark = sessionStorage.getItem('demandDepartmentRemark');
    console.log('getSessionRemark', getSessionRemark);
    this.baseForm.current?.setFieldsValue({
      ...priceBasicInfo,
      demandDepartmentRemark: getSessionRemark ? JSON.parse(getSessionRemark) : priceBasicInfo?.demandDepartmentRemark
    });
    console.log('priceBasicInfo', priceBasicInfo?.demandDepartmentRemark);

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
                label={intl.get(`${promptCode}.view.title.RQname`).d('询价单名称')}
                name='rqName'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.RQnumber`).d('询价单号')}
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
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.RQrate`).d('询价汇率')}
                name='rqRate'
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
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
