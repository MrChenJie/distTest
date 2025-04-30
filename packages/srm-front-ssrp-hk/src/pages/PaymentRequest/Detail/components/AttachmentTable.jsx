import React, { useState } from 'react';
import { Table } from 'choerodon-ui/pro';
import Upload from '@/components/EncryptedUpload';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import request from 'utils/request';
import intl from 'utils/intl';
import { Button } from 'hzero-ui';
import { batchDownloadFile } from '@/common/utils';
import { notification } from 'choerodon-ui';
import styles from './index.less';

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
    viewOnly: isOther
      ? !((editable || currentNodeName.includes('起草人补充')) && isOperator) || viewOnly
      : true,
    // viewOnly: true,
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
      editor: isOther
        ? hasSubmitButton &&
          (editable || currentNodeName.includes('起草人补充')) &&
          isOperator &&
          !viewOnly
        : false,
      headerClassName: isOther ? undefined : styles['header-table-cell-required'],
    },
    {
      name: 'attachDescription',
      width: 150,
      editor: isOther
        ? hasSubmitButton &&
          (editable || currentNodeName.includes('起草人补充')) &&
          isOperator &&
          !viewOnly
        : false,
    },
    {
      name: 'realName',
      width: 150,
      // editor: true,
    },
    {
      name: 'creationDate',
      width: 150,
      // editor: true,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'remarks',
      width: 150,
      editor: isOther
        ? hasSubmitButton &&
          (editable || currentNodeName.includes('起草人补充')) &&
          isOperator &&
          !viewOnly
        : false,
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
        />
      ),
    },
  ];

  const handleDown = async () => {
    if (dataSet.selected.length === 0) {
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
        : intl.get('spcm.costPayment.view.file.require').d('必要附件')
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
  const buttons = (
    isOther
      ? (editable || currentNodeName.includes('起草人补充')) && isOperator && !viewOnly
      : false
  )
    ? [
        batchDownload,
        ['delete', { color: 'default', funcType: 'raised', icon: null }],
        ['add', { color: 'primary', funcType: 'raised', icon: null }],
      ]
    : [batchDownload];
  // const buttons = [batchDownload];
  return (
    <div className={styles['attachment-table']}>
      {isOther && (editable || currentNodeName.includes('起草人补充')) && isOperator && !viewOnly && (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: -26, color: '#D50000' }}>
            {intl
              .get('spcm.costPayment.view.upload.file.tip')
              .d(
                '若Circuit ID已在IBOSS上传过销售合同附件，无需在此处上传Sales Contract类型附件，否则，请在此处进行补充上传【Sales Contract】类型附件'
              )}
          </div>
        </div>
      )}
      <Table dataSet={dataSet} columns={columns} buttons={buttons} pagination={false} />
    </div>
  );
}
