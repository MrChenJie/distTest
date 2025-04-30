import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import Upload from '@/components/EncryptedUpload';
import styles from './index.less';

const bucketName = 'private-bucket';

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

export default function RequireAttachment({ dataSet, editable, isOperator, viewOnly }) {
  const uploadProps = {
    filePreview: true,
    bucketName,
    // btnText: '上传',
    bucketDirectory: 'spcm-paymentRequest',
    tenantId: getCurrentOrganizationId(),
    viewOnly: !editable || !isOperator || viewOnly,
    onCloseUploadModal: () => {
      const record = dataSet.current;
      setFileQuantity(record, record.get('uuid'));
    },
  };
  const columns = [
    {
      name: 'fileType',
      width: 150,
      editor: editable && isOperator && !viewOnly,
    },
    {
      name: 'fileName',
      width: 150,
      editor: editable && isOperator && !viewOnly,
    },
    {
      name: 'necessaryFlag',
      width: 150,
      editor: editable && isOperator && !viewOnly,
    },
    {
      name: 'remark',
      width: 150,
      editor: editable && isOperator && !viewOnly,
    },
    {
      name: 'uuid',
      width: 150,
      renderer: ({ record }) => (
        <Upload
          {...uploadProps}
          onChange={(attachmentUUID) => {
            record.set('uuid', attachmentUUID);
          }}
          /* beforeUpload={(file) => {
            const { name } = file;
            record.set('fileName', name);
            return true;
          }} */
          attachmentUUID={record.get('uuid')}
          // fileType={['RS_INVOICE'].includes(record.get('fileType')) ? 'application/pdf' : ''}
        />
      ),
    },
  ];
  const buttons =
    editable && isOperator && !viewOnly
      ? [
          ['delete', { color: 'default', funcType: 'raised', icon: null }],
          ['add', { color: 'primary', funcType: 'raised', icon: null }],
        ]
      : [];
  return (
    <div className={styles['require-attachment']}>
      <Table dataSet={dataSet} columns={columns} buttons={buttons} />
    </div>
  );
}
