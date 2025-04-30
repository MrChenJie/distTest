import { Table, Select } from 'choerodon-ui/pro';
import React, { useState } from 'react';
import Upload from '@/components/EncryptedUpload';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import request from 'hzero-front/lib/utils/request';
import styles from '../index.less';
import intl from 'utils/intl';
import { Button } from 'hzero-ui';
import { batchDownloadFile } from '@/common/utils';
import { notification } from 'choerodon-ui';

const AttachFiles = ({ dataSet, defaultFlag, fileFlag, isOther }) => {
  const [downLoading, setDownLoading] = useState(false);

  const getFileQuantity = (record, attachmentUUID) => {
    request(`/hfle/v1/${getCurrentOrganizationId()}/files/${attachmentUUID}/file`, {
      method: 'GET',
      query: {
        attachmentUUID,
        bucketName: 'cost-payment-files',
        tenantId: getCurrentOrganizationId(),
      },
    }).then((res) => {
      if (res) {
        record.set('fileQuantity', res.length || 0);
      }
    });
  };
  const uploadProps = {
    filePreview: true,
    fileSize: 50 * 1024 * 1024,
    bucketName: 'cost-payment-files',
    tenantId: getCurrentOrganizationId(),
    viewOnly: isOther ? !defaultFlag && !fileFlag : true,
    // viewOnly: true,
    onCloseUploadModal: () => {
      const record = dataSet.current;
      getFileQuantity(record, record.getField('uuid').getValue());
    },
  };
  const handleAttachmentChange = (record, attachmentUUID) => {
    record.set('uuid', attachmentUUID);
    record.set('creationDate', new Date());
    record.set('realName', getCurrentUser().realName);
    getFileQuantity(record, attachmentUUID);
  };

  const columns = [
    {
      name: 'fileType',
      width: 150,
      align: 'left',
      editor: () => {
        if (isOther) {
          return (
            (defaultFlag || fileFlag) && (
              <Select searchable dataSet={dataSet} name="fileType" dropdownMatchSelectWidth={false} />
            )
          );
        }
        return false;
      },
      headerClassName: isOther ? undefined : styles['header-table-cell-required'],
    },
    {
      name: 'attachDescription',
      width: 150,
      align: 'left',
      tooltip: 'overflow',
      editor: isOther ? (defaultFlag || fileFlag) : false,
    },
    {
      name: 'realName',
      width: 200,
      align: 'left',
    },
    {
      name: 'creationDate',
      width: 150,
      align: 'left',
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'remarks',
      width: 150,
      editor: isOther ? (defaultFlag || fileFlag) : false,
      align: 'left',
    },
    {
      name: 'uuid',
      width: 150,
      align: 'left',
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
  const buttons =
    (isOther
      ? (defaultFlag || fileFlag)
      : false)
        ? [
            batchDownload,
            ['delete', { color: 'default', funcType: 'raised', icon: null, disabled: false }],
            ['add', { color: 'primary', funcType: 'raised', icon: null }],
          ]
        : [batchDownload];
  // const buttons = [batchDownload];

  return (
    <>
      <div className={styles['attachment-table']}>
        <Table dataSet={dataSet} columns={columns} buttons={buttons} />
      </div>
    </>
  );
};

export default AttachFiles;
