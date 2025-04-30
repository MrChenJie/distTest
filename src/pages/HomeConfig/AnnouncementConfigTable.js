import React, { useState } from 'react';
import uuidv4 from 'uuid/v4';
import { debounce } from 'lodash';
import { Button, Form, InputNumber } from 'hzero-ui';

import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';

const ROW_KEY = 'configId';

export default ({
                  dataSource = [{}],
                  onAdd = (e) => e,
                  onDelete = (e) => e,
                  onSave = (e) => e,
                }) => {
  const [editRowKey, setEditRowKey] = useState(null);

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
      configCategory: 'announcement',
      _status: 'create',
    };
    setEditRowKey(rowKey);
    onAdd(newData);
  }

  function getStatus(record) {
    return record[ROW_KEY] === editRowKey && ['update', 'create'].includes(record._status);
  }

  const columns = [
    {
      title: intl.get('ptal.homeConfig.model.announcement.configTitle').d('标题'),
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
                    name: intl.get('ptal.homeConfig.model.announcement.configTitle').d('标题'),
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl.get('ptal.homeConfig.model.announcement.configTitle').d('标题')}
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
      title: intl.get('ptal.homeConfig.model.announcement.configContent').d('内容'),
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
                    name: intl.get('ptal.homeConfig.model.announcement.configContent').d('内容'),
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl.get('ptal.homeConfig.model.announcement.configContent').d('内容')}
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
      title: intl.get('ptal.homeConfig.model.announcement.sequenceNumber').d('序号'),
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
                    name: intl.get('ptal.homeConfig.model.announcement.sequenceNumber').d('序号'),
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
    </>
  );
};
