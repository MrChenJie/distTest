import { Table, LocaleProvider } from 'hzero-ui';
import React from 'react';
import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';
import { dateRender, numberRender } from 'utils/renderer';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

const InvoiceSplit = ({ prompt, res }) => {
  const getValueDecimal = (value) => {
    if (value) {
      try {
        let pre = 0;
        const arr = value.split('.');
        if (arr.length > 1) {
          pre = arr[1].length;
        }
        return numberRender(value, pre);
      } catch (e) {
        return numberRender(value, 2);
      }
    } else {
      return numberRender(value);
    }
  };
  const columns = [
    {
      title: intl.get(`${prompt}.view.detail.line.serviceStartDate`).d('服务开始日期'),
      dataIndex: 'serviceStartDate',
      width: 150,
      align: 'left',
      render: dateRender,
    },
    {
      title: intl.get(`${prompt}.view.detail.line.serviceEndDate`).d('服务结束日期'),
      dataIndex: 'serviceEndDate',
      width: 150,
      align: 'left',
      render: dateRender,
    },
    {
      title: intl.get(`${prompt}.view.detail.line.apportionStartDate`).d('待摊开始时间'),
      dataIndex: 'deferredStartDate',
      width: 150,
      align: 'left',
      render: dateRender,
    },
    {
      title: intl.get(`${prompt}.view.detail.line.apportionEndDate`).d('待摊结束时间'),
      dataIndex: 'deferredEndDate',
      width: 150,
      align: 'left',
      render: dateRender,
    },
    {
      title: intl.get(`${prompt}.view.detail.line.split`).d('行金额'),
      dataIndex: 'amount',
      width: 150,
      align: 'left',
      render: (text) => {
        return <div style={{ textAlign: 'right' }}>{getValueDecimal(text)}</div>;
      },
    },
  ];

  return (
    <div>
      <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
        <Table bordered dataSource={res} columns={columns} />
      </LocaleProvider>
    </div>
  );
};

export default InvoiceSplit;
