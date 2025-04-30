import React from 'react';
import intl from 'utils/intl';
import { Form, Col, Input } from 'antd';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import CusUpload from '../../../components/CusUpload';
import { getLFormGridSpan } from '_cus_utils/utils';
import CusInput from '_cus_components/CusInput';

const gridSpan = getLFormGridSpan();

export default class DetailList extends React.PureComponent {

  form = React.createRef();

  constructor(props) {
    super(props);
  }

  render() {
    const {
      idpValueMap,
      CollaborationCaseModal,
      readyOnly = false,
      fileList,
      beforUpload = (e) => e,
      basicForm,
      fileUuid
    } = this.props;

    const {
      // productDetailSource,
      productDetailPagination,
    } = CollaborationCaseModal;

    const productDetailSource = [{
      productCode: '1'
    }]

    console.log('productDetailSource', fileList);


    return (
      <>
        <div className="customize-form">
          <Col span={24}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.cooperate.case.title`).d('案例标题')}
              name='caseTitle'
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfmhk.mylink.field.cooperate.case.title`).d('案例标题'),
                  })
                },
              ]}
            >
              <Input disabled={readyOnly} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.cooperate.case.descri`).d('案例描述')}
              name='caseDescription'
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfmhk.mylink.field.cooperate.case.descri`).d('案例描述'),
                  })
                },
              ]}
            >
              <CusInput.TextArea
                      rows={3}
                      autoSize={{ minRows: 3, maxRows: 3 }}
                      maxLength={360}
                      disabled={readyOnly}
                      showCharacter
                    />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.cooperate.case.pdf`).d('案例PDF')}
              name='fileList'
              // rules={[
              //   {
              //     required: true,
              //     message: intl.get('hzero.common.validation.notNull', {
              //       name: intl.get(`spfmhk.mylink.field.cooperate.case.pdf`).d('案例PDF'),
              //     })
              //   },
              // ]}
            >
              <CusUpload
                filePreview
                bucketName="mylink"
                tenantId={getCurrentOrganizationId()}
                fileType='application/pdf'
                type='PDF'
                viewOnly={fileList.length > 0 || readyOnly}
                readyOnly={ readyOnly }
                attachmentUUID={fileUuid}
                multiple={false}
                btnText={fileList.length > 0 ? intl.get(`hzero.common.uploadFile.view.checkFile`).d('查看文件') : intl.get(`hzero.common.uploadFile.view.uploadFile`).d('上传文件')}
                removeCallback={() => {
                  beforUpload({
                    tenantId: getCurrentOrganizationId(),
                    bucketName: "mylink",
                    attachmentUUID: fileUuid,
                  })
                }}
                uploadSuccess={() => {
                  beforUpload({
                    tenantId: getCurrentOrganizationId(),
                    bucketName: "mylink",
                    attachmentUUID: fileUuid,
                  })
                }}
              />
            </Form.Item>
          </Col>
          <div style={{ display: 'none' }}>
          <Col>
            <Form.Item
              name='caseDescriptionList'
            >
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.effective.not`).d('是否生效')}
              name='caseTitleList'
              initialValue={'Effective'}
            >
            </Form.Item>
          </Col>
        </div>
        </div>
      </>
    );
  }
}
