// import { Table} from 'antd';
import { Table } from 'choerodon-ui/pro';
import React from 'react';
import {FieldType} from "choerodon-ui/pro/lib/data-set/enum";

const TableForm = ({ dataSet }) => {
  const columns = [
    {
      name: 'decisionNo',
      lock: 'left',
      width: 150,
    },
    {
      name: 'wfApprovedDate',
      lock: 'left',
      width: 150,
    },
    {
      name: 'contractNo',
      lock: 'left',
      width: 150,
    },
    {
      name: 'contractName',
      lock: 'left',
      width: 150,
    },
    {
      name: 'contractorName',
      width: 150,
    },
    {
      name: 'currencyCode',
      width: 150,
    },
    {
      name: 'contractAmount',
      width: 150,
    },
    {
      name: 'contractHkAmount',
      width: 150,
    },
    {
      name: 'totalContractTax',
      width: 150,
    },
    {
      name: 'exchangeRate',
      width: 150,
      align: 'left',
      headerStyle: {
        textAlign: 'left',
      },
    },
    {
      name: 'deductFlag',
      width: 150,
    },
    {
      name: 'salesTaxVatIncludedFlag',
      width: 150,
    },
    {
      name: 'actualStartdate',
      width: 150,
    },
    {
      name: 'actualEnddate',
      width: 150,
    },
    {
      name: 'contractSignOrgName',
      width: 150,
    },
    {
      name: 'vendorNo',
      width: 150,
    },
    {
      name: 'vendorName',
      width: 150,
    },
  ];
  return (
    <>
      <Table dataSet={dataSet} columns={columns} selectionMode="none" pagination={false} />
    </>
  );
};

export default TableForm;
