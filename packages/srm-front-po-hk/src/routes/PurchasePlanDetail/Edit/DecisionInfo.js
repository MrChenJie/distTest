/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-06-11 09:47:31
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Form } from 'hzero-ui';
import { Col } from 'antd';
import dayjs from 'dayjs';
import {
  getDateFormat,
  getCurrentOrganizationId,
  getAccessToken,
  tableScrollWidth,
} from 'utils/utils';
import uuidv4 from 'uuid/v4';
import { HZERO_FILE } from 'utils/config';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusInput from '_cus_components/CusInput';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import CusUpload from '_cus_components/CusUpload';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import UploadList from '@/components/uploadList';

const gridSpan = getDFormGridSpan();

@Form.create({ fieldNameProp: null })

export default class DecisionInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stateAttachmentUUID: uuidv4()
    };
  }

  render() {
    const {
      dispatch,
      form = {},
      idpValueMap,
      todoFlag,
      headFromDataSource,
      decisionInfo,
    } = this.props;

    const { stateAttachmentUUID } = this.state;

    const { getFieldDecorator } = form;
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
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.juecejiyaotype`).d('决策类型')}
              >
                {getFieldDecorator('decisionType', {
                  initialValue: decisionInfo?.decisionType,
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={idpValueMap['BID.DECISION_TYPE']}
                    disabled={!(todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft')}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.decisionmeetingTime`).d('决策会议日期')}
              >
                {getFieldDecorator('decisionMeetingDate', {
                  initialValue: decisionInfo?.decisionMeetingDate && dayjs(decisionInfo?.decisionMeetingDate, getDateFormat()),
                })(
                  <CusDatePicker
                    format={getDateFormat()}
                    style={{ width: '100%' }}
                    disabled={!(todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft')}
                  />
                )}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.decisiondate`).d('会议名称')}
              >
                {getFieldDecorator('decisionDate', {
                  initialValue: decisionInfo?.decisionDate,
                })(
                  <CusInput
                    disabled={!(todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft')}
                  />
                )}
              </Form.Item>
            </Col> */}
            <Col span={24}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.juecejiyaoinfo`).d('决策纪要')}
              >
                {getFieldDecorator('decisionFileUrls', {
                  initialValue: decisionInfo?.decisionFileUrls,
                })(
                  <UploadList
                    viewOnly={!(todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft')}
                    multiple={true}
                    bucketName='bidding'
                    tenantId={getCurrentOrganizationId()}
                    showUploadList={{
                    removePopConfirmTitle: intl
                      .get('hzero.common.message.confirm.delete')
                      .d('是否删除此条记录？'),
                      showRemoveIcon: todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft',
                    }}
                    filePreview
                    onUploadSuccess={(file, fileList, attachmentUUID) => {
                      console.log('上传成功', attachmentUUID);
                      dispatch({
                        type: 'purchasePlan/updateState',
                        payload: {
                          decisionFileUrlsUpdateState: attachmentUUID
                        }
                      })
                    }}
                    attachmentUUID={decisionInfo?.decisionFileUrls || stateAttachmentUUID}
                    setLoading={(uploading = false) => {
                      this.setState({
                        uploading,
                      });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan} style={{display: 'none'}}>
              <Form.Item
                label='主键ID'
              >
                {getFieldDecorator('id', {
                  initialValue: decisionInfo?.id,
                })(
                  <CusInput disabled />
                )}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    )
  }
}