/**
 * @Description: 
 * @date 2020-11-24
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { useState } from 'react';
import { Form, Row, Col, Input, Button, Select, DatePicker, Modal, Upload, Icon } from 'hzero-ui';
import { isString } from 'lodash';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getDateTimeFormat,
} from 'utils/utils';
import intl from 'utils/intl';
import { API_HOST } from 'utils/config';
import { HZERO_FILE } from '@/common/config';

import styles from './index.less';
import moment from 'moment';
import UploadFile from './UploadFile';
const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const { Dragger } = Upload;
const tenantId = getCurrentOrganizationId();


function headerDataBiddingRound(props) {
  const [flag, setflag] = useState(false);
  const uploadData = (file) => {
    return {
      tenantId: tenantId,
      bucketName: 'bidding',
      // storageCode: 'BID.FILEUPLOAD',
      fileName: file.name,
    };
  }
  const openModal = () => {
    setflag(true);
  };
  const closeModal = () => {
    setflag(false);
  };
  const upFileUrl =(e)=>{
    console.log('e',e)
    let newFileUrls = ''
    e.map((item,index)=>{
      if(index==0){
        newFileUrls = item.fileUrl
      }else{
        newFileUrls = item.fileUrl +','+newFileUrls
      }
    })
    poHeaderInfo.decisionFileUrls = newFileUrls
    props.onSave(poHeaderInfo)
  }
  const {
    form: { getFieldDecorator },
    poHeaderInfo,
    detailEnumMap: { newType },
    milState,
  } = props;

  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }

  const draggerUploadProps = {
    name: 'file',
    multiple: true,
    // accept: 'image/*',
    data: uploadData,
    headers,
    action: `${API_HOST}${HZERO_FILE}/v1/${tenantId}/files/multipart`,
    beforeUpload: (file) => {
      const fileSize = 2 * 1024 * 1024 * 1024;
      if (file.size > fileSize) {
        file.status = 'error'; // eslint-disable-line
        const res = {
          message: intl
            .get(`hzero.common.upload.error.size`, {
              fileSize: fileSize / (1024 * 1024 * 1024),
            })
            .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024 * 1024)} GB`),
        };
        file.response = res; // eslint-disable-line
        return false;
      }
      return true;
    },
    onChange: (info) => {
      const { status, response } = info.file;
      if (status === 'done') {
        if (isString(response)) {
          notification.success();
          poHeaderInfo.decisionFileUrls = poHeaderInfo.decisionFileUrls + ',' + info.file.response
          props.onSave(poHeaderInfo)
        } else {
          notification.error();
        }
      } else if (status === 'error') {
        notification.error(response);
      }
    },
    // onRemove: this.onDraggerUploadRemove,
  };
  return (
    <div className={styles['spo-basic-style']}>
      {/* <Button onClick={openModal} disabled={milState && milState === 'published'}>
        {intl.get('bid.bidcommon.view.button.upload').d('上传纪要')}
      </Button> */}
      <Form>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              {...formlayout}
              label={intl.get(`bid.bidcommon.view.title.juecejiyaotype`).d('决策类型')}
            >
              {getFieldDecorator('decisionType', {
                initialValue: poHeaderInfo.decisionType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.juecejiyaotype`).d('决策类型'),
                    }),
                  },
                ],
              })(<Select allowClear style={{ minWidth: 150 }}
                disabled={(milState && milState === 'published') || poHeaderInfo.decisionInfoState === 'y'}
              >
                {newType && newType.map((n) => (
                  <Select.Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Select.Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formlayout}
              label={intl.get(`bid.bidcommon.view.title.decisionmeetingdate`).d('决策会议日期')}
            >
              {getFieldDecorator('decisionMeetingDate', {
                initialValue: poHeaderInfo.decisionMeetingDate && moment(poHeaderInfo.decisionMeetingDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('bid.bidcommon.view.title.decisionmeetingdate').d('决策会议日期'),
                    }),
                  },
                ],
              })(<DatePicker
                disabled={(milState && milState === 'published') || poHeaderInfo.decisionInfoState === 'y'}
                style={{ width: '100%' }}
                placeholder=""
                format={getDateTimeFormat()}
                showTime
              // disabledDate={currentDate =>
              //   titleList.milestoneEndTime && moment(titleList.milestoneEndTime).isAfter(currentDate, 'day')
              // }
              />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formlayout}
              label={intl.get(`bid.bidcommon.view.title.decisiondate`).d('决策会议')}
            >
              {getFieldDecorator('decisionDate', {
                initialValue: poHeaderInfo.decisionDate,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('bid.bidcommon.view.title.decisiondate').d('决策会议'),
                    }),
                  },
                ],
              })(<Input disabled={(milState && milState === 'published') || poHeaderInfo.decisionInfoState === 'y'} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              {...formlayout}
              label={intl.get(`bid.bidcommon.view.title.juecejiyaoinfo`).d('决策纪要')}
            >
              {getFieldDecorator('decisionFileUrls', {
                initialValue: poHeaderInfo.decisionFileUrls,
              })(<UploadFile
                tableName="SPUC_PO_CON_ATTACH"
                uploadFile={(e)=>upFileUrl(e)}
                parentId={poHeaderInfo.decisionFileUrls}
                val={poHeaderInfo.decisionFileUrls}
                type={poHeaderInfo.decisionInfoState === 'y'}
                state={milState}
              />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
      <Modal
        title={intl.get(`hzero.common.upload.text`).d('上传附件')}
        visible={flag}
        cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
        okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
        onOk={closeModal}
        onCancel={closeModal}
        destroyOnClose
        width={520}
      >
        <Dragger {...draggerUploadProps}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">
            {intl
              .get(`bid.bidcommon.view.message.uploadtext`)
              .d('单击或拖动附件(2GB以下)到此区域进行上传')}
          </p>
          <p className="ant-upload-hint">
            {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
          </p>
        </Dragger>
      </Modal>
    </div>
  );
}

export default React.memo(headerDataBiddingRound);
