import React, { useState } from 'react';
import { Table } from 'choerodon-ui/pro';
import Upload from '@/components/EncryptedUpload';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import request from 'utils/request';
import styles from './index.less';
import intl from 'utils/intl';
import { Button } from 'hzero-ui';
import { batchDownloadFile } from '@/common/utils';
import { notification } from 'choerodon-ui';

const setFileQuantity = (record, attachmentUUID) => {
  request(`/hfle/v1/${getCurrentOrganizationId()}/files/${attachmentUUID}/file`, {
    method: 'GET',
    query: {
      attachmentUUID,
      bucketName: 'private-bucket',
      tenantId: getCurrentOrganizationId(),
    },
  }).then((res) => {
    if (res) {
      record.set('fileQuantity', res.length || 0);
    }
  });
};

export default function ({
  dataSet,
  editable,
  isOperator,
  currentNodeName = '',
  viewOnly,
  isOther,
  hasSubmitButton = true,
}) {
  const uploadProps = {
    filePreview: true,
    bucketName: 'private-bucket',
    // btnText: '上传',
    bucketDirectory: 'spcm-paymentRequest',
    tenantId: getCurrentOrganizationId(),
    viewOnly: !((editable || currentNodeName.includes('起草人补充')) && isOperator) || viewOnly,
    onCloseUploadModal: () => {
      const record = dataSet.current;
      setFileQuantity(record, record.get('uuid'));
    },
  };

  const [downLoading, setDownLoading] = useState(false);

  const handleAttachmentChange = (record, attachmentUUID) => {
    record.set('uuid', attachmentUUID);
  };
  const columns = [
    {
      name: 'fileType',
      width: 150,
      editor:
        hasSubmitButton &&
        (editable || currentNodeName.includes('起草人补充')) &&
        isOperator &&
        !viewOnly,
      headerClassName: isOther ? undefined : styles['header-table-cell-required'],
    },
    {
      name: 'attachDescription',
      width: 150,
      editor:
        hasSubmitButton &&
        (editable || currentNodeName.includes('起草人补充')) &&
        isOperator &&
        !viewOnly,
    },
    {
      name: 'realName',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'remark',
      width: 150,
      editor:
        hasSubmitButton &&
        (editable || currentNodeName.includes('起草人补充')) &&
        isOperator &&
        !viewOnly,
    },
    {
      name: 'uuid',
      width: 150,
      renderer: ({ record }) => (
        <Upload
          {...uploadProps}
          onChange={(attachmentUUID) => {
            handleAttachmentChange(record, attachmentUUID);
          }}
          attachmentUUID={record.get('uuid')}
          // fileType={['RS_INVOICE'].includes(record.get('fileType')) ? 'application/pdf' : ''}
        />
      ),
    },
  ];

  const handleDown = async () => {
    if (dataSet.selected.length === 0){
      notification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
      return;
    }
    setDownLoading(true);
    await batchDownloadFile(
      dataSet.selected
        .filter((item) => item.data.uuid !== undefined)
        .map((item) => {
          return {
            attachmentUuid: item.data.uuid,
            fileDir: item.getField('fileType').getText(item.data.fileType),
          };
        }),
      isOther
        ? intl.get('spcm.costPayment.view.file.other').d('其他附件')
        : intl.get('spcm.costPayment.view.file.invoice').d('发票附件')
    );
    setDownLoading(false);
  };
  const batchDownload = (
    <div style={{ marginRight: '8px', display: 'inline', verticalAlign: 'bottom' }}>
      <Button loading={downLoading} onClick={handleDown}>
        {intl.get('spcm.costPayment.view.file.bathDown').d('批量下载')}
      </Button>
    </div>
  );
  const buttons =
    (editable || currentNodeName.includes('起草人补充')) && isOperator && !viewOnly
      ? [
          batchDownload,
          ['delete', { color: 'default', funcType: 'raised', icon: null }],
          ['add', { color: 'primary', funcType: 'raised', icon: null }],
        ]
      : [batchDownload];
  return (
    <div className={styles['attachment-table']}>
      <Table dataSet={dataSet} columns={columns} buttons={buttons} pagination={false} />
    </div>
  );
}
