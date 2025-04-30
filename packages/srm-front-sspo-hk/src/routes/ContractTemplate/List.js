/**
 * index.js - 协议模板管理列表渲染
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import warning from '@/assets/warning.svg';
import Upload from '../components/Upload';

const FormItem = Form.Item;
const TemplateRowKey = 'pcTemplateId';
const commonPrompt = 'spcm.contractTemplate.model';
const common = 'spcm.common.model';
export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      // getFieldValue: getFieldValue(),
    };
  }

  /**
   * editorPreview - 预览编辑render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  editorPreview(text, record) {
    const { redirectDetail = e => e } = this.props;
    const { _status } = record;
    return (
      _status === 'update' &&
      record.templateFileUrl &&
      record.templateFileUrl !== 'NULL_TEMPLATE' && (
        <a onClick={() => redirectDetail(record.pcTemplateId)}>
          {intl.get(`spcm.common.editorPreview`).d('模版明细')}
        </a>
      )
    );
  }

  /**
   * upTemplate - 上传文件render方法
   * @param {object} record - 行数据
   */
  @Bind()
  upTemplate(text, record) {
    const { onUpdateAttachment, onFetchList } = this.props;
    const { _status } = record;
    const attachmentProps = {
      width: 610,
      btnProps: {
        isBtn: false,
        btnText: intl.get(`${commonPrompt}.templateFileUrl`).d('模板文件'),
      },
      accept: '.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // fileType: '.docx',
      bucketName: 'private-bucket',
      contractTypeFlag: true,
      headerInfo: record,
      onUpdateHeader: onUpdateAttachment,
      onRefresh: onFetchList,
    };
    return _status === 'update' && <Upload {...attachmentProps} />;
  }

  /**
   * 级联事件--组织结构
   * @returns supplierId
   * @memberof record
   */
  @Bind()
  handleChangePrompt(record) {
    const {
      $form: { setFieldsValue },
    } = record;
    setFieldsValue({ pcTypeId: null });
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId } = this.state;
    const { onHandleRecord, handleCompany } = this.props;
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.templateCode`).d('协议模板编码'),
        width: 120,
        dataIndex: 'templateCode',
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`templateCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.templateCode`).d('协议模板编码'),
                    }),
                  },
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl
                      .get(`${commonPrompt}.TypeOnlyCapitalLettersOrNumbers`)
                      .d('协议类型编码只能由大写字母或数字组成'),
                  },
                  {
                    max: 12,
                    message: intl.get('hzero.common.validation.max', { max: 12 }),
                  },
                ],
                initialValue: record.templateCode,
              })(<Input typeCase="upper" />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.agreementTemplateName`).d('协议模板名称'),
        dataIndex: 'templateName',
        // width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`templateName`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${commonPrompt}.agreementTemplateName`).d('协议模板名称'),
                  }),
                },
                {
                  max: 120,
                  message: intl.get('hzero.common.validation.max', { max: 120 }),
                },
              ],
              initialValue: record.templateName,
            })(<Input onChange={() => onHandleRecord(record)} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`${common}.pcType`).d('协议类型'),
        dataIndex: 'pcTypeId',
        width: 160,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`pcTypeId`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${common}.pcType`).d('协议类型'),
                  }),
                },
              ],
              initialValue: val,
            })(
              <Lov
                code="SPCM.PC_TYPE"
                onChange={() => onHandleRecord(record)}
                textValue={record.pcTypeName}
                queryParams={{
                  enabledFlag: 1,
                  tenantId,
                  // companyId: record.$form.getFieldValue('companyId'),
                }}
                // disabled={record.$form.getFieldValue('companyId') == null}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spcm.contractTemplate.model.companyList`).d('分配适用公司'),
        dataIndex: 'companyId',
        width: 170,
        render: (_, record) =>
          ['update'].includes(record._status) ? (
            <div>
              <span>
                <a
                  onClick={() =>
                    handleCompany(
                      record.$form.getFieldValue('pcTypeId') || record.pcTypeId,
                      record.pcTemplateId
                    )
                  }
                >
                  {intl.get(`spcm.contractTemplate.view.title.companyList`).d('公司列表')}
                </a>
              </span>
              {record.dataFlag ? null : (
                <span style={{ marginLeft: 4 }}>
                  <Tooltip
                    title={intl
                      .get(`spcm.common.view.title.assignedCompany`)
                      .d('您尚未未分配任何公司')}
                  >
                    <img src={warning} alt="img" />
                  </Tooltip>
                </span>
              )}
            </div>
          ) : (
            <Tooltip
              title={intl.get(`spcm.common.view.title.assignedCompany`).d('您尚未未分配任何公司')}
            >
              <img src={warning} alt="img" />
            </Tooltip>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.templateFileUrl`).d('模板文件'),
        dataIndex: 'templateFileUrl',
        width: 110,
        render: this.upTemplate,
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(<Checkbox onChange={() => onHandleRecord(record)} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spcm.common.editorPreview`).d('模版明细'),
        dataIndex: 'editorPreview',
        width: 120,
        render: this.editorPreview,
      },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      onRowSelectChange = e => e,
    } = this.props;
    const columns = this.getColumns();
    const selectedRowKeys = selectedRows.map(item => item.pcTemplateId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record._status === 'update' && record[TemplateRowKey],
      }),
    };

    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'pcTemplateId',
      onChange: page => onSearch(page),
      pagination,
    };
    return (
      <React.Fragment>
        <EditTable {...tableProps} />
      </React.Fragment>
    );
  }
}
