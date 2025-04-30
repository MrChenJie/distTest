import React, { useState } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Button } from 'hzero-ui';
import Upload from '@/components/EncryptedUpload';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import request from 'utils/request';
import styles from './index.less';

const bucketName = 'payment-advice';

const setFileQuantity = (record, attachmentUUID) => {
  request(`/hfle/v1/${getCurrentOrganizationId()}/files/${attachmentUUID}/file`, {
    method: 'GET',
    query: {
      attachmentUUID,
      bucketName,
      tenantId: getCurrentOrganizationId(),
    },
  }).then((res) => {
    if (res) {
      record.set('fileQuantity', res.length || 0);
    }
  });
};

export default function SupplyAttachment({ dataSet, viewButtonFlag, isCreate = false }) {
  const uploadProps = {
    filePreview: true,
    bucketName,
    // btnText: '上传',
    bucketDirectory: 'spcm-paymentRequest',
    tenantId: getCurrentOrganizationId(),
    viewOnly: !viewButtonFlag,
    onCloseUploadModal: () => {
      const record = dataSet.current;
      setFileQuantity(record, record.get('uuid'));
    },
  };

  const handleAttachmentChange = (record, attachmentUUID) => {
    record.set('uuid', attachmentUUID);
  };

  const [saveLoading, setSaveLoading] = useState(false);

  const columns = [
    {
      name: 'fileType',
      width: 150,
      editor: viewButtonFlag,
    },
    {
      name: 'customerRef',
      width: 150,
    },
    {
      name: 'attachDescription',
      width: 150,
      editor: viewButtonFlag,
    },
    {
      name: 'creator',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'remarks',
      width: 150,
      editor: viewButtonFlag,
    },
    {
      name: 'uuid',
      width: 230,
      renderer: ({ record }) => (
        <Upload
          {...uploadProps}
          onChange={(attachmentUUID) => {
            handleAttachmentChange(record, attachmentUUID);
          }}
          attachmentUUID={record.get('uuid')}
        />
      ),
    },
  ];

  const handleSave = () => {
    setSaveLoading(true);
    dataSet.submit();
    setSaveLoading(false);
  }

  const Save = (
    <div style={{ marginRight: '8px', display: 'inline', verticalAlign: 'bottom' }}>
      <Button disabled={isCreate} loading={saveLoading} onClick={handleSave}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>
    </div>
  );

  const buttons =
    viewButtonFlag ?
      [
        Save,
        ['delete', { color: 'default', funcType: 'raised', icon: null }],
        ['add', { color: 'primary', funcType: 'raised', icon: null }],
      ] :
      [];
  return (
    <div className={styles['require-attachment']}>
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={buttons}
        selectionMode={viewButtonFlag ? 'rowbox' : 'none'}
      />
    </div>
  );
}
