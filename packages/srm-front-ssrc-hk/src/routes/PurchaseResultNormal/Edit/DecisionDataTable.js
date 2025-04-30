import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { HZERO_FILE } from 'utils/config';
import { tableScrollWidth, getCurrentOrganizationId, getAccessToken, getDateFormat } from 'utils/utils';
import querystring from 'querystring';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import { Form } from 'hzero-ui';
import { Col, Input } from 'antd';
import CusInput from '_cus_components/CusInput';
import styles from '@/routes/PurchaseApplication/Edit/index.less';
import dayjs from 'dayjs';
import CusButton from '_cus_components/CusButton';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceId';
const gridSpan = getDFormGridSpan();
export default class DecisionDataTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }
  @Bind()
  handleDowload() {
    const { dispatch, purchaseResultModel } = this.props;
    const { fourthFileList } = purchaseResultModel
    console.log(fourthFileList,'fourthFileList')
    dispatch({
      type: 'purchaseResultModel/normalDowloadFile',
      payload: {
        fileDTOList: fourthFileList
      }
    }).then(res => {
      console.log(res, '决策附件下载')
      if(res){
        const url = window.URL.createObjectURL(
          new Blob(
            [res],
            {type : 'application/zip;charset=utf-8'}
          )
        )
        const location = document.createElement('a');
        location.style.display = 'none';
        const fileName = '决策附件.zip';
        location.download = fileName;
        location.href = url;
        document.body.appendChild(location);
        location.click();
        // 释放的 URL 对象以及移除 a 标签
        URL.revokeObjectURL(location.href);
        document.body.removeChild(location);
      }
    })
  }


  render() {
    const { purchaseResultModel, form, idpValueMap } = this.props;
    const { getFieldDecorator } = form;
    const { decisionsList = [], fourthHead } = purchaseResultModel;
    const { activityCode, state } = querystring.parse(location?.search.substring(1));
    // 采购经理才能编辑
    const isDecisionType = (!['CGJL01'].includes(activityCode)) || ['DONE', 'SENT'].includes(state);
    const columns = [
      {
        title: intl.get(`hzero.common.table.column.fileName`).d('附件名'),
        dataIndex: 'fileName',
        width: 160,
      },
      {
        title: intl.get(`hzero.common.uploadFile.view.uploadTimeNew`).d('上传时间'),
        dataIndex: 'creationDate',
        width: 180,
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
            <Col span={12}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.DecisionHierarchy`).d('决策类型')}
              >
                {getFieldDecorator('decisionType', {
                  initialValue: fourthHead?.decisionType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.DecisionHierarchy`).d('决策类型'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={idpValueMap['BID.DECISION_TYPE']}
                    disabled={isDecisionType}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.MeetingDate`).d('会议日期')}
              >
                {getFieldDecorator('decisionMeetingDate', {
                  initialValue: fourthHead?.decisionMeetingDate && dayjs(fourthHead?.decisionMeetingDate),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.MeetingDate`).d('会议日期'),
                      }),
                    },
                  ],
                })(
                  <CusDatePicker
                    format={getDateFormat()}
                    style={{ width: '100%' }}
                    disabled={isDecisionType}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}
              >
                <CusTable
                  dataSource={decisionsList}
                  columns={columns}
                  scroll={{ x: tableScrollWidth(columns) }}
                  pagination={false}
                />
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
        {/* <div style={{marginTop: '16px'}}>
          <CusTable
            dataSource={decisionsList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={false}
          />
        </div> */}
      </>
    );
  }
}
