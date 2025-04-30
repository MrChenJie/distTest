import React, { useState } from 'react';
import uuidv4 from 'uuid/v4';
import { debounce } from 'lodash';
import { Button, Form, InputNumber } from 'hzero-ui';

import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import { BKT_PUBLIC } from 'utils/config';
import { tableScrollWidth } from 'utils/utils';
import { getAttachmentUrl } from './EncryptedUpload/utils';
import Upload from './EncryptedUpload/UploadButton';

import PreviewModal from './PreviewModal';

const ROW_KEY = 'configId';

export default ({
                  dataSource = [{}],
                  onAdd = (e) => e,
                  onDelete = (e) => e,
                  onSave = (e) => e,
                }) => {
  const [editRowKey, setEditRowKey] = useState(null);
  const [previewParams, setPreviewParams] = useState({});

  function handleUploadSuccess(file, record) {
    if (record.$form) {
      record.$form.setFieldsValue({
        configBackground: file.response,
      });
    }
  }

  function handleRemoveSuccess(record) {
    if (record.$form) {
      record.$form.setFieldsValue({
        configBackground: undefined,
      });
    }
  }

  const handleDelete = debounce(
    (record) => {
      onDelete([record[ROW_KEY]], ROW_KEY, () => {
        setEditRowKey(null);
      });
    },
    500,
    { leading: true },
  );

  const handleSave = debounce(
    (record) => {
      onSave(record, ROW_KEY, () => {
        setEditRowKey(null);
      });
    },
    500,
    { leading: true },
  );

  function handleEdit(record) {
    setEditRowKey(record[ROW_KEY]);
  }

  function handleCancel(record) {
    if (record._status === 'create') {
      handleDelete(record);
    } else {
      setEditRowKey(null);
    }
  }

  function handleAdd() {
    const rowKey = uuidv4();
    const newData = {
      [ROW_KEY]: rowKey,
      configCategory: 'message',
      _status: 'create',
    };
    setEditRowKey(rowKey);
    onAdd(newData);
  }

  function handlePreview(record) {
    setPreviewParams({
      url:
        editRowKey === record[ROW_KEY]
          ? getAttachmentUrl(
            record.$form.getFieldValue('configBackground'),
            BKT_PUBLIC,
            0,
            'home_config',
            'SCM-PORTAL',
          )
          : getAttachmentUrl(record.configBackground, BKT_PUBLIC, 0, 'home_config', 'SCM-PORTAL'),
      visible: true,
    });
  }

  function handlePreviewCancel() {
    setPreviewParams({
      visible: false,
    });
  }

  function getStatus(record) {
    return record[ROW_KEY] === editRowKey && ['update', 'create'].includes(record._status);
  }

  function handleRemove(record, file) {
    const { removeFileList = [] } = record;
    Object.assign(record, { removeFileList: [...removeFileList, file.url] });
  }

  const columns = [
    {
      title: intl.get('ptal.homeConfig.model.message.configTitle').d('标题'),
      dataIndex: 'configTitle',
      width: 200,
      render: (val, record) =>
        getStatus(record) ? (
          <Form.Item>
            {record.$form.getFieldDecorator('configTitle', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('ptal.homeConfig.model.message.configTitle').d('标题'),
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl.get('ptal.homeConfig.model.message.configTitle').d('标题')}
                field='configTitle'
                token={record._token}
                inputSize={{ zh: 200, en: 200 }}
                maxLength={200}
              />,
            )}
          </Form.Item>
        ) : (
          val
        ),
    },
    {
      title: intl.get('ptal.homeConfig.model.message.configContent').d('内容'),
      dataIndex: 'configContent',
      width: 200,
      render: (val, record) =>
        getStatus(record) ? (
          <Form.Item>
            {record.$form.getFieldDecorator('configContent', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('ptal.homeConfig.model.message.configContent').d('内容'),
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl.get('ptal.homeConfig.model.message.configContent').d('内容')}
                field='configContent'
                token={record._token}
                inputSize={{ zh: 400, en: 400 }}
                maxLength={400}
              />,
            )}
          </Form.Item>
        ) : (
          val
        ),
    },
    {
      title: intl.get('ptal.homeConfig.model.message.configBackground').d('背景'),
      dataIndex: 'configBackground',
      width: 200,
      render: (val, record) => {
        const fileList = record.configBackground
          ? [
            {
              uid: '-1',
              name: record.configBackground.split('@').reverse()[0],
              status: 'done',
              url: record.configBackground,
            },
          ]
          : [];
        return getStatus(record) ? (
          <>
            <Form.Item style={{ display: 'none' }}>
              {record.$form.getFieldDecorator('configBackground', {
                initialValue: val,
              })(<div />)}
            </Form.Item>
            <Upload
              accept='.jpeg,.png,.jpg'
              fileType='image/jpeg,image/png'
              listType='picture-card'
              single
              bucketName={BKT_PUBLIC}
              bucketDirectory='home_config'
              fileList={fileList}
              viewOnly={record.$form.getFieldValue('configBackground')}
              onUploadSuccess={(file) => handleUploadSuccess(file, record)}
              onRemoveSuccess={() => handleRemoveSuccess(record)}
              onPreview={() => handlePreview(record)}
              onRemove={(file) => handleRemove(record, file)}
              storageCode='SCM-PORTAL'
            />
          </>
        ) : (
          <Upload
            accept='.jepg,.png,.jpg'
            fileType='image/jepg,image/png'
            listType='text'
            single
            bucketName={BKT_PUBLIC}
            bucketDirectory='home_config'
            fileList={fileList}
            viewOnly
            disabled
            onPreview={() => handlePreview(record)}
            storageCode='SCM-PORTAL'
          />
        );
      },
    },
    {
      title: intl.get('ptal.homeConfig.model.message.sequenceNumber').d('序号'),
      dataIndex: 'configSequence',
      width: 80,
      render: (val, record) =>
        getStatus(record) ? (
          <Form.Item>
            {record.$form.getFieldDecorator('configSequence', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('ptal.homeConfig.model.message.sequenceNumber').d('序号'),
                  }),
                },
                {
                  validator: (rule, value, callback) => {
                    if (
                      dataSource.some((item) => {
                        return item[ROW_KEY] !== record[ROW_KEY] && value === item.configSequence;
                      })
                    ) {
                      callback(
                        intl
                          .get('ptal.homeConfig.validate.message.reapeat.sequenceNumber')
                          .d('序号重复'),
                      );
                    } else {
                      callback();
                    }
                  },
                },
              ],
            })(<InputNumber precision={0} step={1} min={0} />)}
          </Form.Item>
        ) : (
          val
        ),
    },
    {
      title: intl.get('hzero.common.table.column.option').d('操作'),
      dataIndex: 'operation',
      width: 100,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {editRowKey !== record[ROW_KEY] ? (
            <a disabled={editRowKey !== null} onClick={() => handleEdit(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          ) : (
            <a onClick={() => handleCancel(record)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          )}
          &nbsp;&nbsp;
          <a disabled={editRowKey !== record[ROW_KEY]} onClick={() => handleSave(record)}>
            {intl.get('hzero.common.button.save').d('保存')}
          </a>
          &nbsp;&nbsp;
          <a onClick={() => handleDelete(record)} style={{ color: '#e40077' }}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </div>
      ),
    },
  ];
  return (
    <>
      <div style={{ marginBottom: '8px', textAlign: 'right' }}>
        <Button type='primary' onClick={handleAdd} disabled={dataSource.length >= 3}>
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      </div>
      <EditTable
        bordered
        rowKey={ROW_KEY}
        columns={columns}
        dataSource={dataSource}
        scorll={{ x: tableScrollWidth(columns) }}
      />
      <PreviewModal {...previewParams} onCancel={handlePreviewCancel} />
    </>
  );
};
