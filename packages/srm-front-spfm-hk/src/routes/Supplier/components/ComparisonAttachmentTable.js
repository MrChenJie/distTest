import React from 'react';
import { Link } from 'react-router-dom';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import { tooltipRender, labelTip } from '_cus_utils/render';
import { createPagination } from 'utils/utils';
import CusTable from '_cus_components/CusTable';

const prompt = 'spfmhk.supplier';

export default class ComparisonAttachmentTable extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    const { rowSelection, dataSource = [], rowKey, readOnly = false, otherDataSource = [] } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.attachment.type`).d('附件类型'),
        dataIndex: 'type',
        width: 350,
        render: (value, record, index) => {
          const isDifferentType = dataSource[index]?.type !== otherDataSource[index]?.type;
          const isDifferentSubType = dataSource[index]?.subType !== otherDataSource[index]?.subType;
          return <>
          <span style={{color: isDifferentType ? 'red' : '#1f2329'}}>{record.typeMeaning}</span>
          /
          <span style={{color: isDifferentSubType ? 'red' : '#1f2329'}}>{record.subTypeMeaning}</span>
          </>
        }
      },
      {
        title: intl.get(`${prompt}.field.attachment.info.description`).d('附件描述'),
        dataIndex: 'description',
        render: (value, record, index) => {
          const isDifferent = dataSource[index]?.description !== otherDataSource[index]?.description;
          return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{value}</span>
        }
      },
      // {
      //   title: intl.get(`${prompt}.attachment.info.file.expiration.date`).d('文件到期日'),
      //   dataIndex: 'expirationDate'
      // },
    ];
    return (
      <>
        <CusTable
          rowKey="id"
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
