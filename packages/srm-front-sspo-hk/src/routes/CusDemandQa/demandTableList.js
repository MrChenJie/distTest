/** -- 需求人答疑表
 * @date: 2022/05/29 11:50:55
 * @author: Cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  tableScrollWidth,
  getCurrentLanguage,
} from 'utils/utils';
import { dateRender } from 'utils/renderer';
import EditTable from '_cus_components/EditTable';
// import { queryMapIdpValue } from 'services/api';
import UploadFile from './UploadFile';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import { tooltipRender } from '_cus_utils/render';

const tenantId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
export default class demandTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // fastCodes: {},
      fileList: [],
    };
  }

  componentDidMount() {
    // this.fetchFastCode();
  }

  // fetchFastCode() {
  //   const codes = {
  //     'BID.CLASSIFICATION': 'BID.CLASSIFICATION',
  //   };
  //   queryMapIdpValue(codes).then((res) => {
  //     const response = getResponse(res);
  //     if (response) {
  //       this.setState({
  //         fastCodes: response,
  //       });
  //     }
  //   });
  // }

  /**
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof OrderGroup
   */
  @Bind
  handleDataChange() {
    const { unsaveFlag } = this.props;
    if (!unsaveFlag) {
      const { onEdit = (e) => e } = this.props;
      onEdit(true);
    }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   *
   * @param {object} page
   * @memberof OrderGroup
   */
  @Bind
  handlePageChange(page) {
    const { onPageChange = (e) => e, unsaveFlag } = this.props;
    if (unsaveFlag) {
      CusModal.confirm({
        content: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
        okType: 'normal',
        onOk: () => {
          onPageChange(page);
        },
      });
    } else {
      onPageChange(page);
    }
  }

  /**
   * 方法含义？
   * @param {*} file - <>
   */
  @Bind()
  uploadData(file) {
    return {
      tenantId: tenantId,
      bucketName: 'bidding',
      fileName: file.name,
    };
  }

  @Bind
  onUploadSuccess(fileList, res) {
    const { dataSource } = this.props;
    let newFileUrl = '';
    fileList.map((item, index) => {
      if(index == 0) {
        newFileUrl = item.fileUrl
      } else {
        newFileUrl =newFileUrl +','+item.fileUrl
      }
    })
    dataSource.map(item => {
      if(item._status != 'create') {
        if (item.qaId == res.qaId) {
          item.answerFileUrl = newFileUrl
        }
      } else {
        if (item.poOrderId == res.poOrderId) {
          item.answerFileUrl = newFileUrl
        }
      }
    })
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      isEdit,
    } = this.props;

    // const { fastCodes = {} } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
        dataIndex: 'qaType',
        width: 120,
        render: (_, record) => {
          return (
            tooltipRender(record.qaTypeNew ? record.qaTypeNewMeaning : record.qaTypeMeaning)
          )
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'), 
        dataIndex: 'caseDetail',
        width: 250,
        render: (_, record) => {
          return (
            tooltipRender(record.caseDetailNew ? record.caseDetailNew : record.caseDetail)
          )
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
        dataIndex: 'qaContent',
        width: 300,
        render: (_, record) => {
          return (
            tooltipRender(record.qaContentNew ? record.qaContentNew : record.qaContent)
          )
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
        dataIndex: 'fileUrl',
        width: getCurrentLanguage() === 'zh_CN' ? 85 : 120,
        render: (value, record) => (
          <UploadFile
            onUploadSuccess={(item) => this.onUploadSuccess(item, record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.qaId}
            value={value}
            disabled
          />
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.attchamentuploadbydemander`).d('CMI补充的其他附件'),
        dataIndex: 'answerFileUrl',
        width: getCurrentLanguage() === 'zh_CN' ? 160 : 315,
        render: (value, record) => (
          <UploadFile
            onUploadSuccess={(item) => this.onUploadSuccess(item, record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={value}
            value={value}
            disabled={record.publishedToJudge === 'y' || !isEdit}
          />
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.requestersreply`).d('需求人提交的内容'),
        dataIndex: 'answerContent',
        width: 700,
        required: true,
        className: 'answerContent',
        render: (val, record) => (
          <Form.Item>
              {record.$form.getFieldDecorator('answerContent', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.requestersreply`).d('需求人提交的内容'),
                    }),
                  },
                ],
              })(
                (record.publishedToJudge === 'y' || !isEdit) ?
                tooltipRender(val)
                :
                <CusInput.TextArea autoChangeSize={true} />
              )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.replyDate`).d('答复日期'),
        dataIndex: 'answerTime',
        width: getCurrentLanguage() === 'zh_CN' ? 105 : 110,
        render: (val) => dateRender(val),
      },
    ];

    return (
      <EditTable
        rowKey="rowKey"
        dataSource={dataSource}
        pagination={pagination}
        onChange={this.handlePageChange}
        columns={columns}
        onDataChange={this.handleDataChange}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
